//import getBehavior from './behavior'
//import yuvBehavior from './yuvBehavior'

const NEAR = 0.001
const FAR = 1000

Page({
   // behaviors: [getBehavior()],
    data: {
        width: 1,
        height: 1,
        fps: 0,
        memory: 0,
        cpu: 0,

        faceImgUrl: '',
        faceImgWidth: 0,
        faceImgHeight: 0,
        faceImgOriginWidth: 0,
        faceImgOriginHeight: 0,
        theme: 'light',
    },
    onShow() {
        this.initVK()
    },
    // lifetimes: {
    //     /**
    //     * 生命周期函数--监听页面加载
    //     */
    //     detached() {
    //     console.log("页面detached")
    //     if (wx.offThemeChange) {
    //       wx.offThemeChange()
    //     }
    //     },
    //     ready() {
    //     console.log("页面准备完全")
    //     this.initVK()
    //       this.setData({
    //         theme: wx.getSystemInfoSync().theme || 'light'
    //       })
  
    //       if (wx.onThemeChange) {
    //         wx.onThemeChange(({theme}) => {
    //           this.setData({theme})
    //         })
    //       }
    //     },
    // },
 
        chooseMedia() {
            wx.chooseMedia({
                count: 1,
                mediaType: ['image'],
                success: res => {
                    console.log('chooseMedia res', res)
                    const imgUrl = res.tempFiles[0].tempFilePath
                    wx.getImageInfo({
                        src: imgUrl,
                        success: res => {
                            const fixWidth = 300
                            const {
                                width,
                                height
                            } = res
                            console.log('getImageInfo res', res)
                            this.setData({
                                faceImgUrl: imgUrl,
                                faceImgWidth: fixWidth,
                                faceImgHeight: (fixWidth / width) * height,
                                faceImgOriginWidth: width,
                                faceImgOriginHeight: height
                            })
                        },
                        fail: res => {
                            console.error(res)
                        }
                    })

                },
                fail: res => {
                    console.error(res)
                }
            })
        },
        init() {
          //  this.initGL()
        },
        render(frame) {
           
        },
        initVK() {
         

            const session = this.session = wx.createVKSession({
                track: {
                    // plane: {
                    //     mode: 3
                    // },
                    OCR: {
                      mode: 2
                    }
                },
                version: 'v1',
               // gl: this.gl
            })
            session.start(err => {
                if (err) return console.error('VK error: ', err)

                console.log('@@@@@@@@ VKSession.version', session.version)

                // const canvas = this.canvas

                // const calcSize = (width, height, pixelRatio) => {
                //     console.log(`canvas size: width = ${width} , height = ${height}`)
                //     this.canvas.width = width * pixelRatio / 2
                //     this.canvas.height = height * pixelRatio / 2
                //     this.setData({
                //         width,
                //         height,
                //     })
                // }

                session.on('resize', () => {
                    const info = wx.getSystemInfoSync()
                    calcSize(info.windowWidth, info.windowHeight * 0.8, info.pixelRatio)
                })

                session.on('addAnchors', anchors => {
                    console.log("anchor add")
                })
                session.on('updateAnchors', anchors => {
                    console.log('222 updateAnchors ----', anchors)
                    // 手动传入图像的时候用dom画点和框就行
                    this.setData({
                      textContentList: anchors.map(anchor => ({
                            text: anchor.text
                        })),
                    })
                })
                session.on('removeAnchors', anchors => {
                    console.log("anchor remove")
                })

                // 逐帧渲染
                // const onFrame = timestamp => {
                //     // let start = Date.now()
                //     const frame = session.getVKFrame(canvas.width, canvas.height)
                //     if (frame) {
                //         this.render(frame)
                //     }

                //     session.requestAnimationFrame(onFrame)
                // }
                // session.requestAnimationFrame(onFrame)
            })
        },
        async runOCR() {
            if (this.data.faceImgUrl) {
                const canvas = wx.createOffscreenCanvas({
                    type: '2d',
                    width: this.data.faceImgOriginWidth,
                    height: this.data.faceImgOriginHeight,
                })
                const context = canvas.getContext('2d')
                const img = canvas.createImage()
                await new Promise(resolve => {
                    img.onload = resolve
                    img.src = this.data.faceImgUrl
                })

                context.clearRect(0, 0, this.data.faceImgOriginWidth, this.data.faceImgOriginHeight)
                context.drawImage(img, 0, 0, this.data.faceImgOriginWidth, this.data.faceImgOriginHeight)

                this.imgData = context.getImageData(0, 0, this.data.faceImgOriginWidth, this.data.faceImgOriginHeight)

                console.log('[frameBuffer] --> ', this.imgData.data.buffer)
                console.log('this.session.runOCR', this.session.runOCR)
                console.log('width', this.data.faceImgOriginWidth)
                console.log('height', this.data.faceImgOriginHeight)
                this.session.runOCR({
                    frameBuffer: this.imgData.data.buffer,
                    width: this.data.faceImgOriginWidth,
                    height: this.data.faceImgOriginHeight,
                })
            }
        },
   
})