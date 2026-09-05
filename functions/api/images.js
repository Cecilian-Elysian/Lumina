/* ============================================================
 * Cloudflare Pages Function — 图床 API 代理
 * ------------------------------------------------------------
 * 路由：/api/images（目录即路由：functions/api/images.js）
 *
 * 作用（安全核心）：
 *   浏览器 → 本函数（无 token） → 7bu.top 图床 API（注入 token）
 *
 *   token 存放在 Cloudflare Pages 的【环境变量 QUBU_TOKEN】中，
 *   只在服务端（边缘节点）读取，永远不会出现在：
 *     - 前端 JS 代码 / GitHub 仓库
 *     - 浏览器网络请求 / 页面源码
 *
 * 配置环境变量的两种方式：
 *   A. Dashboard：Pages 项目 → Settings → Environment variables
 *      → 添加 QUBU_TOKEN（Production 和 Preview 都要加）
 *   B. CLI：npx wrangler pages secret put QUBU_TOKEN --project-name=<项目名>
 *
 * 本地开发（wrangler pages dev）：
 *   在项目根目录建 .dev.vars 文件写入 QUBU_TOKEN=xxx
 *   （.dev.vars 已加入 .gitignore，绝不会被提交）
 * ============================================================ */

// Pages Functions 约定导出：onRequest 处理所有方法的请求
export async function onRequest(context) {
  // context.env —— 环境变量（含 Dashboard/CLI 配置的 Secrets）
  // context.request —— 原始请求
  const { request, env } = context;

  // 读取密钥；未配置时返回明确的错误提示，方便部署排错
  const token = env.QUBU_TOKEN;
  if (!token) {
    return json(500, {
      status: false,
      message: '未配置环境变量 QUBU_TOKEN，请在 Pages 项目 Settings → Environment variables 中添加',
      data: {},
    });
  }

  /* ---- 构造对图床上游的请求 ----
   * 只透传安全的查询参数（per_page / order），
   * 防止调用者通过代理滥用图床的其他接口参数 */
  const perPage = clampInt(new URL(request.url).searchParams.get('per_page'), 1, 100, 60);

  const upstreamUrl = new URL('https://7bu.top/api/v1/images');
  upstreamUrl.searchParams.set('order', 'newest');
  upstreamUrl.searchParams.set('per_page', String(perPage));

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
        // ★ 安全关键：token 只在这里注入（服务端），前端永远看不到
        Authorization: 'Bearer ' + token,
      },
    });

    // 把上游响应体原样透传给浏览器（流式转发，不额外占内存）
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // 列表每次加载都取最新：新增图片刷新即可见
        // （个人小站访问量低，远低于图床 180 次/分钟限流）
        'Cache-Control': 'public, no-cache',
      },
    });
  } catch (err) {
    // 图床不可达 / 超时等网络异常
    return json(502, {
      status: false,
      message: '图床请求失败：' + (err && err.message ? err.message : String(err)),
      data: {},
    });
  }
}

/* ---------- 小工具 ---------- */

/**
 * 构造 JSON 响应（统一与图床一致的三段式结构，前端兜底逻辑可直接复用）
 */
function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/**
 * 把参数限制在 [min, max] 区间内的整数（非法/越界时用默认值）
 * 防止恶意传参（如 per_page=999999）打到图床
 */
function clampInt(raw, min, max, fallback) {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
