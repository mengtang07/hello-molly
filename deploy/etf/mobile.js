/* ===== 移动端适配: ECharts 网格边距随屏宽调整 (由 branding.py 注入) ===== */
(function () {
  if (!window.echarts) return;
  var box = document.getElementById('klnBox');
  if (!box) return;

  function narrow() { return window.innerWidth < 860; }

  function apply() {
    var ch = echarts.getInstanceByDom(box);
    if (!ch) return false;
    if (!narrow()) {
      /* 宽屏恢复默认边距 */
      ch.setOption({
        grid: [{ left: 50, right: 56, top: 16, height: 300 }, { left: 50, right: 56, bottom: 28, height: 120 }],
        xAxis: [{ axisLabel: { fontSize: 10, interval: 'auto' } }, { axisLabel: { fontSize: 10, interval: 'auto' } }],
        yAxis: [{ axisLabel: { fontSize: 10 } }, { axisLabel: { fontSize: 10 } }]
      });
      return true;
    }
    /* 窄屏: 压缩左右边距, 高度改为百分比以适配容器 */
    ch.setOption({
      grid: [
        { left: 30, right: 32, top: 10, height: '56%' },
        { left: 30, right: 32, bottom: 20, height: '20%' }
      ],
      xAxis: [
        { axisLabel: { fontSize: 8, interval: 'auto', hideOverlap: true } },
        { axisLabel: { fontSize: 8, interval: 'auto', hideOverlap: true } }
      ],
      yAxis: [
        { axisLabel: { fontSize: 8 } },
        { axisLabel: { fontSize: 8 } }
      ]
    });
    return true;
  }

  /* 报表脚本可能在图表初始化前就跑完了, 这里轮询等实例出现 */
  var tries = 0;
  var timer = setInterval(function () {
    if (apply() || ++tries > 40) clearInterval(timer);
  }, 120);

  /* 旋转屏幕 / 改变窗口宽度 */
  var reapply = function () { setTimeout(apply, 120); };
  window.addEventListener('resize', reapply);
  window.addEventListener('orientationchange', reapply);

  /* 切换指数 / 切换显示区间后, 报表会重建 option, 需要重新套用窄屏边距 */
  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList && e.target.classList.contains('rng')) reapply();
  }, true);
  var sel = document.getElementById('klnCat');
  if (sel) sel.addEventListener('change', reapply);
})();
