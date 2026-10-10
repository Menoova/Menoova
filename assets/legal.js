(() => {
  'use strict';
  const readCookie = (name) => {
    const item = document.cookie.split('; ').find((value) => value.startsWith(`${name}=`));
    return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
  };
  const writeCookie = (name, value) => {
    try {
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=15552000; SameSite=Lax${secure}`;
    } catch { /* Browsing and controls still work when cookie storage is blocked. */ }
  };
  const cookiePageUrl = new URL('../cookie.html', document.currentScript.src).href;
  function resolveCookieLinks(container) {
    container.querySelectorAll('a[href^="cookie.html"]').forEach((link) => {
      const hash = link.getAttribute('href').split('#')[1];
      link.href = cookiePageUrl + (hash ? `#${hash}` : '');
    });
  }
  const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manualReduction = readCookie('turniiq_motion') === 'reduce';
  const youtubeChoice = readCookie('turniiq_youtube');
  let youtubeAllowed = youtubeChoice === 'allow';
  window.TURNIIQ_YOUTUBE_ALLOWED = youtubeAllowed;
  window.TURNIIQ_VIDEO_AUTOPLAY_USED = readCookie('turniiq_video_once') === 'v1';
  window.TURNIIQ_MARK_VIDEO_AUTOPLAY_USED = () => {
    window.TURNIIQ_VIDEO_AUTOPLAY_USED = true;
    writeCookie('turniiq_video_once', 'v1');
    return readCookie('turniiq_video_once') === 'v1';
  };
  window.TURNIIQ_SET_YOUTUBE_ALLOWED = (allowed, { startAutomatically = true } = {}) => {
    youtubeAllowed = allowed === true;
    window.TURNIIQ_YOUTUBE_ALLOWED = youtubeAllowed;
    writeCookie('turniiq_youtube', youtubeAllowed ? 'allow' : 'deny');
    const checkbox = document.getElementById('cookie-youtube');
    if (checkbox) checkbox.checked = youtubeAllowed;
    document.dispatchEvent(new CustomEvent('turniiq:youtube', { detail: { allowed: youtubeAllowed, startAutomatically } }));
  };
  function applyMotionPreference() {
    const reduced = manualReduction || systemMotion.matches;
    document.documentElement.classList.toggle('reduce-motion', reduced);
    window.TURNIIQ_MOTION_REDUCED = reduced;
    document.querySelectorAll('[data-motion-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(reduced));
      button.textContent = reduced ? 'Animazioni ridotte' : 'Riduci animazioni';
    });
    const checkbox = document.getElementById('cookie-motion');
    if (checkbox) {
      checkbox.checked = reduced;
      checkbox.disabled = systemMotion.matches;
    }
    document.dispatchEvent(new CustomEvent('turniiq:motion', { detail: { reduced } }));
  }

  const notice = document.createElement('aside');
  notice.className = 'cookie-notice';
  notice.setAttribute('aria-label', 'Informazioni su cookie e privacy');
  notice.hidden = true;
  const hasVideo = Boolean(document.getElementById('hero-video-frame'));
  notice.innerHTML = '<div><b>Cookie, con chiarezza.</b><p>Il sito usa cookie tecnici. Se consenti YouTube, Google riceve dati di connessione e il video si avvia una sola volta. Dopo il clic proviamo ad avviarlo con audio; puoi regolarlo dai controlli. Ricordiamo la scelta per 180 giorni; puoi cambiarla da Preferenze. Nessun Google Analytics o pixel pubblicitario aggiunto dal sito.</p></div><div class="cookie-notice-actions"><a href="cookie.html">Informativa cookie</a>' + (hasVideo ? '<button type="button" class="button button-small" id="cookie-video-allow">Consenti video</button><button type="button" class="footer-link" id="cookie-notice-close">Non ora</button>' : '<button type="button" class="button button-small" id="cookie-notice-close">Ho capito</button>') + '</div>';
  resolveCookieLinks(notice);
  document.body.append(notice);
  const dismissNotice = () => {
    writeCookie('turniiq_notice', 'v1');
    notice.hidden = true;
  };
  document.getElementById('cookie-notice-close').addEventListener('click', () => {
    if (hasVideo) window.TURNIIQ_SET_YOUTUBE_ALLOWED(false);
    dismissNotice();
  });
  document.getElementById('cookie-video-allow')?.addEventListener('click', () => {
    window.TURNIIQ_SET_YOUTUBE_ALLOWED(true);
    dismissNotice();
  });
  if (readCookie('turniiq_notice') !== 'v1' || (hasVideo && !youtubeChoice)) notice.hidden = false;

  const panel = document.createElement('dialog');
  panel.id = 'cookie-panel';
  panel.className = 'cookie-panel';
  panel.setAttribute('aria-labelledby', 'cookie-panel-title');
  panel.innerHTML = '<div class="cookie-panel-top"><p class="section-eyebrow">La tua navigazione</p><button type="button" class="dialog-close" id="cookie-panel-close" aria-label="Chiudi preferenze">×</button></div><h2 id="cookie-panel-title">Cookie e preferenze</h2><p>Il sito non aggiunge Google Analytics o pixel pubblicitari. YouTube resta bloccato senza la tua autorizzazione. Dopo il consenso, il primo avvio è automatico. Se il browser blocca l’audio, puoi attivarlo dai controlli del video.</p><div class="cookie-category"><div><b>Cookie tecnici</b><p>Memorizzano la chiusura dell’avviso e la preferenza sulle animazioni. Non misurano le visite.</p></div><span class="category-status">Funzioni essenziali</span></div><label class="motion-preference video-consent-preference"><input type="checkbox" id="cookie-youtube"><span><b>Consenti il video YouTube</b><small>Il player può trasmettere dati tecnici a Google e usare propri strumenti. Dopo il consenso, il video si avvia automaticamente una sola volta per browser; proviamo con audio se segue il tuo clic, altrimenti parte silenzioso. Poi puoi usare Play. Ricordiamo la scelta per 180 giorni. Disattivandola, il player aperto viene rimosso. <a href="cookie.html#youtube">Informazioni su YouTube</a>.</small></span></label><label class="motion-preference"><input type="checkbox" id="cookie-motion"><span><b>Riduci le animazioni</b><small>Disattiva movimento decorativo e avvio automatico della demo e del video. La preferenza del dispositivo ha sempre priorità.</small></span></label><div class="cookie-panel-actions"><a href="cookie.html">Leggi l’informativa</a><button type="button" class="button" id="cookie-save">Salva preferenze</button></div>';
  resolveCookieLinks(panel);
  document.body.append(panel);
  let returnFocus = null;
  document.querySelectorAll('[data-cookie-settings]').forEach((button) => {
    button.addEventListener('click', () => {
      returnFocus = button;
      applyMotionPreference();
      document.getElementById('cookie-youtube').checked = youtubeAllowed;
      if (typeof panel.showModal === 'function') panel.showModal();
      else panel.setAttribute('open', '');
    });
  });
  function closePanel() {
    if (typeof panel.close === 'function') panel.close();
    else panel.removeAttribute('open');
    returnFocus?.focus();
  }
  document.getElementById('cookie-panel-close').addEventListener('click', closePanel);
  document.getElementById('cookie-save').addEventListener('click', () => {
    manualReduction = document.getElementById('cookie-motion').checked;
    writeCookie('turniiq_motion', manualReduction ? 'reduce' : 'standard');
    applyMotionPreference();
    window.TURNIIQ_SET_YOUTUBE_ALLOWED(document.getElementById('cookie-youtube').checked);
    dismissNotice();
    closePanel();
  });
  panel.addEventListener('close', () => returnFocus?.focus());
  document.querySelectorAll('[data-motion-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      manualReduction = !window.TURNIIQ_MOTION_REDUCED;
      writeCookie('turniiq_motion', manualReduction ? 'reduce' : 'standard');
      applyMotionPreference();
    });
  });
  systemMotion.addEventListener('change', applyMotionPreference);
  applyMotionPreference();
})();
