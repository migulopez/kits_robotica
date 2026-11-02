/* ============================================================
   Laboratorio virtual — interfaz de usuario
   ------------------------------------------------------------
   Mesa de trabajo interactiva: arrastrar componentes desde el
   panel, moverlos, rotarlos, zoom/pan, tender cables entre pines,
   instrumentos (fuente + multímetro), panel de propiedades,
   avisos de validación, editor Arduino y prácticas guiadas.
   ============================================================ */
(function () {
  "use strict";

  const S = 150;          // tamaño en px por defecto de un componente en la mesa
  const sizeOf = (c) => (LAB_CATALOG[c.type] && LAB_CATALOG[c.type].size) || S; // tamaño según el tipo
  const WORLD = 4000;     // tamaño del mundo virtual
  const WIRE_COLORS = {
    auto: "Automático", rojo: "#ef4444", negro: "#0b1120",
    amarillo: "#eab308", verde: "#22c55e", azul: "#3b82f6", blanco: "#e5e7eb"
  };

  const $ = (s) => document.querySelector(s);

  const LabUI = {
    engine: null, inited: false, open: false,
    zoom: 1, pan: { x: 30, y: 30 },
    sel: null, selWire: null,
    draft: null, move: null, panning: null,
    kit: "all", wireColor: "auto",
    mcuCtrls: new Map(),
    audio: { ctx: null, osc: null, gain: null },
    cursor: { rs: null, e: null, cur: [0, 0] }
  };

  /* ================= utilidades de geometría ================= */
  function pinWorldOf(comp, pinId, size) {
    const def = LAB_CATALOG[comp.type];
    const pin = def.pins.find((p) => p.id === pinId);
    const s = size || sizeOf(comp);
    const lx = (pin.x * s) / 240 - s / 2;
    const ly = (pin.y * s) / 240 - s / 2;
    const r = (comp.rot * Math.PI) / 2;
    const rx = lx * Math.cos(r) - ly * Math.sin(r);
    const ry = lx * Math.sin(r) + ly * Math.cos(r);
    return { x: comp.x + s / 2 + rx, y: comp.y + s / 2 + ry };
  }
  function pinWorld(cp) {
    const c = LabUI.engine.compById(cp.comp);
    return c ? pinWorldOf(c, cp.pin) : { x: 0, y: 0 };
  }
  function worldFromEvent(e) {
    const canvas = $("#lab-canvas");
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - LabUI.pan.x) / LabUI.zoom,
      y: (e.clientY - rect.top - LabUI.pan.y) / LabUI.zoom
    };
  }
  function applyTransform() {
    $("#lab-world").style.transform =
      `translate(${LabUI.pan.x}px, ${LabUI.pan.y}px) scale(${LabUI.zoom})`;
    $("#zoom-label").textContent = Math.round(LabUI.zoom * 100) + "%";
  }
  function toast(msg) {
    const h = $("#lab-hint");
    h.textContent = msg;
    h.classList.add("flash");
    clearTimeout(h._t);
    h._t = setTimeout(() => h.classList.remove("flash"), 2600);
  }

  /* ================= paleta lateral ================= */
  function buildPalette() {
    const cats = $("#palette-cats");
    cats.innerHTML = "";
    for (const cat of LAB_CATEGORIES) {
      const types = Object.keys(LAB_CATALOG).filter((t) => LAB_CATALOG[t].cat === cat.id);
      const visible = types.filter((t) => LabUI.kit === "all" || LAB_CATALOG[t].kits.includes(+LabUI.kit));
      if (!visible.length) continue;
      const div = document.createElement("div");
      div.className = "pal-cat";
      div.innerHTML = `<h4>${cat.name}</h4>`;
      const list = document.createElement("div");
      list.className = "pal-items";
      for (const t of visible) {
        const def = LAB_CATALOG[t];
        const item = document.createElement("div");
        item.className = "pal-item";
        item.title = def.name + (def.hint ? " — " + def.hint : "") + "\n(Arrastra a la mesa)";
        item.innerHTML = `<img src="${def.img}" alt=""><span>${def.name}</span>`;
        item.addEventListener("pointerdown", (e) => startPlace(t, e));
        list.appendChild(item);
      }
      div.appendChild(list);
      cats.appendChild(div);
    }
    // selector de kit
    document.querySelectorAll("#palette-kits button").forEach((b) => {
      b.classList.toggle("on", b.dataset.kit === LabUI.kit);
      b.onclick = () => { LabUI.kit = b.dataset.kit; buildPalette(); };
    });
    // colores de cable
    const wc = $("#wire-colors");
    wc.innerHTML = "";
    for (const [k, v] of Object.entries(WIRE_COLORS)) {
      const b = document.createElement("button");
      b.className = "wire-swatch" + (LabUI.wireColor === k ? " on" : "");
      b.style.background = k === "auto" ? "conic-gradient(#ef4444,#eab308,#0b1120)" : v;
      b.title = v;
      b.onclick = () => { LabUI.wireColor = k; buildPalette(); };
      wc.appendChild(b);
    }
  }

  function startPlace(type, e) {
    e.preventDefault();
    const w = worldFromEvent(e);
    const sz = (LAB_CATALOG[type] && LAB_CATALOG[type].size) || S;
    const c = LabUI.engine.addComp(type, w.x - sz / 2, w.y - sz / 2);
    renderComp(c);
    select(c);
    LabUI.move = { comp: c, dx: sz / 2, dy: sz / 2, moved: false };
  }

  /* ================= renderizado de componentes ================= */
  function overlaysFor(c, def) {
    const sz = sizeOf(c);
    const pos = (o, extra) => `style="left:${(o.x * sz) / 240 - (extra || o.r || 10)}px;top:${(o.y * sz) / 240 - (extra || o.r || 10)}px;${extra ? "" : `width:${(o.r * 2 * sz) / 240}px;height:${(o.r * 2 * sz) / 240}px;`}"`;
    let h = "";
    if (def.glow) h += `<div class="ov glow" ${pos(def.glow)}></div>`;
    if (def.rotor) h += `<div class="ov rotor" ${pos(def.rotor)}></div>`;
    if (def.horn) h += `<div class="ov horn" ${pos(def.horn, 6)}><div class="horn-arm"></div></div>`;
    if (def.buzzOv) h += `<div class="ov buzz" ${pos(def.buzzOv)}>🔊</div>`;
    if (def.screen) h += `<div class="ov lcd-screen" style="left:${(def.screen.x * sz) / 240}px;top:${(def.screen.y * sz) / 240}px;width:${(def.screen.w * sz) / 240}px;height:${(def.screen.h * sz) / 240}px"><div class="lcd-l0"></div><div class="lcd-l1"></div></div>`;
    if (def.display) h += `<div class="ov mm-display" style="left:${(def.display.x * sz) / 240}px;top:${(def.display.y * sz) / 240}px;width:${(def.display.w * sz) / 240}px;height:${(def.display.h * sz) / 240}px">--</div>`;
    if (def.rled) h += `<div class="ov rled" ${pos(def.rled)}></div>`;
    h += `<div class="ov badge"></div>`;
    return h;
  }

  function renderComp(c) {
    const def = LAB_CATALOG[c.type];
    const sz = sizeOf(c);
    const pr = (def.pinSize || 14) / 2;
    const d = document.createElement("div");
    d.className = "lab-comp";
    d.dataset.id = c.id;
    d.style.left = c.x + "px";
    d.style.top = c.y + "px";
    d.style.width = sz + "px";
    d.style.height = sz + "px";
    d.style.transform = `rotate(${c.rot * 90}deg)`;
    let h = `<img src="${def.img}" alt="${def.name}" draggable="false">`;
    const showLabels = def.mcu || def.labels;
    def.pins.forEach((p, i) => {
      const lbl = showLabels ? `<span class="pin-label${i % 2 ? " alt" : ""}">${p.name}</span>` : "";
      h += `<div class="pin${p.gnd ? " gnd" : ""}${p.vcc ? " vcc" : ""}" data-comp="${c.id}" data-pin="${p.id}" title="${def.name} · ${p.name}" style="left:${(p.x * sz) / 240 - pr}px;top:${(p.y * sz) / 240 - pr}px;width:${pr * 2}px;height:${pr * 2}px">${lbl}</div>`;
    });
    h += overlaysFor(c, def);
    d.innerHTML = h;
    $("#lab-world").appendChild(d);
    updateVisual(c);
    return d;
  }

  function renderAllComps() {
    document.querySelectorAll("#lab-world .lab-comp").forEach((e) => e.remove());
    for (const c of LabUI.engine.comps) renderComp(c);
  }

  function renderWires() {
    const svg = $("#wire-layer");
    svg.innerHTML = "";
    for (const w of LabUI.engine.wires) {
      const p1 = pinWorld(w.a), p2 = pinWorld(w.b);
      const d = `M ${p1.x} ${p1.y} C ${p1.x} ${p1.y + 50}, ${p2.x} ${p2.y + 50}, ${p2.x} ${p2.y}`;
      const halo = document.createElementNS("http://www.w3.org/2000/svg", "path");
      halo.setAttribute("d", d);
      halo.setAttribute("class", "wire-halo");
      svg.appendChild(halo);
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.setAttribute("class", "wire" + (LabUI.selWire === w.id ? " sel" : ""));
      path.setAttribute("stroke", WIRE_COLORS[w.color] || w.color);
      path.dataset.id = w.id;
      path.addEventListener("pointerdown", (e) => { e.stopPropagation(); selectWire(w.id); });
      path.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        LabUI.engine.removeWire(w.id);
        if (LabUI.selWire === w.id) LabUI.selWire = null;
        renderWires();
      });
      svg.appendChild(path);
    }
    // cable en curso
    if (LabUI.draft) {
      const p1 = pinWorld(LabUI.draft.from);
      const d = `M ${p1.x} ${p1.y} L ${LabUI.draft.x} ${LabUI.draft.y}`;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.setAttribute("class", "wire draft");
      path.setAttribute("stroke", LabUI.draft.colorHex);
      svg.appendChild(path);
    }
  }

  /* ================= selección / propiedades ================= */
  function select(c) {
    LabUI.sel = c; LabUI.selWire = null;
    document.querySelectorAll(".lab-comp").forEach((e) => e.classList.toggle("sel", c && +e.dataset.id === c.id));
    renderWires();
    renderProps();
  }
  function selectWire(id) {
    LabUI.selWire = id; LabUI.sel = null;
    document.querySelectorAll(".lab-comp").forEach((e) => e.classList.remove("sel"));
    renderWires();
    renderProps();
  }

  function renderProps() {
    const body = $("#props-body");
    const c = LabUI.sel;
    if (!c && LabUI.selWire == null) {
      body.innerHTML = `<p class="muted">Selecciona un componente de la mesa para ver y editar sus propiedades. Selecciona un cable (clic) y pulsa Supr para eliminarlo (clic derecho también sirve).</p>`;
      return;
    }
    if (LabUI.selWire != null) {
      const w = LabUI.engine.wires.find((x) => x.id === LabUI.selWire);
      body.innerHTML = w
        ? `<p><b>Cable ${w.color}</b></p><p class="muted">Conecta ${nameOf(w.a)} ↔ ${nameOf(w.b)}</p>
           <div class="prop-row"><label>Color</label><select id="prop-wcolor">${Object.keys(WIRE_COLORS).map((k) => `<option ${w.color === k ? "selected" : ""}>${k}</option>`).join("")}</select></div>
           <button class="btn danger sm" id="prop-delwire">🗑 Eliminar cable</button>`
        : `<p class="muted">Cable eliminado.</p>`;
      const sel = $("#prop-wcolor");
      if (sel) sel.onchange = () => { w.color = sel.value; renderWires(); };
      const del = $("#prop-delwire");
      if (del) del.onclick = () => { LabUI.engine.removeWire(w.id); LabUI.selWire = null; renderWires(); renderProps(); };
      return;
    }
    const def = LAB_CATALOG[c.type];
    let h = `<h3 class="prop-title">${def.name}</h3>`;
    const row = (label, inner) => `<div class="prop-row"><label>${label}</label>${inner}</div>`;
    if (c.type === "resistencia")
      h += row("Resistencia (Ω)", `<input type="number" id="pr-R" min="1" max="10000000" step="1" value="${c.props.R}">`);
    if (c.type === "potenciometro") {
      h += row("Posición (%)", `<input type="range" id="pr-alpha" min="0" max="100" value="${Math.round(c.props.alpha * 100)}"><span id="pr-alpha-v">${Math.round(c.props.alpha * 100)}%</span>`);
      h += `<p class="muted">También puedes girar la perilla directamente sobre el componente en la mesa.</p>`;
    }
    if (c.type === "fuente") {
      h += row("Voltaje (V)", `<input type="range" id="pr-volt" min="0" max="12" step="0.5" value="${c.props.volt}"><span id="pr-volt-v">${c.props.volt} V</span>`);
      h += row("Interruptor", `<input type="checkbox" id="pr-on" ${c.props.on ? "checked" : ""}> encendida`);
    }
    if (c.type === "pila9v" || c.type === "adaptador")
      h += row("Interruptor", `<input type="checkbox" id="pr-on" ${c.props.on ? "checked" : ""}> encendido`);
    if (c.type === "multimetro")
      h += row("Modo", `<select id="pr-mode"><option value="V" ${c.props.mode === "V" ? "selected" : ""}>Voltaje DC (V)</option><option value="A" ${c.props.mode === "A" ? "selected" : ""}>Corriente DC (A)</option><option value="Ω" ${c.props.mode === "Ω" ? "selected" : ""}>Resistencia (Ω)</option></select>`)
        + `<p class="muted">Conecta COM y VΩ en paralelo para medir voltaje; COM y A en serie para medir corriente. En modo Ω el circuito debe estar sin alimentación.</p>`;
    if (c.type === "ultrasonico")
      h += row("Distancia detectada (cm)", `<input type="range" id="pr-dist" min="2" max="400" value="${c.props.distancia}"><span id="pr-dist-v">${c.props.distancia} cm</span>`);
    if (c.type === "dht11") {
      h += row("Temperatura (°C)", `<input type="range" id="pr-temp" min="0" max="50" value="${c.props.temp}"><span id="pr-temp-v">${c.props.temp} °C</span>`);
      h += row("Humedad (%)", `<input type="range" id="pr-hum" min="20" max="90" value="${c.props.humedad}"><span id="pr-hum-v">${c.props.humedad} %</span>`);
    }
    if (c.type === "ldr")
      h += row("Luz ambiental", `<input type="range" id="pr-luz" min="0" max="100" value="${Math.round(c.props.luz * 100)}"><span id="pr-luz-v">${Math.round(c.props.luz * 100)}%</span>`);
    if (c.type === "hcsr501")
      h += row("Movimiento", `<input type="checkbox" id="pr-motion" ${c.props.motion ? "checked" : ""}> hay presencia detectada`);
    if (c.type === "linea")
      h += row("¿Línea negra debajo?", `<input type="checkbox" id="pr-linea" ${c.props.linea ? "checked" : ""}>`);
    if (c.type === "irobstaculo")
      h += row("¿Obstáculo delante?", `<input type="checkbox" id="pr-obs" ${c.props.obstaculo ? "checked" : ""}>`);
    if (c.type === "aplausos")
      h += `<div class="prop-row"><button class="btn sm" id="pr-clap">👏 Simular aplauso</button></div>`;
    if (c.type === "ir")
      h += `<div class="prop-row"><label>Control remoto</label><div class="remote-btns">${["1", "2", "3", "4", "5", "6", "OK", "↑", "↓"].map((b) => `<button class="btn sm rbtn" data-code="${b}">${b}</button>`).join("")}</div></div>`;
    if (def.mcu)
      h += row("Alimentación USB", `<input type="checkbox" id="pr-usb" ${c.props.usb ? "checked" : ""}> Arduino/ESP32 conectado por USB`)
        + `<p class="muted">Los pines digitales se muestran en los bordes. ~ = pin PWM (${def.vcc} V). A0–A5 = entradas analógicas.</p>`;
    if (c.state.read && c.type === "resistencia")
      h += `<div class="readout">V = ${fmt(c.state.read.V)} V · I = ${fmt(c.state.read.I * 1000)} mA · P = ${fmt(c.state.read.P * 1000)} mW</div>`;
    if (c.type === "multimetro" && c.state.read)
      h += `<div class="readout big">${c.state.read.text}</div>`;
    h += `<button class="btn danger sm" id="prop-del">🗑 Eliminar componente</button>`;
    body.innerHTML = h;

    const bind = (id, fn) => { const e = $(id); if (e) e.addEventListener("input", fn); };
    if ($("#pr-R")) bind("#pr-R", (e) => { c.props.R = +e.target.value; });
    if ($("#pr-alpha")) bind("#pr-alpha", (e) => { c.props.alpha = e.target.value / 100; $("#pr-alpha-v").textContent = e.target.value + "%"; });
    if ($("#pr-volt")) bind("#pr-volt", (e) => { c.props.volt = +e.target.value; $("#pr-volt-v").textContent = c.props.volt + " V"; });
    if ($("#pr-on")) bind("#pr-on", (e) => { c.props.on = e.target.checked; });
    if ($("#pr-mode")) bind("#pr-mode", (e) => { c.props.mode = e.target.value; });
    if ($("#pr-dist")) bind("#pr-dist", (e) => { c.props.distancia = +e.target.value; $("#pr-dist-v").textContent = c.props.distancia + " cm"; });
    if ($("#pr-temp")) bind("#pr-temp", (e) => { c.props.temp = +e.target.value; $("#pr-temp-v").textContent = c.props.temp + " °C"; });
    if ($("#pr-hum")) bind("#pr-hum", (e) => { c.props.humedad = +e.target.value; $("#pr-hum-v").textContent = c.props.humedad + " %"; });
    if ($("#pr-luz")) bind("#pr-luz", (e) => { c.props.luz = e.target.value / 100; $("#pr-luz-v").textContent = e.target.value + "%"; });
    if ($("#pr-motion")) bind("#pr-motion", (e) => { c.props.motion = e.target.checked; });
    if ($("#pr-linea")) bind("#pr-linea", (e) => { c.props.linea = e.target.checked; });
    if ($("#pr-obs")) bind("#pr-obs", (e) => { c.props.obstaculo = e.target.checked; });
    if ($("#pr-usb")) bind("#pr-usb", (e) => { c.props.usb = e.target.checked; });
    if ($("#pr-clap")) $("#pr-clap").onclick = () => LabUI.engine.clap(c);
    document.querySelectorAll(".rbtn").forEach((b) => (b.onclick = () => LabUI.engine.irPress(c, b.dataset.code)));
    $("#prop-del").onclick = () => { LabUI.engine.removeComp(c.id); LabUI.sel = null; renderAllComps(); renderWires(); renderProps(); };
  }

  function nameOf(cp) {
    const c = LabUI.engine.compById(cp.comp);
    if (!c) return "?";
    const p = LAB_CATALOG[c.type].pins.find((x) => x.id === cp.pin);
    return `${LAB_CATALOG[c.type].name} · ${p ? p.name : cp.pin}`;
  }

  const fmt = (v) => {
    const a = Math.abs(v);
    if (a >= 100) return v.toFixed(1);
    if (a >= 1) return v.toFixed(2);
    if (a > 0.001) return v.toFixed(3);
    return v.toExponential(1);
  };

  /* ================= actualización visual por tick ================= */
  function updateVisual(c) {
    const d = document.querySelector(`#lab-world .lab-comp[data-id="${c.id}"]`);
    if (!d) return;
    const st = c.state;
    const badge = d.querySelector(".badge");
    switch (c.type) {
      case "led": {
        const g = d.querySelector(".glow");
        if (g) g.style.opacity = st.brightness || 0;
        d.classList.toggle("burnt", !!st.burnt);
        if (badge) badge.textContent = st.burnt ? "quemado 🔥" : st.ledOn ? fmt(st.ledI * 1000) + " mA" : "";
        break;
      }
      case "motor_dc": case "motorreductor": {
        const r = d.querySelector(".rotor");
        if (r && st.read) {
          if (st.read.speed > 0.02) {
            r.style.animationDuration = (0.6 / Math.max(0.05, st.read.speed)) + "s";
            r.style.animationDirection = st.read.dir >= 0 ? "normal" : "reverse";
            r.classList.add("spin");
          } else r.classList.remove("spin");
        }
        if (badge && st.read) badge.textContent = fmt(st.read.V) + " V";
        break;
      }
      case "servo": {
        const horn = d.querySelector(".horn");
        if (horn) horn.style.transform = `rotate(${(st.angle - 90)}deg)`;
        break;
      }
      case "buzzer": {
        d.classList.toggle("buzzing", !!st.sounding);
        if (badge) badge.textContent = st.sounding ? st.freq + " Hz" : "";
        break;
      }
      case "lcd": {
        d.classList.toggle("lcd-on", !!st.powered);
        const l0 = d.querySelector(".lcd-l0"), l1 = d.querySelector(".lcd-l1");
        if (l0 && st.lines) { l0.textContent = (st.lines[0] || "").padEnd(16, " ").slice(0, 16); l1.textContent = (st.lines[1] || "").padEnd(16, " ").slice(0, 16); }
        break;
      }
      case "fuente": case "multimetro": {
        const disp = d.querySelector(".mm-display");
        if (disp) disp.textContent = c.type === "fuente" ? (st.outV != null ? st.outV.toFixed(1) + " V" : "--") : st.read ? st.read.text : "--";
        break;
      }
      case "rele": {
        const rl = d.querySelector(".rled");
        if (rl) rl.classList.toggle("on", !!st.relayClosed);
        if (badge) badge.textContent = st.relayClosed ? "COM→NO cerrado" : "COM→NC";
        break;
      }
      case "ultrasonico":
        if (badge) badge.textContent = (c.props.distancia || 0) + " cm";
        break;
      case "dht11":
        if (badge) badge.textContent = `${c.props.temp}°C ${c.props.humedad}%`;
        break;
      case "ldr":
        if (badge) badge.textContent = "luz " + Math.round((c.props.luz || 0) * 100) + "%";
        break;
      case "hcsr501":
        if (badge) badge.textContent = c.props.motion ? "MOVIMIENTO" : "";
        break;
      case "arduino": case "esp32":
        d.classList.toggle("powered", !!st.powered);
        if (badge) badge.textContent = st.powered ? "ON" : "OFF";
        break;
    }
  }

  /* ================= mensajes ================= */
  function renderMessages() {
    const box = $("#lab-messages");
    const M = LabUI.engine.messages;
    if (!M.length) { box.innerHTML = `<p class="muted">Sin avisos. El circuito está correcto ✔</p>`; return; }
    box.innerHTML = M.map((m) => `<div class="msg ${m.sev}">${m.text}</div>`).join("");
  }

  /* ================= audio del buzzer ================= */
  function updateAudio() {
    let f = 0;
    for (const c of LabUI.engine.comps) if (c.type === "buzzer" && c.state.sounding) { f = c.state.freq; break; }
    const A = LabUI.audio;
    if (!f) {
      if (A.gain) A.gain.gain.value = 0;
      return;
    }
    try {
      if (!A.ctx) A.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (A.ctx.state === "suspended") A.ctx.resume();
      if (!A.osc) {
        A.osc = A.ctx.createOscillator();
        A.gain = A.ctx.createGain();
        A.gain.gain.value = 0.04;
        A.osc.type = "square";
        A.osc.connect(A.gain).connect(A.ctx.destination);
        A.osc.start();
      }
      A.osc.frequency.value = f;
      A.gain.gain.value = 0.04;   // restaurar volumen al reanudar el sonido
    } catch (e) { /* audio no disponible */ }
  }

  /* ================= eventos del canvas ================= */
  function wireColorFor(pinDef) {
    if (LabUI.wireColor !== "auto") return LabUI.wireColor;
    if (pinDef.vcc) return "rojo";
    if (pinDef.gnd) return "negro";
    return "amarillo";
  }

  function bindCanvas() {
    const canvas = $("#lab-canvas");
    canvas.addEventListener("pointerdown", (e) => {
      e.preventDefault(); // evita que el navegador seleccione texto/imagenes al arrastrar (resaltado azul)
      const pinEl = e.target.closest(".pin");
      if (pinEl) {
        e.stopPropagation();
        const comp = LabUI.engine.compById(+pinEl.dataset.comp);
        const pinDef = LAB_CATALOG[comp.type].pins.find((p) => p.id === pinEl.dataset.pin);
        LabUI.draft = {
          from: { comp: comp.id, pin: pinEl.dataset.pin },
          color: wireColorFor(pinDef),
          colorHex: WIRE_COLORS[wireColorFor(pinDef)] || "#eab308",
          x: 0, y: 0
        };
        const w = worldFromEvent(e);
        LabUI.draft.x = w.x; LabUI.draft.y = w.y;
        renderWires();
        return;
      }
      const compEl = e.target.closest(".lab-comp");
      if (compEl) {
        const c = LabUI.engine.compById(+compEl.dataset.id);
        select(c);
        // perilla del potenciómetro
        const def = LAB_CATALOG[c.type];
        if (def.knob) {
          const w = worldFromEvent(e);
          const ksz = sizeOf(c);
          const cx = c.x + (def.knob.x * ksz) / 240, cy = c.y + (def.knob.y * ksz) / 240;
          if (Math.hypot(w.x - cx, w.y - cy) < (def.knob.r * ksz) / 240) {
            LabUI.knobDrag = { comp: c, cx, cy };
            return;
          }
        }
        const w = worldFromEvent(e);
        LabUI.move = { comp: c, dx: w.x - c.x, dy: w.y - c.y, moved: false };
        return;
      }
      // clic en cable ya existe (sobre path) se maneja en el path; aquí: pan
      select(null);
      LabUI.panning = { x: e.clientX, y: e.clientY, pan: { ...LabUI.pan } };
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* no soportado */ }
    });

    window.addEventListener("pointermove", (e) => {
      if (LabUI.knobDrag) {
        const k = LabUI.knobDrag;
        const w = worldFromEvent(e);
        let ang = Math.atan2(w.y - k.cy, w.x - k.cx) * 180 / Math.PI + 90;
        ang = ((ang % 360) + 360) % 360;
        k.comp.props.alpha = Math.min(1, Math.max(0, ang / 360));
        if (LabUI.sel === k.comp) renderProps();
        return;
      }
      if (LabUI.draft) {
        const w = worldFromEvent(e);
        LabUI.draft.x = w.x; LabUI.draft.y = w.y;
        renderWires();
        return;
      }
      if (LabUI.move) {
        const w = worldFromEvent(e);
        const c = LabUI.move.comp;
        const dsz = sizeOf(c);
        c.x = Math.max(0, Math.min(WORLD - dsz, w.x - LabUI.move.dx));
        c.y = Math.max(0, Math.min(WORLD - dsz, w.y - LabUI.move.dy));
        const d = document.querySelector(`#lab-world .lab-comp[data-id="${c.id}"]`);
        if (d) { d.style.left = c.x + "px"; d.style.top = c.y + "px"; }
        renderWires();
        return;
      }
      if (LabUI.panning) {
        LabUI.pan.x = LabUI.panning.pan.x + (e.clientX - LabUI.panning.x);
        LabUI.pan.y = LabUI.panning.pan.y + (e.clientY - LabUI.panning.y);
        applyTransform();
      }
    });

    window.addEventListener("pointerup", (e) => {
      if (LabUI.knobDrag) { LabUI.knobDrag = null; return; }
      if (LabUI.draft) {
        const t = document.elementFromPoint(e.clientX, e.clientY);
        const pinEl = t && t.closest ? t.closest(".pin") : null;
        if (pinEl) {
          const to = { comp: +pinEl.dataset.comp, pin: pinEl.dataset.pin };
          const w = LabUI.engine.addWire(LabUI.draft.from, to, LabUI.draft.color);
          if (!w) toast("Ese cable ya existe o une el mismo pin.");
          else toast(`Cable ${LabUI.draft.color}: ${nameOf(LabUI.draft.from)} ↔ ${nameOf(to)}`);
        }
        LabUI.draft = null;
        renderWires();
        return;
      }
      LabUI.move = null;
      LabUI.panning = null;
    });

    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const f = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const nz = Math.min(2.5, Math.max(0.3, LabUI.zoom * f));
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      LabUI.pan.x = mx - ((mx - LabUI.pan.x) * nz) / LabUI.zoom;
      LabUI.pan.y = my - ((my - LabUI.pan.y) * nz) / LabUI.zoom;
      LabUI.zoom = nz;
      applyTransform();
    }, { passive: false });

    window.addEventListener("keydown", (e) => {
      if (!LabUI.open) return;
      if ((e.key === "Delete" || e.key === "Backspace") && (LabUI.sel || LabUI.selWire != null)) {
        if (document.activeElement && ["TEXTAREA", "INPUT"].includes(document.activeElement.tagName)) return;
        if (LabUI.sel) { LabUI.engine.removeComp(LabUI.sel.id); LabUI.sel = null; }
        if (LabUI.selWire != null) { LabUI.engine.removeWire(LabUI.selWire); LabUI.selWire = null; }
        renderAllComps(); renderWires(); renderProps();
      }
    });
  }

  /* ================= barra de herramientas ================= */
  function bindToolbar() {
    $("#btn-power").onclick = () => {
      LabUI.engine.masterPower = !LabUI.engine.masterPower;
      $("#btn-power").textContent = LabUI.engine.masterPower ? "⏻ Alimentación: ON" : "⏻ Alimentación: OFF";
      $("#btn-power").classList.toggle("on", LabUI.engine.masterPower);
    };
    $("#btn-reset").onclick = () => {
      LabUI.engine.resetStates();
      LabUI.mcuCtrls.forEach((c) => c.stop());
      LabUI.mcuCtrls.clear();
      $("#serial-out").innerHTML = "";
      toast("↺ Simulación reiniciada (se conservan componentes y cables).");
    };
    $("#btn-clear").onclick = () => {
      if (!LabUI.engine.comps.length || confirm("¿Limpiar toda la mesa (componentes y cables)?")) {
        LabUI.engine.clear();
        LabUI.mcuCtrls.forEach((c) => c.stop());
        LabUI.mcuCtrls.clear();
        LabUI.sel = null; LabUI.selWire = null;
        renderAllComps(); renderWires(); renderProps();
        toast("🗑 Mesa limpia.");
      }
    };
    $("#btn-zoom-in").onclick = () => { LabUI.zoom = Math.min(2.5, LabUI.zoom * 1.25); applyTransform(); };
    $("#btn-zoom-out").onclick = () => { LabUI.zoom = Math.max(0.3, LabUI.zoom / 1.25); applyTransform(); };
    $("#btn-rotate").onclick = () => {
      if (!LabUI.sel) return toast("Selecciona primero un componente de la mesa.");
      LabUI.sel.rot = (LabUI.sel.rot + 1) % 4;
      const d = document.querySelector(`#lab-world .lab-comp[data-id="${LabUI.sel.id}"]`);
      if (d) d.style.transform = `rotate(${LabUI.sel.rot * 90}deg)`;
      renderWires();
    };
    $("#btn-projects").onclick = () => openProjects(null);
  }

  /* ================= editor de código ================= */
  const KEYWORDS = "void int long float double boolean char byte word String unsigned const static volatile return if else for while do switch case default break continue HIGH LOW INPUT OUTPUT INPUT_PULLUP true false new class include define".split(" ");
  function highlight(code) {
    // UNA SOLA PASADA: así los spans insertados no se vuelven a tocar (evita el texto fantasma "class")
    const esc = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const re = new RegExp(
      "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)" +            // 1 comentario
      "|(\"(?:[^\"\\\\]|\\\\.)*\")" +                        // 2 cadena
      "|\\b(\\d+\\.?\\d*)\\b" +                               // 3 número
      "|\\b([A-Za-z_]\\w*)(?=\\s*\\()" +                      // 4 función
      "|\\b(" + KEYWORDS.join("|") + ")\\b", "g"             // 5 palabra clave
    );
    return esc.replace(re, (m, com, str, num, fn, kw) => {
      if (com) return '<span class="c-com">' + com + "</span>";
      if (str) return '<span class="c-str">' + str + "</span>";
      if (num) return '<span class="c-num">' + num + "</span>";
      if (fn) return '<span class="c-fn">' + fn + "</span>";
      return '<span class="c-kw">' + kw + "</span>";
    }) + "\n";
  }
  function syncEditor() {
    const ta = $("#code-editor");
    $("#code-highlight").innerHTML = highlight(ta.value);
    ta.style.height = "auto";
  }
  function bindEditor() {
    const ta = $("#code-editor");
    ta.addEventListener("input", syncEditor);
    ta.addEventListener("scroll", () => {
      $("#code-highlight").scrollTop = ta.scrollTop;
      $("#code-highlight").scrollLeft = ta.scrollLeft;
    });
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const s = ta.selectionStart;
        ta.setRangeText("  ", s, ta.selectionEnd, "end");
        syncEditor();
      }
    });
    $("#btn-run").onclick = runCode;
    $("#btn-stop").onclick = () => {
      LabUI.mcuCtrls.forEach((c) => c.stop());
      toast("■ Programa detenido.");
    };
  }
  function serialLine(s) {
    const out = $("#serial-out");
    out.textContent += s;
    while (out.textContent.length > 4000) out.textContent = out.textContent.slice(-3000);
    out.scrollTop = out.scrollHeight;
  }
  function runCode() {
    const code = $("#code-editor").value;
    let mcu = LabUI.sel && LAB_CATALOG[LabUI.sel.type].mcu ? LabUI.sel : LabUI.engine.comps.find((c) => LAB_CATALOG[c.type].mcu);
    if (!mcu) { toast("⚠ Coloca primero un Arduino UNO o un ESP32 en la mesa."); return; }
    let ctrl = LabUI.mcuCtrls.get(mcu.id);
    if (!ctrl) { ctrl = new MCUController(LabUI.engine, mcu); ctrl.serialCb = serialLine; LabUI.mcuCtrls.set(mcu.id, ctrl); }
    try {
      ctrl.load(code);
      toast(`▶ Programa cargado y ejecutándose en ${LAB_CATALOG[mcu.type].name}.`);
    } catch (e) {
      serialLine("❌ Error de compilación: " + e.message + "\n");
      toast("❌ Error de sintaxis en el código. Revisa el monitor serial.");
    }
  }

  /* ================= prácticas guiadas ================= */
  function openProjects(project) {
    const modal = $("#project-modal");
    const content = $("#pm-content");
    modal.classList.remove("hidden");
    if (!project) {
      content.innerHTML = `<h2>📚 Prácticas guiadas de electrónica y robótica</h2>
        <p class="muted">Elige una práctica. Se colocarán los componentes en la mesa <b>sin conectar</b>: tú debes tender los cables siguiendo el diagrama y los pasos.</p>
        <div class="proj-list">${PROJECTS.map((p) => `
          <button class="proj-card" data-p="${p.id}">
            <b>Práctica ${p.n}: ${p.title}</b>
            <span>${p.objective}</span>
          </button>`).join("")}</div>`;
      content.querySelectorAll(".proj-card").forEach((b) => (b.onclick = () => openProjects(PROJECTS.find((p) => p.id === b.dataset.p))));
      return;
    }
    content.innerHTML = `
      <h2>Práctica ${project.n}: ${project.title}</h2>
      <p><b>🎯 Objetivo:</b> ${project.objective}</p>
      <p><b>🧰 Componentes:</b> ${project.comps.map((c) => LAB_CATALOG[c.type].name).join(", ")}</p>
      <h3>🔌 Diagrama de conexiones</h3>
      <div class="pm-preview"><div class="pm-world" id="pm-world"></div></div>
      <div class="pm-cols">
        <div>
          <h3>📋 Pasos</h3>
          <ol class="pm-steps">${project.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
          <h3>💡 Funcionamiento</h3>
          <p>${project.explanation}</p>
        </div>
        <div>
          <h3>💻 Código de ejemplo</h3>
          <pre class="pm-code">${project.code.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>
        </div>
      </div>
      <div class="pm-actions">
        <button class="btn accent" id="pm-load-comps">📥 Colocar componentes en la mesa (sin conectar)</button>
        <button class="btn" id="pm-load-code">📄 Cargar código en el editor</button>
        <button class="btn" id="pm-back">← Volver a la lista</button>
      </div>`;
    renderPreview(project);
    $("#pm-load-comps").onclick = () => {
      const ox = 120, oy = 120;
      for (const pc of project.comps) LabUI.engine.addComp(pc.type, pc.x + ox, pc.y + oy, pc.props);
      LabUI.engine.masterPower = true;
      $("#btn-power").textContent = "⏻ Alimentación: ON";
      $("#btn-power").classList.add("on");
      renderAllComps(); renderWires();
      $("#project-modal").classList.add("hidden");
      toast(`📥 Componentes de la práctica ${project.n} colocados. ¡Ahora conéctalos con cables siguiendo el diagrama!`);
    };
    $("#pm-load-code").onclick = () => {
      $("#code-editor").value = project.code;
      syncEditor();
      $("#project-modal").classList.add("hidden");
      toast("📄 Código cargado en el editor. Pulsa «▶ Cargar y ejecutar».");
    };
    $("#pm-back").onclick = () => openProjects(null);
  }

  function renderPreview(project) {
    const world = $("#pm-world");
    world.innerHTML = "";
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", 1000); svg.setAttribute("height", 560);
    svg.setAttribute("viewBox", "0 0 1000 560");
    world.appendChild(svg);
    const comps = project.comps.map((pc, i) => ({ id: i + 1, type: pc.type, x: pc.x, y: pc.y, rot: 0 }));
    for (const c of comps) {
      const def = LAB_CATALOG[c.type];
      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("transform", `translate(${c.x},${c.y}) scale(${S / 240})`);
      g.innerHTML = `<image href="${def.img}" width="240" height="240"></image>`;
      for (const p of def.pins) {
        const dot = document.createElementNS(svgNS, "circle");
        dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y); dot.setAttribute("r", 7);
        dot.setAttribute("class", "pin pv" + (p.gnd ? " gnd" : p.vcc ? " vcc" : ""));
        const lbl = document.createElementNS(svgNS, "text");
        lbl.setAttribute("x", p.x + 9); lbl.setAttribute("y", p.y + 4);
        lbl.setAttribute("class", "pin-lbl");
        lbl.textContent = p.name;
        g.appendChild(dot); g.appendChild(lbl);
      }
      svg.appendChild(g);
    }
    for (const [ia, pa, ib, pb] of project.wires) {
      const p1 = pinWorldOf(comps[ia], pa, S), p2 = pinWorldOf(comps[ib], pb, S);
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", `M ${p1.x} ${p1.y} C ${p1.x} ${p1.y + 40}, ${p2.x} ${p2.y + 40}, ${p2.x} ${p2.y}`);
      path.setAttribute("class", "wire pv-wire");
      const aDef = LAB_CATALOG[comps[ia].type].pins.find((p) => p.id === pa);
      path.setAttribute("stroke", aDef && aDef.vcc ? "#ef4444" : aDef && aDef.gnd ? "#0b1120" : "#eab308");
      svg.appendChild(path);
    }
  }

  /* ================= bucle principal ================= */
  function tick() {
    if (!LabUI.open) return;
    LabUI.mcuCtrls.forEach((ctrl, id) => {
      const c = LabUI.engine.compById(id);
      if (!c) { LabUI.mcuCtrls.delete(id); return; }
      if (ctrl.running) ctrl.tick();
    });
    LabUI.engine.tick(0.1);
    for (const c of LabUI.engine.comps) updateVisual(c);
    renderMessages();
    updateAudio();
  }

  /* ================= init / open ================= */
  LabUI.init = function () {
    if (this.inited) return;
    this.inited = true;
    this.engine = new Circuit();
    // selección de texto desactivada mientras el laboratorio esté abierto
    document.addEventListener("selectstart", (e) => { if (LabUI.open) e.preventDefault(); });
    buildPalette();
    bindCanvas();
    bindToolbar();
    bindEditor();
    $("#code-editor").value = PROJECTS[1].code; // proyecto 2 por defecto
    syncEditor();
    $("#pm-close").onclick = () => $("#project-modal").classList.add("hidden");
    $("#project-modal").addEventListener("click", (e) => { if (e.target.id === "project-modal") e.target.classList.add("hidden"); });
    applyTransform();
    setInterval(tick, 100);
  };

  LabUI.openView = function () {
    this.init();
    this.open = true;
    renderAllComps();
    renderWires();
    renderProps();
    renderMessages();
  };
  LabUI.closeView = function () {
    this.open = false;
    this.mcuCtrls.forEach((c) => c.stop());
    $("#project-modal").classList.add("hidden");
  };

  window.LabUI = LabUI;
})();
