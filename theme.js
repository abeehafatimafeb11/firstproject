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

  function initNavOverflow() {
    document.querySelectorAll("[data-nav-overflow]").forEach(function (root) {
      var btn = root.querySelector(".nav-overflow-btn");
      var menu = root.querySelector(".nav-overflow-menu");
      if (!btn || !menu || root.dataset.navOverflowWired === "1") return;
      root.dataset.navOverflowWired = "1";

      function setOpen(open) {
        menu.hidden = !open;
        menu.setAttribute("aria-hidden", open ? "false" : "true");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      }

      function close() {
        setOpen(false);
      }

      btn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        setOpen(menu.hidden);
      });

      document.addEventListener("click", function (ev) {
        if (!root.contains(ev.target)) close();
      });

      document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape") close();
      });

      menu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", close);
      });
    });
  }

  function init() {
    initToggles();
    initNavOverflow();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.AbeehaTheme = { applyTheme: applyTheme };
})();
