let spinnerInjected = false;

export function showGlobalSpinner() {
  const prevSpinner = document.getElementById("global-spinner");
  if (prevSpinner) prevSpinner.remove();

  const globalSpinner = document.createElement("div");
  globalSpinner.id = "global-spinner";
  globalSpinner.innerHTML = '<span class="spinner"></span>';
  document.body.appendChild(globalSpinner);

  if (!spinnerInjected && !document.getElementById("spinner-style")) {
    const style = document.createElement("style");
    style.id = "spinner-style";
    style.innerHTML = `
      #global-spinner {
        width: 100vw;
        height: 100vh;
        min-height: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        left: 0;
        top: 0;
        z-index: 2147483647 !important;
        pointer-events: all;
      }
      .spinner {
        display: inline-block;
        width: 64px;
        height: 64px;
        border: 8px solid #3a7d44;
        border-top: 8px solid #c6ffc6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        background: transparent;
        z-index: 2147483647 !important;
        position: relative;
      }
      @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
    `;
    document.head.appendChild(style);
    spinnerInjected = true;
  }
}

export function hideGlobalSpinner() {
  const spinner = document.getElementById("global-spinner");
  if (spinner) spinner.remove();
}
