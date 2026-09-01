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
   * 一、图床接口配置
   * ------------------------------------------------------------
   * 页面加载时会请求 `apiBase + listPath` 拉取图片列表。
   * 如果 apiBase 或 token 留空，页面会直接使用下方
   * fallbackImages（兜底演示图），方便你先预览整体效果。
   * ---------------------------------------------------------- */

  // 图床 API 的根地址（不含接口路径），例如：
  //   'https://img.example.com/api/v1'
  // 留空 '' = 不请求接口，直接用兜底图演示
  apiBase: '',

  // 获取图片列表的接口路径（拼在 apiBase 后面），例如：
  //   '/images'
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

  // ★ 你的图床 token（占位符，请自行填入）
  // ⚠️ 建议使用只读权限的 token，切勿使用可上传/删除的主 token！
  token: '',

  /* ------------------------------------------------------------
   * 二、返回数据字段映射
   * ------------------------------------------------------------
   * 不同图床返回的 JSON 结构不同，这里用"点分路径"告诉
   * main.js 去哪里取数据，无需改代码即可适配大多数图床。
   *
   * 示例：假设接口返回——
   *   {
   *     "status": true,
   *     "data": {
   *       "data": [
   *         { "name": "风景1", "url": "https://.../a.png" },
   *         ...
   *       ]
   *     }
   *   }
   * 那么：
   *   imgField   = 'data.data'   （数组所在路径）
   *   imgUrlField  = 'url'       （数组元素里图片地址的字段名）
   *   imgNameField = 'name'      （数组元素里图片名称的字段名，可留 ''）
   * ---------------------------------------------------------- */

  // 图片数组在返回 JSON 中的路径（用 . 分隔层级）
  imgField: 'data.data',

  // 数组元素中"图片 URL"的字段名
  imgUrlField: 'url',

  // 数组元素中"图片名称"的字段名（灯箱底部会显示；没有则留 ''）
  imgNameField: 'name',

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
