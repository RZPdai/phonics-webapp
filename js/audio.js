/* ============================================================
 * audio.js — 跟读音频层
 * 策略：真人录音 MP3 优先；文件不存在/加载失败时，自动回调 TTS 兜底。
 * 真人 MP3 命名规范见 assets/audio/MANIFEST.txt
 * 调用方：PHA_AUDIO.playModel(key, text, { rate, fallback })
 *   - key:    音频文件名（不含扩展名），如 "Aa_chant"、"v_a_cat"
 *   - text:   无真人录音时用于语音合成的文本
 *   - rate:   真人音频播放倍速（<1 即放慢）
 *   - fallback: 无真人录音时的替代播放函数（通常是慢速 TTS）
 * ============================================================ */
(function () {
  'use strict';
  const BASE = 'assets/audio/';
  const missing = Object.create(null); // 已确认缺失的文件，避免重复探测

  function urlFor(key) { return BASE + key + '.mp3'; }

  function playModel(key, text, opts) {
    opts = opts || {};
    const rate = (typeof opts.rate === 'number') ? opts.rate : 0.85;
    const fallback = opts.fallback;

    if (missing[key]) { if (fallback) fallback(); return false; }

    const a = new Audio(urlFor(key));
    a.preload = 'auto';
    a.playbackRate = rate;

    let settled = false;
    const onFail = function () {
      if (settled) return;
      settled = true;
      missing[key] = true;
      if (fallback) fallback();
    };
    a.addEventListener('error', onFail);
    const p = a.play();
    if (p && typeof p.catch === 'function') p.catch(onFail);
    return true;
  }

  window.PHA_AUDIO = { playModel: playModel, urlFor: urlFor };
})();
