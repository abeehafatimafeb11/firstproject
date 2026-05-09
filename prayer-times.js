(function () {
  var LOCATIONS = [
    { id: "uae", label: "UAE", city: "Dubai", country: "United Arab Emirates" },
    { id: "pakistan", label: "Pakistan", city: "Karachi", country: "Pakistan" },
    { id: "saudi", label: "Saudi Arabia", city: "Riyadh", country: "Saudi Arabia" },
    { id: "oman", label: "Oman", city: "Muscat", country: "Oman" },
    { id: "qatar", label: "Qatar", city: "Doha", country: "Qatar" },
    { id: "kuwait", label: "Kuwait", city: "Kuwait City", country: "Kuwait" },
    { id: "egypt", label: "Egypt", city: "Cairo", country: "Egypt" },
    { id: "malaysia", label: "Malaysia", city: "Kuala Lumpur", country: "Malaysia" },
    { id: "turkey", label: "Turkey", city: "Istanbul", country: "Turkey" },
    { id: "bangladesh", label: "Bangladesh", city: "Dhaka", country: "Bangladesh" },
    { id: "morocco", label: "Morocco", city: "Casablanca", country: "Morocco" },
  ];

  var PRAYER_ROWS = [
    { key: "Fajr", label: "Fajr" },
    { key: "Sunrise", label: "Sunrise" },
    { key: "Dhuhr", label: "Dhuhr" },
    { key: "Asr", label: "Asr" },
    { key: "Maghrib", label: "Maghrib" },
    { key: "Isha", label: "Isha" },
  ];

  var cache = {};
  var activeId = LOCATIONS[0].id;
  var latestBannerData = null;
  var bannerTick = null;

  function $(sel) {
    return document.querySelector(sel);
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function apiUrl(loc) {
    var city = encodeURIComponent(loc.city);
    var country = encodeURIComponent(loc.country);
    return "https://api.aladhan.com/v1/timingsByCity?city=" + city + "&country=" + country;
  }

  function setStatus(msg) {
    var el = $("#prayer-status");
    if (el) el.textContent = msg || "";
  }

  function stopBannerTimer() {
    if (bannerTick !== null) {
      clearInterval(bannerTick);
      bannerTick = null;
    }
  }

  function clearBannerUi() {
    stopBannerTimer();
    latestBannerData = null;
    var box = $("#prayer-now-banner");
    if (box) box.hidden = true;
    var m = $("#prayer-now-main");
    var s = $("#prayer-now-sub");
    if (m) m.textContent = "";
    if (s) s.textContent = "";
  }

  function parseTimeToMinutes(str) {
    if (!str || typeof str !== "string") return NaN;
    var m = String(str).trim().match(/^(\d{1,2}):(\d{2})/);
    if (!m) return NaN;
    var h = parseInt(m[1], 10);
    var min = parseInt(m[2], 10);
    if (h > 23 || min > 59) return NaN;
    return h * 60 + min;
  }

  function getNowMinutesInTimezone(timeZone) {
    try {
      var d = new Date();
      var f = new Intl.DateTimeFormat("en-GB", {
        timeZone: timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      });
      var parts = f.formatToParts(d);
      var h = 0;
      var m = 0;
      var i;
      for (i = 0; i < parts.length; i++) {
        if (parts[i].type === "hour") h = parseInt(parts[i].value, 10);
        if (parts[i].type === "minute") m = parseInt(parts[i].value, 10);
      }
      return h * 60 + m;
    } catch (e) {
      return null;
    }
  }

  function describeCurrentPeriod(timings, timeZone) {
    var now = getNowMinutesInTimezone(timeZone);
    if (now === null) return null;
    var fajr = parseTimeToMinutes(timings.Fajr);
    var sunrise = parseTimeToMinutes(timings.Sunrise);
    var dhuhr = parseTimeToMinutes(timings.Dhuhr);
    var asr = parseTimeToMinutes(timings.Asr);
    var maghrib = parseTimeToMinutes(timings.Maghrib);
    var isha = parseTimeToMinutes(timings.Isha);
    if (
      isNaN(fajr) ||
      isNaN(sunrise) ||
      isNaN(dhuhr) ||
      isNaN(asr) ||
      isNaN(maghrib) ||
      isNaN(isha)
    ) {
      return null;
    }

    if (now < fajr) {
      return { main: "Before Fajr", sub: "Fajr at " + timings.Fajr };
    }
    if (now < sunrise) {
      return { main: "Fajr", sub: "Until sunrise · " + timings.Sunrise };
    }
    if (now < dhuhr) {
      return { main: "Before Dhuhr", sub: "Dhuhr at " + timings.Dhuhr };
    }
    if (now < asr) {
      return { main: "Dhuhr", sub: "Until Asr · " + timings.Asr };
    }
    if (now < maghrib) {
      return { main: "Asr", sub: "Until Maghrib · " + timings.Maghrib };
    }
    if (now < isha) {
      return { main: "Maghrib", sub: "Until Isha · " + timings.Isha };
    }
    return { main: "Isha", sub: "Next Fajr at " + timings.Fajr };
  }

  function refreshNowBanner() {
    var box = $("#prayer-now-banner");
    if (!box || !latestBannerData) return;
    if (latestBannerData.locId !== activeId) return;
    var tz = latestBannerData.timezone;
    if (!tz) {
      box.hidden = true;
      return;
    }
    var phase = describeCurrentPeriod(latestBannerData.timings, tz);
    if (!phase) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    var m = $("#prayer-now-main");
    var s = $("#prayer-now-sub");
    if (m) m.textContent = phase.main;
    if (s) s.textContent = phase.sub || "";
  }

  function attachBannerTicker() {
    stopBannerTimer();
    bannerTick = window.setInterval(refreshNowBanner, 30000);
  }

  function renderTable(timings, meta) {
    var rows = PRAYER_ROWS.map(function (p) {
      var t = timings && timings[p.key];
      return (
        '<tr><th scope="row">' +
        esc(p.label) +
        "</th><td>" +
        esc(t || "—") +
        "</td></tr>"
      );
    }).join("");

    var method = meta && meta.method && meta.method.name ? meta.method.name : "";
    var tz = meta && meta.timezone ? meta.timezone.replace(/_/g, " ") : "";
    var subtitle = "";
    if (tz) subtitle += '<span class="prayer-meta-line">' + esc(tz) + "</span>";
    if (method) subtitle += '<span class="prayer-meta-line">' + esc(method) + "</span>";

    return (
      '<table class="prayer-table"><tbody>' +
      rows +
      "</tbody></table>" +
      (subtitle ? '<p class="prayer-meta">' + subtitle + "</p>" : "")
    );
  }

  function showError(message) {
    clearBannerUi();
    var panel = $("#prayer-panel");
    if (panel) {
      panel.innerHTML =
        '<p class="prayer-error" role="alert">' + esc(message) + "</p>" +
        '<p class="prayer-hint">Check your connection and try again.</p>';
    }
  }

  function updateDateLine(data) {
    var dateEl = $("#prayer-date-line");
    if (!dateEl || !data) return;
    var g = data.date && data.date.gregorian;
    var h = data.date && data.date.hijri;
    var parts = [];
    if (g && g.weekday && g.month && g.weekday.en) {
      parts.push(g.weekday.en + ", " + g.day + " " + g.month.en + " " + g.year);
    } else if (data.date && data.date.readable) {
      parts.push(data.date.readable);
    }
    if (h && h.weekday && h.month) {
      parts.push(
        "Hijri · " + h.weekday.en + ", " + h.day + " " + h.month.en + " " + h.year + " AH"
      );
    }
    dateEl.innerHTML = parts.map(function (p) {
      return '<span class="prayer-date-part">' + esc(p) + "</span>";
    }).join("");
  }

  function display(loc, payload) {
    var panel = $("#prayer-panel");
    if (!panel) return;
    var data = payload && payload.data;
    if (!data || !data.timings) {
      showError("Could not read prayer times.");
      return;
    }
    updateDateLine(data);
    panel.innerHTML = renderTable(data.timings, data.meta);
    latestBannerData = {
      locId: loc.id,
      timings: data.timings,
      timezone: data.meta && data.meta.timezone,
    };
    refreshNowBanner();
    attachBannerTicker();
    setStatus("");
  }

  function fetchLoc(loc, done) {
    var key = loc.id;
    if (cache[key]) {
      done(null, cache[key]);
      return;
    }
    fetch(apiUrl(loc), { method: "GET", credentials: "omit" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        if (!json || json.code !== 200) {
          throw new Error((json && json.status) || "Bad response");
        }
        cache[key] = json;
        done(null, json);
      })
      .catch(function (e) {
        done(e);
      });
  }

  function activateTab(id) {
    activeId = id;
    var buttons = document.querySelectorAll(".prayer-tab");
    var i;
    for (i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      var on = b.getAttribute("data-loc") === id;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.classList.toggle("is-active", on);
    }

    var loc = null;
    for (i = 0; i < LOCATIONS.length; i++) {
      if (LOCATIONS[i].id === id) {
        loc = LOCATIONS[i];
        break;
      }
    }
    if (!loc) return;

    clearBannerUi();

    var panel = $("#prayer-panel");
    if (panel && !cache[id]) {
      panel.innerHTML = '<p class="prayer-loading">Loading times for ' + esc(loc.label) + "…</p>";
    }
    setStatus("Loading…");

    fetchLoc(loc, function (err, json) {
      if (activeId !== id) return;
      if (err) {
        setStatus("");
        showError(err.message || "Could not load prayer times.");
        return;
      }
      display(loc, json);
    });
  }

  function init() {
    var wrap = $("#prayer-tabs-root");
    if (!wrap) return;

    var tabHtml = LOCATIONS.map(function (loc, idx) {
      return (
        '<button type="button" class="prayer-tab' +
        (idx === 0 ? " is-active" : "") +
        '" role="tab" aria-selected="' +
        (idx === 0 ? "true" : "false") +
        '" data-loc="' +
        esc(loc.id) +
        '" id="prayer-tab-' +
        esc(loc.id) +
        '">' +
        esc(loc.label) +
        "</button>"
      );
    }).join("");

    wrap.innerHTML =
      '<div class="prayer-tablist" role="tablist" aria-label="Country">' +
      tabHtml +
      "</div>" +
      '<div id="prayer-now-banner" class="prayer-now-banner" role="status" aria-live="polite" hidden>' +
      '<p class="prayer-now-tag">Current period</p>' +
      '<p class="prayer-now-main" id="prayer-now-main"></p>' +
      '<p class="prayer-now-sub" id="prayer-now-sub"></p>' +
      "</div>" +
      '<div id="prayer-date-line" class="prayer-date-line"></div>' +
      '<div id="prayer-panel" class="prayer-panel" role="tabpanel"></div>' +
      '<p id="prayer-status" class="visually-hidden" aria-live="polite"></p>';

    wrap.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest(".prayer-tab");
      if (!btn || wrap.contains(btn) === false) return;
      var id = btn.getAttribute("data-loc");
      if (id) activateTab(id);
    });

    activateTab(LOCATIONS[0].id);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
