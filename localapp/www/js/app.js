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
    '/prayers/map/': 'native-biblemap',
    '/prayers/spiritual_gifts_test.php': 'native-spiritualgifts'
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
    biblemapFrame: document.getElementById('biblemap-frame'),
    nativeSpiritualgifts: document.getElementById('native-spiritualgifts'),
    spiritualgiftsFrame: document.getElementById('spiritualgifts-frame')
  };

  var allNativeViews = [
    el.nativeRedLetters, el.nativeDreams, el.nativeCounsel, el.nativeUrim,
    el.nativeP48x, el.nativeTranslator, el.nativeDavid, el.nativeBiblemap, el.nativeSpiritualgifts
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
    openDrawer();
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
      else if (viewId === 'native-spiritualgifts') loadSpiritualGiftsInApp();
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
    refreshLoginState();
  }

  function refreshLoginState() {
    var headerUser = document.getElementById('header-user');
    var headerUsername = document.getElementById('header-username');
    var drawerMsg = document.getElementById('drawer-login-msg');
    var drawerLoginLink = document.getElementById('drawer-login-link');
    if (!headerUser || !headerUsername) return;
    fetch(SITE + '/prayers/app_login_status.php', { credentials: 'include' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.loggedIn && data.displayName) {
          headerUsername.textContent = data.displayName;
          headerUser.style.display = 'flex';
          if (drawerMsg) drawerMsg.textContent = 'Signed in as ' + data.displayName;
          if (drawerLoginLink) {
            drawerLoginLink.classList.remove('highlight');
            drawerLoginLink.textContent = 'Login';
          }
        } else {
          headerUser.style.display = 'none';
          if (drawerMsg) drawerMsg.textContent = 'Log in to sync with your website account.';
          if (drawerLoginLink) {
            drawerLoginLink.classList.add('highlight');
            drawerLoginLink.textContent = 'Login';
          }
        }
      })
      .catch(function() {
        headerUser.style.display = 'none';
        if (drawerMsg) drawerMsg.textContent = 'Log in to sync with your website account.';
        if (drawerLoginLink) drawerLoginLink.classList.add('highlight');
      });
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
    function showRedLettersError(msg) {
      container.innerHTML = '<div class="native-view-header">Red Letters</div><a href="#" class="back-to-iframe rl-back">← Back</a><div class="rl-error">' + msg + ' <a href="' + SITE + '/prayers/redletters.php" target="_blank">Open on website</a></div>';
      var b = container.querySelector('.rl-back');
      if (b) b.addEventListener('click', backLinkHandler);
    }
    function remapRedLettersRaw(raw) {
      if (!raw || typeof raw !== 'object') return null;
      return {
        success: true,
        data: {
          'Melchizedek': raw.Melchizedek || [],
          'Angel of the LORD': (raw.Angel_of_the_LORD || []).concat(raw.Pre_Incarnate_Christophanies || []),
          'Matthew': raw['Gospel of Matthew'] || [],
          'Mark': raw['Gospel of Mark'] || [],
          'Luke': raw['Gospel of Luke'] || [],
          'John': raw['Gospel of John'] || [],
          'Revelation': raw.Glorified || []
        },
        meta: { version: 'WEB', attribution: 'World English Bible (WEB) is in the public domain.' }
      };
    }
    function tryBundledRedLetters() {
      fetch('data/redletters_web.json', { credentials: 'omit' })
        .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function(raw) {
          var res = remapRedLettersRaw(raw);
          if (res && res.data) {
            if (window.APP_STORAGE) window.APP_STORAGE.setRedLettersCache(res);
            renderRedLetters(container, res);
          } else showRedLettersError('Could not load content.');
        })
        .catch(function() { showRedLettersError('Network error.'); });
    }
    fetch(apiUrl, { credentials: 'omit', mode: 'cors' })
      .then(function(r) {
        var ct = (r.headers.get('content-type') || '').toLowerCase();
        if (!r.ok) {
          return r.text().then(function() { return { success: false }; });
        }
        if (ct.indexOf('application/json') !== -1) return r.json();
        return r.text().then(function() { return { success: false }; });
      })
      .then(function(res) {
        if (window.APP_STORAGE && res && res.success && res.data) window.APP_STORAGE.setRedLettersCache(res);
        if (!res || !res.success || !res.data) {
          if (cached && cached.data) return;
          tryBundledRedLetters();
          return;
        }
        renderRedLetters(container, res);
      })
      .catch(function() {
        if (cached && cached.data) return;
        tryBundledRedLetters();
      });
  }

  function loadDreamsInApp() {
    var container = el.nativeDreams;
    if (!container) return;
    container.innerHTML = '<div class="native-view-header">Dream Interpreter</div><a href="#" class="back-to-iframe native-back-link">← Back to menu</a><div class="native-chat-card"><div class="native-chat-header"><div class="chat-card-title"><i class="fas fa-moon"></i> Dreamstone</div><p class="native-chat-subtitle">Connect with the Spirit for biblical dream interpretation.</p></div><div class="native-chat-wrap"><div class="native-chat-messages" id="dreams-msgs"><div class="rl-loading">Loading…</div></div><div class="dreams-options-row"><label class="dreams-opt-label"><span>Emotional Tone</span><select id="dreams-emotional-tone"><option value="">Select…</option><option value="peaceful">Peaceful & Calm</option><option value="fearful">Fearful & Anxious</option><option value="joyful">Joyful & Exciting</option><option value="confused">Confused & Unclear</option><option value="urgent">Urgent & Important</option><option value="mysterious">Mysterious & Spiritual</option><option value="anxious">Anxious</option><option value="hopeful">Hopeful</option><option value="overwhelming">Overwhelming</option><option value="none">No specific tone</option></select></label><label class="dreams-opt-label"><span>Colors</span><select id="dreams-colors"><option value="">Select…</option><option value="red">Red</option><option value="blue">Blue</option><option value="white">White</option><option value="green">Green</option><option value="yellow">Yellow</option><option value="purple">Purple</option><option value="gold">Gold</option><option value="black">Black</option><option value="silver">Silver</option><option value="orange">Orange</option><option value="pink">Pink</option><option value="brown">Brown</option><option value="none">None</option></select></label><label class="dreams-opt-label"><span>Numbers</span><select id="dreams-numbers"><option value="">Select…</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="40">40</option><option value="none">None</option></select></label><label class="dreams-opt-label"><span>Dream Type</span><select id="dreams-type"><option value="">Select…</option><option value="prophetic">Prophetic</option><option value="warning">Warning</option><option value="encouragement">Encouragement</option><option value="instruction">Instruction</option><option value="revelation">Revelation</option><option value="spiritual_warfare">Spiritual Warfare</option><option value="healing">Healing</option><option value="ministry">Ministry</option><option value="deliverance">Deliverance</option><option value="covenant">Covenant</option><option value="judgment">Judgment</option><option value="restoration">Restoration</option><option value="commission">Commission</option><option value="not_sure">Not sure</option></select></label></div><div class="native-chat-controls"><button type="button" class="new-dream-btn" id="dreams-new"><i class="fas fa-plus"></i> New dream</button><button type="button" class="clear-btn" id="dreams-clear"><i class="fas fa-eraser"></i> Clear</button><button type="button" class="save-session-btn" id="dreams-save-session"><i class="fas fa-archive"></i> Save session</button></div><form class="native-chat-form" id="dreams-form"><textarea id="dreams-input" placeholder="Describe your dream or ask a follow-up…" rows="3"></textarea><button type="submit" id="dreams-send" class="primary-chat-btn"><i class="fas fa-magic"></i> Interpret / Send</button></form></div></div>';
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
      wrap.innerHTML = '<div class="msg-text">' + (role === 'user' ? escapeHtml(text).replace(/\n/g, '<br>') : text) + '</div><div class="msg-meta">' + (role === 'user' ? 'You' : 'Dreamstone') + '</div>';
      msgs.appendChild(wrap);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function setLoading(on) {
      sendBtn.disabled = on;
      if (on) { var l = document.createElement('div'); l.className = 'rl-loading'; l.textContent = 'Thinking…'; msgs.appendChild(l); }
      else { var load = msgs.querySelector('.rl-loading'); if (load) load.remove(); }
      msgs.scrollTop = msgs.scrollHeight;
    }

    function saveDreamsHistory() {
      if (chatHistory.length === 0) return;
      var formData = new FormData();
      formData.append('action', 'save_history');
      formData.append('history', JSON.stringify(chatHistory));
      fetch(SITE + '/prayers/dreambot_api.php', { method: 'POST', body: formData, credentials: 'include' }).then(function(r) { return r.json(); }).catch(function() {});
    }

    function showGreeting() {
      var defaultGreeting = 'Welcome. Describe your dream and I will offer a biblical interpretation.';
      appendMsg('assistant', defaultGreeting);
      chatHistory.push({ role: 'assistant', content: defaultGreeting });
    }

    document.getElementById('dreams-new').addEventListener('click', function() {
      msgs.innerHTML = '';
      chatHistory = [];
      fetch(SITE + '/prayers/dreambot_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=generate_greeting&username=',
        credentials: 'include'
      }).then(function(r) { return r.json(); })
        .then(function(res) {
          var greeting = (res.success && res.greeting) ? res.greeting : 'Welcome. Describe your dream and I will offer a biblical interpretation.';
          appendMsg('assistant', greeting);
          chatHistory.push({ role: 'assistant', content: greeting });
        })
        .catch(function() { showGreeting(); });
    });
    document.getElementById('dreams-clear').addEventListener('click', function() {
      msgs.innerHTML = '';
      chatHistory = [];
      showGreeting();
    });
    document.getElementById('dreams-save-session').addEventListener('click', function() {
      if (chatHistory.length === 0) return;
      var btn = document.getElementById('dreams-save-session');
      var origText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';
      btn.disabled = true;
      var formData = new FormData();
      formData.append('action', 'save_history');
      formData.append('history', JSON.stringify(chatHistory));
      fetch(SITE + '/prayers/dreambot_api.php', { method: 'POST', body: formData, credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function() {
          btn.innerHTML = '<i class="fas fa-check"></i> Saved';
          btn.disabled = false;
          setTimeout(function() { btn.innerHTML = origText; }, 2000);
        })
        .catch(function() {
          btn.innerHTML = origText;
          btn.disabled = false;
        });
    });

    fetch(SITE + '/prayers/dreambot_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'action=load_history',
      credentials: 'include'
    }).then(function(r) { return r.json(); })
      .then(function(res) {
        var load = msgs.querySelector('.rl-loading');
        if (load) load.remove();
        if (res.success && res.history && Array.isArray(res.history) && res.history.length > 0) {
          res.history.forEach(function(entry) {
            var role = (entry.type || entry.role || 'assistant');
            var content = entry.content || entry.text || '';
            if (!content) return;
            chatHistory.push({ role: role, content: content });
            appendMsg(role === 'user' ? 'user' : 'assistant', content);
          });
        } else {
          fetch(SITE + '/prayers/dreambot_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=generate_greeting&username=',
            credentials: 'include'
          }).then(function(r2) { return r2.json(); })
            .then(function(res2) {
              var greeting = (res2.success && res2.greeting) ? res2.greeting : 'Welcome. Describe your dream and I will offer a biblical interpretation.';
              appendMsg('assistant', greeting);
              chatHistory.push({ role: 'assistant', content: greeting });
            })
            .catch(function() {
              appendMsg('assistant', 'Welcome. Describe your dream and I will offer a biblical interpretation.');
              chatHistory.push({ role: 'assistant', content: 'Welcome. Describe your dream and I will offer a biblical interpretation.' });
            });
        }
      })
      .catch(function() {
        var load = msgs.querySelector('.rl-loading');
        if (load) load.remove();
        appendMsg('assistant', 'Welcome. Describe your dream and I will offer a biblical interpretation.');
        chatHistory.push({ role: 'assistant', content: 'Welcome. Describe your dream and I will offer a biblical interpretation.' });
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
        var emotionalToneEl = document.getElementById('dreams-emotional-tone');
        var colorsEl = document.getElementById('dreams-colors');
        var numbersEl = document.getElementById('dreams-numbers');
        var typeEl = document.getElementById('dreams-type');
        function dreamOpt(v) { return (!v || v === 'none' || v === 'not_sure') ? '' : v; }
        var emotionalTone = dreamOpt(emotionalToneEl ? emotionalToneEl.value : '');
        var dreamType = dreamOpt(typeEl ? typeEl.value : '');
        var numbers = dreamOpt(numbersEl ? numbersEl.value : '');
        var colors = dreamOpt(colorsEl ? colorsEl.value : '');
        body = 'action=interpret&description=' + encodeURIComponent(text) + '&emotional_tone=' + encodeURIComponent(emotionalTone) + '&dream_type=' + encodeURIComponent(dreamType) + '&numbers=' + encodeURIComponent(numbers) + '&colors=' + encodeURIComponent(colors) + '&user_response=&chat_history=' + encodeURIComponent(JSON.stringify(chatHistory));
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
          saveDreamsHistory();
        })
        .catch(function() {
          setLoading(false);
          appendMsg('assistant', 'Network or server error. Try again or open Dream Interpreter on the website.');
        });
    });
  }

  var COUNSELOR_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'nathan', label: 'Nathan' },
    { value: 'ahitophel_loyal', label: 'Ahitophel' },
    { value: 'jehoshaphat', label: 'Jehoshaphat' },
    { value: 'daniel', label: 'Daniel' },
    { value: 'elders_of_israel', label: 'Elders' },
    { value: 'king_solomon', label: 'Solomon' },
    { value: 'jesus_christ_yeshua', label: 'Jesus' },
    { value: 'moses', label: 'Moses' },
    { value: 'enoch', label: 'Enoch' },
    { value: 'john_the_apostle', label: 'John' },
    { value: 'paul_the_apostle', label: 'Paul' },
    { value: 'peter_the_apostle', label: 'Peter' }
  ];

  function loadCounselInApp() {
    var container = el.nativeCounsel;
    if (!container) return;
    var toggleHtml = COUNSELOR_OPTIONS.map(function(o, i) {
      return '<label class="counsel-toggle-label"><input type="radio" name="counselor-selection" value="' + escapeHtml(o.value) + '"' + (i === 0 ? ' checked' : '') + '><span class="toggle-text">' + escapeHtml(o.label) + '</span></label>';
    }).join('');
    container.innerHTML = '<div class="native-view-header">Biblical Counsel</div><a href="#" class="back-to-iframe native-back-link">← Back to menu</a><div class="native-chat-card"><div class="native-chat-header"><div class="chat-card-title"><i class="fas fa-users"></i> The Council of Twelve</div><p class="native-chat-subtitle">In an abundance of counselors there is victory. — Proverbs 24:6</p></div><div class="native-chat-wrap"><div class="counsel-toggles-wrap"><span class="counsel-toggles-title">Choose counselor:</span><div class="counsel-personas">' + toggleHtml + '</div></div><div class="native-chat-messages" id="counsel-msgs"></div><div class="native-chat-form"><p class="native-auth-msg" id="counsel-auth-msg" style="display:none;"></p><textarea id="counsel-query" placeholder="Describe your situation and the victory you seek…" rows="4"></textarea><button type="button" id="counsel-send" class="primary-chat-btn"><i class="fas fa-gavel"></i> Ask the Council</button></div></div></div>';
    var counselBack = container.querySelector('.back-to-iframe, .native-back-link');
    if (counselBack) counselBack.addEventListener('click', backLinkHandler);
    var msgs = document.getElementById('counsel-msgs');
    var queryEl = document.getElementById('counsel-query');
    var sendBtn = document.getElementById('counsel-send');
    var authMsg = document.getElementById('counsel-auth-msg');

    msgs.innerHTML = '<div class="native-chat-msg initial-greeting"><div class="msg-text">The council gathers in the great hall. Stone pillars rise into the shadows, torches flicker, casting long shadows on the walls. Twelve of history\'s wisest advisors take their seats around the great table. Their eyes turn to you, expectant. They are here to provide counsel for your victory. What is the nature of the situation you face?</div></div>';

    function getSelectedPersonas() {
      var radio = container.querySelector('input[name="counselor-selection"]:checked');
      return radio ? [radio.value] : ['all'];
    }

    sendBtn.addEventListener('click', function() {
      var query = (queryEl.value || '').trim();
      if (!query) return;
      var userHtml = '<div class="native-chat-msg user"><div class="msg-text">' + escapeHtml(query).replace(/\n/g, '<br>') + '</div></div>';
      msgs.insertAdjacentHTML('beforeend', userHtml);
      msgs.insertAdjacentHTML('beforeend', '<div class="rl-loading">The council is deliberating…</div>');
      queryEl.value = '';
      sendBtn.disabled = true;
      var personas = getSelectedPersonas();
      var comprehensiveMode = personas.length === 1 && personas[0] !== 'all';
      var formData = new FormData();
      formData.append('query', query);
      formData.append('personas', JSON.stringify(personas));
      formData.append('comprehensive_mode', comprehensiveMode);
      fetch(SITE + '/counsel/chatbot_api.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      }).then(function(r) {
        if (r.status === 401) {
          msgs.querySelector('.rl-loading').remove();
          authMsg.style.display = 'block';
          authMsg.innerHTML = 'Please <a href="' + SITE + '/prayers/login.php" target="_blank">log in on the website</a> to use Biblical Counsel.';
          sendBtn.disabled = false;
          return null;
        }
        return r.json();
      }).then(function(data) {
        sendBtn.disabled = false;
        var load = msgs.querySelector('.rl-loading');
        if (load) load.remove();
        if (!data) return;
        if (data.counsel) {
          var html = '';
          for (var name in data.counsel) html += '<div class="native-chat-msg assistant counsel-response"><div class="counselor-title">' + escapeHtml(name) + '</div><div class="msg-text">' + escapeHtml(data.counsel[name]).replace(/\n/g, '<br>') + '</div></div>';
          if (data.follow_up) html += '<div class="native-chat-msg assistant"><div class="msg-text">' + escapeHtml(data.follow_up) + '</div></div>';
          msgs.insertAdjacentHTML('beforeend', html);
        } else msgs.insertAdjacentHTML('beforeend', '<div class="rl-error">No counsel returned.</div>');
        msgs.scrollTop = msgs.scrollHeight;
      }).catch(function() {
        sendBtn.disabled = false;
        var load = msgs.querySelector('.rl-loading');
        if (load) load.remove();
        msgs.insertAdjacentHTML('beforeend', '<div class="rl-error">Network error. Log in on the website if needed.</div>');
        msgs.scrollTop = msgs.scrollHeight;
      });
    });
  }

  function loadUrimInApp() {
    var container = el.nativeUrim;
    if (!container) return;
    var urimTogglesHtml = '<div class="urim-toggles-wrap"><span class="urim-toggles-title">Sources:</span><div class="urim-toggles">' +
      '<button type="button" class="urim-toggle-btn active" data-filter="amplified">Amplified Bible</button>' +
      '<button type="button" class="urim-toggle-btn" data-filter="ts2009">TS2009</button>' +
      '<button type="button" class="urim-toggle-btn" data-filter="living_preachers">Living Preachers</button>' +
      '<button type="button" class="urim-toggle-btn" data-filter="deceased_preachers">Deceased Preachers</button>' +
      '<button type="button" class="urim-toggle-btn" data-filter="apocrypha_enoch">Apocrypha & Enoch</button>' +
      '</div></div>';
    container.innerHTML = '<div class="native-view-header">Urim & Thummim</div><a href="#" class="back-to-iframe native-back-link">← Back to menu</a><div class="native-chat-card"><div class="native-chat-header"><div class="chat-card-title"><i class="fas fa-dove"></i> The Oracle</div><p class="native-chat-subtitle">Scripture-grounded counsel for your questions.</p></div>' + urimTogglesHtml + '<div class="urim-instruction">Ask your question below. The Oracle will respond with evidence and an authoritative word.</div><button type="button" class="urim-clear-btn" id="urim-clear">Clear History</button><div class="native-chat-wrap"><div class="native-chat-messages" id="urim-msgs"></div><form class="native-chat-form" id="urim-form"><textarea id="urim-input" placeholder="Ask your question…" rows="3"></textarea><button type="submit" id="urim-send" class="primary-chat-btn"><i class="fas fa-dove"></i> Seek the Oracle</button></form></div></div>';
    var urimBack = container.querySelector('.back-to-iframe, .native-back-link');
    if (urimBack) urimBack.addEventListener('click', backLinkHandler);
    var msgs = document.getElementById('urim-msgs');
    var form = document.getElementById('urim-form');
    var input = document.getElementById('urim-input');
    var sendBtn = document.getElementById('urim-send');
    var clearBtn = document.getElementById('urim-clear');
    var csrfToken = null;
    var urimHistory = [];

    function appendUrimResponse(query, evidence, authoritative) {
      var userWrap = document.createElement('div');
      userWrap.className = 'native-chat-msg user';
      userWrap.innerHTML = '<div class="msg-text">' + escapeHtml(query).replace(/\n/g, '<br>') + '</div>';
      msgs.appendChild(userWrap);
      var asstWrap = document.createElement('div');
      asstWrap.className = 'native-chat-msg assistant urim-response';
      var html = '';
      if (evidence) html += '<div class="urim-evidence">' + evidence + '</div>';
      if (authoritative) html += '<div class="urim-authoritative">' + authoritative + '</div>';
      if (!html) html = '<div class="msg-text">No response.</div>';
      asstWrap.innerHTML = html;
      msgs.appendChild(asstWrap);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function saveUrimHistory(forceEmpty) {
      if (!csrfToken && !forceEmpty) return;
      var payload = { action: 'save_history', history: forceEmpty ? [] : urimHistory };
      if (csrfToken) payload.csrf_token = csrfToken;
      fetch(SITE + '/prayers/chatbot3_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      }).then(function(r) { return r.json(); }).then(function(res) { if (res && res.csrf_token) csrfToken = res.csrf_token; }).catch(function() {});
    }

    fetch(SITE + '/prayers/chatbot3_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'load_history' }),
      credentials: 'include'
    }).then(function(r) { return r.json(); })
      .then(function(res) {
        if (res && res.csrf_token) csrfToken = res.csrf_token;
        if (res && res.history && Array.isArray(res.history)) {
          urimHistory = res.history;
          res.history.forEach(function(entry) {
            if (entry.query && entry.response) {
              var ev = entry.response.evidence_bubble || '';
              var auth = entry.response.authoritative_bubble || '';
              appendUrimResponse(entry.query, ev, auth);
            }
          });
        }
      })
      .catch(function() {});

    clearBtn.addEventListener('click', function() {
      urimHistory = [];
      msgs.innerHTML = '';
      saveUrimHistory(true);
      if (clearBtn && clearBtn.blur) clearBtn.blur();
    });

    function setUrimToggleActive(filterName, active) {
      var btn = container.querySelector('.urim-toggle-btn[data-filter="' + filterName + '"]');
      if (btn) btn.classList.toggle('active', !!active);
    }
    function syncUrimToggleToServer(filterName, state, callback) {
      var payload = { query: '__TOGGLE_EVENT__', filter_name: filterName, filter_state: state };
      if (csrfToken) payload.csrf_token = csrfToken;
      fetch(SITE + '/prayers/chatbot3_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      }).then(function(r) { return r.json(); })
        .then(function(res) {
          if (res && res.csrf_token) csrfToken = res.csrf_token;
          if (callback) callback(res);
        })
        .catch(function() { if (callback) callback({}); });
    }
    container.querySelectorAll('.urim-toggle-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var filterName = btn.getAttribute('data-filter');
        var isActive = btn.classList.contains('active');
        var nextState = !isActive;
        var togglesToSync = [{ name: filterName, state: nextState }];
        if (filterName === 'amplified' && !nextState) togglesToSync.push({ name: 'ts2009', state: true });
        if (filterName === 'ts2009' && !nextState) togglesToSync.push({ name: 'amplified', state: true });
        if (filterName === 'living_preachers' && nextState) togglesToSync.push({ name: 'deceased_preachers', state: false });
        if (filterName === 'deceased_preachers' && nextState) togglesToSync.push({ name: 'living_preachers', state: false });
        togglesToSync.forEach(function(t) { setUrimToggleActive(t.name, t.state); });
        (function doSync(i) {
          if (i >= togglesToSync.length) return;
          syncUrimToggleToServer(togglesToSync[i].name, togglesToSync[i].state, function() { doSync(i + 1); });
        })(0);
      });
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var text = (input.value || '').trim();
      if (!text) return;
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
          if (res && res.csrf_token) csrfToken = res.csrf_token;
          var load = msgs.querySelector('.rl-loading');
          if (load) load.remove();
          if (res.error) {
            var errWrap = document.createElement('div');
            errWrap.className = 'native-chat-msg assistant';
            errWrap.innerHTML = '<div class="msg-text">' + escapeHtml(res.error) + (res.redirect ? ' <a href="' + SITE + res.redirect + '" target="_blank">Log in</a>' : '') + '</div>';
            msgs.appendChild(errWrap);
            msgs.scrollTop = msgs.scrollHeight;
            sendBtn.disabled = false;
            return;
          }
          var ev = res.evidence_bubble || '';
          var auth = res.authoritative_bubble || '';
          appendUrimResponse(text, ev, auth);
          urimHistory.push({ query: text, response: { evidence_bubble: ev, authoritative_bubble: auth }, timestamp: new Date().toISOString() });
          saveUrimHistory(false);
          sendBtn.disabled = false;
        })
        .catch(function() {
          var load = msgs.querySelector('.rl-loading');
          if (load) load.remove();
          var errWrap = document.createElement('div');
          errWrap.className = 'native-chat-msg assistant';
          errWrap.innerHTML = '<div class="msg-text">Network error or session required. Please log in on the website to use Urim & Thummim.</div>';
          msgs.appendChild(errWrap);
          msgs.scrollTop = msgs.scrollHeight;
          sendBtn.disabled = false;
        });
    });
  }

  var P48_QUALITIES = ['Purity', 'Truth', 'Praiseworthy', 'Wholesome', 'Excellence', 'Admirable', 'Peace', 'Honorable', 'Lovely'];
  var P48_ICONS = { Purity: 'fa-heart', Truth: 'fa-check-circle', Praiseworthy: 'fa-bullhorn', Wholesome: 'fa-seedling', Excellence: 'fa-star', Admirable: 'fa-thumbs-up', Peace: 'fa-hand-peace', Honorable: 'fa-crown', Lovely: 'fa-spa' };
  var P48_QUESTIONS_BY_QUALITY = window.P48_QUESTIONS_BY_QUALITY || {};
  (function addMoreP48Questions() {
    var extra = {
      Purity: ['What one choice today would make your heart more pure before God?', 'How can you guard your eyes and mind from impurity in the next 24 hours?', 'Where do you need God to create a clean heart in you right now?'],
      Truth: ['What lie have you believed about yourself that God\'s Word says is not true?', 'How can you speak truth in love to someone this week?', 'What Scripture can you memorize to combat a specific lie?'],
      Praiseworthy: ['What can you thank God for in the middle of your current difficulty?', 'How can you make your next conversation more praiseworthy?', 'What song or Psalm reflects your praise to God today?'],
      Wholesome: ['What one unwholesome habit can you replace with something that builds you up?', 'How can you make your next meal or break more wholesome for your soul?', 'What wholesome boundary do you need to set this week?'],
      Excellence: ['What one task can you do with excellence today as an act of worship?', 'Where have you settled for good enough when God is calling you higher?', 'How can you honor God with your best in a small area?'],
      Admirable: ['What admirable trait do you want others to see in you this week?', 'Who can you encourage by pointing out something admirable in them?', 'What would an admirable response look like in your current challenge?'],
      Peace: ['What are you holding onto that is stealing your peace?', 'How can you practice being still before God today?', 'What promise of God can you hold onto when anxiety rises?'],
      Honorable: ['What honorable choice can you make when no one is watching?', 'How can you show honor to someone who has hurt you?', 'What would it look like to honor God with your time today?'],
      Lovely: ['What lovely thing in creation can you pause to thank God for today?', 'How can you add something lovely to someone else\'s day?', 'Where have you been cynical instead of choosing to see what is lovely?']
    };
    P48_QUALITIES.forEach(function(q) {
      if (!P48_QUESTIONS_BY_QUALITY[q]) P48_QUESTIONS_BY_QUALITY[q] = [];
      if (extra[q]) extra[q].forEach(function(text) { P48_QUESTIONS_BY_QUALITY[q].push(text); });
    });
  })();
  function getQuestionsForQuality(q) {
    var list = P48_QUESTIONS_BY_QUALITY[q];
    if (list && list.length) return list;
    return ['What thought or motive can you surrender to God today for greater purity?', 'Where do you need to align more fully with God\'s truth this week?', 'What act of God\'s faithfulness can you praise Him for today?', 'What wholesome input can you choose to feed your mind today?', 'In what one task can you offer God excellence today?', 'What admirable action can you take today that honors God?', 'What anxiety can you surrender to God for His peace?', 'How can you act with honor in a difficult situation?', 'Where have you seen the loveliness of God\'s creation recently?'].slice(P48_QUALITIES.indexOf(q), P48_QUALITIES.indexOf(q) + 1);
  }

  function loadP48xInApp() {
    var container = el.nativeP48x;
    if (!container) return;
    var calendarHtml = '<div class="p48x-calendar-section" id="p48x-calendar-section">' +
      '<h4 class="p48x-calendar-title">Create a Daily Reflection Habit</h4>' +
      '<p class="p48x-calendar-desc">Schedule a full day of recurring reflection prompts in your local time. You will get one for each category, every day.</p>' +
      '<p class="p48x-calendar-note">Same as on the website: reminder links in your calendar or email open the journal on the site, scroll to the reflection area, and show a random prompt for that quality.</p>' +
      '<div class="p48x-calendar-btns">' +
      '<a href="' + SITE + '/prayers/google_auth.php" class="p48x-btn p48x-btn-google" target="_self"><i class="fab fa-google"></i> Connect Google Calendar</a>' +
      '<button type="button" id="p48x-schedule-btn" class="p48x-btn p48x-btn-schedule"><i class="fas fa-calendar-plus"></i> Activate Daily Schedule</button>' +
      '</div>' +
      '<p id="p48x-google-status" class="p48x-google-status"></p>' +
      '</div>';
    container.innerHTML =
      '<div class="native-view-header">P48X Reflections</div>' +
      '<a href="#" class="back-to-iframe native-back-link">← Back to menu</a>' +
      '<p class="p48x-scripture">"…whatever is true, honorable, just, pure, lovely, commendable—think about these things." — Philippians 4:8</p>' +
      '<div class="p48x-card">' +
      '<div class="p48x-wrap">' +
      '<div class="p48x-qualities-grid" id="p48x-qualities"></div>' +
      '<p class="p48x-question-hint">Click a quality above to get a random question; click again to get a different one.</p>' +
      '<div class="p48x-form-row"><label>Reflection question</label><div id="p48x-question-display" class="p48x-question-display" aria-live="polite">Select a quality above to begin your reflection.</div></div>' +
      '<div class="p48x-form-row"><label>Your reflection</label><textarea id="p48x-entry" rows="4" placeholder="Write your reflection…"></textarea></div>' +
      '<button type="button" id="p48x-save" class="p48x-save-btn">Save entry</button>' +
      '</div></div>' +
      calendarHtml +
      '<h3 class="p48x-journal-title">Your Journal History</h3>' +
      '<p class="p48x-scroll-hint">*Scroll down to see your journal entries after saving reflections.</p>' +
      '<div class="p48x-journal-card"><div class="native-p48x-list p48x-entries-list" id="p48x-list"><div class="rl-loading">Loading journal…</div></div></div>';
    var p48xBack = container.querySelector('.back-to-iframe, .native-back-link');
    if (p48xBack) p48xBack.addEventListener('click', backLinkHandler);
    var qualDiv = document.getElementById('p48x-qualities');
    var questionDisplay = document.getElementById('p48x-question-display');
    var entryText = document.getElementById('p48x-entry');
    var saveBtn = document.getElementById('p48x-save');
    var listEl = document.getElementById('p48x-list');
    var scheduleBtn = document.getElementById('p48x-schedule-btn');
    var googleStatus = document.getElementById('p48x-google-status');
    var selectedQuality = 'Purity';
    var currentQuestion = '';

    function setRandomQuestionForQuality(q) {
      var questions = getQuestionsForQuality(q);
      if (questions.length === 0) return;
      var idx = Math.floor(Math.random() * questions.length);
      currentQuestion = questions[idx];
      questionDisplay.textContent = currentQuestion;
    }

    P48_QUALITIES.forEach(function(q) {
      var btn = document.createElement('button');
      btn.className = 'p48x-quality-btn' + (q === 'Purity' ? ' active' : '');
      btn.dataset.quality = q;
      var icon = P48_ICONS[q] || 'fa-circle';
      btn.innerHTML = '<i class="fas ' + icon + '"></i> ' + q;
      btn.addEventListener('click', function() {
        qualDiv.querySelectorAll('.p48x-quality-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        selectedQuality = q;
        setRandomQuestionForQuality(q);
      });
      qualDiv.appendChild(btn);
    });
    setRandomQuestionForQuality('Purity');

    function isEmptyJournalHtml(html) {
      if (!html || typeof html !== 'string') return true;
      var t = html.replace(/\s+/g, ' ').trim();
      return t === '' || t.indexOf('Your journal notes will appear here') !== -1;
    }

    function loadEntries() {
      listEl.innerHTML = '<div class="rl-loading">Loading…</div>';
      fetch(SITE + '/prayers/p48x_ajax.php?action=get_entries_page&page=1', { credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          listEl.innerHTML = '';
          if (res.redirect || (res.success === false && res.message && res.message.indexOf('Authentication') !== -1)) {
            listEl.innerHTML = '<p class="native-auth-msg">Please <a href="' + SITE + '/prayers/login.php" target="_self">log in</a> to save and view P48X reflections.</p>';
            return;
          }
          if (res.success && res.html && !isEmptyJournalHtml(res.html)) {
            listEl.innerHTML = res.html;
          } else if (res.success) {
            listEl.innerHTML = '<p class="p48x-empty-journal">There are no entries yet. Save a reflection above to see it here.</p>';
          } else {
            listEl.innerHTML = '<p class="native-auth-msg">Log in on the website to see your journal.</p>';
          }
        })
        .catch(function() {
          listEl.innerHTML = '<p class="p48x-load-error">Couldn\'t load journal. Check your connection or <a href="' + SITE + '/prayers/login.php" target="_self">log in on the website</a>.</p>';
        });
    }
    loadEntries();

    saveBtn.addEventListener('click', function() {
      var question = currentQuestion;
      var text = (entryText.value || '').trim();
      if (!question || !text) return;
      var formData = new FormData();
      formData.append('action', 'save_entry');
      formData.append('quality', selectedQuality);
      formData.append('question', question);
      formData.append('entry_text', text);
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving…';
      fetch(SITE + '/prayers/p48x_ajax.php', { method: 'POST', body: formData, credentials: 'include' })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save entry';
          if (res.success) { entryText.value = ''; loadEntries(); }
          else {
            listEl.innerHTML = '<p class="rl-error">' + (res.message || 'Save failed. Log in on the website.') + '</p>';
          }
        })
        .catch(function() {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save entry';
          listEl.innerHTML = '<p class="rl-error">Network error. Log in on the website to save.</p>';
        });
    });

    if (scheduleBtn && googleStatus) {
      scheduleBtn.addEventListener('click', function() {
        googleStatus.textContent = 'Scheduling…';
        googleStatus.style.color = 'var(--text-muted)';
        var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        fetch(SITE + '/prayers/schedule_notifications.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'timezone=' + encodeURIComponent(tz),
          credentials: 'include'
        })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            googleStatus.textContent = data.message || (data.success ? 'Schedule activated.' : 'Could not schedule.');
            googleStatus.style.color = data.success ? '#22c55e' : '#e57373';
          })
          .catch(function() {
            googleStatus.textContent = 'Could not activate schedule. Try again or use the website.';
            googleStatus.style.color = '#e57373';
          });
      });
    }
  }

  function loadTranslatorInApp() {
    var container = el.nativeTranslator;
    if (!container) return;
    container.innerHTML = '<div class="native-view-header">Spousal Translator</div><a href="#" class="back-to-iframe native-back-link">← Back to menu</a><div class="native-chat-card"><div class="native-chat-header"><div class="chat-card-title"><i class="fas fa-heart"></i> Spousal Translator</div><p class="native-chat-subtitle">Turn raw feelings into loving, biblical language your spouse can receive.</p></div><div class="native-chat-wrap translator-wrap"><div class="translator-card"><div class="trans-perspective-wrap"><span class="trans-perspective-title">Select your perspective</span><div class="trans-perspective-toggles"><button type="button" class="trans-perspective-btn active" data-spouse="husband"><i class="fas fa-male"></i> Husband to Wife</button><button type="button" class="trans-perspective-btn" data-spouse="wife"><i class="fas fa-female"></i> Wife to Husband</button></div></div><div class="translator-row"><label>I am</label><select id="trans-spouse"><option value="husband">Husband</option><option value="wife">Wife</option></select></div><div class="translator-row"><label>My name (optional)</label><input type="text" id="trans-name" placeholder="Your name"></div><div class="translator-row"><label>What you want to say (raw / emotional)</label><textarea id="trans-query" rows="4" placeholder="Type what you feel…"></textarea></div><button type="button" id="trans-submit" class="translator-submit-btn"><i class="fas fa-heart"></i> Translate with love</button></div><div class="native-chat-messages translator-results" id="trans-result"></div></div></div>';
    var transBack = container.querySelector('.back-to-iframe, .native-back-link');
    if (transBack) transBack.addEventListener('click', backLinkHandler);
    var resultDiv = document.getElementById('trans-result');
    var spouseSel = document.getElementById('trans-spouse');
    container.querySelectorAll('.trans-perspective-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var val = btn.getAttribute('data-spouse');
        if (spouseSel) spouseSel.value = val;
        container.querySelectorAll('.trans-perspective-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });
    if (spouseSel) spouseSel.addEventListener('change', function() {
      var val = spouseSel.value;
      container.querySelectorAll('.trans-perspective-btn').forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-spouse') === val);
      });
    });
    var nameInput = document.getElementById('trans-name');
    var queryEl = document.getElementById('trans-query');
    var submitBtn = document.getElementById('trans-submit');
    var lastOriginal = '';
    var lastTranslation = '';

    function renderResult(query, data) {
      var orig = escapeHtml(query).replace(/\n/g, '<br>');
      var trans = escapeHtml(data.translation).replace(/\n/g, '<br>');
      var html = '<div class="translated-response-card"><div class="translated-title-area"><span class="translated-label">What you said</span></div><div class="translated-original-text">' + orig + '</div><div class="translated-title-area"><span class="translated-label">Biblical Translation</span></div><div class="translated-text">' + trans + '</div><div class="translator-save-row"><button type="button" class="translator-save-btn" id="trans-save-btn">💾 Save this translation</button><span class="translator-save-feedback" id="trans-save-feedback"></span></div></div>';
      if (data.action_steps && data.action_steps.length) html += '<div class="native-chat-msg assistant"><div class="msg-text"><strong>Steps:</strong> ' + escapeHtml(data.action_steps.join('; ')) + '</div></div>';
      return html;
    }

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
          lastOriginal = query;
          lastTranslation = data.translation;
          resultDiv.innerHTML = renderResult(query, data);
          var saveBtn = document.getElementById('trans-save-btn');
          var feedback = document.getElementById('trans-save-feedback');
          if (saveBtn) saveBtn.addEventListener('click', function() {
            saveBtn.disabled = true;
            feedback.textContent = 'Saving…';
            feedback.className = 'translator-save-feedback';
            var body = 'original=' + encodeURIComponent(lastOriginal) + '&translation=' + encodeURIComponent(lastTranslation) + '&spouse_perspective=' + encodeURIComponent(spouseSel.value);
            fetch(SITE + '/translator/save_translation.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: body,
              credentials: 'include'
            }).then(function(sr) { return sr.json(); }).then(function(res) {
              if (res.status === 'success') {
                feedback.textContent = '✓ Saved!';
                feedback.className = 'translator-save-feedback success';
              } else {
                feedback.textContent = res.message || 'Could not save.';
                feedback.className = 'translator-save-feedback error';
                saveBtn.disabled = false;
              }
            }).catch(function() {
              feedback.textContent = 'Network error.';
              feedback.className = 'translator-save-feedback error';
              saveBtn.disabled = false;
            });
          });
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

  function loadSpiritualGiftsInApp() {
    var container = el.nativeSpiritualgifts;
    if (!container) return;
    if (el.spiritualgiftsFrame) el.spiritualgiftsFrame.src = SITE + '/prayers/spiritual_gifts_test.php';
    var header = container.querySelector('.native-view-header');
    if (!header) {
      container.insertAdjacentHTML('afterbegin', '<div class="native-view-header">Spiritual Gifts Test</div><a href="#" class="back-to-iframe native-back-link">← Back to menu</a>');
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
      refreshLoginState();
    });
  });
})();
