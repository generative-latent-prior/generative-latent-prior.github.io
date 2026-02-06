function playVideo(id) {
  const video = document.getElementById(id);
  if (video) video.play();
}

const RESPONSIVE_BREAKPOINT_PX = 768;

function responsiveIsMobile() {
  return window.matchMedia(`(max-width: ${RESPONSIVE_BREAKPOINT_PX}px)`).matches;
}

function responsiveBreakpointWatcher(handler) {
  const mediaQuery = window.matchMedia(`(max-width: ${RESPONSIVE_BREAKPOINT_PX}px)`);
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}

function showTaskTable(selectEl) {
  const taskId = selectEl.value;
  const container = selectEl.closest('.column').querySelector('.task-examples');
  if (!container) return;
  container.querySelectorAll('table').forEach(table => {
    table.classList.toggle('task-table-active', table.id === 'table-' + taskId);
  });
}

function createIframePlaceholder() {
  const placeholder = document.createElement("div");
  placeholder.className = "iframe-placeholder";
  placeholder.innerHTML = `
    <div>Injecting interactive visualization...</div>
    <div class="emoji-seq">
      <span class="emoji">🌀</span>
    </div>
  `;
  return placeholder;
}

function showIframeLoadPlaceholder(iframe, onLoad) {
  const parent = iframe.parentElement;
  if (getComputedStyle(parent).position === "static") {
    parent.style.position = "relative";
  }
  const placeholder = createIframePlaceholder();
  parent.appendChild(placeholder);
  const handler = () => {
    placeholder.style.opacity = 0;
    setTimeout(() => placeholder.remove(), 200);
    iframe.removeEventListener("load", handler);
    if (onLoad) onLoad();
  };
  iframe.addEventListener("load", handler);
}

function changePlotly(id) {
  const selectEl = document.querySelector('#select-' + id + ' select');
  if (!selectEl) return;

  const selected = selectEl.value;
  const iframe = document.getElementById(id + '-frame');
  if (!iframe) return;

  let file = selected;
  if (id === 'scaling-comparison') {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile && (selected === 'loss' || selected === 'steer' || selected === 'probe')) {
      file = selected + '_mobile';
    }
  }

  const oldSrc = iframe.src || iframe.getAttribute('src') || '';
  const baseDir = oldSrc && oldSrc.lastIndexOf('/') !== -1
    ? oldSrc.substring(0, oldSrc.lastIndexOf('/') + 1)
    : (id === 'scaling-comparison' ? 'assets/scaling_comparison/' : '');

  const newSrc = baseDir + file + '.html';
  if (newSrc === (iframe.src || '')) return;

  showIframeLoadPlaceholder(iframe);
  iframe.src = newSrc;
}

function addIframePlaceholders() {
  document.querySelectorAll("iframe").forEach(iframe => {
    if (iframe.parentElement.querySelector(".iframe-placeholder")) return;

    const parent = iframe.parentElement;
    if (getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }
    const placeholder = createIframePlaceholder();
    parent.appendChild(placeholder);

    iframe.addEventListener("load", () => {
      placeholder.style.opacity = 0;
      setTimeout(() => placeholder.remove(), 200);
    });
  });
}

function transposeTable(table) {
  const rows = Array.from(table.querySelectorAll('tr'));
  const data = rows.map(row => 
    Array.from(row.querySelectorAll('th, td')).map(cell => ({
      html: cell.innerHTML,
      isHeader: cell.tagName === 'TH'
    }))
  );
  const transposed = data[0].map((_, colIndex) => 
    data.map(row => row[colIndex])
  );
  table.innerHTML = transposed.map((row, rowIndex) => {
    const cells = row.map(cell =>
      cell.isHeader ? `<th>${cell.html}</th>` : `<td>${cell.html}</td>`
    ).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
}

function responsiveIframe({
  iframeId,
  desktopFile,
  mobileFile,
  onModeChange,
}) {
  const iframe = document.getElementById(iframeId);
  if (!iframe) return () => {};

  const apply = () => {
    const isMobile = responsiveIsMobile();
    const wantFile = isMobile ? mobileFile : desktopFile;
    const wantSrc = 'assets/' + wantFile;
    const currentFile = (iframe.src || iframe.getAttribute('src') || '').split('/').pop() || '';
    if (currentFile !== wantFile) {
      iframe.src = wantSrc;
    }
    if (onModeChange) onModeChange(isMobile);
  };
  apply();
  return responsiveBreakpointWatcher(apply);
}

function responsiveTable() {
  const isMobile = responsiveIsMobile();
  document.querySelectorAll('.table-transpose-mobile table').forEach(table => {
    if (isMobile && !table.dataset.transposed) {
      transposeTable(table);
      table.dataset.transposed = 'true';
    } else if (!isMobile && table.dataset.transposed) {
      location.reload();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  addIframePlaceholders();
  responsiveTable();

  const probeWrap = document.getElementById('probe-comparison-wrap');
  responsiveIframe({
    iframeId: 'probe-comparison-frame',
    desktopFile: 'probe_comparison.html',
    mobileFile: 'probe_comparison_mobile.html',
    onModeChange: (isMobile) => {
      if (probeWrap) probeWrap.classList.toggle('probe-mobile', isMobile);
    },
  });

  responsiveIframe({
    iframeId: 'steer-comparison-frame',
    desktopFile: 'steer_comparison.html',
    mobileFile: 'steer_comparison_mobile.html',
  });

  changePlotly('scaling-comparison');
  responsiveBreakpointWatcher(() => {
    responsiveTable();
    changePlotly('scaling-comparison');
  });

  document.querySelectorAll('.task-examples tbody td').forEach(td => {
    if (!td.querySelector('.task-cell-content')) {
      const wrap = document.createElement('div');
      wrap.className = 'task-cell-content';
      wrap.innerHTML = td.innerHTML;
      td.innerHTML = '';
      td.appendChild(wrap);
    }
  });

  document.querySelectorAll('.task-examples').forEach(container => {
    container.addEventListener('click', (e) => {
      const row = e.target.closest('tbody tr');
      if (row) row.classList.toggle('row-expanded');
    });
  });
});