#!/usr/bin/env python3
# ============================================================
#  build_manual.py — Genera docs/MANUAL.pdf (manual de usuario
#  completo, ~50 páginas) a partir de tools/manual_data.json
#  (producido por tools/export_data.js con los datos REALES del
#  repositorio: kits, catálogo del lab y prácticas guiadas).
#
#  Uso:
#    node tools/export_data.js
#    python3 tools/build_manual.py        # (con reportlab + svglib)
# ============================================================
import json, os, re, sys
from xml.sax.saxutils import escape

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, Table, TableStyle, PageBreak, Image,
                                Preformatted, KeepTogether, NextPageTemplate)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfgen import canvas as pdfcanvas
from svglib.svglib import svg2rlg

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(open(os.path.join(ROOT, "tools", "manual_data.json"), encoding="utf-8"))
OUT = os.path.join(ROOT, "docs", "MANUAL.pdf")

PAGE_W, PAGE_H = A4
ML, MR, MT, MB = 1.8*cm, 1.8*cm, 2.1*cm, 1.9*cm

# ---------- saneamiento de texto para fuentes estándar (cp1252) ----------
SYMBOL_MAP = {"→": "->", "↔": "<->", "⬅": "<-", "⏻": "[ON/OFF]", "⚡": "*",
              "▶": ">", "■": "[]", "🗑": "", "↺": "", "⟳": "", "−": "-", "·": "-"}
def san(t):
    t = str(t)
    for k, v in SYMBOL_MAP.items():
        t = t.replace(k, v)
    t = t.encode("cp1252", "ignore").decode("cp1252")
    return t
def esc(t):  # escapa XML y conserva saltos de línea
    return escape(san(t)).replace("\n", "<br/>")
def P(t, style): return Paragraph(esc(t), style)

# ---------- estilos ----------
def st(name, **kw):
    base = dict(fontName="Helvetica", fontSize=9.5, leading=13, textColor=colors.HexColor("#0f172a"),
                alignment=TA_JUSTIFY, spaceAfter=5)
    base.update(kw)
    return ParagraphStyle(name, **base)

S = {
  "coverTitle": st("coverTitle", fontName="Helvetica-Bold", fontSize=26, leading=32, alignment=TA_CENTER, textColor=colors.HexColor("#0c4a6e")),
  "coverSub":   st("coverSub", fontSize=13, leading=18, alignment=TA_CENTER, textColor=colors.HexColor("#334155")),
  "coverMeta":  st("coverMeta", fontSize=10, leading=15, alignment=TA_CENTER, textColor=colors.HexColor("#64748b")),
  "h1":  st("h1", fontName="Helvetica-Bold", fontSize=17, leading=21, textColor=colors.HexColor("#0c4a6e"), spaceBefore=14, spaceAfter=8, alignment=TA_LEFT),
  "h2":  st("h2", fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=colors.HexColor("#075985"), spaceBefore=10, spaceAfter=5, alignment=TA_LEFT),
  "h3":  st("h3", fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=colors.HexColor("#0f172a"), spaceBefore=8, spaceAfter=4, alignment=TA_LEFT),
  "body": st("body"),
  "small": st("small", fontSize=8.5, leading=11.5, textColor=colors.HexColor("#334155")),
  "bullet": st("bullet", leftIndent=10, bulletIndent=2, spaceAfter=3),
  "code": st("code", fontName="Courier", fontSize=7.6, leading=9.6, alignment=TA_LEFT, textColor=colors.HexColor("#111827")),
  "tocH": st("tocH", fontName="Helvetica-Bold", fontSize=17, textColor=colors.HexColor("#0c4a6e"), spaceAfter=10),
  "cell": st("cell", fontSize=8.3, leading=11, alignment=TA_LEFT, spaceAfter=0),
  "cellB": st("cellB", fontName="Helvetica-Bold", fontSize=8.3, leading=11, alignment=TA_LEFT, spaceAfter=0, textColor=colors.white),
  "ficha": st("ficha", fontSize=9, leading=12.5),
}

ACCENT = colors.HexColor("#0284c7")
LIGHT = colors.HexColor("#f1f5f9")
BORDER = colors.HexColor("#cbd5e1")

# ---------- imágenes SVG incrustadas como dibujos vectoriales ----------
_img_cache = {}
def svg_flowable(rel, width_pt):
    if rel not in _img_cache:
        d = svg2rlg(os.path.join(ROOT, rel))
        _img_cache[rel] = d
    d = _img_cache[rel]
    if d is None:
        return Spacer(1, 1)
    sx = width_pt / float(d.width)
    d.scale(sx, sx)
    d.width *= sx
    d.height *= sx
    return d

# ---------- lienzo con numeración "Página X de Y" ----------
class NumberedCanvas(pdfcanvas.Canvas):
    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self._saved = []
    def showPage(self):
        self._saved.append(dict(self.__dict__))
        self._startPage()
    def save(self):
        n = len(self._saved)
        for state in self._saved:
            self.__dict__.update(state)
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawString(ML, 1.05*cm, san("Laboratorio Virtual de Robótica Educativa — Manual de usuario (PDF)"))
            self.drawRightString(PAGE_W - MR, 1.05*cm, f"Página {self._pageNumber} de {n}")
            super().showPage()
        super().save()

def on_page(canv, doc):
    canv.saveState()
    canv.setStrokeColor(BORDER); canv.setLineWidth(0.6)
    canv.line(ML, PAGE_H - 1.5*cm, PAGE_W - MR, PAGE_H - 1.5*cm)
    canv.setFont("Helvetica-Bold", 7.5); canv.setFillColor(colors.HexColor("#0c4a6e"))
    canv.drawString(ML, PAGE_H - 1.3*cm, san("Manual de usuario — Laboratorio Virtual de Robótica Educativa"))
    canv.setFont("Helvetica", 7.5); canv.setFillColor(colors.HexColor("#64748b"))
    canv.drawRightString(PAGE_W - MR, PAGE_H - 1.3*cm, san(DATA["site"]))
    canv.restoreState()

class ManualDoc(BaseDocTemplate):
    def afterFlowable(self, fl):
        if isinstance(fl, Paragraph):
            stn = fl.style.name
            if stn in ("h1", "h2"):
                txt = fl.getPlainText()
                lvl = 0 if stn == "h1" else 1
                self.notify("TOCEntry", (lvl, txt, self.page))

doc = ManualDoc(OUT, pagesize=A4, leftMargin=ML, rightMargin=MR, topMargin=MT, bottomMargin=MB,
                title=san("Manual de usuario — Laboratorio Virtual de Robótica Educativa"),
                author="migulopez", subject="Manual completo de la plataforma y del laboratorio virtual")
frame = Frame(ML, MB, PAGE_W - ML - MR, PAGE_H - MT - MB, id="main")
doc.addPageTemplates([PageTemplate(id="page", frames=[frame], onPage=on_page)])

# ---------- utilidades de construcción ----------
def h1(t): return Paragraph(san(t), S["h1"])
def h2(t): return Paragraph(san(t), S["h2"])
def h3(t): return Paragraph(san(t), S["h3"])
def body(t): return P(t, S["body"])
def small(t): return P(t, S["small"])
def bullet(t): return Paragraph("• " + esc(t), S["bullet"])
def code_block(code):
    tbl = Table([[Preformatted(san(code), S["code"])]], colWidths=[PAGE_W - ML - MR - 8])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ("BOX", (0,0), (-1,-1), 0.7, BORDER),
        ("LINEBEFORE", (0,0), (0,-1), 2.5, ACCENT),
        ("LEFTPADDING", (0,0), (-1,-1), 7), ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 5), ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ]))
    return tbl
def table(rows, widths, header=True, fontsize=None):
    data = []
    for i, r in enumerate(rows):
        row = []
        for c in r:
            if isinstance(c, str):
                row.append(Paragraph(esc(c), S["cellB"] if (header and i == 0) else S["cell"]))
            else:
                row.append(c)
        data.append(row)
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    style = [
        ("GRID", (0,0), (-1,-1), 0.5, BORDER),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 4), ("RIGHTPADDING", (0,0), (-1,-1), 4),
        ("TOPPADDING", (0,0), (-1,-1), 3), ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, LIGHT]),
    ]
    if header:
        style += [("BACKGROUND", (0,0), (-1,0), ACCENT)]
    t.setStyle(TableStyle(style))
    return t
def kit_badges(kits):
    return "Kit " + ", Kit ".join(str(k) for k in kits) if kits else "—"

story = []

# ================= PORTADA =================
story.append(Spacer(1, 3.2*cm))
story.append(Paragraph(san("🤖 Laboratorio Virtual de Robótica Educativa"), S["coverTitle"]))
story.append(Spacer(1, 0.5*cm))
story.append(Paragraph(san("MANUAL DE USUARIO COMPLETO"), ParagraphStyle("x", parent=S["coverSub"], fontName="Helvetica-Bold", fontSize=17, textColor=ACCENT)))
story.append(Spacer(1, 0.35*cm))
story.append(Paragraph(san("Explorador de los 3 kits de robótica educativa + laboratorio virtual de electrónica con simulación eléctrica real, multímetro, fuente regulable e intérprete de Arduino/ESP32 con 11 prácticas guiadas."), S["coverSub"]))
story.append(Spacer(1, 1.1*cm))
boxes = Table([[svg_flowable(k["box"], 42*mm) for k in DATA["kits"]]], colWidths=[(PAGE_W-ML-MR)/3.0]*3)
boxes.setStyle(TableStyle([("ALIGN", (0,0), (-1,-1), "CENTER"), ("VALIGN", (0,0), (-1,-1), "MIDDLE")]))
story.append(boxes)
story.append(Spacer(1, 1.0*cm))
story.append(Paragraph(san(f"Versión: {DATA['generado']} &nbsp;|&nbsp; Sitio web: {DATA['site']}"), S["coverMeta"]))
story.append(Paragraph(san(f"Repositorio: {DATA['repo']} &nbsp;|&nbsp; Este documento: docs/MANUAL.pdf"), S["coverMeta"]))
story.append(Paragraph(san("Generado automáticamente desde los datos del proyecto (tools/export_data.js + tools/build_manual.py)."), S["coverMeta"]))
story.append(PageBreak())

# ================= ÍNDICE =================
story.append(Paragraph("Índice", S["tocH"]))
toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle("toc0", fontName="Helvetica-Bold", fontSize=10, leading=15, leftIndent=2, textColor=colors.HexColor("#0c4a6e")),
    ParagraphStyle("toc1", fontName="Helvetica", fontSize=8.8, leading=12.5, leftIndent=14, textColor=colors.HexColor("#334155")),
]
story.append(toc)
story.append(PageBreak())

# ================= 1. INTRODUCCIÓN =================
story.append(h1("1. Introducción y acceso a la plataforma"))
story.append(body("El <b>Laboratorio Virtual de Robótica Educativa</b> es una aplicación web de una sola página (HTML5 + CSS3 + JavaScript puro, sin frameworks ni dependencias externas en tiempo de ejecución) con dos módulos:"))
story.append(bullet("<b>Explorador de kits</b>: tres cajas de kits de robótica educativa sobre una mesa de trabajo. Al hacer clic en una caja se abre el kit y se muestran todos sus componentes con ficha técnica ampliada (qué es, para qué sirve, cómo funciona, cómo se utiliza y ejemplos)."))
story.append(bullet("<b>Laboratorio virtual de electrónica</b>: una mesa de simulación donde se colocan componentes reales, se tienden cables entre sus pines, se alimenta el circuito con fuentes regulables, se mide con un multímetro digital y se programa un Arduino UNO o un ESP32 con un intérprete controlado que ejecuta el código contra el circuito eléctrico real (resuelto con análisis nodal modificado, MNA). Incluye 11 prácticas guiadas."))
story.append(h2("1.1 Acceso online"))
story.append(body(f"La aplicación está publicada con GitHub Pages: <b>{DATA['site']}</b>"))
story.append(body("Después de cada actualización del sitio, espera 1–2 minutos a que termine el build y refresca el navegador con <b>Ctrl+Shift+R</b> (o abre la URL con un parámetro anti-caché, por ejemplo <i>?v=8</i>). Si un botón «no aparece», casi siempre es caché del navegador."))
story.append(h2("1.2 Ejecución local"))
story.append(body("Descarga o clona el repositorio y abre <b>index.html</b> directamente en el navegador, o sirvételo con cualquier servidor estático:"))
story.append(code_block("git clone https://github.com/migulopez/kits_robotica.git\ncd kits_robotica\npython3 -m http.server 8000\n# abre http://localhost:8000/"))
story.append(h2("1.3 Requisitos"))
story.append(bullet("Navegador moderno con soporte de SVG, Canvas y WebAudio (Chrome, Edge, Firefox, Safari recientes)."))
story.append(bullet("Conexión a internet solo la primera vez (la app no usa librerías externas; todos los gráficos son SVG locales)."))
story.append(bullet("Para ejecutar las pruebas del motor: Node.js (comando: <i>node tests/engine.test.js</i>)."))
story.append(PageBreak())

# ================= 2. EXPLORADOR DE KITS =================
story.append(h1("2. El explorador de kits"))
story.append(body("La pantalla inicial muestra una <b>mesa de trabajo con 3 cajas</b>, una por kit. Encima hay un botón grande pulsante <b>«Laboratorio virtual de electrónica»</b> que abre directamente el laboratorio. En la parte superior también hay un filtro <b>Todos / Kit 1 / Kit 2 / Kit 3</b>."))
story.append(h2("2.0 Cómo abrir un kit y leer las fichas"))
story.append(bullet("Haz <b>clic en una caja</b>: esa caja se «abre» y las demás se apartan; aparece la vista del kit con su título y descripción."))
story.append(bullet("La vista del kit muestra una <b>rejilla de tarjetas</b>, una por componente (imagen + nombre)."))
story.append(bullet("Haz <b>clic en una tarjeta</b> para abrir su <b>ficha técnica</b>: imagen grande, <i>qué es</i>, <i>para qué sirve</i>, <i>cómo funciona</i>, <i>cómo se utiliza</i> (conexiones y código) y <i>ejemplos</i>. Cierra la ficha con la ✕ o haciendo clic fuera."))
story.append(bullet("Usa <b>«⬅ Volver a la mesa»</b> para regresar a las tres cajas, y el botón <b>«⚡ Laboratorio virtual»</b> (junto a Volver) para saltar al laboratorio con ese kit preseleccionado en la paleta."))
story.append(Spacer(1, 4))

for kit in DATA["kits"]:
    story.append(h2(f"2.{int(kit['id'][-1])} {kit['name']} — {kit['title']} ({len(kit['components'])} componentes)"))
    story.append(body(kit["description"]))
    rows = [["#", "Componente", "Imagen"]]
    for i, c in enumerate(kit["components"], 1):
        rows.append([str(i), c["name"], ""])
    t = table(rows, [8*mm, 105*mm, 50*mm])
    # imágenes en la última columna
    for i, c in enumerate(kit["components"], 1):
        t._cellvalues[i][2] = svg_flowable(c["image"], 40*mm)
    story.append(t)
    story.append(Spacer(1, 6))
    story.append(h3(f"Fichas técnicas de los componentes del {kit['name']}"))
    for c in kit["components"]:
        img = svg_flowable(c["image"], 40*mm)
        lines = []
        for label, key in [("Qué es", "queEs"), ("Para qué sirve", "paraQue"), ("Cómo funciona", "funciona"), ("Cómo se utiliza", "utiliza")]:
            if c.get(key):
                lines.append(Paragraph(f"<b>{esc(label)}:</b> {esc(c[key])}", S["ficha"]))
        if c.get("ejemplos"):
            lines.append(Paragraph("<b>Ejemplos:</b>", S["ficha"]))
            for e in c["ejemplos"]:
                lines.append(Paragraph("• " + esc(e), ParagraphStyle("ex", parent=S["ficha"], leftIndent=8, fontSize=8.6, leading=11.5)))
        ficha = Table([[img, lines]], colWidths=[46*mm, PAGE_W - ML - MR - 46*mm])
        ficha.setStyle(TableStyle([
            ("VALIGN", (0,0), (-1,-1), "TOP"),
            ("BOX", (0,0), (-1,-1), 0.7, BORDER),
            ("BACKGROUND", (0,0), (0,0), LIGHT),
            ("LEFTPADDING", (0,0), (-1,-1), 6), ("RIGHTPADDING", (0,0), (-1,-1), 6),
            ("TOPPADDING", (0,0), (-1,-1), 5), ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ]))
        story.append(KeepTogether([h3(f"{c['name']}"), ficha, Spacer(1, 5)]))
    story.append(PageBreak())

# ================= 3. LABORATORIO VIRTUAL =================
story.append(h1("3. El laboratorio virtual de electrónica"))
story.append(h2("3.1 Cómo entrar"))
story.append(bullet("Desde la pantalla de inicio: botón grande <b>«⚡ Laboratorio virtual de electrónica»</b> del encabezado."))
story.append(bullet("Desde la vista de un kit: botón <b>«⚡ Laboratorio virtual»</b> junto a «⬅ Volver a la mesa» (la paleta queda filtrada a ese kit)."))
story.append(bullet("Para salir: <b>«⬅ Volver a los kits»</b>."))
story.append(h2("3.2 Partes de la pantalla"))
story.append(table([
    ["Zona", "Qué contiene", "Para qué sirve"],
    ["Barra superior", "⬅ Volver · ⏻ Alimentación ON/OFF · ↺ Reiniciar · 🗑 Limpiar mesa · 📚 Prácticas guiadas · zoom − 100% + · ⟳ Rotar componente", "Control general del laboratorio"],
    ["Paleta izquierda", "Filtro de kit (Todos/Kit 1/2/3) · selector de color de cable · 9 categorías con los 25 componentes y su etiqueta de kit (K1·K2…)", "Arrastrar componentes a la mesa"],
    ["Mesa central", "Mundo virtual de 4000×4000 px con rejilla, componentes y capa SVG de cables", "Montar y cablear el circuito"],
    ["Panel derecho", "① Propiedades del componente seleccionado ② Avisos del circuito ③ Editor de código + ▶ Cargar y ejecutar / ■ Detener + monitor serial", "Configurar, validar y programar"],
], [30*mm, 92*mm, 41*mm]))
story.append(h2("3.3 Los 25 componentes del laboratorio (con su kit y sus pines)"))
cat_name = {c["id"]: c["name"] for c in DATA["categories"]}
rows = [["Componente", "Categoría", "Kit", "Pines (en el orden del dibujo)"]]
for t, d in DATA["catalog"].items():
    pins = ", ".join(f"{p['name']}{' (GND)' if p['gnd'] else ' (VCC)' if p['vcc'] else ''}" for p in d["pins"])
    rows.append([d["name"], cat_name.get(d["cat"], d["cat"]), kit_badges(d["kits"]), pins])
story.append(table(rows, [42*mm, 30*mm, 22*mm, 69*mm]))
story.append(body("Las etiquetas <b>K1·K2…</b> de la paleta indican de qué kit(s) es cada componente, igual que las insignias «Kit N» de las prácticas guiadas."))
story.append(h2("3.4 Colocar, mover, rotar y eliminar"))
story.append(bullet("<b>Colocar:</b> arrastra un componente desde la paleta y suéltalo en la mesa (queda centrado donde lo sueltes)."))
story.append(bullet("<b>Seleccionar:</b> clic en el componente. Aparecen sus propiedades en el panel derecho."))
story.append(bullet("<b>Mover:</b> arrastra el cuerpo del componente."))
story.append(bullet("<b>Rotar:</b> con el componente seleccionado, pulsa «⟳ Rotar» (gira 90° cada vez)."))
story.append(bullet("<b>Eliminar:</b> con el componente o el cable seleccionado, pulsa <b>Supr</b> (en los cables también vale <b>clic derecho</b>). «🗑 Limpiar mesa» borra todo y «↺ Reiniciar» vuelve al estado inicial."))
story.append(bullet("<b>Vista:</b> la <b>rueda del ratón</b> hace zoom (se muestra el porcentaje) y arrastrar el <b>fondo</b> desplaza la vista (paneo). Los botones − / + también hacen zoom."))
story.append(body("Mientras el laboratorio está abierto no se selecciona texto (no aparece el resaltado azul al arrastrar cables sobre los componentes)."))
story.append(h2("3.5 Tender cables entre pines"))
story.append(bullet("Haz <b>clic en un pin</b> (círculo del borde del componente) y luego <b>clic en otro pin</b>: se tiende el cable. Mientras arrastras se ve el cable provisional."))
story.append(bullet("Los pines de alimentación se distinguen por color: <b>rojo = +/VCC/5V</b>, <b>gris = GND</b>, amarillo = señal."))
story.append(bullet("<b>Color del cable:</b> el selector de la paleta permite elegir (Automático, rojo, negro, amarillo, verde, azul, blanco). Con «Automático»: + → rojo, GND → negro, señal → amarillo."))
story.append(bullet("Clic en un cable lo selecciona (resaltado); <b>Supr</b> o <b>clic derecho</b> lo elimina."))
story.append(h2("3.6 Alimentación y medición"))
story.append(bullet("Pulsa <b>«⏻ Alimentación: ON»</b>: es el interruptor general. Con OFF, todas las fuentes y los microcontroladores quedan en 0 V."))
story.append(bullet("<b>Fuente regulable 0–12 V</b>: ajusta el voltaje con el deslizador del panel de propiedades; su pantalla muestra el valor."))
story.append(bullet("<b>Arduino UNO / ESP32</b>: se alimentan por USB (automático al ponerlos), por VIN o por el pin 5V, y entregan tensión entre <b>5V (o 3V3) y GND</b> — p. ej. 5V↔GND = 5,000 V en el multímetro (GND y GND2 son el mismo nodo interno). El ESP32 trabaja a 3,3 V."))
story.append(bullet("<b>Multímetro digital</b>: conecta <b>COM</b> (sonda negra) y <b>VΩ</b> (sonda roja) y elige el modo en sus propiedades: <b>V</b> (voltaje, en paralelo), <b>A</b> (corriente, en serie con el circuito), <b>Ω</b> (resistencia entre puntas; con el circuito alimentado muestra «OL»)."))
story.append(h2("3.7 Propiedades editables por componente"))
story.append(table([
    ["Componente", "Propiedades que puedes ajustar en el panel derecho"],
    ["Fuente regulable", "Voltaje 0–12 V (deslizador), encendido/apagado"],
    ["Resistencia", "Valor en ohmios (R)"],
    ["Potenciómetro", "Posición (se gira arrastrando la perilla directamente en la mesa)"],
    ["Multímetro", "Modo: V / A / Ω"],
    ["HC-SR04", "Distancia detectada (cm) — el programa la leerá con pulseIn()"],
    ["LDR", "Nivel de luz 0–1 (afecta la salida analógica AO)"],
    ["DHT11", "Temperatura (°C) y humedad (%) que entregará el sensor"],
    ["HC-SR501 / línea IR / IR obstáculos", "Estado (movimiento, línea negra, obstáculo)"],
    ["Arduino / ESP32", "Alimentación por USB (propiedad usb)"],
], [45*mm, 118*mm]))
story.append(h2("3.8 Programación: editor, intérprete y monitor serial"))
story.append(bullet("Escribe el código en el <b>editor</b> (con resaltado de sintaxis) o cárgalo desde una práctica guiada («📄 Cargar código en el editor»)."))
story.append(bullet("Pulsa <b>«▶ Cargar y ejecutar»</b>: el intérprete transpila el código Arduino/ESP32 (C++ → JS) y lo ejecuta contra los nodos eléctricos reales del circuito. <b>«■ Detener»</b> detiene el programa."))
story.append(bullet("Los mensajes de <b>Serial.print/println</b> aparecen en el <b>monitor serial</b> del panel derecho."))
story.append(bullet("El programa <b>solo funciona si el cableado es correcto</b>: por ejemplo, analogRead(A0) lee el voltaje real del nodo A0; digitalWrite pone 5 V (o 0 V) en el pin con su resistencia interna; un LED conectado a un pin de salida se enciende de verdad."))
story.append(h3("API soportada por el intérprete"))
story.append(table([
    ["Grupo", "Funciones / clases"],
    ["Pines digitales", "pinMode, digitalWrite, digitalRead (constantes HIGH, LOW, INPUT, OUTPUT, INPUT_PULLUP)"],
    ["Pines analógicos", "analogRead (A0–A5 = 14–19), analogWrite (PWM en pines ~), map, constrain"],
    ["Tiempo", "delay, delayMicroseconds, millis"],
    ["Tono", "tone(pin, Hz[, duración]), noTone(pin)"],
    ["Pulso / distancia", "pulseIn(pin, HIGH) — usado con el HC-SR04"],
    ["Serial", "Serial.begin, Serial.print, Serial.println"],
    ["Servo", "Servo: attach(pin), write(ángulo 0–180), writeMicroseconds"],
    ["LCD 16x2 (I2C)", "LiquidCrystal_I2C lcd(0x27, 16, 2): begin, setCursor, print, clear"],
    ["LCD 16x2 (paralelo, heredada)", "LiquidCrystal lcd(rs, e, d4, d5, d6, d7)"],
    ["Sensores", "DHT: readTemperature/readHumidity · IRrecv: enableIRIn/decode"],
], [40*mm, 123*mm]))
story.append(h3("Ejemplo mínimo (LED en D9)"))
story.append(code_block('int led = 9;\n\nvoid setup() {\n  pinMode(led, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(led, HIGH);   // 5 V en D9 -> el LED se enciende\n  Serial.println("LED ON");\n  delay(1000);\n  digitalWrite(led, LOW);\n  Serial.println("LED OFF");\n  delay(1000);\n}'))
story.append(h2("3.9 La pantalla LCD 16x2 con módulo I2C"))
story.append(bullet("En el kit 3 y en el lab la LCD viene <b>con el módulo I2C (PCF8574, dirección habitual 0x27)</b> ya soldado: solo tiene 4 pines: <b>VCC, GND, SDA, SCL</b>."))
story.append(bullet("Conexiones: VCC → 5 V, GND → GND, <b>SDA → A4</b>, <b>SCL → A5</b> en el Arduino UNO; en el ESP32 <b>SDA → D21 (GPIO21)</b>, <b>SCL → D22 (GPIO22)</b>."))
story.append(bullet("Código: <i>LiquidCrystal_I2C lcd(0x27, 16, 2); lcd.begin(16, 2); lcd.setCursor(0, 0); lcd.print(\"HOLA MUNDO\");</i>"))
story.append(bullet("La simulación solo dibuja el texto en la pantalla virtual si la LCD está alimentada (VCC/GND) y SDA/SCL llegan a los pines I2C del microcontrolador; si no, aparece un aviso explicándolo."))
story.append(h2("3.10 Avisos inteligentes (validación en español)"))
story.append(body("El panel «⚠ Avisos del circuito» detecta y explica en tiempo real:"))
for m in ["Cortocircuito (cable directo entre + y − de una fuente)",
          "LED conectado con polaridad invertida (no enciende)",
          "LED sin resistencia limitadora o con más de 30 mA (riesgo de daño)",
          "Resistencia que disipa más de 250 mW",
          "Componentes sin alimentación (p. ej. LCD sin VCC/GND)",
          "LCD encendida pero sin SDA/SCL hacia el microcontrolador",
          "Pines del Arduino/ESP32 sin conectar y pines de salida con más de 40 mA"]:
    story.append(bullet(m))
story.append(PageBreak())

# ---- 3.11 prácticas guiadas ----
story.append(h1("4. Prácticas guiadas (11 proyectos)"))
story.append(body("Desde <b>«📚 Prácticas guiadas»</b> se abre el índice: cada tarjeta muestra el título, el objetivo y las <b>insignias «Kit N»</b> de los kits a los que pertenecen sus componentes. Al entrar en una práctica ves el objetivo, la lista de componentes <b>con su kit</b>, el <b>diagrama de conexiones</b>, los pasos, la explicación y el código de ejemplo, con botones para <b>colocar los componentes en la mesa (sin conectarlos: tú debes tender los cables)</b> y para cargar el código en el editor."))
story.append(Spacer(1, 4))
for p in DATA["projects"]:
    story.append(h2(f"4.{p['n']} Práctica {p['n']}: {p['title']}"))
    story.append(body(f"<b>Objetivo:</b> {p['objective']}"))
    kits = sorted({k for c in p["comps"] for k in DATA["catalog"][c["type"]]["kits"]})
    story.append(body(f"<b>Kits de los componentes:</b> {kit_badges(kits)}"))
    comp_rows = [["Componente", "Kit", "Propiedades iniciales"]]
    for c in p["comps"]:
        d = DATA["catalog"][c["type"]]
        props = ", ".join(f"{k}={v}" for k, v in c["props"].items()) or "—"
        comp_rows.append([d["name"], kit_badges(d["kits"]), props])
    story.append(table(comp_rows, [62*mm, 34*mm, 67*mm]))
    story.append(Spacer(1, 3))
    wire_rows = [["Desde", "Hasta"]]
    for a, pa, b, pb in p["wires"]:
        na, nb = DATA["catalog"][p["comps"][a]["type"]]["name"], DATA["catalog"][p["comps"][b]["type"]]["name"]
        wire_rows.append([f"{na} · pin {pa}", f"{nb} · pin {pb}"])
    story.append(h3("Diagrama de conexiones (cables que debes tender)"))
    story.append(table(wire_rows, [80*mm, 83*mm]))
    story.append(h3("Pasos"))
    for i, s in enumerate(p["steps"], 1):
        story.append(Paragraph(f"<b>{i}.</b> {esc(s)}", ParagraphStyle("step", parent=S["body"], leftIndent=10, spaceAfter=2.5)))
    story.append(h3("Funcionamiento"))
    story.append(body(p["explanation"]))
    story.append(h3("Código de ejemplo"))
    story.append(code_block(p["code"]))
    story.append(PageBreak())

# ================= 5. REFERENCIA DE PINES =================
story.append(h1("5. Referencia de pines de las placas y la LCD"))
story.append(h2("5.1 Arduino UNO"))
ard = DATA["catalog"]["arduino"]["pins"]
rows = [["Pin", "Nombre", "Tipo"]]
for p in ard:
    rows.append([p["id"], p["name"], "GND" if p["gnd"] else "VCC/5V" if p["vcc"] else "E/S (PWM en los marcados ~)"])
story.append(table(rows, [25*mm, 45*mm, 93*mm]))
story.append(body("Alimentación: USB (automático), VIN (7–12 V) o 5 V. Entrega 5 V entre 5V y GND (y 3,3 V en 3V3). Pines I2C: A4 = SDA, A5 = SCL."))
story.append(h2("5.2 ESP32 DevKit (CH340)"))
esp = DATA["catalog"]["esp32"]["pins"]
rows = [["Pin", "Tipo"]]
for p in esp:
    rows.append([p["name"], "GND" if p["gnd"] else "VCC (5V/3V3)" if p["vcc"] else "GPIO (E/S)"])
story.append(table(rows, [40*mm, 60*mm]))
story.append(body("Trabaja a 3,3 V. Pines I2C por defecto: D21 = SDA (GPIO21), D22 = SCL (GPIO22)."))
story.append(h2("5.3 LCD 16x2 con módulo I2C"))
story.append(table([["Pin", "Conexión típica"],
                    ["VCC", "5 V (del Arduino/ESP32 o de la fuente)"],
                    ["GND", "GND"],
                    ["SDA", "A4 (UNO) / D21-GPIO21 (ESP32)"],
                    ["SCL", "A5 (UNO) / D22-GPIO22 (ESP32)"]], [30*mm, 100*mm]))
story.append(h2("5.4 Multímetro digital"))
story.append(table([["Pin", "Uso"], ["COM (negra)", "Referencia común de las mediciones"],
                    ["VΩ (roja)", "Voltaje (en paralelo) u ohmios"],
                    ["A", "Amperímetro (en serie con el circuito)"]], [35*mm, 95*mm]))
story.append(PageBreak())

# ================= 6. SIMULACIÓN =================
story.append(h1("6. Cómo funciona la simulación eléctrica"))
story.append(body("El motor (<i>js/lab/engine.js</i>) resuelve el circuito con <b>análisis nodal modificado (MNA)</b>: cada pin es un nodo, los cables unen nodos (union-find), y cada componente aporta sus ecuaciones: resistencias, fuentes de voltaje con resistencia interna, diodos (LED con Vf ≈ 2 V y 8 Ω), motores, buzzers, relés, drivers L298N/L293D, sensores con salidas analógicas/digitales y los pines de salida del microcontrolador (≈25 Ω internos). Los pines GND de un mismo componente son el mismo nodo interno."))
story.append(bullet("<b>Valores de ejemplo:</b> LED + 220 Ω a 5 V → ≈ 13 mA y 2 V en el LED; resistencia sola de 220 Ω a 5 V → 22,7 mA; potenciómetro como divisor; 5 V↔GND del Arduino alimentado = 5,000 V."))
story.append(bullet("<b>El multímetro lee los nodos reales</b>: V entre sus puntas, A como caída en su derivación de 0,05 Ω, Ω inyectando 1 V y midiendo V/I con el circuito sin alimentación."))
story.append(bullet("<b>El intérprete</b> lee/escribe esos mismos nodos: analogRead(A0) = 1023 × V(A0)/Vcc; pulseIn del HC-SR04 = distancia × 58 µs; digitalRead ve 0/5 V reales."))
story.append(body("Pruebas del motor (46 aserciones, Node.js):"))
story.append(code_block("node tests/engine.test.js     # resultado esperado: 46 pasados, 0 fallados"))

# ================= 7. PROBLEMAS =================
story.append(h1("7. Solución de problemas"))
story.append(table([
    ["Síntoma", "Causa probable", "Solución"],
    ["«No aparece el botón del laboratorio» en la web", "Caché del navegador tras una actualización", "Ctrl+Shift+R o abrir con ?v=N; esperar 1–2 min al build de Pages"],
    ["El Arduino marca 0 V entre 5V y GND", "Alimentación general en OFF, o sonda en un nodo no tierra", "Pulsa ⏻ ON; usa un pin GND (GND y GND2 son el mismo nodo)"],
    ["El buzzer no suena", "Pin sin señal (ni HIGH ni tone) o alimentación OFF", "Revisa el código (tone/D8=HIGH) y ⏻ ON; tras apagar/encender vuelve a sonar"],
    ["La LCD no muestra nada", "Sin VCC/GND o sin SDA/SCL al MCU", "VCC→5V, GND→GND, SDA→A4/D21, SCL→A5/D22; mira el aviso del panel"],
    ["El LED no enciende / aviso de polaridad", "Ánodo y cátodo invertidos", "Intercámbelos; el ánodo va hacia la resistencia/+"],
    ["Aviso «LED puede dañarse»", "Sin resistencia en serie o corriente > 30 mA", "Añade 220 Ω en serie"],
    ["Error de sintaxis al ejecutar", "El código tiene un error de compilación", "Léelo en el monitor serial (línea del error) y corrígelo en el editor"],
    ["Los pines se ven muy juntos", "Versión vieja en caché", "Ctrl+Shift+R / ?v=N (en la versión actual cada placa es más grande y los pines van separados con etiquetas)"],
    ["Al arrastrar cables se seleccionaba texto azul", "—", "Ya está corregido: la selección de texto está desactivada dentro del laboratorio"],
], [52*mm, 52*mm, 59*mm]))
story.append(PageBreak())

# ================= 8. GLOSARIO =================
story.append(h1("8. Glosario"))
glos = [
    ("MNA", "Modified Nodal Analysis: método para resolver circuitos eléctricos planteando ecuaciones de nodos."),
    ("PWM", "Pulse Width Modulation: señal cuadrada cuyo ciclo de trabajo (0–255) controla potencia/brillo/posición de servo."),
    ("I2C", "Bus serie de 2 hilos (SDA datos, SCL reloj); la LCD del kit 3 lo usa vía el módulo PCF8574 en la dirección 0x27."),
    ("Pull-up", "Resistencia a VCC que fija un pin en alto cuando no hay nada conectado (modo INPUT_PULLUP)."),
    ("Divisor de tensión", "Dos resistencias en serie; el punto medio entrega una fracción del voltaje (lo usa el potenciómetro y el LDR)."),
    ("Relé", "Interruptor electromecánico: la bobina (IN) conmuta el contacto COM entre NC (cerrado en reposo) y NO (cerrado activado)."),
    ("HC-SR04", "Sensor ultrasónico de distancia: Trig emite un pulso y Echo devuelve uno cuyo ancho = tiempo de vuelo (cm = µs/58)."),
    ("DHT11", "Sensor de temperatura y humedad digital de un solo pin (DATA)."),
    ("LDR", "Light Dependent Resistor: fotoresistencia; su módulo da una salida analógica (AO) proporcional a la luz."),
    ("L298N / L293D", "Drivers de motores DC: controlan velocidad (PWM en ENA/ENB o pines ~) y dirección (IN1/IN2…)."),
    ("Protoboard", "Placa de pruebas sin soldadura para prototipar circuitos."),
    ("Jumper", "Cable con conector para unir puntos de la protoboard o pines."),
    ("Servo", "Motor con control de posición (0–180°) mediante pulsos; aquí se maneja con Servo.write()."),
    ("USB / VIN / 5V", "Formas de alimentar el Arduino: por el puerto USB, por VIN (7–12 V) o directamente 5 V en el pin 5V."),
    ("GND", "Tierra / 0 V, referencia común de todo el circuito. Todos los pines GND de una placa son el mismo nodo."),
]
for term, definition in glos:
    story.append(Paragraph(f"<b>{esc(term)}</b> — {esc(definition)}", ParagraphStyle("g", parent=S["body"], spaceAfter=3.5)))

# ================= 9. REPOSITORIO =================
story.append(h1("9. Estructura del repositorio y cómo se genera este manual"))
story.append(code_block(
"""kits_robotica/
├── index.html            # página única (explorador de kits + laboratorio)
├── css/  styles.css, lab.css
├── js/   data.js (los 3 kits) · app.js (navegación)
│   └── lab/  catalog.js (25 componentes y pines) · engine.js (motor MNA)
│             mcu.js (intérprete Arduino/ESP32) · projects.js (11 prácticas) · ui.js
├── assets/images/        # 33 SVG de componentes + 3 SVG de cajas de kits
├── tests/engine.test.js  # 46 pruebas del motor (node tests/engine.test.js)
├── tools/export_data.js  # vuelca los datos reales a tools/manual_data.json
├── tools/build_manual.py # genera docs/MANUAL.pdf (este documento)
└── docs/MANUAL.pdf       # manual de usuario en PDF"""))
story.append(body("Para regenerar este PDF después de cambiar datos del proyecto:"))
story.append(code_block("node tools/export_data.js\npython3 tools/build_manual.py   # requiere: pip install reportlab svglib"))
story.append(Spacer(1, 10))
story.append(small(f"Documento generado el {DATA['generado']} — {DATA['repo']} — {DATA['site']}"))

# ---------- construir (dos pasadas para el índice) ----------
doc.multiBuild(story, canvasmaker=NumberedCanvas)
size = os.path.getsize(OUT)
print(f"OK → {os.path.relpath(OUT, ROOT)}  ({size/1024/1024:.2f} MB)")
