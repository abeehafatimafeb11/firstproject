(function () {
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function insertBar() {
    if (document.querySelector(".clocks-bar")) return true;
    var header = document.querySelector("header.nav");
    if (!header) return false;

    var bar = document.createElement("section");
    bar.className = "clocks-bar";
    bar.setAttribute("aria-label", "Local time");

    bar.innerHTML =
      '<div class="clocks-digital">' +
      '<time class="clocks-time" datetime="" id="clocks-digital-time">—:—:—</time>' +
      '<span class="clocks-date" id="clocks-digital-date"></span>' +
      "</div>" +
      '<div class="clocks-analog-wrap" aria-hidden="true">' +
      '<svg class="clocks-analog" viewBox="0 0 100 100" role="img">' +
      '<circle class="face" cx="50" cy="50" r="46" />' +
      '<g id="clocks-ticks"></g>' +
      '<line class="hand hand-hour" x1="50" y1="50" x2="50" y2="30" id="hand-hour" />' +
      '<line class="hand hand-minute" x1="50" y1="50" x2="50" y2="18" id="hand-minute" />' +
      '<line class="hand hand-second" x1="50" y1="52" x2="50" y2="14" id="hand-second" />' +
      '<circle class="center-dot" cx="50" cy="50" r="3" />' +
      "</svg>" +
      "</div>";

    header.insertAdjacentElement("afterend", bar);

    var ticks = bar.querySelector("#clocks-ticks");
    var i;
    for (i = 0; i < 12; i++) {
      var rad = ((i * 30 - 90) * Math.PI) / 180;
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("class", "tick-major");
      line.setAttribute("x1", String(50 + 40 * Math.cos(rad)));
      line.setAttribute("y1", String(50 + 40 * Math.sin(rad)));
      line.setAttribute("x2", String(50 + 34 * Math.cos(rad)));
      line.setAttribute("y2", String(50 + 34 * Math.sin(rad)));
      ticks.appendChild(line);
    }
    for (i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      var r2 = ((i * 6 - 90) * Math.PI) / 180;
      var minor = document.createElementNS("http://www.w3.org/2000/svg", "line");
      minor.setAttribute("class", "tick-minor");
      minor.setAttribute("x1", String(50 + 41 * Math.cos(r2)));
      minor.setAttribute("y1", String(50 + 41 * Math.sin(r2)));
      minor.setAttribute("x2", String(50 + 37 * Math.cos(r2)));
      minor.setAttribute("y2", String(50 + 37 * Math.sin(r2)));
      ticks.appendChild(minor);
    }

    return true;
  }

  var lastSecond = -1;

  function frame(now) {
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();
    var ms = now.getMilliseconds();

    if (s !== lastSecond) {
      lastSecond = s;
      var timeEl = document.getElementById("clocks-digital-time");
      var dateEl = document.getElementById("clocks-digital-date");
      if (timeEl) {
        timeEl.textContent = pad(h) + ":" + pad(m) + ":" + pad(s);
        timeEl.setAttribute("datetime", now.toISOString());
      }
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    }

    var smooth = s + ms / 1000;
    var secondDeg = smooth * 6;
    var minuteDeg = m * 6 + smooth * 0.1;
    var hourDeg = (h % 12) * 30 + m * 0.5 + smooth * (1 / 120);

    var hh = document.getElementById("hand-hour");
    var mm = document.getElementById("hand-minute");
    var ss = document.getElementById("hand-second");
    if (hh) hh.setAttribute("transform", "rotate(" + hourDeg + " 50 50)");
    if (mm) mm.setAttribute("transform", "rotate(" + minuteDeg + " 50 50)");
    if (ss) ss.setAttribute("transform", "rotate(" + secondDeg + " 50 50)");

    requestAnimationFrame(function () {
      frame(new Date());
    });
  }

  function init() {
    if (!insertBar()) return;
    requestAnimationFrame(function () {
      frame(new Date());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
