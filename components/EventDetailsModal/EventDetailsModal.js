export function EventDetailsModal({ event }) {
  return `
    <div class="event-modal-content">
      <h3>${event.title}</h3>
      <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleString()}</p>
      <p><strong>Ubicación:</strong> ${event.location}</p>
      <p><strong>Descripción:</strong> ${event.description}</p>
      ${event.img ? `<img src="${event.img}" alt="${event.title}" class="event-image"/>` : ""}
      ${event.attendees && event.attendees.length > 0
        ? `<h4>Participantes:</h4>
            <ul class="participants-ul">
              ${event.attendees.map(attendee => `
                <li class="participant-item">
                  <img src="${attendee.image}" alt="${attendee.userName}" class="participant-avatar"/>
                  <span>${attendee.userName}</span>
                </li>`).join("")}
            </ul>`
        : ""}
      <button class="view-event-btn" id="close-event-modal">Cerrar</button>
    </div>
  `;
}
