export function LoginForm() {
  return `
    <form id="login-form">
      <label for="username">Nombre de usuario:</label>
      <input type="text" id="username" name="username" />
      <label for="password">Contraseña:</label>
      <input type="password" id="password" name="password" />
      <button type="submit">Iniciar Sesión</button>
    </form>
  `;
}
