export const QRCodeExtension = {
  name: "QRCode",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_qr" || trace.payload.name === "ext_qr",
  render: ({ trace, element }) => {
    loadQRCodeLibrary()
      .then(() => createQRCodeContainer(element))
      .then((container) => generateQRCode(trace, container))
      .catch(handleError);
  },
};

function loadQRCodeLibrary() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/qr-code-styling@1.5.0/lib/qr-code-styling.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function createQRCodeContainer(element) {
  addStyles();
  const container = document.createElement("div");
  container.style.textAlign = "center";

  const qrcodeDiv = document.createElement("div");
  qrcodeDiv.id = "qrcode";
  container.appendChild(qrcodeDiv);
  element.appendChild(container);

  return { qrcodeDiv };
}

function addStyles() {
  const styles = `
    #qrcode {
      margin: 20px auto;
      width: 300px;
      height: 300px;
    }
    .qr-error {
      color: red;
      margin-top: 10px;
    }
  `;
  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

function generateQRCode(trace, { qrcodeDiv }) {
  try {
    const qrData = inferQRType(trace.payload);
    const qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      data: qrData,
      dotsOptions: {
        color: "#4267b2",
        type: "rounded",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 20,
      },
    });

    qrcodeDiv.innerHTML = "";
    qrCode.append(qrcodeDiv);
  } catch (error) {
    handleError(error, qrcodeDiv);
  }
}

function inferQRType(data) {
  if (data.url) return generateURLQR(data);
  if (data.phone) return `tel:${data.phone}`;
  if (data.ssid) return generateWiFiQR(data);
  if (data.name) return generateContactQR(data);
  throw new Error("Invalid QR code type");
}

function generateURLQR(data) {
  const url = data.url || "https://speedybot.js.org/new";
  const params = data.queryParams || {};
  const queryString = new URLSearchParams(params).toString();
  return `${url}${queryString ? "?" + queryString : ""}`;
}

function generateWiFiQR(data) {
  const { ssid, password, encryption = "WPA" } = data;
  return `WIFI:S:${ssid};${
    password ? `T:${encryption};P:${password};` : `T:;`
  };`;
}

function generateContactQR(data) {
  const { name, org = "", phone = "", email = "", description = "" } = data;
  let qrData = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}`;
  if (description) qrData += `\nNOTE:${description}`;
  return qrData + "\nEND:VCARD";
}

function handleError(error, qrcodeDiv) {
  const errorMessage = `Error generating QR Code: ${error.message}`;
  if (qrcodeDiv) {
    qrcodeDiv.innerHTML = `<div class="qr-error">${errorMessage}</div>`;
  }
  window.voiceflow.chat.interact({
    type: "complete",
    payload: { error: errorMessage },
  });
  console.error(errorMessage);
}

export const checkProjectID = (projectID, document) => {
  if (projectID === "__REPLACE__ME__") {
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdFromURL =
      urlParams.get("projectId") || urlParams.get("projectID");

    if (projectIdFromURL) {
      return projectIdFromURL;
    } else {
      const message =
        "Please replace the projectID in index.html or specify it in the URL parameters (e.g., ?projectId=abc123456). This experience cannot proceed without a valid projectID.";
      alert(message);
      displayErrorBanner(message, document);
      throw new Error("No project ID specified");
    }
  }
  return projectID;
};

function displayErrorBanner(message, document) {
  const errorBanner = document.createElement("h1");
  errorBanner.innerText = message;
  Object.assign(errorBanner.style, {
    color: "red",
    backgroundColor: "#fff4f4",
    border: "1px solid red",
    borderRadius: "8px",
    padding: "20px",
    margin: "20px",
    fontFamily: "Arial, sans-serif",
    fontWeight: "bold",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  });
  document.body.appendChild(errorBanner);
}
