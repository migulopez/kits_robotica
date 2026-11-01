/* ============================================================
   Laboratorio virtual — motor de simulación eléctrica
   ------------------------------------------------------------
   Motor simplificado basado en MNA (Modified Nodal Analysis):
   - Los cables unen pines en nodos eléctricos (union-find).
   - Cada tick se resuelve el sistema nodal (eliminación gaussiana)
     con resistencias, fuentes de voltaje (pila/fuente/adaptador,
     pines de salida del MCU) y modelos de diodo (LED), relé,
     drivers L298N/L293D, salidas digitales de sensores y el
     multímetro (voltímetro/amperímetro/ohmímetro).
   - Los estados de interruptores (LED, relé) usan el voltaje del
     tick anterior con histéresis, como en simuladores reales.
   - validate() genera mensajes educativos sobre errores.
   ============================================================ */
(function (global) {
  "use strict";

  const CAT = () => global.LAB_CATALOG;

  const fmt = (v, digits) => {
    const a = Math.abs(v);
    if (a >= 1000) return v.toFixed(0);
    if (a >= 10) return v.toFixed(digits == null ? 2 : digits);
    if (a >= 0.01) return v.toFixed(3);
    return v.toExponential(2);
  };

  class Circuit {
    constructor() {
      this.comps = [];
      this.wires = [];
      this.seq = 1;
      this.wtime = 0;          // tiempo virtual (ms)
      this.masterPower = false;
      this.messages = [];
      this._V = null;          // voltajes de nodo del último solve
      this._nodeOf = null;
      this.anySupply = false;
      this.poweredFlag = false;
    }

    key(cp) { return cp.comp + ":" + cp.pin; }
    compById(id) { return this.comps.find((c) => c.id === id); }
    defOf(c) { return CAT()[c.type]; }

    addComp(type, x, y, props) {
      const def = CAT()[type];
      if (!def) return null;
      const c = { id: this.seq++, type, x, y, rot: 0, props: Object.assign({}, def.props, props || {}), state: {} };
      this.comps.push(c);
      return c;
    }
    addWire(a, b, color) {
      if (!a || !b || this.key(a) === this.key(b)) return null;
      if (this.wires.some((w) => this.key(w.a) === this.key(a) && this.key(w.b) === this.key(b))) return null;
      const w = { id: this.seq++, a, b, color: color || "amarillo" };
      this.wires.push(w);
      return w;
    }
    removeComp(id) {
      this.comps = this.comps.filter((c) => c.id !== id);
      this.wires = this.wires.filter((w) => w.a.comp !== id && w.b.comp !== id);
    }
    removeWire(id) { this.wires = this.wires.filter((w) => w.id !== id); }
    clear() { this.comps = []; this.wires = []; this.messages = []; }
    resetStates() {
      this.wtime = 0;
      for (const c of this.comps) c.state = {};
      this.messages = [];
    }
    wireFrom(compId, pinId) {
      const w = this.wires.find(
        (w) => (w.a.comp === compId && w.a.pin === pinId) || (w.b.comp === compId && w.b.pin === pinId)
      );
      if (!w) return null;
      const other = w.a.comp === compId && w.a.pin === pinId ? w.b : w.a;
      const c = this.compById(other.comp);
      if (!c) return null;
      const pin = this.defOf(c).pins.find((p) => p.id === other.pin);
      return { wire: w, comp: c, pin };
    }
    vOf(cp) { return this._V && this._nodeOf ? this._V[this._nodeOf(this.key(cp))] || 0 : 0; }

    tick(dt) {
      this.wtime += dt;
      this.solve();
      this.validate();
    }

    /* ---------------- núcleo MNA ---------------- */
    solve() {
      const cat = CAT();
      const comps = this.comps;
      // union-find de pines unidos por cables
      const parent = new Map();
      const find = (k) => {
        if (!parent.has(k)) { parent.set(k, k); return k; }
        let r = k;
        while (parent.get(r) !== r) { parent.set(r, parent.get(parent.get(r))); r = parent.get(r); }
        return r;
      };
      const union = (a, b) => parent.set(find(a), find(b));
      this.wires.forEach((w) => union(this.key(w.a), this.key(w.b)));
      const ids = new Map(); let N = 0;
      const nodeOf = (k) => {
        const s = typeof k === "string" ? k : k.comp + ":" + k.pin;
        const r = find(s);
        if (!ids.has(r)) ids.set(r, N++);
        return ids.get(r);
      };
      comps.forEach((c) => cat[c.type].pins.forEach((p) => nodeOf(this.key({ comp: c.id, pin: p.id }))));
      let gkey = null;
      for (const c of comps) {
        for (const p of cat[c.type].pins) if (p.gnd) { gkey = this.key({ comp: c.id, pin: p.id }); break; }
        if (gkey) break;
      }
      const gnd = gkey ? nodeOf(gkey) : 0;
      this._nodeOf = nodeOf;

      const prevV = this._V;
      const vPrev = (cp) => (prevV ? prevV[nodeOf(this.key(cp))] || 0 : 0);
      const K = (c, id) => ({ comp: c.id, pin: id });
      const vccOf = (c) => cat[c.type].vcc || 5;
      const active = (c) => this.masterPower && c.props.on !== false;

      // colecta sellos (stamps)
      const res = [];   // [nodoA, nodoB, R]
      const srcs = [];  // {a, b, V, r}
      const RR = (a, b, r) => res.push([nodeOf(a), nodeOf(b), r]);
      const SS = (plus, minus, V, r) => {
        const s = { a: nodeOf(plus), b: minus === null ? gnd : nodeOf(minus), V, r: r && r > 0 ? r : 1e-3 };
        srcs.push(s);
        return s;
      };

      let anySupply = false;

      for (const c of comps) {
        switch (c.type) {
          case "resistencia":
            RR(K(c, "a"), K(c, "b"), Math.max(0.1, +c.props.R || 220));
            break;
          case "potenciometro": {
            const a = Math.min(1, Math.max(0, +c.props.alpha || 0));
            const R = Math.max(1, +c.props.R || 10000);
            RR(K(c, "a"), K(c, "w"), R * (1 - a) + 1);
            RR(K(c, "w"), K(c, "b"), R * a + 1);
            break;
          }
          case "led": {
            if (c.state.ledOn && !c.state.burnt) { const s = SS(K(c, "anodo"), K(c, "catodo"), 2.0, 8); s.tag = c.id; } // diodo ON: Vf=2V + Rs=8Ω
            else RR(K(c, "anodo"), K(c, "catodo"), 1e9);                                                             // diodo OFF
            break;
          }
          case "buzzer":
            RR(K(c, "plus"), K(c, "minus"), 42);
            break;
          case "motor_dc": case "motorreductor":
            RR(K(c, "plus"), K(c, "minus"), 8);
            break;
          case "servo":
            RR(K(c, "sig"), K(c, "gnd"), 1e6);
            break;
          case "pila9v":
            if (active(c)) { SS(K(c, "plus"), K(c, "minus"), 9, 1); anySupply = true; }
            break;
          case "adaptador":
            if (active(c)) { SS(K(c, "plus"), K(c, "minus"), 12, 1); anySupply = true; }
            break;
          case "fuente":
            if (active(c)) { const V = Math.max(0, +c.props.volt || 0); SS(K(c, "plus"), K(c, "minus"), V, 0.5); anySupply = true; }
            break;
          case "rele": {
            RR(K(c, "in"), K(c, "gnd"), 70); // bobina
            const en = vPrev(K(c, "in")) > 2.5;
            if (en) { RR(K(c, "com"), K(c, "no"), 0.05); RR(K(c, "com"), K(c, "nc"), 1e9); }
            else { RR(K(c, "com"), K(c, "nc"), 0.05); RR(K(c, "com"), K(c, "no"), 1e9); }
            c.state.relayClosed = en;
            break;
          }
          case "l298n": {
            const Vs = Math.max(0, vPrev(K(c, "vs")));
            const duty = (p) => {
              const w = this.wireFrom(c.id, p);
              if (w && cat[w.comp.type].mcu) {
                const st = w.comp.state.pins && w.comp.state.pins[w.pin.id];
                if (st && st.pwm != null) return st.pwm / 255;
                if (st && st.val) return 1;
              }
              return vPrev(K(c, p)) > 2.5 ? 1 : 0;
            };
            const dir = (p) => (vPrev(K(c, p)) > 2.5 ? 1 : 0);
            let vA = Vs * duty("ena") * (dir("in1") - dir("in2"));
            let vB = Vs * duty("enb") * (dir("in3") - dir("in4"));
            vA = Math.max(-Vs, Math.min(Vs, vA)); vB = Math.max(-Vs, Math.min(Vs, vB));
            SS(K(c, "out1"), K(c, "out2"), vA, 1);
            SS(K(c, "out3"), K(c, "out4"), vB, 1);
            break;
          }
          case "l293d": {
            const Vs = Math.max(0, vPrev(K(c, "vcc")));
            const duty = (p) => {
              const w = this.wireFrom(c.id, p);
              if (w && cat[w.comp.type].mcu) {
                const st = w.comp.state.pins && w.comp.state.pins[w.pin.id];
                if (st && st.pwm != null) return st.pwm / 255;
                if (st && st.val) return 1;
              }
              return 0;
            };
            const vA = Vs * duty("d11") * (vPrev(K(c, "d10")) > 2.5 ? 1 : -1);
            const vB = Vs * duty("d6") * (vPrev(K(c, "d9")) > 2.5 ? 1 : -1);
            SS(K(c, "m1"), K(c, "m2"), vA, 1);
            SS(K(c, "m3"), K(c, "m4"), vB, 1);
            break;
          }
          case "arduino": case "esp32": {
            const vcc = vccOf(c);
            const powered =
              c.props.usb !== false ||
              vPrev(K(c, "VIN")) > 4.5 ||
              vPrev(K(c, "5V")) > 4.5 ||
              (c.type === "esp32" && vPrev(K(c, "3V3")) > 3);
            c.state.powered = powered;
            if (powered) {
              SS(K(c, "5V"), null, vcc, 0.2);
              SS(K(c, "3V3"), null, 3.3, 0.2);
              const pins = c.state.pins || {};
              for (const id of Object.keys(pins)) {
                const st = pins[id];
                if (st.mode === "output") {
                  let val;
                  if (st.tone && this.wtime < (st.tone.until || 0)) val = vcc / 2;
                  else if (st.pwm != null) val = (st.pwm / 255) * vcc;
                  else val = st.val ? vcc : 0;
                  SS(K(c, id), null, val, 25); // resistencia interna del pin ~25Ω
                } else if (st.mode === "input_pullup") {
                  RR(K(c, id), K(c, "5V"), 20000);
                }
              }
            }
            break;
          }
          case "ldr":
            if (vPrev(K(c, "vcc")) > 4.5) SS(K(c, "ao"), null, 5 * Math.min(1, Math.max(0, +c.props.luz || 0)), 10);
            break;
          case "hcsr501":
            if (vPrev(K(c, "vcc")) > 4.5) SS(K(c, "out"), null, c.props.motion ? 5 : 0, 10);
            break;
          case "linea":
            if (vPrev(K(c, "vcc")) > 4.5) SS(K(c, "out"), null, c.props.linea ? 0 : 5, 10);
            break;
          case "irobstaculo":
            if (vPrev(K(c, "vcc")) > 4.5) SS(K(c, "out"), null, c.props.obstaculo ? 0 : 5, 10);
            break;
          case "aplausos":
            if (vPrev(K(c, "vcc")) > 4.5) SS(K(c, "out"), null, this.wtime < (c.state.clapUntil || 0) ? 5 : 0, 10);
            break;
          case "ir":
            if (vPrev(K(c, "vcc")) > 4.5) SS(K(c, "out"), null, 0, 10);
            break;
          case "multimetro": {
            const m = c.props.mode || "V";
            if (m === "V") RR(K(c, "vom"), K(c, "com"), 1e7);
            else if (m === "A") RR(K(c, "a"), K(c, "com"), 0.05);
            else SS(K(c, "vom"), K(c, "com"), 1, 1000); // inyección de prueba para medir Ω
            break;
          }
          default:
            break; // sensores digitales puros (ultrasonico, dht11, lcd) no cargan la red
        }
      }

      // ---- ensambla y resuelve el sistema ----
      const nExtra = srcs.filter((s) => s.r > 1e-6).length; // nodos internos para la R serie
      const nS = srcs.length;
      const size = N + nExtra + nS;
      const A = Array.from({ length: size }, () => new Float64Array(size));
      const z = new Float64Array(size);
      for (const [a, b, r] of res) {
        const g = 1 / r;
        A[a][a] += g; A[b][b] += g; A[a][b] -= g; A[b][a] -= g;
      }
      let m = N;
      this._shortI = 0;
      srcs.forEach((s, i) => {
        const k = N + nExtra + i;
        s.k = k;
        if (s.a === s.b) { // fuente en cortocircuito directo
          if (Math.abs(s.V) > 0.01) this._shortI = Math.max(this._shortI, 1e9);
          return;
        }
        if (s.r > 1e-6) {
          // fuente ideal entre nodo interno m y b, con R serie entre a y m
          const mm = m++;
          A[mm][k] += 1; A[s.b][k] -= 1;
          A[k][mm] += 1; A[k][s.b] -= 1;
          z[k] = s.V;
          const g = 1 / s.r;
          A[s.a][s.a] += g; A[mm][mm] += g; A[s.a][mm] -= g; A[mm][s.a] -= g;
        } else {
          A[s.a][k] += 1; A[s.b][k] -= 1;
          A[k][s.a] += 1; A[k][s.b] -= 1;
          z[k] = s.V;
        }
      });
      for (let i = 0; i < N + nExtra; i++) A[i][i] += 1e-9; // gmin a tierra

      const x = gauss(A, z, size);
      // referenciar todos los voltajes al nodo de masa (GND)
      const vg = x[gnd];
      for (let i = 0; i < N; i++) x[i] -= vg;
      this._V = x;
      this._srcs = srcs;
      this._srcI = srcs.map((s) => (s.k != null ? Math.abs(x[s.k]) : 0));
      this.anySupply = anySupply;
      this.poweredFlag = anySupply || comps.some((c) => cat[c.type].mcu && c.state.powered);

      // ---- lecturas por componente ----
      const V = x;
      const vOf = (cp) => V[nodeOf(this.key(cp))] || 0;
      this.vOfNow = vOf;
      for (const c of comps) {
        switch (c.type) {
          case "resistencia": {
            const vd = vOf(K(c, "a")) - vOf(K(c, "b"));
            const R = Math.max(0.1, +c.props.R || 220);
            c.state.read = { V: vd, I: vd / R, P: (vd * vd) / R };
            break;
          }
          case "potenciometro": {
            const vw = vOf(K(c, "w"));
            c.state.read = { Vw: vw, alpha: +c.props.alpha };
            break;
          }
          case "led": {
            const va = vOf(K(c, "anodo")), vb = vOf(K(c, "catodo"));
            const vd = va - vb;
            if (!c.state.ledOn && vd > 2.2) c.state.ledOn = true;
            else if (c.state.ledOn && vd < 1.6) c.state.ledOn = false;
            let I = 0;
            if (c.state.ledOn && !c.state.burnt) {
              const s = (this._srcs || []).find((sr) => sr.tag === c.id);
              if (s) I = Math.max(0, V[s.k]); // corriente real de la rama del diodo
            }
            if (c.state.burnt) { c.state.ledOn = false; I = 0; }
            c.state.ledV = vd; c.state.ledI = I;
            c.state.brightness = Math.min(1, I / 0.02);
            if (c.state.ledOn && I > 0.03) {
              c.state.burnT = (c.state.burnT || 0) + 0.1;
              if (c.state.burnT > 1.0 && !c.state.burnt) { c.state.burnt = true; c._burnMsg = true; }
            } else c.state.burnT = 0;
            break;
          }
          case "buzzer": {
            const vd = vOf(K(c, "plus")) - vOf(K(c, "minus"));
            c.state.sounding = Math.abs(vd) > 0.8;
            let f = 2300;
            const w = this.wireFrom(c.id, "plus");
            if (w && cat[w.comp.type].mcu) {
              const st = w.comp.state.pins && w.comp.state.pins[w.pin.id];
              if (st && st.tone && this.wtime < st.tone.until) f = st.tone.f;
            }
            c.state.freq = f;
            c.state.read = { V: vd };
            break;
          }
          case "motor_dc": case "motorreductor": {
            const vd = vOf(K(c, "plus")) - vOf(K(c, "minus"));
            c.state.read = { V: vd, speed: Math.min(1.5, Math.abs(vd) / 6), dir: vd >= 0 ? 1 : -1 };
            break;
          }
          case "servo": {
            if (c.state.angle == null) {
              const w = this.wireFrom(c.id, "sig");
              if (w && cat[w.comp.type].mcu) {
                const st = w.comp.state.pins && w.comp.state.pins[w.pin.id];
                if (st && st.pwm != null) c.state.angle = (st.pwm / 255) * 180;
              }
            }
            c.state.angle = c.state.angle == null ? 90 : c.state.angle;
            break;
          }
          case "fuente":
            c.state.outV = active(c) ? +c.props.volt : 0;
            break;
          case "multimetro": {
            const m = c.props.mode || "V";
            const vv = vOf(K(c, "vom")) - vOf(K(c, "com"));
            const va = vOf(K(c, "a")) - vOf(K(c, "com"));
            if (m === "V") c.state.read = { text: fmt(vv) + " V" };
            else if (m === "A") c.state.read = { text: fmt((va / 0.05) * 1000) + " mA" };
            else {
              if (this.poweredFlag) c.state.read = { text: "OL" };
              else {
                const I = (1 - vv) / 1000;
                const Rx = I !== 0 ? vv / I : Infinity; // V/I sobre la carga entre las puntas
                c.state.read = { text: isFinite(Rx) && Rx > 0 ? fmt(Rx) + " Ω" : "OL" };
              }
            }
            break;
          }
          case "lcd":
            c.state.powered = vOf(K(c, "VDD")) - vOf(K(c, "VSS")) > 4.5;
            if (c.state.lines == null) c.state.lines = ["", ""];
            break;
          default:
            break;
        }
      }
    }

    /* ---------------- validación educativa ---------------- */
    validate() {
      const cat = CAT();
      const M = [];
      const vOf = (cp) => this.vOfNow ? this.vOfNow(cp) : 0;
      const K = (c, id) => ({ comp: c.id, pin: id });
      const hasSource = this.comps.some((c) => ["fuente", "pila9v", "adaptador"].includes(c.type));

      if (!this.masterPower && hasSource)
        M.push({ sev: "info", text: "⏻ La alimentación general está APAGADA. Pulsa «⏻ Alimentación» para energizar las fuentes de la mesa." });
      if (this.masterPower && !this.anySupply && this.comps.length > 1 && !this.comps.some((c) => cat[c.type].mcu && c.state.powered))
        M.push({ sev: "warn", text: "⚠ Falta de alimentación: no hay ninguna fuente activa ni controlador alimentado. Conecta una pila/fuente entre + y −, o alimenta el Arduino por USB." });

      // cortocircuitos
      if (this._shortI) M.push({ sev: "err", text: "⚠ CORTOCIRCUITO detectado: hay un cable directo entre + y − de una fuente sin ninguna carga. Desconecta ese cable." });
      if (this._srcI) {
        for (const I of this._srcI) {
          if (I > 3) M.push({ sev: "err", text: `⚠ CORTOCIRCUITO detectado: circulan ${fmt(I)} A por una fuente. Hay un cable directo entre + y − sin carga. Desconecta el cable problemático.` });
        }
      }

      for (const c of this.comps) {
        if (c.type === "led") {
          const vd = vOf(K(c, "anodo")) - vOf(K(c, "catodo"));
          if (c.state.burnt)
            M.push({ sev: "err", text: "🔥 El LED se quemó por exceso de corriente. Necesita SIEMPRE una resistencia limitadora en serie (ej. 220 Ω). Sustitúyelo y revisa el circuito." });
          else if (!c.state.ledOn && vd < -0.5)
            M.push({ sev: "warn", text: "💡 El LED no enciende porque está conectado con polaridad INVERTIDA. Intercambia las conexiones del ánodo (+) y el cátodo (−)." });
          else if (c.state.ledOn && c.state.ledI > 0.03)
            M.push({ sev: "err", text: `⚠ Por el LED circulan ${fmt(c.state.ledI * 1000)} mA (límite recomendado 20–30 mA). Conecta el LED directamente a una fuente sin resistencia puede dañarlo: añade una resistencia de 220 Ω en serie.` });
          else if (!c.state.ledOn && this.poweredFlag && Math.abs(vd) < 2.2 && vOf(K(c, "anodo")) > 0.1)
            M.push({ sev: "info", text: "💡 El LED no enciende: revisa que la corriente llegue al ánodo pasando por una resistencia y que el cátodo vaya a GND." });
        }
        if (c.type === "resistencia" && c.state.read && c.state.read.P > 0.25)
          M.push({ sev: "warn", text: `⚠ La resistencia disipa ${fmt(c.state.read.P * 1000)} mW (límite típico 250 mW). Aumenta su valor de resistencia.` });
        if (c.type === "lcd") {
          if (!c.state.powered)
            M.push({ sev: "warn", text: "🖥 La pantalla LCD no recibe alimentación. Verifica las conexiones VDD → 5 V y VSS → GND." });
          else {
            const need = ["RS", "E", "D4", "D5", "D6", "D7"];
            const missing = need.filter((p) => !this.wireFrom(c.id, p));
            if (missing.length)
              M.push({ sev: "warn", text: `🖥 La LCD está encendida pero no muestra nada: faltan conexiones hacia el Arduino en los pines ${missing.join(", ")}.` });
          }
        }
        if (cat[c.type].mcu) {
          // corriente por pines de salida
          const pins = c.state.pins || {};
          for (const id of Object.keys(pins)) {
            const st = pins[id];
            if (st.mode === "output") {
              const vcc = cat[c.type].vcc || 5;
              let val = st.tone && this.wtime < (st.tone.until || 0) ? vcc / 2 : st.pwm != null ? (st.pwm / 255) * vcc : st.val ? vcc : 0;
              const I = Math.abs((vOf(K(c, id)) - val) / 25);
              if (I > 0.04)
                M.push({ sev: "warn", text: `⚠ El pin ${id} del ${cat[c.type].name} entrega ${fmt(I * 1000)} mA (máximo recomendado 40 mA). Usa un driver/transistor para cargas grandes.` });
            }
          }
          const unconnected = cat[c.type].pins.filter((p) => !p.gnd && !p.vcc && !this.wireFrom(c.id, p.id)).map((p) => p.name);
          if (unconnected.length && this.comps.length > 1)
            M.push({ sev: "info", text: `ℹ Pines del ${cat[c.type].name} sin conectar: ${unconnected.join(", ")}.` });
        }
      }
      this.messages = M;
    }

    /* ---------------- API para el intérprete de Arduino ---------------- */
    analogRead(mcu, pinId) {
      const vcc = CAT()[mcu.type].vcc || 5;
      const v = this.vOfNow ? this.vOfNow({ comp: mcu.id, pin: pinId }) : 0;
      return Math.round(Math.max(0, Math.min(1023, (v / vcc) * 1023)));
    }
    digitalReadRaw(mcu, pinId) {
      const vcc = CAT()[mcu.type].vcc || 5;
      const v = this.vOfNow ? this.vOfNow({ comp: mcu.id, pin: pinId }) : 0;
      return v > vcc / 2 ? 1 : 0;
    }
    pulseIn(mcu, pinId) {
      const w = this.wireFrom(mcu.id, pinId);
      if (w && w.comp.type === "ultrasonico" && w.pin.id === "echo" && vPrevSafe(this, w.comp, "vcc") > 4.5)
        return Math.round((+w.comp.props.distancia || 0) * 58);
      return 0;
    }
    servoWrite(mcu, pinId, angle) {
      for (const c of this.comps) {
        if (c.type !== "servo") continue;
        const w = this.wireFrom(c.id, "sig");
        if (w && w.comp === mcu && w.pin.id === pinId) c.state.angle = Math.max(0, Math.min(180, angle));
      }
    }
    lcdFind(mcu, rsPin, ePin) {
      for (const c of this.comps) {
        if (c.type !== "lcd") continue;
        const wrs = this.wireFrom(c.id, "RS");
        const we = this.wireFrom(c.id, "E");
        if (wrs && wrs.comp === mcu && wrs.pin.id === rsPin && we && we.comp === mcu && we.pin.id === ePin) return c;
      }
      return null;
    }
    lcdPrint(mcu, rsPin, ePin, str, cursor) {
      const lcd = this.lcdFind(mcu, rsPin, ePin);
      if (!lcd || !lcd.state.powered) return;
      if (lcd.state.lines == null) lcd.state.lines = ["", ""];
      const [col, row] = cursor;
      const r = row === 1 ? 1 : 0;
      let line = lcd.state.lines[r];
      line = line.padEnd(col, " ").slice(0, col) + str + line.slice(col + str.length);
      lcd.state.lines[r] = line.slice(0, 16);
    }
    lcdSetCursor(mcu, rsPin, ePin, col, row) { return [col, row]; }
    lcdClear(mcu, rsPin, ePin) {
      const lcd = this.lcdFind(mcu, rsPin, ePin);
      if (lcd) lcd.state.lines = ["", ""];
    }
    dhtRead(mcu, pinId, what) {
      const w = this.wireFrom(mcu.id, pinId);
      if (w && w.comp.type === "dht11" && w.pin.id === "data")
        return what === "temp" ? +w.comp.props.temp : +w.comp.props.humedad;
      return NaN;
    }
    irDecode(mcu, pinId) {
      for (const c of this.comps) {
        if (c.type !== "ir") continue;
        const w = this.wireFrom(c.id, "out");
        if (w && w.comp === mcu && w.pin.id === pinId && c.state.pending && this.wtime - c.state.pending.t < 3000)
          return c.state.pending.code;
      }
      return 0;
    }
    clap(comp) { comp.state.clapUntil = this.wtime + 400; }
    irPress(comp, code) { comp.state.pending = { code, t: this.wtime }; }
  }

  function vPrevSafe(engine, comp, pinId) {
    return engine._V && engine._nodeOf ? engine._V[engine._nodeOf(engine.key({ comp: comp.id, pin: pinId }))] || 0 : 0;
  }

  // Eliminación gaussiana con pivoteo parcial
  function gauss(A, z, n) {
    const x = new Float64Array(n);
    for (let col = 0; col < n; col++) {
      let piv = col;
      for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
      if (Math.abs(A[piv][col]) < 1e-12) continue;
      if (piv !== col) { const t = A[piv]; A[piv] = A[col]; A[col] = t; const tz = z[piv]; z[piv] = z[col]; z[col] = tz; }
      for (let r = col + 1; r < n; r++) {
        const f = A[r][col] / A[col][col];
        if (f === 0) continue;
        for (let c2 = col; c2 < n; c2++) A[r][c2] -= f * A[col][c2];
        z[r] -= f * z[col];
      }
    }
    for (let r = n - 1; r >= 0; r--) {
      let s = z[r];
      for (let c2 = r + 1; c2 < n; c2++) s -= A[r][c2] * x[c2];
      x[r] = Math.abs(A[r][r]) < 1e-12 ? 0 : s / A[r][r];
    }
    return x;
  }

  global.Circuit = Circuit;
  if (typeof module !== "undefined" && module.exports) module.exports = { Circuit, fmt };
})(typeof window !== "undefined" ? window : globalThis);
