function drawWrappedText(context, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = context.measureText(testLine).width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });

  return y + Math.max(lines.length - 1, 0) * lineHeight;
}

function base64ToBytes(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeText(value) {
  return new TextEncoder().encode(value);
}

function getCertificateTitle(roleLabel) {
  return roleLabel === "Volunteer" ? "CERTIFICATE OF VOLUNTEERING" : "CERTIFICATE OF PARTICIPATION";
}

function getCertificateVerb(roleLabel) {
  return roleLabel === "Volunteer" ? "volunteered" : "participated";
}

function getCertificateDate(dateLabel) {
  const label = String(dateLabel || "").trim();

  if (!label) {
    return "";
  }

  const dateOnlyMatch = label.match(/^[A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}/);

  if (dateOnlyMatch) {
    return dateOnlyMatch[0];
  }

  return label
    .replace(/\s*[|:-]\s*\d{1,2}:\d{2}\s*(AM|PM)?/i, "")
    .replace(/\s+\d{1,2}:\d{2}\s*(AM|PM)?\s*$/i, "")
    .replace(/\s+at\s+.+$/i, "")
    .trim();
}

function buildPdfFromJpeg(jpegBytes, imageWidth, imageHeight) {
  const parts = [];
  const offsets = [];
  let totalLength = 0;

  function pushPart(part) {
    parts.push(part);
    totalLength += part.length;
  }

  function pushText(text) {
    pushPart(encodeText(text));
  }

  pushText("%PDF-1.4\n");

  const objects = [];

  objects.push(encodeText("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"));
  objects.push(encodeText("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"));
  objects.push(
    encodeText(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${imageWidth} ${imageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
    )
  );
  objects.push(
    encodeText(
      `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
    )
  );
  objects.push(jpegBytes);
  objects.push(encodeText("\nendstream\nendobj\n"));

  const contentStream = `q\n${imageWidth} 0 0 ${imageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
  objects.push(
    encodeText(
      `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`
    )
  );

  for (const object of objects) {
    offsets.push(totalLength);
    pushPart(object);
  }

  const xrefStart = totalLength;
  pushText("xref\n0 6\n");
  pushText("0000000000 65535 f \n");

  offsets.forEach((offset) => {
    pushText(`${String(offset).padStart(10, "0")} 00000 n \n`);
  });

  pushText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

  return new Blob(parts, { type: "application/pdf" });
}

function createCertificateCanvas({ studentName, clubName, eventTitle, roleLabel, dateLabel }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1131;
  const context = canvas.getContext("2d");
  const certificateTitle = getCertificateTitle(roleLabel);
  const certificateVerb = getCertificateVerb(roleLabel);

  context.fillStyle = "#f7f3ef";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#dcd8d2";
  context.fillRect(18, 18, canvas.width - 36, canvas.height - 36);

  context.fillStyle = "#ffffff";
  context.fillRect(105, 105, canvas.width - 210, canvas.height - 210);

  context.fillStyle = "#2b2e77";
  context.beginPath();
  context.moveTo(18, 18);
  context.lineTo(210, 18);
  context.lineTo(120, 170);
  context.lineTo(18, 170);
  context.closePath();
  context.fill();

  context.fillStyle = "#f0c620";
  context.beginPath();
  context.moveTo(345, 18);
  context.lineTo(385, 18);
  context.lineTo(300, 160);
  context.lineTo(260, 160);
  context.closePath();
  context.fill();

  context.fillStyle = "#2b2e77";
  context.beginPath();
  context.moveTo(18, canvas.height - 18);
  context.lineTo(210, canvas.height - 18);
  context.lineTo(325, canvas.height - 175);
  context.lineTo(125, canvas.height - 175);
  context.closePath();
  context.fill();

  context.fillStyle = "#f0c620";
  context.beginPath();
  context.moveTo(410, canvas.height - 18);
  context.lineTo(520, canvas.height - 18);
  context.lineTo(410, canvas.height - 170);
  context.lineTo(300, canvas.height - 170);
  context.closePath();
  context.fill();

  context.fillStyle = "#8f2025";
  context.font = "bold 64px Georgia, serif";
  context.fillText("Graphic Era", 290, 160);

  context.fillStyle = "#232323";
  context.font = "44px Georgia, serif";
  context.fillText("deemed to be University", 290, 220);

  context.fillStyle = "#9d2b2b";
  context.font = "bold 24px Arial";
  context.fillText("DEHRADUN", 295, 260);

  context.textAlign = "center";
  context.fillStyle = "#21295f";
  context.font = "bold 64px Georgia, serif";
  context.fillText(certificateTitle, canvas.width / 2, 330);

  context.fillStyle = "#4b4b4b";
  context.font = "38px Arial";
  context.fillText("This is to certify that", canvas.width / 2, 435);

  context.font = "46px Arial";
  context.textAlign = "left";
  context.fillText("Mr./Ms.", 145, 532);

  context.beginPath();
  context.strokeStyle = "#4e4e4e";
  context.lineWidth = 2;
  context.moveTo(255, 538);
  context.lineTo(1245, 538);
  context.stroke();

  context.fillStyle = "#1c1c1c";
  context.font = "italic 48px 'Brush Script MT', cursive";
  context.textAlign = "center";
  context.fillText(studentName, canvas.width / 2, 525);

  context.textAlign = "left";
  context.fillStyle = "#4b4b4b";
  context.font = "40px Arial";

  const paragraph = `has successfully ${certificateVerb} in the event "${eventTitle}", organized by ${clubName}, held on ${dateLabel}.`;
  const paragraphEndY = drawWrappedText(context, paragraph, 145, 610, 1310, 56);

  context.textAlign = "center";
  context.fillStyle = "#4b4b4b";
  context.font = "36px Arial";
  drawWrappedText(
    context,
    "Their enthusiasm, creativity, and active involvement contributed significantly to the success of the event.",
    canvas.width / 2,
    paragraphEndY + 95,
    1080,
    46
  );

  const signatureY = 900;
  const labels = [
    { x: 340, name: "Dr. Ajay Pandey", role: "Professor & HOD", sign: "A. Pandey" },
    { x: 800, name: clubName || "Club Coordinator", role: "Club Head", sign: "Club Head" },
    { x: 1260, name: "Event Coordinator", role: "Event Coordinator", sign: "Coordinator" }
  ];

  context.textAlign = "center";
  labels.forEach((label) => {
    context.fillStyle = "#2b2b2b";
    context.font = "italic 42px 'Brush Script MT', cursive";
    context.fillText(label.sign, label.x, signatureY - 18);

    context.beginPath();
    context.strokeStyle = "#4e4e4e";
    context.lineWidth = 2;
    context.moveTo(label.x - 140, signatureY);
    context.lineTo(label.x + 140, signatureY);
    context.stroke();

    context.fillStyle = "#222222";
    context.font = "bold 24px Arial";
    context.fillText(label.name, label.x, signatureY + 38);
    context.font = "24px Arial";
    context.fillText(label.role, label.x, signatureY + 72);
  });

  return canvas;
}

export function downloadCertificatePdf({ studentName, clubName, eventTitle, roleLabel, dateLabel }) {
  const canvas = createCertificateCanvas({
    studentName,
    clubName,
    eventTitle,
    roleLabel,
    dateLabel: getCertificateDate(dateLabel)
  });
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const jpegBytes = base64ToBytes(dataUrl.split(",")[1]);
  const pdfBlob = buildPdfFromJpeg(jpegBytes, canvas.width, canvas.height);
  const link = document.createElement("a");
  const safeTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const url = URL.createObjectURL(pdfBlob);

  link.href = url;
  link.download = `${safeTitle || "certificate"}-certificate.pdf`;
  link.click();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
