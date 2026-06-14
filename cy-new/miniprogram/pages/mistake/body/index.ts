import { MistakeData } from "../../../utils/type";
import { navigateToWordCards } from "../../../utils/util";

Component({
  data: {
    mistake: new Array<MistakeData>(),
  },

  // 组件生命周期
  lifetimes: {
    // 组件挂载时执行
    attached() {
      const app = getApp(); // 获取小程序实例
      // 从全局数据初始化收藏数据
      this.setData({ mistake: app.globalData.mistake.list });
    },
  },

  methods: {
    itemTapHandle(e: { currentTarget: { dataset: { target: number } } }) {
      navigateToWordCards(
        "",
        this.data.mistake.map((x) => x[1][1]),
        e.currentTarget.dataset.target,
      );
    },

    clearHandle() {
      const app = getApp();
      app.globalData.mistake.list = [];
      this.setData({ mistake: app.globalData.mistake.list });
    },
  },
});
