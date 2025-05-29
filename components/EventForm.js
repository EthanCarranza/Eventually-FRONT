export function EventForm({ isEdit = false, event = {} }) {
  return `
    <form id="create-event-form">
      <label for="event-title">Título del evento:</label>
      <input type="text" id="event-title" value="${event.title || ''}" required />
      <label for="event-description">Descripción:</label>
      <textarea id="event-description" required>${event.description || ''}</textarea>
      <label for="event-date">Fecha:</label>
      <input type="datetime-local" id="event-date" value="${event.date || ''}" required />
      <label for="event-location">Ubicación:</label>
      <input type="text" id="event-location" value="${event.location || ''}" required />
      <label for="event-image">Imagen del evento:</label>
      <input type="file" id="event-image" accept="image/*" style="display:none;" />
      <button id="upload-image-btn" type="button">Subir imagen</button>
      <div id="image-name-display">No se ha seleccionado ninguna imagen.</div>
      <div id="buttons-container">
        <button type="submit" id="confirm-create-event-btn">${isEdit ? 'Actualizar evento' : 'Crear evento'}</button>
        <button type="button" id="cancel-create-event-btn">Cancelar</button>
      </div>
    </form>
  `;
}
