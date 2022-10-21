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
  handleFaceSignInFront() {
    wx.navigateTo({
      url: '/pages/faceSignIn/faceSignIn?cameraPosition=front',
    })
  },
  handleFaceSignInVkFront() {
    wx.navigateTo({
      url: '/pages/faceSignInVk/faceSignInVk?cameraPosition=front',
    })
  },
  handleGetTextFromImg() {
    wx.navigateTo({
      url: '/pages/getTextFromImg/getTextFromImg',
    })
  },
  handleGetPhoneNumber() {
    wx.navigateTo({
      url: '/pages/getPhoneNumber/getPhoneNumber',
    })
  },
  onShow() {
  },
})