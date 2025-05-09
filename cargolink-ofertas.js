document.addEventListener("DOMContentLoaded", () => {
  fetch("ofertas-data.json")
    .then(response => response.json())
    .then(data => renderOfertas(data));
});

function renderOfertas(ofertas) {
  const container = document.querySelector(".grid-ofertas");
  container.innerHTML = "";

  ofertas.forEach(oferta => {
    const tipoClass = oferta.tipo === "temporal" ? "temporal" : "permanente";
    const html = `
      <div class="card-oferta">
        <h4>${oferta.titulo}</h4>
        <p class="empresa">${oferta.empresa}</p>
        <span class="etiqueta ${tipoClass}">${oferta.tipo.charAt(0).toUpperCase() + oferta.tipo.slice(1)}</span>
        <ul>
          <li>📍 ${oferta.ubicacion}</li>
          <li>🕒 ${oferta.horario}</li>
          <li>💰 ${oferta.pago}</li>
          <li>📅 Publicado el ${oferta.publicado} | Expira el ${oferta.expira}</li>
          <li>🟠 ${oferta.postulaciones} postulaciones</li>
          <li>🚚 Requiere ${oferta.requisitos}</li>
        </ul>
        <a class="btn-whatsapp" href="#">Postular por WhatsApp</a>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", html);
  });
}
