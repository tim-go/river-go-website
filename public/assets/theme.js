// Theme toggle for the marketing site: Daybreak (default, light) <-> Surge
// (dark). The initial theme is set pre-paint by a tiny inline script in <head>
// (reads the saved preference); this file only wires up the toggle button(s)
// and keeps their label in sync. Persists to localStorage under "rl-theme".
(function () {
  "use strict";
  var KEY = "rl-theme";
  var root = document.documentElement;
  var LABELS = { surge: "Surge", daybreak: "Daybreak" };

  function current() {
    return root.getAttribute("data-theme") === "daybreak" ? "daybreak" : "surge";
  }

  function sync() {
    var name = LABELS[current()];
    var toggles = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < toggles.length; i++) {
      var label = toggles[i].querySelector("[data-theme-label]");
      if (label) label.textContent = name;
      toggles[i].setAttribute("aria-label", "Theme: " + name + ". Switch theme.");
    }
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {
      /* storage unavailable — theme still applies for this session */
    }
    sync();
  }

  var toggles = document.querySelectorAll("[data-theme-toggle]");
  for (var i = 0; i < toggles.length; i++) {
    toggles[i].addEventListener("click", function () {
      apply(current() === "surge" ? "daybreak" : "surge");
    });
  }

  sync();
})();
