// 导入相关类型和工具函数
import { GameLevelData, WordCard } from "./utils/type"; // 导入单词卡片类型定义
import { defaultGlobalData } from "./utils/util"; // 导入默认全局数据

// 小程序应用实例定义
App({
  // 临时数据存储区，用于页面间传递数据，页面关闭后数据不会被持久化保存
  tempData: {
    // 单词卡片页面相关临时数据
    wordCards: {
      cardsTitle: "", // 卡片组标题（如"四级核心词汇"）
      cards: new Array<WordCard>(), // 单词卡片数据数组
      index: 0, // 当前显示的卡片索引
      mode: 0, // 学习模式标识（0:普通学习，1:打卡模式等）
    },
    // 单词游戏页面相关临时数据
    wordGame: {
      flag: false, // 游戏状态标志
      levels: new Array<GameLevelData>(), // 游戏使用的单词卡片数组
    },
  },

  // 全局数据存储区，存储需要持久化的应用数据
  // 使用JSON.parse将默认全局数据字符串转换为对象
  globalData: JSON.parse(defaultGlobalData),

  // 小程序初始化完成时触发，全局只触发一次
  onLaunch() {
    // 重定向到首页，确保用户进入小程序时首先看到首页
    // 使用redirectTo而不是navigateTo，确保关闭当前页面并跳转到新页面
    wx.redirectTo({ url: "/pages/index/index" });
  },

  // 小程序启动或从后台进入前台显示时触发
  onShow() {
    // 尝试从本地存储中读取已保存的全局数据
    // 如果有保存的数据，则使用保存的数据；否则使用默认的全局数据
    this.globalData = wx.getStorageSync("globalData")
      ? wx.getStorageSync("globalData") // 从本地存储读取数据
      : this.globalData; // 使用默认数据
  },

  // 小程序从前台进入后台时触发
  onHide() {
    // 将当前全局数据保存到本地存储，确保数据不丢失
    wx.setStorageSync("globalData", this.globalData);
  },
});
