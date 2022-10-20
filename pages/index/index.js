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
  handleGetIdCardInfo() {
    // wx.navigateTo({
    //   url: 'pages/getIdCardInfo/getIdCardInfo',
    // })
  },
  onShow() {
  },
})