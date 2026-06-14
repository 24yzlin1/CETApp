import { Message } from "tdesign-miniprogram";

Page({
  data: {
    isLogin: false,
    isShown: true,
    loginButton: {
      content: "微信登录",
      variant: "base",
      icon: "logo-wechat-stroke",
    },
    errorMessage: "",
  },
  onShow() {
    this.setData({ isShown: false });
    this.setData({ isShown: true });

    const app = getApp();
    this.setData({ isLogin: app.globalData.user.loginCode !== "" });
  },
  async loginHandle() {
    let isSucceess = false;
    let errorMessage = "";
    let loginCode = "";

    await wx
      .login()
      .then((e) => {
        isSucceess = true;
        errorMessage = e.errMsg;
        loginCode = e.code;
      })
      .catch((e) => {
        isSucceess = false;
        errorMessage = e.errMsg;
      });

    if (isSucceess) {
      Message.success({
        context: this,
        offset: [90, 32],
        content: errorMessage,
        closeBtn: true,
      });

      const app = getApp();
      app.globalData.user.loginCode = loginCode;
      this.setData({ isLogin: true });
    } else {
      Message.error({
        context: this,
        offset: [90, 32],
        content: errorMessage,
        closeBtn: true,
      });
    }
  },
});
