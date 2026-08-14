function openTool(type) {
  const panel = document.getElementById("toolPanel");
  const title = document.getElementById("toolTitle");
  const body = document.getElementById("toolBody");

  panel.classList.remove("hidden");

  if (type === "resize") {
    title.textContent = "Image Resize";
    body.innerHTML = `
      <input type="file" id="resizeFile" accept="image/*">
      <br><br>
      <label>Width:</label>
      <input type="number" id="resizeWidth" value="500">
      <br><br>
      <label>Height:</label>
      <input type="number" id="resizeHeight" value="500">
      <br><br>
      <button onclick="resizeImage()">Resize & Download</button>
      <canvas id="resizeCanvas" style="display:none"></canvas>
    `;
  }

  if (type === "signature") {
    title.textContent = "Signature Resize";
    body.innerHTML = `
      <input type="file" id="signatureFile" accept="image/*">
      <br><br>
      <label>Width:</label>
      <input type="number" id="signatureWidth" value="300">
      <br><br>
      <label>Height:</label>
      <input type="number" id="signatureHeight" value="100">
      <br><br>
      <button onclick="resizeSignature()">Resize & Download</button>
    `;
  }

  if (type === "compress") {
    title.textContent = "Image Compress";
    body.innerHTML = `
      <input type="file" id="compressFile" accept="image/*">
      <br><br>
      <label>Quality:</label>
      <input type="range" id="quality" min="10" max="100" value="70"
             oninput="qualityValue.textContent=this.value+'%'">
      <span id="qualityValue">70%</span>
      <br><br>
      <button onclick="compressImage()">Compress & Download</button>
    `;
  }

  if (type === "pdf") {
    title.textContent = "JPG to PDF";
    body.innerHTML = `
      <input type="file" id="pdfFiles" accept="image/*" multiple>
      <br><br>
      <button onclick="imagesToPDF()">Create PDF & Download</button>
    `;
  }

  panel.scrollIntoView({ behavior: "smooth" });
}

function closeTool() {
  document.getElementById("toolPanel").classList.add("hidden");
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = reject;
    img.src = url;
  });
}

async function resizeImage() {
  const file = document.getElementById("resizeFile").files[0];

  if (!file) {
    alert("पहले फोटो चुनें।");
    return;
  }

  const width = parseInt(document.getElementById("resizeWidth").value);
  const height = parseInt(document.getElementById("resizeHeight").value);

  if (!width || !height) {
    alert("Width और Height सही भरें।");
    return;
  }

  const img = await loadImage(file);
  const canvas = document.getElementById("resizeCanvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  downloadCanvas(canvas, "resized-image.jpg");
}

async function resizeSignature() {
  const file = document.getElementById("signatureFile").files[0];

  if (!file) {
    alert("पहले Signature चुनें।");
    return;
  }

  const width = parseInt(document.getElementById("signatureWidth").value);
  const height = parseInt(document.getElementById("signatureHeight").value);

  const img = await loadImage(file);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  downloadCanvas(canvas, "signature-resized.png", "image/png");
}

async function compressImage() {
  const file = document.getElementById("compressFile").files[0];

  if (!file) {
    alert("पहले फोटो चुनें।");
    return;
  }

  const quality =
    parseInt(document.getElementById("quality").value) / 100;

  const img = await loadImage(file);

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  canvas.toBlob(
    function(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "compressed-image.jpg";
      a.click();

      URL.revokeObjectURL(url);
    },
    "image/jpeg",
    quality
  );
}

async function imagesToPDF() {
  const files = document.getElementById("pdfFiles").files;

  if (!files.length) {
    alert("पहले images चुनें।");
    return;
  }

  if (!window.jspdf) {
    alert("PDF library अभी load नहीं हुई। Internet चालू करके फिर कोशिश करें।");
    return;
  }

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  for (let i = 0; i < files.length; i++) {
    const img = await loadImage(files[i]);

    if (i > 0) {
      pdf.addPage();
    }

    const pageWidth = 210;
    const pageHeight = 297;

    const margin = 10;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;

    let width = img.width;
    let height = img.height;

    const ratio = Math.min(
      maxWidth / width,
      maxHeight / height
    );

    width *= ratio;
    height *= ratio;

    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.9);

    pdf.addImage(
      imageData,
      "JPEG",
      x,
      y,
      width,
      height
    );
  }

  pdf.save("JANTA-HELP-DESK.pdf");
}

function downloadCanvas(canvas, filename, type = "image/jpeg") {
  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }, type, 0.9);
}
