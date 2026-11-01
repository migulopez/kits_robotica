/* ============================================================
   Laboratorio Virtual de Robótica — lógica de la aplicación
   ------------------------------------------------------------
   Vistas:
     1. home-view : mesa con las 3 cajas de kits
     2. kit-view  : componentes del kit seleccionado sobre la mesa
     3. modal     : ficha técnica ampliada de un componente
   ============================================================ */

/* global KITS */

(function () {
  "use strict";

  // ---------- Referencias al DOM ----------
  var homeView = document.getElementById("home-view");
  var kitView = document.getElementById("kit-view");
  var shelf = document.getElementById("kit-shelf");
  var grid = document.getElementById("components-grid");
  var kitTitle = document.getElementById("kit-title");
  var kitDesc = document.getElementById("kit-desc");
  var backBtn = document.getElementById("back-btn");

  var overlay = document.getElementById("modal-overlay");
  var modalClose = document.getElementById("modal-close");
  var mImg = document.getElementById("m-img");
  var mName = document.getElementById("m-name");
  var mQueEs = document.getElementById("m-queEs");
  var mParaQue = document.getElementById("m-paraQue");
  var mFunciona = document.getElementById("m-funciona");
  var mUtiliza = document.getElementById("m-utiliza");
  var mEjemplos = document.getElementById("m-ejemplos");

  var currentKit = null;
  var modalOpen = false;

  // ---------- Vista inicial: las tres cajas sobre la mesa ----------
  function renderHome() {
    shelf.innerHTML = "";
    KITS.forEach(function (kit, i) {
      var box = document.createElement("button");
      box.type = "button";
      box.className = "kit-box";
      box.style.setProperty("--i", i);
      box.style.setProperty("--kc", kit.accent);
      box.setAttribute("aria-label", "Abrir " + kit.name + ": " + kit.title);
      box.innerHTML =
        '<img src="' + kit.box + '" alt="Caja de ' + kit.name + '" />' +
        '<span class="tag">' + kit.name + "</span>" +
        '<span class="kit-sub">' + kit.title + "</span>" +
        '<span class="count">' + kit.components.length + " componentes</span>";
      box.addEventListener("click", function () {
        openKit(kit, box);
      });
      shelf.appendChild(box);
    });
  }

  // ---------- Abrir un kit: la caja se abre y las otras desaparecen ----------
  function openKit(kit, boxEl) {
    if (currentKit) return; // evita doble transición
    currentKit = kit;

    Array.prototype.forEach.call(shelf.children, function (el) {
      if (el === boxEl) {
        el.classList.add("opening");
      } else {
        el.classList.add("vanish");
      }
    });

    window.setTimeout(function () {
      homeView.classList.add("hidden");
      kitView.classList.remove("hidden");
      kitTitle.textContent = kit.name + " — " + kit.title;
      kitDesc.textContent = kit.description;
      kitView.style.setProperty("--kc", kit.accent);
      renderComponents(kit);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 550);
  }

  // ---------- Dibujar los componentes del kit sobre la mesa ----------
  function renderComponents(kit) {
    grid.innerHTML = "";
    kit.components.forEach(function (comp, i) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "component-card";
      card.style.setProperty("--d", (i * 0.055).toFixed(2) + "s");
      card.setAttribute("aria-label", "Ver información de " + comp.name);
      card.innerHTML =
        '<img src="' + comp.image + '" alt="' + comp.name + '" loading="lazy" />' +
        '<span class="cname">' + comp.name + "</span>";
      card.addEventListener("click", function () {
        selectComponent(card, comp);
      });
      grid.appendChild(card);
    });
  }

  // ---------- Seleccionar un componente: se destaca y se abre su ficha ----------
  function selectComponent(card, comp) {
    var actives = grid.querySelectorAll(".component-card.active");
    Array.prototype.forEach.call(actives, function (el) {
      el.classList.remove("active");
    });
    card.classList.add("active");
    openModal(comp);
  }

  // ---------- Volver a la mesa de trabajo ----------
  function backToHome() {
    closeModal();
    kitView.classList.add("hidden");
    homeView.classList.remove("hidden");
    currentKit = null;
    // limpiar las animaciones de las cajas para que reaparezcan
    window.setTimeout(function () {
      Array.prototype.forEach.call(shelf.children, function (el) {
        el.classList.remove("opening", "vanish");
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 60);
  }

  // ---------- Modal con la ficha técnica del componente ----------
  function openModal(comp) {
    mImg.src = comp.image;
    mImg.alt = comp.name;
    mName.textContent = comp.name;
    mQueEs.textContent = comp.queEs;
    mParaQue.textContent = comp.paraQue;
    mFunciona.textContent = comp.funciona;
    mUtiliza.textContent = comp.utiliza;
    mEjemplos.innerHTML = "";
    comp.ejemplos.forEach(function (ex) {
      var li = document.createElement("li");
      li.textContent = ex;
      mEjemplos.appendChild(li);
    });

    overlay.classList.remove("hidden");
    // forzar reflow para que la transición se reproduzca
    void overlay.offsetWidth;
    overlay.classList.add("show");
    modalOpen = true;
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeModal() {
    if (!modalOpen) return;
    modalOpen = false;
    overlay.classList.remove("show");
    window.setTimeout(function () {
      overlay.classList.add("hidden");
      document.body.style.overflow = "";
    }, 260);
  }

  // ---------- Eventos ----------
  backBtn.addEventListener("click", backToHome);
  modalClose.addEventListener("click", closeModal);

  // clic sobre el fondo oscuro cierra la ficha
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });

  // tecla Escape cierra la ficha
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  // ---------- Arranque ----------
  renderHome();
})();
