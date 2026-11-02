/* ============================================================
   Laboratorio virtual — catálogo de componentes colocables
   ------------------------------------------------------------
   Cada tipo define: categoría, kits donde aparece, ilustración,
   pines (en el sistema de coordenadas 240x240 del SVG) y
   propiedades por defecto que el usuario puede modificar.
   ============================================================ */
(function (global) {
  "use strict";

  const P = (id, name, x, y, extra) => Object.assign({ id, name, x, y }, extra || {});

  global.LAB_CATEGORIES = [
    { id: "alimentacion", name: "🔌 Alimentación" },
    { id: "pasivos", name: "🧱 Componentes pasivos" },
    { id: "indicadores", name: "💡 Indicadores" },
    { id: "controladores", name: "🧠 Controladores" },
    { id: "sensores", name: "📡 Sensores" },
    { id: "actuadores", name: "⚙️ Actuadores" },
    { id: "modulos", name: "🧩 Módulos" },
    { id: "visualizacion", name: "🖥 Visualización" },
    { id: "instrumentos", name: "🧰 Instrumentos" }
  ];

  // Pines del Arduino UNO sobre arduino_uno.svg (espacio 240x240) — bien separados
  const arduinoPins = [];
  for (let i = 0; i <= 7; i++) arduinoPins.push(P("D" + i, "D" + i + (i === 3 || i === 5 || i === 6 ? "~" : ""), 92 + i * 13, 46));
  for (let i = 8; i <= 13; i++) arduinoPins.push(P("D" + i, "D" + i + (i === 9 || i === 10 || i === 11 ? "~" : ""), 189, 84 + (i - 8) * 16));
  const bottom = [
    ["A0", "A0", 60], ["A1", "A1", 71], ["A2", "A2", 82], ["A3", "A3", 93],
    ["A4", "A4", 104], ["A5", "A5", 115], ["5V", "5V", 126], ["3V3", "3V3", 137],
    ["GND", "GND", 148], ["GND2", "GND", 159], ["VIN", "VIN", 170]
  ];
  bottom.forEach(([id, name, x]) =>
    arduinoPins.push(P(id, name, x, 196, id.indexOf("GND") === 0 ? { gnd: true } : { vcc: true }))
  );

  // Pines del ESP32 sobre esp32.svg (espacio 240x240) — bien separados
  const esp32Pins = [];
  const left = ["3V3", "EN", "D36", "D39", "D34", "D35", "D32", "D33", "D25", "D26", "D27", "D14", "D12", "D13", "GND"];
  left.forEach((n, i) =>
    esp32Pins.push(P(n, n, 70, 50 + i * 11, n === "GND" ? { gnd: true } : n === "3V3" ? { vcc: true } : {}))
  );
  const right = ["5V", "D23", "D22", "TX0", "RX0", "D21", "D19", "D18", "D5", "D17", "D16", "D4", "D0", "D2"];
  right.forEach((n, i) =>
    esp32Pins.push(P(n, n, 170, 50 + i * 11, n === "5V" ? { vcc: true } : {}))
  );

  // Pines del LCD 16x2 sobre lcd1602.svg — bien separados
  const lcdPins = [];
  ["VSS", "VDD", "VO", "RS", "RW", "E", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "A", "K"].forEach((n, i) =>
    lcdPins.push(P(n, n, 38 + i * 11, 66, n === "VSS" || n === "K" ? { gnd: true } : n === "VDD" || n === "A" ? { vcc: true } : {}))
  );

  global.LAB_CATALOG = {
    /* ---------- Alimentación ---------- */
    fuente: {
      name: "Fuente regulable 0–12 V", cat: "alimentacion", kits: [1, 2, 3],
      img: "assets/images/components/fuente.svg",
      pins: [P("plus", "+", 60, 186, { vcc: true }), P("minus", "−", 180, 186, { gnd: true })],
      props: { volt: 5, on: true },
      display: { x: 52, y: 82, w: 86, h: 48 },
      hint: "Ajusta el voltaje con el deslizador del panel de propiedades."
    },
    pila9v: {
      name: "Pila 9 V", cat: "alimentacion", kits: [1, 2, 3],
      img: "assets/images/components/pila9v.svg",
      pins: [P("plus", "+", 106, 42, { vcc: true }), P("minus", "−", 134, 42, { gnd: true })],
      props: { on: true }
    },
    adaptador: {
      name: "Adaptador de corriente 12 V", cat: "alimentacion", kits: [2],
      img: "assets/images/components/adaptador.svg",
      pins: [P("plus", "+ (centro)", 218, 170, { vcc: true }), P("minus", "−", 206, 182, { gnd: true })],
      props: { on: true }
    },

    /* ---------- Pasivos ---------- */
    resistencia: {
      name: "Resistencia", cat: "pasivos", kits: [1, 3],
      img: "assets/images/components/resistencia_unica.svg",
      pins: [P("a", "Terminal A", 14, 120), P("b", "Terminal B", 226, 120)],
      props: { R: 220 }
    },
    potenciometro: {
      name: "Potenciómetro 10 kΩ", cat: "pasivos", kits: [1],
      img: "assets/images/components/potenciometro.svg",
      pins: [P("a", "A", 88, 190), P("w", "Cursor W", 120, 192), P("b", "B", 153, 190)],
      props: { R: 10000, alpha: 0.5 },
      knob: { x: 120, y: 44, r: 28 }
    },

    /* ---------- Indicadores ---------- */
    led: {
      name: "LED", cat: "indicadores", kits: [1],
      img: "assets/images/components/led_unico.svg",
      pins: [P("anodo", "Ánodo (+)", 105, 214, { vcc: true }), P("catodo", "Cátodo (−)", 135, 198, { gnd: true })],
      glow: { x: 120, y: 118, r: 42 }
    },
    buzzer: {
      name: "Buzzer", cat: "indicadores", kits: [3],
      img: "assets/images/components/buzzer.svg",
      pins: [P("plus", "+", 104, 196, { vcc: true }), P("minus", "−", 135, 190, { gnd: true })],
      buzzOv: { x: 120, y: 90, r: 20 }
    },

    /* ---------- Controladores ---------- */
    arduino: {
      name: "Arduino UNO", cat: "controladores", kits: [1, 2],
      img: "assets/images/components/arduino_uno.svg",
      mcu: true, vcc: 5, pins: arduinoPins,
      size: 220, pinSize: 10,
      props: { usb: true }
    },
    esp32: {
      name: "ESP32 DevKit (CH340)", cat: "controladores", kits: [3],
      img: "assets/images/components/esp32.svg",
      mcu: true, vcc: 3.3, pins: esp32Pins,
      size: 220, pinSize: 10,
      props: { usb: true }
    },

    /* ---------- Sensores ---------- */
    ultrasonico: {
      name: "Sensor ultrasónico HC-SR04", cat: "sensores", kits: [1, 2, 3],
      img: "assets/images/components/ultrasonico.svg",
      pins: [P("vcc", "VCC", 58, 182, { vcc: true }), P("gnd", "GND", 88, 182, { gnd: true }),
             P("trig", "Trig", 144, 182), P("echo", "Echo", 174, 182)],
      props: { distancia: 30 },
      badge: "distancia"
    },
    dht11: {
      name: "Sensor DHT11 (temp/humedad)", cat: "sensores", kits: [3],
      img: "assets/images/components/dht11.svg",
      pins: [P("vcc", "VCC", 100, 190, { vcc: true }), P("data", "DATA", 120, 192), P("gnd", "GND", 140, 190, { gnd: true })],
      props: { temp: 25, humedad: 60 }
    },
    ldr: {
      name: "Módulo LDR (sensor de luz)", cat: "sensores", kits: [3],
      img: "assets/images/components/ldr.svg",
      pins: [P("vcc", "VCC", 84, 182, { vcc: true }), P("ao", "AO", 116, 182), P("gnd", "GND", 148, 182, { gnd: true })],
      props: { luz: 0.7 }
    },
    hcsr501: {
      name: "Sensor de presencia HC-SR501", cat: "sensores", kits: [3],
      img: "assets/images/components/hcsr501.svg",
      pins: [P("vcc", "VCC", 104, 190, { vcc: true }), P("out", "OUT", 120, 192), P("gnd", "GND", 136, 190, { gnd: true })],
      props: { motion: false }
    },
    linea: {
      name: "Sensor de línea IR (TCRT5000)", cat: "sensores", kits: [1, 2],
      img: "assets/images/components/linea.svg",
      pins: [P("vcc", "VCC", 96, 182, { vcc: true }), P("out", "OUT", 120, 184), P("gnd", "GND", 144, 182, { gnd: true })],
      props: { linea: false }
    },
    irobstaculo: {
      name: "Sensor IR de obstáculos", cat: "sensores", kits: [2],
      img: "assets/images/components/linea.svg",
      pins: [P("vcc", "VCC", 96, 182, { vcc: true }), P("out", "OUT", 120, 184), P("gnd", "GND", 144, 182, { gnd: true })],
      props: { obstaculo: false }
    },
    aplausos: {
      name: "Módulo de aplausos LM393", cat: "sensores", kits: [1, 3],
      img: "assets/images/components/aplausos.svg",
      pins: [P("vcc", "VCC", 80, 177, { vcc: true }), P("gnd", "GND", 108, 177, { gnd: true }),
             P("out", "DO", 140, 177), P("ao", "AO", 164, 177)],
      props: {},
      clap: true
    },
    ir: {
      name: "Receptor IR + control remoto", cat: "sensores", kits: [2],
      img: "assets/images/components/ir_control.svg",
      pins: [P("vcc", "VCC", 166, 181, { vcc: true }), P("out", "OUT", 182, 183), P("gnd", "GND", 198, 181, { gnd: true })],
      props: {},
      remote: true
    },

    /* ---------- Actuadores ---------- */
    motor_dc: {
      name: "Motor DC", cat: "actuadores", kits: [1],
      img: "assets/images/components/motor_dc.svg",
      pins: [P("plus", "+", 89, 182, { vcc: true }), P("minus", "−", 147, 182, { gnd: true })],
      rotor: { x: 118, y: 58, r: 10 }
    },
    motorreductor: {
      name: "Motorreductor TT", cat: "actuadores", kits: [1, 2],
      img: "assets/images/components/motorreductor.svg",
      pins: [P("plus", "+", 97, 182, { vcc: true }), P("minus", "−", 143, 182, { gnd: true })],
      rotor: { x: 38, y: 127, r: 10 }
    },
    servo: {
      name: "Servomotor", cat: "actuadores", kits: [1, 2, 3],
      img: "assets/images/components/servo.svg",
      pins: [P("gnd", "GND", 214, 204, { gnd: true }), P("vcc", "VCC", 222, 192, { vcc: true }), P("sig", "Señal", 226, 178)],
      horn: { x: 120, y: 80 }
    },

    /* ---------- Módulos ---------- */
    rele: {
      name: "Módulo relé 1 canal", cat: "modulos", kits: [3],
      img: "assets/images/components/rele.svg",
      pins: [P("in", "IN", 76, 186), P("vcc", "VCC", 108, 186, { vcc: true }), P("gnd", "GND", 140, 186, { gnd: true }),
             P("no", "NO", 159, 100), P("com", "COM", 159, 118), P("nc", "NC", 159, 136)],
      rled: { x: 116, y: 159, r: 6 }
    },
    l298n: {
      name: "Driver de motores L298N", cat: "modulos", kits: [1],
      img: "assets/images/components/l298n.svg",
      pins: [P("vs", "+V", 50, 179, { vcc: true }), P("gnd", "GND", 70, 179, { gnd: true }),
             P("ena", "ENA~", 90, 179), P("in1", "IN1", 110, 179), P("in2", "IN2", 130, 179),
             P("in3", "IN3", 150, 179), P("in4", "IN4", 170, 179), P("enb", "ENB~", 190, 179),
             P("out1", "OUT1", 53, 103), P("out2", "OUT2", 53, 137),
             P("out3", "OUT3", 187, 103), P("out4", "OUT4", 187, 137)]
    },
    l293d: {
      name: "Shield de motores L293D", cat: "modulos", kits: [2],
      img: "assets/images/components/l293d_shield.svg",
      pins: [P("vcc", "5V", 60, 166, { vcc: true }), P("gnd", "GND", 76, 166, { gnd: true }),
             P("d3", "D3", 92, 166), P("d5", "D5", 108, 166), P("d6", "D6~", 124, 166),
             P("d9", "D9~", 140, 166), P("d10", "D10~", 156, 166), P("d11", "D11~", 172, 166),
             P("m1", "M1", 66, 62), P("m2", "M2", 102, 62), P("m3", "M3", 138, 62), P("m4", "M4", 174, 62)]
    },

    /* ---------- Visualización ---------- */
    lcd: {
      name: "Pantalla LCD 16x2", cat: "visualizacion", kits: [3],
      img: "assets/images/components/lcd1602.svg",
      pins: lcdPins,
      size: 230, pinSize: 10, labels: true,
      screen: { x: 42, y: 86, w: 156, h: 72 }
    },

    /* ---------- Instrumentos ---------- */
    multimetro: {
      name: "Multímetro digital", cat: "instrumentos", kits: [1, 2, 3],
      img: "assets/images/components/multimetro.svg",
      pins: [P("com", "COM (negra)", 76, 188, { gnd: true }), P("vom", "VΩ (roja)", 120, 188, { vcc: true }), P("a", "A", 164, 188)],
      props: { mode: "V" },
      display: { x: 70, y: 56, w: 100, h: 46 }
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { LAB_CATALOG: global.LAB_CATALOG, LAB_CATEGORIES: global.LAB_CATEGORIES };
  }
})(typeof window !== "undefined" ? window : globalThis);
