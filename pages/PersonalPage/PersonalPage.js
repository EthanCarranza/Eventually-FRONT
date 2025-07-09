import { apiFetch } from "../services/apiFetch";
import { loadComponent } from "../main";
import { UsernameForm } from "../components/UsernameForm/UsernameForm.js";
import { FeedbackMessage } from "../components/FeedbackMessage/FeedbackMessage.js";
import {
  showGlobalSpinner,
  hideGlobalSpinner,
} from "../components/GlobalSpinner/GlobalSpinner.js";
import {
  fadeInElement,
  showAndFadeInAfterLoading,
  focusFirstErrorInput,
  setInputAriaError,
  clearInputAriaError,
  addInputClearListeners,
} from "../components/uiUtils/uiUtils.js";
import {
  showErrorMessage,
  showSuccessMessage,
  clearErrorMessage,
} from "../components/feedbackUtils/feedbackUtils.js";

export function render() {
  return `
    <h2>Mi Perfil</h2>
    <div id="profile-container">
      <div id="profile-picture-section">
        <img id="profile-picture" src="default-profile.jpg" alt="Imagen de Perfil" />
        <input type="file" id="profile-image-upload" accept="image/*" style="display:none;" />
        <button id="upload-image-btn">Subir Imagen</button>
      </div>
      <div id="profile-details-section">
        <p id="email-section">
          <strong>Correo electrónico:</strong> <span id="user-email"></span>
        </p>
        <div id="username-section"> 
          <p><strong>Nombre de usuario:</strong> 
          <span id="user-name"></span> <div id="edit-username-div">
          <button id="edit-username-btn">Editar</button></p></div>
          <button id="delete-profile-btn">Eliminar mi perfil</button>
          ${UsernameForm({ username: "" })}
          <p id="feedback-message"></p>
        </div>
      </div>
    </div>
  `;
}

export async function setupMyProfile() {
  document.body.classList.add("loading");
  const usernameForm = document.getElementById("username-form");
  const usernameInput = document.getElementById("username-input");
  const feedbackMessage = document.getElementById("feedback-message");
  const profilePicture = document.getElementById("profile-picture");
  const userNameSpan = document.getElementById("user-name");
  const userEmailSpan = document.getElementById("user-email");
  const uploadImageBtn = document.getElementById("upload-image-btn");
  const imageUploadInput = document.getElementById("profile-image-upload");
  const editUsernameBtn = document.getElementById("edit-username-btn");
  const deleteUserBtn = document.getElementById("delete-profile-btn");
  const cancelUpdateBtn = document.getElementById("cancel-update-btn");
  const profileContainer = document.getElementById("profile-container");
  showGlobalSpinner();
  await showAndFadeInAfterLoading(profileContainer, "flex", async () => {
    const userId = localStorage.getItem("user");
    if (!userId) {
      hideGlobalSpinner();
      if (profileContainer) {
        profileContainer.style.display = "flex";
        profileContainer.style.opacity = 1;
      }
      feedbackMessage.innerHTML = FeedbackMessage({
        message: "Fallo al cargar el perfil del usuario.",
        type: "error",
      });
      return;
    }
    try {
      const res = await apiFetch(`/users/${userId}`, { method: "GET" });
      if (res) {
        const { userName, email, image } = await res.json();
        userNameSpan.textContent = userName;
        userEmailSpan.textContent = email;
        usernameInput.value = userName;
        profilePicture.src = image;
      } else {
        feedbackMessage.innerHTML = FeedbackMessage({
          message: "Fallo al cargar el perfil del usuario.",
          type: "error",
        });
      }
      hideGlobalSpinner();
    } catch (error) {
      hideGlobalSpinner();
      if (profileContainer) {
        profileContainer.style.display = "flex";
        profileContainer.style.opacity = 1;
      }
      feedbackMessage.innerHTML = FeedbackMessage({
        message: "Ocurrió un error. Por favor, inténtalo de nuevo.",
        type: "error",
      });
    }
    document.body.classList.remove("loading");
  });

  editUsernameBtn.addEventListener("click", () => {
    userNameSpan.style.display = "none";
    editUsernameBtn.style.display = "none";
    deleteUserBtn.style.display = "none";
    usernameForm.style.display = "flex";
    feedbackMessage.style.display = "none";
    clearErrorMessage(feedbackMessage);
  });

  deleteUserBtn.addEventListener("click", () => {
    const confirmDelete = confirm(
      "¿Estás seguro de que deseas eliminar tu perfil? Esta acción es irreversible."
    );
    if (confirmDelete) {
      deleteUserProfile();
    }
  });

  cancelUpdateBtn.addEventListener("click", () => {
    userNameSpan.style.display = "inline";
    editUsernameBtn.style.display = "inline";
    deleteUserBtn.style.display = "inline";
    usernameForm.style.display = "none";
    feedbackMessage.style.display = "none";
    clearErrorMessage(feedbackMessage);
  });

  usernameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (profileContainer) profileContainer.style.opacity = 0.5;
    showGlobalSpinner();
    clearInputAriaError(usernameInput);
    const newUsername = usernameInput.value.trim();
    feedbackMessage.style.display = "inline";
    feedbackMessage.style.color = "red";
    let valid = true;
    if (!newUsername) {
      setInputAriaError(usernameInput, "invalid-username");
      valid = false;
      showErrorMessage(
        feedbackMessage,
        "El nombre de usuario no puede estar vacío."
      );
    } else if (userNameSpan.textContent.trim() === newUsername) {
      setInputAriaError(usernameInput, "invalid-username");
      valid = false;
      showErrorMessage(
        feedbackMessage,
        "El nombre de usuario nuevo es el mismo que el antiguo."
      );
    } else if (newUsername.trim().length < 3) {
      setInputAriaError(usernameInput, "invalid-username");
      valid = false;
      showErrorMessage(
        feedbackMessage,
        "El nombre de usuario debe tener al menos 3 caracteres"
      );
    } else if (!/\d/.test(newUsername)) {
      setInputAriaError(usernameInput, "invalid-username");
      valid = false;
      showErrorMessage(
        feedbackMessage,
        "El nombre de usuario debe tener al menos un número."
      );
    }
    if (!valid) {
      focusFirstErrorInput(usernameForm);
      hideGlobalSpinner();
      if (profileContainer) profileContainer.style.opacity = 1;
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      console.error(
        "No se encontró el token, el usuario no esta autentificado."
      );
      return;
    }
    try {
      const res = await apiFetch(`/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userName: newUsername }),
      });
      hideGlobalSpinner();
      if (profileContainer) profileContainer.style.opacity = 1;
      feedbackMessage.style.display = "inline";
      if (res) {
        clearInputAriaError(usernameInput);
        showSuccessMessage(
          feedbackMessage,
          "El nombre de usuario se actualizó correctamente."
        );
        userNameSpan.textContent = newUsername;
        usernameForm.style.display = "none";
        userNameSpan.style.display = "inline";
        editUsernameBtn.style.display = "inline";
        deleteUserBtn.style.display = "inline";
      } else {
        setInputAriaError(usernameInput, "invalid-username");
        showErrorMessage(feedbackMessage, "El nombre de usuario ya existe.");
      }
    } catch (error) {
      hideGlobalSpinner();
      if (profileContainer) profileContainer.style.opacity = 1;
      setInputAriaError(usernameInput, "invalid-username");
      feedbackMessage.style.display = "inline";
      console.error("Error ual actualizar el nombre de usuario:", error);
      showErrorMessage(
        feedbackMessage,
        "Ocurrió un error. Por favor, inténtalo de nuevo."
      );
    }
  });

  addInputClearListeners([usernameInput], () => {
    clearErrorMessage(feedbackMessage);
  });

  async function deleteUserProfile() {
    const userId = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userId || !token) {
      console.error("Usuario no autenticado o ID no encontrado.");
      return;
    }
    try {
      showGlobalSpinner();
      if (profileContainer) profileContainer.style.opacity = 0.5;
      const res = await apiFetch(`/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      hideGlobalSpinner();
      if (profileContainer) profileContainer.style.opacity = 1;
      if (res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        loadComponent("home");
      } else {
        feedbackMessage.style.display = "inline";
        feedbackMessage.style.color = "red";
        showErrorMessage(
          feedbackMessage,
          "Hubo un error al eliminar tu perfil. Por favor, inténtalo de nuevo."
        );
      }
    } catch (error) {
      hideGlobalSpinner();
      if (profileContainer) profileContainer.style.opacity = 1;
      feedbackMessage.style.display = "inline";
      feedbackMessage.style.color = "red";
      console.error("Error al eliminar el perfil:", error);
      showErrorMessage(
        feedbackMessage,
        "Ocurrió un error. Por favor, inténtalo de nuevo."
      );
    }
  }

  uploadImageBtn.addEventListener("click", () => {
    imageUploadInput.click();
  });

  imageUploadInput.addEventListener("change", async () => {
    const file = imageUploadInput.files[0];
    if (!file) return;
    if (profileContainer) profileContainer.style.opacity = 0.5;
    showGlobalSpinner();
    feedbackMessage.style.display = "inline";
    feedbackMessage.innerHTML = FeedbackMessage({
      message: "Procesando registro...",
      type: "info",
    });
    const formData = new FormData();
    formData.append("img", file);
    const token = localStorage.getItem("token");
    try {
      const res = await apiFetch(`/users/profileImage/${userId}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      hideGlobalSpinner();
      if (profileContainer) profileContainer.style.opacity = 1;
      if (res.ok) {
        const { imageUrl } = await res.json();
        profilePicture.src = imageUrl;
        showSuccessMessage(feedbackMessage, "Imagen de perfil actualizada.");
      } else {
        showErrorMessage(feedbackMessage, "Fallo al subir la imagen.");
      }
    } catch (error) {
      hideGlobalSpinner();
      if (profileContainer) profileContainer.style.opacity = 1;
      console.error("Error  al subir la imagen:", error);
      showErrorMessage(
        feedbackMessage,
        "Ocurrió un error. Por favor, inténtalo de nuevo."
      );
    }
  });
}
