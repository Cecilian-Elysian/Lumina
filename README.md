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
node tools/build-pages.mjs
npx wrangler pages dev dist --port 8001
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
| `thumbWidth` / `thumbRewrite` | 缩略图改写预留配置；7bu.top 当前不支持改尺寸，保持 `null` |
| `fallbackImages` | 兜底演示图（接口失败/未配置时使用） |

流动卡片使用响应式 `srcset`：普通屏优先缩略图，Retina/高分屏自动选择原图；灯箱始终加载原图。

## 部署到 Cloudflare Pages（Git 集成）

1. 代码已推送至 GitHub 仓库 `Cecilian-Elysian/Lumina`
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**，选择该仓库
3. 构建配置：
   - Framework preset: `None`
   - **Build command: `node tools/build-pages.mjs`**
   - **Build output directory: `dist`**
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

## 自定义图片焦点(防止头像被裁)

图片墙统一使用 `object-fit: cover` 裁剪,会导致竖版人像的头部被切掉。
项目采用 **Manager/Viewer 双轨架构**:

- **Viewer**(本仓库根目录):纯静态,只读取 `js/focal-points.js` 渲染。
- **Manager**(`manager/`):仅保存在本机并被 Git 忽略,不上传 GitHub、不部署 Cloudflare。
- **Tools**(`tools/`):本地 HTTP 服务与 AI 工具,源码进入 GitHub,但不进入 `dist/`。

### 数据流向(单向)

```
图床 URL → 本地 Manager 手动编辑 / Tools AI 分析
         → 写入 js/focal-points.js
         → 提交 GitHub
         → Cloudflare 部署 Viewer
```

### 快速使用

**可视化编辑(推荐):**

```bash
# Windows:双击 tools/start.bat
# macOS/Linux:
./tools/start.sh
```

启动后浏览器自动打开 `http://127.0.0.1:8002/manager/`,
点击每张图片标记主角位置,最后点 "💾 保存到 viewer"。

保存后可点 "↥ 同步并部署"。Tools 只会执行 `git add/commit/push` 于
`js/focal-points.js`，推送到 `origin/main` 后由 Cloudflare Pages 自动部署；不会提交工作区中其他改动。

`manager/` 不受 Git 保护,请自行保留本机备份。目录缺失时 Tools 会拒绝启动并给出明确提示。

**AI 批量分析:**

```bash
cd tools
npm install                                   # 首次
node ai/build-focal-points.mjs                # 自动检测人脸并写入 ../js/focal-points.js
```

可选参数:`--strategy=center`(多人合影)、`--source=upstream`(从真实图床拉)、`--concurrency=8`、`--download-only`(只下载模型)。

**手动编辑:**

直接编辑 `js/focal-points.js`,格式为 `{url: {x: 0~1, y: 0~1}}`:

```js
window.FOCAL_POINTS = {
  'https://example.com/portrait.jpg': { x: 0.5, y: 0.25 },  // 居中偏上
  'https://example.com/group.jpg':    { x: 0.5, y: 0.50 },  // 居中
};
```

`x/y` 为归一化坐标(0=左/上,1=右/下);无数据时 viewer 回退默认 `50% / 25%`(适合多数人像)。

详细说明见 `tools/README.md`。

## 文件结构

```
Lumina/
├── index.html                       # 页面骨架(header / 图片墙容器 / 灯箱)
├── 404.html                         # Cloudflare 未知路径 404 页面
├── css/style.css                    # 全部样式(含主题变量、动画、响应式)
├── js/
│   ├── config.js                    # 配置文件(模式/字段映射/布局,不含 token)
│   ├── main.js                      # 逻辑:拉取 → 渲染 → 灯箱
│   ├── focal-points.js              # 焦点数据(由 tools/ 产出)
│   └── focal-runtime.js             # 焦点运行时消费者
├── functions/api/images.js          # Pages Function 代理(服务端注入 token)
├── manager/                         # 本地 Manager UI(Git 忽略,不在仓库/部署产物中)
│   ├── index.html
│   ├── manager.js
│   └── manager.css
├── tools/                           # 可跟踪的本地服务、AI 与构建工具
│   ├── start.bat / start.sh         # 一键启动(Win / Unix)
│   ├── package.json                 # Node 依赖 + npm scripts
│   ├── README.md                    # tools/ 使用说明
│   ├── build-pages.mjs              # 生成 Cloudflare 白名单静态产物
│   │
│   ├── server/                      # 启动器 + HTTP 服务器
│   │   ├── serve.mjs                # 入口(自检 + 装依赖 + 开浏览器 + HTTP)
│   │   └── lib/
│   │       └── config-reader.mjs    # 共享:读 viewer 的 config.js / focal-points.js
│   │
│   └── ai/                          # AI 工具(命令行)
│       ├── build-focal-points.mjs   # 人脸检测 + 批量分析(含 --download-only)
│       └── analyze-images.mjs       # 列出 viewer 当前所有图片 URL
│
├── dist/                            # 构建产物(Git 忽略,仅含 Viewer)
├── wrangler.toml                    # Cloudflare Pages 输出目录配置
├── .dev.vars                        # 本地开发密钥(git 忽略,不入库)
└── README.md
```

## 安全说明

- 图床 token 只存在两处：Cloudflare 环境变量（线上）、`.dev.vars`（本地，已 gitignore）
- 前端 JS、GitHub 仓库、浏览器网络请求中均无 token
- `manager/` 仅在本机；Tools 服务只监听 `127.0.0.1`
- Cloudflare 只发布 `dist/`，不会发布 `tools/`、`manager/` 或密钥文件
- 代理对 `per_page` 参数做了 1~100 区间限制，防止滥用
- 代理响应带 5 分钟边缘缓存，降低图床限流（180 次/分钟）风险
