import { GameLevelData, WordCard } from "./utils/type";
import { defaultGlobalData } from "./utils/util";

App({
  tempData: {
    wordCards: {
      cardsTitle: "",
      cards: [],
      index: 0,
      mode: 0,
    },
    wordGame: {
      flag: false,
      levels: [],
    },
  },
  globalData: JSON.parse(defaultGlobalData),
  onLaunch() {},
  onShow() {
    var savedData = wx.getStorageSync("globalData");
    if (savedData) {
      this.globalData = savedData;
    }
  },
  onHide() {
    wx.setStorageSync("globalData", this.globalData);
  },
});