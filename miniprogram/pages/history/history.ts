Page({
  data: {
    isShown: true,
  },
  onShow() {
    this.setData({ isShown: false });
    this.setData({ isShown: true });
  },
});
