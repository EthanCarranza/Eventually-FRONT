export function FeedbackMessage({ message, type = "info" }) {
  let color = "#333";
  if (type === "error") color = "red";
  if (type === "success") color = "green";
  if (type === "info") color = "blue";
  return `<p style="color: ${color};">${message}</p>`;
}
