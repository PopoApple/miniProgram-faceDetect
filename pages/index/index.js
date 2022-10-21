Page({
  data: {
  },
  handleFaceSignIn() {
    wx.navigateTo({
      url: '/pages/faceSignIn/faceSignIn',
    })
  },
  handleFaceSignInVk() {
    wx.navigateTo({
      url: '/pages/faceSignInVk/faceSignInVk',
    })
  },
  handleGetTextFromImg() {
    wx.navigateTo({
      url: '/pages/getTextFromImg/getTextFromImg',
    })
  },
  onShow() {
  },
})