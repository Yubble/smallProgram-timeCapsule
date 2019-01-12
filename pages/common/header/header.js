// pages/common/header/header.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goBackTxt: {
      type: String
    },
    goFinishTxt: {
      type: String
    },
    hasGoBackFn: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    goBack_self() {
      if (this.data.hasGoBackFn) {
        this.triggerEvent('goBackFn')
      } else {
        wx.navigateBack({
          delta: 1
        })
      }
    },
    goFinish_self() {
      this.triggerEvent('goFinishFn')
    }
  }
})
