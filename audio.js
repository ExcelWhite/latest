// Audio manager using real audio files (mp3/ogg/wav).
// Note: browsers require a user gesture (click/keypress) before sound can play.
(function () {
  function noop() {}

  function safePlay(el) {
    if (!el) return;
    var p = el.play();
    if (p && typeof p.catch === 'function') p.catch(noop);
  }

  function safePause(el) {
    if (!el) return;
    try { el.pause(); } catch (e) {}
  }

  function makeAudio(src, opts) {
    if (!src) return null;
    var a = new Audio(src);
    a.preload = 'auto';
    a.crossOrigin = 'anonymous';
    if (opts && opts.loop) a.loop = true;
    if (opts && typeof opts.volume === 'number') a.volume = opts.volume;
    return a;
  }

  var cfg = (window.CONFIG && window.CONFIG.AUDIO) ? window.CONFIG.AUDIO : null;

  // Music volumes are intentionally low.
  var menuMusic = makeAudio(cfg && cfg.menuMusic, { loop: true, volume: 0.22 });
  var gameMusic = makeAudio(cfg && cfg.gameMusic, { loop: true, volume: 0.18 });

  // SFX: clone for overlap (rapid jumps).
  var jumpSfx = makeAudio(cfg && cfg.jumpSfx, { loop: false, volume: 0.55 });
  var gameOverSfx = makeAudio(cfg && cfg.gameOverSfx, { loop: false, volume: 0.65 });

  var desiredMode = 'menu'; // 'menu' | 'game' | 'off'
  var unlocked = false;

  function stopAllMusic() {
    safePause(menuMusic);
    safePause(gameMusic);
    if (menuMusic) menuMusic.currentTime = 0;
    if (gameMusic) gameMusic.currentTime = 0;
  }

  function applyMode() {
    if (!unlocked) return;
    if (desiredMode === 'off') {
      stopAllMusic();
      return;
    }

    if (desiredMode === 'menu') {
      safePause(gameMusic);
      if (gameMusic) gameMusic.currentTime = 0;
      safePlay(menuMusic);
      return;
    }

    if (desiredMode === 'game') {
      safePause(menuMusic);
      if (menuMusic) menuMusic.currentTime = 0;
      safePlay(gameMusic);
    }
  }

  function playSfx(base) {
    if (!unlocked || !base) return;
    // Clone to allow overlapping plays without cutting off.
    var a = base.cloneNode(true);
    a.volume = base.volume;
    safePlay(a);
  }

  window.AUDIO = {
    userGesture: function () {
      if (unlocked) return;
      unlocked = true;
      // Attempt to "unlock" audio on iOS/Safari by doing a tiny play/pause.
      // If the file isn't available, errors are swallowed.
      safePlay(menuMusic);
      safePause(menuMusic);
      applyMode();
    },
    setMode: function (mode) {
      desiredMode = mode || 'off';
      applyMode();
    },
    sfxJump: function () {
      playSfx(jumpSfx);
    },
    sfxGameOver: function () {
      playSfx(gameOverSfx);
    }
  };
})();

