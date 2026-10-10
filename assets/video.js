(() => {
  'use strict';
  const frame = document.getElementById('hero-video-frame');
  const cover = document.getElementById('hero-video-cover');
  const play = document.getElementById('hero-video-play');
  const stop = document.getElementById('hero-video-stop');
  const status = document.getElementById('hero-video-status');
  const note = document.getElementById('hero-video-playback-note');
  const videoId = window.TURNIIQ_CONFIG?.video?.youtubeId;
  if (!frame || !cover || !play || !stop || !/^[A-Za-z0-9_-]{11}$/.test(videoId || '')) return;
  let player = null;
  let controller = null;
  let apiScript = null;

  function closeVideo() {
    const oldPlayer = player;
    player = null;
    controller?.destroy();
    controller = null;
    oldPlayer?.remove();
    apiScript?.remove();
    apiScript = null;
    cover.hidden = false;
    stop.hidden = true;
    note.hidden = true;
    status.textContent = 'Video chiuso.';
  }

  function showError(iframe) {
    if (player !== iframe) return;
    closeVideo();
    note.hidden = false;
    note.textContent = 'Il player non è disponibile: usa Play o Apri su YouTube.';
    status.textContent = note.textContent;
  }

  function attachAutoplay(iframe, withSound) {
    if (player !== iframe || !window.TURNIIQ_YOUTUBE_ALLOWED || !window.YT?.Player) return;
    let triedMutedFallback = false;
    controller = new window.YT.Player(iframe, {
      events: {
        onReady(event) {
          if (player !== iframe || !window.TURNIIQ_YOUTUBE_ALLOWED) return;
          if (withSound) event.target.unMute();
          else event.target.mute();
          if (!window.TURNIIQ_MOTION_REDUCED) event.target.playVideo();
        },
        onAutoplayBlocked(event) {
          if (player !== iframe) return;
          note.hidden = false;
          if (withSound && !triedMutedFallback && !window.TURNIIQ_MOTION_REDUCED) {
            triedMutedFallback = true;
            note.textContent = 'Il browser ha bloccato l’audio automatico: attivalo dai controlli del video.';
            event.target.mute();
            event.target.playVideo();
            return;
          }
          note.textContent = 'Il browser ha bloccato l’avvio automatico: premi Play nel video.';
          status.textContent = note.textContent;
        },
        onError() { showError(iframe); }
      }
    });
  }

  function startVideo(automatic, withSound = false) {
    if (player || !window.TURNIIQ_YOUTUBE_ALLOWED) return;
    const iframe = document.createElement('iframe');
    iframe.className = 'youtube-player';
    iframe.title = 'Presentazione di TurniIQ — video YouTube';
    iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    const params = new URLSearchParams({ autoplay: automatic ? '0' : '1', playsinline: '1', rel: '0' });
    if (automatic) {
      params.set('enablejsapi', '1');
      params.set('origin', location.origin);
    }
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
    iframe.addEventListener('load', () => {
      if (player !== iframe) return;
      status.textContent = 'Player YouTube caricato. Usa i controlli del video.';
      if (!automatic) iframe.focus();
    });
    iframe.addEventListener('error', () => showError(iframe));
    player = iframe;
    cover.hidden = true;
    stop.hidden = false;
    note.hidden = !automatic || withSound;
    note.textContent = 'Avvio senza audio: attivalo dai controlli del video.';
    frame.append(iframe);
    status.textContent = 'Caricamento del video YouTube.';
    if (!automatic) return;
    if (window.YT?.Player) attachAutoplay(iframe, withSound);
    else {
      // Only load the official API after an explicit or remembered permission.
      window.onYouTubeIframeAPIReady = () => attachAutoplay(iframe, withSound);
      apiScript = document.createElement('script');
      apiScript.src = 'https://www.youtube.com/iframe_api';
      apiScript.async = true;
      apiScript.addEventListener('error', () => showError(iframe));
      document.head.append(apiScript);
    }
  }

  function tryFirstAutoplay(withSound = false) {
    if (player || window.TURNIIQ_VIDEO_AUTOPLAY_USED || !window.TURNIIQ_YOUTUBE_ALLOWED || window.TURNIIQ_MOTION_REDUCED) return;
    // Confirm that the one-time flag persists; blocked storage falls back to Play.
    if (!window.TURNIIQ_MARK_VIDEO_AUTOPLAY_USED?.()) return;
    startVideo(true, withSound);
  }

  play.addEventListener('click', () => {
    if (player) return;
    window.TURNIIQ_SET_YOUTUBE_ALLOWED?.(true, { startAutomatically: false });
    window.TURNIIQ_MARK_VIDEO_AUTOPLAY_USED?.();
    startVideo(false);
  });
  stop.addEventListener('click', () => {
    closeVideo();
    play.focus();
  });
  document.addEventListener('turniiq:youtube', (event) => {
    if (!event.detail.allowed) closeVideo();
    else if (event.detail.startAutomatically) tryFirstAutoplay(true);
  });
  document.addEventListener('turniiq:motion', (event) => {
    if (event.detail.reduced) controller?.pauseVideo();
  });
  tryFirstAutoplay();
})();
