// import Gesture from '../../lib/custom_ Gesture/gesture.js'
// let ges = new Gesture()
const { $Toast } = require('../../lib/weApp_UI/base/index')

let app = getApp();
// 用于编写主要页面
Page({
  data: {
    // 用来记录主体日历当前的日期
    selDateCurrentYear: app.globalData.selDateCurrent.year,
    selDateCurrentMonth: app.globalData.selDateCurrent.month,
    selDateCurrentDate: app.globalData.selDateCurrent.date,
    // 用来记录主体日历上个月的日期
    selDatePreviousYear: app.globalData.selDatePrevious.year,
    selDatePreviousMonth: app.globalData.selDatePrevious.month,
    selDatePreviousDate: app.globalData.selDatePrevious.date,
    // 用来记录主体日历下个月的日期
    selDateNextYear: app.globalData.selDateNext.year,
    selDateNextMonth: app.globalData.selDateNext.month,
    selDateNextDate: app.globalData.selDateNext.date,
    // 用来记录左上角title日期
    selDateTitle: {
      year: '',
      month: '',
      date: ''
    },
    // 最大周期
    maxPeriod: 30,
    // 用来记录用户点击选择的日期
    selDateList: [],
    tips1: {
      txt: "首先，创建“时光胶囊的第一个事件吧”。",
      pos: "tip_center",
      show: false
    },
    tips2: {
      txt: "选择第一个事件的起始时间",
      pos: "tip_center",
      show: false
    },
    tips3: {
      txt: "如果您只想选择一天内的事件，请再次点击刚才选中的时间",
      pos: "tip_center",
      show: false
    },
    tips4: {
      txt: "来添加一份美好的回忆吧",
      pos: "tip_center",
      show: false
    },
    turnPagePre: 1,
    currentSwiper: 1,
    durationTime: 500,
    showCalLoading: false,
    wholeLoading: false
  },
  // 提示1隐藏的回调
  hideMask1() {
    this.setData({
      'tips1.show': false,
    })
    this.setData({
      'tips2.show': true
    })
  },
  // 提示2的隐藏回调
  hideMask2() {
    this.setData({
      'tips2.show': false
    })
  },
  // 提示3的隐藏回调
  hideMask3() {
    this.setData({
      'tips3.show': false
    })
  },
  // 提示4的隐藏回调
  hideMask4() {
    this.setData({
      'tips4.show': false
    })
  },
  // 初始化新手提示层
  initNewbieTips() {
    if (app.globalData.newUser) {
    // if (true) {
      this.setData({'tips1.show': true})
    }
  },
  // 初始化页面时间
  initPageDate() {
    // 初始左上角时间
    this.setData({
      'selDateTitle.year': app.globalData.selectDate.split('/')[0],
      'selDateTitle.month': app.globalData.selectDate.split('/')[1],
      'selDateTitle.date': app.globalData.selectDate.split('/')[2]
    })
  },
  // 点击右上角相机触发的回调函数
  addRecode() {
    // 首先判断用户是否选择日期完毕
    if (!app.globalData.selectedEndDateYear && !app.globalData.selectedStartDateYear) {
      this.showToastTxt('并没有选择日期')
      return
    }
    if (!app.globalData.selectedEndDateYear && app.globalData.selectedStartDateYear) {
      this.showToastTxt('没有选择结束日期')
      return
    }

    // 进行确认编辑操作
    wx.chooseImage({
      success(res) {
        // 往全局里存图片路径
        for (let i of res.tempFilePaths) {
          app.arrangePic(i)
        }
        // 跳转到编辑页面
        wx.navigateTo({
          url: '../upload/upload'
        })
      }
    })
  },
  // 点击选择日期的回调函数
  bindchange(e) {
    let { year, month, date } = e.detail

    // 判断所选日期是开始日期还是结束日期
    if (app.globalData.selectedStartDateYear && !app.globalData.selectedEndDateYear) {
      // 选择了结束日期
      // 判断过程中是否有已被占用的日期
      if (this.selectComponent("#currentCal").isOccupied(app.globalData.selectedStartDateDate, date)) {
        return
      }
      // 进行比较
      if (this.compareDate(e.detail)) {
        // 比对结束时间是否在结束时间之后
        // 如果结束时间在开始时间之后，则布置结束时间，并布置过程时间
        this.selectEndDate(e.detail)
        // 如果是新用户显示第四条遮罩提示
        if (app.globalData.newUser) {
          this.setData({
            'tips4.show': true
          })
        }
      } else {
        // 如果结束时间在开始时间之前，则重置开始时间
        // 清空当前所有月份记录
        this.clearAllMonth()
        this.selectStartDate(e.detail)
      }
      return false
    }
    if (!app.globalData.selectedEndDateYear && !app.globalData.selectedStartDateYear) {
      // 赋值开始时间
      this.selectStartDate(e.detail)
      
      if (app.globalData.newUser) {
      // if (true) {
        // 如果是新用户显示第三条遮罩提示
        this.setData({
          'tips3.show': true
        })
      }
    }
    if (app.globalData.selectedEndDateYear && app.globalData.selectedStartDateYear) {
      this.clearAllSelectData()
      // 选择开始日期
      this.selectStartDate(e.detail)
    }
  },
  clearAllSelectData() {
    // 清空开始日期
    this.clearStartDates()
    // 清空结束日期
    this.clearEndDates()
    // 清空当前所有月份记录
    this.clearAllMonth()
  },
  // 选择了开始时间
  selectStartDate(YTD) {
    let { year, month, date } = YTD
    app.globalData.selectedStartDateYear = year
    app.globalData.selectedStartDateMonth = month
    app.globalData.selectedStartDateDate = date
    this.selectComponent("#currentCal").setDateMap('start', YTD)
  },
  // 选择了结束时间
  selectEndDate(YTD) {
    let { year, month, date } = YTD
    app.globalData.selectedEndDateYear = year
    app.globalData.selectedEndDateMonth = month
    app.globalData.selectedEndDateDate = date
    if (parseInt(app.globalData.selectedStartDateYear) == parseInt(app.globalData.selectedEndDateYear)) {
      // 这里是同年的情况
      if (parseInt(app.globalData.selectedStartDateMonth) == parseInt(app.globalData.selectedEndDateMonth)) {
        // 开始和结束同月的情况
        app.globalData.selectedMonthDirection = '0'
        this.selectComponent("#currentCal").setDateMap('end', YTD)
      } else if (parseInt(app.globalData.selectedStartDateMonth) < parseInt(app.globalData.selectedEndDateMonth)) {
        // 开始月小于结束月的情况
        app.globalData.selectedMonthDirection = '1'
        this.selectComponent("#currentCal").setDateMap('end', YTD)
        this.selectComponent("#previousCal").setPreProcess()
      }
    } else {
      // 这里写不同年的情况
      app.globalData.selectedMonthDirection = '1'
      this.selectComponent("#currentCal").setDateMap('end', YTD)
      this.selectComponent("#previousCal").setPreProcess()
    }
  },
  clearAllMonth() {
    // 清空三个月份的选择记录
    this.selectComponent("#previousCal").resetArr()
    this.selectComponent("#currentCal").resetArr()
    this.selectComponent("#nextCal").resetArr()
    app.globalData.selectedMonthDirection = ''
  },
  clearStartDates() {
    // 清空开始日期的存储
    app.globalData.selectedStartDateYear = ''
    app.globalData.selectedStartDateMonth = ''
    app.globalData.selectedStartDateDate = ''
  },
  clearEndDates() {
    // 清空结束日期的存储
    app.globalData.selectedEndDateYear = ''
    app.globalData.selectedEndDateMonth = ''
    app.globalData.selectedEndDateDate = ''
  },
  compareDate(dates) {
    // 比较两个日期
    let startYear = parseInt(app.globalData.selectedStartDateYear)
    let endYear = parseInt(dates.year)
    let startMonth = parseInt(app.globalData.selectedStartDateMonth)
    let endMonth = parseInt(dates.month)
    let startDate = parseInt(app.globalData.selectedStartDateDate)
    let endDate = parseInt(dates.date)
    // 保存一个开始日期到结束日期的天数
    let spell = 30 - startDate + endDate
    if (startYear < endYear) {
      // 结束年大于开始年
      if (spell <= this.data.maxPeriod) {
        return true
      } else {
        this.showToastTxt('事件周期不要大过' + this.data.maxPeriod + '天')
        return false
      }
    } else if (startYear = endYear) {
      // 结束年等于开始年
      if (startMonth < endMonth) {
        // 结束月大于开始月
        if (spell <= this.data.maxPeriod) {
          return true
        } else {
          this.showToastTxt('事件周期不要大过' + this.data.maxPeriod + '天')
          return false
        }
      } else if (startMonth == endMonth) {
        // 开始约等于结束月
        if (startDate < endDate) {
          // 开始日期小于结束日期
          return true
        } else if (startDate == endDate) {
          // 开始日期等于结束日期
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    } else {
      return false
    }
  },
  setAllDates() {
    // 分别设置上个月，这个月，下个月的日期
    this.setData({
      'selDatePreviousYear': app.globalData.selDatePrevious.year,
      'selDatePreviousMonth': app.globalData.selDatePrevious.month,
      'selDatePreviousDate': app.globalData.selDatePrevious.date,
      'selDateCurrentYear': app.globalData.selDateCurrent.year,
      'selDateCurrentMonth': app.globalData.selDateCurrent.month,
      'selDateCurrentDate': app.globalData.selDateCurrent.date,
      'selDateNextYear': app.globalData.selDateNext.year,
      'selDateNextMonth': app.globalData.selDateNext.month,
      'selDateNextDate': app.globalData.selDateNext.date
    })
  },
  swiperChangeFn(e) {
    // console.log('触发滑动改变')
    this.setData({
      'showCalLoading': true
    })

    // 如果有开始日期和结束日期的话，进行比对，对上了就让日历数组渲染样式
    if (app.globalData.selectedStartDateYear && app.globalData.selectedEndDateYear) {
      // 存在已选择的区间
      let startYTD = {
        year: app.globalData.selectedStartDateYear,
        month: app.globalData.selectedStartDateMonth,
        date: app.globalData.selectedStartDateDate
      }
      let endYTD = {
        year: app.globalData.selectedEndDateYear,
        month: app.globalData.selectedEndDateMonth,
        date: app.globalData.selectedEndDateDate
      }
      // 判断开始日期是上中下三个月份的哪一个
      // 开始日期是否上月
      if (app.globalData.selectedStartDateMonth == app.globalData.selDatePrevious.month) {
        this.selectComponent("#previousCal").setDateMap('start', startYTD)
      }
      // 开始日期是否当月
      if (app.globalData.selectedStartDateMonth == app.globalData.selDateCurrent.month) {
        this.selectComponent("#currentCal").setDateMap('start', startYTD)
      }
      // 开始日期是否下月
      if (app.globalData.selectedStartDateMonth == app.globalData.selDateNext.month) {
        this.selectComponent("#nextCal").setDateMap('start', startYTD)
      }
      // 判断结束日期是上中下三个月份的哪一个
      // 结束月份是否同月
      if (app.globalData.selectedStartDateMonth == app.globalData.selectedEndDateMonth) {
        // 同月
        if (app.globalData.selectedEndDateMonth == app.globalData.selDatePrevious.month) {
          this.selectComponent("#previousCal").setDateMap('end', endYTD)
        }
        if (app.globalData.selectedEndDateMonth == app.globalData.selDateCurrent.month) {
          this.selectComponent("#currentCal").setDateMap('end', endYTD)
        }
        if (app.globalData.selectedEndDateMonth == app.globalData.selDateNext.month) {
          this.selectComponent("#nextCal").setDateMap('end', endYTD)
        }
      } else {
        // 不同月
        if (app.globalData.selectedEndDateMonth == app.globalData.selDatePrevious.month) {
          this.selectComponent("#previousCal").setDateMap('end', endYTD)
        }
        if (app.globalData.selectedEndDateMonth == app.globalData.selDateCurrent.month) {
          this.selectComponent("#currentCal").setDateMap('end', endYTD)
          this.selectComponent("#previousCal").setPreProcess()
        }
        if (app.globalData.selectedEndDateMonth == app.globalData.selDateNext.month) {
          this.selectComponent("#nextCal").setDateMap('end', endYTD)
          this.selectComponent("#currentCal").setPreProcess()
        }
      }
    } else if (app.globalData.selectedStartDateYear) {
      // 存在已选择的区间
      let startYTD = {
        year: app.globalData.selectedStartDateYear,
        month: app.globalData.selectedStartDateMonth,
        date: app.globalData.selectedStartDateDate
      }
      // 判断开始日期是上中下三个月份的哪一个
      // 开始日期是否上月
      if (app.globalData.selectedStartDateMonth == app.globalData.selDatePrevious.month) {
        this.selectComponent("#previousCal").setDateMap('start', startYTD)
      }
      // 开始日期是否当月
      if (app.globalData.selectedStartDateMonth == app.globalData.selDateCurrent.month) {
        this.selectComponent("#currentCal").setDateMap('start', startYTD)
      }
      // 开始日期是否下月
      if (app.globalData.selectedStartDateMonth == app.globalData.selDateNext.month) {
        this.selectComponent("#nextCal").setDateMap('start', startYTD)
      }
    }
  },
  swiperMonthFn(e) {
    // console.log('触发动画结束')
    const turnPage = e.detail.current;
    if (this.data.turnPagePre == turnPage) {
      // 如果滑动页面幅度小月份没变，则不做任何操作
      return
    } else {
      // 拉取当月和上月下月的信息
      this.getThreeMonth()

      this.setData({
        'turnPagePre': turnPage,
        'durationTime': 0
      })
      if (turnPage == 0) {
        app.globalData.selectDate = app.globalData.selDatePrevious.year + '/' + app.globalData.selDatePrevious.month + '/' + app.globalData.selDatePrevious.date
      } else if (turnPage == 2) {
        app.globalData.selectDate = app.globalData.selDateNext.year + '/' + app.globalData.selDateNext.month + '/' + app.globalData.selDateNext.date
      }
      app.composeDatesArr()
      this.setAllDates()
      // 重置swiper当前所在的滑块
      this.setData({
        'currentSwiper': 1
      })
      this.setData({
        'durationTime': 500,
        'showCalLoading': false
      })
    }
  },
  showToastTxt(toastTxt) {
    $Toast({
      content: toastTxt
    });
  },
  // 编辑月内的数据样式
  editDataStruct({ monthName, eventArr }) {
    this.selectComponent(monthName).clearEventDate()
    if (!eventArr.length) {
      return
    }
    for (let e of eventArr) {
      this.selectComponent(monthName).editEventData(e)
    }
  },
  getThreeMonth() {
    // 这里拉取当前三个月的信息
    this.setData({ showCalLoading: true })
    // 上月信息事件数据表
    let eventPre = []
    // 本月信息事件数据表
    let eventCur = []
    // 下月信息事件数据表
    let eventNex = []
    this.fetchMonthEvent(app.globalData.selDatePrevious.year, app.globalData.selDatePrevious.month).then(data => {
      eventPre = data
      this.editDataStruct({ monthName: '#previousCal', eventArr: eventPre })
      return this.fetchMonthEvent(app.globalData.selDateCurrent.year, app.globalData.selDateCurrent.month)
    }).then(data => {
      eventCur = data
      // 给当月数据结构修改样式
      this.editDataStruct({monthName: '#currentCal', eventArr: eventCur})
      return this.fetchMonthEvent(app.globalData.selDateNext.year, app.globalData.selDateNext.month)
    }).then(data => {
      eventNex = data
      this.editDataStruct({ monthName: '#nextCal', eventArr: eventNex })
      this.setData({ showCalLoading: false })
    })
  },
  fetchMonthEvent(year, month) {
    return new Promise((res, rej) => {
      wx.request({
        url: 'http://www.timecapsule.com/media/getDateEvent',
        data: {
          period: year + '-' + month
        },
        method: 'get',
        success(data) {
          let userData = data.data
          if (userData.status) {
            res(userData.dateArr)
          } else {
            rej('获取失败')
          }
        }
      })
    })
  },
  onLoad() {
    // 初始化页面时间
    this.initPageDate()
    // 判断用户是否是新用户，如果是就让新手遮罩层显示
    this.initNewbieTips()
    // 拉取当月和上月下月的信息
    this.getThreeMonth()
  }
})
