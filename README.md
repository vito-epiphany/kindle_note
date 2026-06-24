# Kindle Note

一个本地 Kindle 读书笔记管理工具。它可以导入 Kindle 导出的 `.txt`、`.html`、`.eml` 笔记文件，整理成可浏览的本地 HTML 页面，并支持在浏览器里编辑 Markdown 笔记，编辑结果会写回本地 JSON 数据。

## 功能

- 从 `imports/` 文件夹导入 Kindle 笔记文件。
- 将图书、章节、原文标注和笔记整理到 `data/books.json`。
- 生成三栏式本地阅读页面：左侧图书/章节，中间笔记列表，右侧详情。
- 支持编辑 Markdown 笔记并保存到本地。
- 重复导入时保留已经编辑过的笔记内容。
- 不依赖 npm 安装包，直接使用本机 Node.js 运行。

## 目录说明

```text
imports/              Kindle 导出的原始笔记文件
data/books.json       本地笔记数据库
data/sources.json     已导入文件记录和解析警告
public/               生成后的 HTML 页面和前端资源
scripts/              导入、构建、服务端脚本
test/                 自动化测试
kindle-notes          本地命令入口
```

## 基本使用

1. 把 Kindle 导出的 `.txt`、`.html` 或 `.eml` 文件放到 `imports/`。
2. 启动本地服务：

```bash
./kindle-notes serve
```

3. 打开浏览器访问：

```text
http://127.0.0.1:4173
```

4. 在右侧详情区编辑笔记。通过本地服务打开时，编辑内容会保存到 `data/books.json`。

## 常用命令

```bash
./kindle-notes import    # 导入 imports/ 下的新文件
./kindle-notes build     # 根据 data/books.json 生成 public/
./kindle-notes refresh   # 先导入，再重新生成页面
./kindle-notes serve     # 启动本地服务并支持保存编辑
./kindle-notes test      # 运行测试
```

## 数据规则

- `quote` 只表示 Kindle 原文标注。
- `note` 只表示 Kindle 笔记或手动编辑的 Markdown 笔记。
- 如果某条 Kindle 笔记没有原文，页面不会强行显示原文块。
- 再次导入同一本书时，已有编辑过的 `note` 会优先保留。

## 直接打开 HTML

可以直接打开 `public/index.html` 浏览页面，但这种方式无法写回本地文件。需要保存编辑时，请使用：

```bash
./kindle-notes serve
```

## 在其他机器部署

1. 克隆仓库：

```bash
git clone git@github.com:vito-epiphany/kindle_note.git
cd kindle_note
```

2. 确认本机有 Node.js：

```bash
node --version
```

3. 放入 Kindle 导出文件并启动：

```bash
mkdir -p imports
./kindle-notes refresh
./kindle-notes serve
```

如果只是查看已生成页面，也可以打开 `public/index.html`。

## 验证

修改代码后建议运行：

```bash
./kindle-notes test
./kindle-notes build
```
