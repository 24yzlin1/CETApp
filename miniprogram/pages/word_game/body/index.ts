// 导入相关模块和类型
import { Message } from "tdesign-miniprogram"; // 引入UI组件库的消息提示组件
import { GameLevelData, MistakeData, WordCard } from "../../../utils/type"; // 引入单词卡片类型定义
import { playAudio, WordIndexUtil } from "../../../utils/util"; // 引入单词索引工具类

// 定义单词游戏页面组件
Component({
  // 组件数据
  data: {
    mode: 0,
    modeOptions: [
      { value: 0, label: "无尽模式" },
      { value: 1, label: "闯关模式" },
      { value: 2, label: "娱乐模式" },
    ],
    total: 0, // 游戏总关卡数
    cards: new Array<WordCard>(),
    levels: new Array<GameLevelData>(), // 所有关卡的数据数组
    levelCards: new Array<WordCard>(), // 所有关卡的正确答案卡片数组
    level: -1, // 当前关卡索引（-1表示未开始）
    chosenIndex: -1, // 玩家选择的选项索引
    isChosen: false, // 玩家是否已做出选择
    correctIndex: -1, // 当前关卡的正确答案索引
    isCorrect: false, // 玩家的选择是否正确
    correct: 0, // 答对的题目数量
    start: 0, // 游戏开始时间戳
    duration: 0, // 游戏进行时间（毫秒）
    isShowPopup: false, // 是否显示弹窗
  },

  // 组件生命周期
  lifetimes: {
    // 组件挂载时执行 - 初始化游戏数据
    attached() {
      const app = getApp(); // 获取小程序实例

      // 更新关卡数据
      this.setData({
        cards: app.tempData.wordGame.cards,
      });

      this.init();
    },
  },

  // 组件方法
  methods: {
    init() {
      const levels = generateGameLevels(this.data.cards);
      this.setData({
        levels: levels,
        levelCards: levels.map((x: GameLevelData) => x[1]), // 提取所有正确答案卡片
        total: levels.length,
      });
    },

    modeHandle() {
      this.setData({ isShowPopup: true });
    },

    // 进入下一关处理函数
    nextHandle() {
      // 如果是第一关，记录游戏开始时间
      if (this.data.level === -1) {
        this.setData({ start: new Date().getTime() });
      }

      // 进入下一关，并更新游戏进行时间
      this.setData({
        level: this.data.level + 1,
        duration: new Date().getTime() - this.data.start,
      });

      if (this.data.mode === 0) {
        this.init();
        this.setData({ level: 0 });
      }
    },

    // 玩家选择选项处理函数
    chooseHandle(e: { currentTarget: { dataset: { index: number } } }) {
      // 获取玩家选择的选项索引
      const chosenIndex = e.currentTarget.dataset.index;

      // 更新选择状态
      this.setData({
        chosenIndex: chosenIndex,
        isChosen: true,
        correctIndex: this.data.levels[this.data.level][2], // 当前关卡的正确答案索引
        isCorrect: chosenIndex == this.data.levels[this.data.level][2], // 判断选择是否正确
      });

      // 根据选择正确与否显示不同的消息提示
      if (this.data.isCorrect) {
        Message.success({
          context: this,
          offset: [90, 32],
          content: "恭喜，答对啦，继续保持哦！",
          closeBtn: true,
        });
      } else {
        Message.error({
          context: this,
          offset: [90, 32],
          content: "很可惜，这次没选对，再试试看吧！",
          closeBtn: true,
        });

        if (this.data.mode === 1) {
          const app = getApp();
          (app.globalData.mistake.list as MistakeData[]).push([
            this.data.levels[this.data.level],
            [
              new Date().toLocaleDateString(),
              this.data.levelCards[this.data.level],
            ],
          ]);
        }
      }

      // 进入下一关
      this.nextHandle();
    },

    playAudioHandle(e: { currentTarget: { dataset: { text: string } } }) {
      playAudio(e.currentTarget.dataset.text);
    },

    // 弹窗选项改变处理函数
    optionChangeHandle(e: { detail: { value: number } }) {
      // 更新弹窗当前选中的值
      this.setData({ mode: e.detail.value });

      // 显示修改成功提示
      Message.success({
        context: this,
        offset: [90, 32], // 提示框位置偏移
        content: "修改成功！",
        closeBtn: true, // 显示关闭按钮
      });

      // 隐藏弹窗
      this.popupHideHandle();
    },

    popupHideHandle() {
      this.setData({ isShowPopup: false });
    },
  },

  // 数据观察器，监听数据变化并自动更新相关数据
  observers: {
    // 监听关卡索引变化（进入下一关时）
    level: function () {
      // 如果上一关答对了，增加正确计数
      if (this.data.isCorrect) {
        this.setData({ correct: this.data.correct + 1 });
      }

      if (this.data.level < this.data.total) {
        playAudio(this.data.levels[this.data.level][1][1][0]);
      }

      // 重置选择状态，为新关卡做准备
      this.setData({
        isChosen: false,
        isCorrect: false,
      });
    },
  },
});

/**
 * 生成单个关卡的数据
 * @param cards - 单词卡片数组
 * @param optionsCount - 选项数量（默认为4）
 * @returns LevelData - 关卡数据，包含[正确答案索引编码，正确答案卡片，正确选项索引，选项数组]
 */
function generateGameLevel(
  cards: WordCard[],
  optionsCount: number = 4,
): GameLevelData {
  // 生成指定范围内的随机整数
  const random = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // 创建选项索引集合，确保不重复
  const optionsIndexSet = new Set<number>();
  while (optionsIndexSet.size < optionsCount) {
    optionsIndexSet.add(random(0, cards.length - 1));
  }

  // 将集合转换为数组
  const optionsIndex = Array.from(optionsIndexSet);

  // 获取选项对应的卡片
  const optionsCards = optionsIndex.map((x) => cards[x]);

  // 生成选项：从每个卡片的释义中随机选择一个释义
  const options = optionsCards.map((x) => {
    const meanings = x[1][2]; // 卡片的释义数组
    return meanings[random(0, meanings.length - 1)][1]; // 随机选择一个释义
  });

  // 随机选择一个作为正确答案
  const correctOption = random(0, optionsCount - 1);

  // 获取正确答案的索引编码和卡片
  const correctWordIndex = WordIndexUtil.encode(optionsCards[correctOption][0]);
  const correctWord = optionsCards[correctOption];

  // 返回关卡数据
  return [correctWordIndex, correctWord, correctOption, options];
}

function generateGameLevels(cards: WordCard[], batch: number = 10) {
  return Array.from({ length: batch }, (_) => generateGameLevel(cards));
}
