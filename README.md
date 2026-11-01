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

## 📦 Contenido de los kits

| Kit | Enfoque | Componentes |
|-----|---------|-------------|
| **KIT 1** | Electrónica básica y actuadores | Resistencias, LEDs, potenciómetros, protoboard, cables jumper, motores DC, joystick, motorreductor, servomotor, sensor ultrasónico, sensor de aplausos LM393, finales de carrera, driver L298N, sensor de línea, Arduino UNO con cable USB (15) |
| **KIT 2** | Construcción y programación de robots móviles | Kit de armado Elegoo (chasis + motores amarillos), sensor ultrasónico, sensor de línea IR, servomotor azul, protoboard, pinzas pelacables, adaptador de corriente, sensor IR con control, shield L293D, Arduino UNO, cables jumper (11) |
| **KIT 3** | Automatización y sistemas inteligentes | Sensor ultrasónico, módulo de aplausos, resistencias, cables jumper, protoboard, buzzer, módulo relé 1 canal, LCD 16x2, HC-SR501, módulo LDR, servomotor, ESP32 DevKit CH340, DHT11 (13) |

## 🗂️ Estructura del proyecto

```
kits_robotica/
├── index.html                  # Estructura principal de la aplicación
├── css/
│   └── styles.css              # Estilos, animaciones y diseño responsivo
├── js/
│   ├── data.js                 # Datos estructurados de kits y componentes
│   └── app.js                  # Lógica de interacción (vistas, modal, animaciones)
├── assets/
│   └── images/
│       ├── kits/               # Ilustraciones de las 3 cajas (kit1/2/3.svg)
│       └── components/         # Ilustraciones SVG de los 27 componentes
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

## 🛠️ Tecnologías

- HTML5 semántico
- CSS3 (gradientes, animaciones `@keyframes`, flexbox, media queries)
- JavaScript vanilla (sin frameworks): renderizado dinámico, estados de vista y modal
- SVG para todas las ilustraciones de componentes y cajas
