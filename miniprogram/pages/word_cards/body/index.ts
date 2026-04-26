// 导入相关模块和类型
import { Message } from "tdesign-miniprogram"; // 引入UI组件库的消息提示组件
import { WordCard } from "../../../utils/type"; // 引入单词卡片类型定义
import { FavoriteUtil, playAudio, updateProgress } from "../../../utils/util"; // 引入收藏工具和进度更新函数

// 定义单词卡片学习页面的小程序组件
Component({
  // 组件数据
  data: {
    cardsTitle: "", // 卡片组标题（如"四级核心词汇"）
    cards: new Array<WordCard>(), // 当前学习的单词卡片数组
    index: 0, // 当前显示的卡片索引（0-based）
    mode: 0, // 学习模式标识（如0为学习模式，1为打卡模式等）
    total: 0, // 卡片总数
    title: "", // 页面标题（包含进度信息）
    lastDisabled: false, // 上一张按钮是否禁用（在第一张时禁用）
    nextDisabled: false, // 下一张按钮是否禁用（在最后一张时禁用）
    isEnd: false, // 是否已学习完所有卡片
    isFavorite: false, // 当前卡片是否已被收藏
    start: 0, // 开始学习时间戳（用于计算学习时长）
    duration: 0, // 学习持续时长（毫秒）
    isShowPopup: false, // 是否显示进度选择弹窗
    popupOptions: {}, // 弹窗选项数据，用于显示所有卡片的跳转列表
  },

  // 组件生命周期
  lifetimes: {
    // 组件挂载时执行 - 从临时数据初始化学习状态
    attached() {
      const app = getApp(); // 获取小程序实例
      // 从app.tempData中获取单词卡片相关数据
      this.setData({
        cardsTitle: app.tempData.wordCards.cardsTitle, // 卡片组标题
        cards: app.tempData.wordCards.cards, // 卡片数据
        index: app.tempData.wordCards.index, // 起始卡片索引
        mode: app.tempData.wordCards.mode, // 学习模式
        total: app.tempData.wordCards.cards.length, // 卡片总数
      });

      // 记录开始学习时间
      this.setData({ start: new Date().getTime() });
    },

    // 组件渲染完成时执行 - 初始化弹窗选项
    ready() {
      const app = getApp();
      // 将卡片数组转换为弹窗选项格式，用于显示跳转列表
      this.setData({
        popupOptions: app.tempData.wordCards.cards.map(
          (x: WordCard, i: number) => {
            return { value: i, label: x[1][0] }; // 使用单词作为标签
          },
        ),
      });
    },
  },

  // 数据观察器，监听数据变化并自动更新相关数据
  observers: {
    // 监听当前卡片索引变化
    index: function (x: number) {
      // 如果没有卡片数据，直接返回
      if (this.data.cards.length === 0) {
        return;
      }

      // 如果索引等于卡片总数（即已学完所有卡片）
      if (x === this.data.total) {
        // 获取最后一张卡片的索引信息，更新学习进度
        const index = this.data.cards[this.data.cards.length - 1][0];
        updateProgress([index[0], index[1] + 1]); // 将进度标记为完成
      } else {
        // 更新卡片导航状态和收藏状态
        this.setData({
          lastDisabled: x <= 0, // 在第一张时禁用"上一张"
          nextDisabled: x >= this.data.total - 1, // 在最后一张时禁用"下一张"
          isEnd: x >= this.data.total - 1, // 是否到达最后一张
          // 检查当前卡片是否在收藏列表中
          isFavorite: FavoriteUtil.is(
            this.data.cards[x][0], // 当前卡片的索引
          ),
          // 更新页面标题，显示进度信息
          title: `${this.data.cardsTitle} ${this.data.index + 1}/${
            this.data.total
          }`,
        });

        playAudio(this.data.cards[this.data.index][1][0]);
      }
    },

    // 监听收藏状态变化
    isFavorite: function (x: boolean) {
      if (x) {
        // 如果标记为收藏，将当前卡片添加到收藏列表
        FavoriteUtil.add(this.data.cards[this.data.index][0]);
      } else {
        // 如果取消收藏，从收藏列表中移除当前卡片
        FavoriteUtil.delete(this.data.cards[this.data.index][0]);
      }
    },
  },

  // 组件方法
  methods: {
    backHandle() {
      wx.navigateBack();
    },

    // 切换到上一张卡片
    lastHandle() {
      this.setData({ index: this.data.index - 1 });
    },

    // 切换到下一张卡片，并计算学习时长
    nextHandle() {
      this.setData({
        index: this.data.index + 1,
        duration: new Date().getTime() - this.data.start, // 更新学习时长
      });
    },

    // 通过进度弹窗跳转到指定卡片
    progressHandle(e: { detail: { value: number } }) {
      this.setData({ index: e.detail.value }); // 跳转到选中的卡片索引
      this.popupHideHandle(); // 隐藏弹窗
    },

    // 收藏/取消收藏当前卡片
    favoriteHandle() {
      this.setData({ isFavorite: !this.data.isFavorite }); // 切换收藏状态
      // 显示收藏/取消收藏成功的消息提示
      Message.success({
        context: this,
        offset: [90, 32],
        content: this.data.isFavorite ? "收藏成功！" : "取消收藏成功！",
        closeBtn: true,
      });
    },

    // 显示进度选择弹窗
    popupShowHandle() {
      this.setData({ isShowPopup: true });
    },

    // 隐藏进度选择弹窗
    popupHideHandle() {
      this.setData({ isShowPopup: false });
    },

    // 重新开始学习（回顾模式）
    reviewTapHandle() {
      // 重置学习状态，从第一张卡片重新开始
      this.setData({
        cardsTitle: "打卡回顾", // 更新标题
        index: 0, // 重置为第一张
        mode: 0, // 重置学习模式
      });
    },

    playAudioHandle(e: { currentTarget: { dataset: { text: string } } }) {
      playAudio(e.currentTarget.dataset.text);
    },
  },
});
