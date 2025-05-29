export function EventCard({ event, isCreator, isAttending, token, onView, onAttend, onCancel, onDelete }) {
  return `
    <div class="event-item">
      <input type="hidden" class="event-id" value="${event._id}" />
      <h3>${event.title}</h3>
      <p><span><img src="https://api.iconify.design/material-symbols:location-on-rounded.svg"></img></span><span> </span>${event.location}</p>
      <p><span><img src="https://api.iconify.design/material-symbols-light:calendar-clock-sharp.svg"></img></span><span> </span>${new Date(event.date).toLocaleDateString()}</p>
      <div class="button-container">
        <button class="view-event-btn">Ver detalles</button>
        ${token ? (
          isCreator
            ? `<button class="delete-event-btn">Eliminar</button>`
            : isAttending
            ? `<button class="cancel-attendance-btn">Cancelar participación</button>`
            : `<button class="attend-event-btn">Participar</button>`
        ) : ""}
      </div>
    </div>
  `;
}
