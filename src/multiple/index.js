/*
 * Copyright (C) 2023 dehai.site All Rights Reserved.
 *
 * @author level <dehai168@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

export class Multiple {
  /**
   * 初始化多路时间轴
   * @param {String} domid   标签元素id
   * @param {Object} options 地图参数
   */
  constructor(domid, options) {
    this.domId = domid;
    this.ctx = null;
    this.ctxDom = null;
    this.time = "";
    this.timeList = [];
    this.asyncTimes = [];
    this.unit = 0;
    this.rate = 1;
    this.isDragFlag = false;
    this.isIntevFlag = null;
    this.options = {
      // 是否同步
      isSync: false,
      // 整体背景色
      bgColor: "#2b2f33",
      // 宽度,单位 px
      width: 1024,
      // 高度,单位 px
      height: 200,
      // 顶部高度
      topHeight: 35,
      // 顶部背景色
      topBgColor: "rgba(69, 72, 76, 0.5)",
      // 主区域背景色
      mainBgColor: "#2b2f33",
      // 轴线颜色
      axisColor: "rgba(151,158,167,1)",
      // 轴线粗细
      axisWeight: 1,
      // 刻度字体颜色，支持 Hex/Rgb
      axisTitleColor: "rgba(151,158,167,1)",
      // 刻度字体大小
      axisTitleSize: 12,
      // 小时数
      hour: 24,
      // 横向虚线粗细
      dottedLineWeight: 0.5,
      // 横向虚线颜色
      dottedLineColor: "rgba(7,83,168,1)",
      // 时间轴背景色
      timeLineRectBgColor: "rgba(7,83,168,0.8)",
      // 时间轴报警颜色
      timeLineSpecialRectBgColor: "rgba(255,0,0,0.5)",
      // 时间轴指针颜色
      timePointerColor: "rgba(0,205,0,1)",
      // 时间轴指针颜色
      timePointerTitleColor: "rgba(0,205,0,1)",
      // 时间轴指针文字大小
      timePointerTitleSize: 12,
      // 时间轴高度
      timeLineRectHeight: 25,
      // 显示帧数
      fps: 15,
      // 时间轴变化回调
      timeCb: null,
    };
    this._init(options);
  }
  /**
   * 初始化
   */
  _init(options) {
    var that = this;
    this.setOptions(options);
    if (this.domId.length > 0) {
      var container = document.getElementById(this.domId);
      container.style = "display:block;padding:0px;overflow-x:auto;width:" + this.options.width + "px;";
      while (container.hasChildNodes()) {
        container.removeChild(container.firstChild);
      }
      this.ctxDom = document.createElement("canvas");
      this.ctxDom.height = this.options.height;
      this.ctx = this.ctxDom.getContext("2d");

      this._changeRate();

      container.appendChild(this.ctxDom);
    } else {
      console.log("domid is need");
      return;
    }
    if (this.isIntevFlag) {
      clearInterval(this.isIntevFlag);
    }
    this.isIntevFlag = setInterval(function () {
      that._drawBase();
      that._drawTimeLineRect();
      if (!that.isSync) {
        that._drawTimeLineSyncPointer();
      }
      that._drawTimeLinePointer();
    }, 1000 / this.options.fps);
    this._bindEvent();
  }
  // 设置参数
  setOptions(options) {
    if (options) {
      for (var key in options) {
        if (Object.hasOwnProperty.call(options, key)) {
          var element = options[key];
          this.options[key] = element;
        }
      }
    }
  }
  // 放大
  zoomin() {
    //TODO 4倍以上canvas长度过长浏览器不支持，需要换方案
    if (this.rate < 4) {
      this.rate = this.rate * 2;
      this.options.width = this.options.width * this.rate;
      this._changeRate();
    }
  }
  // 缩小
  zoomout() {
    if (this.rate > 1) {
      this.options.width = this.options.width / this.rate;
      this.rate = this.rate / 2;
      this._changeRate();
    }
  }
  // 设置时间轴
  setTimes(times) {
    if (times.length > 0) {
      this.timeList.length = 0;
      this.timeList = times;
    }
  }
  // 设置同步时间点
  setSyncTime(time) {
    if (time) {
      this.time = time;
    }
  }
  // 获取时间点
  getSyncTime() {
    return this.time;
  }
  // 设置异步时间点
  setAsyncTimes(times) {
    if (times) {
      this.asyncTimes = times;
    }
  }
  // 获取异步时间点
  getAsyncTimes() {
    return this.asyncTimes;
  }
  // 设置单位
  _changeRate() {
    this.ctxDom.width = this.options.width;
    this.unit = (this.options.hour * 3600) / this.options.width;
  }
  // 绘制基本
  _drawBase() {
    // 背景
    this.ctx.fillStyle = this.options.bgColor;
    this.ctx.fillRect(0, 0, this.options.width, this.options.height);
    this.ctx.fillStyle = this.options.topBgColor;
    this.ctx.fillRect(0, 0, this.options.width, this.options.topHeight);
    this.ctx.fillStyle = this.options.mainBgColor;
    this.ctx.fillRect(0, this.options.topHeight, this.options.width, this.options.height - this.options.topHeight);
    // 时间刻度
    var axisSpanWidth = this.options.width / this.options.hour / this.rate;
    var mUnit = 60;
    var axisSpan = mUnit / this.rate;
    var end = this.options.hour * this.rate;
    var pointHeight = 0;
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.options.axisColor;
    this.ctx.lineWidth = this.options.axisWeight;
    this.ctx.fillStyle = this.options.axisTitleColor;
    this.ctx.font = this.options.axisTitleSize + "px Arial";
    for (let index = 0; index < end + 1; index++) {
      this.ctx.moveTo(index * axisSpanWidth, 0);
      var m = index * axisSpan;
      var h = Math.floor(m / mUnit);
      h = h < 10 ? "0" + h : "" + h;
      m = Math.floor(m % mUnit);
      m = m < 10 ? "0" + m : "" + m;
      var text = h + ":" + m;
      if (index % 2) {
        pointHeight = 5;
      } else {
        pointHeight = 10;
        var x = 0;
        if (index === 0) {
          x = 0;
        } else if (index === end) {
          x = this.options.width - this.options.axisTitleSize * 2.5;
        } else {
          x = index * axisSpanWidth - (this.options.axisTitleSize * 2.5) / 2;
        }
        this.ctx.fillText(text, x, this.options.topHeight - pointHeight);
      }
      this.ctx.lineTo(index * axisSpanWidth, pointHeight);
    }
    this.ctx.stroke();
  }
  // 绘制TimeLine 矩形框
  _drawTimeLineRect() {
    var timeCount = this.timeList.length;
    var lineHeight = (this.options.height - this.options.topHeight) / timeCount;
    var yOffset = this.isSync ? (lineHeight - this.options.timeLineRectHeight) / 2 : 2;
    this.ctx.beginPath();
    for (let index = 0; index < this.timeList.length; index++) {
      var time = this.timeList[index];
      for (let j = 0; j < time.length; j++) {
        var timeSpan = time[j];
        var x1 = this._time2px(timeSpan.st);
        var x2 = this._time2px(timeSpan.et);
        if (timeSpan.sp) {
          this.ctx.fillStyle = this.options.timeLineSpecialRectBgColor;
        } else {
          this.ctx.fillStyle = this.options.timeLineRectBgColor;
        }
        var y = this.options.topHeight + index * lineHeight + yOffset;
        var width = x2 - x1;
        this.ctx.fillRect(x1, y, width, this.options.timeLineRectHeight);
      }
    }
    //时间轴间隔虚线
    this.ctx.beginPath();
    this.ctx.lineWidth = this.options.dottedLineWeight;
    this.ctx.strokeStyle = this.options.dottedLineColor;
    this.ctx.setLineDash([8, 8]);
    for (let index = 0; index < timeCount - 1; index++) {
      var y = this.options.topHeight + (index + 1) * lineHeight;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.options.width, y);
    }
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }
  // 绘制TimeLine矩形框下面独立时间
  _drawTimeLineSyncPointer() {
    var timeCount = this.timeList.length;
    var lineHeight = (this.options.height - this.options.topHeight) / timeCount;
    var yOffset = this.isSync ? (lineHeight - this.options.timeLineRectHeight) / 2 : 2;
    for (let index = 0; index < this.asyncTimes.length; index++) {
      const timeSpan = this.asyncTimes[index];
      const x1 = this._time2px(timeSpan);
      const y1 = this.options.topHeight + index * lineHeight + yOffset;
      const y2 = y1 + this.options.timeLineRectHeight;
      var xOffset = 0;
      var titleWidth = this.options.timePointerTitleSize * 4;
      if (x1 < titleWidth) {
        xOffset = 0;
      } else if (x1 > this.options.width - titleWidth) {
        xOffset = titleWidth;
      } else {
        xOffset = (this.options.timePointerTitleSize * 4) / 2;
      }
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.options.timePointerColor;
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x1, y2);
      this.ctx.stroke();
      this.ctx.fillStyle = this.options.timePointerTitleColor;
      this.ctx.font = this.options.timePointerTitleSize + "px Arial bolder";
      this.ctx.fillText(timeSpan, x1 - xOffset, y2 + this.options.timePointerTitleSize);
    }
  }
  // 绘制TimeLine 指针
  _drawTimeLinePointer() {
    if (this.time.length === 0) return;
    var x1 = this._time2px(this.time);
    var x2 = x1;
    var y2 = this.options.height;
    var xOffset = 0;
    var titleWidth = this.options.timePointerTitleSize * 4;
    if (x1 < titleWidth) {
      xOffset = 0;
    } else if (x1 > this.options.width - titleWidth) {
      xOffset = titleWidth;
    } else {
      xOffset = (this.options.timePointerTitleSize * 4) / 2;
    }
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.options.timePointerColor;
    this.ctx.moveTo(x1, this.options.topHeight);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.fillStyle = this.options.timePointerTitleColor;
    this.ctx.font = this.options.timePointerTitleSize + "px Arial bolder";
    this.ctx.fillText(this.time, x1 - xOffset, this.options.topHeight);
  }
  // 时间到像素点转换
  _time2px(timespan) {
    var tempArray = timespan.split(":");
    if (tempArray.length !== 3) return 0;
    var seconds = parseInt(tempArray[0]) * 3600 + parseInt(tempArray[1]) * 60 + parseInt(tempArray[2]);
    return seconds / this.unit;
  }
  // 像素点到时间转换
  _px2time(px) {
    if (px < 0) return;
    var seconds = px * this.unit;
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds / 60) % 60);
    var s = Math.floor(seconds % 60);
    var toRound = function (value) {
      if (value < 10) {
        return "0" + value;
      } else {
        return "" + value;
      }
    };
    return toRound(h) + ":" + toRound(m) + ":" + toRound(s);
  }
  // 鼠标坐标转换成画板坐标
  _mousePoint2CxtPoint(x, y) {
    var react = this.ctxDom.getBoundingClientRect();
    return {
      x: x - react.left,
      y: y - react.top,
    };
  }
  /**
   * 绑定事件
   */
  _bindEvent() {
    var that = this;
    this.ctxDom.onmousedown = function (e) {
      that.isDragFlag = true;
    };
    this.ctxDom.onmousemove = function (e) {
      if (that.isDragFlag) {
        var point = that._mousePoint2CxtPoint(e.clientX, e.clientY);
        that.time = that._px2time(point.x);
      }
    };
    this.ctxDom.onmouseup = function (e) {
      if (that.isDragFlag) {
        that.isDragFlag = false;
      }
      var point = that._mousePoint2CxtPoint(e.clientX, e.clientY);
      that.time = that._px2time(point.x);
      if (that.options.timeCb) {
        that.options.timeCb(that.time);
      }
    };
    // 鼠标滚轮
    this.ctxDom.addEventListener("mousewheel", function (event) {
      if (event && event.preventDefault) {
        event.preventDefault();
      } else {
        window.event.returnValue = false;
        return false;
      }

      var e = window.event || event;
      var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
      if (delta < 0) {
        that.zoomin();
      } else if (delta > 0) {
        that.zoomout();
      }
    });
  }
  /**
   * 转换时间格式
   * @param {(Object|string|number)} time
   * @param {string} cFormat
   * @returns {string | null}
   */
  _parseTime(time, cFormat) {
    if (arguments.length === 0 || !time) {
      return null;
    }
    const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
    let date;
    if (typeof time === "object") {
      date = time;
    } else {
      if (typeof time === "string") {
        if (/^[0-9]+$/.test(time)) {
          // support "1548221490638"
          time = parseInt(time);
        } else {
          // support safari
          // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
          time = time.replace(new RegExp(/-/gm), "/");
        }
      }

      if (typeof time === "number" && time.toString().length === 10) {
        time = time * 1000;
      }
      date = new Date(time);
    }
    const formatObj = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      i: date.getMinutes(),
      s: date.getSeconds(),
      a: date.getDay(),
    };
    const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
      const value = formatObj[key];
      // Note: getDay() returns 0 on Sunday
      if (key === "a") {
        return ["日", "一", "二", "三", "四", "五", "六"][value];
      }
      return value.toString().padStart(2, "0");
    });
    return time_str;
  }
}
