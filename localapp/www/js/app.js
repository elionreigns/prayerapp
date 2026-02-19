(function() {
  var config = window.APP_CONFIG || { SITE_URL: 'https://www.prayerauthority.com', PATHS: {} };
  var SITE = (config.SITE_URL || 'https://www.prayerauthority.com').replace(/\/$/, '');
  var currentPath = '/prayers/login.php';

  var NATIVE_PATHS = {
    '/prayers/redletters.php': 'native-redletters',
    '/prayers/dreams.php': 'native-dreams',
    '/counsel/': 'native-counsel',
    '/prayers/urim2.php': 'native-urim',
    '/prayers/p48x.php': 'native-p48x',
    '/translator/': 'native-translator',
    '/prayers/games/davidvsgoliath/': 'native-david',
    '/prayers/map/': 'native-biblemap'
  };

  var el = {
    frame: document.getElementById('content-frame'),
    iframeWrap: document.getElementById('iframe-wrap'),
    welcome: document.getElementById('welcome-panel'),
    openTab: document.getElementById('open-current-tab'),
    loading: document.getElementById('loading-spinner'),
    nativeRedLetters: document.getElementById('native-redletters'),
    nativeDreams: document.getElementById('native-dreams'),
    nativeCounsel: document.getElementById('native-counsel'),
    nativeUrim: document.getElementById('native-urim'),
    nativeP48x: document.getElementById('native-p48x'),
    nativeTranslator: document.getElementById('native-translator'),
    nativeDavid: document.getElementById('native-david'),
    davidFrame: document.getElementById('david-frame'),
    nativeBiblemap: document.getElementById('native-biblemap'),
    biblemapFrame: document.getElementById('biblemap-frame')
  };

  var allNativeViews = [
    el.nativeRedLetters, el.nativeDreams, el.nativeCounsel, el.nativeUrim,
    el.nativeP48x, el.nativeTranslator, el.nativeDavid, el.nativeBiblemap
  ].filter(Boolean);

  function openDrawer() {
    document.querySelector('.drawer-overlay').classList.add('open');
    document.querySelector('.drawer').classList.add('open');
  }
  function closeDrawer() {
    document.querySelector('.drawer-overlay').classList.remove('open');
    document.querySelector('.drawer').classList.remove('open');
  }

  function showLoading(show) {
    if (el.loading) el.loading.style.display = show ? 'block' : 'none';
  }

  function showNativeView(activeViewId, show) {
    allNativeViews.forEach(function(v) {
      if (!v) return;
      v.classList.remove('active');
      v.style.display = 'none';
    });
    if (el.iframeWrap) el.iframeWrap.style.display = show ? 'none' : 'flex';
    if (el.welcome) el.welcome.style.display = 'none';
    if (show && activeViewId) {
      var view = document.getElementById(activeViewId);
      if (view) {
        view.style.display = 'block';
        view.classList.add('active');
      }
    }
  }

  function showIframe() {
    showNativeView(null, false);
    if (el.iframeWrap) el.iframeWrap.style.display = 'flex';
  }

  function backLinkHandler(e) {
    e.preventDefault();
    showIframe();
    loadUrl('/prayers/login.php');
    closeDrawer();
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function addBackBar(container, title, viewId) {
    var bar = '<div class="native-view-header">' + escapeHtml(title) + '</div><a href="#" class="back-to-iframe native-back-link">← Back to menu</a>';
    container.insertAdjacentHTML('afterbegin', bar);
    var back = container.querySelector('.native-back-link');
    if (back) back.addEventListener('click', backLinkHandler);
  }

  function loadUrl(path) {
    if (!path) return;
    if (window.APP_STORAGE) window.APP_STORAGE.setLastPath(path);
    var viewId = NATIVE_PATHS[path];
    if (!viewId && path.charAt(path.length - 1) !== '/') viewId = NATIVE_PATHS[path + '/'];
    if (viewId) {
      showLoading(false);
      showNativeView(viewId, true);
      currentPath = path;
      if (el.openTab) { el.openTab.href = SITE + path; el.openTab.style.display = 'inline'; }
      closeDrawer();
      if (viewId === 'native-redletters') loadRedLettersInApp();
      else if (viewId === 'native-dreams') loadDreamsInApp();
      else if (viewId === 'native-counsel') loadCounselInApp();
      else if (viewId === 'native-urim') loadUrimInApp();
      else if (viewId === 'native-p48x') loadP48xInApp();
      else if (viewId === 'native-translator') loadTranslatorInApp();
      else if (viewId === 'native-david') loadDavidInApp();
      else if (viewId === 'native-biblemap') loadBibleMapInApp();
      return;
    }
    currentPath = path;
    showNativeView(null, false);
    if (el.iframeWrap) el.iframeWrap.style.display = 'flex';
    el.frame.src = SITE + path;
    if (el.welcome) el.welcome.style.display = 'none';
    if (el.openTab) { el.openTab.href = SITE + path; el.openTab.style.display = 'inline'; }
    showLoading(true);
    closeDrawer();
  }

  function onIframeLoad() {
    showLoading(false);
  }

  function renderRedLetters(container, res) {
    if (!res || !res.data) return false;
    var html = '<div class="native-view-header">Red Letters — Words of Christ</div><a href="#" class="back-to-iframe rl-back">← Back to menu</a>';
    var sectionOrder = ['Melchizedek', 'Angel of the LORD', 'Matthew', 'Mark', 'Luke', 'John', 'Revelation'];
    sectionOrder.forEach(function(name) {
      var items = res.data[name];
      if (!items || !items.length) return;
      html += '<div class="rl-section"><div class="rl-section-title">' + escapeHtml(name) + '</div>';
      items.forEach(function(item) {
        html += '<div class="rl-card"><div class="rl-ref">' + escapeHtml(item.ref || '') + '</div><div class="rl-text">' + escapeHtml(item.text || '') + '</div></div>';
      });
      html += '</div>';
    });
    if (res.meta && res.meta.attribution) html += '<p class="rl-meta">' + escapeHtml(res.meta.attribution) + '</p>';
    container.innerHTML = html;
    var back = container.querySelector('.rl-back');
    if (back) back.addEventListener('click', backLinkHandler);
    return true;
  }

  function loadRedLettersInApp() {
    var container = el.nativeRedLetters;
    if (!container) return;
    container.innerHTML = '<div class="native-view-header">Red Letters — Words of Christ</div><a href="#" class="back-to-iframe rl-back">← Back to menu</a><div class="rl-loading">Loading…</div>';
    var back = container.querySelector('.rl-back');
    if (back) back.addEventListener('click', backLinkHandler);

    var cached = window.APP_STORAGE && window.APP_STORAGE.getRedLettersCache();
    if (cached && cached.success && cached.data) renderRedLetters(container, cached);

    var apiUrl = SITE + '/prayers/redletters_api.php';
    fetch(apiUrl)
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (window.APP_STORAGE && res && res.success && res.data) window.APP_STORAGE.setRedLettersCache(res);
        if (!res.success || !res.data) {
          if (!cached || !cached.data) {
            container.innerHTML = '<div class="native-view-header">Red Letters</div><a href="#" class="back-to-iframe rl-back">← Back</a><div class="rl-error">Could not load content. <a href="' + SITE + '/prayers/redletters.php" target="_blank">Open on website</a></div>';
            var b2 = container.querySelector('.rl-back');
            if (b2) b2.addEventListener('click', backLinkHandler);
          }
          return;
        }
        renderRedLetters(container, res);
      })
      .catch(function() {
        if (!cached || !cached.data) {
          container.innerHTML = '<div class="native-view-header">Red Letters</div><a href="#" class="back-to-iframe rl-back">← Back</a><div class="rl-error">Network error. <a href="' + SITE + '/prayers/redletters.php" target="_blank">Open on website</a></div>';
          var b4 = container.querySelector('.rl-back');
          if (b4) b4.addEventListener('click', backLinkHandler);
        }
      });
  }

  function loadDreamsInApp() {
    var container = el.nativeDreams;
    if (!container) return;
    container.innerHTML = '<div class="native-view-header">Dream Interpreter</div><a href="#" class="back-to-iframe native-back-link">← Back to menu</a><div class="native-chat-wrap"><div class="native-chat-messages" id="dreams-msgs"><div class="rl-loading">Loading…</div></div><form class="native-chat-form" id="dreams-form"><textarea id="dreams-input" placeholder="Describe your dream or ask a follow-up…" rows="3"></textarea><button type="submit" id="dreams-send">Interpret / Send</button></form></div>';
    var dreamsBack = container.querySelector('.back-to-iframe, .native-back-link');
    if (dreamsBack) dreamsBack.addEventListener('click', backLinkHandler);
    var msgs = document.getElementById('dreams-msgs');
    var form = document.getElementById('dreams-form');
    var input = document.getElementById('dreams-input');
    var sendBtn = document.getElementById('dreams-send');
    var chatHistory = [];

    function appendMsg(role, text) {
      var wrap = document.createElement('div');
      wrap.className = 'native-chat-msg ' + role;
      wrap.innerHTML = '<div class="msg-text">' + escapeHtml(text).replace(/\n/g, '<br>') + '</div><div class="msg-meta">' + (role === 'user' ? 'You' : 'Dreamstone') + '</div>';
      msgs.appendChild(wrap);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function setLoading(on) {
      sendBtn.disabled = on;
      if (on) msgs.innerHTML = msgs.innerHTML + '<div class="rl-loading">Thinking…</div>';
      else {
        var load = msgs.querySelector('.rl-loading');
        if (load) load.remove();
      }
      msgs.scrollTop = msgs.scrollHeight;
    }

    fetch(SITE + '/prayers/dreambot_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'action=generate_greeting&username=',
      credentials: 'include'
    }).then(function(r) { return r.json(); })
      .then(function(res) {
        var load = msgs.querySelector('.rl-loading');
        if (load) load.remove();
        if (res.success && res.greeting) appendMsg('assistant', res.greeting);
        else appendMsg('assistant', 'I am the Dreamstone, ready to interpret your dreams. Describe what you saw in your dream.');
      })
      .catch(function() {
        var load = msgs.querySelector('.rl-loading');
        if (load) load.remove();
        appendMsg('assistant', 'Welcome. Describe your dream and I will offer a biblical interpretation.');
      });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var text = (input.value || '').trim();
      if (!text) return;
      appendMsg('user', text);
      chatHistory.push({ role: 'user', content: text });
      input.value = '';
      setLoading(true);

      var isFirst = chatHistory.filter(function(m) { return m.role === 'user'; }).length === 1;
      var body;
      if (isFirst) {
        body = 'action=interpret&description=' + encodeURIComponent(text) + '&emotional_tone=&dream_type=&numbers=&colors=&user_response=&chat_history=' + encodeURIComponent(JSON.stringify(chatHistory));
      } else {
        body = 'action=chat&message=' + encodeURIComponent(text) + '&chat_history=' + encodeURIComponent(JSON.stringify(chatHistory)) + '&user_name=Dreamer';
      }

      fetch(SITE + '/prayers/dreambot_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
        credentials: 'include'
      }).then(function(r) { return r.json(); })
        .then(function(res) {
          setLoading(false);
          var reply = '';
          if (res.interpretation) reply = res.interpretation;
          else if (res.message) reply = res.message;
          else if (res.response) reply = res.response;
          else if (res.advanced_biblical_interpretation && res.advanced_biblical_interpretation.length) reply = res.advanced_biblical_interpretation.join('\n\n');
          else if (res.dynamic_interpretations && res.dynamic_interpretations.length) reply = res.dynamic_interpretations.join('\n\n');
          else reply = (typeof res === 'string') ? res : 'Interpretation received.';
          appendMsg('assistant', reply);
          chatHistory.push({ role: 'assistant', content: reply });
        })
        .catch(function(err) {
          setLoading(false);
          appendMsg('assistant', 'Network or server error. Try again or open Dream Interpreter on the website.');
        });
    });
  }

  function loadCounselInApp() {
    var container = el.nativeCounsel;
    if (!container) return;
    container.innerHTML = '<div class="native-view-header">Biblical Counsel</div><a href="#" class="back-to-iframe native-back-link">← Back to menu</a><div class="native-chat-wrap"><div class="native-chat-messages" id="counsel-msgs"></div><div class="native-chat-form"><p class="native-auth-msg" id="counsel-auth-msg" style="display:none;"></p><textarea id="counsel-query" placeholder="Describe your situation and the victory you seek…" rows="4"></textarea><button type="button" id="counsel-send">Ask the Council</button></div></div>';
    var counselBack = container.querySelector('.back-to-iframe, .native-back-link');
    if (counselBack) counselBack.addEventListener('click', backLinkHandler);
    var msgs = document.getElementById('counsel-msgs');
    var queryEl = document.getElementById('counsel-query');
    var sendBtn = document.getElementById('counsel-send');
    var authMsg = document.getElementById('counsel-auth-msg');

    sendBtn.addEventListener('click', function() {
      var query = (queryEl.value || '').trim();
      if (!query) return;
      msgs.innerHTML = '<div class="rl-loading">The council is deliberating…</div>';
      sendBtn.disabled = true;
      var formData = new FormData();
      formData.append('query', query);
      formData.append('personas', '["all"]');
      formData.append('comprehensive_mode', 'false');
      fetch(SITE + '/counsel/chatbot_api.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      }).then(function(r) {
        if (r.status === 401) {
          msgs.innerHTML = '';
          authMsg.style.display = 'block';
          authMsg.innerHTML = 'Please <a href="' + SITE + '/prayers/login.php" target="_blank">log in on the website</a> to use Biblical Counsel.';
          sendBtn.disabled = false;
          return null;
        }
        return r.json();
      }).then(function(data) {
        sendBtn.disabled = false;
        if (!data) return;
        var load = msgs.querySelector('.rl-loading');
        if (load) load.remove();
        if (data.counsel) {
          var html = '';
          for (var name in data.counsel) html += '<div class="native-chat-msg assistant"><div class="msg-text"><strong>' + escapeHtml(name) + '</strong><br>' + escapeHtml(data.counsel[name]).replace(/\n/g, '<br>') + '</div></div>';
          if (data.follow_up) html += '<div class="native-chat-msg assistant"><div class="msg-text">' + escapeHtml(data.follow_up) + '</div></div>';
          msgs.insertAdjacentHTML('beforeend', html);
        } else msgs.insertAdjacentHTML('beforeend', '<div class="rl-error">No counsel returned.</div>');
        msgs.scrollTop = msgs.scrollHeight;
      }).catch(function() {
        sendBtn.disabled = false;
        var load = msgs.querySelector('.rl-loading');
        if (load) load.remove();
        msgs.insertAdjacentHTML('beforeend', '<div class="rl-error">Network error. Log in on the website if needed.</div>');
      });
    });
  }

  function loadUrimInApp() {
    var container = el.nativeUrim;
    if (!container) return;
    container.innerHTML = '<div class="native-view-header">Urim & Thummim</div><a href="#" class="back-to-iframe native-back-link">← Back to menu</a><div class="native-chat-wrap"><div class="native-chat-messages" id="urim-msgs"></div><form class="native-chat-form" id="urim-form"><textarea id="urim-input" placeholder="Ask your question…" rows="3"></textarea><button type="submit" id="urim-send">Seek the Oracle</button></form></div>';
    var urimBack = container.querySelector('.back-to-iframe, .native-back-link');
    if (urimBack) urimBack.addEventListener('click', backLinkHandler);
    var msgs = document.getElementById('urim-msgs');
    var form = document.getElementById('urim-form');
    var input = document.getElementById('urim-input');
    var sendBtn = document.getElementById('urim-send');
    var csrfToken = null;

    function appendMsg(role, text) {
      var wrap = document.createElement('div');
      wrap.className = 'native-chat-msg ' + role;
      wrap.innerHTML = '<div class="msg-text">' + (role === 'user' ? escapeHtml(text).replace(/\n/g, '<br>') : text) + '</div>';
      msgs.appendChild(wrap);
      msgs.scrollTop = msgs.scrollHeight;
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var text = (input.value || '').trim();
      if (!text) return;
      appendMsg('user', text);
      input.value = '';
      sendBtn.disabled = true;
      msgs.insertAdjacentHTML('beforeend', '<div class="rl-loading">Consulting…</div>');
      msgs.scrollTop = msgs.scrollHeight;

      var payload = { action: 'chat', query: text };
      if (csrfToken) payload.csrf_token = csrfToken;
      fetch(SITE + '/prayers/chatbot3_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      }).then(function(r) { return r.json(); })
        .then(function(res) {
          if (res.csrf_token) csrfToken = res.csrf_token;
          var load = msgs.querySelector('.rl-loading');
          if (load) load.remove();
          if (res.error) {
            appendMsg('assistant', res.error + (res.redirect ? ' <a href="' + SITE + res.redirect + '" target="_blank">Log in</a>' : ''));
            sendBtn.disabled = false;
            return;
          }
          var content = (res.evidence_bubble || '') + (res.authoritative_bubble ? '<br><br>' + res.authoritative_bubble : '') || res.answer || res.response || res.message || 'No response.';
          appendMsg('assistant', content);
          sendBtn.disabled = false;
        })
        .catch(function() {
          var load = msgs.querySelector('.rl-loading');
          if (load) load.remove();
          appendMsg('assistant', 'Network error or session required. Please log in on the website to use Urim & Thummim.');
          sendBtn.disabled = false;
        });
    });
    appendMsg('assistant', 'Ask your question and the Oracle will respond with scripture-grounded counsel.');
  }

  var P48_QUALITIES = ['Purity', 'Truth', 'Praiseworthy', 'Wholesome', 'Excellence', 'Admirable', 'Peace', 'Honorable', 'Lovely'];
  var P48_QUESTIONS = {
    Purity: 'What thought or motive can you surrender to God today for greater purity?',
    Truth: 'Where do you need to align more fully with God\'s truth this week?',
    Praiseworthy: 'What act of God\'s faithfulness can you praise Him for today?',
    Wholesome: 'What wholesome input can you choose to feed your mind today?',
    Excellence: 'In what one task can you offer God excellence today?',
    Admirable: 'What admirable action can you take today that honors God?',
    Peace: 'What anxiety can you surrender to God for His peace?',
    Honorable: 'How can you act with honor in a difficult situation?',
    Lovely: 'Where have you seen the loveliness of God\'s creation recently?'
  };

  function loadP48xInApp() {
    var container = el.nativeP48x;
    if (!container) return;
    container.innerHTML = '<div class="native-view-header">P48X Reflections</div><a href="#" class="back-to-iframe native-back-link">← Back to menu</a><div class="native-chat-wrap"><div class="native-p48x-qualities" id="p48x-qualities"></div><div class="translator-row"><label>Reflection question</label><select id="p48x-question"></select></div><div class="translator-row"><label>Your reflection</label><textarea id="p48x-entry" rows="4" placeholder="Write your reflection…"></textarea></div><button type="button" id="p48x-save">Save entry</button><div class="native-p48x-list" id="p48x-list"><div class="rl-loading">Loading journal…</div></div></div>';
    var p48xBack = container.querySelector('.back-to-iframe, .native-back-link');
    if (p48xBack) p48xBack.addEventListener('click', backLinkHandler);
    var qualDiv = document.getElementById('p48x-qualities');
    var questionSel = document.getElementById('p48x-question');
    var entryText = document.getElementById('p48x-entry');
    var saveBtn = document.getElementById('p48x-save');
    var listEl = document.getElementById('p48x-list');
    var selectedQuality = 'Purity';

    P48_QUALITIES.forEach(function(q) {
      var btn = document.createElement('button');
      btn.textContent = q;
      btn.dataset.quality = q;
      if (q === 'Purity') btn.classList.add('active');
      btn.addEventListener('click', function() {
        qualDiv.querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        selectedQuality = q;
        questionSel.innerHTML = '';
        var opt = document.createElement('option');
        opt.value = P48_QUESTIONS[q];
        opt.textContent = P48_QUESTIONS[q];
        questionSel.appendChild(opt);
      });
      qualDiv.appendChild(btn);
    });
    questionSel.innerHTML = '<option value="' + escapeHtml(P48_QUESTIONS.Purity) + '">' + escapeHtml(P48_QUESTIONS.Purity) + '</option>';

    function loadEntries() {
      listEl.innerHTML = '<div class="rl-loading">Loading…</div>';
      fetch(SITE + '/prayers/p48x_ajax.php?action=get_entries_page&page=1', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          listEl.innerHTML = '';
          if (res.redirect || (res.success === false && res.message && res.message.indexOf('Authentication') !== -1)) {
            listEl.innerHTML = '<p class="native-auth-msg">Please <a href="' + SITE + '/prayers/login.php" target="_blank">log in</a> to save and view P48X reflections.</p>';
            return;
          }
          if (res.success && res.html) listEl.innerHTML = res.html;
          else listEl.innerHTML = '<p class="native-auth-msg">Log in on the website to see your journal.</p>';
        })
        .catch(function() {
          listEl.innerHTML = '<p class="rl-error">Could not load journal.</p>';
        });
    }
    loadEntries();

    saveBtn.addEventListener('click', function() {
      var question = questionSel.value;
      var text = (entryText.value || '').trim();
      if (!question || !text) return;
      var formData = new FormData();
      formData.append('action', 'save_entry');
      formData.append('quality', selectedQuality);
      formData.append('question', question);
      formData.append('entry_text', text);
      saveBtn.disabled = true;
      fetch(SITE + '/prayers/p48x_ajax.php', { method: 'POST', body: formData, credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          saveBtn.disabled = false;
          if (res.success) { entryText.value = ''; loadEntries(); }
          else listEl.innerHTML = '<p class="rl-error">' + (res.message || 'Save failed. Log in on the website.') + '</p>';
        })
        .catch(function() {
          saveBtn.disabled = false;
          listEl.innerHTML = '<p class="rl-error">Network error. Log in on the website to save.</p>';
        });
    });
  }

  function loadTranslatorInApp() {
    var container = el.nativeTranslator;
    if (!container) return;
    container.innerHTML = '<div class="native-view-header">Spousal Translator</div><a href="#" class="back-to-iframe native-back-link">← Back to menu</a><div class="native-chat-wrap"><div class="translator-row"><label>I am</label><select id="trans-spouse"><option value="husband">Husband</option><option value="wife">Wife</option></select></div><div class="translator-row"><label>My name (optional)</label><input type="text" id="trans-name" placeholder="Your name"></div><div class="translator-row"><label>What you want to say (raw / emotional)</label><textarea id="trans-query" rows="4" placeholder="Type what you feel…"></textarea></div><button type="button" id="trans-submit">Translate with love</button><div class="native-chat-messages" id="trans-result"></div></div>';
    var transBack = container.querySelector('.back-to-iframe, .native-back-link');
    if (transBack) transBack.addEventListener('click', backLinkHandler);
    var resultDiv = document.getElementById('trans-result');
    var spouseSel = document.getElementById('trans-spouse');
    var nameInput = document.getElementById('trans-name');
    var queryEl = document.getElementById('trans-query');
    var submitBtn = document.getElementById('trans-submit');

    submitBtn.addEventListener('click', function() {
      var query = (queryEl.value || '').trim();
      if (!query) return;
      resultDiv.innerHTML = '<div class="rl-loading">Translating…</div>';
      var formData = new FormData();
      formData.append('query', query);
      formData.append('spouse_perspective', spouseSel.value);
      formData.append('spouse_name', nameInput.value || '');
      formData.append('deeper_translation', 'false');
      fetch(SITE + '/translator/chatbot_api.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      }).then(function(r) {
        if (r.status === 401) {
          resultDiv.innerHTML = '<p class="native-auth-msg">Please <a href="' + SITE + '/prayers/login.php" target="_blank">log in on the website</a> to use the Spousal Translator.</p>';
          return null;
        }
        return r.json();
      }).then(function(data) {
        if (!data) return;
        var load = resultDiv.querySelector('.rl-loading');
        if (load) load.remove();
        if (data.translation) {
          resultDiv.innerHTML = '<div class="native-chat-msg assistant"><div class="msg-text">' + escapeHtml(data.translation).replace(/\n/g, '<br>') + '</div></div>';
          if (data.action_steps && data.action_steps.length) resultDiv.innerHTML += '<div class="native-chat-msg assistant"><div class="msg-text"><strong>Steps:</strong> ' + escapeHtml(data.action_steps.join('; ')) + '</div></div>';
        } else resultDiv.innerHTML = '<div class="rl-error">' + (data.error || 'Translation failed.') + '</div>';
      }).catch(function() {
        var load = resultDiv.querySelector('.rl-loading');
        if (load) load.remove();
        resultDiv.innerHTML = '<div class="rl-error">Network error. Log in on the website if needed.</div>';
      });
    });
  }

  function loadDavidInApp() {
    var container = el.nativeDavid;
    if (!container) return;
    var href = window.location.href;
    var base = href.substring(0, href.lastIndexOf('/') + 1);
    var gameUrl = base + 'games/davidvsgoliath/index.html';
    if (el.davidFrame) el.davidFrame.src = gameUrl;
    var header = container.querySelector('.native-view-header');
    if (!header) {
      container.insertAdjacentHTML('afterbegin', '<div class="native-view-header">David vs Goliath</div><a href="#" class="back-to-iframe native-back-link">← Back to menu</a>');
      var back = container.querySelector('.native-back-link');
      if (back) back.addEventListener('click', backLinkHandler);
    }
  }

  function loadBibleMapInApp() {
    var container = el.nativeBiblemap;
    if (!container) return;
    if (el.biblemapFrame) el.biblemapFrame.src = SITE + '/prayers/map/';
    var header = container.querySelector('.native-view-header');
    if (!header) {
      container.insertAdjacentHTML('afterbegin', '<div class="native-view-header">Bible Map</div><a href="#" class="back-to-iframe native-back-link">← Back to menu</a>');
      var back = container.querySelector('.native-back-link');
      if (back) back.addEventListener('click', backLinkHandler);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    (window.APP_CONFIG_READY || Promise.resolve()).then(function() {
      if (window.APP_CONFIG && window.APP_CONFIG.SITE_URL) {
        SITE = (window.APP_CONFIG.SITE_URL + '').replace(/\/$/, '');
      }
      var isLocalhost = /localhost|127\.0\.0\.1/i.test(window.location.hostname);
      var previewBanner = document.getElementById('preview-banner');
      if (isLocalhost && previewBanner) previewBanner.style.display = 'flex';

      if (el.frame) el.frame.addEventListener('load', onIframeLoad);

      document.querySelector('.menu-btn').addEventListener('click', openDrawer);
      document.querySelector('.drawer-overlay').addEventListener('click', closeDrawer);
      [].slice.call(document.querySelectorAll('.drawer-link[data-path]')).forEach(function(link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          loadUrl(this.getAttribute('data-path'));
        });
      });

      var initialPath = '/prayers/login.php';
      if (window.APP_STORAGE) {
        var startPath = window.APP_STORAGE.getStartPath();
        var lastPath = window.APP_STORAGE.getLastPath();
        if (startPath) initialPath = startPath;
        else if (lastPath) initialPath = lastPath;
      }
      loadUrl(initialPath);
    });
  });
})();
