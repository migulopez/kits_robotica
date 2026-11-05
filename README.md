# 🤖 Laboratorio Virtual de Kits de Robótica Educativa

Plataforma web **interactiva** desarrollada con **HTML5, CSS3 y JavaScript** que permite
explorar visualmente tres kits de robótica educativa como si fueran un laboratorio virtual:
las tres cajas están sobre una mesa de trabajo, al hacer clic una caja se "abre", las demás
desaparecen y sus componentes quedan organizados sobre la mesa, listos para ser explorados
uno por uno con su ficha técnica y educativa ampliada.

## ✨ Funcionalidades

- **Mesa de trabajo** con apariencia realista (vista frontal/superior) y tres cajas de kit
  visualmente diferenciadas (KIT 1, KIT 2 y KIT 3).
- **Selección de kit**: al hacer clic en una caja, esta se abre con una animación, las otras
  dos desaparecen temporalmente y los componentes del kit elegido aparecen sobre la mesa.
- **Botón "Volver a la mesa"** para regresar a la pantalla inicial y elegir otro kit.
- **Exploración de componentes**: cada componente es interactivo; al hacer clic se destaca,
  se muestra ampliado en una ventana principal y se despliega su ficha con:
  - ¿Qué es?
  - ¿Para qué sirve?
  - ¿Cómo funciona?
  - ¿Cómo se utiliza?
  - Ejemplos de aplicación en proyectos de robótica.
- La ficha se cierra con el botón ✕, haciendo clic fuera de la ventana o con la tecla `Esc`.
- Animaciones suaves de apertura, aparición escalonada de componentes y transiciones entre vistas.
- Diseño **responsivo**, adaptable a computadores y tabletas.
- **📖 Manual de usuario en PDF (56 páginas)**: [docs/MANUAL.pdf](docs/MANUAL.pdf) — también accesible desde el botón «📖 Manual de usuario (PDF)» del encabezado de la página.
- **✏️ Folleto educativo en PDF (9 páginas)**: [FOLLETO_KITS.pdf](FOLLETO_KITS.pdf) — los componentes de cada kit con sus usos comunes y 20 preguntas de autoevaluación con línea para responder (y solucionario). Incluye los 3 kits con la ficha técnica de cada uno de sus 39 componentes, el laboratorio completo (colocar/cablear/medir/programar, los 25 componentes con sus pines y kit, las 11 prácticas guiadas con diagramas y código), referencia de pines, simulación, solución de problemas y glosario. Se regenera con `node tools/export_data.js && python3 tools/build_manual.py` (requiere `reportlab` y `svglib`).

## 📦 Contenido de los kits

| Kit | Enfoque | Componentes |
|-----|---------|-------------|
| **KIT 1** | Electrónica básica y actuadores | Resistencias, LEDs, potenciómetros, protoboard, cables jumper, motores DC, joystick, motorreductor, servomotor, sensor ultrasónico, sensor de aplausos LM393, finales de carrera, driver L298N, sensor de línea, Arduino UNO con cable USB (15) |
| **KIT 2** | Construcción y programación de robots móviles | Kit de armado Elegoo (chasis + motores amarillos), sensor ultrasónico, sensor de línea IR, servomotor azul, protoboard, pinzas pelacables, adaptador de corriente, sensor IR con control, shield L293D, Arduino UNO, cables jumper (11) |
| **KIT 3** | Automatización y sistemas inteligentes | Sensor ultrasónico, módulo de aplausos, resistencias, cables jumper, protoboard, buzzer, módulo relé 1 canal, LCD 16x2 con módulo I2C, HC-SR501, módulo LDR, servomotor, ESP32 DevKit CH340, DHT11 (13) |

## 🗂️ Estructura del proyecto

```
kits_robotica/
├── index.html                  # Estructura principal de la aplicación
├── css/
│   ├── styles.css              # Estilos de la exploración de kits
│   └── lab.css                 # Estilos del laboratorio virtual
├── js/
│   ├── data.js                 # Datos estructurados de kits y componentes
│   ├── app.js                  # Lógica de interacción (vistas, modal, animaciones)
│   └── lab/                    # Módulo del laboratorio virtual
│       ├── catalog.js          # Catálogo de componentes colocables y sus pines
│       ├── engine.js           # Motor de simulación eléctrica (MNA) + validación
│       ├── mcu.js              # Intérprete controlado de Arduino/ESP32
│       ├── projects.js         # 11 prácticas guiadas (diagramas, pasos, código)
│       └── ui.js               # Mesa interactiva, cables, instrumentos, editor
├── tests/
│   └── engine.test.js          # Pruebas del motor de simulación (node)
├── tools/
│   ├── export_data.js          # Vuelca los datos reales a tools/manual_data.json
│   └── build_manual.py         # Genera docs/MANUAL.pdf (requiere reportlab + svglib)
├── docs/
│   └── MANUAL.pdf              # 📖 Manual de usuario completo (56 páginas)
├── assets/
│   └── images/
│       ├── kits/               # Ilustraciones de las 3 cajas (kit1/2/3.svg)
│       └── components/         # Ilustraciones SVG de los componentes (33: incluye LED y
│                               #   resistencia unitarios para el laboratorio virtual)
└── README.md
```

## 🚀 Cómo ejecutarlo

No requiere dependencias ni servidor especial. Opciones:

1. **Abrir directamente**: hacer doble clic en `index.html` (funciona desde el archivo).
2. **Servidor local** (recomendado):
   ```bash
   # con Python
   python3 -m http.server 8000
   # o con Node.js
   npx serve .
   ```
   y abrir <http://localhost:8000> en el navegador.

## 🧩 Cómo extender el proyecto

Toda la información está en `js/data.js` de forma estructurada:

- **Agregar un componente**: colocar su imagen SVG en `assets/images/components/` y añadir
  un objeto `{ id, name, image, queEs, paraQue, funciona, utiliza, ejemplos[] }` al kit
  correspondiente.
- **Agregar un kit**: añadir un objeto a `KITS` con su caja en `assets/images/kits/` y su
  lista de componentes; la interfaz se genera automáticamente.

## ⚡ Laboratorio virtual de electrónica (nuevo módulo)

Junto al botón **«⬅ Volver a la mesa»** (y en la pantalla inicial) aparece el botón
**«⚡ Laboratorio virtual»**, que abre una mesa de electrónica interactiva con la misma
identidad visual:

### Áreas de la mesa
- **Panel lateral de componentes**: organizados por categorías (alimentación, pasivos,
  indicadores, controladores, sensores, actuadores, módulos, visualización, instrumentos)
  y filtrable por **Kit 1 / Kit 2 / Kit 3** según de qué kit proviene cada componente.
- **Zona central de simulación**: arrastrar y soltar componentes, moverlos, rotarlos (⟳),
  zoom con la rueda del ratón, paneo arrastrando el fondo, cables de colores entre pines
  (clic en un pin → clic en otro), eliminar componentes (Supr) y cables (clic derecho o Supr),
  interruptor general de alimentación (⏻), reinicio (↺) y limpieza de mesa (🗑).
- **Panel derecho**: propiedades del componente seleccionado (valor de resistencias,
  voltaje de la fuente, posición del potenciómetro — también girando su perilla en la mesa,
  sliders de sensores: distancia del ultrasónico, temperatura/humedad del DHT11, luz del
  LDR, presencia del HC-SR501, obstáculos IR, aplausos, botones del control remoto…),
  **avisos inteligentes del circuito** y el **editor de código** con resaltado de sintaxis,
  botón «▶ Cargar y ejecutar» y monitor serial.

### Instrumentos virtuales
- **Fuente de alimentación regulable** (0–12 V, con interruptor) colocable en la mesa;
  también pila de 9 V y adaptador de 12 V. Terminales + y − cableables.
- **Multímetro digital** colocable: modo **V DC** (puntas en paralelo), **A DC** (en serie,
  midiendo la corriente real que atraviesa el shunt) y **Ω** (midiendo resistencias con el
  circuito sin alimentación; muestra «OL» si está energizado). Puntas COM (negra) y VΩ/A (roja).

### Motor de simulación (resultados coherentes con la realidad)
- Grafo de nodos con **análisis nodal modificado (MNA)**: V = I × R, divisores de tensión,
  leyes de Kirchhoff, cálculo de voltaje/corriente/potencia por componente.
- **LED**: respeta polaridad (ánodo/cátodo), brillo proporcional a la corriente real,
  se quema si supera ~30 mA sin resistencia limitadora (aviso + daño permanente),
  aviso si está invertido.
- **Resistencia**: valor configurable; muestra V, I y P disipada (avisa si supera 0,25 W).
- **Potenciómetro**: divisor de tensión real; se ajusta girando la perilla o con el slider.
- **Buzzer**: suena de verdad (WebAudio) con la frecuencia de `tone()` o fija en DC.
- **Motor DC / motorreductor**: gira a velocidad proporcional al voltaje (PWM incluido) y
  cambia de sentido con la polaridad; **driver L298N / shield L293D** controlan OUT/M con
  señales digitales y PWM del microcontrolador.
- **Servomotor**: ángulo según `Servo.write()` o señal PWM (0–180°).
- **Relé**: bobina real; conmuta COM entre NC y NO según la señal IN.
- **Sensores con valores simulados ajustables**: HC-SR04 (distancia → `pulseIn`), DHT11,
  LDR (AO analógico), HC-SR501, sensor de línea IR, sensor IR de obstáculos, módulo de
  aplausos y receptor IR con control remoto.
- **LCD 16x2 con módulo I2C** (backpack PCF8574, dirección 0x27): solo 4 pines
  (VCC, GND, SDA, SCL). Se enciende si VCC/GND reciben alimentación y muestra el texto
  que imprime el programa (`LiquidCrystal_I2C.print`) si SDA/SCL llegan a los pines I2C
  del microcontrolador (UNO: A4/A5; ESP32: D21/D22).
- **Arduino UNO / ESP32**: pines etiquetados (D0–D13 con ~PWM, A0–A5, 5V/3V3, GND, VIN;
  GPIO en el ESP32 a 3,3 V). Se alimentan por USB, VIN o 5V. El **intérprete controlado**
  ejecuta el código del editor (`pinMode`, `digitalWrite/Read`, `analogWrite/Read`,
  `tone`, `pulseIn`, `delay`, `millis`, `Serial`, `Servo`, `LiquidCrystal`,
  `LiquidCrystal_I2C`, `DHT`, `IRrecv`) contra los nodos reales del circuito: el programa
  solo funciona si el cableado es correcto.

### Validación inteligente de errores
El sistema detecta y explica: cortocircuitos, polaridad invertida del LED, LED sin
resistencia limitadora (riesgo de daño), falta de alimentación, LCD sin alimentación o
sin pines de datos, pines del microcontrolador sin conectar y pines que exceden 40 mA.
Ejemplo: *«El LED no enciende porque está conectado con polaridad invertida. Intercambia
las conexiones del ánodo y el cátodo.»*

### 📚 Prácticas guiadas (11 proyectos)
1. LED + resistencia de 220 Ω (Ley de Ohm y medición con multímetro).
2. Brillo de LED con potenciómetro (analogRead + PWM).
3. LCD 16x2 (I2C) mostrando «HOLA MUNDO».
4. LCD (I2C) con el valor del potenciómetro en vivo.
5. Tono del buzzer controlado por potenciómetro (`tone`).
6. HC-SR04 + servomotor (radar según distancia).
7. Estación climática: DHT11 + LCD I2C en ESP32.
8. Relé que enciende una lámpara (LED de potencia).
9. Servomotor controlado con potenciómetro.
10. Alarma de proximidad: HC-SR04 + buzzer.
11. Luz automática nocturna con LDR.

Cada práctica incluye objetivo, lista de componentes **con la etiqueta del kit al que
pertenecen** (`Kit 1`, `Kit 2`, `Kit 3`, también visible en cada componente de la paleta),
**diagrama de conexiones**, pasos, explicación, código de ejemplo y botones para colocar
los componentes en la mesa (**sin conectarlos automáticamente**: el estudiante tiende los
cables) y cargar el código.

### Pruebas del motor
```bash
node tests/engine.test.js   # 34 comprobaciones del simulador (MNA, LED, divisores, MCU…)
```

## 🛠️ Tecnologías

- HTML5 semántico
- CSS3 (gradientes, animaciones `@keyframes`, flexbox/grid, media queries)
- JavaScript vanilla (sin frameworks): renderizado dinámico, estados de vista, modal y
  motor de simulación eléctrica propio (MNA) + intérprete Arduino
- SVG para todas las ilustraciones de componentes y cajas
