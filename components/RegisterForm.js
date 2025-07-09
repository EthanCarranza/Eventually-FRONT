export function RegisterForm() {
  return `
    <form id="register-form">
      <label for="username">Nombre de usuario:</label>
      <input type="text" id="username" name="username" />
      <label for="email">Correo electrónico:</label>
      <input type="email" id="email" name="email" />
      <label for="password">Contraseña:</label>
      <input type="password" id="password" name="password" />
      <label for="confirm-password">Confirmar contraseña:</label>
      <input type="password" id="confirm-password" name="confirm-password" />
      <button type="submit">Registrarse</button>
    </form>
  `;
}
