Page({
  data: {
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
  session: null,
  frame: null,
  onLoad() {
  },
  onHide() {
    wx.stopFaceDetect()
    this.listener.stop()
  },
  onReady() {
    this.initVK()
  },
  initVK() {

      const session = this.session = wx.createVKSession({
          track: {
              // plane: {
              //     mode: 3
              // },
              face: {
                  mode: 2
              }
          },
          version: 'v1',
      })
      session.start(err => {
          if (err) return console.error('VK error: ', err)

          console.log('@@@@@@@@ VKSession.version', session.version)


          // 静态图片检测模式下，每调一次 detectFace 接口就会触发一次 updateAnchors 事件
          this.session.on('updateAnchors', anchors => {
            console.log('updateAnchors ----', anchors, anchors.length)

            // anchors.forEach(anchor => {
            //   console.log('anchor.points ----', anchor.points)
            //   console.log('anchor.origin ----', anchor.origin)
            //   console.log('anchor.size ----', anchor.size)
            // })

            if (this.data.modalShow) {
              return
            }
            // 可信度判断
            if (!this.passFlag) {
              if (this.nCounter > 20) {
                console.log('##########################################################################')
                this.passFlag = true
                const { origin, size } = anchors[0]
                console.log(size.width, size.height, origin.x, origin.y)
                console.log(this.data.frameWidth, this.data.frameHeight)
                this.setData({
                  faceWidth: size.width * this.data.frameWidth,
                  faceHeight: size.height * this.data.frameHeight,
                })
                this.faceX = origin.x * this.data.frameWidth
                this.faceY = origin.y * this.data.frameHeight
                //let f = frame
                //setTimeout(() => {
                  this.canvasPutImageData(this.frame)
                //}, 200)
              } else {
                this.nCounter++
              }
            }

          })

          // session.on('updateAnchors', anchors => {
          //     console.log('updateAnchors ----', anchors)
          //     this.data.anchor2DList = []
          //     // 手动传入图像的时候用dom画点和框就行
          //     this.setData({
          //         anchor2DList: anchors.map(anchor => ({
          //             points: anchor.points,
          //             origin: anchor.origin,
          //             size: anchor.size
          //         })),
          //     })
          // })
      })
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
    this.VkSession = wx.createVKSession({
      track: {
        face: { mode: 2 } // mode: 1 - 使用摄像头；2 - 手动传入图像
      },
      version: 'v1'
    })// 识别初始化
    this.listener = this.ctx.onCameraFrame((frame) => {
      console.log('onCameraFrame ----', frame)
      if (!this.data.frameWidth && !this.data.frameHeight) {
        this.setData({
          frameWidth: frame.width,
          frameHeight: frame.height,
        })
      }

      console.log('frame.data ----', frame.data)
      this.frame = frame
      this.VkSession.detectFace({
        frameBuffer: frame.data, // 图片 ArrayBuffer 数据。人脸图像像素点数据，每四项表示一个像素点的 RGBA
        width: frame.width, // 图像宽度
        height: frame.height, // 图像高度
        scoreThreshold: 0.8, // 评分阈值
        sourceType: 1,
        modelMode: 1,
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
