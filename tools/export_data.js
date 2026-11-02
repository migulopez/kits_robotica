#!/usr/bin/env node
/* ============================================================
   export_data.js — Exporta los datos reales de la plataforma
   (kits, catálogo del laboratorio y prácticas guiadas) a JSON
   para que build_manual.py genere docs/MANUAL.pdf.
   Uso:  node tools/export_data.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

function load(rel, extra) {
  const code = fs.readFileSync(path.join(ROOT, rel), "utf8") + (extra || "");
  eval(code);
}

load("js/data.js", "\n;globalThis.KITS = KITS;");
load("js/lab/catalog.js");
load("js/lab/engine.js");   // no aporta datos al manual, pero valida que carga
load("js/lab/projects.js");

const data = {
  generado: new Date().toISOString().slice(0, 10),
  repo: "https://github.com/migulopez/kits_robotica",
  site: "https://migulopez.github.io/kits_robotica/",
  kits: KITS,
  categories: LAB_CATEGORIES,
  catalog: Object.fromEntries(
    Object.entries(LAB_CATALOG).map(([t, d]) => [
      t,
      {
        name: d.name, cat: d.cat, kits: d.kits || [], img: d.img,
        pins: (d.pins || []).map((p) => ({ id: p.id, name: p.name, gnd: !!p.gnd, vcc: !!p.vcc })),
        props: d.props || {}, hint: d.hint || "", mcu: !!d.mcu, vcc: d.vcc || null
      }
    ])
  ),
  projects: PROJECTS.map((p) => ({
    id: p.id, n: p.n, title: p.title, objective: p.objective,
    comps: p.comps.map((c) => ({ type: c.type, props: c.props || {} })),
    wires: p.wires || [], steps: p.steps, explanation: p.explanation, code: p.code
  }))
};

const out = path.join(__dirname, "manual_data.json");
fs.writeFileSync(out, JSON.stringify(data, null, 1));
console.log("OK →", path.relative(ROOT, out),
  "| kits:", data.kits.length,
  "| componentes kit:", data.kits.reduce((a, k) => a + k.components.length, 0),
  "| catálogo lab:", Object.keys(data.catalog).length,
  "| prácticas:", data.projects.length);
