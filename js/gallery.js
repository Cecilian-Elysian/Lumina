/* ============================================================
 * 光影画廊 (gallery.html) — 主逻辑
 * ------------------------------------------------------------
 * 执行流程：
 *   1. loadGalleries()  读取 CONFIG.galleries 作为相册数据
 *   2. renderGalleries() 渲染相册卡片网格
 *   3. initLightbox()  复用主页灯箱（点击卡片打开第一张图）
 *
 * 依赖：js/config.js 中定义的全局 CONFIG 对象（需先于本文件加载）
 * ============================================================ */

/* ============================================================
 * 工具函数
 * ============================================================ */

/**
 * HTML 转义：相册标题等来自配置的字符串插入页面前先转义，
 * 防止特殊字符破坏页面结构或注入脚本（XSS）
 *
 * @param {string} s 原始字符串
 * @returns {string} 转义后的安全字符串
 */
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ============================================================
 * 数据加载
 * ============================================================ */

/**
 * 读取 CONFIG.galleries 作为相册列表。
 * 若为空则用 fallbackImages 生成兜底演示数据。
 *
 * @returns {Array<{title:string, date:string, cover:string, description:string, images:Array<string>}>}
 */
function loadGalleries() {
  if (Array.isArray(CONFIG.galleries) && CONFIG.galleries.length > 0) {
    return CONFIG.galleries;
  }
  return CONFIG.fallbackImages.slice(0, 12).map((url, i) => ({
    title: '相册 ' + (i + 1),
    date: '2026-08-04',
    cover: url,
    description: '',
    images: [url],
  }));
}

/* ============================================================
 * 渲染相册网格
 * ============================================================ */

/**
 * 渲染相册卡片网格：每项一张卡片，含封面、标题、日期胶囊
 * @param {Array} albums 相册列表
 */
function renderGalleries(albums) {
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');

  if (!albums || albums.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');

  grid.innerHTML = albums.map((album, i) => (
    '<article class="gallery-card" data-index="' + i + '" tabindex="0">' +
      '<img src="' + escapeHtml(album.cover) + '"' +
        ' alt="' + escapeHtml(album.title) + '"' +
        ' loading="lazy" decoding="async">' +
      '<div class="gallery-card-meta">' +
        '<span class="gallery-card-title">' + escapeHtml(album.title) + '</span>' +
        '<span class="gallery-card-date">' + escapeHtml(album.date || '') + '</span>' +
      '</div>' +
    '</article>'
  )).join('');
}

/* ============================================================
 * 灯箱（点击卡片打开相册内图片）
 * ============================================================ */

// 灯箱全局状态
let gallery = [];   // 当前展示的相册图片数组 [{url, name}]
let current = 0;    // 当前图片在 gallery 中的下标
let lbEl, lbImg, lbCaption;

/**
 * 初始化灯箱：缓存 DOM、绑定打开/切换/关闭事件、键盘 ←/→/Esc
 * @param {Array} albums 相册列表（点击卡片时按 data-index 取相册）
 */
function initLightbox(albums) {
  lbEl      = document.getElementById('lightbox');
  lbImg     = document.getElementById('lb-img');
  lbCaption = document.getElementById('lb-caption');

  /* ---- 打开灯箱：事件委托 ----
   * 监听相册网格的 click，根据 data-index 找到对应相册，
   * 把该相册的 images 作为灯箱的 gallery。 */
  document.getElementById('gallery-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.gallery-card');
    if (!card) return;
    const idx = Number(card.dataset.index);
    const album = albums[idx];
    if (!album) return;

    // 相册内的图片数组；没有 images 时用 cover 单张兜底
    const imgs = (album.images && album.images.length > 0) ? album.images : [album.cover];
    gallery = imgs.map(url => ({ url, name: album.title }));
    openLightbox(0);
  });

  // 键盘回车 / 空格 也可打开（卡片已设置 tabindex=0）
  document.getElementById('gallery-grid').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.gallery-card');
    if (!card) return;
    e.preventDefault();
    card.click();
  });

  // 上一张 / 下一张 / 关闭 按钮
  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click',  () => show(current - 1));
  document.getElementById('lb-next').addEventListener('click',  () => show(current + 1));

  // 点击遮罩空白处关闭
  lbEl.addEventListener('click', (e) => {
    if (e.target === lbEl) closeLightbox();
  });

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    if (lbEl.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft')  show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'Escape')     closeLightbox();
  });
}

/**
 * 打开灯箱并显示指定图片
 * @param {number} idx 图片在 gallery 中的下标
 */
function openLightbox(idx) {
  show(idx);
  lbEl.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

/**
 * 切换显示的图片（支持循环）
 * @param {number} idx 目标下标
 */
function show(idx) {
  const total = gallery.length;
  if (total === 0) return;

  current = ((idx % total) + total) % total;
  const img = gallery[current];

  lbImg.classList.add('lb-loading');
  lbImg.onload = lbImg.onerror = () => lbImg.classList.remove('lb-loading');
  lbImg.src = img.url;
  if (lbImg.complete) lbImg.classList.remove('lb-loading');
  lbImg.alt = img.name || '图片 ' + (current + 1);

  lbCaption.textContent = (current + 1) + ' / ' + total +
    (img.name ? ' · ' + img.name : '');
}

/**
 * 关闭灯箱
 */
function closeLightbox() {
  lbEl.classList.add('hidden');
  document.body.style.overflow = '';
}

/* ============================================================
 * 入口
 * ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const albums = loadGalleries();
  renderGalleries(albums);
  initLightbox(albums);
});