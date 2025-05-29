export function UsernameForm({ username = "" }) {
  return `
    <form id="username-form">
      <input type="text" id="username-input" value="${username}" />
      <button type="submit" id="update-username-btn">Actualizar nombre de usuario</button>
      <button type="button" id="cancel-update-btn">Cancelar</button>
    </form>
  `;
}
