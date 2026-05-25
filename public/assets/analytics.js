(function () {
  const config = window.RIVERLAUNCH_ANALYTICS_CONFIG || {};
  const measurementId = config.measurementId;
  const consentKey = "riverlaunch.analyticsConsent";
  const bannerId = "analytics-consent";
  let analyticsLoaded = false;

  function hasMeasurementId() {
    return typeof measurementId === "string" && measurementId.trim() !== "";
  }

  function getStoredConsent() {
    try {
      return window.localStorage.getItem(consentKey);
    } catch (_error) {
      return null;
    }
  }

  function setStoredConsent(value) {
    try {
      window.localStorage.setItem(consentKey, value);
    } catch (_error) {
      return;
    }
  }

  function hideBanner() {
    const banner = document.getElementById(bannerId);
    if (banner) {
      banner.hidden = true;
    }
  }

  function showBanner() {
    const banner = document.getElementById(bannerId);
    if (!banner) {
      return;
    }

    banner.hidden = false;

    banner.querySelector("[data-analytics-accept]")?.addEventListener("click", function () {
      setStoredConsent("accepted");
      hideBanner();
      enableAnalytics();
    });

    banner.querySelector("[data-analytics-decline]")?.addEventListener("click", function () {
      setStoredConsent("declined");
      hideBanner();
      disableAnalytics();
    });
  }

  function createGtagQueue() {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
  }

  function loadGtagScript() {
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`)) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  function logPageView() {
    if (!analyticsLoaded || typeof window.gtag !== "function") {
      return;
    }

    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  }

  function enableAnalytics() {
    if (!hasMeasurementId()) {
      return;
    }

    createGtagQueue();
    window.gtag("consent", "update", {
      analytics_storage: "granted",
    });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: false,
    });
    loadGtagScript();
    analyticsLoaded = true;
    logPageView();
  }

  function disableAnalytics() {
    createGtagQueue();
    window.gtag("consent", "default", {
      analytics_storage: "denied",
    });
  }

  function logMarketingEvent(link) {
    if (!analyticsLoaded || typeof window.gtag !== "function") {
      return;
    }

    const eventName = link.dataset.analyticsEvent;
    if (!eventName) {
      return;
    }

    const params = {};

    if (link.dataset.analyticsContentType) {
      params.content_type = link.dataset.analyticsContentType;
    }

    if (link.dataset.analyticsItemId) {
      params.item_id = link.dataset.analyticsItemId;
    }

    if (link.dataset.analyticsSource) {
      params.source = link.dataset.analyticsSource;
    }

    params.transport_type = "beacon";

    window.gtag("event", eventName, params);
  }

  function bindMarketingEvents() {
    document.addEventListener("click", function (event) {
      const link = event.target.closest("[data-analytics-event]");
      if (link) {
        logMarketingEvent(link);
      }
    });
  }

  window.RiverLaunchAnalytics = {
    enable: enableAnalytics,
    disable: disableAnalytics,
    logPageView: logPageView,
  };

  disableAnalytics();
  bindMarketingEvents();

  if (!hasMeasurementId()) {
    return;
  }

  if (getStoredConsent() === "accepted") {
    enableAnalytics();
  } else if (getStoredConsent() === "declined") {
    disableAnalytics();
  } else {
    showBanner();
  }
})();
