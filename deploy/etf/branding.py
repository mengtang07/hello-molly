# -*- coding: utf-8 -*-
"""给报表页注入 Molly 品牌 + 移动端适配 —— 部署后处理, 不改上游 refresh.py 的模板。

用法: python branding.py <源HTML> <输出HTML>
幂等: 已注入过则跳过。
"""
import io, os, re, sys

HOME = "https://www.mymolly.online/"
LOGO = "molly-logo.svg"
TITLE_PREFIX = "Molly · "

# favicon / 图标声明(全部相对路径, 与本文件同目录, 保证 /etf/ 自包含)
FAVICON_LINKS = """<link rel="icon" type="image/svg+xml" href="favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="favicon-16.png" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
<meta name="theme-color" content="#0B0645" />"""

BRAND_CSS = """<style id="molly-brand">
.molly-brand{display:flex;align-items:center;gap:8px;margin:0 0 16px}
.molly-brand a{display:inline-flex;align-items:center;gap:8px;text-decoration:none}
.molly-brand img{height:24px;width:auto;display:block}
.molly-brand span{font-size:12px;color:#7a8194;letter-spacing:.04em}
.molly-brand a:hover span{color:#2f54eb}
</style>"""

BRAND_HTML = ('<div class="molly-brand"><a href="%s" target="_blank" rel="noreferrer" '
              'title="Molly · 返回首页"><img src="%s" alt="Molly" /><span>Molly</span></a></div>'
              % (HOME, LOGO))

HERE = os.path.dirname(os.path.abspath(__file__))


def read_asset(name):
    p = os.path.join(HERE, name)
    if not os.path.exists(p):
        return ""
    return io.open(p, encoding="utf-8").read()


def main(src, dst):
    s = io.open(src, encoding="utf-8").read()
    if 'id="molly-brand"' in s:
        print("  已含品牌, 跳过注入")
        io.open(dst, "w", encoding="utf-8").write(s)
        return

    # 1) favicon + theme-color + 品牌 CSS + 移动端 CSS 注入到 </head> 之前
    #    ⚠️ 必须用 rfind: 内联的 echarts.min.js 源码里也含 "</head>" 字面量,
    #    用 replace(...,1) 会命中库源码内部, 把 echarts 劈坏导致图表加载失败。
    css = BRAND_CSS
    mobile_css = read_asset("mobile.css")
    if mobile_css:
        css += '\n<style id="molly-mobile">\n' + mobile_css + "\n</style>"
    inject = FAVICON_LINKS + "\n" + css
    i = s.rfind("</head>")
    if i == -1:
        s = inject + s
    else:
        s = s[:i] + inject + "\n" + s[i:]

    # 2) 修正"刷新数据"按钮的误导性文案
    #    该按钮只是 location.reload(), 并不会去交易所抓新数据;
    #    数据靠服务端定时任务刷新, 文案不说清楚会让人以为按钮坏了。
    s = s.replace(
        'title="点击重新加载，并按沪深两市同步日期展示最新数据"',
        'title="数据由服务器每日自动更新;此按钮仅重新加载当前页面"')

    # 3) 标题加品牌前缀
    def _title(m):
        t = m.group(1)
        return "<title>%s%s</title>" % (TITLE_PREFIX, t) if not t.startswith(TITLE_PREFIX) else m.group(0)
    s = re.sub(r"<title>(.*?)</title>", _title, s, count=1)

    # 4) 页面 logo 插入到报表主区块(.top)之前
    m = re.search(r'<div class="top">', s)
    if m:
        s = s[:m.start()] + BRAND_HTML + s[m.start():]
    else:
        s = s.replace("<body>", "<body>" + BRAND_HTML, 1)

    # 5) 移动端脚本(调 ECharts 网格边距)插到 </body> 之前
    #    同样必须用 rfind —— echarts.min.js 源码里有 "</body>" 字面量
    mobile_js = read_asset("mobile.js")
    if mobile_js:
        block = "<script id=\"molly-mobile-js\">\n" + mobile_js + "\n</script>\n"
        j = s.rfind("</body>")
        if j == -1:
            s = s + block
        else:
            s = s[:j] + block + s[j:]

    # 自检: echarts 源码里若出现 "</script>" 会被 HTML 解析器提前截断,
    # 这里校验库尾部标记仍然存在, 且移动端脚本位置在库之后
    if "echarts.init" not in s:
        print("  ⚠️ 自检失败: 未找到 echarts.init")
    if mobile_js and s.find('id="molly-mobile-js"') < s.find("echarts.init"):
        print("  ⚠️ 自检失败: 移动端脚本插到了 echarts 库内部")

    io.open(dst, "w", encoding="utf-8").write(s)
    print("  已注入 favicon / 标题前缀 / Molly logo%s"
          % (" / 移动端适配" if mobile_css else ""))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
