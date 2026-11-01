/* ============================================================
   Laboratorio virtual — prácticas guiadas (proyectos)
   ------------------------------------------------------------
   Cada proyecto define: componentes con posición para el diagrama,
   cables del diagrama (índices de componente + pin), objetivo,
   pasos, explicación y código Arduino de ejemplo.
   En el modo guiado los componentes se COLOCAN en la mesa pero NO
   se conectan solos: el estudiante debe tender los cables.
   ============================================================ */
(function (global) {
  "use strict";

  global.PROJECTS = [
    {
      id: "p1",
      n: 1,
      title: "Encendido de un LED con resistencia",
      objective: "Aprender a limitar la corriente de un LED con una resistencia usando la Ley de Ohm (V = I × R) y comprobar los valores con el multímetro.",
      comps: [
        { type: "fuente", x: 60, y: 60, props: { volt: 5, on: true } },
        { type: "resistencia", x: 380, y: 60, props: { R: 220 } },
        { type: "led", x: 700, y: 60 },
        { type: "multimetro", x: 380, y: 330, props: { mode: "V" } }
      ],
      // [compA, pinA, compB, pinB]
      wires: [
        [0, "plus", 1, "a"],
        [1, "b", 2, "anodo"],
        [2, "catodo", 0, "minus"]
      ],
      steps: [
        "Coloca la fuente regulable en 5 V y enciende la alimentación general (⏻).",
        "Conecta el terminal + de la fuente a un extremo de la resistencia (cable rojo).",
        "Conecta el otro extremo de la resistencia al ÁNODO (+) del LED.",
        "Conecta el CÁTODO (−) del LED al terminal − de la fuente (cable negro).",
        "Observa el LED: debe encenderse. Mídelo: corriente ≈ (5 V − 2 V) / 220 Ω ≈ 13,6 mA.",
        "Prueba con el multímetro en modo A (en serie) y en modo V (en paralelo sobre el LED y la resistencia).",
        "Experimento: invierte el LED. Verás el aviso de polaridad invertida y el LED no enciende.",
        "Experimento: quita la resistencia. El sistema advierte que el LED puede dañarse por exceso de corriente."
      ],
      explanation:
        "Un LED necesita unos 2 V para conducir, pero si se conecta directo a 5 V la corriente sería enorme y se quema. " +
        "La resistencia de 220 Ω limita la corriente a unos 13 mA: I = (5 − 2) / 220 ≈ 0,0136 A. Sin LED, una resistencia de 220 Ω a 5 V consumiría 5/220 ≈ 22,7 mA (Ley de Ohm).",
      code:
`// Proyecto 1: LED + resistencia (no requiere código, es un circuito analógico)
// El LED se enciende solo al alimentar el circuito.
// Prueba a medir con el multímetro:
//   - Voltaje en paralelo con la resistencia y con el LED
//   - Corriente en serie (modo A del multímetro)
void setup() {
  Serial.begin(9600);
  Serial.println("Circuito LED + 220 ohm a 5V");
  Serial.println("I esperado = (5 - 2) / 220 = 13.6 mA");
}

void loop() {
}`
    },

    {
      id: "p2",
      n: 2,
      title: "Control de brillo de un LED con potenciómetro (PWM)",
      objective: "Usar una entrada analógica (A0) para leer un potenciómetro y controlar el brillo de un LED con PWM (analogWrite).",
      comps: [
        { type: "arduino", x: 60, y: 40 },
        { type: "potenciometro", x: 60, y: 330 },
        { type: "resistencia", x: 480, y: 120, props: { R: 220 } },
        { type: "led", x: 760, y: 120 }
      ],
      wires: [
        [0, "5V", 1, "a"],
        [0, "GND", 1, "b"],
        [1, "w", 0, "A0"],
        [0, "D9", 2, "a"],
        [2, "b", 3, "anodo"],
        [3, "catodo", 0, "GND"]
      ],
      steps: [
        "Coloca el Arduino UNO (alimentado por USB), el potenciómetro, la resistencia de 220 Ω y el LED.",
        "Alimenta el potenciómetro: A → 5V, B → GND (pines del Arduino).",
        "Conecta el cursor (W) del potenciómetro a la entrada analógica A0.",
        "Conecta el pin D9~ (PWM) a la resistencia de 220 Ω.",
        "Conecta la resistencia al ÁNODO del LED y el CÁTODO a GND.",
        "Carga el código de ejemplo con «▶ Cargar y ejecutar».",
        "Gira el potenciómetro: el brillo del LED debe cambiar suavemente de apagado a máximo."
      ],
      explanation:
        "El potenciómetro funciona como divisor de tensión: el cursor entrega entre 0 y 5 V según su posición. " +
        "analogRead(A0) lo convierte a un valor de 0 a 1023. Con map() se traduce a 0–255 y analogWrite(D9) genera una señal PWM " +
        "cuyo promedio de voltaje controla el brillo del LED. El motor de simulación calcula la corriente real del LED en cada posición.",
      code:
`// Proyecto 2: brillo del LED controlado por potenciómetro
int potenciometro = A0;   // cursor del potenciómetro
int led = 9;              // pin PWM ~9

void setup() {
  pinMode(led, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int valor = analogRead(potenciometro);      // 0..1023
  int brillo = map(valor, 0, 1023, 0, 255);   // 0..255
  analogWrite(led, brillo);                    // PWM
  Serial.print("Potenciometro: ");
  Serial.println(valor);
  delay(50);
}`
    },

    {
      id: "p3",
      n: 3,
      title: "Pantalla LCD 16x2 mostrando «HOLA MUNDO»",
      objective: "Conectar una pantalla LCD 16x2 en modo 4 bits y mostrar un texto con la librería LiquidCrystal.",
      comps: [
        { type: "arduino", x: 60, y: 30 },
        { type: "lcd", x: 470, y: 150 }
      ],
      wires: [
        [0, "5V", 1, "VDD"],
        [0, "GND", 1, "VSS"],
        [0, "GND", 1, "VO"],
        [0, "D12", 1, "RS"],
        [0, "GND", 1, "RW"],
        [0, "D11", 1, "E"],
        [0, "D5", 1, "D4"],
        [0, "D4", 1, "D5"],
        [0, "D3", 1, "D6"],
        [0, "D2", 1, "D7"],
        [0, "5V", 1, "A"],
        [0, "GND", 1, "K"]
      ],
      steps: [
        "Coloca el Arduino UNO y la pantalla LCD 16x2.",
        "Alimenta la LCD: VDD → 5V, VSS → GND, y VO → GND (contraste al máximo).",
        "Conecta RS → D12, RW → GND y E → D11.",
        "Conecta los datos en modo 4 bits: D4→D5, D5→D4, D6→D3, D7→D2 del Arduino.",
        "Retroiluminación: A → 5V y K → GND.",
        "Carga el código y ejecuta: la pantalla debe mostrar «HOLA MUNDO».",
        "Experimento: desconecta VDD. El sistema avisa que la LCD no recibe alimentación."
      ],
      explanation:
        "La LCD 16x2 muestra 2 filas de 16 caracteres. En modo 4 bits solo se usan D4–D7 además de RS (registro), RW (lectura/escritura) y E (enable). " +
        "La simulación comprueba que VDD/VSS estén alimentados y que RS, E y D4–D7 estén cableados al Arduino; solo entonces lcd.print() dibuja el texto en la pantalla virtual.",
      code:
`// Proyecto 3: HOLA MUNDO en LCD 16x2 (modo 4 bits)
#include <LiquidCrystal.h>  // (simulada)

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);  // RS, E, D4, D5, D6, D7

void setup() {
  lcd.begin(16, 2);
  lcd.setCursor(0, 0);
  lcd.print("HOLA MUNDO");
}

void loop() {
}`
    },

    {
      id: "p4",
      n: 4,
      title: "LCD mostrando el valor del potenciómetro en vivo",
      objective: "Leer un potenciómetro con analogRead y mostrar su valor (0–1023) en tiempo real en la LCD.",
      comps: [
        { type: "arduino", x: 60, y: 30 },
        { type: "lcd", x: 500, y: 30 },
        { type: "potenciometro", x: 60, y: 330 }
      ],
      wires: [
        [0, "5V", 1, "VDD"], [0, "GND", 1, "VSS"], [0, "GND", 1, "VO"],
        [0, "D12", 1, "RS"], [0, "GND", 1, "RW"], [0, "D11", 1, "E"],
        [0, "D5", 1, "D4"], [0, "D4", 1, "D5"], [0, "D3", 1, "D6"], [0, "D2", 1, "D7"],
        [0, "5V", 1, "A"], [0, "GND", 1, "K"],
        [0, "5V", 2, "a"], [0, "GND", 2, "b"], [2, "w", 0, "A0"]
      ],
      steps: [
        "Monta la LCD como en el proyecto 3 (alimentación + RS, E, D4–D7).",
        "Añade el potenciómetro: A → 5V, B → GND, cursor W → A0.",
        "Carga y ejecuta el código.",
        "Gira el potenciómetro: la LCD debe mostrar «VALOR: xxx» cambiando en vivo entre 0 y 1023."
      ],
      explanation:
        "El potenciómetro como divisor de tensión entrega en W un voltaje proporcional a su posición. analogRead(A0) lo mide (0–1023). " +
        "El programa imprime ese valor en la segunda fila de la LCD; al girar el mando, el valor cambia dinámicamente en la pantalla simulada.",
      code:
`// Proyecto 4: valor del potenciómetro en la LCD
#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
int potenciometro = A0;

void setup() {
  lcd.begin(16, 2);
  lcd.print("POTENCIOMETRO");
  Serial.begin(9600);
}

void loop() {
  int valor = analogRead(potenciometro);
  lcd.setCursor(0, 1);
  lcd.print("VALOR: ");
  lcd.print(valor);
  lcd.print("    ");           // limpia restos
  Serial.println(valor);
  delay(100);
}`
    },

    {
      id: "p5",
      n: 5,
      title: "Tono del buzzer controlado por potenciómetro",
      objective: "Generar sonido con tone() y variar su frecuencia según la posición de un potenciómetro leído en A0.",
      comps: [
        { type: "arduino", x: 60, y: 30 },
        { type: "buzzer", x: 560, y: 90 },
        { type: "potenciometro", x: 60, y: 330 }
      ],
      wires: [
        [0, "D8", 1, "plus"],
        [1, "minus", 0, "GND"],
        [0, "5V", 2, "a"],
        [0, "GND", 2, "b"],
        [2, "w", 0, "A0"]
      ],
      steps: [
        "Coloca Arduino, buzzer y potenciómetro.",
        "Conecta el buzzer: + → pin D8, − → GND.",
        "Conecta el potenciómetro: A → 5V, B → GND, W → A0.",
        "Carga y ejecuta el código.",
        "Gira el potenciómetro: escucharás cómo cambia el tono (200 Hz a 2000 Hz) y el simulador muestra la frecuencia generada."
      ],
      explanation:
        "tone(pin, frecuencia) genera una onda cuadrada en el pin. El potenciómetro fija la frecuencia entre 200 y 2000 Hz mediante analogRead + map. " +
        "El buzzer simulado reproduce el sonido real con WebAudio y muestra visualmente cuándo está vibrando.",
      code:
`// Proyecto 5: frecuencia del buzzer según el potenciómetro
int potenciometro = A0;
int buzzer = 8;

void setup() {
  pinMode(buzzer, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int valor = analogRead(potenciometro);          // 0..1023
  int frecuencia = map(valor, 0, 1023, 200, 2000); // 200..2000 Hz
  tone(buzzer, frecuencia);
  Serial.print("Frecuencia: ");
  Serial.print(frecuencia);
  Serial.println(" Hz");
  delay(80);
}`
    },

    {
      id: "p6",
      n: 6,
      title: "Sensor ultrasónico HC-SR04 que mueve un servomotor",
      objective: "Medir distancia con pulseIn() y orientar un servomotor según la distancia detectada (como el 'radar' de un robot).",
      comps: [
        { type: "arduino", x: 60, y: 30 },
        { type: "ultrasonico", x: 520, y: 30 },
        { type: "servo", x: 780, y: 150 }
      ],
      wires: [
        [0, "5V", 1, "vcc"], [0, "GND", 1, "gnd"],
        [0, "D7", 1, "trig"], [0, "D6", 1, "echo"],
        [0, "5V", 2, "vcc"], [0, "GND", 2, "gnd"], [0, "D9", 2, "sig"]
      ],
      steps: [
        "Coloca Arduino, HC-SR04 y el servomotor.",
        "Alimenta el sensor: VCC → 5V, GND → GND.",
        "Conecta Trig → D7 y Echo → D6.",
        "Alimenta el servo (VCC → 5V, GND → GND) y su señal → D9~.",
        "Carga y ejecuta el código.",
        "En el panel de propiedades del HC-SR04, mueve el deslizador «distancia»: el servo debe girar proporcionalmente (cerca → 0°, lejos → 180°)."
      ],
      explanation:
        "El HC-SR04 emite un pulso ultrasónico por Trig; Echo devuelve un pulso cuyo ancho es proporcional al tiempo de ida y vuelta: distancia(cm) = tiempo(µs)/58. " +
        "pulseIn() mide ese pulso y el programa convierte la distancia en un ángulo con map() para el servo (Servo.write). " +
        "En la simulación puedes variar la distancia detectada con el control del sensor.",
      code:
`// Proyecto 6: radar con HC-SR04 + servo
#include <Servo.h>

Servo servo;
int trig = 7;
int echo = 6;

void setup() {
  servo.attach(9);
  pinMode(trig, OUTPUT);
  pinMode(echo, INPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);

  long duracion = pulseIn(echo, HIGH);   // µs
  int distancia = duracion / 58;          // cm

  int angulo = map(distancia, 2, 200, 0, 180);
  angulo = constrain(angulo, 0, 180);
  servo.write(angulo);

  Serial.print("Distancia: ");
  Serial.print(distancia);
  Serial.println(" cm");
  delay(150);
}`
    }
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = global.PROJECTS;
})(typeof window !== "undefined" ? window : globalThis);
