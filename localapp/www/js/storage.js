/**
 * Power Prayer (localapp) — local app state (device only, not sent to server).
 * Same as main app: last screen, optional start path, Red Letters cache.
 */
window.APP_STORAGE = (function() {
  var PREFIX = 'powerprayer_localapp_';
  var KEYS = {
    LAST_PATH: PREFIX + 'last_path',
    START_PATH: PREFIX + 'start_path',
    REDLETTERS_CACHE: PREFIX + 'redletters_cache',
    REDLETTERS_CACHE_TIME: PREFIX + 'redletters_cache_time'
  };
  var CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  function get(key, defaultValue) {
    try {
      var raw = localStorage.getItem(key);
      if (raw == null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      return defaultValue;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    getLastPath: function() { return get(KEYS.LAST_PATH, null); },
    setLastPath: function(path) { return set(KEYS.LAST_PATH, path); },
    getStartPath: function() { return get(KEYS.START_PATH, null); },
    setStartPath: function(path) { return set(KEYS.START_PATH, path); },
    getRedLettersCache: function() {
      var data = get(KEYS.REDLETTERS_CACHE, null);
      var time = get(KEYS.REDLETTERS_CACHE_TIME, 0);
      if (!data || !time || (Date.now() - time > CACHE_TTL_MS)) return null;
      return data;
    },
    setRedLettersCache: function(data) {
      set(KEYS.REDLETTERS_CACHE, data);
      set(KEYS.REDLETTERS_CACHE_TIME, Date.now());
    },
    clearCache: function() {
      try {
        localStorage.removeItem(KEYS.REDLETTERS_CACHE);
        localStorage.removeItem(KEYS.REDLETTERS_CACHE_TIME);
      } catch (e) {}
    }
  };
})();
