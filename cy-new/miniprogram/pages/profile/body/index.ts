// 导入相关模块和类型
import { Message } from "tdesign-miniprogram"; // 引入UI组件库的消息提示组件
import { wordListTitle } from "../../../utils/word_list"; // 引入单词列表标题
import { defaultGlobalData } from "../../../utils/util"; // 引入默认全局数据，用于重置功能

// 定义个人资料页面的小程序组件
Component({
  // 组件数据
  data: {
    wordListTitle: wordListTitle, // 单词列表标题数组
    popupValue: 0, // 弹窗当前选中的值
    // 弹窗选项配置：包含两个数组，第一个是单词列表选项，第二个是每组单词数量选项
    popupOptions: [
      // 单词列表选项：将wordListTitle转换为{value, label}格式
      wordListTitle.map((x, i) => {
        return { value: i, label: x };
      }),
      // 每组单词数量选项：固定10、15、20三个选项
      [10, 15, 20].map((x) => {
        return { value: x, label: `每组${x}个` };
      }),
    ],
    tapOptions: ["词汇表", "背诵计划"], // 点击选项标签：控制弹窗显示的内容类型
    tapIndex: 0, // 当前选中的标签索引（0:词汇表，1:背诵计划）
    avatarUrl: "", // 用户头像URL
    nickName: "", // 用户昵称
    llmUrl: "",
    llmKey: "",
    llmModel: "",
    listIndex: 0, // 当前选中的单词列表索引
    groupSize: 0, // 每组单词数量
    isShowPopup: false, // 是否显示弹窗
    resetCount: 5, // 重置学习进度需要的点击次数（防止误操作）
  },

  // 数据观察器，监听数据变化并自动同步到全局数据
  observers: {
    // 监听头像URL变化
    avatarUrl: function (x: string) {
      const app = getApp();
      app.globalData.user.avatarUrl = x; // 同步到全局数据
    },
    // 监听昵称变化
    nickName: function (x: string) {
      const app = getApp();
      app.globalData.user.nickName = x; // 同步到全局数据
    },
    llmUrl: function (x: string) {
      const app = getApp();
      app.globalData.user.llmUrl = x; // 同步到全局数据
    },
    llmKey: function (x: string) {
      const app = getApp();
      app.globalData.user.llmKey = x; // 同步到全局数据
    },
    llmModel: function (x: string) {
      const app = getApp();
      app.globalData.user.llmModel = x; // 同步到全局数据
    },
    // 监听单词列表索引变化
    listIndex: function (x: number) {
      const app = getApp();
      app.globalData.schedule.listIndex = x; // 同步到全局数据的学习计划中
    },
    // 监听每组单词数量变化
    groupSize: function (x: number) {
      const app = getApp();
      app.globalData.schedule.groupSize = x; // 同步到全局数据的学习计划中
    },
  },

  // 组件方法
  methods: {
    // 选择头像处理函数
    chooseAvatarHandle(e: { detail: { avatarUrl: any } }) {
      // 更新头像URL，观察器会自动同步到全局数据
      this.setData({ avatarUrl: e.detail.avatarUrl });
    },

    // 点击词汇表或背诵计划标签的处理函数
    tapListHandle(e: { currentTarget: { dataset: { target: number } } }) {
      const target = e.currentTarget.dataset.target; // 0:词汇表，1:背诵计划

      this.setData({
        tapIndex: target, // 更新当前选中的标签索引
        // 根据target确定弹窗默认值：target=0使用listIndex，target=1使用groupSize
        popupValue: [this.data.listIndex, this.data.groupSize][target],
        isShowPopup: true, // 显示弹窗
      });
    },

    // 弹窗选项改变处理函数
    optionChangeHandle(e: { detail: { value: number } }) {
      // 更新弹窗当前选中的值
      this.setData({ popupValue: e.detail.value });

      // 根据当前标签类型更新对应的数据
      if (this.data.tapIndex === 0) {
        // 如果是词汇表标签，更新单词列表索引
        this.setData({ listIndex: this.data.popupValue });
      }

      if (this.data.tapIndex === 1) {
        // 如果是背诵计划标签，更新每组单词数量
        this.setData({ groupSize: this.data.popupValue });
      }

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

    // 昵称改变处理函数
    changeNickNameHandle(e: { detail: { value: string } }) {
      // 更新昵称，观察器会自动同步到全局数据
      this.setData({ nickName: e.detail.value });
    },

    changeLlmUrlHandle(e: { detail: { value: string } }) {
      this.setData({ llmUrl: e.detail.value });
    },

    changeLlmKeyHandle(e: { detail: { value: string } }) {
      this.setData({ llmKey: e.detail.value });
    },

    changeLlmModelHandle(e: { detail: { value: string } }) {
      this.setData({ llmModel: e.detail.value });
    },

    // 隐藏弹窗处理函数
    popupHideHandle() {
      this.setData({ isShowPopup: false });
    },

    // 重置学习进度处理函数（防止误操作，需要连续点击5次）
    async resetHandle() {
      // 减少重置计数
      this.setData({ resetCount: this.data.resetCount - 1 });

      if (this.data.resetCount !== 0) {
        // 如果还没点击够5次，显示提示信息
        Message.info({
          context: this,
          offset: [90, 32],
          content: `继续点击${this.data.resetCount}次以重置学习进度！`,
          closeBtn: true,
        });
      } else {
        // 点击够5次后，执行重置操作
        Message.success({
          context: this,
          offset: [90, 32],
          content: "学习进度重置成功！",
          closeBtn: true,
        });

        // 重置全局数据为默认值
        const app = getApp();
        app.globalData = JSON.parse(defaultGlobalData); // 使用默认全局数据覆盖

        // 等待500毫秒，让用户看到成功提示
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 重新启动小程序，返回到首页
        wx.reLaunch({ url: "/pages/index/index" });
      }
    },
  },

  // 组件生命周期
  lifetimes: {
    // 组件挂载时执行
    attached() {
      const app = getApp(); // 获取小程序实例

      // 从全局数据初始化组件数据
      this.setData({
        avatarUrl: app.globalData.user.avatarUrl, // 用户头像
        nickName: app.globalData.user.nickName, // 用户昵称
        listIndex: app.globalData.schedule.listIndex, // 单词列表索引
        groupSize: app.globalData.schedule.groupSize, // 每组单词数量
        llmUrl: app.globalData.user.llmUrl,
        llmKey: app.globalData.user.llmKey,
        llmModel: app.globalData.user.llmModel,
      });
    },
  },
});
