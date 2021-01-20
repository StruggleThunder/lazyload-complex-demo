import classifys from '../../mock/classifys'; // 分类列表
import goods from '../../mock/goods'; // 商品列表

import {
  debounce,
  throttle
} from '../../utils/util'; // 引入防抖和节流函数方法


let viewHeights = []; // 视图高度列表
let classifyFlag = true; // 分类加锁标识
let tolowerFlag = true; // 是否可以触发触底事件标识

Page({
  data: {
    classifyList: [], // 分类列表
    classifyType: 'classify0', // 分类type
    classifyIdx: 0, // 分类索引
    classifyScrollTop: 0, // 分类滚动距顶高度
    goodsList: [], // 商品列表
    showIdxFlag: 0, // 显示索引标识，1标识渲染前1个分组。 得根据实际情况
  },

  onLoad(options) {
    this.initData();
  },

  // 初始化数据
  initData() {

    // 接口返回的没有id属性，给没列定义一个id
    classifys.map((item, index) => {
      item.id = 'classify' + index;
    })

    this.setData({
      classifyList: classifys,
      goodsList: goods 
    })
    // tips: 初始时虽然将所有数据给赋给了goodsList，但视图中做了控制，只会展示前两组分类的数据。

    // 渲染完成后再去获取视图高度
    wx.nextTick(() => {
      this.initViewHeight();
    })

  },

  // 初始化视图高度
  initViewHeight() {
    const goodsList = this.data.goodsList || []
    if (goodsList.length) {
      for (let i = 0; i < goodsList.length; i++) {
        const query = wx.createSelectorQuery();
        query
          .select(`.${goodsList[i].id}`)
          .boundingClientRect(rect => {
            const height = rect ? rect.height : 0;
            viewHeights.push(Number(height.toFixed(2)))
          })
          .exec()
      }
    }
  },

  // 点击分类
  onClassify: debounce(function (e) {
    const {
      id,
      idx
    } = e.currentTarget.dataset

    const {
      showIdxFlag,
      goodsList
    } = this.data;

    const maxLen = goodsList.length;

    // 此时显示的索引标识小于最大长度 并且 点击的索引值要大于此时显示的索引标识
    if (maxLen - 1 > showIdxFlag && idx > showIdxFlag) {
      tolowerFlag = false; // 为了防止触底事件误触发，将触底标识设置false
      
      this.setData({
        showIdxFlag: idx
      })

      wx.nextTick(() => {
        const query = wx.createSelectorQuery();
        for (let i = 0; i < goodsList.length; i++) {
          if (idx >= i && viewHeights[i] === 0) {
            query
              .select(`.${goodsList[i].id}`)
              .boundingClientRect(rect => {
                const height = rect ? rect.height : 0;
                viewHeights[i] = Number(height.toFixed(2));
              })
              .exec()
          }
        }
        this.setData({
          classifyType: id
        })

        tolowerFlag = true;
      })

    }

    classifyFlag = true;

    this.setData({
      classifyType: id,
      classifyIdx: idx,
      classifyScrollTop: idx * 80
    })

  }, 300, true),

  // 商品区域滚动事件
  onGoodsScroll: throttle(function (e) {
    // 因 scroll-into-view引起的滚动操作同样会触发scroll事件。加锁定状态处理
    if (classifyFlag) {
      classifyFlag = false
      return
    }

    const scrollTop = e.detail.scrollTop;
    let showCategoryIndex = 0;
    let curHeight = 0;

    for (let i = 0; i < viewHeights.length; i++) {
      curHeight += viewHeights[i]
      if (scrollTop < curHeight) break;
      if (showCategoryIndex < viewHeights.length - 1) showCategoryIndex++;
    }

    if (this.data.classifyIdx !== showCategoryIndex) {
      this.setData({
        classifyIdx: showCategoryIndex,
        classifyScrollTop: showCategoryIndex * 80
      })
    }
  }, 300),

  // 商品触底事件
  onGoodsScrolltolower(e) {

    const that = this;
    if (tolowerFlag) {
      tolowerFlag = false;
      const goodsList = that.data.goodsList;
      const maxLen = goodsList.length;
      const showIdxFlag = that.data.showIdxFlag;
      if (showIdxFlag < maxLen - 1) {
        console.log('触发触底事件并执行');

        const idx = showIdxFlag + 1;
        that.setData({
          showIdxFlag: idx
        })

        // 渲染完成后，再去获取这栏分类视图高度
        wx.nextTick(() => {
          const goodsId = goodsList[idx].id;
          const query = wx.createSelectorQuery()
          query
            .select(`.${goodsId}`)
            .boundingClientRect(rect => {
              const height = rect ? rect.height : 0;
              viewHeights[idx] = Number(height.toFixed(2));
            })
            .exec()

          tolowerFlag = true;
        })

      }
    }
  }

})