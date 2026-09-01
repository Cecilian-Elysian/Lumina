# Lumina · 流动图片墙

纯 HTML + CSS + JS 的静态单页网站：多行叠层、水平无缝流动的图片墙，点击图片弹出灯箱预览。

图片来自**去不图床 (7bu.top)**，通过 **Cloudflare Pages Function 代理**拉取——token 只存在 Cloudflare 环境变量中，仓库与前端代码零 token 暴露。

## 架构

```
浏览器（无 token）
   │ fetch /api/images
   ▼
Cloudflare Pages Function  functions/api/images.js
   │ 注入环境变量 QUBU_TOKEN
   ▼
去不图床 API  https://7bu.top/api/v1/images
   │ 返回图片列表 JSON
   ▼
图片墙渲染（卡片用缩略图，灯箱用原图）
```

## 快速开始

```bash
# 方式一（推荐，带 /api/images 代理，可看真实图床数据）：
npx wrangler pages dev . --port 8001
# 打开 http://127.0.0.1:8001

# 方式二（纯静态服务器，无代理接口 → 自动回退兜底演示图）：
python -m http.server 8000
# 打开 http://127.0.0.1:8000
```

> 本地运行代理模式前，需在项目根目录创建 `.dev.vars`（已被 .gitignore 忽略）：
>
> ```
> QUBU_TOKEN=你的图床token
> ```

## 配置说明（js/config.js）

| 字段 | 说明 |
|---|---|
| `mode` | `'proxy'` 代理模式（推荐）／`'direct'` 前端直连（token 会暴露，仅调试用） |
| `rows` / `cardWidth` / `perPage` | 行数 / 卡片宽度 / 拉取数量 |
| `imgField` 等 | 图床返回字段映射（已按 7bu.top 实测配好，通常无需改动） |
| `fallbackImages` | 兜底演示图（接口失败/未配置时使用） |

## 部署到 Cloudflare Pages（Git 集成）

1. 代码已推送至 GitHub 仓库 `Cecilian-Elysian/Lumina`
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**，选择该仓库
3. 构建配置（纯静态）：
   - Framework preset: `None`
   - **Build command: 留空**
   - **Build output directory: `.`**
4. ★ 关键一步——配置密钥（二选一）：
   - Dashboard：Pages 项目 → **Settings → Environment variables → Add**，名称 `QUBU_TOKEN`，值为图床 token（Production 与 Preview 都要添加），添加后需重新部署生效
   - CLI：`npx wrangler pages secret put QUBU_TOKEN --project-name=<项目名>`
5. 部署完成后获得 `https://<项目名>.pages.dev`
6. 绑定自定义域名：Pages 项目 → **Custom domains** → 添加域名（域名在 Cloudflare DNS 托管时自动签发 SSL）

之后每次 `git push` 到 `main` 自动重新部署。

## 自定义外观

- **换主题**：`css/style.css` 顶部 `:root` CSS 变量（配色、卡高、圆角、间距）
- **行数 / 卡宽 / 图片数量**：`js/config.js` 的 `rows` / `cardWidth` / `perPage`
- **各行速度与方向**：`js/main.js` `renderWall()` 中 `animationDuration` / `animationDirection`
- **更换图床**：修改 `functions/api/images.js` 中 `upstreamUrl`，及 `js/config.js` 字段映射

## 文件结构

```
Lumina/
├── index.html               # 页面骨架（header / 图片墙容器 / 灯箱）
├── css/style.css            # 全部样式（含主题变量、动画、响应式）
├── js/config.js             # 配置文件（模式/字段映射/布局，不含 token）
├── js/main.js               # 逻辑：拉取 → 渲染 → 灯箱
├── functions/api/images.js  # Pages Function 代理（服务端注入 token）
├── .dev.vars                # 本地开发密钥（git 忽略，不入库）
└── README.md
```

## 安全说明

- 图床 token 只存在两处：Cloudflare 环境变量（线上）、`.dev.vars`（本地，已 gitignore）
- 前端 JS、GitHub 仓库、浏览器网络请求中均无 token
- 代理对 `per_page` 参数做了 1~100 区间限制，防止滥用
- 代理响应带 5 分钟边缘缓存，降低图床限流（180 次/分钟）风险

