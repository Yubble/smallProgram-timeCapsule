// pages/common/calendar/calendar.js
import { computed, watch } from '../../../utils/assist.js'
import { copyobj } from '../../../utils/util.js'
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    selectYear: {
      type: String,
      value: app.globalData.currentDate.year,
      observer(newObj, oldObj) {
        if (newObj != oldObj) {
          // console.log('改变了年份')
          this.setData({
            'selectYear': newObj
          })
          this.dataTime()
        }
      }
    },
    selectMonth: {
      type: String,
      value: app.globalData.currentDate.month,
      observer(newObj, oldObj) {
        if (newObj != oldObj) {
          this.setData({
            'selectMonth': newObj
          })
          this.dataTime()
        }
      }
    },
    selectDate: {
      type: String,
      value: app.globalData.currentDate.date,
      observer(newObj, oldObj) {
        if (newObj != oldObj) {
          // console.log('改变了日期')
          this.setData({
            'selectDate': newObj
          })
          this.dataTime()
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    arr: [],
    sysW: null,
    lastDay: null,
    firstDay: null,
    weekArr: ['日', '一', '二', '三', '四', '五', '六'],
    year: null,
    month: null,
    getDate: null,
    // 从全局变量中拿到当前月份
    currentMonth: app.globalData.selectDate.split('/')[1]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取日历相关参数
    dataTime: function () {
      this.setData({
        arr: []
      })
      let year = this.data.selectYear
      let month = this.data.selectMonth
      let defaultMonth = month - 1
      let date = this.data.selectDate
      //获取现今年份
      this.setData({year})

      //获取现今月份
      this.setData({month})

      //获取今日日期
      this.setData({getDate: date})

      //最后一天是几号
      var d = new Date(year, month, 0);
      this.setData({
        lastDay: d.getDate()
      })

      //第一天星期几
      let firstDay = new Date(year, defaultMonth, 1);
      this.setData({
        firstDay: firstDay.getDay()
      })
      this.buildColony()
    },
    // 根据开始和结束时间判断区间是否已经被占用
    isOccupied(startDate, endDate) {
      for (let i=parseInt(startDate); i < parseInt(endDate); i++) {
        let { endEvent, hasEvent, sameEvent, startEvent } = this.data.arr[i]
        if (endEvent || hasEvent || sameEvent || startEvent) {
          return true
          break
        }
      }
      return false
    },
    selDate(e) {

      let { date, startDate, endDate, processDate, sameDate, startEvent, hasEvent, endEvent, sameEvent, eventId } = e.currentTarget.dataset.arr
      if (startEvent || hasEvent || endEvent || sameEvent) {
        if ((app.globalData.selectedStartDateYear && app.globalData.selectedEndDateYear) || (!app.globalData.selectedStartDateYear && !app.globalData.selectedEndDateYear)) {
          // 此时可以跳转到展示页面
          // 调用父级方法，清空已选数据
          this.triggerEvent('clearAllSelectData')
          // 跳转到展示页面
          wx.navigateTo({
            url: '../edit/edit?eventId=' + eventId
          })
        }
        return
      }
      this.triggerEvent('bindchange', {
        year: this.data.year,
        month: this.data.month,
        date
      })
    },
    // 便利修改日历的日期样式
    setDateMap(type, dates) {
      let direction = app.globalData.selectedMonthDirection || ''
      let { year, month, date } = dates
      // 用来根据所选时间改变数据结构
      if (type == 'start') {
        // 修改开始日期的数据结构
        let tempArr = this.data.arr;
        // 如果已选开始日期和结束日期不在同一个月，则将开始日期的月份在开始日期后都涂成紫色
        if (direction == '1') {
          tempArr.splice(date - 1, 1, { 'date': date, 'startDate': true, 'endDate': false, 'processDate': false, 'sameDate': false, 'hasEvent': false, 'startEvent': false, 'endEvent': false, 'sameEvent': false, 'eventId': '' })
          for (let i = date + 1; i < tempArr.length + 1; i++) {
            tempArr.splice(i - 1, 1, { 'date': i, 'startDate': false, 'endDate': false, 'processDate': true, 'sameDate': false, 'hasEvent': false, 'startEvent': false, 'endEvent': false, 'sameEvent': false, 'eventId': '' })
          }
        } else {
          tempArr.splice(date - 1, 1, { 'date': date, 'startDate': true, 'endDate': false, 'processDate': false, 'sameDate': false, 'hasEvent': false, 'startEvent': false, 'endEvent': false, 'sameEvent': false, 'eventId': '' })
        }
        this.setData({
          arr: tempArr
        })
      } else if (type == 'end') {
        // 修改结束日期的数据结构
        let tempArr = this.data.arr;
        tempArr.splice(date - 1, 1, { 'date': date, 'startDate': false, 'endDate': true, 'processDate': false, 'sameDate': false, 'hasEvent': false, 'startEvent': false, 'endEvent': false, 'sameEvent': false, 'eventId': '' })
        
        // 开始编写中间过程日期的数据结构
        if (direction == '0') {
          // 如果开始和结束同月的情况
          if (app.globalData.selectedStartDateDate == app.globalData.selectedEndDateDate) {
            // 如果选择了一天的情况，样式变成一个圆
            tempArr[date - 1] = { 'date': date, 'startDate': false, 'endDate': false, 'processDate': true, 'sameDate': true, 'hasEvent': false, 'startEvent': false, 'endEvent': false, 'sameEvent': false, 'eventId': '' }
          } else {
            for (let i = app.globalData.selectedStartDateDate + 1; i < date; i++) {
              tempArr.splice(i - 1, 1, { 'date': i, 'startDate': false, 'endDate': false, 'processDate': true, 'sameDate': false, 'hasEvent': false, 'startEvent': false, 'endEvent': false, 'sameEvent': false, 'eventId': '' })
            }
          }
        } else if (direction == '1') {
          // 如果开始月小于结束月的情况
          // 将同月结束日期之前日期都变成过程样式
          for (let i = 1; i < app.globalData.selectedEndDateDate; i++) {
            tempArr.splice(i - 1, 1, { 'date': i, 'startDate': false, 'endDate': false, 'processDate': true, 'sameDate': false, 'hasEvent': false, 'startEvent': false, 'endEvent': false, 'sameEvent': false, 'eventId': '' })
          }
        }

        this.setData({
          arr: tempArr
        })
      }
    },
    // 编辑月份事件
    editEventData({start_date, end_date, event_id}) {
      // 获取到当前年份和当前月份
      let curYear = this.data.selectYear
      let curMonth = this.data.selectMonth
      // 获取到传入的开始年月日
      let startYear = start_date.split('-')[0]
      let startMonth = start_date.split('-')[1]
      let startDate = start_date.split('-')[2]
      // 获取到传入的结束年月日
      let endYear = end_date.split('-')[0]
      let endMonth = end_date.split('-')[1]
      let endDate = end_date.split('-')[2]
      if (curYear != startYear || curMonth != startMonth) {
        // 开始时间在上一年或上个月，单项给出结束时间就行
        this.setEventDate({}, {endYear, endMonth, endDate}, event_id)
      } else if (curYear != endYear || curMonth != endMonth) {
        // 结束时间在下一年或下个月，单项给出开始时间就行
        this.setEventDate({startYear, startMonth, startDate}, {}, event_id)
      } else {
        // 两个时间都在一个月份
        this.setEventDate({ startYear, startMonth, startDate }, { endYear, endMonth, endDate}, event_id)
      }
    },
    // 配置开始时间的数据
    setEventDate(startDate, endDate, event_id) {
      let tempArr = this.data.arr
      if (!Object.keys(startDate).length) {
        // 缺少开始时间，只做结束时间便可
        // 设置结束日期
        tempArr.splice(endDate.endDate - 1, 1, { 'date': parseInt(endDate.endDate), 'startDate': false, 'endDate': false, 'processDate': false, 'sameDate': false, 'hasEvent': false, 'startEvent': false, 'endEvent': true, 'sameEvent': false, 'eventId': event_id })
        for (let i = 1; i < parseInt(endDate.endDate); i++) {
          tempArr.splice(i - 1, 1, { 'date': i, 'startDate': false, 'endDate': false, 'processDate': false, 'sameDate': false, 'hasEvent': true, 'startEvent': false, 'endEvent': false, 'sameEvent': false, 'eventId': event_id })
        }
      } else if (!Object.keys(endDate).length) {
        // 缺少结束时间，只做开始时间便可
        // 设置开始日期样式
        tempArr.splice(startDate.startDate - 1, 1, { 'date': parseInt(startDate.startDate), 'startDate': false, 'endDate': false, 'processDate': false, 'sameDate': false, 'hasEvent': false, 'startEvent': true, 'endEvent': false, 'sameEvent': false, 'eventId': event_id })
        // 过程日期
        for (let i = parseInt(startDate.startDate) + 1; i < tempArr.length + 1; i++) {
          tempArr.splice(i - 1, 1, { 'date': i, 'startDate': false, 'endDate': false, 'processDate': false, 'sameDate': false, 'hasEvent': true, 'startEvent': false, 'endEvent': false, 'sameEvent': false, 'eventId': event_id })
        }
      } else if (startDate.startDate == endDate.endDate) {
        // 开始结束是一天的事件
        tempArr.splice(startDate.startDate - 1, 1, { 'date': parseInt(startDate.startDate), 'startDate': false, 'endDate': false, 'processDate': false, 'sameDate': false, 'hasEvent': false, 'startEvent': false, 'endEvent': false, 'sameEvent': true, 'eventId': event_id })
      } else {
        // 开始和结束都在一个月份里
        // 设置开始日期样式
        tempArr.splice(startDate.startDate - 1, 1, { 'date': parseInt(startDate.startDate), 'startDate': false, 'endDate': false, 'processDate': false, 'sameDate': false, 'hasEvent': false, 'startEvent': true, 'endEvent': false, 'sameEvent': false, 'eventId': event_id })
        // 设置结束日期样式
        tempArr.splice(endDate.endDate - 1, 1, { 'date': parseInt(endDate.endDate), 'startDate': false, 'endDate': false, 'processDate': false, 'sameDate': false, 'hasEvent': false, 'startEvent': false, 'endEvent': true, 'sameEvent': false, 'eventId': event_id })
        for (let i = parseInt(startDate.startDate) + 1; i < endDate.endDate; i++) {
          tempArr.splice(i - 1, 1, { 'date': i, 'startDate': false, 'endDate': false, 'processDate': false, 'sameDate': false, 'hasEvent': true, 'startEvent': false, 'endEvent': false, 'sameEvent': false, 'eventId': event_id })
        }
      }
      this.setData({
        arr: tempArr
      })
    },
    // 配置上个月选择过程日期的样式
    setPreProcess() {
      // 修改上月日期的数据结构
      let tempArr = this.data.arr;
      tempArr.splice(app.globalData.selectedStartDateDate - 1, 1, { 'date': app.globalData.selectedStartDateDate, 'startDate': true, 'endDate': false, 'processDate': false, 'sameDate': false, 'hasEvent': false, 'startEvent': false, 'endEvent': false, 'sameEvent': false, 'eventId': '' })
      for (let i = app.globalData.selectedStartDateDate + 1; i <= this.data.lastDay; i++) {
        tempArr.splice(i - 1, 1, {
          'date': i, 'startDate': false, 'endDate': false, 'processDate': true, 'sameDate': false, 'hasEvent': false, 'startEvent': false, 'endEvent': false, 'sameEvent': false, 'eventId': '' })
      }
      this.setData({
        arr: tempArr
      })
    },
    clearEventDate() {
      let originalArr = copyobj(this.data.arr)
      originalArr = originalArr.map((item, index) => {
        return Object.assign({}, item, { endEvent: false, hasEvent: false, sameEvent: false, startEvent: false, eventId: '' })
      })
      this.setData({
        arr: originalArr
      })
    },
    resetArr() {
      let originalArr = copyobj(this.data.arr)
      originalArr = originalArr.map((item, index) => {
        return Object.assign({}, item, {endDate: false, processDate: false, sameDate: false, startDate: false})
      })
      this.setData({
        arr: originalArr
      })
    },
    buildColony() {
      //根据得到今月的最后一天日期遍历 得到所有日期
      for (var i = 1; i < this.data.lastDay + 1; i++) {
        this.data.arr.push({
          'date': i,  // 具体日期几号
          'startDate': false, // 是否是开始日期
          'endDate': false, // 是否是结束日期
          'processDate': false, // 是否是过程日期
          'sameDate': false,  // 是否开始结束是同一天
          'hasEvent': false,  // 这一天是否有事件
          'startEvent': false,  // 是否是事件开始的一天
          'endEvent': false,   // 是否是事件结束的一天
          'sameEvent': false,  // 事件是在同一天
          'eventId': ''
        });
      }
      var res = wx.getSystemInfoSync();
      //  
      this.setData({
        sysW: res.windowWidth / 7,//根据屏幕宽度变化自动设置宽度
        marLet: this.data.firstDay,
        arr: this.data.arr,
        year: this.data.year,
        getDate: this.data.getDate,
        month: this.data.month
      });
    }
  },

  ready() {}
})
