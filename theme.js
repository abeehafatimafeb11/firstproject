(function () {
  var STORAGE_KEY = "abeeha-theme";

  function applyTheme(theme) {
    if (theme !== "light" && theme !== "dark") {
      theme = "dark";
    }
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* ignore */
    }
  }

  function wireToggle(button) {
    if (!button || button.dataset.themeWired === "1") return;
    button.dataset.themeWired = "1";
    button.addEventListener("click", function () {
      var next =
        document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
    });
  }

  function initToggles() {
    document.querySelectorAll("[data-theme-toggle]").forEach(wireToggle);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initToggles);
  } else {
    initToggles();
  }

  window.AbeehaTheme = { applyTheme: applyTheme };
})();
