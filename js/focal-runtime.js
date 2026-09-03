/* ============================================================
 * 流动图片墙 — 焦点运行时(纯消费者)
 * ------------------------------------------------------------
 * 职责:
 *   1. 读取 window.FOCAL_POINTS(由 focal-points.js 注入的静态数据)
 *   2. 读取 localStorage.lumina.focal(可选,本地调试覆写用)
 *   3. 提供 FocalRuntime.applyTo(img, url) → 注入 CSS 变量
 *
 * 优先级: localStorage > 静态 FOCAL_POINTS > 默认(50% / 25%)
 *
 * 注意: 此文件不暴露任何 UI / 快捷键入口,
 *       管理焦点请通过 tools/start 脚本启动本地 manager/。
 * ============================================================ */
(function () {
  'use strict';

  const STATIC = (typeof window !== 'undefined' && window.FOCAL_POINTS) || {};
  const LS_KEY = 'lumina.focal';

  let ls = {};
  try {
    ls = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch (e) {
    console.warn('[Lumina] localStorage.lumina.focal 解析失败,已忽略。', e);
    ls = {};
  }

  const store = Object.assign({}, STATIC, ls);

  /**
   * 给一张 <img> 注入焦点 CSS 变量。
   * @param {HTMLImageElement} img
   * @param {string} url  图片 URL(用于查询 store)
   */
  function applyTo(img, url) {
    if (!img || !url) return;
    const p = store[url];
    if (
      p &&
      Number.isFinite(p.x) && p.x >= 0 && p.x <= 1 &&
      Number.isFinite(p.y) && p.y >= 0 && p.y <= 1
    ) {
      img.style.setProperty('--focal-x', (p.x * 100).toFixed(2) + '%');
      img.style.setProperty('--focal-y', (p.y * 100).toFixed(2) + '%');
    }
  }

  // 暴露 API(供 main.js 调用;不暴露管理 UI)
  window.FocalRuntime = {
    applyTo: applyTo,
    _store: store,
    _STATIC_COUNT: Object.keys(STATIC).length,
    _LS_COUNT: Object.keys(ls).length,
  };
})();
