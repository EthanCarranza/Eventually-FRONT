document.addEventListener("DOMContentLoaded", () => {
  const eventsLink = document.querySelector("#eventslink");
  const loginLink = document.querySelector("#loginlink");
  const registerLink = document.querySelector("#registerlink");
  const logoutLink = document.querySelector("#logoutlink");
  const personalPageLink = document.querySelector("#personalpagelink");

  const isUserLoggedIn = () => {
    return localStorage.getItem("token") !== null;
  };

  const updateLogoutLinkVisibility = () => {
    if (isUserLoggedIn()) {
      logoutLink.style.display = "block";
      personalPageLink.style.display = "block";
      registerLink.style.display = "none";
      loginLink.style.display = "none";
    } else {
      loginLink.style.display = "block";
      registerLink.style.display = "block";
      personalPageLink.style.display = "none";
      logoutLink.style.display = "none";
    }
  };

  eventsLink.addEventListener("click", (e) => {
    e.preventDefault();
    loadComponent("events");
  });

  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    loadComponent("login");
  });

  registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    loadComponent("register");
  });

  personalPageLink.addEventListener("click", (e) => {
    e.preventDefault();
    loadComponent("personalPage");
  });

  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    updateLogoutLinkVisibility();
    loadComponent("home");
  });

  const hamburger = document.getElementById("hamburger-menu");
  const navbarUser = document.querySelector(".navbar-user");

  if (hamburger && navbarUser) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      navbarUser.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (
        navbarUser.classList.contains("open") &&
        !navbarUser.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        hamburger.classList.remove("open");
        navbarUser.classList.remove("open");
      }
    });
    hamburger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        hamburger.click();
      }
    });
  }

  updateLogoutLinkVisibility();
});

const changeMainContent = (content) => {
  const main = document.querySelector("#main-content");
  main.innerHTML = content;
};

export const loadComponent = (component) => {
  switch (component) {
    case "home":
      window.location.href = "/";
      break;
    case "events":
      import("./pages/Events/Events.js")
        .then((module) => {
          changeMainContent(module.render());
          module.setupEvents();
        })
        .catch((err) => {
          console.error("Error cargando el módulo de eventos:", err);
        });
      break;
    case "login":
      import("./pages/Login/Login.js")
        .then((module) => {
          changeMainContent(module.render());
          module.setupLogin();
        })
        .catch((err) => {
          console.error("Error cargando el módulo de login:", err);
        });
      break;
    case "register":
      import("./pages/Register/Register.js").then((module) => {
        changeMainContent(module.render());
        module.setupRegister();
      });
      break;
    case "personalPage":
      import("./pages/PersonalPage/PersonalPage.js")
        .then((module) => {
          changeMainContent(module.render());
          module.setupMyProfile();
        })
        .catch((err) => {
          console.error("Error cargando el módulo de login:", err);
        });
      break;
    default:
      console.log("Componente no encontrado.");
  }
};

loadComponent("events");
