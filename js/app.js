/* ============================================================
 * app.js — OPW 1-5 英语启蒙学习工作台 逻辑层
 * 七大模块：入学测评 / 五级课程 / 课时排课 / 课堂SOP /
 *           分层任务 / 资源库 / 学情报告
 * 纯前端 + localStorage，手机随时打开即可续上进度
 * ============================================================ */
(function () {
  'use strict';

  const SKEY = 'phonics_app_state_v3';

  /* ---------------- 五级数据索引 ---------------- */
  var BOOKS = [
    { data: PHA_DATA.book1, level: 1, title: 'The Alphabet',  cn: '字母启蒙' },
    { data: PHA_DATA.book2, level: 2, title: 'Short Vowels',   cn: '短元音拼读' },
    { data: PHA_DATA.book3, level: 3, title: 'Long Vowels',    cn: '长元音拼读' },
    { data: PHA_DATA.book4, level: 4, title: 'Consonant Blends', cn: '辅音组合' },
    { data: PHA_DATA.book5, level: 5, title: 'R-Controlled & More', cn: 'R控制与进阶' }
  ];
  function bookOf(level) { return BOOKS[level - 1]; }
  function unitsInLevel(level) { return bookOf(level).data.length; }
  function totalUnits() { return BOOKS.reduce(function (s, b) { return s + b.data.length; }, 0); }

  /* ---------------- 状态 ---------------- */
  function defaultState() {
    return {
      version: 4,
      points: 0,
      streak: 0,
      lastCheckIn: '',
      lastDate: '',
      level: 1,            // 当前级别 1-5
      unitIdx: 0,          // 当前级别内的单元索引
      learned: [],         // 已学单元的全局标识 "L-U"
      placementDone: false,
      placementScore: 0,
      placementLevel: 1,
      tasks: { read: 0, spell: 0, chant: 0, game: 0 },
      tasksDone: { read: false, spell: false, chant: false, game: false },
      owned: [],
      badges: { first: false, reader: false, streak7: false, level1Done: false, level2Done: false },
      chantLines: [],
      readSlow: true,
      flippedToday: [],
      // 学情记录
      levelReports: {},    // {1: {read:0.8, spell:0.7, blend:0.6, read2:0.5, weak:'b/d混淆'}, ...}
      lessonProgress: 0    // 全局已上课时
    };
  }

  let state = load();
  const recBlobs = Object.create(null);
  let activeRec = null;
  var resLevel = null;
  var chantState = { playing: false, lines: [], idx: 0 };

  function load() {
    try {
      const raw = localStorage.getItem(SKEY);
      if (!raw) return defaultState();
      var s = Object.assign(defaultState(), JSON.parse(raw));
      // 迁移旧版本：旧逻辑会把 level 自动升到 >1（导致"学字母A却显示L4单词"），
      // 新结构 L1 为唯一主线 → 强制回到 L1，定位到第一个未学字母。
      // 保留 learned/badges/points 等真实进度，但重置当前单元任务计数，避免误判已完成。
      if (!s.version || s.version < 4) {
        s.level = 1;
        s.unitIdx = firstUnlearnedInLevelOf(s.learned || [], 1);
        s.version = 4;
        s.tasks = { read: 0, spell: 0, chant: 0, game: 0 };
        s.tasksDone = { read: false, spell: false, chant: false, game: false };
        s.chantLines = [];
        s.flippedToday = [];
      }
      return s;
    } catch (e) { return defaultState(); }
  }
  function save() {
    try { localStorage.setItem(SKEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ---------------- 数据备份 / 恢复 ---------------- */
  function exportData() {
    var data = JSON.stringify(state, null, 2);
    var html =
      '<div class="sheet-head"><h3>备份学习数据</h3><button class="sheet-close">×</button></div>' +
      '<div class="parent-tip"><span class="ic">💡</span><span>点击下方「复制」或「下载文件」，把内容保存到备忘录/微信。换新链接或换手机时，在「恢复」里粘贴即可找回进度。</span></div>' +
      '<textarea class="bk-text" id="bkOut" readonly>' + esc(data) + '</textarea>' +
      '<div class="entry-row">' +
        '<div class="entry" id="bkCopy" style="justify-content:center">📋 复制内容</div>' +
        '<div class="entry shop" id="bkDl" style="justify-content:center">⬇️ 下载文件</div>' +
      '</div>';
    openSheet(html);
    var copyBtn = $('bkCopy');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var ta = $('bkOut'); ta.removeAttribute('readonly'); ta.select(); ta.setSelectionRange(0, ta.value.length);
      var okCopy = false;
      try { okCopy = document.execCommand('copy'); } catch (e) {}
      if (okCopy) toast('已复制，去新链接粘贴恢复'); else toast('请长按文本框手动复制');
    });
    var dlBtn = $('bkDl');
    if (dlBtn) dlBtn.addEventListener('click', function () {
      try {
        var blob = new Blob([data], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = 'phonics-backup-' + todayStr() + '.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      } catch (e) { toast('下载不可用，请用复制'); }
    });
  }

  function importData() {
    var html =
      '<div class="sheet-head"><h3>恢复学习数据</h3><button class="sheet-close">×</button></div>' +
      '<div class="parent-tip"><span class="ic">💡</span><span>选择之前下载的备份文件，或把复制的内容粘贴到下方，点「恢复数据」。</span></div>' +
      '<input type="file" id="bkFile" accept=".json,application/json" class="bk-file">' +
      '<textarea class="bk-text" id="bkIn" placeholder="在此粘贴备份内容…"></textarea>' +
      '<div class="entry" id="bkImport" style="justify-content:center;margin-top:12px">✅ 恢复数据</div>';
    openSheet(html);
    var fileInput = $('bkFile');
    if (fileInput) fileInput.addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () { $('bkIn').value = r.result; };
      r.readAsText(f);
    });
    var imp = $('bkImport');
    if (imp) imp.addEventListener('click', function () {
      var txt = ($('bkIn').value || '').trim();
      if (!txt) { toast('请先选择文件或粘贴内容'); return; }
      try {
        var obj = JSON.parse(txt);
        if (!obj || typeof obj !== 'object' || !('level' in obj) && !('points' in obj) && !('learned' in obj)) throw new Error('bad');
        state = Object.assign(defaultState(), obj);
        // 导入的备份可能来自旧版本（level 已自动升到 >1），强制回到 L1 主线，避免显示错乱；
        // 保留 learned/badges/points，但重置当前单元任务，避免旧 tasksDone 误判当前字母已完成。
        state.level = 1;
        state.unitIdx = firstUnlearnedInLevelOf(state.learned || [], 1);
        state.version = 4;
        state.tasks = { read: 0, spell: 0, chant: 0, game: 0 };
        state.tasksDone = { read: false, spell: false, chant: false, game: false };
        state.chantLines = [];
        state.flippedToday = [];
        save(); renderAll(); closeSheet();
        toast('数据已恢复 ✅ 已回到 Level 1 字母学习主线');
      } catch (err) { toast('恢复失败：内容格式不正确'); }
    });
  }

  /* ---------------- 工具 ---------------- */
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* 统一单元模型：任何级别通用 */
  function curUnit() {
    var bk = bookOf(state.level);
    var arr = bk.data;
    var idx = Math.min(state.unitIdx, arr.length - 1);
    var U = arr[idx];
    return normalizeUnit(U, state.level, idx);
  }
  function unitAt(level, idx) {
    var arr = bookOf(level).data;
    if (idx < 0 || idx >= arr.length) return null;
    return normalizeUnit(arr[idx], level, idx);
  }
  function normalizeUnit(U, level, idx) {
    var isLetter = !!U.letter;
    var name = isLetter ? U.letter : U.family;
    return {
      kind: isLetter ? 'letter' : 'pattern',
      name: name,
      letter: U.letter || '',
      family: U.family || '',
      sound: U.sound,
      tip: U.tip || (isLetter ? '' : '注意口型，慢速跟读'),
      words: U.words,
      unitNo: idx + 1,
      level: level,
      book: level,
      globalId: level + '-' + idx
    };
  }
  function unitAudioKey(U) {
    if (U.kind === 'letter') return U.letter;
    return 'L' + U.level + '_' + U.family.replace(/[^a-z0-9]/gi, '');
  }
  function introText(U) {
    if (U.kind === 'letter') return U.letter + ' says ' + U.sound + '. ' + U.words[0].en;
    return U.family + ' says ' + U.sound + '. ' + U.words[0].en + ', ' + U.words[1].en;
  }

  /* 根据课程数据生成本级别歌谣歌词 */
  function generateLevelChant(level) {
    var bk = bookOf(level);
    var lvInfo = PHA_DATA.curriculum.levels[level - 1];
    var lines = [];
    lines.push('Let us chant! Level ' + level + ', ' + lvInfo.title + '!');
    bk.data.forEach(function (U) {
      if (U.letter) {
        var word = U.words[0].en;
        lines.push(U.letter + ' is for ' + word + ', ' + U.sound + ' ' + U.sound + ', ' + word + '!');
      } else {
        var ws = U.words.map(function (x) { return x.en; }).join(', ');
        lines.push(U.family + ' says ' + U.sound + '! ' + ws + '!');
      }
    });
    lines.push('Great job! Well done!');
    return { level: level, title: lvInfo.cnTitle + ' Chant', lines: lines };
  }

  /* OPW 风格简短对话生成 — 师生问答模式 */
  var DIALOGUE_GOAL = 6;
  function dialogueFor(U) {
    var w = U.words;
    var name = U.kind === 'letter' ? U.letter : U.family;
    var wordList = w.map(function (x) { return x.en; }).join(', ');

    if (U.kind === 'letter') {
      return {
        unit: 'Level ' + U.level + ' · Unit ' + U.unitNo,
        title: name + ' says ' + U.sound,
        lines: [
          { sp: 'T', text: 'What letter is this?' },
          { sp: 'S', text: "It's " + U.letter + '.' },
          { sp: 'T', text: 'What sound does ' + U.letter + ' make?' },
          { sp: 'S', text: U.letter + ' says ' + U.sound + '.' },
          { sp: 'T', text: 'Read these words: ' + wordList + '!' },
          { sp: 'S', text: wordList + '! Great!' }
        ]
      };
    } else {
      return {
        unit: 'Level ' + U.level + ' · Unit ' + U.unitNo,
        title: name + ' says ' + U.sound,
        lines: [
          { sp: 'T', text: 'What sound does ' + name + ' make?' },
          { sp: 'S', text: name + ' says ' + U.sound + '.' },
          { sp: 'T', text: 'Can you read these words?' },
          { sp: 'S', text: wordList + '!' },
          { sp: 'T', text: 'Read them one more time!' },
          { sp: 'S', text: wordList + '! Well done!' }
        ]
      };
    }
  }

  function toast(msg) {
    var t = $('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._tm); t._tm = setTimeout(function () { t.classList.remove('show'); }, 1600);
  }

  /* ---------------- 语音 ---------------- */
  var _voices = [];
  function _loadVoices() { try { _voices = window.speechSynthesis.getVoices() || []; } catch (e) { _voices = []; } }
  if ('speechSynthesis' in window) { _loadVoices(); window.speechSynthesis.onvoiceschanged = _loadVoices; }
  function _pickVoice() {
    var en = _voices.filter(function (v) { return /^en/i.test(v.lang); });
    if (!en.length) return null;
    return en.find(function (v) {
      return /Female|Google US English|Samantha|Victoria|Zira|Karen|Moira/i.test(v.name);
    }) || en[0];
  }
  function speak(text, rate) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = rate || 0.6; u.pitch = 1.05;
    var v = _pickVoice(); if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }
  function ttsRate() { return state.readSlow ? 0.5 : 0.82; }
  function audioRate() { return state.readSlow ? 0.8 : 1.0; }
  function playModel(key, text) {
    if (window.PHA_AUDIO) {
      return window.PHA_AUDIO.playModel(key, text, {
        rate: audioRate(),
        fallback: function () { speak(text, ttsRate()); }
      });
    }
    speak(text, ttsRate());
    return false;
  }
  function playBlob(url) { var a = new Audio(url); a.playbackRate = 1; a.play().catch(function () {}); }

  /* 歌谣播放器：逐句 TTS 朗读 + 歌词高亮跟随 */
  function stopChant() {
    chantState.playing = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    var actives = document.querySelectorAll('.chant-line.active');
    for (var i = 0; i < actives.length; i++) actives[i].classList.remove('active');
  }
  function playChant(lines) {
    stopChant();
    chantState.lines = lines;
    chantState.playing = true;
    chantState.idx = 0;
    _playChantNext();
  }
  function _playChantNext() {
    if (!chantState.playing) return;
    if (chantState.idx >= chantState.lines.length) { chantState.playing = false; return; }
    var idx = chantState.idx;
    var text = chantState.lines[idx];
    var actives = document.querySelectorAll('.chant-line.active');
    for (var i = 0; i < actives.length; i++) actives[i].classList.remove('active');
    var lineEl = document.querySelector('.chant-line[data-idx="' + idx + '"]');
    if (lineEl) {
      lineEl.classList.add('active');
      var container = document.getElementById('chantLyrics');
      if (container) container.scrollTop = lineEl.offsetTop - container.offsetTop - 60;
    }
    if (!('speechSynthesis' in window)) { chantState.idx++; setTimeout(_playChantNext, 600); return; }
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = state.readSlow ? 0.55 : 0.75; u.pitch = 1.1;
    var v = _pickVoice(); if (v) u.voice = v;
    u.onend = function () { chantState.idx++; if (chantState.playing) setTimeout(_playChantNext, 300); };
    u.onerror = function () { chantState.idx++; if (chantState.playing) setTimeout(_playChantNext, 300); };
    window.speechSynthesis.speak(u);
  }

  /* 麦克风录音 */
  function startRec(btn, onDone) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { toast('此设备不支持录音'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      var chunks = [];
      var mr = new MediaRecorder(stream);
      mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = function () {
        stream.getTracks().forEach(function (t) { t.stop(); });
        var blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
        onDone(URL.createObjectURL(blob));
      };
      mr.start();
      activeRec = { mr: mr, btn: btn, onDone: onDone };
      btn.classList.add('active');
      btn.textContent = '⏹';
      toast('录音中…说完再点一次 ⏹');
    }).catch(function () { toast('请允许使用麦克风'); });
  }
  function stopRec() {
    if (!activeRec) return;
    var rec = activeRec; activeRec = null;
    try { rec.mr.stop(); } catch (e) {}
    if (rec.btn) rec.btn.classList.remove('active');
  }

  /* ---------------- 每日推进 ---------------- */
  // 任务为按单元制（非按日制）：完成 4 项任务后由 markUnitLearned 自动进入下一单元
  // rollover 仅处理日期更新，不再重置任务或推进单元
  function rollover() {
    var today = todayStr();
    if (state.lastDate === today) return;
    state.lastDate = today;
    save();
  }

  /* ---------------- 打卡 ---------------- */
  function checkIn() {
    var today = todayStr();
    if (state.lastCheckIn === today) return;
    var y = new Date(); y.setDate(y.getDate() - 1);
    var yStr = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
    state.streak = (state.lastCheckIn === yStr) ? state.streak + 1 : 1;
    state.lastCheckIn = today;
    addPoints(5, '打卡 +5');
    if (state.streak >= 5) addPoints(50, '连续打卡5天 额外 +50');
    if (state.streak >= 7) state.badges.streak7 = true;
    save();
  }

  /* ---------------- 积分 ---------------- */
  function addPoints(n, why) {
    state.points += (Number(n) || 0); save();
    if (why) toast((n > 0 ? '+' : '') + n + ' ⭐ ' + why);
  }

  /* ---------------- 任务完成 ---------------- */
  // 完成度登记：四项任务全部完成时立即把当前单元记为"已学"并自动进入下一单元（当日即时生效）
  function markUnitLearned() {
    var allDone = state.tasksDone.read && state.tasksDone.spell && state.tasksDone.chant && state.tasksDone.game;
    if (!allDone) return;
    var gid = state.level + '-' + state.unitIdx;
    var wasNew = state.learned.indexOf(gid) < 0;
    if (wasNew) {
      state.learned.push(gid);
      state.lessonProgress += 1;   // 每完成一个单元消耗 1 课时，与课程总进度同步
    }
    // 自动进入下一单元（同一级别内，当日即可继续学习）
    var maxIdx = unitsInLevel(state.level) - 1;
    if (state.unitIdx < maxIdx) {
      state.unitIdx += 1;
      // 重置任务，为新单元开始
      state.tasks = { read: 0, spell: 0, chant: 0, game: 0 };
      state.tasksDone = { read: false, spell: false, chant: false, game: false };
      state.chantLines = [];
      state.flippedToday = [];
      var nextU = curUnit();
      var nextName = nextU.kind === 'letter' ? nextU.letter : nextU.family;
      setTimeout(function () { toast('🎉 太棒了！自动进入下一个：' + nextName); }, 800);
    } else {
      // 当前级别全部单元完成
      state.badges['level' + state.level + 'Done'] = true;
      if (state.level === 1) {
        // L1 完成 — 不强制进入 L2（L2-L5 为自选进阶）
        setTimeout(function () { toast('🎉🎉 恭喜完成 Level 1 全部 26 个字母！可在"自选进阶"中探索 L2-L5'); }, 800);
      } else {
        setTimeout(function () { toast('🎉 恭喜完成 Level ' + state.level + ' 全部单元！'); }, 800);
      }
    }
    save();
  }

  // 统计某 Level 已完成的单元数（基于 learned 列表，即时生效）
  function learnedInLevel(lv) {
    var p = lv + '-';
    return state.learned.filter(function (g) { return g.indexOf(p) === 0; }).length;
  }

  // 找到某 Level 第一个未学单元的索引（纯函数，迁移/导入时可在 state 赋值前调用）
  function firstUnlearnedInLevelOf(learned, lv) {
    var n = unitsInLevel(lv);
    for (var i = 0; i < n; i++) {
      if (learned.indexOf(lv + '-' + i) < 0) return i;
    }
    return 0;
  }
  function firstUnlearnedInLevel(lv) {
    return firstUnlearnedInLevelOf(state.learned, lv);
  }

  function bumpTask(key, amount, goal, doneBonus, doneMsg) {
    if (state.tasksDone[key]) return;
    state.tasks[key] = Math.min(goal, state.tasks[key] + amount);
    if (state.tasks[key] >= goal) {
      state.tasksDone[key] = true;
      if (!state.badges.first) state.badges.first = true;
      if (key === 'chant') state.badges.reader = true;
      if (key === 'game') state.badges.gamer = true;
      if (doneBonus) addPoints(doneBonus, doneMsg);
      markUnitLearned();
      save(); renderAll();
    } else { save(); }
  }

  /* ---------------- 路由 ---------------- */
  function go(screen) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    $('screen-' + screen).classList.add('active');
    document.querySelectorAll('#tabbar .tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.screen === screen);
    });
    var map = { dashboard: renderDashboard, vocab: renderVocab, read: renderRead, games: renderGames, achieve: renderAchieve };
    map[screen]();
    $('screens').scrollTop = 0;
  }

  /* ---------------- 覆盖层 ---------------- */
  function openSheet(html) {
    stopChant();
    var ov = $('overlay');
    ov.innerHTML = '<div class="sheet">' + html + '</div>';
    ov.classList.remove('hidden');
    ov.querySelector('.sheet-close').addEventListener('click', closeSheet);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeSheet(); });
  }
  function closeSheet() { stopChant(); $('overlay').classList.add('hidden'); $('overlay').innerHTML = ''; }

  /* ---------------- 渲染：顶栏 ---------------- */
  function header(title, sub) {
    return '<div class="header">' +
      '<div class="avatar">🐤</div>' +
      '<div class="greet-wrap"><div class="greet">' + title + '</div><div class="sub">' + sub + '</div></div>' +
      '<div class="points-pill"><span class="star">⭐</span>' + state.points + '</div>' +
      '</div>';
  }

  /* ---------------- 渲染：任务看板 ---------------- */
  function renderDashboard() {
    var U = curUnit();
    var bk = bookOf(state.level);
    var levelInfo = PHA_DATA.curriculum.levels[state.level - 1];
    var done = Object.values(state.tasksDone).filter(Boolean).length;
    var total = 4;
    var pct = Math.round(done / total * 100);

    // 课程总进度 = 已学单元数 / 全部单元数（真实完成度，当日即时反映）
    var globalPct = Math.round(state.learned.length / totalUnits() * 100);

    var tasks = [
      { key: 'read',  ic: '📖', bg: 'var(--blue-soft)', name: '单词认读 15 分钟', src: '词汇练习 · 已认读 ' + state.tasks.read + ' / 15 分钟', st: state.tasksDone.read },
      { key: 'spell', ic: '✏️', bg: '#FFF3D1', name: '单词听写练习 10 个', src: '词汇练习 · 已听写 ' + state.tasks.spell + ' / 10 个', st: state.tasksDone.spell },
      { key: 'chant', ic: '🎤', bg: '#FFE9E4', name: '短文朗读跟读', src: '跟读对话 · 已读 ' + state.tasks.chant + ' / 6 句', st: state.tasksDone.chant },
      { key: 'game', ic: '🎮', bg: '#E6F6EC', name: '游戏闯关练习', src: '互动游戏 · 已通关 ' + state.tasks.game + ' / 3 关', st: state.tasksDone.game }
    ];
    var itemHtml = tasks.map(function (t) {
      var pill = t.st ? '<span class="status-pill st-done">已完成</span>'
        : (state.tasks[t.key] > 0 ? '<span class="status-pill st-doing">进行中</span>' : '<span class="status-pill st-todo">去完成</span>');
      return '<div class="task-item"><div class="task-ic" style="background:' + t.bg + '">' + t.ic + '</div>' +
        '<div class="task-mid"><div class="task-name">' + t.name + '</div><div class="task-src">' + t.src + '</div></div>' + pill + '</div>';
    }).join('');

    // 快捷入口（7 大模块）
    var quickEntries =
      '<div class="quick-grid">' +
        '<div class="quick-item" data-action="open-placement"><span class="qi-ic">📝</span><span class="qi-tx">入学测评</span></div>' +
        '<div class="quick-item" data-action="open-curriculum"><span class="qi-ic">📚</span><span class="qi-tx">课程大纲</span></div>' +
        '<div class="quick-item" data-action="open-lessons"><span class="qi-ic">📅</span><span class="qi-tx">课时规划</span></div>' +
        '<div class="quick-item" data-action="open-sop"><span class="qi-ic">⏱️</span><span class="qi-tx">课堂SOP</span></div>' +
        '<div class="quick-item" data-action="open-resources"><span class="qi-ic">🎵</span><span class="qi-tx">资源库</span></div>' +
        '<div class="quick-item" data-action="open-report"><span class="qi-ic">📊</span><span class="qi-tx">学情报告</span></div>' +
      '</div>';

    $('screen-dashboard').innerHTML =
      header('早上好，小朋友', bk.cn + ' · Unit ' + U.unitNo + (U.kind === 'letter' ? ' · 字母 ' + U.letter : '')) +
      '<div class="card">' +
        '<div class="overview-head"><span class="t">今日任务完成度</span><span class="n">' + done + ' / ' + total + '</span></div>' +
        '<div class="progress"><span style="width:' + pct + '%"></span></div>' +
        '<div class="overview-head" style="margin-top:14px"><span class="t">课程总进度</span><span class="n">' + globalPct + '%</span></div>' +
        '<div class="progress"><span style="width:' + globalPct + '%;background:var(--green)"></span></div>' +
        '<div class="note">' + bk.cn + ' · 已学 ' + learnedInLevel(state.level) + ' / ' + unitsInLevel(state.level) + ' 单元 · 已上课时 ' + state.lessonProgress + ' / ' + PHA_DATA.curriculum.totalLessons() + '</div>' +
        '<div class="checkin-tip"><span>🔥</span><span>已连续打卡 ' + state.streak + ' 天，再坚持 ' + Math.max(0, 5 - state.streak) + ' 天额外得 50 积分</span></div>' +
      '</div>' +
      quickEntries +
      '<div class="section-title"><h2>今日任务</h2><span class="meta">共 ' + total + ' 项</span></div>' +
      itemHtml +
      '<div class="parent-tip"><span class="ic">💡</span><span>完成全部 4 项任务后自动进入下一单元；L2-L5 可在词汇页"自选进阶"中探索</span></div>';
  }

  /* ---------------- 渲染：词汇练习 ---------------- */
  function renderVocab() {
    var U = curUnit();
    var bk = bookOf(state.level);
    var bigText = U.kind === 'letter' ? U.letter : U.family;
    var soundLine = '发音：' + U.sound + '　' + U.tip;
    var subText = bk.cn + ' · Unit ' + U.unitNo + ' / ' + unitsInLevel(state.level) + ' · ' + U.words.length + ' 个新词';
    var cards = U.words.map(function (w) {
      return '<div class="flash-card" data-action="flip" data-en="' + esc(w.en) + '" data-cn="' + esc(w.cn) + '" data-ipa="' + esc(w.ipa) + '">' +
        '<div class="en">' + w.en + '</div><div class="ipa">' + w.ipa + '</div>' +
        '<div class="hint">点击翻面看中文</div></div>';
    }).join('');

    // 字母进度条（L1 显示 A-Z，其他级别显示单元进度）
    var progBar = '';
    if (state.level === 1) {
      var letters = bk.data;
      var cells = letters.map(function (lt, i) {
        var gid = '1-' + i;
        var done = state.learned.indexOf(gid) >= 0;
        var cur = i === state.unitIdx;
        var cls = cur ? 'cur' : (done ? 'done' : '');
        return '<span class="lt-cell ' + cls + '">' + lt.letter.charAt(0) + '</span>';
      }).join('');
      progBar = '<div class="letter-prog"><div class="lp-strip">' + cells + '</div></div>';
    } else {
      var totalU = unitsInLevel(state.level);
      var doneU = learnedInLevel(state.level);
      var pctU = Math.round(doneU / totalU * 100);
      progBar = '<div class="letter-prog"><div class="lp-info">Level ' + state.level + ' 进度：' + doneU + ' / ' + totalU + ' 单元 (' + pctU + '%)</div>' +
        '<div class="progress"><span style="width:' + pctU + '%;background:var(--green)"></span></div></div>';
    }

    $('screen-vocab').innerHTML =
      header('今天也要加油！', subText) +
      progBar +
      '<div class="card letter-card">' +
        '<div class="letter-big">' + esc(bigText) + '</div>' +
        '<div class="letter-sound">' + soundLine + '</div>' +
        '<button class="btn-speak" data-action="speak-letter">🔊 听 ' + esc(bigText) + ' 的发音 ' + U.sound + '</button>' +
      '</div>' +
      '<div class="section-title"><h2>今日新词</h2><span class="meta">Unit ' + U.unitNo + ' · ' + U.words.length + ' 词</span></div>' +
      '<div class="flash-grid">' + cards + '</div>' +
      '<div class="parent-tip" style="margin-top:14px"><span class="ic">💡</span><span>点击卡片可翻面查看中文；完成认读与听写，任务看板会自动更新</span></div>' +
      '<div class="entry-row" style="margin-top:14px">' +
        '<div class="entry" data-action="open-dictation" style="justify-content:center">✏️ 听写练习（' + state.tasks.spell + '/10）</div>' +
        '<div class="entry shop" data-action="view-learned" style="justify-content:center">📚 已学（' + state.learned.length + '）</div>' +
      '</div>' +
      '<div class="entry-row" style="margin-top:10px">' +
        '<div class="entry" data-action="open-resources" style="justify-content:center">🎵 本课配套资源</div>' +
      '</div>' +
      (state.level > 1 ?
        '<div class="entry-row" style="margin-top:10px">' +
          '<div class="entry" data-action="back-to-main" style="justify-content:center">🏠 回到字母主线 L1</div>' +
        '</div>' : '') +
      '<div class="entry-row" style="margin-top:10px">' +
        '<div class="entry shop" data-action="open-self-select" style="justify-content:center">🔮 自选进阶 L2-L5（选学）</div>' +
      '</div>';
  }

  /* ---------------- 渲染：跟读对话 ---------------- */
  function renderRead() {
    var U = curUnit();
    var d = dialogueFor(U);
    var key = unitAudioKey(U);
    var w = U.words;

    var wordRows = w.map(function (wd) {
      var wk = key + '_' + wd.en;
      var rec = recBlobs[wk]
        ? '<button class="mini play" data-action="play-mine" data-key="' + wk + '">▶ 听我的</button>'
        : '';
      return '<div class="read-row">' +
        '<div class="rr-en">' + esc(wd.en) + ' <span class="rr-ipa">' + wd.ipa + '</span></div>' +
        '<div class="rr-btns">' +
          '<button class="mini listen" data-action="listen-word" data-key="' + wk + '" data-text="' + esc(wd.en) + '">🔊</button>' +
          '<button class="mini rec" data-action="rec-word" data-key="' + wk + '">🎙</button>' + rec +
        '</div></div>';
    }).join('');

    /* 对话行：带说话人图标 */
    var lineRows = d.lines.map(function (ln, i) {
      var lk = key + '_line' + i;
      var done = state.chantLines.indexOf(i) >= 0;
      var spIcon = ln.sp === 'T' ? '👩‍🏫' : '🐤';
      var spClass = ln.sp === 'T' ? 'teacher' : 'student';
      var rec = recBlobs[lk]
        ? '<button class="mini play" data-action="play-mine" data-key="' + lk + '">▶</button>' +
          '<button class="mini cmp" data-action="compare" data-key="' + lk + '" data-text="' + esc(ln.text) + '">🔁</button>'
        : '';
      return '<div class="read-row dlg-line ' + spClass + (done ? ' done' : '') + '">' +
        '<div class="dlg-sp">' + spIcon + '</div>' +
        '<div class="rr-en">' + esc(ln.text) + '</div>' +
        '<div class="rr-btns">' +
          '<button class="mini listen" data-action="listen-line" data-key="' + lk + '" data-text="' + esc(ln.text) + '">🔊</button>' +
          '<button class="mini rec" data-action="rec-line" data-key="' + lk + '" data-idx="' + i + '">🎙</button>' +
          (done ? '<span class="ok">✓</span>' : '') + rec +
        '</div></div>';
    }).join('');

    var pct = Math.round(state.chantLines.length / DIALOGUE_GOAL * 100);
    $('screen-read').innerHTML =
      header('大声跟读吧！', d.unit + ' · ' + d.title) +
      '<div class="card read-card">' +
        '<div class="read-intro">' +
          '<span class="rr-en">' + esc(U.kind === 'letter' ? (U.letter + ' says ' + U.sound) : (U.family + ' ' + U.sound)) + '</span>' +
          '<button class="mini listen" data-action="listen-intro" data-key="' + key + '_intro">🔊 听发音</button>' +
        '</div>' +
        '<div class="speed-toggle">语速：' +
          '<button class="spd on" data-action="toggle-spd">' + (state.readSlow ? '🐢 慢速（推荐）' : '▶ 正常语速') + '</button>' +
        '</div>' +
        '<div class="section-title" style="margin-top:6px"><h2>对话跟读</h2><span class="meta">👩‍🏫老师 🐤小朋友 · 逐句听并跟读</span></div>' +
        '<div class="read-text dlg-text">' + lineRows + '</div>' +
        '<div class="ctrl"><button class="btn-play" data-action="play-all">▶ 听完整对话</button></div>' +
      '</div>' +
      '<div class="section-title"><h2>单词跟读</h2><span class="meta">点🔊听，点🎙录自己</span></div>' +
      '<div class="card">' + wordRows + '</div>' +
      '<div class="card soft">' +
        '<div class="overview-head"><span class="t">跟读进度</span><span class="n">' + state.chantLines.length + ' / ' + DIALOGUE_GOAL + ' 句</span></div>' +
        '<div class="progress"><span style="width:' + pct + '%"></span></div>' +
      '</div>' +
      '<div class="entry-row" style="margin-top:14px">' +
        '<div class="entry" data-action="open-resources" style="justify-content:center">🎵 本课配套资源</div>' +
      '</div>' +
      '<div class="parent-tip"><span class="ic">💡</span><span>优先播放真人录音；未录制处自动用慢速语音合成。点🎙录下孩子声音，可「▶」回放、「🔁」对比原声。</span></div>';
  }

  /* ---------------- 渲染：互动游戏 ---------------- */
  function renderGames() {
    $('screen-games').innerHTML =
      header('玩中学，赚积分！', '通关越多，积分越多') +
      '<div class="game-card"><div class="game-ic c1">🪿</div><div class="game-mid"><div class="game-name">抓大鹅</div><div class="game-desc">看中文，找对应英文单词，抓到就得分</div></div><button class="btn-go y" data-action="open-catch">开始</button></div>' +
      '<div class="game-card"><div class="game-ic c2">🔗</div><div class="game-mid"><div class="game-name">单词对对碰</div><div class="game-desc">把中文和英文单词连成一对，配对成功得分</div></div><button class="btn-go b" data-action="open-match">开始</button></div>' +
      '<div class="game-card"><div class="game-ic c3">🧩</div><div class="game-mid"><div class="game-name">拼读小拼图</div><div class="game-desc">把打乱的字母拼回正确的单词</div></div><button class="btn-go g" data-action="open-puzzle">开始</button></div>' +
      '<div class="parent-tip" style="margin-top:4px"><span class="ic">💡</span><span>每通关 1 个游戏 +10 积分，通关 3 个即完成今日游戏任务</span></div>';
  }

  /* ---------------- 渲染：积分成就 ---------------- */
  function renderAchieve() {
    var days = ['一', '二', '三', '四', '五', '六', '日'];
    var today = todayStr();
    var y = new Date();
    var cells = '';
    for (var i = 0; i < 7; i++) {
      var d = new Date(y); d.setDate(y.getDate() - (6 - i));
      var ds = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
      var diff = Math.round((y.getTime() - d.getTime()) / 86400000);
      var cls = 'future', inner = '<div class="dn">' + days[d.getDay()] + '</div>';
      if (ds === today) { cls = 'today'; inner += '<div class="ds">今</div>'; }
      else if (diff >= 1 && diff <= Math.max(0, state.streak - 1)) { cls = 'done'; inner += '<div class="ds">✓</div>'; }
      else if (diff > 0) { inner += '<div class="ds">·</div>'; }
      cells += '<div class="day ' + cls + '">' + inner + '</div>';
    }
    function bd(on, ic, tx) { return '<div class="badge ' + (on ? 'on' : 'off') + '"><div class="bic">' + ic + '</div><div class="bt">' + tx + '</div></div>'; }

    // 级别完成徽章
    var levelBadges = '';
    for (var lv = 1; lv <= 5; lv++) {
      levelBadges += bd(state.badges['level' + lv + 'Done'], '🏅', 'L' + lv + '通关');
    }

    $('screen-achieve').innerHTML =
      header('你真棒！', '积分和成就都在这里') +
      '<div class="card big-points">' +
        '<div class="big-star">⭐</div><div class="score">' + state.points + '</div>' +
        '<div class="cap">累计获得积分，可在小屋里换家具</div>' +
      '</div>' +
      '<div class="entry-row" style="margin-bottom:16px">' +
        '<div class="entry" data-action="open-home">🏠 我的小屋</div>' +
        '<div class="entry shop" data-action="open-shop">🛒 兑换商店</div>' +
      '</div>' +
      '<div class="card"><div class="section-title"><h2>连续打卡</h2><span class="meta">' + state.streak + ' 天</span></div>' +
        '<div class="calendar">' + cells + '</div>' +
        '<div class="cal-note"><span>⭐</span><span>连续打卡 5 天额外得 50 积分</span></div>' +
      '</div>' +
      '<div class="card"><div class="section-title"><h2>成就徽章</h2></div>' +
        '<div class="badges">' +
          bd(state.badges.first, '🥇', '首胜') +
          bd(state.badges.reader, '🎤', '朗读小达人') +
          bd(state.badges.streak7, '🔥', '连续 7 天') +
        '</div>' +
        '<div class="section-title" style="margin-top:14px"><h2>级别通关</h2></div>' +
        '<div class="badges">' + levelBadges + '</div>' +
      '</div>' +
      '<div class="card"><div class="section-title"><h2>学习报告</h2><span class="meta">Level ' + state.level + '</span></div>' +
        '<div class="report-summary" data-action="open-report">📊 查看详细学情报告</div>' +
      '</div>' +
      '<div class="card"><div class="section-title"><h2>数据备份与恢复</h2></div>' +
        '<div class="entry-row">' +
          '<div class="entry" data-action="backup-data">📤 备份（导出）</div>' +
          '<div class="entry shop" data-action="restore-data">📥 恢复（导入）</div>' +
        '</div>' +
        '<div class="parent-tip"><span class="ic">💡</span><span>换新链接或换手机前先备份，可避免学习记录丢失。</span></div>' +
      '</div>';
  }

  function renderAll() {
    renderDashboard(); renderVocab(); renderRead(); renderGames(); renderAchieve();
  }

  /* 跟读完成 */
  function bumpChant() {
    state.tasks.chant = state.chantLines.length;
    if (state.chantLines.length >= DIALOGUE_GOAL && !state.tasksDone.chant) {
      state.tasksDone.chant = true;
      if (!state.badges.first) state.badges.first = true;
      state.badges.reader = true;
      addPoints(20, '跟读完成 +20');
      markUnitLearned();
    } else { save(); }
  }

  /* ========================================================
   * 入学测评模块
   * ======================================================== */
  function openPlacement() {
    if (state.placementDone) {
      openSheet('<div class="sheet-head"><h3>入学测评</h3><button class="sheet-close">×</button></div>' +
        '<div class="result-card">' +
          '<div class="result-score">' + state.placementScore + ' / 25</div>' +
          '<div class="result-level">' + PHA_DATA.placementTest.placement(state.placementScore).msg + '</div>' +
        '</div>' +
        '<div class="catch-score">已完成测评，可重新测试</div>' +
        '<div class="entry" data-action="retake-placement" style="justify-content:center;margin-top:14px">📝 重新测试</div>');
      return;
    }
    startPlacement();
  }

  function startPlacement() {
    var items = PHA_DATA.placementTest.items;
    var idx = 0, score = 0;
    function step() {
      if (idx >= items.length) {
        var result = PHA_DATA.placementTest.placement(score);
        state.placementDone = true;
        state.placementScore = score;
        state.placementLevel = result.level;
        state.level = result.level;
        state.unitIdx = 0;
        save();
        openSheet('<div class="sheet-head"><h3>测评结果</h3><button class="sheet-close">×</button></div>' +
          '<div class="result-card">' +
            '<div class="result-score">' + score + ' / 25</div>' +
            '<div class="result-level">' + result.msg + '</div>' +
          '</div>' +
          '<div class="catch-score">已自动设置起始级别，开始学习吧！</div>');
        renderAll();
        return;
      }
      var it = items[idx];
      // 播放音频（如果需要）
      if (it.speak) { setTimeout(function () { speak(it.speak, 0.7); }, 300); }
      var optsHtml = it.options.map(function (o, oi) {
        return '<div class="catch-opt" data-oi="' + oi + '">' + o + '</div>';
      }).join('');
      var showHtml = it.show ? '<div class="test-show">' + it.show + '</div>' : '';
      var speakBtn = it.speak ? '<button class="btn-speak" data-action="speak-test" data-text="' + esc(it.speak) + '">🔊 再听一次</button>' : '';
      openSheet('<div class="sheet-head"><h3>入学测评 ' + (idx + 1) + '/' + items.length + '</h3><button class="sheet-close">×</button></div>' +
        '<div class="test-part">' + it.part + '</div>' +
        '<div class="test-q">' + it.q + '</div>' +
        showHtml +
        '<div style="text-align:center;margin-bottom:14px">' + speakBtn + '</div>' +
        '<div class="catch-options">' + optsHtml + '</div>' +
        '<div class="catch-score">已答对 ' + score + ' 题</div>');

      $('overlay').querySelectorAll('.catch-opt').forEach(function (op) {
        op.addEventListener('click', function () {
          var oi = parseInt(op.dataset.oi, 10);
          if (oi === it.answer) { op.classList.add('right'); score++; }
          else { op.classList.add('wrong'); }
          setTimeout(function () { idx++; step(); }, 600);
        });
      });
    }
    step();
  }

  /* ========================================================
   * 课程大纲模块
   * ======================================================== */
  function openCurriculum() {
    var html = '<div class="sheet-head"><h3>五级课程大纲</h3><button class="sheet-close">×</button></div>';
    html += '<div class="curriculum-total">全套 ' + PHA_DATA.curriculum.totalLessons() + ' 课时 · 5 级 · ' + totalUnits() + ' 单元</div>';
    PHA_DATA.curriculum.levels.forEach(function (lv) {
      var isCurrent = lv.level === state.level;
      var isDone = state.badges['level' + lv.level + 'Done'];
      var status;
      if (lv.level === 1) {
        status = isDone ? '✅ 已通关' : (isCurrent ? '📍 当前主线' : '✅ 已通关');
      } else {
        status = isDone ? '✅ 已通关' : (isCurrent ? '📍 正在学习' : '🔮 自选进阶');
      }
      html += '<div class="curr-card' + (isCurrent ? ' current' : '') + '">' +
        '<div class="curr-head"><span class="curr-lv">Level ' + lv.level + '</span><span class="curr-title">' + lv.title + '</span><span class="curr-status">' + status + '</span></div>' +
        '<div class="curr-cn">' + lv.cnTitle + ' · ' + lv.lessons + ' 课时</div>' +
        '<div class="curr-row"><span class="cr-label">教学目标</span><span class="cr-val">' + lv.objectives + '</span></div>' +
        '<div class="curr-row"><span class="cr-label">知识点</span><span class="cr-val">' + lv.knowledgePoints + '</span></div>' +
        '<div class="curr-row"><span class="cr-label">结业标准</span><span class="cr-val">' + lv.completion + '</span></div>' +
        '<div class="curr-row"><span class="cr-label">常见易错</span><span class="cr-val">' + lv.mistakes + '</span></div>' +
        '<div class="curr-row"><span class="cr-label">配套素材</span><span class="cr-val">' + lv.materials + '</span></div>' +
        '</div>';
    });
    html += '</div>';
    openSheet(html);
  }

  /* ========================================================
   * 课时规划模块
   * ======================================================== */
  function openLessons() {
    var html = '<div class="sheet-head"><h3>系统化课时排课</h3><button class="sheet-close">×</button></div>';
    html += '<div class="lesson-summary">' +
      '<div class="ls-item"><span class="ls-n">' + PHA_DATA.curriculum.totalLessons() + '</span><span class="ls-l">总课时</span></div>' +
      '<div class="ls-item"><span class="ls-n">' + state.lessonProgress + '</span><span class="ls-l">已完成</span></div>' +
      '<div class="ls-item"><span class="ls-n">' + (PHA_DATA.curriculum.totalLessons() - state.lessonProgress) + '</span><span class="ls-l">剩余</span></div>' +
    '</div>';
    html += '<div class="lesson-suggest">建议每周 2-3 次，每次 40 分钟</div>';
    PHA_DATA.curriculum.levels.forEach(function (lv) {
      var bk = bookOf(lv.level);
      var unitsDone = learnedInLevel(lv.level);
      var pct = Math.round(unitsDone / unitsInLevel(lv.level) * 100);
      html += '<div class="lesson-lv">' +
        '<div class="ll-head"><span class="ll-name">Level ' + lv.level + ' · ' + lv.cnTitle + '</span><span class="ll-count">' + lv.lessons + ' 课时</span></div>' +
        '<div class="progress" style="margin-top:8px"><span style="width:' + pct + '%"></span></div>' +
        '<div class="ll-detail">' + unitsDone + ' / ' + unitsInLevel(lv.level) + ' 单元 · ' + unitsInLevel(lv.level) + ' 个知识点</div>' +
      '</div>';
    });
    html += '<div class="parent-tip" style="margin-top:14px"><span class="ic">💡</span><span>每完成一个单元的全部任务即消耗 1 课时并自动进入下一单元；L2-L5 为自选进阶，可在词汇页进入</span></div>';
    openSheet(html);
  }

  /* ========================================================
   * 课堂 SOP 模块
   * ======================================================== */
  function openSOP() {
    var html = '<div class="sheet-head"><h3>40 分钟标准课堂流程</h3><button class="sheet-close">×</button></div>';
    html += '<div class="sop-total">单课时 40 分钟 · 5 个环节 · 每节课通用</div>';
    PHA_DATA.classSOP.forEach(function (s) {
      var pct = Math.round(s.duration / 40 * 100);
      html += '<div class="sop-card">' +
        '<div class="sop-head"><span class="sop-phase">环节 ' + s.phase + '</span><span class="sop-name">' + s.name + '</span><span class="sop-time">' + s.duration + ' min</span></div>' +
        '<div class="sop-bar"><span style="width:' + pct + '%"></span></div>' +
        '<div class="sop-desc">' + s.desc + '</div>' +
      '</div>';
    });
    html += '<div class="parent-tip" style="margin-top:14px"><span class="ic">💡</span><span>每节课严格按此流程执行，保证教学标准化与学习效果</span></div>';
    openSheet(html);
  }

  /* ========================================================
   * 资源库模块
   * ======================================================== */
  function openResources() {
    if (resLevel === null) resLevel = state.level;
    var r = PHA_DATA.resources;
    var lvInfo = PHA_DATA.curriculum.levels[resLevel - 1];
    var U = curUnit();
    var chant = generateLevelChant(resLevel);
    var html = '<div class="sheet-head"><h3>配套资源库</h3><button class="sheet-close">×</button></div>';

    /* 当前学习状态 */
    html += '<div class="res-current">' +
      '<div class="res-current-title">📍 当前级别：Level ' + state.level + ' · ' + PHA_DATA.curriculum.levels[state.level - 1].cnTitle + '</div>' +
      '<div class="res-current-unit">正在学习：' + (U.kind === 'letter' ? U.letter : U.family) + ' says ' + U.sound + '</div>' +
      '<div class="res-current-mat">📄 ' + PHA_DATA.curriculum.levels[state.level - 1].materials + '</div>' +
    '</div>';

    /* 级别切换器 */
    var lvTabs = '';
    for (var lv = 1; lv <= 5; lv++) {
      var active = lv === resLevel ? ' on' : '';
      lvTabs += '<button class="lv-tab' + active + '" data-action="switch-res-level" data-level="' + lv + '">L' + lv + '</button>';
    }
    html += '<div class="lv-bar">' + lvTabs + '<span class="lv-name">' + lvInfo.cnTitle + '</span></div>';

    /* 歌谣播放器 — 真实教学内容歌词 + 逐句高亮播放 */
    var chantLines = chant.lines.map(function (l, i) {
      return '<div class="chant-line" data-idx="' + i + '">' + esc(l) + '</div>';
    }).join('');
    html += '<div class="res-section">' +
      '<div class="res-title">🎵 Level ' + resLevel + ' 歌谣 · ' + lvInfo.cnTitle + '</div>' +
      '<div class="chant-player">' +
        '<div class="chant-lyrics" id="chantLyrics">' + chantLines + '</div>' +
        '<div class="chant-controls">' +
          '<button class="btn-play" data-action="play-chant">▶ 播放歌谣</button>' +
          '<button class="btn-stop" data-action="stop-chant">⏹ 停止</button>' +
        '</div>' +
        '<div class="speed-toggle">' +
          '语速：<button class="spd on" data-action="toggle-spd">' + (state.readSlow ? '🐢 慢速（推荐）' : '▶ 正常语速') + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    /* 本级别拓展歌谣视频 — 真实 YouTube 链接 */
    var levelSongs = r.songs.filter(function (s) { return s.level === resLevel; });
    if (levelSongs.length > 0) {
      html += '<div class="res-section"><div class="res-title">📺 本级别拓展歌谣视频</div>';
      levelSongs.forEach(function (s) {
        html += '<div class="song-card" data-action="open-external" data-url="' + esc(s.url) + '">' +
          '<div class="song-ic">🎵</div>' +
          '<div class="song-info">' +
            '<div class="song-title">' + esc(s.title) + '</div>' +
            '<div class="song-source">' + esc(s.source) + ' · ' + esc(s.cn) + '</div>' +
            '<div class="song-desc">' + esc(s.desc) + '</div>' +
          '</div>' +
          '<div class="song-go">▶</div>' +
        '</div>';
      });
      html += '</div>';
    }

    /* 全部歌谣资源 — 紧凑列表 */
    html += '<div class="res-section"><div class="res-title">📚 全部歌谣资源</div>';
    r.songs.forEach(function (s) {
      var isCur = s.level === resLevel;
      html += '<div class="song-item' + (isCur ? ' current' : '') + '" data-action="open-external" data-url="' + esc(s.url) + '">' +
        '<span class="song-lv-tag">L' + s.level + '</span>' +
        '<span class="song-name">' + esc(s.title) + '</span>' +
        '<span class="song-src">' + esc(s.source) + '</span>' +
        '<span class="song-go">→</span>' +
      '</div>';
    });
    html += '</div>';

    /* 配套阅读 */
    html += '<div class="res-section"><div class="res-title">📖 配套阅读</div>';
    r.readers.forEach(function (s) {
      var m = s.match(/Book (\d)/);
      var isCur = m && parseInt(m[1], 10) === state.level;
      html += '<div class="res-item' + (isCur ? ' current' : '') + '"><span class="res-name">' + s +
        (isCur ? ' <span class="res-tag">当前</span>' : '') + '</span></div>';
    });
    html += '</div>';

    /* 闪卡 */
    html += '<div class="res-section"><div class="res-title">🎴 闪卡资源</div>';
    html += '<div class="res-item clickable" data-action="view-learned"><span class="res-name">' + r.flashcards + '</span><span class="res-go">去翻卡 →</span></div>';
    html += '</div>';

    html += '<div class="parent-tip" style="margin-top:14px"><span class="ic">💡</span><span>点▶播放本级别歌谣，逐句高亮跟读；拓展视频跳转 YouTube 观看</span></div>';
    openSheet(html);
  }

  /* ========================================================
   * 自选进阶模块（L2-L5 选学）
   * ======================================================== */
  function openSelfSelect() {
    var html = '<div class="sheet-head"><h3>🔮 自选进阶学习</h3><button class="sheet-close">×</button></div>';
    html += '<div class="ss-intro">L1 字母启蒙为零基础必修，L2-L5 为自选进阶内容。点击进入后可自由学习，不影响 L1 主线进度。</div>';
    if (state.level === 1) {
      var l1Done = learnedInLevel(1);
      var l1Total = unitsInLevel(1);
      html += '<div class="ss-current"><span class="ss-cur-tag">当前主线</span> Level 1 · 字母启蒙 · ' + l1Done + ' / ' + l1Total + ' 字母</div>';
    }
    for (var lv = 2; lv <= 5; lv++) {
      var bk = bookOf(lv);
      var lvInfo = PHA_DATA.curriculum.levels[lv - 1];
      var done = learnedInLevel(lv);
      var total = unitsInLevel(lv);
      var pct = Math.round(done / total * 100);
      var isCurrent = lv === state.level;
      html += '<div class="ss-card' + (isCurrent ? ' current' : '') + '" data-action="enter-self-level" data-level="' + lv + '">' +
        '<div class="ss-head"><span class="ss-lv">Level ' + lv + '</span><span class="ss-title">' + lvInfo.cnTitle + '</span>' +
          (isCurrent ? '<span class="ss-tag">正在学习</span>' : '') + '</div>' +
        '<div class="ss-desc">' + lvInfo.objectives + '</div>' +
        '<div class="progress" style="margin-top:8px"><span style="width:' + pct + '%;background:var(--green)"></span></div>' +
        '<div class="ss-stats">' + done + ' / ' + total + ' 单元 · ' + pct + '%</div>' +
      '</div>';
    }
    html += '<div class="parent-tip" style="margin-top:14px"><span class="ic">💡</span><span>进入自选级别后会从第一个未学单元开始；完成全部 4 项任务仍会自动进入下一单元</span></div>';
    openSheet(html);
  }

  /* ========================================================
   * 学情报告模块
   * ======================================================== */
  function openReport() {
    var html = '<div class="sheet-head"><h3>学情诊断报告</h3><button class="sheet-close">×</button></div>';
    // 当前级别信息
    var lvInfo = PHA_DATA.curriculum.levels[state.level - 1];
    var bk = bookOf(state.level);
    var unitsDone = learnedInLevel(state.level);
    var totalU = unitsInLevel(state.level);
    var lvPct = Math.round(unitsDone / totalU * 100);

    html += '<div class="report-header">' +
      '<div class="rh-lv">Level ' + state.level + ' · ' + bk.cn + '</div>' +
      '<div class="rh-progress"><div class="progress"><span style="width:' + lvPct + '%"></span></div></div>' +
      '<div class="rh-pct">' + unitsDone + ' / ' + totalU + ' 单元 (' + lvPct + '%)</div>' +
    '</div>';

    // 能力雷达（简化版：用条形图表示 4 项能力）
    var abilities = [
      { name: '认读能力', val: Math.min(100, state.learned.length * 3 + 20), color: 'var(--blue)' },
      { name: '拼读能力', val: Math.min(100, state.tasks.spell * 8 + state.tasks.game * 5 + 15), color: 'var(--green)' },
      { name: '拼写能力', val: Math.min(100, state.tasks.spell * 10 + 10), color: 'var(--yellow)' },
      { name: '朗读能力', val: Math.min(100, state.chantLines.length * 22 + state.tasks.read * 2 + 10), color: 'var(--red)' }
    ];
    html += '<div class="report-abilities">';
    abilities.forEach(function (a) {
      html += '<div class="ab-row"><span class="ab-name">' + a.name + '</span>' +
        '<div class="ab-bar"><span style="width:' + a.val + '%;background:' + a.color + '"></span></div>' +
        '<span class="ab-val">' + a.val + '%</span></div>';
    });
    html += '</div>';

    // 级别目标达成情况
    html += '<div class="report-section"><div class="rs-title">本级结业标准</div>';
    html += '<div class="rs-content">' + lvInfo.completion + '</div></div>';

    // 常见易错点提醒
    html += '<div class="report-section"><div class="rs-title">⚠️ 常见易错点</div>';
    html += '<div class="rs-content">' + lvInfo.mistakes + '</div></div>';

    // 全级别进度概览
    html += '<div class="report-section"><div class="rs-title">全级别进度</div>';
    for (var lv = 1; lv <= 5; lv++) {
      var done2 = learnedInLevel(lv), total2 = unitsInLevel(lv);
      var pct2 = Math.round(done2 / total2 * 100);
      var st = lv < state.level ? '✅' : (lv === state.level ? '📍' : '🔒');
      html += '<div class="rp-lv"><span class="rp-st">' + st + '</span><span class="rp-name">Level ' + lv + '</span>' +
        '<div class="ab-bar" style="flex:1;margin:0 10px"><span style="width:' + pct2 + '%"></span></div>' +
        '<span class="rp-pct">' + done2 + '/' + total2 + '</span></div>';
    }
    html += '</div>';

    // 学习统计
    html += '<div class="report-section"><div class="rs-title">学习统计</div>';
    html += '<div class="rs-stats">' +
      '<div class="rs-stat"><span class="rss-n">' + state.learned.length + '</span><span class="rss-l">已学单元</span></div>' +
      '<div class="rs-stat"><span class="rss-n">' + state.lessonProgress + '</span><span class="rss-l">已完成课时</span></div>' +
      '<div class="rs-stat"><span class="rss-n">' + state.streak + '</span><span class="rss-l">连续打卡</span></div>' +
      '<div class="rs-stat"><span class="rss-n">' + state.points + '</span><span class="rss-l">累计积分</span></div>' +
    '</div></div>';

    openSheet(html);
  }

  /* ---------------- 行动分发 ---------------- */
  function handleAction(action, node) {
    switch (action) {
      case 'speak-letter':
        { var U = curUnit(); if (U.kind === 'letter') speak(U.letter + '. ' + U.words[0].en, 0.5); else speak(U.family + '. ' + U.words[0].en + '. ' + U.words[1].en, 0.5); break; }
      case 'speak-test': speak(node.dataset.text, 0.7); break;
      case 'flip':
        {
          var en = node.dataset.en, cn = node.dataset.cn;
          if (node.querySelector('.pop')) {
            node.innerHTML = '<div class="en">' + en + '</div><div class="ipa">' + node.dataset.ipa + '</div><div class="hint">点击翻面看中文</div>';
          } else {
            node.innerHTML = '<div class="pop">' + cn + '</div>';
            speak(en, 0.6);
            if (state.flippedToday.indexOf(en) < 0) state.flippedToday.push(en);
            bumpTask('read', 4, 15, 20, '认读完成 +20');
          }
          break;
        }
      case 'listen-intro': { var U2 = curUnit(); playModel(node.dataset.key, introText(U2)); break; }
      case 'listen-word': playModel(node.dataset.key, node.dataset.text); break;
      case 'listen-line': playModel(node.dataset.key, node.dataset.text); break;
      case 'rec-word':
        {
          var key = node.dataset.key;
          if (activeRec && activeRec.btn === node) { stopRec(); break; }
          startRec(node, function (url) { recBlobs[key] = url; renderRead(); });
          break;
        }
      case 'rec-line':
        {
          var key2 = node.dataset.key, idx2 = parseInt(node.dataset.idx, 10);
          if (activeRec && activeRec.btn === node) { stopRec(); break; }
          startRec(node, function (url) {
            recBlobs[key2] = url;
            if (state.chantLines.indexOf(idx2) < 0) state.chantLines.push(idx2);
            bumpChant(); renderAll();
          });
          break;
        }
      case 'play-all':
        {
          var d = dialogueFor(curUnit()); var ck = unitAudioKey(curUnit());
          var gap = state.readSlow ? 3000 : 2000;
          d.lines.forEach(function (ln, i) { setTimeout(function () { playModel(ck + '_line' + i, ln.text); }, i * gap); });
          break;
        }
      case 'toggle-spd':
        state.readSlow = !state.readSlow; save();
        if (node.closest('.chant-player')) { node.textContent = state.readSlow ? '🐢 慢速（推荐）' : '▶ 正常语速'; }
        else { renderRead(); }
        break;
      case 'play-mine': { var url = recBlobs[node.dataset.key]; if (url) playBlob(url); break; }
      case 'compare':
        {
          var ckey = node.dataset.key, curl = recBlobs[ckey], ctxt = node.dataset.text;
          playModel(ckey, ctxt);
          if (curl) setTimeout(function () { playBlob(curl); }, 2600);
          break;
        }
      case 'switch-level':
        {
          var lv = parseInt(node.dataset.level, 10);
          state.level = lv;
          state.unitIdx = firstUnlearnedInLevel(lv);
          state.tasks = { read: 0, spell: 0, chant: 0, game: 0 };
          state.tasksDone = { read: false, spell: false, chant: false, game: false };
          state.chantLines = [];
          state.flippedToday = [];
          save(); renderAll();
          break;
        }
      case 'open-self-select': openSelfSelect(); break;
      case 'back-to-main':
        {
          // 从自选级别回到 L1 字母主线，定位到第一个未学字母，重置任务
          state.level = 1;
          state.unitIdx = firstUnlearnedInLevel(1);
          state.tasks = { read: 0, spell: 0, chant: 0, game: 0 };
          state.tasksDone = { read: false, spell: false, chant: false, game: false };
          state.chantLines = [];
          state.flippedToday = [];
          save(); renderAll();
          toast('已回到 Level 1 字母主线');
          break;
        }
      case 'enter-self-level':
        {
          var slv = parseInt(node.dataset.level, 10);
          closeSheet();
          state.level = slv;
          state.unitIdx = firstUnlearnedInLevel(slv);
          state.tasks = { read: 0, spell: 0, chant: 0, game: 0 };
          state.tasksDone = { read: false, spell: false, chant: false, game: false };
          state.chantLines = [];
          state.flippedToday = [];
          save(); renderAll();
          go('vocab');
          toast('已进入 Level ' + slv + ' 自选学习');
          break;
        }
      case 'open-placement': openPlacement(); break;
      case 'retake-placement': state.placementDone = false; save(); startPlacement(); break;
      case 'open-curriculum': openCurriculum(); break;
      case 'open-lessons': openLessons(); break;
      case 'open-sop': openSOP(); break;
      case 'open-resources': openResources(); break;
      case 'play-chant': { var ch = generateLevelChant(resLevel); playChant(ch.lines); break; }
      case 'stop-chant': stopChant(); break;
      case 'switch-res-level': { resLevel = parseInt(node.dataset.level, 10); openResources(); break; }
      case 'open-external': { var eurl = node.dataset.url; if (eurl) window.open(eurl, '_blank'); break; }
      case 'open-report': openReport(); break;
      case 'open-dictation': openDictation(); break;
      case 'view-learned': viewLearned(); break;
      case 'open-catch': openCatch(); break;
      case 'open-match': openMatch(); break;
      case 'open-puzzle': openPuzzle(); break;
      case 'open-home': openHome(); break;
      case 'open-shop': openShop(); break;
      case 'buy': buyFurniture(node.dataset.id); break;
      case 'backup-data': exportData(); break;
      case 'restore-data': importData(); break;
    }
  }

  /* ---------------- 听写练习 ---------------- */
  function allLearnedWords() {
    var list = [];
    // 当前级别当前单元及之前
    for (var lv = 1; lv <= state.level; lv++) {
      var bk = bookOf(lv);
      var maxIdx = (lv < state.level) ? bk.data.length - 1 : state.unitIdx;
      for (var i = 0; i <= maxIdx; i++) {
        bk.data[i].words.forEach(function (w) { list.push(w); });
      }
    }
    if (list.length === 0) PHA_DATA.book1[0].words.forEach(function (w) { list.push(w); });
    return list;
  }

  function openDictation() {
    var pool = allLearnedWords();
    var picks = [];
    for (var i = 0; i < 10; i++) { picks.push(pool[Math.floor(Math.random() * pool.length)]); }
    var idx = 0, correct = 0;
    function step() {
      if (idx >= 10) {
        openSheet('<div class="sheet-head"><h3>听写练习</h3><button class="sheet-close">×</button></div>' +
          '<div class="catch-prompt">完成！正确 <b>' + correct + '/10</b></div>' +
          '<div class="catch-score">已计入任务看板，去「任务看板」看看吧</div>');
        return;
      }
      var w = picks[idx];
      var opts = [w.en];
      while (opts.length < 4) { var c = pool[Math.floor(Math.random() * pool.length)].en; if (opts.indexOf(c) < 0) opts.push(c); }
      opts.sort(function () { return Math.random() - 0.5; });
      var html = '<div class="sheet-head"><h3>听写 ' + (idx + 1) + '/10</h3><button class="sheet-close">×</button></div>' +
        '<div class="catch-prompt"><span class="cn">"' + w.cn + '" 怎么拼？</span></div>' +
        '<div style="text-align:center;margin-bottom:14px"><button class="btn-speak" data-action="speak-test" data-text="' + esc(w.en) + '">🔊 听发音</button></div>' +
        '<div class="catch-options">';
      opts.forEach(function (o) { html += '<div class="catch-opt" data-en="' + esc(o) + '">' + o + '</div>'; });
      html += '</div><div class="catch-score">正确 ' + correct + ' / ' + idx + '</div>';
      openSheet(html);
      $('overlay').querySelectorAll('.catch-opt').forEach(function (op) {
        op.addEventListener('click', function () {
          if (op.dataset.en === w.en) { op.classList.add('right'); correct++; bumpTask('spell', 1, 10, 20, '听写完成 +20'); }
          else { op.classList.add('wrong'); }
          setTimeout(function () { idx++; step(); }, 600);
        });
      });
    }
    step();
  }

  function viewLearned() {
    var html = '<div class="sheet-head"><h3>已学过的单词</h3><button class="sheet-close">×</button></div><div class="flash-grid">';
    var seen = state.learned.slice();
    var curGid = state.level + '-' + state.unitIdx;
    if (seen.indexOf(curGid) < 0) seen.push(curGid);
    seen.forEach(function (gid) {
      var parts = gid.split('-');
      var lv = parseInt(parts[0], 10), ui = parseInt(parts[1], 10);
      var U = unitAt(lv, ui);
      if (U) {
        html += '<div class="lv-label">L' + lv + ' · ' + (U.kind === 'letter' ? U.letter : U.family) + '</div>';
        U.words.forEach(function (w) {
          html += '<div class="flash-card"><div class="en">' + w.en + '</div><div class="ipa">' + w.ipa + '</div><div class="hint">' + w.cn + '</div></div>';
        });
      }
    });
    html += '</div>';
    openSheet(html);
  }

  /* ---------------- 游戏：抓大鹅 ---------------- */
  function openCatch() {
    var pool = allLearnedWords();
    var score = 0, round = 0, total = 6;
    function step() {
      if (round >= total) { finishGame(); return; }
      var w = pool[Math.floor(Math.random() * pool.length)];
      var opts = [w.en];
      while (opts.length < 4) { var c = pool[Math.floor(Math.random() * pool.length)].en; if (opts.indexOf(c) < 0) opts.push(c); }
      opts.sort(function () { return Math.random() - 0.5; });
      var html = '<div class="sheet-head"><h3>抓大鹅 ' + (round + 1) + '/' + total + '</h3><button class="sheet-close">×</button></div>' +
        '<div class="catch-prompt">抓：<span class="cn">' + w.cn + '</span></div><div class="catch-options">';
      opts.forEach(function (o) { html += '<div class="catch-opt" data-en="' + esc(o) + '">' + o + '</div>'; });
      html += '</div><div class="catch-score">得分 ' + score + '</div>';
      openSheet(html);
      $('overlay').querySelectorAll('.catch-opt').forEach(function (op) {
        op.addEventListener('click', function () {
          if (op.dataset.en === w.en) { op.classList.add('right'); score += 10; }
          else { op.classList.add('wrong'); }
          setTimeout(function () { round++; step(); }, 550);
        });
      });
    }
    function finishGame() {
      addPoints(score, '抓大鹅 +' + score);
      bumpTask('game', 1, 3, 10, '');
      openSheet('<div class="sheet-head"><h3>抓大鹅</h3><button class="sheet-close">×</button></div>' +
        '<div class="catch-prompt">本局得分 <b>' + score + '</b></div>' +
        '<div class="catch-score">通关 +10 积分已记录，去任务看板看看！</div>');
    }
    step();
  }

  /* ---------------- 游戏：单词对对碰 ---------------- */
  function openMatch() {
    var pool = allLearnedWords().slice(0, 6);
    var pairs = pool.map(function (w) { return { en: w.en, cn: w.cn }; });
    var tiles = [];
    pairs.forEach(function (p) { tiles.push({ t: 'en', v: p.en }); tiles.push({ t: 'cn', v: p.cn }); });
    tiles.sort(function () { return Math.random() - 0.5; });
    var sel = null, matched = 0;
    var html = '<div class="sheet-head"><h3>单词对对碰</h3><button class="sheet-close">×</button></div><div class="match-grid">';
    tiles.forEach(function (t, i) { html += '<div class="match-tile ' + t.t + '" data-i="' + i + '" data-t="' + t.t + '" data-v="' + esc(t.v) + '">' + t.v + '</div>'; });
    html += '</div><div class="catch-score" id="matchInfo">配对 ' + matched + '/' + pairs.length + '</div>';
    openSheet(html);
    var grid = $('overlay').querySelector('.match-grid');
    grid.addEventListener('click', function (e) {
      var tile = e.target.closest('.match-tile'); if (!tile || tile.classList.contains('matched')) return;
      if (sel && sel.el === tile) { sel.el.classList.remove('sel'); sel = null; return; }
      if (!sel) { sel = { el: tile, t: tile.dataset.t, v: tile.dataset.v }; tile.classList.add('sel'); return; }
      if (sel.t === tile.dataset.t) { sel.el.classList.remove('sel'); sel = { el: tile, t: tile.dataset.t, v: tile.dataset.v }; tile.classList.add('sel'); return; }
      var a = pairs.find(function (p) { return p.en === sel.v && p.cn === tile.dataset.v; }) ||
              pairs.find(function (p) { return p.cn === sel.v && p.en === tile.dataset.v; });
      if (a) {
        sel.el.classList.add('matched'); tile.classList.add('matched');
        matched++; $('matchInfo').textContent = '配对 ' + matched + '/' + pairs.length;
        sel = null;
        if (matched >= pairs.length) {
          addPoints(30, '对对碰 +30'); bumpTask('game', 1, 3, 10, '');
          setTimeout(function () {
            openSheet('<div class="sheet-head"><h3>单词对对碰</h3><button class="sheet-close">×</button></div><div class="catch-prompt">全部配对成功！</div><div class="catch-score">通关 +10 积分已记录</div>');
          }, 500);
        }
      } else {
        tile.classList.add('error'); sel.el.classList.add('error');
        setTimeout(function () { tile.classList.remove('error', 'sel'); sel.el.classList.remove('error', 'sel'); }, 500);
        sel = null;
      }
    });
  }

  /* ---------------- 游戏：拼读小拼图 ---------------- */
  function openPuzzle() {
    var unit = curUnit();
    var words = (unit && unit.words) ? unit.words.slice() : [];
    if (words.length === 0) {
      openSheet('<div class="sheet-head"><h3>拼读小拼图</h3><button class="sheet-close">×</button></div>' +
        '<div class="catch-prompt">本节暂时没有单词</div><div class="catch-score">先去「词汇练习」学几个单词吧</div>');
      return;
    }
    var wi = 0;            // 当前单词序号（0 起）
    var doneCount = 0;     // 已拼对的单词数
    var w, arr, shuffled, filled, usedPos;

    function setupWord() {
      w = words[wi];
      arr = w.en.split('');
      shuffled = arr.slice().sort(function () { return Math.random() - 0.5; });
      filled = [];
      usedPos = [];
    }

    function render() {
      var target = arr.map(function (c, i) { return filled[i] ? filled[i] : '<span class="blank">_</span>'; }).join('');
      var html = '<div class="sheet-head"><h3>拼读小拼图 ' + (wi + 1) + '/' + words.length + '</h3><button class="sheet-close">×</button></div>' +
        '<div class="puzzle-progress">本节共 ' + words.length + ' 个单词，逐个拼对才能通关 👇</div>' +
        '<div class="puzzle-word">中文：' + esc(w.cn) + '　听发音：</div>' +
        '<div style="text-align:center;margin-bottom:12px"><button class="btn-speak" data-action="speak-test" data-text="' + esc(w.en) + '">🔊</button></div>' +
        '<div class="puzzle-target">' + target + '</div><div class="puzzle-tiles">';
      shuffled.forEach(function (c, i) { html += '<div class="puzzle-tile' + (usedPos.indexOf(i) >= 0 ? ' used' : '') + '" data-i="' + i + '">' + c + '</div>'; });
      html += '</div><div class="catch-score">按顺序点字母拼出单词 · 已拼好 ' + doneCount + '/' + words.length + '</div>';
      openSheet(html);
      /* openSheet 替换了整个 overlay，需要重新绑定监听器 */
      var pt = $('overlay').querySelector('.puzzle-tiles');
      if (pt) pt.addEventListener('click', onTileClick);
    }

    function onTileClick(e) {
      var tile = e.target.closest('.puzzle-tile'); if (!tile || tile.classList.contains('used')) return;
      var pos = parseInt(tile.dataset.i, 10); if (usedPos.indexOf(pos) >= 0) return;
      var expected = arr[filled.length];
      if (shuffled[pos] === expected) {
        filled.push(shuffled[pos]); usedPos.push(pos); tile.classList.add('used');
        if (filled.length >= arr.length) {
          doneCount++;
          if (wi < words.length - 1) {
            /* 还有下一个单词：稍作提示后进入下一个 */
            wi++;
            addPoints(5, '拼对一个 +5');
            setTimeout(function () { setupWord(); render(); }, 550);
          } else {
            /* 全部拼完 → 通关 */
            addPoints(30, '拼图通关 +30');
            bumpTask('game', 1, 3, 10, '游戏闯关 +10');
            setTimeout(function () {
              openSheet('<div class="sheet-head"><h3>拼读小拼图</h3><button class="sheet-close">×</button></div>' +
                '<div class="catch-prompt">🎉 本节 ' + words.length + ' 个单词全拼对！</div>' +
                '<div class="catch-score">通关 +10 积分 · 「游戏闯关」进度 +1</div>');
            }, 400);
          }
        } else { render(); }
      } else { tile.classList.add('error'); setTimeout(function () { tile.classList.remove('error'); }, 400); }
    }

    setupWord();
    render();
  }

  /* ---------------- 我的小屋 / 家居兑换 ---------------- */
  function openHome() {
    var html = '<div class="sheet-head"><h3>我的小屋</h3><button class="sheet-close">×</button></div>';
    html += '<div class="room"><div class="floor"></div>';
    PHA_DATA.furniture.forEach(function (f) {
      if (state.owned.indexOf(f.id) >= 0) {
        html += '<div class="furniture" style="left:' + f.x + '%;top:' + f.y + '%;width:' + f.w + '%;height:' + f.h + '%">' +
          '<span class="emo" style="font-size:' + Math.min(f.w, f.h) * 0.9 + 'vw">' + f.emoji + '</span>' +
          '<span class="fn">' + f.name + '</span></div>';
      }
    });
    html += '</div>';
    html += '<div class="catch-score">用积分兑换家具，会自动摆到合适位置 · 当前积分 ' + state.points + '</div>';
    html += '<div class="entry shop" data-action="open-shop" style="justify-content:center;margin-top:10px">🛒 去兑换商店</div>';
    openSheet(html);
  }

  function openShop() {
    var html = '<div class="sheet-head"><h3>兑换商店</h3><button class="sheet-close">×</button></div><div class="shop-list">';
    PHA_DATA.furniture.forEach(function (f) {
      var owned = state.owned.indexOf(f.id) >= 0;
      var can = state.points >= f.cost;
      html += '<div class="shop-item"><span class="sic">' + f.emoji + '</span>' +
        '<div class="smid"><div class="sn">' + f.name + '</div><div class="sc">⭐ ' + f.cost + ' 积分</div></div>' +
        (owned ? '<button class="btn-buy owned" disabled>已拥有</button>'
               : '<button class="btn-buy" data-action="buy" data-id="' + f.id + '"' + (can ? '' : ' disabled') + '>兑换</button>') +
        '</div>';
    });
    html += '</div><div class="catch-score" style="margin-top:12px">当前积分 ' + state.points + ' ⭐</div>';
    openSheet(html);
  }

  function buyFurniture(id) {
    var f = PHA_DATA.furniture.find(function (x) { return x.id === id; }); if (!f) return;
    if (state.owned.indexOf(id) >= 0) return;
    if (state.points < f.cost) { toast('积分不够哦'); return; }
    state.points -= f.cost; state.owned.push(id); save();
    toast('兑换成功：' + f.name);
    openShop(); renderAchieve();
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    rollover();
    checkIn();
    document.querySelectorAll('#tabbar .tab').forEach(function (t) {
      t.addEventListener('click', function () { go(t.dataset.screen); });
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-action]');
      if (a) handleAction(a.dataset.action, a);
    });
    window.PHA = { speak: speak };
    go('dashboard');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
