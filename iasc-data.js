var IASC_CONFIG = { biayaAktivasi: 500000 };
var IASC_CONFIG_URL = "iasc-config.json";

function iascAngka(v) {
    return parseInt(String(v).replace(/[^\d]/g, ""), 10) || 0;
}

function iascSetConfigUrl(url) {
    IASC_CONFIG_URL = url;
}

function iascLoadConfigSync(url) {
    url = url || IASC_CONFIG_URL;
    try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);
        if (xhr.status === 0 || xhr.status === 200) {
            var cfg = JSON.parse(xhr.responseText);
            if (cfg && cfg.biayaAktivasi != null) {
                IASC_CONFIG.biayaAktivasi = iascAngka(cfg.biayaAktivasi);
            }
        }
    } catch (e) {}
}

var IASC_BIAYA_STORAGE_KEY = "iasc_biaya_aktivasi";

function iascLoadBiayaFromStorage() {
    try {
        var raw = localStorage.getItem(IASC_BIAYA_STORAGE_KEY);
        if (raw !== null) {
            var n = iascAngka(raw);
            if (n > 0) {
                IASC_CONFIG.biayaAktivasi = n;
            }
        }
    } catch (e) {}
}

function iascSetBiayaAktivasi(n) {
    n = iascAngka(n);
    if (n <= 0) {
        return false;
    }
    IASC_CONFIG.biayaAktivasi = n;
    try {
        localStorage.setItem(IASC_BIAYA_STORAGE_KEY, String(n));
    } catch (e) {}
    return true;
}

function iascResetBiayaAktivasi() {
    try {
        localStorage.removeItem(IASC_BIAYA_STORAGE_KEY);
    } catch (e) {}
    iascLoadConfigSync();
}

function iascGetBiayaAktivasi() {
    return IASC_CONFIG.biayaAktivasi;
}

(function iascInitConfig() {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].getAttribute("src");
        if (src && src.indexOf("iasc-data.js") >= 0) {
            var base = src.substring(0, src.lastIndexOf("/") + 1);
            if (base) {
                IASC_CONFIG_URL = base + "iasc-config.json";
            }
            break;
        }
    }
    iascLoadConfigSync();
    iascLoadBiayaFromStorage();
})();

function iascFormatNum(n) {
    return iascAngka(n).toLocaleString("id-ID");
}

function iascAmbil(text, label) {
    var rg = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*:\\s*(.+)", "i");
    var m = text.match(rg);
    return m ? m[1].trim() : "";
}

function iascParseInput(text) {
    var nama = iascAmbil(text, "A/n rekening penerima");
    var bank = iascAmbil(text, "Bank / e-wallet penerima");
    var kerugian = iascAngka(iascAmbil(text, "Total kerugian"));
    if (!nama || !bank || kerugian <= 0) {
        return null;
    }
    return {
        nama: nama,
        bank: bank,
        kerugian: kerugian,
        aktivasi: iascGetBiayaAktivasi(),
    };
}

function iascParseOutput(text) {
    var namaM = text.match(/atas nama\s*\*([^*]+)\*/i);
    var bankM = text.match(/rekening\s*\*([^*]+)\*\s*atas nama/i);
    var saldoM = text.match(/Saldo Utama\s*:\s*\*Rp\.?([\d.,]+)\*/i)
        || text.match(/dana sebesar\s*Rp\.?([\d.,]+)/i);
    var feeM = text.match(/Biaya aktivasi saldo:\s*\*Rp\.?([\d.,]+)\*/i);

    var nama = namaM ? namaM[1].trim() : "";
    var bank = bankM ? bankM[1].trim() : "";
    var kerugian = saldoM ? iascAngka(saldoM[1]) : 0;
    var aktivasi = feeM ? iascAngka(feeM[1]) : iascGetBiayaAktivasi();

    if (!nama || !bank || kerugian <= 0) {
        return null;
    }
    return { nama: nama, bank: bank, kerugian: kerugian, aktivasi: aktivasi };
}

function iascParseText(text) {
    return iascParseInput(text) || iascParseOutput(text);
}

function iascToActivasiPayload(d, qrImage) {
    return {
        receiverName: d.nama,
        receiverBank: d.bank,
        totalFormatted: iascFormatNum(d.kerugian),
        feeFormatted: iascFormatNum(d.aktivasi),
        qrImage: qrImage || "QR.png",
    };
}

function iascSaveActivasiPrefill(payload) {
    try {
        sessionStorage.setItem("iasc_activasi_prefill", JSON.stringify(payload));
    } catch (e) {}
}

function iascLoadActivasiPrefill() {
    try {
        var raw = sessionStorage.getItem("iasc_activasi_prefill");
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}
