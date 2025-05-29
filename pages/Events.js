import { apiFetch } from "../services/apiFetch";
import { EventCard } from "../components/EventCard.js";
import { EventForm } from "../components/EventForm.js";
import { EventDetailsModal } from "../components/EventDetailsModal.js";
import { FeedbackMessage } from "../components/FeedbackMessage.js";
import { showGlobalSpinner, hideGlobalSpinner } from "../components/GlobalSpinner.js";

export function render() {
  return `
  <div class="events-main">
    <h1>¡Encuentra tu próximo evento favorito!</h2>
    <div id="events-list"></div>
    <div id="error-message"></div>
    <button id="create-event-button" style="display: none;">Crear evento</button>
    <div id="create-event-form-container" style="display: none;">
      <h3>Crear nuevo evento</h3>
      ${EventForm({ isEdit: false })}
      <div id="feedback-message"></div>
    </div>
    </div>
  `;
}

export async function setupEvents() {
  document.body.classList.add('loading');
  const eventsListContainer = document.getElementById("events-list");
  const createEventForm = document.getElementById("create-event-form");
  const createEventButton = document.getElementById("create-event-button");
  const cancelCreateEvent = document.getElementById("cancel-create-event-btn");
  const formContainer = document.getElementById("create-event-form-container");
  const errorMessage = document.getElementById("error-message");

  formContainer.style.display = "none";
  eventsListContainer.style.display = "flex";

  const token = localStorage.getItem("token");
  if (token) {
    createEventButton.style.display = "inline-block";
  } else {
    createEventButton.style.display = "none";
  }

  showGlobalSpinner();
  const eventsMain = document.querySelector('.events-main');
  if (eventsMain) {
    eventsMain.style.opacity = 0;
    eventsMain.style.transition = 'opacity 0.7s';
  }
  let fadeInApplied = false;
  const fadeIn = () => {
    hideGlobalSpinner();
    if (!fadeInApplied) {
      if (eventsMain) eventsMain.style.opacity = 1;
      document.body.classList.remove('loading');
      fadeInApplied = true;
    }
  };

  try {
    const start = Date.now();
    const res = await apiFetch("/events", {
      method: "GET",
    });
    const minDelay = 1000;
    const elapsed = Date.now() - start;
    const wait = elapsed < minDelay ? minDelay - elapsed : 0;
    if (res) {
      const events = await res.json();
      if (events && events.length > 0) {
        setTimeout(() => {
          eventsListContainer.innerHTML = events
            .map((event) => {
              const token = localStorage.getItem("token");
              const user = localStorage.getItem("user");
              const isCreator = user && event.creator === user;
              const isAttending =
                event.attendees &&
                event.attendees.some((attendee) => {
                  return attendee._id === user;
                });
              return EventCard({
                event,
                isCreator,
                isAttending,
                token
              });
            })
            .join("");
          fadeIn();
          attachEventListeners();
        }, wait);
      } else {
        setTimeout(() => {
          eventsListContainer.innerHTML = "<p>No se encontraron eventos.</p>";
          fadeIn();
        }, wait);
      }
    } else {
      setTimeout(() => {
        eventsListContainer.innerHTML =
          "<p>Error al hacer fetch de los eventos. Por favor, inténtalo de nuevo más tarde.</p>";
        fadeIn();
      }, wait);
    }
  } catch (error) {
    setTimeout(() => {
      eventsListContainer.innerHTML =
        "<p>Error al hacer fetch de los eventos. Por favor, inténtalo de nuevo más tarde.</p>";
      fadeIn();
    }, 1000);
  }

  createEventButton.addEventListener("click", () => {
    formContainer.style.display = "flex";
    createEventButton.style.display = "none";
    eventsListContainer.style.display = "none";
    errorMessage.style.display = "none";
    createEventForm.reset();
    setupCreateEvent();
  });

  cancelCreateEvent.addEventListener("click", () => {
    formContainer.style.display = "none";
    eventsListContainer.style.display = "flex";
    createEventButton.style.display = "flex";
    errorMessage.style.display = "none";
    createEventForm.reset();
    setupEvents();
  });

  function attachEventListeners() {
    const viewEventBtns = document.querySelectorAll(".view-event-btn");
    viewEventBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const eventItem = e.target.closest(".event-item");
        const eventId = eventItem.querySelector(".event-id").value;
        viewEvent(eventId);
      });
    });

    const attendEventBtns = document.querySelectorAll(".attend-event-btn");
    attendEventBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const eventItem = e.target.closest(".event-item");
        const eventId = eventItem.querySelector(".event-id").value;
        attendEvent(eventId);
      });
    });

    const cancelAttendanceBtns = document.querySelectorAll(
      ".cancel-attendance-btn"
    );
    cancelAttendanceBtns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const eventItem = e.target.closest(".event-item");
        const eventId = eventItem.querySelector(".event-id").value;
        cancelAttendance(eventId);
      });
    });

    const deleteEventBtns = document.querySelectorAll(".delete-event-btn");
    deleteEventBtns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const eventItem = e.target.closest(".event-item");
        const eventId = eventItem.querySelector(".event-id").value;
        deleteEvent(eventId);
      });
    });
  }

  async function viewEvent(eventId) {
    try {
      const res = await apiFetch(`/events/${eventId}`, { method: "GET" });
      if (!res.ok) {
        throw new Error("Error al hacer fetch de los detalles del evento.");
      }
      const event = await res.json();

      const existingModal = document.getElementById("event-details-modal");
      const existingOverlay = document.getElementById("event-details-overlay");

      if (existingModal) existingModal.remove();
      if (existingOverlay) existingOverlay.remove();

      const overlay = document.createElement("div");
      overlay.id = "event-details-overlay";
      document.body.appendChild(overlay);

      const modal = document.createElement("div");
      modal.id = "event-details-modal";
      modal.innerHTML = EventDetailsModal({ event });

      document.body.appendChild(modal);

      modal.style.display = "block";
      overlay.style.display = "block";

      document
        .getElementById("close-event-modal")
        .addEventListener("click", closeModal);
      overlay.addEventListener("click", closeModal);

      function closeModal() {
        modal.remove();
        overlay.remove();
      }
    } catch (error) {
      console.error("Error al hacer fetch de los detalles del evento:", error);
    }
  }

  async function attendEvent(eventId) {
    const errorMessage = document.getElementById("error-message");
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para participar en un evento.");
      return;
    }

    try {
      const res = await apiFetch(`/events/attendees/${eventId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.message !== "No changes") {
        errorMessage.innerHTML = FeedbackMessage({ message: "¡Te has unido al evento!", type: "success" });
        setupEvents();
      } else {
        throw new Error("Fallo al unirse al evento.");
      }
    } catch (error) {
      console.error("Fallo al unirse al evento:", error);
      errorMessage.innerHTML = FeedbackMessage({ message: "Ocurrió un error. Por favor, inténtalo de nuevo.", type: "error" });
    }
  }

  async function cancelAttendance(eventId) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para cancelar tu participación.");
      return;
    }

    try {
      const res = await apiFetch(`/events/attendees/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.message !== "No changes") {
        errorMessage.innerHTML = FeedbackMessage({ message: "Has cancelado tu participación en el evento.", type: "info" });
        setupEvents();
      } else {
        throw new Error("Fallo al cancelar la participación.");
      }
    } catch (error) {
      console.error("Error al cancelar participación:", error);
      errorMessage.innerHTML = FeedbackMessage({ message: "Error al cancelar. Inténtalo de nuevo.", type: "error" });
    }
  }

  async function deleteEvent(eventId) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para eliminar un evento.");
      return;
    }

    const confirmDelete = confirm(
      "¿Estás seguro de que deseas eliminar este evento?"
    );
    if (!confirmDelete) return;

    try {
      const res = await apiFetch(`/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.message !== "No changes") {
        errorMessage.innerHTML = FeedbackMessage({ message: "Evento eliminado exitosamente.", type: "info" });
        setupEvents();
      } else {
        throw new Error("Fallo al eliminar el evento.");
      }
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
      errorMessage.innerHTML = FeedbackMessage({ message: "Hubo un error al eliminar el evento. Inténtalo de nuevo.", type: "error" });
    }
  }
}

export function setupCreateEvent() {
  const createEventForm = document.getElementById("create-event-form");
  const feedbackMessage = document.getElementById("feedback-message");
  const formContainer = document.getElementById("create-event-form-container");
  const uploadImageBtn = document.getElementById("upload-image-btn");
  const imageUploadInput = document.getElementById("event-image");
  const imageNameDisplay = document.getElementById("image-name-display");
  const maxFileSize = 5 * 1024 * 1024;

  imageUploadInput.addEventListener("change", () => {
    if (imageUploadInput.files[0]) {
      imageNameDisplay.textContent = `¡Imagen seleccionada!`;
    } else {
      imageNameDisplay.textContent = "No se ha seleccionado ninguna imagen.";
    }
  });

  uploadImageBtn.addEventListener("click", () => {
    imageUploadInput.click();
  });

  if (!createEventForm.dataset.listenerAdded) {
    createEventForm.addEventListener("submit", async (e) => {
      console.log("submit");
      e.preventDefault();

      const loadingMessage = document.createElement("p");
      loadingMessage.textContent = "Procesando tu petición...";
      loadingMessage.style.color = "blue";
      loadingMessage.style.display = "none";
      createEventForm.parentElement.appendChild(loadingMessage);

      const title = document.getElementById("event-title").value.trim();
      const description = document
        .getElementById("event-description")
        .value.trim();
      const date = document.getElementById("event-date").value;
      const location = document.getElementById("event-location").value.trim();
      const image = imageUploadInput.files[0];

      if (image && image.size > maxFileSize) {
        feedbackMessage.innerHTML = FeedbackMessage({ message: "El tamaño de la imagen debe ser menor a 5MB.", type: "error" });
        return;
      }

      if (!title || !description || !date || !location) {
        feedbackMessage.innerHTML = FeedbackMessage({ message: "Todos los campos son requeridos.", type: "error" });
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("location", location);
      formData.append("img", image);
      formData.append("creator", localStorage.getItem("user"));

      const token = localStorage.getItem("token");

      try {
        loadingMessage.style.display = "block";
        formContainer.style.display = "none";
        feedbackMessage.innerHTML = "";
        const res = await apiFetch("/events", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setupEvents();
        } else {
          formContainer.style.display = "block";
          feedbackMessage.innerHTML = FeedbackMessage({ message: "Fallo al crear evento.", type: "error" });
        }
      } catch (error) {
        formContainer.style.display = "block";
        console.error("Error al crear el evento:", error);
        feedbackMessage.innerHTML = FeedbackMessage({ message: "Ocurrió un error. Por favor, inténtalo de nuevo.", type: "error" });
      } finally {
        loadingMessage.style.display = "none";
        createEventForm.reset();
      }
    });
    createEventForm.dataset.listenerAdded = "true";
  }
}
