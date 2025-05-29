import { apiFetch } from "../services/apiFetch";
import { loadComponent } from "../main";
import { UsernameForm } from "../components/UsernameForm.js";
import { FeedbackMessage } from "../components/FeedbackMessage.js";

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

  const userId = localStorage.getItem("user");
  if (!userId) {
    console.error("No se encontró el usuario en el localStorage");
    feedbackMessage.innerHTML = FeedbackMessage({ message: "Fallo al cargar el perfil del usuario.", type: "error" });
    return;
  }

  try {
    const res = await apiFetch(`/users/${userId}`, {
      method: "GET",
    });

    if (res) {
      const { userName, email, image } = await res.json();
      userNameSpan.textContent = userName;
      userEmailSpan.textContent = email;
      usernameInput.value = userName;
      profilePicture.src = image;
    } else {
      feedbackMessage.innerHTML = FeedbackMessage({ message: "Fallo al cargar el perfil del usuario.", type: "error" });
    }
  } catch (error) {
    console.error("Error loading user data:", error);
    feedbackMessage.innerHTML = FeedbackMessage({ message: "Ocurrió un error. Por favor, inténtalo de nuevo.", type: "error" });
  }

  editUsernameBtn.addEventListener("click", () => {
    userNameSpan.style.display = "none";
    editUsernameBtn.style.display = "none";
    deleteUserBtn.style.display = "none";
    usernameForm.style.display = "flex";
    feedbackMessage.style.display = "none";
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
  });

  usernameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newUsername = usernameInput.value.trim();
    feedbackMessage.style.display = "inline";
    feedbackMessage.style.color = "red";
    if (!newUsername) {
      feedbackMessage.innerHTML = FeedbackMessage({ message: "El nombre de usuario no puede estar vacío.", type: "error" });
      return;
    } else if (userNameSpan.textContent.trim() === newUsername) {
      feedbackMessage.innerHTML = FeedbackMessage({ message: "El nombre de usuario nuevo es el mismo que el antiguo.", type: "error" });
      return;
    } else if (newUsername.trim().length < 3) {
      feedbackMessage.innerHTML = FeedbackMessage({ message: "El nombre de usuario debe tener al menos 3 caracteres", type: "error" });
      return;
    } else if (!/\d/.test(newUsername)) {
      feedbackMessage.innerHTML = FeedbackMessage({ message: "El nombre de usuario debe tener al menos un número.", type: "error" });
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
      feedbackMessage.style.display = "inline";
      if (res) {
        feedbackMessage.innerHTML = FeedbackMessage({ message: "El nombre de usuario se actualizó correctamente.", type: "success" });
        userNameSpan.textContent = newUsername;
        usernameForm.style.display = "none";
        userNameSpan.style.display = "inline";
        editUsernameBtn.style.display = "inline";
        deleteUserBtn.style.display = "inline";
      } else {
        feedbackMessage.innerHTML = FeedbackMessage({ message: "El nombre de usuario ya existe.", type: "error" });
      }
    } catch (error) {
      feedbackMessage.style.display = "inline";
      console.error("Error ual actualizar el nombre de usuario:", error);
      feedbackMessage.innerHTML = FeedbackMessage({ message: "Ocurrió un error. Por favor, inténtalo de nuevo.", type: "error" });
    }
  });

  async function deleteUserProfile() {
    const userId = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      console.error("Usuario no autenticado o ID no encontrado.");
      return;
    }

    try {
      const res = await apiFetch(`/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        loadComponent("home");
      } else {
        feedbackMessage.style.display = "inline";
        feedbackMessage.style.color = "red";
        feedbackMessage.innerHTML = FeedbackMessage({ message: "Hubo un error al eliminar tu perfil. Por favor, inténtalo de nuevo.", type: "error" });
      }
    } catch (error) {
      feedbackMessage.style.display = "inline";
      feedbackMessage.style.color = "red";
      console.error("Error al eliminar el perfil:", error);
      feedbackMessage.innerHTML = FeedbackMessage({ message: "Ocurrió un error. Por favor, inténtalo de nuevo.", type: "error" });
    }
  }

  uploadImageBtn.addEventListener("click", () => {
    imageUploadInput.click();
  });

  imageUploadInput.addEventListener("change", async () => {
    const file = imageUploadInput.files[0];
    if (!file) return;
    feedbackMessage.style.display = "inline";
    feedbackMessage.innerHTML = FeedbackMessage({ message: "Procesando registro...", type: "info" });
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

      if (res.ok) {
        const { imageUrl } = await res.json();
        profilePicture.src = imageUrl;
        feedbackMessage.innerHTML = FeedbackMessage({ message: "Imagen de perfil actualizada.", type: "success" });
      } else {
        feedbackMessage.innerHTML = FeedbackMessage({ message: "Fallo al subir la imagen.", type: "error" });
      }
    } catch (error) {
      console.error("Error  al subir la imagen:", error);
      feedbackMessage.innerHTML = FeedbackMessage({ message: "Ocurrió un error. Por favor, inténtalo de nuevo.", type: "error" });
    }
  });
}
