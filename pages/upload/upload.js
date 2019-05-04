// pages/edit/edit.js
const { $Toast, $Message } = require('../../lib/weApp_UI/base/index')
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    albumListLine1: [],
    albumListLine2: [],
    albumListLine3: [],
    showGoBack: false,
    showDetailInp: false,
    startDate: '',
    endDate: '',
    titlefocus: false,
    formData: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      currentLoc: '',
      currentLocDetail: '',
      openId: '',
      imgSum: 0
    },
    showCalLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      albumListLine1: app.globalData.selectAlbumListLine1,
      albumListLine2: app.globalData.selectAlbumListLine2,
      albumListLine3: app.globalData.selectAlbumListLine3,
      startDate: app.globalData.selectedStartDateYear + '年' + app.globalData.selectedStartDateMonth + '月' + app.globalData.selectedStartDateDate + '日',
      endDate: app.globalData.selectedEndDateYear + '年' + app.globalData.selectedEndDateMonth + '月' + app.globalData.selectedEndDateDate + '日',
      'formData.startDate': app.globalData.selectedStartDateYear + '-' + app.globalData.selectedStartDateMonth + '-' + app.globalData.selectedStartDateDate,
      'formData.endDate': app.globalData.selectedEndDateYear + '-' + app.globalData.selectedEndDateMonth + '-' + app.globalData.selectedEndDateDate,
      'formData.openId': app.globalData.userInfo.openid
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  // 根据用户输入标题改变标题数据内容
  changeTitle(e) {
    this.setData({
      'formData.title': e.detail.value
    })
  },

  // 根据用户输入描述改变时光描述内容
  changeDescription(e) {
    this.setData({
      'formData.description': e.detail.value
    })
  },

  // 完成了title的添加
  addTitle() {
    this.setData({
      showDetailInp: true
    })
  },

  // 自定义方法
  addImgFn() {
    let _this = this
    let addCount = 9
    app.globalData.selectAlbumListLine1.map((obj, index) => {
      if (obj.src) {
        addCount--
      }
    })
    app.globalData.selectAlbumListLine2.map((obj, index) => {
      if (obj.src) {
        addCount--
      }
    })
    app.globalData.selectAlbumListLine3.map((obj, index) => {
      if (obj.src) {
        addCount--
      }
    })
    wx.chooseImage({
      count: addCount,
      success(res) {
        // 往全局里存图片路径
        for (let i of res.tempFilePaths) {
          app.arrangePic(i)
        }
        // 更新data数据
        _this.setData({
          albumListLine1: app.globalData.selectAlbumListLine1,
          albumListLine2: app.globalData.selectAlbumListLine2,
          albumListLine3: app.globalData.selectAlbumListLine3
        })
      }
    })
  },

  // 配置本地定位
  goLocate() {
    const _this = this
    wx.chooseLocation({
      success (res) {
        _this.setData({
          'formData.currentLoc': res.name,
          'formData.currentLocDetail': res.address
        })
      },
      fail () {
        this.showToastTxt('定位失败了')
      }
    })
  },

  // 回退方法
  goBack() {
    this.setData({
      showGoBack: true
    })
  },

  // 取消回退
  cancelGoBack() {
    this.setData({
      showGoBack: false
    })
  },

  // 确定回退
  confirmGoBack() {
    wx.navigateBack({
      delta: 1
    })
    app.clearWaittingPic()
  },

  // 完成按钮
  gofinish () {
    if (this.data.formData.title) {
      this.setData({
        showCalLoading: true
      })
      // 整理出要上传的图片成一个集合
      let imgsSet = []
      app.globalData.selectAlbumListLine1.forEach(e => {
        if (e.src) {
          imgsSet.push(e.src)
        }
      })
      app.globalData.selectAlbumListLine2.forEach(e => {
        if (e.src) {
          imgsSet.push(e.src)
        }
      })
      app.globalData.selectAlbumListLine3.forEach(e => {
        if (e.src) {
          imgsSet.push(e.src)
        }
      })

      // 给图集记个数
      this.setData({
        "formData.imgSum": imgsSet.length
      })

      let _this = this
      // 开始上传
      app.uploadimg({
        url: `${app.globalData.baseUrl}/media/saveHappy`,
        path: imgsSet,
        formData: this.data.formData,
        fn(result) {
          _this.setData({
            showCalLoading: false
          })
          if (result.status) {
            wx.navigateTo({
              url: '../edit/edit?eventId=' + result.eventId
            })
          } else {
            this.showToastTxt(result.msg)
          }
        }
      })
    } else {
      this.showToastTxt('起码给一个标题嘛~')
      this.setData({titlefocus: true})
    }
  },

  showToastTxt(toastTxt) {
    $Toast({
      content: toastTxt
    });
  }
})