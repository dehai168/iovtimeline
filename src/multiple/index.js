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
    // canvas元素
    this._canvas = document.getElementById(domid);
    // 画笔对象
    this._ctx = this._canvas.getContext("2d");
    // 画布宽度
    this._canvasWidth = this._canvas.clientWidth;
    // 画布高度
    this._canvasHeight = this._canvas.clientHeight;
    // 时间轴整体背景
    this._backgroundColor = options.backgroundColor || "#2b2f33";
    // 刻度线背景
    this._scaleBackgroundColor = options.scaleBackgroundColor || "rgba(69, 72, 76, 0.5)";
    // 刻度线背景高度
    this._scaleBackgroundHeight = options.scaleBackgroundHeight || 20;
    // 刻度线颜色
    this._scaleLineColor = options.scaleLineColor || "rgba(151,158,167,1)";
    // 刻度线粗细
    this._scaleLineBorderWidth = options.scaleLineBorderWidth || 1;
    // 刻度线间隔
    this._scaleLineSpace = 20;
    // 刻度线字体颜色
    this._scaleTextColor = options.scaleTextColor || "rgba(151,158,167,1)";
    // 刻度线字体大小
    this._scaleTextSize = options.scaleTextSize || "12";
    // 录像时间段颜色
    this._blockFillColor = options.blockFillColor || "rgba(69, 72, 76, 0.5)";
    // 指针线颜色
    this._pointLineColor = options.pointLineColor || "rgb(64, 196, 255,1)";
    // 指针线粗细
    this._pointLineBorderWidth = 2;
    // 指针文字颜色
    this._pointTextColor = options.pointTextColor || "rgb(64, 196, 255,1)";
    // 指针文字大小
    this._pointTextSize = 12;
    // 时间轴点击
    this._onTimeLineClick = options.onTimeLineClick || null;

    this._init();
  }
  /**
   * 初始化
   */
  _init() {
    this._drawBackground();
  }
  /**
   * 绑定事件
   */
  _bindEvent() {}
  /**
   *绘制背景
   */
  _drawBackground() {
    //整体
    this._ctx.fillStyle = this._backgroundColor;
    this._ctx.fillRect(0, 0, this._canvasWidth, this._canvasHeight);
    //刻度线部分
    this._ctx.fillStyle = this._scaleBackgroundColor;
    this._ctx.fillRect(0, 0, this._canvasWidth, this._scaleBackgroundHeight);
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
  /**
   * 获取鼠标x轴位置
   * @returns {number}
   */
  _cursorX() {
    var posx = 0;

    if (!e) {
      e = window.event;
    }

    if (e.pageX || e.pageY) {
      posx = e.pageX;
    } else if (e.clientX || e.clientY) {
      posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    }

    return posx;
  }
}
