(() => {
  'use strict';
  const config = window.TURNIIQ_CONFIG || {};
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  // Download links have useful HTML fallbacks, including without JavaScript.
  document.querySelectorAll('[data-android-link]').forEach((link) => {
    if (config.androidUrl) link.href = config.androidUrl;
  });
  document.querySelectorAll('[data-ios-link]').forEach((link) => {
    if (config.iosUrl && /^https:\/\/apps\.apple\.com\//.test(config.iosUrl)) {
      link.href = config.iosUrl;
      link.querySelector('[data-ios-caption]').textContent = 'Scarica su';
      link.querySelector('[data-ios-label]').textContent = 'App Store';
    } else {
      link.href = `mailto:${config.supportEmail || 'hello@menoova.it'}?subject=TurniIQ%20per%20iPhone`;
    }
  });
  document.getElementById('year').textContent = String(new Date().getFullYear());

  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  function closeMenu() {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Apri menu');
    nav.classList.remove('is-open');
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
    nav.classList.toggle('is-open', open);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);

  const header = document.querySelector('.site-header');
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 15);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll('.section-heading, .feature, .role-card, .step, .price-card, .contact-card').forEach((item, index) => {
      item.classList.add('reveal');
      item.style.setProperty('--reveal-delay', `${(index % 3) * 65}ms`);
      revealObserver.observe(item);
    });
    const sectionObserver = new IntersectionObserver((entries) => {
      const entry = entries.find((item) => item.isIntersecting);
      if (!entry) return;
      nav.querySelectorAll('a').forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
  }

  const teamInput = document.getElementById('team-size');
  function updateTeamPlan() {
    const size = Math.min(999, Math.max(1, Math.round(Number(teamInput.value) || 1)));
    const plus = size > 10;
    document.getElementById('team-suggestion').textContent = `${plus ? 'Plus' : 'Base'} è adatto a un team di ${size} ${size === 1 ? 'dipendente' : 'dipendenti'}.`;
    document.querySelectorAll('.price-card').forEach((card, index) => card.classList.toggle('is-suggested', index === (plus ? 1 : 0)));
    document.getElementById('team-minus').disabled = size <= 1;
    document.getElementById('team-plus').disabled = size >= 999;
  }
  teamInput.addEventListener('input', updateTeamPlan);
  teamInput.addEventListener('change', () => {
    teamInput.value = String(Math.min(999, Math.max(1, Math.round(Number(teamInput.value) || 1))));
    updateTeamPlan();
  });
  document.getElementById('team-minus').addEventListener('click', () => {
    teamInput.value = String(Math.max(1, Number(teamInput.value) - 1));
    updateTeamPlan();
  });
  document.getElementById('team-plus').addEventListener('click', () => {
    teamInput.value = String(Math.min(999, Number(teamInput.value) + 1));
    updateTeamPlan();
  });
  updateTeamPlan();

  function calendarMarkup(selected = 12) {
    // October 2026 starts on Thursday; dates are deliberately fixed sample data.
    let markup = '<span></span>'.repeat(3);
    for (let day = 1; day <= 31; day += 1) {
      const weekday = (day + 2) % 7;
      const classes = [weekday >= 5 ? 'weekend' : '', [2, 5, 6, 9, 12, 13, 14, 16, 19, 20, 23, 26, 27, 30].includes(day) ? 'has-shift' : '', day === selected ? 'selected' : ''].filter(Boolean).join(' ');
      markup += `<span class="${classes}">${day}</span>`;
    }
    return markup + '<span></span>';
  }
  document.querySelectorAll('[data-calendar]').forEach((calendar) => { calendar.innerHTML = calendarMarkup(); });

  const heading = (title, name = 'calendar') => `<div class="app-heading"><div><p>BAR CENTRALE</p><h3>${title}</h3></div><span class="app-small-icon">${icon(name)}</span></div>`;
  const shift = () => '<div class="shift-row"><span class="person-avatar avatar-mint">G</span><div><b>Giulia Rossi</b><small>08:00 – 14:00</small></div><span class="shift-label">Mattina</span></div>';
  const form = (fields, action) => `<div class="demo-form">${fields.map((field, index) => `<div class="demo-field" data-field="${index}"><span>${field.label}</span><b>${field.value}</b></div>`).join('')}<div class="app-fake-button">${action}</div></div>`;
  const shiftFields = [
    { label: 'Dipendente', value: 'Giulia Rossi' },
    { label: 'Dal – al', value: '12 ottobre 2026' },
    { label: 'Orario preciso', value: '08:00 – 14:00' },
    { label: 'Note', value: 'Apertura e servizio al banco' }
  ];
  const leaveFields = [
    { label: 'Tipo di richiesta', value: 'Ferie' },
    { label: 'Data di inizio', value: '20 ottobre 2026' },
    { label: 'Data di fine', value: '22 ottobre 2026' },
    { label: 'Note', value: 'Tre giorni con la famiglia' }
  ];
  const scenes = [
    {
      key: 'createShift', role: 'Titolare', avatar: 'MT', tab: 0,
      title: 'Il titolare compila il turno', caption: 'Tutto comincia da un turno chiaro.', fields: shiftFields,
      markup: () => heading('Nuovo turno') + form(shiftFields, 'Pubblica turno')
    },
    {
      key: 'publishedShift', role: 'Titolare', avatar: 'MT', tab: 0,
      title: 'Il turno viene pubblicato', caption: 'Il calendario del team si aggiorna.',
      markup: () => heading('I turni del team') + `<div class="mini-calendar"><div class="calendar-title"><b>Ottobre 2026</b><span aria-hidden="true">‹　 ›</span></div><div class="weekdays"><span>L</span><span>M</span><span>M</span><span>G</span><span>V</span><span>S</span><span>D</span></div><div class="calendar-grid">${calendarMarkup()}</div></div><div class="app-day-title"><b>Lunedì 12 ottobre</b><span>Nuovo turno</span></div>${shift()}<div class="demo-success">${icon('check')}<div><b>Turno pubblicato</b><small>Giulia è stata informata.</small></div></div>`
    },
    {
      key: 'employeeShift', role: 'Dipendente', avatar: 'GR', tab: 2,
      title: 'Il dipendente è informato', caption: 'Orario e note arrivano al dipendente.',
      markup: () => `<div class="demo-toast"><img src="assets/app-icon.png" alt=""><div><b>TurniIQ <small>Nuovo turno · adesso</small></b>Il tuo turno del 12 ottobre è stato pubblicato.</div></div>${heading('Messaggi', 'chat')}<div class="demo-person"><span class="person-avatar avatar-mint">MT</span><div><b>Marco · Titolare</b><small>Bar Centrale</small></div></div><div class="demo-message">Nuovo turno assegnato:<br><strong>12 ottobre · 08:00 – 14:00</strong><br>Apertura e servizio al banco.<small>09:41</small></div><div class="app-day-title"><b>Il tuo turno</b></div>${shift()}`
    },
    {
      key: 'requestLeave', role: 'Dipendente', avatar: 'GR', tab: 3,
      title: 'Il dipendente richiede ferie', caption: 'Una richiesta con date e nota, in un posto.', fields: leaveFields,
      markup: () => heading('Richiedi ferie', 'leaf') + form(leaveFields, 'Invia richiesta')
    },
    {
      key: 'approvedLeave', role: 'Titolare', avatar: 'MT', tab: 3,
      title: 'Il titolare risponde', caption: 'La risposta resta visibile a entrambi.',
      markup: () => heading('Richieste ferie', 'leaf') + `<div class="demo-info-card"><div class="demo-person"><span class="person-avatar avatar-mint">G</span><div><b>Giulia Rossi</b><small>Richiesta di ferie</small></div></div><span class="demo-status" id="leave-status">In attesa</span><h4>20 – 22 ottobre 2026</h4><p>Tre giorni di ferie</p><p class="request-note">Tre giorni con la famiglia</p><div class="demo-response" id="leave-actions"><span>Approva</span><span>Rifiuta</span></div></div><div class="demo-success" id="leave-result" hidden>${icon('check')}<div><b>Richiesta approvata</b><small>La risposta è visibile anche a Giulia.</small></div></div>`
    }
  ];

  const screen = document.getElementById('demo-screen');
  const phone = document.querySelector('.demo-phone');
  const chapters = Array.from(document.querySelectorAll('[data-chapter]'));
  const playButton = document.getElementById('demo-play');
  const replayButton = document.getElementById('demo-replay');
  const progressBar = document.getElementById('demo-progress-bar');
  const counter = document.getElementById('demo-counter');
  const announcement = document.getElementById('demo-announcement');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const baseDuration = Math.max(3500, Number(config.demo?.sceneDuration) || 5500);
  let duration = baseDuration;
  const motionReduced = () => reducedMotion.matches || !!window.TURNIIQ_MOTION_REDUCED;
  let current = 0;
  let elapsed = 0;
  let playing = false;
  let completed = false;
  let started = 0;
  let timer = null;
  let screenshotMode = false;

  function updatePlayButton() {
    playButton.innerHTML = `${icon(playing ? 'pause' : 'play')}<span>${playing ? 'Pausa' : completed ? 'Rivedi demo' : elapsed > 0 ? 'Riprendi demo' : 'Avvia demo'}</span>`;
    playButton.setAttribute('aria-label', playing ? 'Metti in pausa la demo' : completed ? 'Rivedi la demo dall’inizio' : 'Avvia o riprendi la demo');
  }

  function updateSceneProgress(progress) {
    const scene = scenes[current];
    const effectiveProgress = motionReduced() ? 1 : progress;
    if (!screenshotMode && scene.fields) {
      scene.fields.forEach((field, index) => {
        const start = .025 + index * .22;
        const fieldProgress = Math.max(0, Math.min(1, (effectiveProgress - start) / .18));
        const element = screen.querySelector(`[data-field="${index}"]`);
        if (!element) return;
        element.querySelector('b').textContent = field.value.slice(0, Math.floor(field.value.length * fieldProgress));
        element.classList.toggle('is-typing', fieldProgress > 0 && fieldProgress < 1);
      });
    }
    if (!screenshotMode && scene.key === 'approvedLeave') {
      const approved = effectiveProgress >= .5;
      const status = screen.querySelector('#leave-status');
      if (status) {
        status.textContent = approved ? 'Approvata' : 'In attesa';
        status.classList.toggle('approved', approved);
        screen.querySelector('#leave-actions').hidden = approved;
        screen.querySelector('#leave-result').hidden = !approved;
        screen.querySelector('#leave-actions span').classList.toggle('is-confirming', effectiveProgress > .32 && !approved);
      }
    }
    progressBar.style.width = `${((current + progress) / scenes.length) * 100}%`;
  }

  function showScene(index, animate = false, notify = true) {
    current = Math.max(0, Math.min(scenes.length - 1, index));
    elapsed = 0;
    completed = false;
    started = performance.now();
    const scene = scenes[current];
    screen.dataset.scene = scene.key === 'publishedShift' ? 'calendar' : scene.key;
    screen.innerHTML = scene.markup();
    screen.setAttribute('aria-label', `Anteprima: ${scene.title}`);
    screenshotMode = false;
    phone.classList.remove('has-screenshot');
    const screenshotPath = config.demo?.screenshots?.[scene.key];
    if (typeof screenshotPath === 'string' && screenshotPath.length && !/^(?:javascript|data):/i.test(screenshotPath)) {
      const shot = document.createElement('img');
      shot.className = 'demo-screenshot';
      shot.alt = `Schermata TurniIQ: ${scene.title}`;
      shot.addEventListener('load', () => {
        if (current !== index || !screen.contains(shot)) return;
        screenshotMode = true;
        phone.classList.add('has-screenshot');
        // Keep only the actual app capture after successful loading.
        screen.replaceChildren(shot);
      });
      shot.addEventListener('error', () => { shot.remove(); });
      shot.src = screenshotPath;
      screen.append(shot);
    }
    document.getElementById('demo-avatar').textContent = scene.avatar;
    document.getElementById('demo-role-label').textContent = `Vista del ${scene.role.toLowerCase()}`;
    document.getElementById('demo-caption').textContent = scene.caption;
    document.querySelectorAll('#demo-app-nav > span').forEach((item, i) => item.classList.toggle('active', scene.tab === i));
    chapters.forEach((chapter, i) => {
      if (i === current) chapter.setAttribute('aria-current', 'step');
      else chapter.removeAttribute('aria-current');
    });
    counter.textContent = `Passaggio ${current + 1} di ${scenes.length} · ${scene.role}`;
    if (notify) announcement.textContent = `Passaggio ${current + 1} di ${scenes.length}. ${scene.title}.`;
    updateSceneProgress(animate ? 0 : 1);
    updatePlayButton();
  }

  function pause() {
    if (!playing) return;
    elapsed = Math.min(duration, performance.now() - started);
    playing = false;
    clearInterval(timer);
    timer = null;
    updatePlayButton();
  }

  function start() {
    if (playing) return;
    playing = true;
    if (completed) showScene(0, true);
    else if (elapsed === 0) updateSceneProgress(0);
    started = performance.now() - elapsed;
    updatePlayButton();
    timer = setInterval(() => {
      elapsed = Math.min(duration, performance.now() - started);
      updateSceneProgress(elapsed / duration);
      if (elapsed >= duration) {
        if (current < scenes.length - 1) showScene(current + 1, true);
        else {
          pause();
          completed = true;
          counter.textContent = 'Demo completata · 5 passaggi';
          announcement.textContent = 'Demo completata. Puoi rivederla o selezionare un passaggio.';
          updatePlayButton();
        }
      }
    }, 100);
  }

  let userInteracted = false;
  playButton.addEventListener('click', () => {
    userInteracted = true;
    playing ? pause() : start();
  });
  replayButton.addEventListener('click', () => {
    userInteracted = true;
    pause();
    showScene(0, true);
    start();
  });
  chapters.forEach((chapter) => chapter.addEventListener('click', () => {
    userInteracted = true;
    showScene(Number(chapter.dataset.chapter), playing);
  }));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });
  document.getElementById('demo-speed').addEventListener('change', (event) => {
    const progress = elapsed / duration;
    const speed = Math.max(1, Math.min(2, Number(event.target.value) || 1));
    duration = baseDuration / speed;
    elapsed = progress * duration;
    started = performance.now() - elapsed;
  });
  const respectMotion = () => {
    if (motionReduced()) pause();
    updateSceneProgress(playing ? elapsed / duration : 1);
  };
  reducedMotion.addEventListener('change', respectMotion);
  document.addEventListener('turniiq:motion', respectMotion);
  showScene(0, false, false);
  // Start once on arrival; leaving the section pauses playback. Manual controls
  // always take priority, including a pause pressed before automatic playback.
  if ('IntersectionObserver' in window && config.demo?.autoplayOnce) {
    let autoStarted = false;
    const demoObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !autoStarted && !userInteracted && !motionReduced() && !document.hidden) {
        autoStarted = true;
        start();
      } else if (!entry.isIntersecting) pause();
    }, { threshold: .3 });
    demoObserver.observe(document.querySelector('.demo-stage'));
  }
})();
