export function fadeInElement(element, display = "block", duration = 700) {
  if (!element) return;
  element.style.transition = `opacity ${duration}ms`;
  element.style.opacity = 0;
  element.style.display = display;
  setTimeout(() => {
    element.style.opacity = 1;
  }, 10);
}

export function fadeOutElement(element, duration = 400) {
  if (!element) return;
  element.style.transition = `opacity ${duration}ms`;
  element.style.opacity = 0;
  setTimeout(() => {
    element.style.display = "none";
  }, duration);
}

export async function showAndFadeInAfterLoading(element, display, loadingFn) {
  if (!element) return;
  element.style.opacity = 0;
  element.style.display = "none";
  if (typeof loadingFn === "function") {
    await loadingFn();
  }
  fadeInElement(element, display);
}

export function focusFirstErrorInput(form) {
  if (!form) return;
  const invalid = form.querySelector('[aria-invalid="true"], .error, input:invalid, textarea:invalid');
  if (invalid) invalid.focus();
}

export function setInputAriaError(input, errorId) {
  if (!input) return;
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', errorId);
}

export function clearInputAriaError(input) {
  if (!input) return;
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
}

export function addInputClearListeners(inputs, clearErrorFn) {
  inputs.forEach(input => {
    input.addEventListener("input", () => {
      clearInputAriaError(input);
      if (typeof clearErrorFn === "function") clearErrorFn();
    });
  });
}
