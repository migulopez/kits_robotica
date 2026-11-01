/* ============================================================
   Laboratorio virtual — intérprete controlado de Arduino
   ------------------------------------------------------------
   Ejecuta código Arduino/ESP32 dentro de una sandbox con la API
   estándar (pinMode, digitalWrite, analogRead, analogWrite,
   tone, pulseIn, delay, millis, Serial, Servo, LiquidCrystal,
   DHT, IRrecv). Las escrituras en pines se traducen a fuentes de
   voltaje en el motor MNA; las lecturas consultan los nodos reales
   del circuito, así que el programa SOLO funciona si el cableado
   es correcto.
   ============================================================ */
(function (global) {
  "use strict";

  class MCUController {
    constructor(engine, comp) {
      this.engine = engine;
      this.comp = comp;
      this.running = false;
      this.prog = null;
      this.serialCb = null;
      this.errorShown = false;
    }

    norm(p) {
      if (typeof p === "string") return p;
      if (p >= 14 && p <= 19) return "A" + (p - 14);
      return "D" + p;
    }

    // Transpilación mínima Arduino (C++) → JavaScript para poder ejecutar
    // el código del usuario con new Function: elimina tipos en declaraciones,
    // convierte «void setup()» en función y traduce #include/#define.
    static transpile(code) {
      let c = code;
      c = c.replace(/^[ \t]*#include[^\n]*$/gm, "");
      c = c.replace(/^[ \t]*#define[ \t]+(\w+)[ \t]+(.+)$/gm, "const $1 = $2;");
      c = c.replace(/\b(void|int|long|float|double|boolean|char|byte|word|short|unsigned|String|static)\s+([A-Za-z_]\w*)\s*\(/g, "function $2(");
      for (let i = 0; i < 3; i++)
        c = c.replace(/\b(int|long|float|double|boolean|char|byte|word|short|unsigned|String)\s+([A-Za-z_]\w*)\s*=/g, "let $2 =");
      for (let i = 0; i < 3; i++)
        c = c.replace(/\b(int|long|float|double|boolean|char|byte|word|short|unsigned|String)\s+([A-Za-z_]\w*)\s*;/g, "let $2;");
      return c;
    }

    load(code) {
      const eng = this.engine, comp = this.comp, self = this;
      const pins = () => (comp.state.pins = comp.state.pins || {});
      const setPin = (p, st) => { pins()[this.norm(p)] = Object.assign(pins()[this.norm(p)] || {}, st); };

      const api = {
        pinMode: (p, m) => setPin(p, { mode: m === 1 ? "output" : m === 2 ? "input_pullup" : "input", val: 0 }),
        digitalWrite: (p, v) => setPin(p, { mode: "output", val: v ? 1 : 0, pwm: null, tone: null }),
        digitalRead: (p) => eng.digitalReadRaw(comp, self.norm(p)),
        analogWrite: (p, d) => setPin(p, { mode: "output", val: 1, pwm: Math.max(0, Math.min(255, d | 0)) }),
        analogRead: (p) => eng.analogRead(comp, self.norm(p)),
        tone: (p, f, d) => setPin(p, { mode: "output", val: 1, pwm: null, tone: { f: +f || 1000, until: eng.wtime + (d || 1e12) } }),
        noTone: (p) => { const s = pins()[self.norm(p)]; if (s) s.tone = null; },
        pulseIn: (p) => eng.pulseIn(comp, self.norm(p)),
        delay: () => {},
        delayMicroseconds: () => {},
        millis: () => eng.wtime,
        micros: () => eng.wtime * 1000,
        map: (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c,
        constrain: (x, a, b) => Math.max(a, Math.min(b, x)),
        abs: Math.abs, min: Math.min, max: Math.max, pow: Math.pow, sqrt: Math.sqrt,
        random: (a, b) => (b == null ? Math.floor(Math.random() * a) : a + Math.floor(Math.random() * (b - a))),
        randomSeed: () => {},
        Serial: {
          begin: () => {},
          print: (...a) => self.serialCb && self.serialCb(a.join("")),
          println: (...a) => self.serialCb && self.serialCb(a.join("") + "\n")
        },
        Servo: class {
          constructor() { this.pin = null; }
          attach(p) { this.pin = self.norm(p); }
          write(a) { eng.servoWrite(comp, this.pin, +a); }
          writeMicroseconds(us) { eng.servoWrite(comp, this.pin, ((+us - 1000) / 1000) * 180); }
        },
        LiquidCrystal: class {
          constructor(...p) { this.p = p.map((x) => self.norm(x)); this.cur = [0, 0]; }
          begin() {}
          setCursor(c, r) { this.cur = [c, r]; }
          clear() { eng.lcdClear(comp, this.p[0], this.p[1]); }
          print(s) { eng.lcdPrint(comp, this.p[0], this.p[1], String(s), this.cur); }
        },
        DHT: class {
          constructor(p) { this.pin = self.norm(p); }
          begin() {}
          readTemperature() { return eng.dhtRead(comp, this.pin, "temp"); }
          readHumidity() { return eng.dhtRead(comp, this.pin, "hum"); }
        },
        IRrecv: class {
          constructor(p) { this.pin = self.norm(p); this.results = { value: 0 }; }
          enableIRIn() {}
          decode() {
            const v = eng.irDecode(comp, this.pin);
            if (v) { this.results.value = v; return true; }
            return false;
          }
        }
      };

      const consts = {
        HIGH: 1, LOW: 0, OUTPUT: 1, INPUT: 0, INPUT_PULLUP: 2,
        A0: 14, A1: 15, A2: 16, A3: 17, A4: 18, A5: 19,
        DHT11: 11, LED_BUILTIN: 13, CHANGE: 1, RISING: 3, FALLING: 2, true: 1, false: 0
      };
      // quitar claves que no son identificadores válidos como const (true/false)
      delete consts.true; delete consts.false;

      const names = Object.keys(api);
      const cnames = Object.keys(consts);
      const fn = new Function(
        ...names, ...cnames,
        MCUController.transpile(code) + "\n;return { setup: (typeof setup === 'function') ? setup : function(){}, loop: (typeof loop === 'function') ? loop : function(){} };"
      );
      const prog = fn(...names.map((n) => api[n]), ...cnames.map((k) => consts[k]));
      this.prog = prog;
      this.errorShown = false;
      prog.setup();
      this.running = true;
    }

    tick() {
      if (!this.running || !this.prog) return;
      try {
        this.prog.loop();
      } catch (e) {
        this.running = false;
        if (this.serialCb) this.serialCb("❌ Error en loop(): " + e.message + "\n");
      }
    }

    stop() { this.running = false; }
  }

  global.MCUController = MCUController;
  if (typeof module !== "undefined" && module.exports) module.exports = { MCUController };
})(typeof window !== "undefined" ? window : globalThis);
