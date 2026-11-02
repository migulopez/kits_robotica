/* ============================================================
   DATOS DE LA PLATAFORMA — Laboratorio Virtual de Robótica
   ------------------------------------------------------------
  Toda la información está almacenada de forma estructurada.
   Para agregar un componente nuevo basta con:
     1. Colocar su imagen en assets/images/components/
     2. Añadir un objeto a la lista "components" del kit correspondiente
   Para agregar un kit nuevo, añadir un objeto a KITS con su caja
   en assets/images/kits/ y su lista de componentes.
   ============================================================ */

const KITS = [
  {
    id: "kit1",
    name: "KIT 1",
    title: "Electrónica básica y actuadores",
    description:
      "Kit orientado al aprendizaje de electrónica básica, el control de motores y el uso de sensores con Arduino UNO.",
    box: "assets/images/kits/kit1.svg",
    accent: "#f97316",
    components: [
      {
        id: "resistencias",
        name: "Resistencias",
        image: "assets/images/components/resistencias.svg",
        queEs:
          "La resistencia es un componente electrónico pasivo de dos terminales que se opone al paso de la corriente eléctrica. Su valor se mide en ohmios (Ω) y en los componentes axiales se indica con bandas de colores.",
        paraQue:
          "Sirve para limitar la corriente que circula por un circuito, proteger componentes sensibles como los LEDs, crear divisores de voltaje y definir estados lógicos (pull-up / pull-down) en entradas digitales.",
        funciona:
          "Se comporta según la Ley de Ohm (V = I × R): al aplicarle un voltaje, deja pasar una corriente inversamente proporcional a su resistencia y disipa el excedente de energía en forma de calor.",
        utiliza:
          "Se conecta directamente en el circuito (normalmente en serie con el componente a proteger) mediante la protoboard y cables jumper. No tiene polaridad: se puede conectar en cualquier sentido. Las bandas de color del cuerpo indican su valor y tolerancia.",
        ejemplos: [
          "Resistencia de 220 Ω en serie con un LED para que no se queme al conectarlo a 5 V.",
          "Divisor de voltaje con dos resistencias para leer el valor de un potenciómetro en una entrada analógica.",
          "Resistencia pull-down de 10 kΩ en un pulsador para garantizar un nivel LOW cuando no se presiona."
        ]
      },
      {
        id: "leds",
        name: "LEDs",
        image: "assets/images/components/leds.svg",
        queEs:
          "Un LED (diodo emisor de luz) es un semiconductor que emite luz cuando circula corriente eléctrica a través de él en el sentido correcto. Existen de varios colores: rojo, verde, amarillo, azul y blanco.",
        paraQue:
          "Sirve como indicador luminoso de estado, señalización, iluminación y como emisor de luz infrarroja en sensores. Es el componente de salida visual más usado en proyectos educativos.",
        funciona:
          "Al polarizarlo directamente (ánodo a positivo, cátodo a negativo) por encima de su voltaje umbral (unos 1.8–3.3 V según el color), emite luz. Si se conecta al revés no conduce ni se daña (si hay resistencia serie).",
        utiliza:
          "Siempre se conecta en serie con una resistencia (típicamente 220 Ω) entre un pin de salida del Arduino y GND. El terminal largo es el ánodo (+) y el corto (o el lado plano de la cápsula) es el cátodo (−).",
        ejemplos: [
          "Semáforo con tres LEDs (rojo, amarillo, verde) controlado por un Arduino.",
          "Indicador de que un robot está encendido o de que una condición se cumplió.",
          "Linterna automática que se enciende cuando un sensor LDR detecta poca luz."
        ]
      },
      {
        id: "potenciometros",
        name: "Potenciómetros",
        image: "assets/images/components/potenciometro.svg",
        queEs:
          "El potenciómetro es una resistencia variable de tres terminales. Al girar su eje se modifica la resistencia entre el terminal central (cursor) y los extremos, lo que permite ajustar valores de forma manual.",
        paraQue:
          "Sirve para ajustar parámetros de un circuito de forma interactiva: volumen, brillo, velocidad, sensibilidad de sensores o umbral de comparación, sin tener que cambiar componentes.",
        funciona:
          "Funciona como un divisor de voltaje ajustable: los dos terminales extremos tienen la resistencia total fija y el cursor entrega una fracción de ese voltaje que varía entre 0 V y el voltaje de alimentación según la posición del eje.",
        utiliza:
          "Se conectan los extremos a VCC y GND y el cursor a una entrada analógica del Arduino (A0–A5), que leerá valores de 0 a 1023. También se usan en serie como reóstato para variar corriente.",
        ejemplos: [
          "Control manual de la velocidad de un motor DC mediante un driver.",
          "Ajuste del umbral de detección de un sensor de línea o de aplausos.",
          "Control de la posición de un servomotor moviendo un mando giratorio."
        ]
      },
      {
        id: "protoboard",
        name: "Protoboard",
        image: "assets/images/components/protoboard.svg",
        queEs:
          "La protoboard (placa de pruebas) es una placa con orificios interconectados internamente que permite montar circuitos electrónicos de forma rápida, sin necesidad de soldar.",
        paraQue:
          "Sirve para prototipar y probar circuitos antes de soldarlos definitivamente, permitiendo conectar, desconectar y reorganizar componentes fácilmente durante el aprendizaje.",
        funciona:
          "Internamente, las filas de 5 orificios de cada mitad están conectadas entre sí, y las columnas largos marked como + y − (líneas roja y azul) están conectadas de arriba abajo y funcionan como buses de alimentación.",
        utiliza:
          "Se clavan los terminales de los componentes y los cables jumper en los orificios. Respetar la separación central (el canal) para los circuitos integrados y usar las líneas +/− para distribuir 5 V y GND.",
        ejemplos: [
          "Montaje de un circuito LED + resistencia + pulsador antes de soldarlo.",
          "Prototipo de un robot seguidor de línea con sensores y Arduino.",
          "Pruebas de código con motores y driver L298N sin dañar la placa final."
        ]
      },
      {
        id: "jumper",
        name: "Cables jumper",
        image: "assets/images/components/jumper.svg",
        queEs:
          "Los cables jumper son conductores flexibles con conectores en sus extremos (macho o hembra) que sirven para interconectar componentes sobre la protoboard y la placa Arduino sin soldar.",
        paraQue:
          "Sirven para llevar señales y alimentación entre el Arduino, la protoboard y los sensores/actuadores, permitiendo montar y desmontar el circuito con facilidad.",
        funciona:
          "Son simples cables conductores: transmiten la señal eléctrica de un punto a otro. Existen tres tipos: macho-macho, macho-hembra y hembra-hembra, y de distintos colores para organizar el circuito.",
        utiliza:
          "Se enchufan directamente en los orificios de la protoboard o en los headers del Arduino. Conviene usar colores: rojo para VCC, negro/negro para GND y otros colores para señales.",
        ejemplos: [
          "Conexión de un sensor ultrasónico a los pines Trig/Echo del Arduino.",
          "Alimentación de un módulo relé desde los pines 5 V y GND.",
          "Enlace entre la protoboard y un driver de motores con varios cables de señal."
        ]
      },
      {
        id: "motor-dc",
        name: "Motores DC",
        image: "assets/images/components/motor_dc.svg",
        queEs:
          "El motor DC (de corriente continua) es un actuador que convierte energía eléctrica en movimiento de rotación continua mediante una bobina y un sistema de escobillas sobre un eje.",
        paraQue:
          "Sirve para generar movimiento en proyectos de robótica: ruedas de vehículos, ventiladores, cintas transportadoras o cualquier mecanismo que necesite girar continuamente.",
        funciona:
          "Al aplicarle voltaje entre sus dos terminales, la corriente circula por la bobina y genera un campo magnético que hace girar el eje. Invertir la polaridad invierte el sentido de giro; con PWM se controla la velocidad.",
        utiliza:
          "No se conecta directamente a un pin del Arduino (supera la corriente permitida): se usa un driver como el L298N. Se alimentan sus bornes con la salida del driver y se controlan con señales digitales y PWM.",
        ejemplos: [
          "Ruedas de un carro robot controlado con un driver L298N.",
          "Ventilador automático que se enciende cuando el DHT11 detecta calor.",
          "Bomba de agua pequeña para un sistema de riego automatizado."
        ]
      },
      {
        id: "joystick",
        name: "Joystick",
        image: "assets/images/components/joystick.svg",
        queEs:
          "El módulo joystick analógico (tipo KY-023) contiene dos potenciómetros dispuestos en ángulo recto (ejes X e Y) y un pulsador central, todo montado sobre una pequeña placa con pines.",
        paraQue:
          "Sirve como control manual proporcional: permite manejar robots, grúas o vehículos en dos direcciones y además detectar el clic del pulsador.",
        funciona:
          "Al mover la palanca se desplazan los cursores de los dos potenciómetros, entregando voltajes variables entre 0 y 5 V en las salidas VRx y VRy. En reposo entrega aproximadamente 2.5 V. El pulsador entrega un contacto a GND.",
        utiliza:
          "Se conecta VRx y VRy a entradas analógicas del Arduino (ej. A0 y A1), SW a una entrada digital con pull-up y VCC/GND a la alimentación. Se leen con analogRead() y digitalRead().",
        ejemplos: [
          "Mando de control para manejar un robot móvil en todas direcciones.",
          "Control de un brazo robótico de 2 grados de libertad.",
          "Gamepad casero para manejar un vehículo por Bluetooth."
        ]
      },
      {
        id: "motorreductor",
        name: "Motorreductor",
        image: "assets/images/components/motorreductor.svg",
        queEs:
          "El motorreductor (tipo TT) es un motor DC pequeño unido a una caja de engranajes de plástico que reduce la velocidad de giro y aumenta la fuerza (torque) en el eje de salida.",
        paraQue:
          "Sirve cuando se necesita fuerza para mover peso a baja velocidad, como las ruedas de un robot móvil, ya que un motor DC solo no tiene suficiente torque para mover un chasis.",
        funciona:
          "El motor gira muy rápido pero con poca fuerza; los engranajes de la caja reductora transmiten ese giro a un eje más lento y con mucho más torque. Invertir la polaridad invierte el sentido de giro.",
        utiliza:
          "Se controla igual que un motor DC, con un driver (L298N/L293D) o con transistores. Sus dos bornes se conectan a la salida del driver y la rueda se monta directamente en el eje estriado.",
        ejemplos: [
          " las cuatro ruedas amarillas del kit de armado Elegoo.",
          "Ruedas de un robot seguidor de línea que avanza despacio y con fuerza.",
          "Mecanismo de apertura de una puerta automática de maqueta."
        ]
      },
      {
        id: "servomotor",
        name: "Servomotor",
        image: "assets/images/components/servo.svg",
        queEs:
          "El servomotor es un motor con electrónica interna de control que permite posicionar su eje en un ángulo determinado, típicamente entre 0° y 180°, y mantenerlo fijo en esa posición.",
        paraQue:
          "Sirve para movimientos precisos y controlados: dirección de vehículos, brazos robóticos, barrido de sensores, apertura de compuertas, etc.",
        funciona:
          "Recibe una señal PWM por su cable de control: la duración del pulso (aprox. 1 ms = 0°, 1.5 ms = 90°, 2 ms = 180°) indica el ángulo deseado. La electrónica interna compara la posición real con la ordenada y mueve el eje hasta alcanzarla.",
        utiliza:
          "Se conecta el cable marrón/rojo a GND/VCC y el de señal (amarillo/naranja) a un pin PWM del Arduino. Se controla con la librería Servo.h usando servo.write(ángulo).",
        ejemplos: [
          "Barrido del sensor ultrasónico de un robot para detectar obstáculos a izquierda y derecha.",
          "Brazo robótico que levanta y baja objetos.",
          "Dirección delantera de un carro robot controlado por servos."
        ]
      },
      {
        id: "ultrasonico",
        name: "Sensor ultrasónico HC-SR04",
        image: "assets/images/components/ultrasonico.svg",
        queEs:
          "El HC-SR04 es un módulo sensor de distancia por ultrasonido: emite un pulso ultrasónico y mide el tiempo que tarda el eco en regresar tras rebotar en un objeto.",
        paraQue:
          "Sirve para medir distancias sin contacto (de 2 cm a 4 m), fundamental para que los robots detecten obstáculos, midan niveles de líquidos o se estacionen solos.",
        funciona:
          "Un transductor emite 8 pulsos de 40 kHz; al recibir el eco el otro transductor, el módulo entrega en el pin Echo un pulso HIGH cuyo ancho es proporcional al tiempo de ida y vuelta. Distancia (cm) = tiempo (µs) / 58.",
        utiliza:
          "Se conectan VCC a 5 V, GND a GND, Trig y Echo a dos pines digitales del Arduino. Se envía un pulso de 10 µs por Trig y se mide la duración del pulso en Echo con pulseIn().",
        ejemplos: [
          "Robot que frena o gira al detectar un obstáculo delante.",
          "Alarma de proximidad que avisa cuando alguien se acerca a una puerta.",
          "Medidor de nivel de agua en un tanque."
        ]
      },
      {
        id: "aplausos-lm393",
        name: "Sensor de aplausos LM393",
        image: "assets/images/components/aplausos.svg",
        queEs:
          "Es un módulo con micrófono y un comparador LM393 que detecta sonidos fuertes como aplausos o golpes y entrega una señal digital cuando el sonido supera un umbral ajustable.",
        paraQue:
          "Sirve para crear sistemas que reaccionan al sonido: encender luces con un aplauso, activar un robot al detectar un ruido o contar palmadas.",
        funciona:
          "El micrófono convierte el sonido en una señal eléctrica; el LM393 la compara con un voltaje de referencia ajustado por el potenciómetro del módulo. Si se supera, la salida OUT pasa a LOW durante unos instantes.",
        utiliza:
          "Se conecta VCC a 5 V, GND a GND y OUT a una entrada digital del Arduino. El potenciómetro azul de la placa ajusta la sensibilidad: cuanto más alto el umbral, más fuerte debe ser el sonido.",
        ejemplos: [
          "Lámpara que se enciende y apaga con un aplauso.",
          "Robot que avanza un paso cada vez que detecta una palmada.",
          "Sistema de alarma que se activa con un ruido fuerte en la noche."
        ]
      },
      {
        id: "finales-carrera",
        name: "Finales de carrera (microswitch)",
        image: "assets/images/components/fin_carrera.svg",
        queEs:
          "El final de carrera es un microswitch: un interruptor eléctrico con una palanca metálica que se acciona mecánicamente al ser presionada, abriendo o cerrando un contacto.",
        paraQue:
          "Sirve para detectar contacto físico o llegada a un límite: choques de un robot, tope de un eje móvil, apertura de puertas o botones de emergencia.",
        funciona:
          "Al presionar la palanca, un contacto interno cambia de estado (de NC a NA o viceversa). Hay tres terminales: COM (común), NA (normalmente abierto) y NC (normalmente cerrado).",
        utiliza:
          "Se conecta COM a GND y NA (o NC) a una entrada digital del Arduino configurada con resistencia pull-up interna (pinMode(pin, INPUT_PULLUP)), de modo que al presionar la palanca la entrada lea LOW.",
        ejemplos: [
          "Parachoques de un robot: al chocar, invierte la dirección automáticamente.",
          "Límite superior de un ascensor de maqueta que detiene el motor.",
          "Botón de emergencia que detiene todo el sistema."
        ]
      },
      {
        id: "driver-l298n",
        name: "Driver de motores L298N",
        image: "assets/images/components/l298n.svg",
        queEs:
          "El módulo L298N es un driver basado en el circuito integrado puente H doble L298, montado en una placa con disipador, bornes y reguladores, capaz de controlar dos motores DC o un motor paso a paso.",
        paraQue:
          "Sirve para controlar la velocidad y el sentido de giro de motores DC con las señales débiles de un microcontrolador, ya que un pin de Arduino no puede alimentar un motor directamente.",
        funciona:
          "Cada puente H usa transistores que conectan el motor a +V o a GND en cualquier combinación: con IN1=alto e IN2=bajo el motor gira en un sentido; al revés, gira al otro; con ENA/ENB en PWM se regula la velocidad.",
        utiliza:
          "Se alimenta con 7–12 V en el borne de entrada (el módulo tiene un regulador a 5 V que puede alimentar el Arduino con el jumper puesto) y los motores en los bornes de salida. Los pines IN1–IN4 y ENA/ENB van a pines digitales/PWM del Arduino.",
        ejemplos: [
          "Control de las dos ruedas de un robot móvil (adelante, atrás, giros).",
          "Control de velocidad de un motor con PWM en el pin ENA.",
          "Manejo de un motor paso a paso bipolar en un brazo robótico."
        ]
      },
      {
        id: "sensor-linea",
        name: "Sensor de línea (TCRT5000)",
        image: "assets/images/components/linea.svg",
        queEs:
          "El sensor de línea es un módulo con un LED infrarrojo emisor y un fototransistor receptor (TCRT5000) que detecta diferencias de reflectividad entre superficies claras y oscuras.",
        paraQue:
          "Sirve para que un robot siga una línea negra sobre fondo blanco (o viceversa) detectando en qué lado del sensor está la línea.",
        funciona:
          "El LED IR ilumina la superficie; si esta es clara (blanca) refleja mucha luz y el fototransistor conduce, dando salida baja; si es oscura (línea negra) refleja poca luz y la salida queda alta.",
        utiliza:
          "Se conecta VCC a 5 V, GND a GND y OUT a una entrada digital del Arduino. El potenciómetro del módulo ajusta la sensibilidad. Se monta en la parte frontal del robot apuntando al suelo.",
        ejemplos: [
          "Robot seguidor de línea negra con 1, 2 o 3 sensores.",
          "Conteo de objetos que pasan por una banda transportadora.",
          "Detección de bordes de una mesa para que el robot no se caiga."
        ]
      },
      {
        id: "arduino-uno",
        name: "Arduino UNO con cable USB",
        image: "assets/images/components/arduino_uno.svg",
        queEs:
          "El Arduino UNO es una placa de desarrollo con el microcontrolador ATmega328P: 14 pines digitales (6 con PWM), 6 entradas analógicas, 16 MHz, mémoire flash de 32 KB y conexión USB para programarla y alimentarla.",
        paraQue:
          "Es el cerebro de los proyectos: lee sensores, ejecuta el programa y controla actuadores (motores, servos, LEDs, pantallas, relés).",
        funciona:
          "Ejecuta en bucle las instrucciones del programa cargado (setup y loop): lee el estado de sus entradas, procesa los datos con su CPU y actualiza las salidas. Se programa en C++ con el Arduino IDE.",
        utiliza:
          "Se conecta al computador con el cable USB, que alimenta la placa (5 V) y permite subir el código. Los sensores y actuadores se conectan a sus pines mediante cables jumper y la protoboard.",
        ejemplos: [
          "Controlador principal de los tres kits de esta plataforma.",
          "Robot seguidor de línea con sensores IR y driver L298N.",
          "Estación meteorológica con DHT11 que muestra datos en una pantalla LCD."
        ]
      }
    ]
  },

  {
    id: "kit2",
    name: "KIT 2",
    title: "Construcción y programación de robots móviles",
    description:
      "Kit orientado al armado de robots móviles, el control de motores y la integración de sensores para crear vehículos autónomos.",
    box: "assets/images/kits/kit2.svg",
    accent: "#0ea5e9",
    components: [
      {
        id: "kit-elegoo",
        name: "Kit de armado de robot Elegoo",
        image: "assets/images/components/elegoo.svg",
        queEs:
          "Es el conjunto completo para armar un robot móvil tipo 'smart car': chasis de acrílico con dos niveles, cuatro motorreductores amarillos con ruedas, soportes, tornillería, portapilas y la placa de control.",
        paraQue:
          "Sirve como base mecánica y estructural de un vehículo robot: sobre él se montan los sensores, la electrónica de control y la alimentación para construir un robot funcional.",
        funciona:
          "Los cuatro motorreductores amarillos mueven las ruedas de forma independiente; combinando sus sentidos de giro el vehículo avanza, retrocede y gira. El chasis de dos niveles separa la electrónica (arriba) de baterías y motores (abajo).",
        utiliza:
          "Se arma siguiendo el manual del fabricante: se atornillan los motores al chasis inferior, se monta la placa superior con separadores, se instala el Arduino y el shield de motores, y se cablean motores y sensores con los jumpers.",
        ejemplos: [
          "Carro robot seguidor de línea negra usando los sensores IR frontales.",
          "Vehículo que esquiva obstáculos con el sensor ultrasónico montado en un servo.",
          "Auto controlado a distancia por Bluetooth o por control infrarrojo."
        ]
      },
      {
        id: "ultrasonico-2",
        name: "Sensor ultrasónico",
        image: "assets/images/components/ultrasonico.svg",
        queEs:
          "Módulo HC-SR04 de medición de distancia por ultrasonido (2 cm a 4 m), con dos transductores cilíndricos sobre una placa azul.",
        paraQue:
          "En el robot móvil sirve para detectar obstáculos delante y tomar decisiones: frenar, girar o rodear el objeto.",
        funciona:
          "Emite un tren de pulsos de 40 kHz y mide el tiempo del eco; distancia = tiempo × velocidad del sonido / 2. En el código: distancia (cm) = duración del pulso en µs / 58.",
        utiliza:
          "VCC a 5 V, GND a GND, Trig y Echo a pines digitales del Arduino. Montado en la parte frontal del chasis (a menudo sobre un servo para barrer).",
        ejemplos: [
          "Modo 'esquiva obstáculos' del Elegoo: si distancia < 20 cm, girar.",
          "Robot que se estaciona solo midiendo el espacio disponible.",
          "Alarma de proximidad en un vehículo de vigilancia."
        ]
      },
      {
        id: "linea-ir-2",
        name: "Sensor de línea infrarrojo",
        image: "assets/images/components/linea.svg",
        queEs:
          "Módulo IR con LED emisor infrarrojo y fototransistor receptor que distingue superficies claras de oscuras según la luz reflejada.",
        paraQue:
          "En el robot móvil detecta la línea negra del circuito para que el vehículo la siga automáticamente sin intervención humana.",
        funciona:
          "Sobre fondo blanco la luz IR se refleja y la salida del módulo queda en un nivel; sobre la línea negra no hay reflexión y la salida cambia. Comparando varios sensores se sabe si el robot se desvía a izquierda o derecha.",
        utiliza:
          "VCC a 5 V, GND a GND y OUT a una entrada digital. Se fija en la parte inferior frontal del chasis, a pocos milímetros del suelo, con el potenciómetro ajustado para distinguir bien blanco y negro.",
        ejemplos: [
          "Seguidor de línea con 2 sensores: corrige la trayectoria comparando ambos.",
          "Detección del borde de la mesa para evitar caídas.",
          "Parada automática al llegar a una marca negra de 'fin de pista'."
        ]
      },
      {
        id: "servo-azul",
        name: "Servomotor azul",
        image: "assets/images/components/servo.svg",
        queEs:
          "Servomotor de carcasa azul (formato estándar tipo SG90) con eje de salida, brazo (horn) de plástico y cable de tres hilos.",
        paraQue:
          "En el robot móvil se usa para mover el sensor ultrasónico de izquierda a derecha y 'mirar' alrededor, o para dirigir ruedas delanteras.",
        funciona:
          "La señal PWM indica el ángulo (pulso de ~1 ms a ~2 ms para 0°–180°). La electrónica interna posiciona y mantiene el eje en ese ángulo con fuerza suficiente para mover cargas ligeras.",
        utiliza:
          "Cable marrón a GND, rojo a 5 V y amarillo/naranja a un pin PWM del Arduino o del shield. Se programa con la librería Servo: servo.write(90) lo centra, por ejemplo.",
        ejemplos: [
          "Soporte oscilante del HC-SR04 para detectar obstáculos en 180°.",
          "Dirección de un triciclo robot con rueda delantera motriz.",
          "Barrera automática que sube y baja el brazo al detectar presencia."
        ]
      },
      {
        id: "protoboard-2",
        name: "Protoboard",
        image: "assets/images/components/protoboard.svg",
        queEs:
          "Placa de pruebas sin soldadura con orificios interconectados en filas de 5 y buses de alimentación (+) y (−) a los lados.",
        paraQue:
          "Permite interconectar sensores, módulos y el Arduino durante el armado del robot sin soldar, facilitando cambios y pruebas.",
        funciona:
          "Cada grupo de 5 orificios está conectado internamente; las columnas roja (+) y azul (−) recorren toda la placa como buses de VCC y GND.",
        utiliza:
          "Se enchufan los componentes y jumpers respetando el canal central para los circuitos integrados; se usan las líneas de alimentación para repartir 5 V y GND a varios módulos.",
        ejemplos: [
          "Distribución de alimentación a varios sensores del robot Elegoo.",
          "Conexión de pulsadores y LEDs indicadores en el tablero de control.",
          "Pruebas rápidas de motores antes del montaje definitivo."
        ]
      },
      {
        id: "pinzas",
        name: "Pinzas para pelar cables",
        image: "assets/images/components/pinzas.svg",
        queEs:
          "Herramienta manual tipo pelacables/stripper: dos mangos aislados que pivotan sobre un tornillo y una cabeza metálica con orificios calibrados y filo de corte.",
        paraQue:
          "Sirve para retirar el aislante plástico de los extremos de los cables sin dañar los hilos de cobre internos, dejándolos listos para enchufar en la protoboard.",
        funciona:
          "Al apretar los mangos, los orificios calibrados de la cabeza cierran sobre el aislante y lo cortan; tirando del cable se desprende el plástico sin cortar el cobre. El filo superior sirve para cortar el cable a medida.",
        utiliza:
          "Se elige el orificio del diámetro adecuado al cable, se inserta unos 5–10 mm de punta, se aprieta y se tira. Siempre con la herramienta, no con los dientes, para no dañar el conductor.",
        ejemplos: [
          "Preparar los extremos de los cables de los motores del Elegoo.",
          "Hacer jumpers caseros a la medida necesaria.",
          "Reparar cables de alimentación pelados o dañados."
        ]
      },
      {
        id: "adaptador",
        name: "Adaptador de corriente",
        image: "assets/images/components/adaptador.svg",
        queEs:
          "Fuente de alimentación tipo 'wall wart': un adaptador AC-DC con clavija de pared y cable con conector cilíndrico (barrel jack) de 5.5 × 2.1 mm, típicamente de 9 V o 12 V.",
        paraQue:
          "Sirve para alimentar el robot y los motores desde la red eléctrica cuando las pilas no son suficientes, usando el conector de alimentación (jack) del Arduino o del driver.",
        funciona:
          "Transforma la corriente alterna de la pared (110/220 V) en corriente continua estable de bajo voltaje (ej. 9 V DC) con la corriente máxima indicada en su etiqueta (ej. 1 A).",
        utiliza:
          "Se enchufa a la corriente y su plug cilíndrico entra en el jack de alimentación del Arduino UNO o en el borne de entrada del driver L298N. Respetar la polaridad (centro positivo) y no exceder el voltaje máximo.",
        ejemplos: [
          "Alimentación externa del robot Elegoo para pruebas prolongadas.",
          "Fuente estable para motores que consumen más que lo que entrega el USB.",
          "Proyecto fijo de escritorio que no depende de pilas."
        ]
      },
      {
        id: "ir-control",
        name: "Sensor infrarrojo con control remoto",
        image: "assets/images/components/ir_control.svg",
        queEs:
          "Conjunto de dos partes: un control remoto con LED infrarrojo que emite códigos al presionar botones, y un receptor IR (tipo VS1838B) con cúpula oscura que recibe esos códigos.",
        paraQue:
          "Sirve para manejar el robot a distancia: avanzar, girar, detenerse o ejecutar modos predefinidos desde el control remoto.",
        funciona:
          "El control emite pulsos de luz infrarroja (940 nm) codificados según el protocolo NEC (cada botón tiene un código único). El receptor demodula la señal y entrega pulsos digitales que el Arduino decodifica con la librería IRremote.",
        utiliza:
          "El receptor tiene 3 pines: VCC a 5 V, GND a GND y OUT a un pin digital del Arduino. Se usa la librería IRremote: irrecv.decode() entrega el código del botón presionado y se ejecuta la acción correspondiente.",
        ejemplos: [
          "Robot Elegoo manejado con las flechas del control remoto.",
          "Selección de modos (seguidor de línea, esquiva obstáculos) con botones numéricos.",
          "Brazo robótico movido a distancia con un mando IR."
        ]
      },
      {
        id: "shield-l293d",
        name: "Shield de control de motores L293D",
        image: "assets/images/components/l293d_shield.svg",
        queEs:
          "Es una placa (shield) que se encaja directamente sobre el Arduino UNO y lleva dos circuitos L293D de doble puente H, bornes azules para motores y conectores para servos.",
        paraQue:
          "Sirve para controlar hasta 4 motores DC, 2 servos o 1 motor paso a paso sin cableado suelto: al apilarla sobre el Arduino, los motores se conectan directamente en sus bornes.",
        funciona:
          "Cada L293D contiene dos puentes H que permiten invertir la polaridad de cada motor. Las señales se enrutan internamente a pines fijos del Arduino (ej. pines 3, 5, 6, 9, 10, 11 en la versión clásica) controlados con la librería AFMotor.",
        utiliza:
          "Se apila sobre el Arduino UNO (pin a pin) y los cables de cada motor se atornillan en los bornes M1–M4. Se programa con la librería Adafruit Motor Shield: motor.setSpeed(255) y motor.run(FORWARD).",
        ejemplos: [
          "Control de los 4 motores del Elegoo con un solo shield apilado.",
          "Manejo de 2 servos para una torreta con sensor ultrasónico.",
          "Robot de 2 ruedas con control simple de velocidad y dirección."
        ]
      },
      {
        id: "arduino-uno-2",
        name: "Arduino UNO",
        image: "assets/images/components/arduino_uno.svg",
        queEs:
          "Placa Arduino UNO con microcontrolador ATmega328P: 14 pines digitales (6 PWM), 6 entradas analógicas, USB y jack de alimentación. Cerebro del robot móvil.",
        paraQue:
          "Controla todo el vehículo: lee los sensores (ultrasónico, línea, IR) y envía órdenes a los motores a través del shield o driver.",
        funciona:
          "Ejecuta el programa cargado por USB: en el loop() lee sensores, toma decisiones (if/else) y ordena a los motores avanzar, girar o detenerse.",
        utiliza:
          "Se monta sobre el chasis del robot (o debajo del shield), se alimenta por USB o por el jack con el adaptador, y se programa desde el Arduino IDE.",
        ejemplos: [
          "Programa 'esquiva obstáculos' del Elegoo con HC-SR04 y 4 motores.",
          "Seguidor de línea con corrección proporcional de dirección.",
          "Control por infrarrojo usando el receptor y el control remoto."
        ]
      },
      {
        id: "jumper-2",
        name: "Cables jumper",
        image: "assets/images/components/jumper.svg",
        queEs:
          "Cables conductores con conectores macho/hembra en los extremos, de varios colores, para interconectar la electrónica del robot sin soldar.",
        paraQue:
          "Sirven para unir sensores, módulos y motores con el Arduino/shield, permitiendo montar y desmontar el circuito fácilmente.",
        funciona:
          "Conducen la señal o la alimentación de un punto a otro. Los de color rojo suelen usarse para VCC, negro para GND y otros colores para señales.",
        utiliza:
          "Se enchufan en los headers del shield/Arduino y en los pines de los módulos. Conviene ordenarlos por color para encontrar fallos rápido.",
        ejemplos: [
          "Enlace de los sensores IR del chasis con el shield L293D.",
          "Conexión del receptor IR y del servo de la torreta.",
          "Alimentación de la protoboard desde los pines 5 V y GND."
        ]
      }
    ]
  },

  {
    id: "kit3",
    name: "KIT 3",
    title: "Automatización y sistemas inteligentes",
    description:
      "Kit orientado al desarrollo de sistemas de automatización, monitoreo ambiental y control con microcontroladores y conectividad (ESP32).",
    box: "assets/images/kits/kit3.svg",
    accent: "#10b981",
    components: [
      {
        id: "ultrasonico-3",
        name: "Sensor ultrasónico",
        image: "assets/images/components/ultrasonico.svg",
        queEs:
          "Módulo HC-SR04 que mide distancia por eco de ultrasonido, entre 2 cm y 4 m, con pines Trig y Echo.",
        paraQue:
          "En automatización sirve para detectar presencia o proximidad: abrir una puerta automática, contar objetos o activar una alarma cuando algo se acerca.",
        funciona:
          "Emite 8 pulsos de 40 kHz y mide el tiempo del eco en el pin Echo; distancia (cm) = tiempo (µs) / 58.",
        utiliza:
          "VCC a 5 V, GND a GND, Trig y Echo a pines digitales del ESP32/Arduino. En ESP32 se usa pulseIn() igual que en Arduino.",
        ejemplos: [
          "Puerta automática de maqueta que se abre al detectar una mano.",
          "Alarma de estacionamiento para un vehículo.",
          "Dispensador que detecta la presencia de un vaso."
        ]
      },
      {
        id: "modulo-aplausos",
        name: "Módulo de aplausos",
        image: "assets/images/components/aplausos.svg",
        queEs:
          "Módulo con micrófono y comparador LM393 que entrega una señal digital cuando detecta un sonido fuerte (aplauso, grito, golpe).",
        paraQue:
          "Sirve para activar acciones con la voz o el sonido: encender luces, contar palmadas o disparar una alarma por ruido.",
        funciona:
          "El micrófono genera una señal proporcional al sonido; el LM393 la compara con el umbral del potenciómetro y conmuta la salida OUT (activa en bajo) durante unos cientos de milisegundos.",
        utiliza:
          "VCC a 5 V (o 3.3 V en ESP32), GND a GND y OUT a una entrada digital. Ajustar el trimmer azul hasta que el LED indicador solo se encienda con sonidos fuertes.",
        ejemplos: [
          "Luz de la habitación que se controla con aplausos.",
          "Sistema de 'aplausómetro' que cuenta cuántas veces aplaude el público.",
          "Alarma antirrobo que suena ante ruidos fuertes."
        ]
      },
      {
        id: "resistencias-3",
        name: "Resistencias",
        image: "assets/images/components/resistencias.svg",
        queEs:
          "Componentes pasivos que limitan el paso de la corriente eléctrica; su valor en ohmios se lee por las bandas de colores.",
        paraQue:
          "Protegen LEDs y sensores, crean divisores de voltaje para leer el LDR o el potenciómetro, y fijan estados pull-up/pull-down en entradas digitales.",
        funciona:
          "Obedecen la Ley de Ohm (V = I × R): a mayor voltaje, la corriente que dejan pasar es menor según su resistencia; el excedente se disipa como calor.",
        utiliza:
          "Se conectan en serie con lo que se quiere proteger (ej. LED + 220 Ω) o como divisor con el LDR. No tienen polaridad.",
        ejemplos: [
          "LED indicador de estado del sistema con su resistencia de 220 Ω.",
          "Divisor de voltaje con el módulo LDR para medir la luz ambiental.",
          "Pull-down en pulsadores de control del sistema domótico."
        ]
      },
      {
        id: "jumper-3",
        name: "Cables jumper",
        image: "assets/images/components/jumper.svg",
        queEs:
          "Cables con conectores en los extremos para interconectar la protoboard, el ESP32 y los módulos sin soldar.",
        paraQue:
          "Organizan el cableado del sistema de automatización: alimentación y señales entre sensores, actuadores y la placa.",
        funciona:
          "Son conductores que llevan señal o alimentación de un punto a otro; el color ayuda a identificar VCC, GND y señales.",
        utiliza:
          "Se enchufan en los pines GPIO del ESP32 (con cuidado: algunos pines son solo entrada) y en la protoboard.",
        ejemplos: [
          "Conexión del DHT11, LCD y relé al ESP32.",
          "Alimentación de la protoboard desde 3.3 V y GND del ESP32.",
          "Enlace de sensores ambientales en una estación meteorológica."
        ]
      },
      {
        id: "protoboard-3",
        name: "Protoboard",
        image: "assets/images/components/protoboard.svg",
        queEs:
          "Placa de pruebas sin soldadura con filas de 5 orificios conectados y buses de + y − a los lados.",
        paraQue:
          "Permite montar el circuito del sistema de automatización (sensores + actuadores) y probarlo antes de la instalación definitiva.",
        funciona:
          "Las filas de 5 orificios están unidas internamente; las columnas roja/azul son buses de alimentación que recorren toda la placa.",
        utiliza:
          "Se enchufan componentes y jumpers; se usa el canal central para los integrados y los buses para VCC/GND. En ESP32, alimentar con 3.3 V.",
        ejemplos: [
          "Montaje del circuito del relé con su transistor y LED indicador.",
          "Pruebas del buzzer y del módulo de aplausos.",
          "Prototipo de la estación ambiental con DHT11 y LCD."
        ]
      },
      {
        id: "buzzer",
        name: "Buzzer",
        image: "assets/images/components/buzzer.svg",
        queEs:
          "El buzzer es un transductor electroacústico cilíndrico que convierte una señal eléctrica en sonido; puede ser activo (tono fijo) o pasivo (reproduce frecuencias).",
        paraQue:
          "Sirve para dar avisos sonoros: alarmas, confirmación de acciones, melodías de aviso o alertas de sensores en el sistema de automatización.",
        funciona:
          "Al pasar corriente por su bobina, un diafragma vibra produciendo sonido. El buzzer activo tiene oscilador interno (basta darle DC); el pasivo necesita una señal cuadrada de frecuencia definida (tone() en Arduino).",
        utiliza:
          "Pin positivo (+) al pin digital del microcontrolador (con resistencia si es necesario) y pin negativo a GND. Activo: digitalWrite HIGH suena. Pasivo: tone(pin, frecuencia, duración).",
        ejemplos: [
          "Alarma que suena cuando el HC-SR501 detecta movimiento.",
          "Aviso de que la puerta automática se está abriendo.",
          "Melodía de confirmación al registrar la huella/tecla correcta."
        ]
      },
      {
        id: "rele",
        name: "Módulo relé de un canal",
        image: "assets/images/components/rele.svg",
        queEs:
          "Módulo con un relé electromecánico (ej. SRD-05VDC) montado en placa azul, con bornes de tornillo (COM, NC, NO), optoacoplador y LED indicador.",
        paraQue:
          "Sirve como interruptor de potencia: permite que el microcontrolador encienda y apague appareils de alto voltaje (lámparas, bombas, electrodomésticos a 110/220 V) con total aislamiento eléctrico.",
        funciona:
          "Al aplicar 5 V (o 3.3 V según el módulo) en IN, la bobina del relé se energiza y el contacto móvil salta de NC a NO, cerrando el circuito de la carga. Al quitar la señal, vuelve a NC.",
        utiliza:
          "La señal IN va a un pin digital del ESP32/Arduino; VCC y GND a la alimentación. La carga se conecta en serie: fase de la red → borne COM del relé → borne NO → aparato → neutro. ¡Trabajar con precaución en 110/220 V!",
        ejemplos: [
          "Encender una lámpara de la casa desde una app con el ESP32.",
          "Activar una bomba de riego automático según la humedad del DHT11.",
          "Sistema de alarma que enciende una sirena de 110 V."
        ]
      },
      {
        id: "lcd1602",
        name: "Pantalla LCD 16x2 con módulo I2C",
        image: "assets/images/components/lcd_i2c.svg",
        queEs:
          "Pantalla de cristal líquido de 16 columnas × 2 filas con retroiluminación azul y controlador HD44780, que en este kit viene con el módulo I2C (backpack PCF8574) ya soldado detrás.",
        paraQue:
          "Sirve para mostrar información del sistema al usuario: lecturas de temperatura, mensajes de estado, menús o alertas, sin necesidad de computador.",
        funciona:
          "El módulo I2C traduce el protocolo serie I2C (pines SDA y SCL, dirección habitual 0x27) a las señales del controlador HD44780, así que la pantalla solo ocupa 2 pines del microcontrolador más la alimentación.",
        utiliza:
          "VCC a 5 V, GND a GND, SDA a GPIO21 (ESP32) o A4 (UNO), SCL a GPIO22 (ESP32) o A5 (UNO). Se programa con la librería LiquidCrystal_I2C: LiquidCrystal_I2C lcd(0x27, 16, 2); lcd.setCursor(0,0); lcd.print(\"Hola\").",
        ejemplos: [
          "Estación meteorológica que muestra temperatura y humedad del DHT11.",
          "Menú del sistema domótico para elegir el dispositivo a controlar.",
          "Mensaje 'Puerta abierta' cuando el ultrasónico detecta presencia."
        ]
      },
      {
        id: "hcsr501",
        name: "Sensor de presencia HC-SR501 (PIR)",
        image: "assets/images/components/hcsr501.svg",
        queEs:
          "Sensor de movimiento por infrarrojos pasivos (PIR) con cúpula blanca de Fresnel: detecta cambios en la radiación infrarroja cuando una persona u objeto caliente cruza su campo de visión.",
        paraQue:
          "Sirve para detectar presencia y movimiento: alarmas, luces automáticas, sistemas de vigilancia o activación de dispositivos al pasar alguien.",
        funciona:
          "Dos elementos piroeléctricos comparan la radiación IR recibida; al moverse una fuente de calor (cuerpo humano) entre zonas, la diferencia supera el umbral y la salida OUT pasa a HIGH durante un tiempo ajustable (2 s a varios minutos).",
        utiliza:
          "VCC a 5 V (acepta 4.5–20 V), GND a GND y OUT a un pin digital. Los dos potenciómetros ajustan el tiempo de salida y la sensibilidad/distancia (hasta ~7 m).",
        ejemplos: [
          "Luz automática del pasillo que se enciende al detectar movimiento.",
          "Alarma de seguridad con buzzer y aviso al celular vía ESP32.",
          "Contador de personas que entran a un salón."
        ]
      },
      {
        id: "ldr",
        name: "Módulo LDR (sensor de luz)",
        image: "assets/images/components/ldr.svg",
        queEs:
          "Módulo con una fotorresistencia LDR: un componente cuya resistencia eléctrica disminuye al aumentar la luz que recibe, montado en placa con comparador LM393.",
        paraQue:
          "Sirve para medir la intensidad luminosa del ambiente: encender luces automáticamente de noche, ajustar brillo de pantallas o registrar datos de iluminación.",
        funciona:
          "La LDR está hecha de un semiconductor (sulfuro de cadmio) cuya resistencia baja de megaohmios en la oscuridad a pocos cientos de ohmios a plena luz. En un divisor de voltaje con una resistencia fija, el voltaje resultante varía con la luz.",
        utiliza:
          "El módulo puede dar salida digital (DO, ajustada con el potenciómetro) o analógica (AO) a una entrada analógica del microcontrolador, que lee valores de 0 a 1023 (UNO) o 0 a 4095 (ESP32).",
        ejemplos: [
          "Lámpara automática que se enciende cuando oscurece.",
          "Seguidor solar: un servo orienta un panel hacia la luz.",
          "Registro de horas de sol en una estación meteorológica con ESP32."
        ]
      },
      {
        id: "servo-3",
        name: "Servomotor",
        image: "assets/images/components/servo.svg",
        queEs:
          "Servomotor de posición controlada (0°–180°) con eje, brazo plástico y cable de 3 hilos.",
        paraQue:
          "En automatización mueve compuertas, válvulas, persianas o mecanismos de apertura controlada desde el sistema inteligente.",
        funciona:
          "La duración del pulso PWM en su cable de señal determina el ángulo del eje (≈1 ms → 0°, ≈1.5 ms → 90°, ≈2 ms → 180°), que el servo mantiene con torque.",
        utiliza:
          "Alimentación 5 V (rojo/marrón) y señal PWM (amarillo/naranja) a un pin del ESP32. En ESP32 se usa la librería ESP32Servo: servo.write(ángulo).",
        ejemplos: [
          "Apertura automática de una puerta con el HC-SR501.",
          "Válvula de riego controlada por la humedad del suelo.",
          "Persiana que se orienta según la luz medida por el LDR."
        ]
      },
      {
        id: "esp32",
        name: "ESP32 DevKit con CH340",
        image: "assets/images/components/esp32.svg",
        queEs:
          "Placa de desarrollo ESP32 DevKit: microcontrolador de doble núcleo a 240 MHz con WiFi y Bluetooth integrados, 30+ pines GPIO y puerto USB con chip CH340.",
        paraQue:
          "Es el cerebro de los sistemas inteligentes conectados: además de leer sensores y mover actuadores, publica los datos en internet y recibe órdenes desde una app o página web.",
        funciona:
          "Ejecuta el programa en su memoria flash y se conecta a redes WiFi como cliente o crea su propio punto de acceso. Los pines GPIO admiten entradas/salidas digitales, analógicas (ADC), PWM (LEDC), I2C, SPI y UART.",
        utiliza:
          "Se programa con Arduino IDE (paquete ESP32) o MicroPython conectando el USB (driver CH340). Se alimenta por USB (5 V) o por el pin Vin (7–12 V). Cuidado: sus pines trabajan a 3.3 V.",
        ejemplos: [
          "Sistema domótico: controla relés y lee sensores desde el celular por WiFi.",
          "Estación meteorológica con DHT11 que publica datos en ThingSpeak.",
          "Robot móvil con cámara ESP32-CAM controlado por una página web."
        ]
      },
      {
        id: "dht11",
        name: "Sensor DHT11",
        image: "assets/images/components/dht11.svg",
        queEs:
          "Sensor digital de temperatura y humedad relativa en carcasa azul con rejilla de ventilación: mide de 0 a 50 °C (±2 °C) y 20–90 % de humedad (±5 %).",
        paraQue:
          "Sirve para el monitoreo ambiental: clima de una habitación, invernaderos, secado de alimentos o condiciones de almacenamiento, enviando los datos a una pantalla o a internet.",
        funciona:
          "Usa un termistor y un sensor de humedad capacitivo; un microcontrolador interno mide ambos y envía el resultado como señal digital serie por un único pin de datos (protocolo propio de 40 bits).",
        utiliza:
          "Tiene 3 pines: VCC a 3.3–5 V, GND a GND y DATA al pin digital del microcontrolador con una resistencia pull-up de 4.7–10 kΩ. Se lee con la librería DHT: dht.readTemperature() y dht.readHumidity().",
        ejemplos: [
          "Invernadero automatizado: si temperatura > 30 °C, enciende un ventilador (relé).",
          "Alerta de humedad alta en un cuarto de servidores.",
          "Estación meteorológica con LCD 16x2 y publicación web en ESP32."
        ]
      }
    ]
  }
];
