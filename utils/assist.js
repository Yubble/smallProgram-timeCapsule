// 计算属性
const computed = (ctx, obj) => {
  let keys = Object.keys(obj)
  let dataKeys = Object.keys(ctx.data)
  dataKeys.forEach(dataKey => {
    // 传入 this， this的单独key， 单独key的值
    defineReactive(ctx.data, dataKey, ctx.data[dataKey])
  })
  let firstComputedObj = keys.reduce((prev, next) => {
    // 第一次注册这个属性的时候会显示出来
    ctx.data.$target = function () {
      ctx.setData({ [next]: obj[next].call(ctx) })
    }
    prev[next] = obj[next].call(ctx)
    ctx.data.$target = null
    return prev
  }, {})
  ctx.setData(firstComputedObj)
}

// 监听
const watch = (ctx, obj) => {
  Object.keys(obj).forEach(key => {
    defineReactive(ctx.data, key, ctx.data[key], function (value) {
      obj[key].call(ctx, value)
    })
  })
}

function defineReactive(data, key, val, fn) {
  let subs = data['$' + key] || [] // 新增
  Object.defineProperty(data, key, {
    configurable: true,
    enumerable: true,
    get: function() {
      if (data.$target) {
        subs.push(data.$target)
        data['$' + key] = subs // 新增
      }
      return val
    },
    set: function(newVal) {
      if (newVal === val) return
      fn && fn(newVal)
      if (subs.length) {
        // 用 setTimeout 因为此时 this.data 还没更新
        setTimeout(() => {
          subs.forEach(sub => sub())
        }, 0)
      }
      val = newVal
    }
  })
}

module.exports = {
  computed,
  watch
}