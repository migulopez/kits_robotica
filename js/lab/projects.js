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
      title: "Pantalla LCD 16x2 (I2C) mostrando «HOLA MUNDO»",
      objective: "Conectar la pantalla LCD 16x2 con su módulo I2C usando solo 4 cables (VCC, GND, SDA, SCL) y mostrar un texto con la librería LiquidCrystal_I2C.",
      comps: [
        { type: "arduino", x: 60, y: 30 },
        { type: "lcd", x: 470, y: 150 }
      ],
      wires: [
        [0, "5V", 1, "vcc"],
        [0, "GND", 1, "gnd"],
        [0, "A4", 1, "sda"],
        [0, "A5", 1, "scl"]
      ],
      steps: [
        "Coloca el Arduino UNO y la pantalla LCD 16x2 con módulo I2C (los 4 pines de arriba: VCC, GND, SDA, SCL).",
        "Alimenta la pantalla: VCC → 5V y GND → GND del Arduino (cables rojo y negro).",
        "Conecta el bus I2C: SDA → A4 y SCL → A5 (en el UNO, A4/A5 son los pines I2C).",
        "Carga el código de ejemplo con «▶ Cargar y ejecutar».",
        "La pantalla debe mostrar «HOLA MUNDO».",
        "Experimento: desconecta VCC. El sistema avisa que la LCD no recibe alimentación.",
        "Experimento: desconecta SDA. El aviso indica que faltan SDA/SCL hacia el microcontrolador."
      ],
      explanation:
        "La LCD 16x2 del kit trae soldado el módulo I2C (PCF8574, dirección habitual 0x27): traduce el bus serie I2C a las señales del controlador HD44780, " +
        "así que solo ocupa 2 pines de datos (SDA/SCL) además de la alimentación. La simulación comprueba que VCC/GND estén alimentados y que SDA/SCL " +
        "lleguen a los pines I2C del Arduino (A4/A5); solo entonces lcd.print() dibuja el texto en la pantalla virtual.",
      code:
`// Proyecto 3: HOLA MUNDO en LCD 16x2 con módulo I2C
#include <Wire.h>
#include <LiquidCrystal_I2C.h>   // (simulada)

LiquidCrystal_I2C lcd(0x27, 16, 2);  // dirección I2C, 16 columnas, 2 filas

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
      title: "LCD (I2C) mostrando el valor del potenciómetro en vivo",
      objective: "Leer un potenciómetro con analogRead y mostrar su valor (0–1023) en tiempo real en la LCD con módulo I2C.",
      comps: [
        { type: "arduino", x: 60, y: 30 },
        { type: "lcd", x: 500, y: 30 },
        { type: "potenciometro", x: 60, y: 330 }
      ],
      wires: [
        [0, "5V", 1, "vcc"], [0, "GND", 1, "gnd"],
        [0, "A4", 1, "sda"], [0, "A5", 1, "scl"],
        [0, "5V", 2, "a"], [0, "GND", 2, "b"], [2, "w", 0, "A0"]
      ],
      steps: [
        "Monta la LCD con módulo I2C: VCC → 5V, GND → GND, SDA → A4, SCL → A5.",
        "Añade el potenciómetro: A → 5V, B → GND, cursor W → A0.",
        "Carga y ejecuta el código.",
        "Gira el potenciómetro: la LCD debe mostrar «VALOR: xxx» cambiando en vivo entre 0 y 1023."
      ],
      explanation:
        "El potenciómetro como divisor de tensión entrega en W un voltaje proporcional a su posición. analogRead(A0) lo mide (0–1023). " +
        "El programa imprime ese valor en la segunda fila de la LCD; al girar el mando, el valor cambia dinámicamente en la pantalla simulada.",
      code:
`// Proyecto 4: valor del potenciómetro en la LCD (I2C)
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
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
    },

    {
      id: "p7",
      n: 7,
      title: "Estación climática: DHT11 + LCD I2C en ESP32",
      objective: "Leer temperatura y humedad con el DHT11 y mostrarlas en la pantalla LCD 16x2 con módulo I2C, todo con un ESP32.",
      comps: [
        { type: "esp32", x: 50, y: 40 },
        { type: "dht11", x: 420, y: 40, props: { temp: 27, humedad: 55 } },
        { type: "lcd", x: 660, y: 60 }
      ],
      wires: [
        [0, "3V3", 1, "vcc"],
        [0, "GND", 1, "gnd"],
        [0, "D4", 1, "data"],
        [0, "5V", 2, "vcc"],
        [0, "GND", 2, "gnd"],
        [0, "D21", 2, "sda"],
        [0, "D22", 2, "scl"]
      ],
      steps: [
        "Coloca el ESP32, el sensor DHT11 y la LCD 16x2 con módulo I2C.",
        "Alimenta el DHT11: VCC → 3V3, GND → GND y DATA → D4.",
        "Conecta la LCD: VCC → 5V, GND → GND, SDA → D21 y SCL → D22 (pines I2C del ESP32).",
        "Carga y ejecuta el código.",
        "La LCD muestra «T: xxC» y «H: xx%». Cambia la temperatura/humedad en el panel de propiedades del DHT11 y obsévalo en vivo.",
        "Experimento: desconecta SDA de la LCD y verás el aviso de bus I2C no conectado."
      ],
      explanation:
        "El DHT11 mide temperatura y humedad y entrega el dato por un pin digital (aquí D4). La LCD con módulo I2C se conecta solo con VCC, GND, SDA y SCL: " +
        "en el ESP32 los pines I2C por defecto son GPIO21 (SDA) y GPIO22 (SCL), que en el simulador son D21 y D22. El programa lee el sensor con la librería DHT " +
        "y escribe las dos filas de la pantalla con LiquidCrystal_I2C.",
      code:
`// Proyecto 7: estación climática ESP32 + DHT11 + LCD I2C
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

DHT dht(4, DHT11);
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  Serial.begin(115200);
  dht.begin();
  lcd.begin(16, 2);
  lcd.print("ESTACION");
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  lcd.setCursor(0, 0);
  lcd.print("T: "); lcd.print(t); lcd.print("C   ");
  lcd.setCursor(0, 1);
  lcd.print("H: "); lcd.print(h); lcd.print("%   ");
  Serial.print(t); Serial.print(" C / "); Serial.print(h); Serial.println(" %");
  delay(500);
}`
    },

    {
      id: "p8",
      n: 8,
      title: "Relé que enciende una lámpara (LED de potencia)",
      objective: "Controlar un circuito de potencia (fuente + LED) con un relé activado desde un pin digital del Arduino, como una lámpara real.",
      comps: [
        { type: "arduino", x: 50, y: 40 },
        { type: "rele", x: 380, y: 40 },
        { type: "fuente", x: 700, y: 40, props: { volt: 9, on: true } },
        { type: "resistencia", x: 380, y: 320, props: { R: 470 } },
        { type: "led", x: 700, y: 320 }
      ],
      wires: [
        [0, "5V", 1, "vcc"],
        [0, "GND", 1, "gnd"],
        [0, "D7", 1, "in"],
        [2, "plus", 1, "com"],
        [1, "no", 3, "a"],
        [3, "b", 4, "anodo"],
        [4, "catodo", 2, "minus"]
      ],
      steps: [
        "Coloca Arduino, módulo relé, fuente de 9 V, resistencia de 470 Ω y LED.",
        "Alimenta el relé: VCC → 5V, GND → GND, y su entrada IN → D7.",
        "Conecta la fuente de 9 V al relé: + → COM.",
        "Del contacto NO del relé salen la resistencia (470 Ω) → ánodo del LED → cátodo al − de la fuente.",
        "Carga y ejecuta el código: el relé debe conmutar cada 2 s y el LED encenderse/apagarse.",
        "Experimento: deja IN sin conectar o a LOW; el LED debe quedar apagado (COM→NC abierto para la carga)."
      ],
      explanation:
        "Un relé es un interruptor electromecánico: la bobina (IN) cierra el contacto COM→NO cuando recibe nivel alto. Así un pin del Arduino (pocos mA) " +
        "controla un circuito de potencia (9 V, LED con su resistencia). En la simulación el LED del módulo relé indica el estado y el LED de carga se comporta " +
        "eléctricamente como en la realidad: I = (9 − 2) / 470 ≈ 15 mA.",
      code:
`// Proyecto 8: lámpara con relé
int rele = 7;

void setup() {
  pinMode(rele, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(rele, HIGH);   // bobina activada: COM→NO cerrado, lámpara ON
  Serial.println("LAMPA ON");
  delay(2000);
  digitalWrite(rele, LOW);    // relé liberado: lámpara OFF
  Serial.println("LAMPA OFF");
  delay(2000);
}`
    },

    {
      id: "p9",
      n: 9,
      title: "Servomotor controlado con un potenciómetro",
      objective: "Mover un servomotor a cualquier ángulo (0–180°) girando un potenciómetro, combinando analogRead, map y Servo.",
      comps: [
        { type: "arduino", x: 50, y: 40 },
        { type: "potenciometro", x: 50, y: 330 },
        { type: "servo", x: 540, y: 90 }
      ],
      wires: [
        [0, "5V", 1, "a"],
        [0, "GND", 1, "b"],
        [1, "w", 0, "A0"],
        [0, "5V", 2, "vcc"],
        [0, "GND", 2, "gnd"],
        [0, "D9", 2, "sig"]
      ],
      steps: [
        "Coloca el Arduino, el potenciómetro y el servomotor.",
        "Alimenta el potenciómetro: A → 5V, B → GND, cursor W → A0.",
        "Alimenta el servo: VCC → 5V, GND → GND y su señal (cable naranja) → D9~.",
        "Carga y ejecuta el código.",
        "Gira el potenciómetro de tope a tope: el brazo del servo debe barrer de 0° a 180°."
      ],
      explanation:
        "El servo lee pulsos PWM en su pin de señal: analogWrite/attach generan esos pulsos y Servo.write(ángulo) fija la posición. " +
        "El potenciómetro entrega 0–5 V en W; analogRead(A0) lo convierte a 0–1023 y map() lo traduce a 0–180°. En la simulación el brazo del servo " +
        "gira visualmente y la corriente del servo se calcula según el ángulo.",
      code:
`// Proyecto 9: servo + potenciómetro
#include <Servo.h>

Servo servo;
int potenciometro = A0;
int pinServo = 9;

void setup() {
  servo.attach(pinServo);
  Serial.begin(9600);
}

void loop() {
  int valor = analogRead(potenciometro);          // 0..1023
  int angulo = map(valor, 0, 1023, 0, 180);       // 0..180 grados
  servo.write(angulo);
  Serial.print("Angulo: ");
  Serial.println(angulo);
  delay(60);
}`
    },

    {
      id: "p10",
      n: 10,
      title: "Alarma de proximidad: HC-SR04 + buzzer",
      objective: "Hacer sonar un buzzer cuando un objeto se acerque a menos de 15 cm, midiendo distancia con el ultrasónico HC-SR04.",
      comps: [
        { type: "arduino", x: 50, y: 40 },
        { type: "ultrasonico", x: 430, y: 40, props: { distancia: 40 } },
        { type: "buzzer", x: 760, y: 120 }
      ],
      wires: [
        [0, "5V", 1, "vcc"],
        [0, "GND", 1, "gnd"],
        [0, "D7", 1, "trig"],
        [0, "D6", 1, "echo"],
        [0, "D8", 2, "plus"],
        [2, "minus", 0, "GND"]
      ],
      steps: [
        "Coloca Arduino, HC-SR04 y buzzer.",
        "Alimenta el sensor: VCC → 5V, GND → GND; Trig → D7 y Echo → D6.",
        "Conecta el buzzer: + → D8 y − → GND.",
        "Carga y ejecuta el código.",
        "En el panel de propiedades del HC-SR04 baja la distancia a menos de 15 cm: el buzzer debe sonar. Súbela: se silencia."
      ],
      explanation:
        "El HC-SR04 mide distancia por ultrasonido: Trig emite un pulso de 10 µs y Echo devuelve un pulso cuyo ancho es proporcional al tiempo de ida y vuelta " +
        "(cm = µs/58). pulseIn() mide ese ancho. Si la distancia es menor que el umbral, tone(D8, 1200) hace sonar el buzzer; si no, noTone() lo silencia. " +
        "En la simulación varías la distancia con el control del sensor.",
      code:
`// Proyecto 10: alarma de proximidad HC-SR04 + buzzer
int trig = 7;
int echo = 6;
int buzzer = 8;

void setup() {
  pinMode(trig, OUTPUT);
  pinMode(echo, INPUT);
  pinMode(buzzer, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);

  long us = pulseIn(echo, HIGH);   // duración del pulso de eco (µs)
  int cm = us / 58;                // distancia en cm

  if (cm > 0 && cm < 15) {
    tone(buzzer, 1200);            // ¡objeto cerca!
    Serial.print("ALARMA a ");
    Serial.print(cm);
    Serial.println(" cm");
  } else {
    noTone(buzzer);                // zona despejada
  }
  delay(100);
}`
    },

    {
      id: "p11",
      n: 11,
      title: "Luz automática nocturna con LDR",
      objective: "Encender un LED automáticamente cuando oscurezca, leyendo el módulo LDR (fotoresistencia) con analogRead.",
      comps: [
        { type: "arduino", x: 50, y: 40 },
        { type: "ldr", x: 400, y: 40, props: { luz: 0.8 } },
        { type: "resistencia", x: 650, y: 300, props: { R: 220 } },
        { type: "led", x: 870, y: 300 }
      ],
      wires: [
        [0, "5V", 1, "vcc"],
        [0, "GND", 1, "gnd"],
        [1, "ao", 0, "A0"],
        [0, "D8", 2, "a"],
        [2, "b", 3, "anodo"],
        [3, "catodo", 0, "GND"]
      ],
      steps: [
        "Coloca Arduino, módulo LDR, resistencia de 220 Ω y LED.",
        "Alimenta el LDR: VCC → 5V, GND → GND y su salida analógica AO → A0.",
        "Conecta D8 → resistencia → ánodo del LED y cátodo → GND.",
        "Carga y ejecuta el código.",
        "En el panel de propiedades del LDR mueve el deslizador «luz»: con poca luz (valor bajo en A0) el LED se enciende; con mucha luz se apaga."
      ],
      explanation:
        "El módulo LDR lleva una fotoresistencia en un divisor de tensión: su salida AO entrega un voltaje proporcional a la luz recibida (más luz → más voltaje). " +
        "analogRead(A0) lo mide (0–1023) y el programa compara contra un umbral: si hay poca luz (valor < 400), digitalWrite(D8, HIGH) enciende el LED, " +
        "como una lámpara nocturna automática. La resistencia de 220 Ω protege el LED.",
      code:
`// Proyecto 11: luz automática con LDR
int ldr = A0;        // salida AO del módulo LDR
int led = 8;

void setup() {
  pinMode(led, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int luz = analogRead(ldr);        // 0..1023 (más luz = valor más alto)
  if (luz < 400) {
    digitalWrite(led, HIGH);        // oscuro → enciende la luz
    Serial.println("NOCHE: LED ON");
  } else {
    digitalWrite(led, LOW);         // hay luz → apaga
    Serial.println("DIA: LED OFF");
  }
  Serial.print("Luz: ");
  Serial.println(luz);
  delay(200);
}`
    }
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = global.PROJECTS;
})(typeof window !== "undefined" ? window : globalThis);
