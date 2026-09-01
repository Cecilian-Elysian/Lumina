/* ============================================================
 * 流动图片墙 — 全局配置文件
 * ------------------------------------------------------------
 * ★★★ 这是你唯一需要修改的文件 ★★★
 *
 * 所有可变项（图床接口、token、行数、兜底图等）都集中在这里。
 * 修改后刷新页面即可生效，无需改动 main.js / style.css。
 *
 * ⚠⚠⚠ 安全警告 ⚠⚠⚠
 *  1. 本项目为纯前端站点，token 会被打包进公开的 JS 文件，
 *     任何访问者都能在浏览器中看到它。
 *  2. 因此【强烈建议】使用图床的【只读 / 低权限 token】，
 *     绝对不要使用具备上传、删除权限的主 token！
 *  3. 提交到 GitHub 之前，务必确认 token 是否愿意公开。
 * ============================================================ */

const CONFIG = {

  /* ------------------------------------------------------------
   * 〇、数据源模式（重要）
   * ------------------------------------------------------------
   *   'proxy'  → 【推荐】请求本站 /api/images 代理（functions/api/images.js）
   *              token 存放在 Cloudflare Pages 环境变量 QUBU_TOKEN，
   *              前端代码与 GitHub 仓库中【完全不含 token】，安全。
   *              本地开发需运行：npx wrangler pages dev .
   *   'direct' → 前端直连图床：填好下方 apiBase + token 即可。
   *              ⚠️ token 会暴露给所有访问者（写在公开 JS 里），
   *              仅建议调试时临时使用。
   * ---------------------------------------------------------- */
  mode: 'proxy',

  /* ------------------------------------------------------------
   * 一、图床接口配置（仅 direct 直连模式使用；proxy 模式忽略）
   * ------------------------------------------------------------
   * 直连模式时页面会请求 `apiBase + listPath` 拉取图片列表。
   * 如果 apiBase 或 token 留空，页面会直接使用下方
   * fallbackImages（兜底演示图），方便你先预览整体效果。
   * ---------------------------------------------------------- */

  // 图床 API 的根地址（不含接口路径）
  // 已实测：去不图床 7bu.top（CZL 同款程序），接口 /api/v1/images
  apiBase: 'https://7bu.top/api/v1',

  // 获取图片列表的接口路径（拼在 apiBase 后面）
  listPath: '/images',

  // 鉴权方式：
  //   'bearer' → 请求头带 Authorization: Bearer <token>（最常见）
  //   'header' → 请求头带自定义头（头名见 authKey，值前缀见 tokenPrefix）
  //   'none'   → 不带鉴权（公开接口）
  authType: 'bearer',

  // 当 authType = 'header' 时使用的请求头名称，例如 'X-API-Key'
  authKey: 'Authorization',

  // 当 authType = 'header' 时 token 前缀，例如 'Bearer '；bearer 模式忽略此项
  tokenPrefix: 'Bearer ',

  // ★ 仅 direct 直连模式需要填 token（会暴露给访问者！）
  // proxy 模式下请留空 —— token 请配置到：
  //   Cloudflare Pages → Settings → Environment variables → QUBU_TOKEN
  // 本地开发则在项目根目录 .dev.vars 文件写入：QUBU_TOKEN=你的token
  // （.dev.vars 已被 .gitignore 忽略，不会提交）
  token: '',

  /* ------------------------------------------------------------
   * 二、返回数据字段映射
   * ------------------------------------------------------------
   * 不同图床返回的 JSON 结构不同，这里用"点分路径"告诉
   * main.js 去哪里取数据，无需改代码即可适配大多数图床。
   * 支持嵌套路径（点分多级）。
   *
   * 当前配置为去不图床 7bu.top 的实际返回结构：
   *   {
   *     "status": true,
   *     "data": {
   *       "data": [
   *         {
   *           "origin_name": "146659727_p1.png",
   *           "links": {
   *             "url": "https://bu.dusays.com/...png",           ← 原图直链
   *             "thumbnail_url": "https://7bu.top/thumbnails/..." ← 缩略图
   *           }
   *         }
   *       ]
   *     }
   *   }
   * ---------------------------------------------------------- */

  // 图片数组在返回 JSON 中的路径（用 . 分隔层级）
  imgField: 'data.data',

  // 数组元素中"原图 URL"的字段路径（支持嵌套，灯箱大图用）
  imgUrlField: 'links.url',

  // 数组元素中"缩略图 URL"的字段路径（卡片小图用，加载快；
  // 留空 '' 或取不到时自动回退原图）
  imgThumbField: 'links.thumbnail_url',

  // 数组元素中"图片名称"的字段路径（灯箱底部会显示；没有则留 ''）
  imgNameField: 'origin_name',

  // 拉取数量（每页条数）。图片墙建议 40~80 张，太多影响首屏速度
  perPage: 60,

  /* ------------------------------------------------------------
   * 三、图片墙布局
   * ---------------------------------------------------------- */

  // 叠层行数（4 = 四行，奇偶行自动反向流动；手机端会自动减行，见 css）
  rows: 4,

  // 每张卡片的图片宽度（px）。高度统一、宽度按此值等比
  cardWidth: 300,

  /* ------------------------------------------------------------
   * 四、兜底演示图（fallback）
   * ------------------------------------------------------------
   * 以下情况会使用这些图片：
   *   1. apiBase 或 token 留空（未配置图床）
   *   2. 接口请求失败（网络错误 / 401 鉴权失败 / 字段路径不匹配）
   *
   * 当前使用 picsum.photos 固定种子占位图（每次刷新不变）。
   * 你也可以换成自己的图片直链。
   * ---------------------------------------------------------- */
  fallbackImages: [
    'https://picsum.photos/seed/lumina-01/600/400',
    'https://picsum.photos/seed/lumina-02/600/400',
    'https://picsum.photos/seed/lumina-03/600/400',
    'https://picsum.photos/seed/lumina-04/600/400',
    'https://picsum.photos/seed/lumina-05/600/400',
    'https://picsum.photos/seed/lumina-06/600/400',
    'https://picsum.photos/seed/lumina-07/600/400',
    'https://picsum.photos/seed/lumina-08/600/400',
    'https://picsum.photos/seed/lumina-09/600/400',
    'https://picsum.photos/seed/lumina-10/600/400',
    'https://picsum.photos/seed/lumina-11/600/400',
    'https://picsum.photos/seed/lumina-12/600/400',
    'https://picsum.photos/seed/lumina-13/600/400',
    'https://picsum.photos/seed/lumina-14/600/400',
    'https://picsum.photos/seed/lumina-15/600/400',
    'https://picsum.photos/seed/lumina-16/600/400',
  ],
};
