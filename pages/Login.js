import { apiFetch } from "../services/apiFetch";
import { loadComponent } from "../main";
import { LoginForm } from "../components/LoginForm.js";
import { FeedbackMessage } from "../components/FeedbackMessage.js";

export function render() {
  return `
    <div id="login-container">
      <h2>Iniciar Sesión</h2>
      ${LoginForm()}
      <div id="error-message-container"></div>
    </div>
  `;
}

export function setupLogin() {
  const form = document.querySelector("#login-form");
  const usernameInput = document.querySelector("#username");
  const passwordInput = document.querySelector("#password");

  usernameInput.addEventListener("input", clearErrorMessage);
  passwordInput.addEventListener("input", clearErrorMessage);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showErrorMessage(
        "El nombre de usuario y la contraseña no pueden estar vacíos."
      );
      return;
    }

    if (password.length < 6) {
      showErrorMessage("La contraseña es demasiado corta.");
      return;
    }

    try {
      await submit(username, password);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      showErrorMessage("Ha ocurrido un error. Por favor, inténtalo más tarde.");
    }
  });
}

const showErrorMessage = (message) => {
  const existingError = document.querySelector("#error-message");
  if (existingError) {
    existingError.remove();
  }
  document.querySelector("#error-message-container").innerHTML = FeedbackMessage({ message, type: "error" });
};

const clearErrorMessage = () => {
  document.querySelector("#error-message-container").innerHTML = "";
};

export const submit = async (username, password) => {
  clearErrorMessage();
  const objetoFinal = JSON.stringify({
    userName: username,
    password: password,
  });

  try {
    const res = await apiFetch("/users/login", {
      method: "POST",
      body: objetoFinal,
    });

    if (res.status === 404 || res.status === 401) {
      showErrorMessage("Usuario o contraseña incorrectos.");
      return;
    }

    const respuestaFinal = await res.json();

    localStorage.setItem("token", respuestaFinal.token);
    localStorage.setItem("user", respuestaFinal.user._id);

    loadComponent("home");
  } catch (error) {
    showErrorMessage(
      "Hubo un error al intentar iniciar sesión. Por favor, inténtelo de nuevo más tarde."
    );
  }
};
