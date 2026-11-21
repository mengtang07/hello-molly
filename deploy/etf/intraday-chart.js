/* ===== 盘中资金流(估算) 卡片渲染 (由 branding.py 注入) ===== */
(function () {
  var BOX = document.getElementById('itBox');
  if (!BOX) return;

  var stateEl = document.getElementById('itState');
  var timeEl = document.getElementById('itTime');
  var statsEl = document.getElementById('itStats');
  var chart = null;

  var POS = '#d43d2a', NEG = '#1f9d7b', ACC = '#2f54eb';

  function fmt(v, d) {
    if (v === null || v === undefined || isNaN(v)) return '—';
    return (v > 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 2 : d);
  }

  function stat(label, val, cls) {
    return '<div class="it-stat">' + label + '<b class="' + (cls || '') + '">' + val + '</b></div>';
  }

  function render(data) {
    if (!data || !data.basket || !data.basket.series || !data.basket.series.length) {
      if (statsEl) statsEl.innerHTML = '<div class="it-empty">暂无盘中数据</div>';
      if (stateEl) { stateEl.textContent = '暂无数据'; stateEl.className = 'it-state'; }
      return;
    }
    var s = data.basket.series;
    var times = s.map(function (p) { return p.t; });
    var cum = s.map(function (p) { return p.c; });
    var min = s.map(function (p) { return p.m; });
    var last = s[s.length - 1];

    if (stateEl) {
      var live = data.session === 'trading';
      stateEl.textContent = live ? '交易中' : (data.session === 'pre' ? '盘前' : '已收盘');
      stateEl.className = 'it-state' + (live ? ' is-live' : '');
    }
    if (timeEl) {
      timeEl.textContent = '数据日 ' + (data.date || '') + ' · 更新于 ' + (data.updated || '').slice(11);
    }
    if (statsEl) {
      var net = data.basket.net || 0;
      var pct = last.p || 0;
      var idx = 0;
      if (data.index && data.index.series && data.index.series.length) {
        idx = data.index.series[data.index.series.length - 1].p || 0;
      }
      statsEl.innerHTML =
        stat('今日估算净流入', fmt(net) + ' 亿', net >= 0 ? 'pos' : 'neg') +
        stat('今日成交额', (data.basket.amount || 0).toFixed(0) + ' 亿') +
        stat('篮子加权涨跌幅', fmt(pct) + ' %', pct >= 0 ? 'pos' : 'neg') +
        stat('中证全指', fmt(idx) + ' %', idx >= 0 ? 'pos' : 'neg');
    }

    if (!window.echarts) {
      if (stateEl) stateEl.textContent = '图表库未加载(需联网)';
      return;
    }
    if (!chart) chart = echarts.init(BOX);
    chart.setOption({
      animation: false,
      grid: [
        { left: 56, right: 24, top: 18, height: '52%' },
        { left: 56, right: 24, bottom: 34, height: '22%' }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { backgroundColor: '#4a5568' } },
        formatter: function (ps) {
          if (!ps.length) return '';
          var i = ps[0].dataIndex, p = s[i];
          var c = '<b>' + p.t + '</b>';
          c += '<br/>分钟净流入 <b style="color:' + (p.m >= 0 ? POS : NEG) + '">' + fmt(p.m) + ' 亿</b>';
          c += '<br/>累计净流入 <b style="color:' + (p.c >= 0 ? POS : NEG) + '">' + fmt(p.c) + ' 亿</b>';
          c += '<br/>成交额 ' + (p.a || 0).toFixed(2) + ' 亿';
          c += '<br/>篮子涨跌 ' + fmt(p.p) + ' %';
          return c;
        }
      },
      axisPointer: { link: [{ xAxisIndex: 'all' }] },
      xAxis: [
        { type: 'category', data: times, gridIndex: 0, boundaryGap: false,
          axisLine: { lineStyle: { color: '#d9dee8' } }, axisTick: { show: false },
          axisLabel: { show: false }, splitLine: { show: false } },
        { type: 'category', data: times, gridIndex: 1, boundaryGap: false,
          axisLine: { lineStyle: { color: '#d9dee8' } }, axisTick: { show: false },
          axisLabel: { fontSize: 10, color: '#7a8194', interval: 29, formatter: function (v) { return v; } },
          splitLine: { show: false } }
      ],
      yAxis: [
        { type: 'value', gridIndex: 0, name: '累计(亿)', nameTextStyle: { fontSize: 10, color: '#7a8194' },
          axisLabel: { fontSize: 10, color: '#7a8194' },
          splitLine: { lineStyle: { color: '#eef0f5' } } },
        { type: 'value', gridIndex: 1, name: '分钟(亿)', nameTextStyle: { fontSize: 10, color: '#7a8194' },
          axisLabel: { fontSize: 10, color: '#7a8194' },
          splitLine: { lineStyle: { color: '#eef0f5' } } }
      ],
      series: [
        { name: '累计净流入', type: 'line', data: cum, xAxisIndex: 0, yAxisIndex: 0,
          showSymbol: false, smooth: false, lineStyle: { width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(47,84,235,0.22)' },
              { offset: 1, color: 'rgba(47,84,235,0.01)' }
            ])
          },
          markLine: { silent: true, symbol: 'none',
            data: [{ yAxis: 0, lineStyle: { color: '#c7ccd8', type: 'dashed', width: 1 } }] } },
        { name: '分钟净流入', type: 'bar', data: min, xAxisIndex: 1, yAxisIndex: 1,
          itemStyle: { color: function (p) { return p.value >= 0 ? POS : NEG; }, opacity: .85 } }
      ]
    });
  }

  function load() {
    fetch('/etf/intraday.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function () {
        if (stateEl) { stateEl.textContent = '盘中数据暂不可用'; stateEl.className = 'it-state'; }
      });
  }

  load();
  setInterval(load, 60000);
  window.addEventListener('resize', function () { if (chart) chart.resize(); });
})();
