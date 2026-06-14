// 导入相关模块和类型
import { HistoryData } from "../../../utils/type"; // 引入历史记录数据类型定义
import { getWordCards, navigateToWordCards } from "../../../utils/util"; // 引入获取单词卡片和导航函数
import { wordListTitle } from "../../../utils/word_list"; // 引入单词列表标题

// 定义历史记录页面的小程序组件
Component({
  // 组件数据
  data: {
    wordListTitle: wordListTitle, // 单词列表标题数组，用于显示列表名称
    history: new Array<HistoryData>(), // 历史记录数据数组，初始化为空数组
  },

  // 组件生命周期
  lifetimes: {
    // 组件挂载时执行
    attached() {
      const app = getApp(); // 获取小程序实例
      // 从全局数据初始化历史记录数据
      this.setData({
        history: app.globalData.memorize.history,
      });
    },
  },

  // 组件方法
  methods: {
    // 历史记录项点击处理函数
    itemTapHandle(e: { currentTarget: { dataset: any } }) {
      // 获取点击项的数据集（data-*属性值）
      const dataset = e.currentTarget.dataset;
      const listIndex = dataset.listIndex; // 单词列表索引
      const indexrange = dataset.indexrange; // 单词索引范围数组 [起始索引, 结束索引]

      // 导航到单词卡片页面进行复习
      navigateToWordCards(
        "打卡回顾", // 页面标题
        getWordCards(listIndex, indexrange[0], indexrange[1]), // 获取指定范围内的单词卡片
      );
    },
  },
});
