//app.js
import { dateFormate } from './utils/dateFormate.js'

App({
  onLaunch: function () {
    let that = this
    // 用来记录是否已经获取了用户信息
    let hasUserInfo = false
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取本地存储的openId
    const openIds = wx.getStorageSync('timer_openId')
    let session_key = openIds.session_key

    // 检测openId过没过期
    let expired = true
    if (openIds.timestamp) {
      expired = new Date().getTime() - openIds.timestamp > 60 * 60 * 1000
    }

    // 登录
    wx.login({
      success: res => {
        if (!expired) {
          console.log('还未过期')
          // 将openId存到global中
          that.globalData.userInfo = Object.assign({}, wx.getStorageSync('userInfo'), { openid: openIds.openId})
          return
        }
        if (res.code) {
          wx.request({
            url: `${this.globalData.baseUrl}/onLogin`,
            data: {
              code: res.code
            },
            method: 'post',
            success(data) {
              let resData = data.data
              if (resData.status) {
                // 此时已经拿到openid，需要确认是否获取到了用户信息
                let circulateInfo = () => {
                  let userInfoTimer = setTimeout(() => {
                    clearTimeout(userInfoTimer)
                    if (that.hasUserInfo) {
                      that.globalData.userInfo = Object.assign({}, that.globalData.userInfo, { openid: resData.openid, session_key: resData.session_key })
                      // 在此将所有用户信息存入数据库
                      wx.request({
                        url: `${that.globalData.baseUrl}/users/getUserInfo`,
                        data: {
                          userInfo: that.globalData.userInfo
                        },
                        method: 'get',
                        success(res) {
                          let data = res.data
                          if (data.status) {
                            if (data.insert) {
                              console.log('增加新用户成功')
                              // 标记是新用户
                              that.globalData.userInfo = Object.assign({}, that.globalData.userInfo, { newUser: true })
                            } else if (data.hasUser) {
                              console.log('已经存有此用户')
                              // 标记是老用户
                              that.globalData.userInfo = Object.assign({}, that.globalData.userInfo, { newUser: false })
                            }
                          } else {
                            console.log(data.errmsg)
                          }
                        },
                        fail(err) {
                          console.log('获取用户信息失败了')
                          console.log(err)
                        }
                      })
                    } else {
                      circulateInfo()
                    }
                  }, 100)
                }
                circulateInfo()
              } else {
                console.log(resData.errmsg)
              }
              wx.setStorageSync('timer_openId', {
                'openId': resData.openid,
                'session_key': resData.session_key,
                'timestamp': new Date().getTime()
              })
            }
          })
        } else {
          console.log(res)
        }
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = Object.assign({}, this.globalData.userInfo, res.userInfo)
              wx.setStorageSync('userInfo', this.globalData.userInfo)
              this.hasUserInfo = true
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onShow() {
    this.composeDatesArr()
  },
  composeDatesArr() {
    // 初始化三个月的格式
    // 初始当前月份时间
    this.globalData.selDateCurrent.year = this.globalData.selectDate.split('/')[0]
    this.globalData.selDateCurrent.month = this.globalData.selectDate.split('/')[1]
    this.globalData.selDateCurrent.date = this.globalData.selectDate.split('/')[2]

    // 初始上个月时间
    if (parseInt(this.globalData.selectDate.split('/')[1]) <= 1) {
      // 月份为1
      this.globalData.selDatePrevious.year = parseInt(this.globalData.selectDate.split('/')[0]) - 1 + ''
      this.globalData.selDatePrevious.month = 12 + ''
    } else {
      // 月份不为1
      this.globalData.selDatePrevious.year = parseInt(this.globalData.selectDate.split('/')[0]) + ''
      this.globalData.selDatePrevious.month = parseInt(this.globalData.selectDate.split('/')[1]) - 1
      this.globalData.selDatePrevious.month = this.globalData.selDatePrevious.month.toString().length == 1 ? '0' + this.globalData.selDatePrevious.month : this.globalData.selDatePrevious.month
    }
    // 初始下个月时间
    if (parseInt(this.globalData.selectDate.split('/')[1]) >= 12) {
      // 月份大于等于12
      this.globalData.selDateNext.year = parseInt(this.globalData.selectDate.split('/')[0]) + 1 + ''
      this.globalData.selDateNext.month = '01'
    } else {
      // 月份小于12
      this.globalData.selDateNext.year = parseInt(this.globalData.selectDate.split('/')[0]) + ''
      this.globalData.selDateNext.month = parseInt(this.globalData.selectDate.split('/')[1]) + 1
      this.globalData.selDateNext.month = this.globalData.selDateNext.month.toString().length == 1 ? '0' + this.globalData.selDateNext.month : this.globalData.selDateNext.month
    }
  },
  // 排列所有上传图片
  arrangePic(picObj) {
    // 遍历第一行相册
    for (let i in this.globalData.selectAlbumListLine1) {
      if (!this.globalData.selectAlbumListLine1[i].src) {
        this.globalData.selectAlbumListLine1[i] = { src: picObj, last: false }
        if (i == 2) {
          // 是最后一个
          this.globalData.selectAlbumListLine2[0] = { src: '', last: true }
        } else {
          this.globalData.selectAlbumListLine1[parseInt(i)+1] = { src: '', last: true }
        }
        return
      }
    }
    // 遍历第二行相册
    for (let i in this.globalData.selectAlbumListLine2) {
      if (!this.globalData.selectAlbumListLine2[i].src) {
        this.globalData.selectAlbumListLine2[i] = { src: picObj, last: false }
        if (i == 2) {
          // 是最后一个
          this.globalData.selectAlbumListLine3[0] = { src: '', last: true }
        } else {
          this.globalData.selectAlbumListLine2[parseInt(i) + 1] = { src: '', last: true }
        }
        return
      }
    }
    // 遍历第三行相册
    for (let i in this.globalData.selectAlbumListLine3) {
      if (!this.globalData.selectAlbumListLine3[i].src) {
        this.globalData.selectAlbumListLine3[i] = { src: picObj, last: false }
        if (i != 2) {
          // 不是最后一个
          this.globalData.selectAlbumListLine3[parseInt(i)+1] = { src: '', last: true }
        }
        return
      }
    }
  },
  // 清空所有排列好的待上传照片
  clearWaittingPic() {
    this.globalData.selectAlbumListLine1 = [
      { src: '', last: false },
      { src: '', last: false },
      { src: '', last: false }
    ];
    this.globalData.selectAlbumListLine2 = [
      { src: '', last: false },
      { src: '', last: false },
      { src: '', last: false }
    ];
    this.globalData.selectAlbumListLine3 = [
      { src: '', last: false },
      { src: '', last: false },
      { src: '', last: false }
    ]
  },
  // 图片批量上传的公共方法
  uploadimg: function (data) {
    // return new Promise((resolve, reject) => {
      var that = this,
        i = data.i ? data.i : 0,
        success = data.success ? data.success : 0,
        fail = data.fail ? data.fail : 0;
      wx.uploadFile({
        url: data.url,
        filePath: data.path[i],
        name: 'activityPics',
        formData: data.formData,
        success: function (res) {
          success++;
        },
        fail: function (res) {
          fail++;
        },
        complete: function (res) {
          i++;
          if (i == data.path.length) {  //当图片传完时，停止调用
            let resultJson = JSON.parse(res.data)
            if (resultJson.status) {
              data.fn(resultJson)
            } else {
              console.log(resultJson.message)
            }
          } else {
            data.i = i;
            data.success = success;
            data.fail = fail;
            that.uploadimg(data);
          }
        }
      })
    // })
  },
  globalData: {
    baseUrl: 'https://www.ronnieo.wang',
    // baseUrl: 'http://www.timecapsule.com', // 本地域名
    userInfo: null,
    currentDate: new Date().toLocaleDateString(),
    selectDate: dateFormate(new Date().toLocaleDateString()).formateSlash,
    // 用来记录展示出的三个月
    selDateCurrent: {
      year: '',
      month: '',
      date: ''
    },
    selDatePrevious: {
      year: '',
      month: '',
      date: ''
    },
    selDateNext: {
      year: '',
      month: '',
      date: ''
    },
    // 用来记录所选择的开始日期和结束日期
    selectedStartDateYear: '',
    selectedStartDateMonth: '',
    selectedStartDateDate: '',
    selectedEndDateYear: '',
    selectedEndDateMonth: '',
    selectedEndDateDate: '',
    selectedMonthDirection: '',
    // 记录用户所选照片的集合
    selectAlbumListLine1: [
      { src: '', last: false },
      { src: '', last: false },
      { src: '', last: false }
    ],
    selectAlbumListLine2: [
      { src: '', last: false },
      { src: '', last: false },
      { src: '', last: false }
    ],
    selectAlbumListLine3: [
      { src: '', last: false },
      { src: '', last: false },
      { src: '', last: false }
    ]
  }
})
