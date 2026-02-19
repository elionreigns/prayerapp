/**
 * Fetch app config from server (SITE_URL from config.php). No secrets are ever returned.
 * When the app is served from prayerauthority.com (e.g. /app/), this pulls the live SITE_URL.
 */
(function() {
  window.APP_CONFIG = window.APP_CONFIG || {
    SITE_URL: 'https://www.prayerauthority.com',
    PATHS: {}
  };
  var isSite = /prayerauthority\.com$/i.test(window.location.hostname);
  if (!isSite) {
    window.APP_CONFIG_READY = Promise.resolve();
    return;
  }
  window.APP_CONFIG_READY = fetch('/app-config.php')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d && d.SITE_URL) {
        window.APP_CONFIG.SITE_URL = d.SITE_URL.replace(/\/$/, '') || window.APP_CONFIG.SITE_URL;
      }
    })
    .catch(function() {})
    .then(function() {});
})();
