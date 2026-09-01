# Lumina · 流动图片墙

纯 HTML + CSS + JS 的静态单页网站：多行叠层、水平无缝流动的图片墙，点击图片弹出灯箱预览。

## 快速开始

```bash
# 项目根目录启动本地静态服务器（任选其一）
python -m http.server 8000
# 或 npx serve .

# 浏览器打开 http://localhost:8000
```

> 未配置图床时自动使用兜底演示图（picsum.photos），页面可直接预览效果。

## 接入你的图床

只需编辑 `js/config.js`，核心字段：

| 字段 | 说明 | 示例 |
|---|---|---|
| `apiBase` | 图床 API 根地址 | `https://img.example.com/api/v1` |
| `listPath` | 图片列表接口路径 | `/images` |
| `authType` | 鉴权方式 `bearer` / `header` / `none` | `bearer` |
| `token` | 你的 token（占位符，自行填入） | |
| `imgField` | 返回 JSON 中图片数组的点分路径 | `data.data` |
| `imgUrlField` | 数组元素中图片 URL 的字段名 | `url` |
| `imgNameField` | 数组元素中图片名的字段名（可空） | `name` |

### 如何确定 imgField？

假设图床接口返回：

```json
{
  "status": true,
  "data": {
    "data": [
      { "name": "风景1", "url": "https://.../a.png" }
    ]
  }
}
```

则 `imgField: 'data.data'`、`imgUrlField: 'url'`、`imgNameField: 'name'`。

### ⚠️ 安全警告

纯前端站点的 token **会被任何访问者在浏览器中看到**：

- 务必使用图床的 **只读 / 低权限 token**，切勿使用可上传、删除的主 token
- 提交到 GitHub / 部署前，确认 token 是否愿意公开
- 若接口请求失败（网络 / 401 / 字段不匹配），页面会自动回退兜底图，控制台会打印具体原因

## 自定义外观

- **换主题**：`css/style.css` 顶部 `:root` CSS 变量（配色、卡高、圆角、间距）
- **行数 / 卡宽 / 图片数量**：`js/config.js` 的 `rows` / `cardWidth` / `perPage`
- **各行速度与方向**：`js/main.js` `renderWall()` 中 `animationDuration` / `animationDirection`

## 部署到 Cloudflare Pages（Git 集成）

1. 提交代码并推送 GitHub：

   ```bash
   git init
   git add -A
   git commit -m "init: 流动图片墙"
   git remote add origin https://github.com/<你>/<仓库名>.git
   git push -u origin master
   ```

2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**，选择该仓库
3. 构建配置（纯静态）：
   - Framework preset: `None`
   - **Build command: 留空**
   - **Build output directory: `.`**
4. 部署完成后获得 `https://<项目名>.pages.dev`
5. 绑定自定义域名：Pages 项目 → **Custom domains** → 添加域名（域名在 Cloudflare DNS 托管时自动添加 CNAME 并签发 SSL）

之后每次 `git push` 自动触发重新部署。

## 文件结构

```
Lumina/
├── index.html      # 页面骨架（header / 图片墙容器 / 灯箱）
├── css/style.css   # 全部样式（含主题变量、动画、响应式）
├── js/config.js    # ★ 唯一需要修改的配置文件
├── js/main.js      # 逻辑：拉取 → 渲染 → 灯箱
└── README.md
```
