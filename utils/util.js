/**
 * 函数节流
 * @params {Function} fn 函数事件
 * @param {String} delay 等待时间
 * */
function throttle(fn, delay = 100) {
  let timer = null;
  return function () {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        fn.apply(this, arguments);
      }, delay)
    }
  }
}

/**
 * 函数防抖
 * @params {Function} fn 函数事件
 * @param {String} delay 等待时间
 * @isClick {Boolean} isClick 是否点击事件 开始时会立即执行
 * */
function debounce(fn, delay = 200, isClick = false) {
  let timer = null;
  let times = 0;
  if (typeof delay === 'boolean') {
    isClick = delay;
    delay = 200;
  }
  return function () {
    times++;
    if (times === 1 && isClick) {
      fn.apply(this, arguments);
    }
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      if (!isClick) {
        fn.apply(this, arguments);
      }
      times = 0;
    }, delay);
  }
}

module.exports = {
  throttle,
  debounce
}