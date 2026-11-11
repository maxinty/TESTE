import { renderAsync } from "docx-preview";
import { init as initPptx } from "pptx-preview";

const MAX_SIZE = 80 * 1024 * 1024;
const PPTX_WIDTH = 960;
const PPTX_HEIGHT = 540;

const $ = id => document.getElementById(id);
const fileInput = $("fileInput");
const statusBox = $("status");
const home = $("home");
const reader = $("reader");
const viewer = $("viewer");
const host = $("host");
const filename = $("filename");
const badge = $("badge");
const dropzone = $("dropzone");

let baseWidth = 800;   // largura natural do conteúdo renderizado
let userFactor = 1;    // zoom escolhido pelo usuário (1 = ajustado à largura)

function setStatus(message, error = false) {
  statusBox.textContent = message;
  statusBox.classList.toggle("error", error);
}

function applyZoom() {
  const fit = Math.max(0.2, (viewer.clientWidth - 8) / baseWidth);
  host.style.width = baseWidth + "px";
  host.style.zoom = fit * userFactor;
}

function showReader(name, kind) {
  filename.textContent = name;
  badge.textContent = kind === "pptx" ? "PPT" : "DOC";
  badge.classList.toggle("ppt", kind === "pptx");
  home.classList.add("hidden");
  reader.classList.remove("hidden");
}

function backHome() {
  reader.classList.add("hidden");
  home.classList.remove("hidden");
  host.innerHTML = "";
  host.style.zoom = 1;
  userFactor = 1;
  setStatus("");
}

async function renderDocx(buffer) {
  host.innerHTML = "";
  await renderAsync(buffer, host, null, {
    className: "docx",
    inWrapper: true,
    breakPages: true,
    ignoreLastRenderedPageBreak: true
  });
  const page = host.querySelector("section.docx");
  baseWidth = page ? page.offsetWidth + 60 : 860;
}

async function renderPptx(buffer) {
  host.innerHTML = "";
  const previewer = initPptx(host, { width: PPTX_WIDTH, height: PPTX_HEIGHT, mode: "list" });
  await previewer.preview(buffer);
  baseWidth = PPTX_WIDTH;
}

async function openFile(file) {
  if (!file) return;
  const ext = (file.name.match(/\.([^.]+)$/) || [, ""])[1].toLowerCase();

  if (["doc", "ppt", "odt", "odp"].includes(ext)) {
    return setStatus(
      "Formato antigo/ODF não é suportado offline. Salve o arquivo como .docx ou .pptx e tente novamente.",
      true
    );
  }
  if (ext !== "docx" && ext !== "pptx") {
    return setStatus("Formato não suportado. Escolha um arquivo .docx ou .pptx.", true);
  }
  if (file.size > MAX_SIZE) {
    return setStatus("O arquivo ultrapassa o limite de 80 MB.", true);
  }

  setStatus("Abrindo arquivo…");
  try {
    const buffer = await file.arrayBuffer();
    showReader(file.name, ext); // mostra a área de leitura antes, para medir larguras
    userFactor = 1;
    if (ext === "docx") await renderDocx(buffer);
    else await renderPptx(buffer);
    applyZoom();
    viewer.scrollTop = 0;
    setStatus("");
  } catch (err) {
    console.error(err);
    backHome();
    setStatus("Não foi possível abrir o arquivo. Verifique se ele não está corrompido ou protegido por senha.", true);
  } finally {
    fileInput.value = "";
  }
}

fileInput.addEventListener("change", e => openFile(e.target.files[0]));
$("newFile").addEventListener("click", backHome);
$("zoomIn").addEventListener("click", () => { userFactor = Math.min(4, userFactor * 1.2); applyZoom(); });
$("zoomOut").addEventListener("click", () => { userFactor = Math.max(0.3, userFactor / 1.2); applyZoom(); });
$("zoomFit").addEventListener("click", () => { userFactor = 1; applyZoom(); });
window.addEventListener("resize", () => { if (!reader.classList.contains("hidden")) applyZoom(); });

["dragenter", "dragover"].forEach(n => dropzone.addEventListener(n, e => { e.preventDefault(); dropzone.classList.add("drag"); }));
["dragleave", "drop"].forEach(n => dropzone.addEventListener(n, e => { e.preventDefault(); dropzone.classList.remove("drag"); }));
dropzone.addEventListener("drop", e => openFile(e.dataTransfer.files[0]));
