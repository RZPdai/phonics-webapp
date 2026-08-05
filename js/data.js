/* ============================================================
 * data.js — Oxford Phonics World (OPW) 1-5 完整课程数据
 *
 * 对齐 Oxford Phonics World 原版官方体系：
 *   Level 1: The Alphabet (26 字母 A→Z)
 *   Level 2: Short Vowels (5 短元音 CVC + ck/ss/ll/ff)
 *   Level 3: Long Vowels (Magic e + ee/ea/ai/ay/igh/oa/ow)
 *   Level 4: Consonant Blends (辅音连缀 + ch/sh/th/ng/nk)
 *   Level 5: R-Controlled & More (ar/er/ir/or/ur + 双元音 + 静音字母)
 *
 * 词汇为 OPW 标准教学词（非原版专有原文）。
 * ============================================================ */

const PHA_DATA = {

  /* ========================================================
   * 课程体系元数据（7 大模块之"五级完整课程体系"）
   * ======================================================== */
  curriculum: {
    title: 'Oxford Phonics World 1-5',
    subtitle: '6-8 岁零基础英语启蒙 · 标准化课程工作台',
    levels: [
      {
        level: 1,
        title: 'The Alphabet',
        cnTitle: '字母启蒙',
        lessons: 24,
        objectives: '掌握 26 个字母的字母名 (letter name) 与字母音 (letter sound)，能认读每个字母对应的核心词汇。',
        knowledgePoints: '26 个字母 A→Z 原版顺序教学；每字母 4 个标准例词；字母名与字母音区分；大小写配对。',
        completion: '能正确说出 26 个字母名与字母音；能认读 104 个核心词；听音能指认对应字母。',
        mistakes: 'b/d 混淆；g/j 发音混淆；w/y 字母名与音混淆；元音 a/e/i/o/u 发音不饱满。',
        materials: '字母闪卡 26 张；字母歌 (Alphabet Song)；Super Simple Songs 字母歌谣。'
      },
      {
        level: 2,
        title: 'Short Vowels',
        cnTitle: '短元音拼读',
        lessons: 30,
        objectives: '掌握 5 个短元音发音，能进行 CVC (辅音-元音-辅音) 拼读，学习 ck/ss/ll/ff 双辅音词尾。',
        knowledgePoints: 'a/e/i/o/u 5 个短元音；CVC 词族 (-at/-en/-ig/-ot/-ug)；词尾双辅音 ck/ss/ll/ff。',
        completion: '能独立拼读 CVC 单词；听写 20 个 CVC 词正确率 ≥80%；能区分 5 个短元音。',
        mistakes: 'e/i 发音混淆；a 发成"诶"而非 /æ/；ck 和 k 拼写混淆；短元音不够短促。',
        materials: 'CVC 词卡；短元音歌谣；OPW Book 2 配套分级阅读。'
      },
      {
        level: 3,
        title: 'Long Vowels',
        cnTitle: '长元音拼读',
        lessons: 32,
        objectives: '掌握 Magic e 规则与元音组合 ee/ea/ai/ay/igh/oa/ow 的发音规律。',
        knowledgePoints: 'Magic e (a_e/i_e/o_e/u_e/e_e)；元音组合 ee/ea/ai/ay/igh/oa/ow；长元音 vs 短元音对比。',
        completion: '能运用 Magic e 规则拼读新词；能正确读出 7 组元音组合单词；长短元音听辨正确率 ≥85%。',
        mistakes: 'ee/ea 发音区分困难；ai/ay 选择混淆；igh 三字母组合遗漏；Magic e 遗忘不发音。',
        materials: 'Magic e 闪卡；长元音歌谣；OPW Book 3 配套绘本。'
      },
      {
        level: 4,
        title: 'Consonant Blends',
        cnTitle: '辅音组合',
        lessons: 32,
        objectives: '掌握辅音连缀 (bl/cl/fl 等) 与辅音组合 (ch/sh/th/ng/nk) 的拼读。',
        knowledgePoints: '前缀连缀 bl/cl/fl/gl/pl/sl/br/cr/dr/fr/gr/pr/tr；后缀连缀 st/sp/sk/sw/tw；辅音组合 ch/sh/th/wh/ng/nk。',
        completion: '能拼读含 2-3 辅音连缀的单词；能区分 ch/sh/th 发音；能正确读出 ng/nk 词尾。',
        mistakes: 'th 清浊音混淆 (/θ/ vs /ð/)；bl/br 混淆；sk/spr 串读遗漏辅音；ng 发成 /n/。',
        materials: '辅音连缀闪卡；ch/sh/th 对比卡；OPW Book 4 配套阅读。'
      },
      {
        level: 5,
        title: 'R-Controlled & More',
        cnTitle: 'R控制元音与进阶',
        lessons: 36,
        objectives: '掌握 R 控制元音 ar/er/ir/or/ur、双元音 ou/ow/oi/oy/au/aw、同音多拼写与静音字母。',
        knowledgePoints: 'R 控制元音 ar/er/ir/or/ur；双元音 ou/ow/oi/oy/au/aw；同音多拼写 (ee/ea, ai/ay)；静音字母 (knee/wrist/lamb)。',
        completion: '能正确拼读 R 控制元音单词；能区分双元音 ou/ow, oi/oy；掌握 5 个以上静音字母单词。',
        mistakes: 'ar/or 混淆；er/ir/ur 发音统一为 /ər/；ou/ow 选择困难；au/aw 区分。',
        materials: 'R 控制元音卡；双元音对比卡；OPW Book 5 配套阅读。'
      }
    ],
    totalLessons: function () {
      return this.levels.reduce(function (s, l) { return s + l.lessons; }, 0);
    }
  },

  /* ========================================================
   * 入学测评题库（7 大模块之"学员入学测评"）
   * ======================================================== */
  placementTest: {
    title: '入学测评',
    subtitle: '测一测，看看从哪一级开始学',
    items: [
      // Part 1: 字母识别 (10 题)
      { type: 'letter-id', part: '字母识别', q: '这个字母是什么？', show: 'Aa', options: ['Aa', 'Bb', 'Cc', 'Dd'], answer: 0 },
      { type: 'letter-id', part: '字母识别', q: '这个字母是什么？', show: 'Mm', options: ['Nn', 'Mm', 'Ww', 'Hh'], answer: 1 },
      { type: 'letter-id', part: '字母识别', q: '这个字母是什么？', show: 'Pp', options: ['Bb', 'Rr', 'Pp', 'Dd'], answer: 2 },
      { type: 'letter-id', part: '字母识别', q: '这个字母是什么？', show: 'Tt', options: ['Ff', 'Ii', 'Ll', 'Tt'], answer: 3 },
      { type: 'letter-id', part: '字母识别', q: '这个字母是什么？', show: 'Gg', options: ['Gg', 'Qq', 'Oo', 'Ss'], answer: 0 },
      // Part 2: 字母发音 (10 题)
      { type: 'letter-sound', part: '字母发音', q: '听一听，哪个字母发这个音？', show: '/b/', speak: 'b', options: ['Bb', 'Dd', 'Pp', 'Tt'], answer: 0 },
      { type: 'letter-sound', part: '字母发音', q: '听一听，哪个字母发这个音？', show: '/s/', speak: 's', options: ['Zz', 'Cc', 'Ss', 'Xx'], answer: 2 },
      { type: 'letter-sound', part: '字母发音', q: '听一听，哪个字母发这个音？', show: '/m/', speak: 'm', options: ['Nn', 'Mm', 'Ll', 'Rr'], answer: 1 },
      { type: 'letter-sound', part: '字母发音', q: '听一听，哪个字母发这个音？', show: '/k/', speak: 'k', options: ['Cc', 'Kk', 'Qq', '以上都可以'], answer: 3 },
      { type: 'letter-sound', part: '字母发音', q: '听一听，哪个字母发这个音？', show: '/f/', speak: 'f', options: ['Vv', 'Ff', 'Pp', 'Bb'], answer: 1 },
      // Part 3: 听音辨词 (5 题)
      { type: 'listen-word', part: '听音辨词', q: '听到的是哪个单词？', speak: 'cat', options: ['cat', 'cap', 'bat', 'cup'], answer: 0 },
      { type: 'listen-word', part: '听音辨词', q: '听到的是哪个单词？', speak: 'dog', options: ['dig', 'dog', 'dot', 'big'], answer: 1 },
      { type: 'listen-word', part: '听音辨词', q: '听到的是哪个单词？', speak: 'sun', options: ['run', 'sun', 'fun', 'bun'], answer: 1 },
      { type: 'listen-word', part: '听音辨词', q: '听到的是哪个单词？', speak: 'pen', options: ['pan', 'pin', 'pen', 'pet'], answer: 2 },
      { type: 'listen-word', part: '听音辨词', q: '听到的是哪个单词？', speak: 'hat', options: ['hot', 'hat', 'hit', 'hut'], answer: 1 },
      // Part 4: 拼读能力 (5 题)
      { type: 'blend', part: '拼读能力', q: 'c-a-t 拼起来是？', options: ['cat', 'cut', 'cot', 'cap'], answer: 0 },
      { type: 'blend', part: '拼读能力', q: 'p-i-g 拼起来是？', options: ['peg', 'pig', 'big', 'bag'], answer: 1 },
      { type: 'blend', part: '拼读能力', q: 'h-o-t 拼起来是？', options: ['hat', 'hit', 'hot', 'hut'], answer: 2 },
      { type: 'blend', part: '拼读能力', q: 'm-a-p 拼起来是？', options: ['map', 'mop', 'cap', 'tap'], answer: 0 },
      { type: 'blend', part: '拼读能力', q: 'b-e-d 拼起来是？', options: ['bad', 'bed', 'bid', 'bud'], answer: 1 }
    ],
    // 分班规则
    placement: function (score) {
      if (score <= 5)  return { level: 1, msg: '零基础班 · 从 Level 1 字母启蒙开始' };
      if (score <= 10) return { level: 1, msg: 'L1 零基础班 · 字母基础薄弱，从 Level 1 巩固' };
      if (score <= 15) return { level: 2, msg: 'L2 拼读入门班 · 字母已掌握，进入 Level 2 短元音' };
      return { level: 3, msg: 'L3 进阶班 · 拼读基础扎实，可直接进入 Level 3' };
    }
  },

  /* ========================================================
   * 40 分钟标准课堂 SOP（7 大模块之"单节课标准化课堂流程"）
   * ======================================================== */
  classSOP: [
    { phase: 1, name: '热身复习', duration: 8, desc: '复习上节课内容：闪卡快读、歌谣齐唱、提问互动。激活已学知识，营造英语氛围。' },
    { phase: 2, name: '新知发音导入', duration: 10, desc: '展示新字母/新发音：听示范音→看口型→模仿跟读→纠正发音。用实物图片引入新词。' },
    { phase: 3, name: '单词拼读训练', duration: 12, desc: '拆音拼读练习：先慢后快，先集体后个别。CVC 逐音拼合，辅音连缀分步练习。配闪卡巩固。' },
    { phase: 4, name: '短句解码阅读', duration: 6, desc: '将新词放入短句/歌谣中朗读解码，训练"见词能读"能力。鼓励学生独立朗读。' },
    { phase: 5, name: '课堂闯关+作业布置', duration: 4, desc: '课堂游戏闯关检测（抓大鹅/对对碰/拼图），布置课后预习与听写任务。' }
  ],

  /* ========================================================
   * Level 1: The Alphabet — 26 字母 × 4 词
   * ======================================================== */
  book1: [
    { letter: 'Aa', sound: '/æ/', tip: '嘴巴张大，发"爱"', words: [
      { en: 'ant',      ipa: '/ænt/',          cn: '蚂蚁' },
      { en: 'apple',    ipa: '/ˈæp.əl/',       cn: '苹果' },
      { en: 'alligator',ipa: '/ˈæl.ɪ.ɡeɪ.tər/', cn: '短吻鳄' },
      { en: 'ax',       ipa: '/æks/',          cn: '斧头' } ] },
    { letter: 'Bb', sound: '/b/', tip: '双唇闭合再打开', words: [
      { en: 'ball',  ipa: '/bɔːl/', cn: '球' },
      { en: 'banana',ipa: '/bəˈnɑː.nə/', cn: '香蕉' },
      { en: 'book',  ipa: '/bʊk/',  cn: '书' },
      { en: 'bus',   ipa: '/bʌs/',  cn: '公交车' } ] },
    { letter: 'Cc', sound: '/k/', tip: '舌根抵软腭', words: [
      { en: 'car', ipa: '/kɑːr/', cn: '汽车' },
      { en: 'cat', ipa: '/kæt/',  cn: '猫' },
      { en: 'cup', ipa: '/kʌp/',  cn: '杯子' },
      { en: 'cap', ipa: '/kæp/',  cn: '帽子' } ] },
    { letter: 'Dd', sound: '/d/', tip: '舌尖顶上齿龈', words: [
      { en: 'dog',  ipa: '/dɒɡ/', cn: '狗' },
      { en: 'doll', ipa: '/dɒl/', cn: '玩偶' },
      { en: 'duck', ipa: '/dʌk/', cn: '鸭子' },
      { en: 'dig',  ipa: '/dɪɡ/', cn: '挖' } ] },
    { letter: 'Ee', sound: '/e/', tip: '嘴角微咧', words: [
      { en: 'egg',      ipa: '/eɡ/',       cn: '鸡蛋' },
      { en: 'elephant', ipa: '/ˈel.ɪ.fənt/', cn: '大象' },
      { en: 'elbow',    ipa: '/ˈel.bəʊ/',   cn: '手肘' },
      { en: 'empty',    ipa: '/ˈem.ti/',    cn: '空的' } ] },
    { letter: 'Ff', sound: '/f/', tip: '上齿轻咬下唇', words: [
      { en: 'fan',  ipa: '/fæn/',  cn: '扇子' },
      { en: 'fish', ipa: '/fɪʃ/',  cn: '鱼' },
      { en: 'finger',ipa: '/ˈfɪŋ.ɡər/', cn: '手指' },
      { en: 'fox',  ipa: '/fɒks/', cn: '狐狸' } ] },
    { letter: 'Gg', sound: '/ɡ/', tip: '舌根抬起', words: [
      { en: 'girl',   ipa: '/ɡɜːl/',     cn: '女孩' },
      { en: 'goat',   ipa: '/ɡəʊt/',     cn: '山羊' },
      { en: 'gorilla',ipa: '/ɡəˈrɪl.ə/',  cn: '大猩猩' },
      { en: 'gum',    ipa: '/ɡʌm/',      cn: '口香糖' } ] },
    { letter: 'Hh', sound: '/h/', tip: '轻轻呼气', words: [
      { en: 'hat',  ipa: '/hæt/',  cn: '帽子' },
      { en: 'hand', ipa: '/hænd/', cn: '手' },
      { en: 'horse',ipa: '/hɔːrs/', cn: '马' },
      { en: 'hen',  ipa: '/hen/',  cn: '母鸡' } ] },
    { letter: 'Ii', sound: '/ɪ/', tip: '短促的"衣"', words: [
      { en: 'insect', ipa: '/ˈɪn.sekt/', cn: '昆虫' },
      { en: 'iguana', ipa: '/ɪˈɡwɑː.nə/', cn: '鬣蜥' },
      { en: 'ink',    ipa: '/ɪŋk/',    cn: '墨水' },
      { en: 'igloo',  ipa: '/ˈɪɡ.luː/', cn: '冰屋' } ] },
    { letter: 'Jj', sound: '/dʒ/', tip: '舌面抵硬腭', words: [
      { en: 'jam',  ipa: '/dʒæm/', cn: '果酱' },
      { en: 'jet',  ipa: '/dʒet/', cn: '喷气飞机' },
      { en: 'juice',ipa: '/dʒuːs/', cn: '果汁' },
      { en: 'jeep', ipa: '/dʒiːp/', cn: '吉普车' } ] },
    { letter: 'Kk', sound: '/k/', tip: '舌后开气', words: [
      { en: 'key',  ipa: '/kiː/',  cn: '钥匙' },
      { en: 'king', ipa: '/kɪŋ/',  cn: '国王' },
      { en: 'kite', ipa: '/kaɪt/', cn: '风筝' },
      { en: 'kid',  ipa: '/kɪd/',  cn: '小孩' } ] },
    { letter: 'Ll', sound: '/l/', tip: '舌尖顶上齿龈', words: [
      { en: 'lion', ipa: '/ˈlaɪ.ən/', cn: '狮子' },
      { en: 'leaf', ipa: '/liːf/',   cn: '树叶' },
      { en: 'leg',  ipa: '/leɡ/',    cn: '腿' },
      { en: 'log',  ipa: '/lɒɡ/',    cn: '木头' } ] },
    { letter: 'Mm', sound: '/m/', tip: '双唇闭合鼻音', words: [
      { en: 'monkey', ipa: '/ˈmʌŋ.ki/', cn: '猴子' },
      { en: 'mouse',  ipa: '/maʊs/',  cn: '老鼠' },
      { en: 'milk',   ipa: '/mɪlk/',  cn: '牛奶' },
      { en: 'moon',   ipa: '/muːn/',  cn: '月亮' } ] },
    { letter: 'Nn', sound: '/n/', tip: '舌尖鼻音', words: [
      { en: 'nose', ipa: '/nəʊz/', cn: '鼻子' },
      { en: 'nest', ipa: '/nest/', cn: '鸟窝' },
      { en: 'net',  ipa: '/net/',  cn: '网' },
      { en: 'nut',  ipa: '/nʌt/',  cn: '坚果' } ] },
    { letter: 'Oo', sound: '/ɒ/', tip: '圆唇短"奥"', words: [
      { en: 'octopus', ipa: '/ˈɒk.tə.pəs/', cn: '章鱼' },
      { en: 'orange',  ipa: '/ˈɒr.ɪndʒ/', cn: '橙子' },
      { en: 'ostrich', ipa: '/ˈɒs.trɪtʃ/', cn: '鸵鸟' },
      { en: 'ox',      ipa: '/ɒks/',      cn: '公牛' } ] },
    { letter: 'Pp', sound: '/p/', tip: '双唇爆破', words: [
      { en: 'pig',    ipa: '/pɪɡ/',  cn: '猪' },
      { en: 'pen',    ipa: '/pen/',  cn: '钢笔' },
      { en: 'pencil', ipa: '/ˈpen.səl/', cn: '铅笔' },
      { en: 'pan',    ipa: '/pæn/',  cn: '平底锅' } ] },
    { letter: 'Qq', sound: '/kw/', tip: '"阔"的音', words: [
      { en: 'queen', ipa: '/kwiːn/',  cn: '女王' },
      { en: 'quilt', ipa: '/kwɪlt/',  cn: '被子' },
      { en: 'quiet', ipa: '/ˈkwaɪ.ət/', cn: '安静的' },
      { en: 'quiz',  ipa: '/kwɪz/',   cn: '小测验' } ] },
    { letter: 'Rr', sound: '/r/', tip: '卷舌轻弹', words: [
      { en: 'rabbit', ipa: '/ˈræb.ɪt/', cn: '兔子' },
      { en: 'red',    ipa: '/red/',    cn: '红色' },
      { en: 'ring',   ipa: '/rɪŋ/',    cn: '戒指' },
      { en: 'robot',  ipa: '/ˈrəʊ.bɒt/', cn: '机器人' } ] },
    { letter: 'Ss', sound: '/s/', tip: '蛇一样的丝丝声', words: [
      { en: 'sun',   ipa: '/sʌn/',   cn: '太阳' },
      { en: 'snake', ipa: '/sneɪk/',  cn: '蛇' },
      { en: 'socks', ipa: '/sɒks/',   cn: '袜子' },
      { en: 'star',  ipa: '/stɑːr/',  cn: '星星' } ] },
    { letter: 'Tt', sound: '/t/', tip: '舌尖爆破', words: [
      { en: 'tiger',  ipa: '/ˈtaɪ.ɡər/', cn: '老虎' },
      { en: 'ten',    ipa: '/ten/',      cn: '十' },
      { en: 'turtle', ipa: '/ˈtɜː.təl/', cn: '乌龟' },
      { en: 'toy',    ipa: '/tɔɪ/',     cn: '玩具' } ] },
    { letter: 'Uu', sound: '/ʌ/', tip: '短促的"阿"', words: [
      { en: 'umbrella', ipa: '/ʌmˈbrel.ə/', cn: '雨伞' },
      { en: 'under',    ipa: '/ˈʌn.dər/',  cn: '在…下面' },
      { en: 'up',       ipa: '/ʌp/',       cn: '向上' },
      { en: 'uncle',    ipa: '/ˈʌŋ.kl/',   cn: '叔叔' } ] },
    { letter: 'Vv', sound: '/v/', tip: '上齿咬下唇振动', words: [
      { en: 'van',    ipa: '/væn/',    cn: '厢式车' },
      { en: 'vest',   ipa: '/vest/',   cn: '背心' },
      { en: 'violin', ipa: '/vaɪəˈlɪn/', cn: '小提琴' },
      { en: 'vase',   ipa: '/vɑːz/',   cn: '花瓶' } ] },
    { letter: 'Ww', sound: '/w/', tip: '圆唇半元音', words: [
      { en: 'watch',  ipa: '/wɒtʃ/',  cn: '手表' },
      { en: 'water',  ipa: '/ˈwɔː.tər/', cn: '水' },
      { en: 'window', ipa: '/ˈwɪn.dəʊ/', cn: '窗户' },
      { en: 'worm',   ipa: '/wɜːm/',   cn: '虫子' } ] },
    { letter: 'Xx', sound: '/ks/', tip: '两个音"克丝"', words: [
      { en: 'box', ipa: '/bɒks/', cn: '盒子' },
      { en: 'fox', ipa: '/fɒks/', cn: '狐狸' },
      { en: 'six', ipa: '/sɪks/', cn: '六' },
      { en: 'ax',  ipa: '/æks/',  cn: '斧头' } ] },
    { letter: 'Yy', sound: '/j/', tip: '像"耶"的开头', words: [
      { en: 'yoyo',   ipa: '/ˈjəʊ.jəʊ/', cn: '悠悠球' },
      { en: 'yacht',  ipa: '/jɒt/',      cn: '游艇' },
      { en: 'yogurt', ipa: '/ˈjɒɡ.ət/',  cn: '酸奶' },
      { en: 'yak',    ipa: '/jæk/',      cn: '牦牛' } ] },
    { letter: 'Zz', sound: '/z/', tip: '蜜蜂一样的"滋"', words: [
      { en: 'zebra',  ipa: '/ˈziː.brə/', cn: '斑马' },
      { en: 'zip',    ipa: '/zɪp/',     cn: '拉链' },
      { en: 'zoo',    ipa: '/zuː/',     cn: '动物园' },
      { en: 'zipper', ipa: '/ˈzɪp.ər/', cn: '拉链齿' } ] }
  ],

  /* ========================================================
   * Level 2: Short Vowels — 5 短元音 CVC + 4 双辅音词尾
   * ======================================================== */
  book2: [
    { family: '-at', vowel: 'a', sound: '/æ/', words: [
      { en: 'cat', ipa: '/kæt/', cn: '猫' }, { en: 'hat', ipa: '/hæt/', cn: '帽子' },
      { en: 'map', ipa: '/mæp/', cn: '地图' }, { en: 'sad', ipa: '/sæd/', cn: '伤心的' } ] },
    { family: '-en', vowel: 'e', sound: '/e/', words: [
      { en: 'pen', ipa: '/pen/', cn: '钢笔' }, { en: 'bed', ipa: '/bed/', cn: '床' },
      { en: 'leg', ipa: '/leɡ/', cn: '腿' }, { en: 'ten', ipa: '/ten/', cn: '十' } ] },
    { family: '-ig', vowel: 'i', sound: '/ɪ/', words: [
      { en: 'pig', ipa: '/pɪɡ/', cn: '猪' }, { en: 'big', ipa: '/bɪɡ/', cn: '大的' },
      { en: 'sit', ipa: '/sɪt/', cn: '坐' }, { en: 'dig', ipa: '/dɪɡ/', cn: '挖' } ] },
    { family: '-ot', vowel: 'o', sound: '/ɒ/', words: [
      { en: 'hot', ipa: '/hɒt/', cn: '热的' }, { en: 'dog', ipa: '/dɒɡ/', cn: '狗' },
      { en: 'pot', ipa: '/pɒt/', cn: '锅' }, { en: 'log', ipa: '/lɒɡ/', cn: '木头' } ] },
    { family: '-ug', vowel: 'u', sound: '/ʌ/', words: [
      { en: 'bug', ipa: '/bʌɡ/', cn: '虫子' }, { en: 'sun', ipa: '/sʌn/', cn: '太阳' },
      { en: 'cup', ipa: '/kʌp/', cn: '杯子' }, { en: 'cut', ipa: '/kʌt/', cn: '切' } ] },
    // 双辅音词尾
    { family: '-ick', vowel: 'i', sound: '/ɪk/', words: [
      { en: 'kick', ipa: '/kɪk/', cn: '踢' }, { en: 'sick', ipa: '/sɪk/', cn: '生病的' },
      { en: 'stick', ipa: '/stɪk/', cn: '棍子' }, { en: 'clock', ipa: '/klɒk/', cn: '时钟' } ] },
    { family: '-ess', vowel: 'e', sound: '/es/', words: [
      { en: 'dress', ipa: '/dres/', cn: '裙子' }, { en: 'guess', ipa: '/ɡes/', cn: '猜' },
      { en: 'boss', ipa: '/bɒs/', cn: '老板' }, { en: 'kiss', ipa: '/kɪs/', cn: '亲吻' } ] },
    { family: '-all', vowel: 'a', sound: '/ɔːl/', words: [
      { en: 'ball', ipa: '/bɔːl/', cn: '球' }, { en: 'tall', ipa: '/tɔːl/', cn: '高的' },
      { en: 'wall', ipa: '/wɔːl/', cn: '墙' }, { en: 'small', ipa: '/smɔːl/', cn: '小的' } ] },
    { family: '-off', vowel: 'o', sound: '/ɒf/', words: [
      { en: 'off', ipa: '/ɒf/', cn: '关闭' }, { en: 'cuff', ipa: '/kʌf/', cn: '袖口' },
      { en: 'puff', ipa: '/pʌf/', cn: '吹气' }, { en: 'stuff', ipa: '/stʌf/', cn: '东西' } ] }
  ],

  /* ========================================================
   * Level 3: Long Vowels — Magic e + 7 组元音组合
   * ======================================================== */
  book3: [
    // Magic e (a_e, i_e, o_e, u_e, e_e)
    { family: 'a_e', vowel: 'a', sound: '/eɪ/', words: [
      { en: 'cake', ipa: '/keɪk/', cn: '蛋糕' }, { en: 'lake', ipa: '/leɪk/', cn: '湖' },
      { en: 'name', ipa: '/neɪm/', cn: '名字' }, { en: 'gate', ipa: '/ɡeɪt/', cn: '大门' } ] },
    { family: 'i_e', vowel: 'i', sound: '/aɪ/', words: [
      { en: 'kite', ipa: '/kaɪt/', cn: '风筝' }, { en: 'bike', ipa: '/baɪk/', cn: '自行车' },
      { en: 'time', ipa: '/taɪm/', cn: '时间' }, { en: 'five', ipa: '/faɪv/', cn: '五' } ] },
    { family: 'o_e', vowel: 'o', sound: '/oʊ/', words: [
      { en: 'bone', ipa: '/boʊn/', cn: '骨头' }, { en: 'home', ipa: '/hoʊm/', cn: '家' },
      { en: 'nose', ipa: '/noʊz/', cn: '鼻子' }, { en: 'rose', ipa: '/roʊz/', cn: '玫瑰' } ] },
    { family: 'u_e', vowel: 'u', sound: '/juː/', words: [
      { en: 'cube', ipa: '/kjuːb/', cn: '立方体' }, { en: 'tube', ipa: '/tjuːb/', cn: '管子' },
      { en: 'cute', ipa: '/kjuːt/', cn: '可爱的' }, { en: 'mute', ipa: '/mjuːt/', cn: '静音' } ] },
    { family: 'e_e', vowel: 'e', sound: '/iː/', words: [
      { en: 'tree', ipa: '/triː/', cn: '树' }, { en: 'free', ipa: '/friː/', cn: '自由的' },
      { en: 'see', ipa: '/siː/', cn: '看见' }, { en: 'three', ipa: '/θriː/', cn: '三' } ] },
    // 元音组合
    { family: 'ee', vowel: 'ee', sound: '/iː/', words: [
      { en: 'bee', ipa: '/biː/', cn: '蜜蜂' }, { en: 'feet', ipa: '/fiːt/', cn: '脚' },
      { en: 'green', ipa: '/ɡriːn/', cn: '绿色' }, { en: 'sleep', ipa: '/sliːp/', cn: '睡觉' } ] },
    { family: 'ea', vowel: 'ea', sound: '/iː/', words: [
      { en: 'sea', ipa: '/siː/', cn: '海' }, { en: 'tea', ipa: '/tiː/', cn: '茶' },
      { en: 'read', ipa: '/riːd/', cn: '阅读' }, { en: 'leaf', ipa: '/liːf/', cn: '树叶' } ] },
    { family: 'ai', vowel: 'ai', sound: '/eɪ/', words: [
      { en: 'rain', ipa: '/reɪn/', cn: '雨' }, { en: 'train', ipa: '/treɪn/', cn: '火车' },
      { en: 'tail', ipa: '/teɪl/', cn: '尾巴' }, { en: 'paint', ipa: '/peɪnt/', cn: '画' } ] },
    { family: 'ay', vowel: 'ay', sound: '/eɪ/', words: [
      { en: 'day', ipa: '/deɪ/', cn: '白天' }, { en: 'play', ipa: '/pleɪ/', cn: '玩' },
      { en: 'say', ipa: '/seɪ/', cn: '说' }, { en: 'tray', ipa: '/treɪ/', cn: '托盘' } ] },
    { family: 'igh', vowel: 'igh', sound: '/aɪ/', words: [
      { en: 'high', ipa: '/haɪ/', cn: '高的' }, { en: 'night', ipa: '/naɪt/', cn: '夜晚' },
      { en: 'light', ipa: '/laɪt/', cn: '灯' }, { en: 'right', ipa: '/raɪt/', cn: '右边' } ] },
    { family: 'oa', vowel: 'oa', sound: '/oʊ/', words: [
      { en: 'boat', ipa: '/boʊt/', cn: '船' }, { en: 'coat', ipa: '/koʊt/', cn: '外套' },
      { en: 'road', ipa: '/roʊd/', cn: '路' }, { en: 'goat', ipa: '/ɡoʊt/', cn: '山羊' } ] },
    { family: 'ow', vowel: 'ow', sound: '/aʊ/', words: [
      { en: 'cow', ipa: '/kaʊ/', cn: '奶牛' }, { en: 'owl', ipa: '/aʊl/', cn: '猫头鹰' },
      { en: 'house', ipa: '/haʊs/', cn: '房子' }, { en: 'mouth', ipa: '/maʊθ/', cn: '嘴巴' } ] }
  ],

  /* ========================================================
   * Level 4: Consonant Blends — 辅音连缀 + 辅音组合
   * ======================================================== */
  book4: [
    // 前缀连缀 bl/cl/fl/gl/pl/sl
    { family: 'bl', vowel: '-', sound: '/bl/', words: [
      { en: 'blue', ipa: '/bluː/', cn: '蓝色' }, { en: 'block', ipa: '/blɒk/', cn: '积木' },
      { en: 'blow', ipa: '/bloʊ/', cn: '吹' }, { en: 'black', ipa: '/blæk/', cn: '黑色' } ] },
    { family: 'cl', vowel: '-', sound: '/kl/', words: [
      { en: 'clap', ipa: '/klæp/', cn: '拍手' }, { en: 'class', ipa: '/klɑːs/', cn: '班级' },
      { en: 'clock', ipa: '/klɒk/', cn: '时钟' }, { en: 'cloud', ipa: '/klaʊd/', cn: '云' } ] },
    { family: 'fl', vowel: '-', sound: '/fl/', words: [
      { en: 'flag', ipa: '/flæɡ/', cn: '旗帜' }, { en: 'fly', ipa: '/flaɪ/', cn: '飞' },
      { en: 'flower', ipa: '/ˈflaʊ.ər/', cn: '花' }, { en: 'floor', ipa: '/flɔːr/', cn: '地板' } ] },
    { family: 'pl', vowel: '-', sound: '/pl/', words: [
      { en: 'play', ipa: '/pleɪ/', cn: '玩' }, { en: 'plate', ipa: '/pleɪt/', cn: '盘子' },
      { en: 'plane', ipa: '/pleɪn/', cn: '飞机' }, { en: 'plus', ipa: '/plʌs/', cn: '加' } ] },
    { family: 'sl', vowel: '-', sound: '/sl/', words: [
      { en: 'sleep', ipa: '/sliːp/', cn: '睡觉' }, { en: 'slow', ipa: '/sloʊ/', cn: '慢的' },
      { en: 'slide', ipa: '/slaɪd/', cn: '滑梯' }, { en: 'slug', ipa: '/slʌɡ/', cn: '蛞蝓' } ] },
    // br/cr/dr/fr/gr/pr/tr
    { family: 'br', vowel: '-', sound: '/br/', words: [
      { en: 'bread', ipa: '/bred/', cn: '面包' }, { en: 'brown', ipa: '/braʊn/', cn: '棕色' },
      { en: 'brush', ipa: '/brʌʃ/', cn: '刷子' }, { en: 'brick', ipa: '/brɪk/', cn: '砖' } ] },
    { family: 'cr', vowel: '-', sound: '/kr/', words: [
      { en: 'crab', ipa: '/kræb/', cn: '螃蟹' }, { en: 'cry', ipa: '/kraɪ/', cn: '哭' },
      { en: 'crow', ipa: '/kroʊ/', cn: '乌鸦' }, { en: 'cream', ipa: '/kriːm/', cn: '奶油' } ] },
    { family: 'dr', vowel: '-', sound: '/dr/', words: [
      { en: 'drink', ipa: '/drɪŋk/', cn: '喝' }, { en: 'drum', ipa: '/drʌm/', cn: '鼓' },
      { en: 'dress', ipa: '/dres/', cn: '裙子' }, { en: 'drive', ipa: '/draɪv/', cn: '驾驶' } ] },
    { family: 'fr', vowel: '-', sound: '/fr/', words: [
      { en: 'frog', ipa: '/frɒɡ/', cn: '青蛙' }, { en: 'fruit', ipa: '/fruːt/', cn: '水果' },
      { en: 'free', ipa: '/friː/', cn: '自由的' }, { en: 'friend', ipa: '/frend/', cn: '朋友' } ] },
    { family: 'gr', vowel: '-', sound: '/ɡr/', words: [
      { en: 'green', ipa: '/ɡriːn/', cn: '绿色' }, { en: 'grass', ipa: '/ɡrɑːs/', cn: '草' },
      { en: 'grow', ipa: '/ɡroʊ/', cn: '生长' }, { en: 'grape', ipa: '/ɡreɪp/', cn: '葡萄' } ] },
    { family: 'tr', vowel: '-', sound: '/tr/', words: [
      { en: 'tree', ipa: '/triː/', cn: '树' }, { en: 'train', ipa: '/treɪn/', cn: '火车' },
      { en: 'truck', ipa: '/trʌk/', cn: '卡车' }, { en: 'try', ipa: '/traɪ/', cn: '尝试' } ] },
    // 后缀连缀 st/sp/sk/sw
    { family: 'st', vowel: '-', sound: '/st/', words: [
      { en: 'star', ipa: '/stɑːr/', cn: '星星' }, { en: 'stop', ipa: '/stɒp/', cn: '停' },
      { en: 'stick', ipa: '/stɪk/', cn: '棍子' }, { en: 'store', ipa: '/stɔːr/', cn: '商店' } ] },
    { family: 'sp', vowel: '-', sound: '/sp/', words: [
      { en: 'spin', ipa: '/spɪn/', cn: '旋转' }, { en: 'spot', ipa: '/spɒt/', cn: '斑点' },
      { en: 'spoon', ipa: '/spuːn/', cn: '勺子' }, { en: 'spell', ipa: '/spel/', cn: '拼写' } ] },
    { family: 'sk', vowel: '-', sound: '/sk/', words: [
      { en: 'sky', ipa: '/skaɪ/', cn: '天空' }, { en: 'skip', ipa: '/skɪp/', cn: '跳' },
      { en: 'skirt', ipa: '/skɜːt/', cn: '裙子' }, { en: 'mask', ipa: '/mɑːsk/', cn: '面具' } ] },
    // 辅音组合 ch/sh/th/wh/ng/nk
    { family: 'ch', vowel: '-', sound: '/tʃ/', words: [
      { en: 'chair', ipa: '/tʃeər/', cn: '椅子' }, { en: 'cheese', ipa: '/tʃiːz/', cn: '奶酪' },
      { en: 'chick', ipa: '/tʃɪk/', cn: '小鸡' }, { en: 'chop', ipa: '/tʃɒp/', cn: '砍' } ] },
    { family: 'sh', vowel: '-', sound: '/ʃ/', words: [
      { en: 'ship', ipa: '/ʃɪp/', cn: '船' }, { en: 'fish', ipa: '/fɪʃ/', cn: '鱼' },
      { en: 'shell', ipa: '/ʃel/', cn: '贝壳' }, { en: 'shop', ipa: '/ʃɒp/', cn: '商店' } ] },
    { family: 'th', vowel: '-', sound: '/θ/', words: [
      { en: 'thin', ipa: '/θɪn/', cn: '瘦的' }, { en: 'three', ipa: '/θriː/', cn: '三' },
      { en: 'thumb', ipa: '/θʌm/', cn: '拇指' }, { en: 'mouth', ipa: '/maʊθ/', cn: '嘴巴' } ] },
    { family: 'ng', vowel: '-', sound: '/ŋ/', words: [
      { en: 'ring', ipa: '/rɪŋ/', cn: '戒指' }, { en: 'king', ipa: '/kɪŋ/', cn: '国王' },
      { en: 'sing', ipa: '/sɪŋ/', cn: '唱歌' }, { en: 'wing', ipa: '/wɪŋ/', cn: '翅膀' } ] },
    { family: 'nk', vowel: '-', sound: '/ŋk/', words: [
      { en: 'pink', ipa: '/pɪŋk/', cn: '粉色' }, { en: 'drink', ipa: '/drɪŋk/', cn: '喝' },
      { en: 'sink', ipa: '/sɪŋk/', cn: '水槽' }, { en: 'bank', ipa: '/bæŋk/', cn: '银行' } ] }
  ],

  /* ========================================================
   * Level 5: R-Controlled & More — R控制元音 + 双元音 + 静音字母
   * ======================================================== */
  book5: [
    // R 控制元音
    { family: 'ar', vowel: 'ar', sound: '/ɑːr/', words: [
      { en: 'car', ipa: '/kɑːr/', cn: '汽车' }, { en: 'star', ipa: '/stɑːr/', cn: '星星' },
      { en: 'park', ipa: '/pɑːrk/', cn: '公园' }, { en: 'farm', ipa: '/fɑːrm/', cn: '农场' } ] },
    { family: 'er', vowel: 'er', sound: '/ər/', words: [
      { en: 'her', ipa: '/hər/', cn: '她的' }, { en: 'tiger', ipa: '/ˈtaɪ.ɡər/', cn: '老虎' },
      { en: 'water', ipa: '/ˈwɔː.tər/', cn: '水' }, { en: 'dinner', ipa: '/ˈdɪn.ər/', cn: '晚餐' } ] },
    { family: 'ir', vowel: 'ir', sound: '/ər/', words: [
      { en: 'bird', ipa: '/bərd/', cn: '鸟' }, { en: 'girl', ipa: '/ɡərl/', cn: '女孩' },
      { en: 'shirt', ipa: '/ʃərt/', cn: '衬衫' }, { en: 'skirt', ipa: '/skərt/', cn: '裙子' } ] },
    { family: 'or', vowel: 'or', sound: '/ɔːr/', words: [
      { en: 'corn', ipa: '/kɔːrn/', cn: '玉米' }, { en: 'fork', ipa: '/fɔːrk/', cn: '叉子' },
      { en: 'horse', ipa: '/hɔːrs/', cn: '马' }, { en: 'morning', ipa: '/ˈmɔːr.nɪŋ/', cn: '早晨' } ] },
    { family: 'ur', vowel: 'ur', sound: '/ər/', words: [
      { en: 'nurse', ipa: '/nərs/', cn: '护士' }, { en: 'turtle', ipa: '/ˈtər.təl/', cn: '乌龟' },
      { en: 'turn', ipa: '/tərn/', cn: '转' }, { en: 'purple', ipa: '/ˈpər.pəl/', cn: '紫色' } ] },
    // 双元音
    { family: 'ou', vowel: 'ou', sound: '/aʊ/', words: [
      { en: 'house', ipa: '/haʊs/', cn: '房子' }, { en: 'mouse', ipa: '/maʊs/', cn: '老鼠' },
      { en: 'cloud', ipa: '/klaʊd/', cn: '云' }, { en: 'out', ipa: '/aʊt/', cn: '外面' } ] },
    { family: 'ow', vowel: 'ow', sound: '/aʊ/', words: [
      { en: 'cow', ipa: '/kaʊ/', cn: '奶牛' }, { en: 'owl', ipa: '/aʊl/', cn: '猫头鹰' },
      { en: 'brown', ipa: '/braʊn/', cn: '棕色' }, { en: 'clown', ipa: '/klaʊn/', cn: '小丑' } ] },
    { family: 'oi', vowel: 'oi', sound: '/ɔɪ/', words: [
      { en: 'oil', ipa: '/ɔɪl/', cn: '油' }, { en: 'coin', ipa: '/kɔɪn/', cn: '硬币' },
      { en: 'boil', ipa: '/bɔɪl/', cn: '煮' }, { en: 'soil', ipa: '/sɔɪl/', cn: '土壤' } ] },
    { family: 'oy', vowel: 'oy', sound: '/ɔɪ/', words: [
      { en: 'boy', ipa: '/bɔɪ/', cn: '男孩' }, { en: 'toy', ipa: '/tɔɪ/', cn: '玩具' },
      { en: 'joy', ipa: '/dʒɔɪ/', cn: '快乐' }, { en: 'enjoy', ipa: '/ɪnˈdʒɔɪ/', cn: '享受' } ] },
    { family: 'au', vowel: 'au', sound: '/ɔː/', words: [
      { en: 'autumn', ipa: '/ˈɔː.təm/', cn: '秋天' }, { en: 'August', ipa: '/ˈɔː.ɡəst/', cn: '八月' },
      { en: 'sauce', ipa: '/sɔːs/', cn: '酱汁' }, { en: 'caught', ipa: '/kɔːt/', cn: '抓住' } ] },
    { family: 'aw', vowel: 'aw', sound: '/ɔː/', words: [
      { en: 'saw', ipa: '/sɔː/', cn: '锯子' }, { en: 'law', ipa: '/lɔː/', cn: '法律' },
      { en: 'draw', ipa: '/drɔː/', cn: '画' }, { en: 'straw', ipa: '/strɔː/', cn: '吸管' } ] },
    // 静音字母
    { family: 'silent-k', vowel: '-', sound: '/n/', words: [
      { en: 'knee', ipa: '/niː/', cn: '膝盖' }, { en: 'knife', ipa: '/naɪf/', cn: '刀' },
      { en: 'knock', ipa: '/nɒk/', cn: '敲' }, { en: 'know', ipa: '/noʊ/', cn: '知道' } ] },
    { family: 'silent-w', vowel: '-', sound: '/r/', words: [
      { en: 'write', ipa: '/raɪt/', cn: '写' }, { en: 'wrist', ipa: '/rɪst/', cn: '手腕' },
      { en: 'wrong', ipa: '/rɒŋ/', cn: '错的' }, { en: 'wrap', ipa: '/ræp/', cn: '包裹' } ] },
    { family: 'silent-b', vowel: '-', sound: '/m/', words: [
      { en: 'lamb', ipa: '/læm/', cn: '小羊' }, { en: 'climb', ipa: '/klaɪm/', cn: '爬' },
      { en: 'thumb', ipa: '/θʌm/', cn: '拇指' }, { en: 'comb', ipa: '/koʊm/', cn: '梳子' } ] }
  ],

  /* ========================================================
   * 配套资源库（7 大模块之"配套资源库"）
   * ======================================================== */
  resources: {
    /* 外部歌谣视频 — 真实 YouTube 搜索链接，可跳转观看 */
    songs: [
      { level: 1, title: 'Phonics Song 2', cn: '字母发音歌', source: 'Super Simple Songs',
        url: 'https://www.youtube.com/results?search_query=super+simple+songs+phonics+song+2',
        desc: '每个字母配动物图片和发音，经典零基础入门歌曲' },
      { level: 1, title: 'ABC Song', cn: '字母歌', source: 'Super Simple Songs',
        url: 'https://www.youtube.com/results?search_query=super+simple+songs+abc+song',
        desc: '经典 ABC 字母歌，慢速版适合跟唱' },
      { level: 1, title: 'Letter Sound Song', cn: '字母音歌', source: 'Jack Hartmann',
        url: 'https://www.youtube.com/results?search_query=jack+hartmann+letter+sounds',
        desc: '26个字母发音歌曲，配合动作' },
      { level: 2, title: 'Short Vowel Song', cn: '短元音歌', source: 'Jack Hartmann',
        url: 'https://www.youtube.com/results?search_query=jack+hartmann+short+vowel+song',
        desc: '5个短元音 a/e/i/o/u 的发音歌曲' },
      { level: 2, title: 'CVC Word Song', cn: '拼读词歌', source: 'Have Fun Teaching',
        url: 'https://www.youtube.com/results?search_query=cvc+words+song+kindergarten',
        desc: 'CVC 拼读练习歌曲，搭配词族学习' },
      { level: 2, title: 'Word Family Song', cn: '词族歌', source: 'Jack Hartmann',
        url: 'https://www.youtube.com/results?search_query=jack+hartmann+word+family+song',
        desc: '-at/-en/-ig/-ot/-ug 词族发音练习' },
      { level: 3, title: 'Magic E Song', cn: '魔法E歌', source: 'Jack Hartmann',
        url: 'https://www.youtube.com/results?search_query=magic+e+song+jack+hartmann',
        desc: 'Magic e 规则歌曲，让元音说出自己的名字' },
      { level: 3, title: 'Vowel Team Song', cn: '元音组合歌', source: 'Have Fun Teaching',
        url: 'https://www.youtube.com/results?search_query=vowel+team+song+ee+ea+ai+ay',
        desc: 'ee/ea/ai/ay 等元音组合发音歌曲' },
      { level: 3, title: 'Long Vowel Song', cn: '长元音歌', source: 'Jack Hartmann',
        url: 'https://www.youtube.com/results?search_query=jack+hartmann+long+vowel+song',
        desc: '长元音发音规律歌曲' },
      { level: 4, title: 'Consonant Blend Song', cn: '辅音连缀歌', source: 'Jack Hartmann',
        url: 'https://www.youtube.com/results?search_query=consonant+blends+song+jack+hartmann',
        desc: 'bl/cr/st 等辅音连缀发音歌曲' },
      { level: 4, title: 'Digraph Song (ch sh th)', cn: '辅音组合歌', source: 'Have Fun Teaching',
        url: 'https://www.youtube.com/results?search_query=digraph+song+ch+sh+th+kids',
        desc: 'ch/sh/th 辅音组合发音歌曲' },
      { level: 4, title: 'Blends Chant', cn: '连缀说唱', source: 'Jack Hartmann',
        url: 'https://www.youtube.com/results?search_query=consonant+blends+chant+kids',
        desc: '辅音连缀节奏说唱练习' },
      { level: 5, title: 'Bossy R Song', cn: 'R控制元音歌', source: 'Jack Hartmann',
        url: 'https://www.youtube.com/results?search_query=bossy+r+song+ar+er+ir+or+ur',
        desc: 'ar/er/ir/or/ur R控制元音歌曲' },
      { level: 5, title: 'Diphthong Song', cn: '双元音歌', source: 'Have Fun Teaching',
        url: 'https://www.youtube.com/results?search_query=diphthong+song+ou+ow+oi+oy',
        desc: 'ou/ow/oi/oy 双元音发音歌曲' },
      { level: 5, title: 'Silent Letter Song', cn: '静音字母歌', source: 'Jack Hartmann',
        url: 'https://www.youtube.com/results?search_query=silent+letters+song+kids',
        desc: 'kn/wr/mb 等静音字母单词歌曲' }
    ],
    readers: [
      'OPW Book 1 Reader: The Alphabet',
      'OPW Book 2 Reader: Short Vowels',
      'OPW Book 3 Reader: Long Vowels',
      'OPW Book 4 Reader: Consonant Blends',
      'OPW Book 5 Reader: R-Controlled & More'
    ],
    flashcards: '共 5 级闪卡，每级含字母/音标/例词卡，可在"词汇练习"中翻看'
  },

  /* ---------- 家居可兑换物品 ---------- */
  furniture: [
    { id: 'sofa',  name: '沙发', cost: 80,  emoji: '🛋️', w: 38, h: 22, x: 31, y: 62 },
    { id: 'bed',   name: '床',   cost: 120, emoji: '🛏️', w: 30, h: 24, x: 8,  y: 60 },
    { id: 'table', name: '茶几', cost: 50,  emoji: '🪑', w: 16, h: 16, x: 60, y: 70 },
    { id: 'cup',   name: '杯子', cost: 20,  emoji: '☕', w: 9,  h: 11, x: 78, y: 74 },
    { id: 'lamp',  name: '台灯', cost: 60,  emoji: '💡', w: 12, h: 14, x: 48, y: 66 },
    { id: 'plant', name: '盆栽', cost: 40,  emoji: '🪴', w: 14, h: 16, x: 70, y: 58 },
    { id: 'tv',    name: '电视', cost: 150, emoji: '📺', w: 24, h: 18, x: 38, y: 40 },
    { id: 'rug',   name: '地毯', cost: 100, emoji: '🟫', w: 44, h: 16, x: 28, y: 80 }
  ]
};
