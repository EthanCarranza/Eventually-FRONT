import { FeedbackMessage } from "../FeedbackMessage/FeedbackMessage.js";

export function showErrorMessage(containerSelector, message) {
  clearErrorMessage(containerSelector);
  const container =
    typeof containerSelector === "string"
      ? document.querySelector(containerSelector)
      : containerSelector;
  if (container)
    container.innerHTML = FeedbackMessage({ message, type: "error" });
}

export function showSuccessMessage(
  containerSelector,
  message,
  duration = 2000
) {
  const container =
    typeof containerSelector === "string"
      ? document.querySelector(containerSelector)
      : containerSelector;
  if (container) {
    container.innerHTML = FeedbackMessage({ message, type: "success" });
    setTimeout(() => {
      container.innerHTML = "";
    }, duration);
  }
}

export function clearErrorMessage(containerSelector) {
  const container =
    typeof containerSelector === "string"
      ? document.querySelector(containerSelector)
      : containerSelector;
  if (container) container.innerHTML = "";
}
