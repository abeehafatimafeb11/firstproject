(function () {
  var ITEMS = [
    { id: "index", href: "index.html", label: "Home" },
    { id: "games", href: "games.html", label: "Games" },
    { id: "calculate", href: "calculate.html", label: "Calculator" },
    { id: "paint", href: "paint.html", label: "Paint" },
    { id: "about", href: "about.html", label: "About Me" },
  ];

  var MENU_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>';
  var SUN_ICON =
    '<svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M17.657 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>';
  var MOON_ICON =
    '<svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>';

  var mount = document.getElementById("site-nav-root");
  if (!mount) return;

  var current = document.documentElement.getAttribute("data-nav-current") || "index";

  var overflowItems = ITEMS.map(function (item) {
    var active = item.id === current;
    return (
      '<li role="none"><a role="menuitem"' +
      (active ? ' class="primary" href="' : ' href="') +
      item.href +
      '"' +
      (active ? ' aria-current="page">' : ">") +
      item.label +
      "</a></li>"
    );
  }).join("");

  var desktopHome =
    current === "index"
      ? '<li><a class="primary" href="index.html" aria-current="page">Home</a></li>'
      : '<li><a href="index.html">Home</a></li>';

  mount.outerHTML =
    '<header class="nav">' +
    '<div class="nav-brand">' +
    '<div class="nav-overflow" data-nav-overflow>' +
    '<button type="button" class="nav-overflow-btn" aria-expanded="false" aria-haspopup="true" aria-controls="nav-overflow-menu" aria-label="Open menu">' +
    MENU_ICON +
    "</button>" +
    '<ul id="nav-overflow-menu" class="nav-overflow-menu" role="menu" hidden aria-hidden="true">' +
    overflowItems +
    "</ul>" +
    "</div>" +
    '<a class="logo" href="index.html">Abeeha <span>Fatima</span></a>' +
    "</div>" +
    '<nav class="nav-actions" aria-label="Site menu">' +
    '<ul class="nav-links">' +
    desktopHome +
    "</ul>" +
    '<button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle light or dark theme" title="Theme">' +
    SUN_ICON +
    MOON_ICON +
    "</button>" +
    "</nav>" +
    "</header>";
})();
