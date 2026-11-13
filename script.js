(function () {
  // Mobile menu: .menu-btn toggles #menu, a link click or Escape closes it.
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  var label = btn && btn.querySelector('.menu-label');
  var icon = btn && btn.querySelector('i');

  function setOpen(open) {
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close' : 'Menu';
    if (icon) icon.className = open ? 'ph ph-x' : 'ph ph-list';
  }

  if (btn && menu) {
    btn.addEventListener('click', function () {
      setOpen(!menu.classList.contains('open'));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        setOpen(false);
        btn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    });
  }

  // Scroll reveal through IntersectionObserver (no scroll listener).
  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  // If a thumbnail fails to load, keep the frame tidy instead of showing a broken image.
  document.querySelectorAll('.tile-media img').forEach(function (img) {
    img.addEventListener('error', function () { img.style.visibility = 'hidden'; });
  });

  // Helper demo: a small web copy of the Discord helper's matching. Plain word
  // matching (stop words dropped, light stemming, weighted keywords), top 3.
  // Answers are the public guides on help.superbullet.ai.
  var HC = 'https://help.superbullet.ai';
  var ANSWERS = [
    { t: 'Install Superbullet', u: '/docs/getting-started/installation', s: 'Download the app, sign in and create your first project.', k: 'install download setup sign signin login account app start new project open launch windows mac' },
    { t: 'Connect Roblox Studio', u: '/docs/getting-started/connecting-roblox-studio', s: 'Install the plugin and link Studio to Superbullet.', k: 'connect studio roblox plugin link pair sync linking' },
    { t: 'Studio connection issues', u: '/docs/troubleshooting/studio-connection-issues', s: 'Studio not connecting or disconnecting? Work through the fixes in order.', h: 'wont doesnt cant broken error fail stuck disconnect', k:'studio connect connection disconnect broken error fail wont doesnt stuck offline plugin fix problem issue not working' },
    { t: 'Start from a Game Template', u: '/docs/getting-started/installing-a-game-template', s: 'Install a complete, playable game like Combat Game, then customise it.', k: 'template game complete starter combat install playable base start' },
    { t: 'Add your first library', u: '/docs/getting-started/retrieving-your-first-library', s: 'Start simple: add the free fishing system to your game.', k: 'library system add first fishing free retrieve get plug insert' },
    { t: 'Pet System', u: '/docs/libraries/pet-system', s: 'Add pets that follow, hatch and equip.', k: 'pet pets egg hatch follow equip companion system add' },
    { t: 'Adding a paid library', u: '/docs/libraries/adding-a-paid-library', s: 'Buy a premium library and add it to your project.', k: 'paid buy purchase premium library cost price robux pay' },
    { t: 'Fireball Skill', u: '/docs/libraries/fireball-skill', s: 'Add a ready-made fireball ability.', k: 'fireball skill ability attack magic combat spell' },
    { t: 'Sliding Movement System', u: '/docs/libraries/sliding-movement-system', s: 'Add sliding and smooth movement to your character.', k: 'slide sliding movement move run character dash' },
    { t: 'AI Modes', u: '/docs/agent-mode/ai-modes', s: 'Pick the right AI mode for each request.', k: 'ai mode agent modes chat ask which choose plan build' },
    { t: 'Writing better prompts', u: '/docs/best-practices/writing-better-prompts', s: 'The workflow that gets working systems with fewer tokens.', k: 'prompt prompts write better tokens credits results quality ai bad wrong output' }
  ];
  var STOP = ' a an the i my me to it is in on of and or for with how do does can what where why when this that its im keep get got just game games roblox superbullet ';
  function words(s) {
    return s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(function (w) {
      return w && STOP.indexOf(' ' + w + ' ') === -1;
    }).map(function (w) { return w.replace(/(ing|ed|es|s)$/, ''); });
  }
  ANSWERS.forEach(function (a) {
    a.title = words(a.t);
    a.hot = words(a.h || '');
    a.bag = words(a.k + ' ' + a.t + ' ' + (a.h || ''));
  });
  // Weights: a word in a "problem" list 3, in the title 2, anywhere else 1.
  function search(q) {
    var qw = words(q);
    if (!qw.length) return [];
    return ANSWERS.map(function (a) {
      var score = 0;
      qw.forEach(function (w) {
        if (a.hot.indexOf(w) !== -1) score += 3;
        else if (a.title.indexOf(w) !== -1) score += 2;
        else if (a.bag.indexOf(w) !== -1) score += 1;
      });
      return { a: a, score: score };
    }).filter(function (r) { return r.score > 0; }).sort(function (x, y) { return y.score - x.score; }).slice(0, 3);
  }

  var form = document.querySelector('.demo-form');
  var out = document.querySelector('.demo-results');
  var input = document.getElementById('demo-q');
  function show(q) {
    var res = search(q);
    out.innerHTML = '';
    if (!res.length) {
      var li = document.createElement('li');
      li.className = 'r-empty';
      li.textContent = 'No close match. In Discord, this is where it offers a ticket with your summary attached.';
      out.appendChild(li);
      return;
    }
    res.forEach(function (r, i) {
      var li = document.createElement('li');
      var top = document.createElement('div'); top.className = 'r-top';
      var a = document.createElement('a'); a.href = HC + r.a.u; a.rel = 'noopener'; a.textContent = r.a.t;
      var rank = document.createElement('span'); rank.className = 'r-rank'; rank.textContent = i === 0 ? 'best match' : 'fix ' + (i + 1);
      top.appendChild(a); top.appendChild(rank);
      var p = document.createElement('p'); p.textContent = r.a.s;
      li.appendChild(top); li.appendChild(p);
      out.appendChild(li);
    });
  }
  if (form && out && input) {
    form.addEventListener('submit', function (e) { e.preventDefault(); show(input.value); });
    document.querySelectorAll('.chip[data-q]').forEach(function (c) {
      c.addEventListener('click', function () { input.value = c.getAttribute('data-q'); show(input.value); });
    });
  }

  // Copy the Discord username.
  document.querySelectorAll('.handle[data-copy]').forEach(function (b) {
    var state = b.querySelector('.handle-state');
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy');
      function done() {
        b.classList.add('copied'); if (state) state.textContent = 'Copied';
        setTimeout(function () { b.classList.remove('copied'); if (state) state.textContent = 'Copy'; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else { done(); }
    });
  });
})();
