// pages/edit/edit.js
const { $Toast } = require('../../lib/weApp_UI/base/index')
let app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    eventId: '',
    selfPhoto: '',
    iconSize: 36,
    actTitle: '',
    actTitleCopy: '',
    actDescribe: '',
    actDescribeCopy: '',
    headerLBtn: '返回',
    headerRBtn: '编辑',
    editting: false,
    startDate: '',
    endDate: '',
    actLocation: '',
    imgSrcList: [],
    imgSrcListOriginal: [],
    deletedImgs: [],
    previewUploadImgs: [],
    showCalLoading: false
  },

  /*
  * 自定义方法
  */

  /**
   * 组件的方法列表
   */
  methods: {
    delImgs(e) {
      let { imgid, imgsrc } = e.currentTarget.dataset;
      this.delSingleImg(imgid, imgsrc)
    },
    delSingleImg(i, imgS) {
      if (this.data.imgSrcList.length > 1) {
        this.data.imgSrcList.splice(i - 1, 1)
        this.setData({
          'imgSrcList': this.data.imgSrcList
        })
        // 判断删除的图片是原来存储过得还是新添加的
        if (this.data.imgSrcListOriginal.includes(imgS)) {
          // 删除了原本展示的图片
          let imgListCopy = this.data.imgSrcListOriginal
          let delImgList = this.data.deletedImgs.slice(0)
          let lonely = imgListCopy.splice(imgListCopy.findIndex(v => v === imgS), 1)
          delImgList.push(lonely[0])
          this.setData({
            'imgSrcListOriginal': imgListCopy,
            'deletedImgs': delImgList.slice(0)
          })
        } else {
          // 删除了新添加的图片
          let imgListCopy = this.data.previewUploadImgs
          imgListCopy.splice(imgListCopy.findIndex(v => v === imgS), 1);
          this.setData({
            'previewUploadImgs': imgListCopy
          })
        }
      } else {
        this.showToastTxt('起码留一张嘛')
      }
    },
    addImgFn () {
      const _this = this
      wx.chooseImage({
        count: 9 - parseInt(_this.data.imgSrcListOriginal.length),
        success(res){
          let imgList = []
          for (let i of res.tempFilePaths) {
            // 往待上传数组中添加元素
            imgList.push(i)
          }
          _this.setData({
            previewUploadImgs: _this.data.previewUploadImgs.concat(imgList),
            'imgSrcList': _this.data.imgSrcList.concat(imgList)
          })
        }
      })
    },
    inputTitle (e) {
      let curVal = e.detail.value
      this.setData({
        'actTitleCopy': curVal
      })
    },
    inputDescribe (e) {
      let curVal = e.detail.value
      this.setData({
        'actDescribeCopy': curVal
      })
    },
    editOrFinish () {
      if (this.data.editting) {
        // 调用提交方法
        if (this.data.previewUploadImgs.length || this.data.deletedImgs.length) {
          this.updateTiming()
        }
      } else {
        // 正在展示改成编辑模式
        this.setData({
          'editting': true,
          'headerRBtn': '完成',
          'headerLBtn': '取消'
        })
      }
    },
    updateTiming () {
      // 开始Loading
      this.setData({
        showCalLoading: true
      })
      let _this = this
      let deletedImgsList = []
      if (this.data.deletedImgs.length) {
        deletedImgsList = this.data.deletedImgs.map(imgPath => {
          return imgPath.replace(`${app.globalData.baseUrl}/imgstore/`, '')
        })
      }
      deletedImgsList = JSON.stringify(deletedImgsList)
      let formData = {
        'title': this.data.actTitleCopy,
        'description': this.data.actDescribeCopy,
        'imgSum': this.data.previewUploadImgs.length,
        'eventId': this.data.eventId,
        deletedImgsList
      }
      if (_this.data.previewUploadImgs.length) {
        // 如果有新加照片则走照片上传
        app.uploadimg({
          url: `${app.globalData.baseUrl}/media/supplyHappy`,
          path: _this.data.previewUploadImgs,
          formData,
          fn(result) {
            _this.setData({
              showCalLoading: false
            })
            // 添加完毕
            if (result.status) {
              app.clearWaittingPic()
              // 跳回到首页
              wx.reLaunch({
                url: '../main/main'
              })
            } else {
              _this.showToastTxt('图片上传失败啦')
            }
          }
        })
      } else {
        // 如果只是删除图片则调用图片删除
        wx.request({
          url: `${app.globalData.baseUrl}/media/updateDelImgs`,
          data: {
            formData
          },
          method: 'post',
          success (data) {
            let resData = data.data
            if (resData.status) {
              app.clearWaittingPic()
              // 正确跳转
              wx.reLaunch({
                url: '../main/main'
              })
            } else {
              // 错误提示
              _this.showToastTxt('图片删除失败啦')
            }
          }
        })
      }
    },
    goBackOrCancel () {
      if (this.data.editting) {
        // 取消编辑
        this.setData({
          'editting': false,
          'headerRBtn': '编辑',
          'headerLBtn': '返回',
          'imgSrcList': this.data.imgSrcListFixed.slice(0)
        })
      } else {
        app.clearWaittingPic()
        wx.reLaunch({
          url: '../main/main'
        })
      }
    },
    getEventDetail() {
      let _this = this
      wx.request({
        url: `${app.globalData.baseUrl}/media/getHappy`,
        data: {
          'eventId': _this.data.eventId
        },
        method: 'get',
        success (data) {
          if (data.statusCode) {
            let eventInfo = data.data;
            // 部署页面信息
            _this.setData({
              'actTitle': eventInfo.title,
              'actTitleCopy': eventInfo.title,
              'actDescribe': eventInfo.detail,
              'actDescribeCopy': eventInfo.detail,
              'startDate': eventInfo.startDate.split('T')[0],
              'endDate': eventInfo.endDate.split('T')[0],
              'actLocation': eventInfo.location
            })
            // 部署图片信息
            _this.deployImgs(eventInfo.imgs)
          } else {
            console.log('获取失败')
          }
        } 
      })
    },
    deployImgs (imgs) {
      const imgHost = `${app.globalData.baseUrl}/imgstore/`
      let imgSrcList = []
      for (let i in imgs) {
        imgSrcList[i] = imgHost + imgs[i]
      }

      this.setData({
        imgSrcList,   // 可变化的图片集
        imgSrcListOriginal: imgSrcList.slice(0),  // 原本拥有的图片集
        imgSrcListFixed: imgSrcList.slice(0)
      })
    },
    showToastTxt(toastTxt) {
      $Toast({
        content: toastTxt
      });
    },
    onReady (e) {
    },
    onLoad (options) {
      this.setData({'eventId': options.eventId})
      // 根据所得eventId刷出页面信息
      this.getEventDetail()
      // 头像喵
      this.setData({'selfPhoto': app.globalData.userInfo.avatarUrl})
    }
  }
})
