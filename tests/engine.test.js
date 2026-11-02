/* Pruebas del motor de simulación del laboratorio virtual (Node.js)
   Ejecutar: node tests/engine.test.js */
require("../js/lab/catalog.js");
const { Circuit } = require("../js/lab/engine.js");

function approx(a, b, tol) { return Math.abs(a - b) <= tol; }
let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log("  ✓", name); }
  else { fail++; console.log("  ✗ FALLO:", name); }
}
const W = (c, a, pa, b, pb, col) => c.addWire({ comp: a, pin: pa }, { comp: b, pin: pb }, col);

// T1: Ley de Ohm — 220Ω a 5V ≈ 22,7 mA
{
  const c = new Circuit(); c.masterPower = true;
  const f = c.addComp("fuente", 0, 0, { volt: 5, on: true });
  const r = c.addComp("resistencia", 0, 0, { R: 220 });
  W(c, f.id, "plus", r.id, "a"); W(c, r.id, "b", f.id, "minus");
  for (let i = 0; i < 3; i++) c.tick(0.1);
  console.log("T1 I =", (r.state.read.I * 1000).toFixed(2), "mA");
  check("T1 220Ω@5V ≈ 22,7 mA", approx(r.state.read.I * 1000, 22.7, 0.3));
  check("T1 V ≈ 5 V", approx(r.state.read.V, 5, 0.05));
  check("T1 P ≈ 113 mW", approx(r.state.read.P * 1000, 113, 3));
}

// T2: LED + 220Ω a 5V → enciende a ~13 mA
{
  const c = new Circuit(); c.masterPower = true;
  const f = c.addComp("fuente", 0, 0, { volt: 5, on: true });
  const r = c.addComp("resistencia", 0, 0, { R: 220 });
  const led = c.addComp("led", 0, 0);
  W(c, f.id, "plus", r.id, "a"); W(c, r.id, "b", led.id, "anodo"); W(c, led.id, "catodo", f.id, "minus");
  for (let i = 0; i < 6; i++) c.tick(0.1);
  console.log("T2 LED on =", led.state.ledOn, "I =", (led.state.ledI * 1000).toFixed(2), "mA, brillo =", led.state.brightness.toFixed(2));
  check("T2 LED enciende con I ≈ 13 mA", led.state.ledOn === true && approx(led.state.ledI * 1000, 13.1, 0.8));
  check("T2 brillo > 0,5", led.state.brightness > 0.5);
  check("T2 no se quema con 220 Ω", !led.state.burnt);
}

// T3: LED invertido → no enciende + aviso
{
  const c = new Circuit(); c.masterPower = true;
  const f = c.addComp("fuente", 0, 0, { volt: 5, on: true });
  const r = c.addComp("resistencia", 0, 0, { R: 220 });
  const led = c.addComp("led", 0, 0);
  W(c, f.id, "plus", r.id, "a"); W(c, r.id, "b", led.id, "catodo"); W(c, led.id, "anodo", f.id, "minus");
  for (let i = 0; i < 6; i++) c.tick(0.1);
  check("T3 LED invertido NO enciende", !led.state.ledOn);
  check("T3 aviso de polaridad invertida", c.messages.some((m) => /INVERTIDA/i.test(m.text)));
}

// T4: LED directo a la fuente → sobrecorriente, se quema y avisa
{
  const c = new Circuit(); c.masterPower = true;
  const f = c.addComp("fuente", 0, 0, { volt: 5, on: true });
  const led = c.addComp("led", 0, 0);
  W(c, f.id, "plus", led.id, "anodo"); W(c, led.id, "catodo", f.id, "minus");
  for (let i = 0; i < 20; i++) c.tick(0.1);
  check("T4 LED sin resistencia se quema", led.state.burnt === true);
  check("T4 aviso de exceso de corriente", c.messages.some((m) => /mA|limitadora/i.test(m.text)));
}

// T5: potenciómetro como divisor de tensión
{
  const c = new Circuit(); c.masterPower = true;
  const f = c.addComp("fuente", 0, 0, { volt: 5, on: true });
  const p = c.addComp("potenciometro", 0, 0, { alpha: 0.5 });
  W(c, f.id, "plus", p.id, "a"); W(c, p.id, "b", f.id, "minus");
  for (let i = 0; i < 3; i++) c.tick(0.1);
  console.log("T5 Vw(50%) =", p.state.read.Vw.toFixed(3), "V");
  check("T5 divisor 50% → 2,5 V", approx(p.state.read.Vw, 2.5, 0.05));
  p.props.alpha = 0.25;
  for (let i = 0; i < 3; i++) c.tick(0.1);
  check("T5 divisor 25% → 1,25 V (Vw = 5·alpha)", approx(p.state.read.Vw, 1.25, 0.08));
}

// T6: cortocircuito de la fuente → aviso
{
  const c = new Circuit(); c.masterPower = true;
  const f = c.addComp("fuente", 0, 0, { volt: 9, on: true });
  W(c, f.id, "plus", f.id, "minus");
  for (let i = 0; i < 3; i++) c.tick(0.1);
  check("T6 aviso de CORTOCIRCUITO", c.messages.some((m) => /CORTOCIRCUITO/i.test(m.text)));
}

// T7: Arduino lee potenciómetro en A0; pines de salida dan 5V / PWM 2,5V
{
  const c = new Circuit(); c.masterPower = true;
  const a = c.addComp("arduino", 0, 0, { usb: true });
  const p = c.addComp("potenciometro", 0, 0, { alpha: 0.5 });
  W(c, a.id, "5V", p.id, "a"); W(c, a.id, "GND", p.id, "b"); W(c, p.id, "w", a.id, "A0");
  for (let i = 0; i < 4; i++) c.tick(0.1);
  const v = c.analogRead(a, "A0");
  console.log("T7 analogRead(A0) =", v, "| 5V pin =", c.vOfNow({ comp: a.id, pin: "5V" }).toFixed(2), "V");
  check("T7 Arduino alimentado por USB", a.state.powered === true);
  check("T7 analogRead(A0) ≈ 512", approx(v, 512, 12));
  a.state.pins = { D9: { mode: "output", val: 1 } };
  for (let i = 0; i < 3; i++) c.tick(0.1);
  check("T7 D9=HIGH ≈ 5 V", approx(c.vOfNow({ comp: a.id, pin: "D9" }), 5, 0.2));
  a.state.pins = { D9: { mode: "output", val: 1, pwm: 128 } };
  for (let i = 0; i < 3; i++) c.tick(0.1);
  check("T7 D9 PWM 50% ≈ 2,5 V", approx(c.vOfNow({ comp: a.id, pin: "D9" }), 2.5, 0.2));
}

// T8: pulseIn del ultrasónico = distancia × 58 µs
{
  const c = new Circuit(); c.masterPower = true;
  const a = c.addComp("arduino", 0, 0, { usb: true });
  const u = c.addComp("ultrasonico", 0, 0, { distancia: 50 });
  W(c, a.id, "5V", u.id, "vcc"); W(c, a.id, "GND", u.id, "gnd"); W(c, a.id, "D6", u.id, "echo");
  for (let i = 0; i < 3; i++) c.tick(0.1);
  check("T8 pulseIn @50 cm = 2900 µs", c.pulseIn(a, "D6") === 2900);
}

// T9: multímetro (A en serie, V en paralelo, Ω sin alimentación), motor, servo
{
  const c = new Circuit(); c.masterPower = true;
  const f = c.addComp("fuente", 0, 0, { volt: 6, on: true });
  const m = c.addComp("motor_dc", 0, 0);
  const mm = c.addComp("multimetro", 0, 0, { mode: "A" });
  W(c, f.id, "plus", m.id, "plus");
  W(c, m.id, "minus", mm.id, "a");
  W(c, mm.id, "com", f.id, "minus");
  for (let i = 0; i < 3; i++) c.tick(0.1);
  console.log("T9 amperímetro:", mm.state.read.text);
  check("T9 amperímetro ≈ 750 mA (6V/8Ω)", /7[0-9][0-9]/.test(mm.state.read.text));
  check("T9 motor a 6 V velocidad ≈ 1", approx(m.state.read.speed, 1, 0.1));

  mm.props.mode = "V";
  c.removeWire(c.wires.find((w) => (w.a.comp === mm.id && w.a.pin === "a") || (w.b.comp === mm.id && w.b.pin === "a")).id);
  c.removeWire(c.wires.find((w) => (w.a.comp === mm.id && w.a.pin === "com") || (w.b.comp === mm.id && w.b.pin === "com")).id);
  W(c, m.id, "plus", mm.id, "vom"); W(c, mm.id, "com", f.id, "minus");
  for (let i = 0; i < 3; i++) c.tick(0.1);
  check("T9 voltímetro ≈ 6 V", approx(parseFloat(mm.state.read.text), 6, 0.3));

  // ohmímetro: circuito sin alimentación, medir una resistencia de 1 kΩ
  mm.props.mode = "Ω";
  c.removeComp(f.id);
  const r2 = c.addComp("resistencia", 0, 0, { R: 1000 });
  c.wires.slice().forEach((w) => { if (w.a.comp === m.id || w.b.comp === m.id) c.removeWire(w.id); });
  W(c, r2.id, "a", mm.id, "vom"); W(c, r2.id, "b", mm.id, "com");
  for (let i = 0; i < 3; i++) c.tick(0.1);
  console.log("T9 ohmímetro lee:", mm.state.read.text);
  check("T9 ohmímetro ≈ 1000 Ω", approx(parseFloat(mm.state.read.text), 1000, 60));

  // servo controlado por Servo.write
  const a = c.addComp("arduino", 0, 0, { usb: true });
  const s = c.addComp("servo", 0, 0);
  W(c, a.id, "5V", s.id, "vcc"); W(c, a.id, "GND", s.id, "gnd"); W(c, a.id, "D9", s.id, "sig");
  for (let i = 0; i < 3; i++) c.tick(0.1);
  c.servoWrite(a, "D9", 120);
  check("T9 servo angle = 120°", s.state.angle === 120);
}

// T10: relé, buzzer con tone(), LCD
{
  const c = new Circuit(); c.masterPower = true;
  const a = c.addComp("arduino", 0, 0, { usb: true });
  const rel = c.addComp("rele", 0, 0);
  W(c, a.id, "5V", rel.id, "vcc"); W(c, a.id, "GND", rel.id, "gnd"); W(c, a.id, "D4", rel.id, "in");
  for (let i = 0; i < 3; i++) c.tick(0.1);
  check("T10 relé sin señal: COM→NC", rel.state.relayClosed === false);
  a.state.pins = { D4: { mode: "output", val: 1 } };
  for (let i = 0; i < 4; i++) c.tick(0.1);
  check("T10 relé con D4=HIGH: COM→NO cerrado", rel.state.relayClosed === true);

  const bz = c.addComp("buzzer", 0, 0);
  W(c, a.id, "D8", bz.id, "plus"); W(c, a.id, "GND", bz.id, "minus");
  a.state.pins.D8 = { mode: "output", val: 1, tone: { f: 880, until: 1e12 } };
  for (let i = 0; i < 3; i++) c.tick(0.1);
  console.log("T10 buzzer sonando:", bz.state.sounding, "a", bz.state.freq, "Hz");
  check("T10 buzzer suena a 880 Hz con tone()", bz.state.sounding && bz.state.freq === 880);

  const lcd = c.addComp("lcd", 0, 0);
  for (let i = 0; i < 2; i++) c.tick(0.1);
  check("T10 LCD sin alimentación → aviso", c.messages.some((m) => /LCD no recibe/i.test(m.text)));
  W(c, a.id, "5V", lcd.id, "VDD"); W(c, a.id, "GND", lcd.id, "VSS");
  W(c, a.id, "D12", lcd.id, "RS"); W(c, a.id, "D11", lcd.id, "E");
  for (let i = 0; i < 3; i++) c.tick(0.1);
  check("T10 LCD alimentada → encendida", lcd.state.powered === true);
  c.lcdPrint(a, "D12", "D11", "HOLA MUNDO", [0, 0]);
  check("T10 LCD muestra «HOLA MUNDO»", (lcd.state.lines[0] || "").indexOf("HOLA MUNDO") === 0);
  check("T10 aviso pines de datos LCD faltantes", c.messages.some((m) => /D4/.test(m.text)));
}

// T11: intérprete Arduino ejecuta código real contra el circuito
{
  const { MCUController } = require("../js/lab/mcu.js");
  const c = new Circuit(); c.masterPower = true;
  const a = c.addComp("arduino", 0, 0, { usb: true });
  const p = c.addComp("potenciometro", 0, 0, { alpha: 0.8 });
  const r = c.addComp("resistencia", 0, 0, { R: 220 });
  const led = c.addComp("led", 0, 0);
  W(c, a.id, "5V", p.id, "a"); W(c, a.id, "GND", p.id, "b"); W(c, p.id, "w", a.id, "A0");
  W(c, a.id, "D9", r.id, "a"); W(c, r.id, "b", led.id, "anodo"); W(c, led.id, "catodo", a.id, "GND");
  for (let i = 0; i < 3; i++) c.tick(0.1);
  const ctrl = new MCUController(c, a);
  let serial = "";
  ctrl.serialCb = (s) => (serial += s);
  ctrl.load(`
    int pot = A0; int ledPin = 9;
    void setup() { pinMode(ledPin, OUTPUT); Serial.begin(9600); Serial.println("listo"); }
    void loop() { int v = analogRead(pot); analogWrite(ledPin, map(v, 0, 1023, 0, 255)); Serial.println(v); delay(10); }
  `);
  check("T11 programa carga y ejecuta setup", ctrl.running === true && serial.indexOf("listo") >= 0);
  for (let i = 0; i < 5; i++) { ctrl.tick(); c.tick(0.1); }
  console.log("T11 serial:", JSON.stringify(serial.slice(0, 60)), "| A0 leído ≈", c.analogRead(a, "A0"), "| LED I =", (led.state.ledI * 1000).toFixed(1), "mA");
  check("T11 analogRead ≈ 819 (80%)", approx(c.analogRead(a, "A0"), 819, 15));
  check("T11 el LED está encendido por el programa (PWM)", led.state.ledOn === true && led.state.ledI > 0.005);
  check("T11 serial imprime lecturas", /8\d\d/.test(serial));
}

// T12: pines GND de un mismo componente son el mismo nodo; la fuente interna del MCU retorna a su GND
{
  const c = new Circuit(); c.masterPower = true;
  const a = c.addComp("arduino", 0, 0, { usb: true });
  const m = c.addComp("multimetro", 0, 0, { mode: "V" });
  W(c, m.id, "vom", a.id, "5V"); W(c, m.id, "com", a.id, "GND2"); // sonda negra en el SEGUNDO GND
  for (let i = 0; i < 3; i++) c.tick(0.1);
  console.log("T12 5V↔GND2 =", JSON.stringify(m.state.read));
  check("T12 5V↔GND2 = 5 V (GND y GND2 unidos internamente)", approx(parseFloat(m.state.read.text), 5, 0.05));
  W(c, m.id, "com", a.id, "GND");
  for (let i = 0; i < 3; i++) c.tick(0.1);
  check("T12 5V↔GND = 5 V", approx(parseFloat(m.state.read.text), 5, 0.05));
  check("T12 Arduino alimentado por USB (powered)", a.state.powered === true);
  c.masterPower = false;
  for (let i = 0; i < 3; i++) c.tick(0.1);
  check("T12 con alimentación general OFF el MCU no da tensión", a.state.powered === false && approx(parseFloat(m.state.read.text), 0, 0.05));
}

// T13: LED con cátodo en GND2 del Arduino alimentado por VIN (camino de retorno por GND interno)
{
  const c = new Circuit(); c.masterPower = true;
  const f = c.addComp("fuente", 0, 0, { volt: 5, on: true });
  const a = c.addComp("arduino", 0, 0, { usb: false });
  const r = c.addComp("resistencia", 0, 0, { R: 220 });
  const led = c.addComp("led", 0, 0);
  W(c, f.id, "plus", a.id, "VIN"); W(c, f.id, "minus", a.id, "GND");
  W(c, a.id, "D9", r.id, "a"); W(c, r.id, "b", led.id, "anodo"); W(c, led.id, "catodo", a.id, "GND2");
  a.state.pins = a.state.pins || {}; a.state.pins["D9"] = { mode: "output", val: 1 };
  for (let i = 0; i < 3; i++) c.tick(0.1);
  console.log("T13 LED I =", (led.state.ledI * 1000).toFixed(1), "mA | powered =", a.state.powered);
  check("T13 Arduino alimentado por VIN (powered)", a.state.powered === true);
  check("T13 LED enciende con cátodo en GND2 (I ≈ 13 mA)", led.state.ledOn === true && approx(led.state.ledI * 1000, 13.1, 1.5));
}

console.log(`\n==== RESULTADO: ${pass} pasados, ${fail} fallados ====`);
process.exit(fail ? 1 : 0);
