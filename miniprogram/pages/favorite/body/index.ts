// 导入相关模块和类型
import { Message } from "tdesign-miniprogram"; // 引入UI组件库的消息提示组件
import { FavoriteMetadata, WordCard } from "../../../utils/type"; // 引入收藏元数据和单词卡片类型定义
import {
  FavoriteUtil, // 收藏工具类
  navigateToWordCards, // 导航到单词卡片页
  UserCardUtil, // 用户卡片工具类 - 新增：用于管理用户自定义卡片
  WordIndexUtil, // 单词索引工具类
} from "../../../utils/util";
import { wordListTitle } from "../../../utils/word_list"; // 单词列表标题

// 定义收藏页面的小程序组件
Component({
  // 组件数据
  data: {
    wordListTitle: wordListTitle, // 单词列表标题数组
    favorite: new Array<[string, FavoriteMetadata]>(), // 完整的收藏数据，数组元素为[索引编码, 收藏元数据]
    favoriteDisplay: new Array<[string, FavoriteMetadata]>(), // 当前显示的收藏数据（根据筛选条件过滤）
    cardsDisplay: new Array<WordCard>(), // 当前显示的收藏对应的单词卡片数组
    tabOptions: ["全部", ...wordListTitle], // 选项卡选项：全部 + 各单词列表名称
    tabIndex: 0, // 当前选中的选项卡索引（0表示"全部"）
    isShowPopup: false, // 是否显示保存弹窗
    saveName: "", // 保存卡片时的名称
  },

  // 组件生命周期
  lifetimes: {
    // 组件挂载时执行
    attached() {
      const app = getApp(); // 获取小程序实例
      // 从全局数据初始化收藏数据
      this.setData({ favorite: app.globalData.memorize.favorite });
    },
  },

  // 组件方法
  methods: {
    // 选项卡切换处理函数
    tabChangeHandle(e: { detail: { value: number } }) {
      // 更新当前选中的选项卡索引
      this.setData({ tabIndex: e.detail.value });
    },

    // 收藏项点击处理函数 - 进入单词卡片学习页面
    itemTapHandle(e: { currentTarget: { dataset: { index: number } } }) {
      // 将当前显示的收藏数据转换为单词卡片数组
      const cards = FavoriteUtil.toWordCards(this.data.favoriteDisplay);
      // 导航到单词卡片页面
      navigateToWordCards(
        `${this.data.tabOptions[this.data.tabIndex]}收藏`, // 页面标题，如"全部收藏"或"四级核心收藏"
        cards, // 单词卡片数据
        e.currentTarget.dataset.index, // 起始学习索引
        0, // 学习模式标识
      );
    },

    // 收藏项删除处理函数
    itemDeleteHandle(e: { currentTarget: { dataset: { index: string } } }) {
      // 从收藏数组中移除指定索引的收藏项
      this.setData({
        favorite: FavoriteUtil.delete(
          WordIndexUtil.decode(e.currentTarget.dataset.index), // 解码索引参数为实际的单词索引
        ),
      });

      // 显示删除成功提示
      Message.success({
        context: this,
        offset: [90, 32], // 提示框位置偏移
        content: "取消收藏成功！",
        closeBtn: true, // 显示关闭按钮
      });
    },

    // 显示保存弹窗处理函数
    popupShowHandle() {
      this.setData({
        saveName: "未命名", // 默认保存名称
        isShowPopup: true, // 显示弹窗
      });
    },

    // 隐藏保存弹窗处理函数
    popupHideHandle() {
      this.setData({ isShowPopup: false });
    },

    // 保存名称输入变化处理函数
    saveNameChangeHandle(e: { detail: { value: string } }) {
      this.setData({ saveName: e.detail.value });
    },

    // 保存收藏为自定义卡片处理函数
    saveHandle() {
      UserCardUtil.add([
        this.data.saveName, // 卡片名称
        new Date().toLocaleDateString(), // 保存日期
        this.data.cardsDisplay, // 卡片数据
      ]);

      // 隐藏弹窗并显示保存成功提示
      this.popupHideHandle();
      Message.success({
        context: this,
        offset: [90, 32],
        content: "保存成功！",
        closeBtn: true,
      });
    },
  },

  // 数据观察器，监听数据变化并自动更新相关数据
  observers: {
    // 监听收藏数据变化
    favorite: function () {
      // 更新显示用的收藏数据
      if (this.data.tabIndex === 0) {
        // 选择"全部"时，显示所有收藏
        this.setData({ favoriteDisplay: this.data.favorite });
      } else {
        // 选择具体单词列表时，过滤出属于该列表的收藏
        const favoriteDisplay = this.data.favorite.filter(
          (v) => WordIndexUtil.decode(v[0])[0] === this.data.tabIndex - 1, // 解码索引，第一个元素为单词列表索引
        );
        this.setData({ favoriteDisplay: favoriteDisplay });
      }
    },

    // 监听选项卡索引变化
    tabIndex: function (x) {
      if (x === 0) {
        // 选择"全部"时，显示所有收藏
        this.setData({ favoriteDisplay: this.data.favorite });
      } else {
        // 选择具体单词列表时，过滤出属于该列表的收藏
        const favoriteDisplay = this.data.favorite.filter(
          (v) => WordIndexUtil.decode(v[0])[0] === x - 1, // 解码索引，第一个元素为单词列表索引
        );
        this.setData({ favoriteDisplay: favoriteDisplay });
      }
    },

    // 监听显示收藏数据变化
    favoriteDisplay: function (x) {
      // 当显示收藏数据变化时，更新对应的单词卡片数组
      this.setData({
        cardsDisplay: FavoriteUtil.toWordCards(x),
      });
    },
  },
});
