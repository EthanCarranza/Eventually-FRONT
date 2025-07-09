import { apiFetch } from "../services/apiFetch";
import { loadComponent } from "../main";
import { LoginForm } from "../components/LoginForm.js";
import {
  showGlobalSpinner,
  hideGlobalSpinner,
} from "../components/GlobalSpinner.js";
import {
  fadeInElement,
  fadeOutElement,
  showAndFadeInAfterLoading,
  focusFirstErrorInput,
  setInputAriaError,
  clearInputAriaError,
  addInputClearListeners,
} from "../components/uiUtils.js";
import {
  showErrorMessage,
  showSuccessMessage,
  clearErrorMessage,
} from "../components/feedbackUtils.js";

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
  document.body.classList.add("loading");
  const form = document.querySelector("#login-form");
  const usernameInput = document.querySelector("#username");
  const passwordInput = document.querySelector("#password");
  const loginContainer = document.getElementById("login-container");
  const errorMessageContainer = "#error-message-container";

  showGlobalSpinner();
  showAndFadeInAfterLoading(loginContainer, "block", async () => {
    await new Promise((res) => setTimeout(res, 400));
    hideGlobalSpinner();
    document.body.classList.remove("loading");
  });

  addInputClearListeners([usernameInput, passwordInput], () =>
    clearErrorMessage(errorMessageContainer)
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (loginContainer) loginContainer.style.opacity = 0.5;
    showGlobalSpinner();
    [usernameInput, passwordInput].forEach(clearInputAriaError);
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    let valid = true;
    if (!username) {
      setInputAriaError(usernameInput, "invalid-username");
      valid = false;
    }
    if (!password || password.length < 6) {
      setInputAriaError(passwordInput, "invalid-password");
      valid = false;
    }
    if (!valid) {
      focusFirstErrorInput(form);
      hideGlobalSpinner();
      if (loginContainer) loginContainer.style.opacity = 1;
      showErrorMessage(
        errorMessageContainer,
        !username && !password
          ? "El nombre de usuario y la contraseña no pueden estar vacíos."
          : !username
          ? "El nombre de usuario no puede estar vacío."
          : "La contraseña es demasiado corta."
      );
      return;
    }
    try {
      await submit(username, password, loginContainer);
    } catch (error) {
      hideGlobalSpinner();
      if (loginContainer) loginContainer.style.opacity = 1;
      console.error("Error al iniciar sesión:", error);
      showErrorMessage(
        errorMessageContainer,
        "Ha ocurrido un error. Por favor, inténtalo más tarde."
      );
    }
  });
}

export const submit = async (username, password, loginContainer) => {
  clearErrorMessage();
  const objetoFinal = JSON.stringify({
    userName: username,
    password: password,
  });
  showGlobalSpinner();
  if (loginContainer) loginContainer.style.opacity = 0.5;
  try {
    const res = await apiFetch("/users/login", {
      method: "POST",
      body: objetoFinal,
    });

    if (res.status === 404 || res.status === 401) {
      hideGlobalSpinner();
      if (loginContainer) loginContainer.style.opacity = 1;
      showErrorMessage("Usuario o contraseña incorrectos.");
      return;
    }

    const respuestaFinal = await res.json();

    localStorage.setItem("token", respuestaFinal.token);
    localStorage.setItem("user", respuestaFinal.user._id);
    hideGlobalSpinner();
    if (loginContainer) loginContainer.style.opacity = 1;
    loadComponent("home");
  } catch (error) {
    hideGlobalSpinner();
    if (loginContainer) loginContainer.style.opacity = 1;
    showErrorMessage(
      "Hubo un error al intentar iniciar sesión. Por favor, inténtelo de nuevo más tarde."
    );
  }
};
