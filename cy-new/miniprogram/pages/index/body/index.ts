// 导入相关模块和类型
import { Message } from "tdesign-miniprogram"; // 引入UI组件库的消息提示组件
import { UserCardGroup } from "../../../utils/type"; // 引入单词卡片类型定义
import {
  getWordCards,
  isClockIn,
  navigateToWordCards,
  navigateToWordGame,
  UserCardUtil,
} from "../../../utils/util"; // 引入工具函数
import { wordListTitle } from "../../../utils/word_list"; // 引入单词列表标题

// 定义小程序组件
Component({
  // 组件数据
  data: {
    avatarUrl: "", // 用户头像URL
    nickName: "", // 用户昵称
    welcomeMessage: "", // 欢迎消息
    wordListTitle: wordListTitle, // 单词列表标题
    wordListIndex: 0, // 当前选中的单词列表索引
    userCardGroups: new Array<UserCardGroup>(), // 用户自定义的单词卡片数组，每个元素包含标题、描述和卡片数组
    isClockIn: false, // 今日是否已打卡
    listItems: [
      // 功能列表项
      ["chat-bubble", "与Agent对话"],
      ["data-error", "错题本"],
      ["history", "单词成长记"], // 图标类型和标题
      ["star", "宝藏单词库"],
      ["gamepad", "词义对对碰"],
    ],
    countDown: 0, // 倒计时时间（毫秒）
  },

  // 组件方法
  methods: {
    // 点击头像处理函数 - 跳转到个人资料页
    avatarTapHandle() {
      wx.navigateTo({ url: "/pages/profile/profile" });
    },

    // 打卡/预览按钮点击处理函数
    clockInTapHandle(e: { currentTarget: { dataset: { todo: number } } }) {
      const app = getApp(); // 获取小程序实例
      const progress = app.globalData.memorize.progress; // 获取记忆进度
      const groupSize = app.globalData.schedule.groupSize; // 获取每组单词数量

      // 根据进度获取当前需要学习的单词卡片
      const wordCards = getWordCards(
        this.data.wordListIndex,
        progress[this.data.wordListIndex],
        progress[this.data.wordListIndex] + groupSize,
      );

      // 导航到单词卡片页，根据todo参数决定是打卡还是预览模式
      // todo: 1表示打卡，其他值表示预览
      navigateToWordCards(
        e.currentTarget.dataset.todo === 1 ? "打卡" : "预览", // 页面标题
        wordCards, // 单词卡片数据
        0, // 起始索引
        e.currentTarget.dataset.todo, // 模式标识
      );
    },

    // 功能列表项点击处理函数
    itemTapHandle(e: { currentTarget: { dataset: { target: number } } }) {
      const target = e.currentTarget.dataset.target; // 获取点击项索引

      if (target === 0) {
        wx.navigateTo({ url: "/pages/agent/agent" });
      }

      if (target === 1) {
        wx.navigateTo({ url: "/pages/mistake/mistake" });
      }

      if (target === 2) {
        // 跳转到历史记录页
        wx.navigateTo({ url: "/pages/history/history" });
      }

      if (target === 3) {
        // 跳转到收藏页
        wx.navigateTo({ url: "/pages/favorite/favorite" });
      }

      if (target === 4) {
        // 跳转到单词游戏页，传递当前单词列表的所有卡片
        navigateToWordGame(getWordCards(this.data.wordListIndex));
      }
    },

    // 用户自定义卡片点击处理函数
    userCardGroupsTapHandle(e: {
      currentTarget: { dataset: { target: number } };
    }) {
      const target = e.currentTarget.dataset.target; // 获取点击的卡片索引
      // 跳转到单词卡片页，显示用户自定义的卡片
      navigateToWordCards(
        this.data.userCardGroups[target][0], // 卡片标题
        this.data.userCardGroups[target][2], // 卡片数据
      );
    },

    // 删除用户自定义卡片处理函数
    userCardGroupsDeleteHandle(e: {
      currentTarget: { dataset: { index: number } };
    }) {
      // 过滤掉要删除的卡片
      const userCardGroups = UserCardUtil.delete(e.currentTarget.dataset.index); // 更新数据

      // 更新全局数据中的用户卡片
      this.setData({ userCardGroups: userCardGroups });

      // 显示删除成功的消息提示
      Message.success({
        context: this,
        offset: [90, 32], // 消息提示位置偏移
        content: "删除成功！", // 提示内容
        closeBtn: true, // 显示关闭按钮
      });
    },

    // 内置卡片点击处理函数
    builtInCardsTapHandle(e: {
      currentTarget: { dataset: { target: number } };
    }) {
      const target = e.currentTarget.dataset.target; // 获取点击的卡片索引
      // 跳转到单词卡片页，显示内置的单词卡片
      navigateToWordCards(
        wordListTitle[target], // 单词列表标题
        getWordCards(target), // 获取对应列表的单词卡片
      );
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
        wordListIndex: app.globalData.schedule.listIndex, // 当前单词列表索引
        isClockIn: isClockIn(), // 检查今日是否已打卡
        userCardGroups: app.globalData.memorize.userCardGroups, // 用户自定义卡片
      });

      // 计算距离明天零点的倒计时
      const now = new Date(); // 当前时间
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // 明天零点
      );
      this.setData({ countDown: tomorrow.getTime() - now.getTime() }); // 设置倒计时毫秒数

      // 生成并设置欢迎消息
      this.setData({
        welcomeMessage: generateWelcomeMessage(
          this.data.nickName.length === 0 ? "用户" : this.data.nickName, // 如果昵称为空则使用"用户"
        ),
      });
    },
  },
});

// 生成欢迎消息的函数
function generateWelcomeMessage(name: string): string {
  const hour = new Date().getHours(); // 获取当前小时数
  let timeOfDay: string;

  // 根据小时数确定时间段
  if (hour >= 5 && hour < 9) {
    timeOfDay = "早上好";
  } else if (hour >= 9 && hour < 12) {
    timeOfDay = "上午好";
  } else if (hour >= 12 && hour < 14) {
    timeOfDay = "中午好";
  } else if (hour >= 14 && hour < 18) {
    timeOfDay = "下午好";
  } else if (hour >= 18 && hour < 22) {
    timeOfDay = "晚上好";
  } else {
    timeOfDay = "深夜好"; // 22点至次日5点
  }

  // 返回格式化的欢迎消息
  return `${name}，${timeOfDay}！`;
}
