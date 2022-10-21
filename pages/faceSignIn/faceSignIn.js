Page({
  data: {
    cameraPosition: 'back',
    width: 0,
    height: 0,
    frameWidth: 0,
    frameHeight: 0,
    faceWidth: 0,
    faceHeight: 0,
    faceX: 0,
    faceY: 0,
    modalShow: false,
    imgSrc: 'https://conschina-oa-bucket.oss-cn-shenzhen.aliyuncs.com/mobileIcon/2022/06/08/8d49a624-6b1c-4f79-8939-00bf6f5334cc.png',
  },
  ctx: null,
  listener: null,
  passFlag: false,
  nCounter: 0,
  facePadding: 10,
  onLoad({ cameraPosition }) {
    console.log('cameraPosition ----', cameraPosition)
    if (cameraPosition) {
      this.setData({
        cameraPosition
      })
    }
  },
  onHide() {
    wx.stopFaceDetect()
    this.listener.stop()
  },
  onShow() {
    wx.getSystemInfo({
      //获取系统信息成功，将系统窗口的宽高赋给页面的宽高
      success: res =>  {
        console.log('wx.getSystemInfo success ----', res.windowWidth, res.windowHeight, res)
        this.setData({
          width: res.windowWidth,
          height: res.windowHeight,
        })
      }
    })
    this.ctx = wx.createCameraContext() // 获取相机实例
    console.log('ctx ----', this.ctx)
    wx.initFaceDetect({
      success: (res) => {
        console.log('wx.initFaceDetect success ----', res)
      },
      fail: (res) => {
        console.log('wx.initFaceDetect fail ----', res)
      }
    }) // 识别初始化
    this.listener = this.ctx.onCameraFrame((frame) => {
      console.log('onCameraFrame ----', frame)
      if (!this.data.frameWidth && !this.data.frameHeight) {
        this.setData({
          frameWidth: frame.width,
          frameHeight: frame.height,
        })
      }
      wx.faceDetect({ // 人脸识别
        frameBuffer: frame.data,
        width: frame.width,
        height: frame.height,
        enableConf: true,
        enableAngle: true,
        success: (res) => {
          console.log('wx.faceDetect success ----', res)
          if (this.data.modalShow) {
            return
          }
          // 可信度判断
          if (!this.passFlag) {
            if (this.nCounter > 20 && res.confArray.global > 0.9) {
              console.log('##########################################################################')
              console.log(res.detectRect)
              console.log(JSON.stringify(res))
              this.passFlag = true
              const { detectRect } = res
              const { height, width, originX, originY } = detectRect
              this.setData({
                faceWidth: width,
                faceHeight: height,
              })
              this.faceX = originX
              this.faceY = originY
              //let f = frame
              //setTimeout(() => {
                this.canvasPutImageData(frame)
              //}, 200)
            } else {
              res.confArray.global > 0.9 && this.nCounter++
            }
          }
        },
        fail: (res) => {
          //console.log('wx.faceDetect fail ----', res)
        }
      })


    })
    this.listener.start() // 监听数据帧
    // setTimeout(() => {
    //   this.passFlag = true
    // }, 2000)
  },
  // 生成图片上传人脸
  canvasPutImageData(frame) {
    console.log('canvasPutImageData frame ----', frame)
    console.log(this.faceX, this.faceY, this.data.faceWidth, this.data.faceHeight)
    let faceX = Math.max(0, this.faceX - this.facePadding)
    let faceY = Math.max(0, this.faceY - this.facePadding)
    let faceWidth = Math.min(this.data.faceWidth + this.facePadding * 2, this.data.frameWidth - faceX)
    let faceHeight = Math.min(this.data.faceHeight + this.facePadding * 2, this.data.frameHeight - faceY)
    console.log('faceX, faceY, faceWidth, faceHeight ----', faceX, faceY, faceWidth, faceHeight)
    wx.canvasPutImageData({
      canvasId: 'canvasDrawImage',
      x: 0,
      y: 0,
      width: this.data.frameWidth,
      height: this.data.frameHeight,
      data: new Uint8ClampedArray(frame.data),
      success: () => {
        console.log('wx.canvasPutImageData success ----')
        // 获取图片
        wx.canvasToTempFilePath({
          canvasId: 'canvasDrawImage',
          x: faceX,
          y: faceY,
          width: faceWidth,
          height: faceHeight,
          destWidth: faceWidth,
          destHeight: faceHeight,
          success: (res) => {
            console.log('wx.canvasToTempFilePath success ----', res, res.tempFilePath)
            this.setData({
              imgSrc: res.tempFilePath,
              modalShow: true,
            })
            // 上传图片
            // uploadFile(res.tempFilePath).then((uploadRes) => {
            //   wx.showNavigationBarLoading();
            //   wx.showLoading({
            //     title: '正在录入',
            //     mask: true
            //   })
            //   // 录入接口
            //   userFaceAdd({
            //     imageUrl: uploadRes.data.url,
            //     id: getApp().globalData.userInfo.id
            //   }).then(({
            //     data
            //   }) => {
            //     this.data.listener.stop()
            //     wx.stopFaceDetect() // 停止识别
            //     wx.hideNavigationBarLoading();
            //     wx.hideLoading()
            //     wx.showToast({
            //       title: '录入成功',
            //       icon: 'none',
            //       duration: 1500
            //     })
            //   }).catch(() => {
            //     wx.hideNavigationBarLoading();
            //     wx.hideLoading()
            //     wx.showToast({
            //       title: '录入失败，重新开始',
            //       icon: 'none',
            //       duration: 1500
            //     })
            //     this.data.passFlag = false
            //   })
            // }).catch(() => {
            //   this.data.passFlag = false
            // })
          },
          fail: (res) => {
            console.log('wx.canvasToTempFilePath fail ----', res)
            this.passFlag = false
          }
        })
      },
      fail: (res) => {
        console.log('wx.canvasPutImageData fail ----', res)
        this.passFlag = false
      }
    })
  },
  handleCameraError(e) {
    console.log('handleCameraError ----', e)
  },
  // handleBack() {
  //   wx.navigateBack()
  // },
  handleConfirm() {
    this.setData({
      modalShow: false,
    })
    setTimeout(() => {
      this.passFlag = false
      this.nCounter = 0
    }, 1000)
  },
  handlePreviewImg() {
    wx.previewImage({
      current: this.data.imgSrc, // 当前显示图片的 http 链接
      urls: [this.data.imgSrc] // 需要预览的图片 http 链接列表
    })
  },
})
