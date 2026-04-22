(function () {
  "use strict";

  const WHATSAPP_NUMBER = "56995602717";
  let ofertas = [];

  function skeletonLoader(container, count) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      container.insertAdjacentHTML("beforeend", `
        <div class="skeleton" aria-hidden="true">
          <div class="sk-bar w-80"></div>
          <div class="sk-bar w-60"></div>
          <div class="sk-bar"></div>
          <div class="sk-bar w-40"></div>
        </div>
      `);
    }
  }

  function whatsappLink(oferta) {
    const mensaje = `Hola CargoLink, quiero postular a la oferta "${oferta.titulo}" publicada por ${oferta.empresa}.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  }

  function escapeHtml(text) {
    if (text == null) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function renderOfertas(lista) {
    const container = document.querySelector(".grid-ofertas");
    const contador = document.getElementById("contador-ofertas");
    if (!container) return;
    container.innerHTML = "";

    if (contador) {
      contador.textContent = lista.length === 1
        ? "1 oferta disponible"
        : `${lista.length} ofertas disponibles`;
    }

    if (!lista.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No encontramos ofertas que coincidan con tu búsqueda.</p>
          <p>Prueba ajustando los filtros o vuelve más tarde.</p>
        </div>
      `;
      return;
    }

    lista.forEach(oferta => {
      const tipo = String(oferta.tipo || "").toLowerCase();
      const tipoClass = tipo === "temporal" ? "temporal" : "permanente";
      const html = `
        <article class="card-oferta">
          <h4>${escapeHtml(oferta.titulo)}</h4>
          <p class="empresa">${escapeHtml(oferta.empresa)}</p>
          <span class="etiqueta ${tipoClass}">${escapeHtml(capitalize(tipo))}</span>
          <ul>
            <li>📍 ${escapeHtml(oferta.ubicacion)}</li>
            <li>🕒 ${escapeHtml(oferta.horario)}</li>
            <li>💰 ${escapeHtml(oferta.pago)}</li>
            <li>📅 Publicado el ${escapeHtml(oferta.publicado)} · expira el ${escapeHtml(oferta.expira)}</li>
            <li>👥 ${escapeHtml(oferta.postulaciones)} postulaciones</li>
            <li>🚚 Requiere ${escapeHtml(oferta.requisitos)}</li>
          </ul>
          <a class="btn btn-whatsapp" href="${whatsappLink(oferta)}" target="_blank" rel="noopener">
            Postular por WhatsApp
          </a>
        </article>
      `;
      container.insertAdjacentHTML("beforeend", html);
    });
  }

  function populateUbicaciones(lista) {
    const select = document.getElementById("filtro-ubicacion");
    if (!select) return;
    const ubicaciones = [...new Set(lista.map(o => o.ubicacion).filter(Boolean))].sort();
    ubicaciones.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u;
      opt.textContent = u;
      select.appendChild(opt);
    });
  }

  function aplicarFiltros() {
    const ubicacion = document.getElementById("filtro-ubicacion")?.value || "";
    const tipo = document.getElementById("filtro-tipo")?.value || "";
    const texto = (document.getElementById("filtro-texto")?.value || "").trim().toLowerCase();

    const filtradas = ofertas.filter(o => {
      if (ubicacion && o.ubicacion !== ubicacion) return false;
      if (tipo && String(o.tipo).toLowerCase() !== tipo) return false;
      if (texto) {
        const haystack = `${o.titulo} ${o.empresa} ${o.ubicacion} ${o.requisitos}`.toLowerCase();
        if (!haystack.includes(texto)) return false;
      }
      return true;
    });

    renderOfertas(filtradas);
  }

  function mostrarError(container, mensaje) {
    container.innerHTML = `
      <div class="error-state">
        <p><strong>No pudimos cargar las ofertas.</strong></p>
        <p>${escapeHtml(mensaje)}</p>
        <p>Intenta recargar la página en unos minutos.</p>
      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".grid-ofertas");
    if (!container) return;

    skeletonLoader(container, 3);

    fetch("ofertas-data.json", { cache: "no-cache" })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        ofertas = Array.isArray(data) ? data : [];
        populateUbicaciones(ofertas);
        renderOfertas(ofertas);

        ["filtro-ubicacion", "filtro-tipo"].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.addEventListener("change", aplicarFiltros);
        });
        const texto = document.getElementById("filtro-texto");
        if (texto) {
          let timeout;
          texto.addEventListener("input", () => {
            clearTimeout(timeout);
            timeout = setTimeout(aplicarFiltros, 150);
          });
        }
      })
      .catch(err => {
        console.error("Error cargando ofertas:", err);
        mostrarError(container, err.message || "Error de red");
      });
  });
})();
