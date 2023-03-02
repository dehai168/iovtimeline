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

export class Single {
  /**
   * 初始化单路时间轴
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
    // 时间轴背景
    this._backgroundColor = options.backgroundColor || "#2b2f33";
    
  }
  _bindEvent() {}
}
