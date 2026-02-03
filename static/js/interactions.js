function playVideo(id) {
  const video = document.getElementById(id);
  video.play();
}

function showTaskTable(selectEl) {
  const taskId = selectEl.value;
  const container = selectEl.closest('.column').querySelector('.task-examples');
  if (!container) return;
  container.querySelectorAll('table').forEach(table => {
    table.classList.toggle('task-table-active', table.id === 'table-' + taskId);
  });
}

function changePlotly(id) {
  const selectEl = document.querySelector('#select-' + id + ' select');
  if (!selectEl) return;

  const selected = selectEl.value;
  const iframe = document.getElementById(id + '-frame');

  const oldSrc = iframe.src
  const oldDir = oldSrc.substring(0, oldSrc.lastIndexOf("/") + 1);
  iframe.src = oldDir + selected + ".html";
  console.log(oldDir, selected);
}

function addIframePlaceholders() {
  document.querySelectorAll("iframe").forEach(iframe => {
    if (iframe.parentElement.querySelector(".iframe-placeholder")) return;

    const placeholder = document.createElement("div");
    placeholder.className = "iframe-placeholder";
    placeholder.innerHTML = `
      <div>Injecting interactive visualization...</div>
      <div class="emoji-seq">
        <span class="emoji">🌀</span>
      </div>
    `;

    const parent = iframe.parentElement;
    if (getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }

    parent.appendChild(placeholder);

    iframe.addEventListener("load", () => {
      placeholder.style.opacity = 0;
      setTimeout(() => placeholder.remove(), 600);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  addIframePlaceholders();

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