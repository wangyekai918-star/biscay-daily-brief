# Biscay 每日晨报

GitHub Pages 静态站点。`index.html` 展示最新一期，`YYYY-MM-DD.html` 是不随之后更新而改变的当日链接。

发布新一期前，先在原始 HTML 所在目录准备好 `assets/` 图片和 `lucide.min.js`。然后运行：

```sh
node scripts/publish.mjs YYYY-MM-DD /absolute/path/to/YYYY-MM-DD-每日晨报.html
```

脚本会核对引用的资源，将图片归档到 `assets/YYYY-MM-DD/`，并同步更新当日页和首页。检查无误后提交、推送到 `main`；GitHub Pages 使用该分支根目录发布。
