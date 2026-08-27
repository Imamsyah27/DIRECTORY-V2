function getUTCDate() {
    return new Date().toISOString().split("T")[0];
}

async function copyTag(tagar) {
    try {
        await navigator.clipboard.writeText(tagar);
        showToast(`Tagar "${tagar}" disalin`, "success");
    } catch (err) {
        console.error(err);
        showToast("Gagal menyalin tagar", "danger");
    }
}

async function copyKeterangan(keterangan) {
    try {
        await navigator.clipboard.writeText(keterangan);
        showToast("Keterangan berhasil disalin", "success");
    } catch (err) {
        console.error(err);
        showToast("Gagal menyalin keterangan", "danger");
    }
}

function formatPaket(terkirim, total) {
    return `H${terkirim}/H${total}`;
}

function createKeterangan(tagar, terkirim, total, whatsapp) {
    const paket = formatPaket(terkirim, total);
    const wa = whatsapp ? `https://wa.me/${whatsapp.replace("+", "")}` : "";
    return `${tagar} | ${paket} | ${wa}`;
}

function validWhatsapp(nomor) {
    return /^\+\d+$/.test(nomor);
}

function filterTable() {
    const value = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#tableBody tr");
    let visibleCount = 0;

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        const match = text.includes(value);
        row.style.display = match ? "" : "none";
        if (match) visibleCount++;
    });

    const emptyState = document.getElementById("tableEmptyState");
    if (emptyState) {
        emptyState.style.display = (visibleCount === 0) ? "flex" : "none";
    }
}

/**
 * Menentukan status pesanan berdasarkan progress pengiriman.
 * Threshold "mendekati limit": >= 80% namun belum 100%.
 */
function getOrderStatus(terkirim, total) {
    if (total <= 0) return { key: "proses", label: "Proses", badgeClass: "badge-proses", icon: "⏳", barClass: "ok" };

    const ratio = terkirim / total;

    if (terkirim >= total) {
        return { key: "selesai", label: "Limit Tercapai", badgeClass: "badge-done", icon: "✅", barClass: "done" };
    }
    if (ratio >= 0.8) {
        return { key: "mendekati", label: "Mendekati Limit", badgeClass: "badge-warn", icon: "⚠️", barClass: "warn" };
    }
    return { key: "proses", label: "Proses", badgeClass: "badge-proses", icon: "⏳", barClass: "ok" };
}

function formatDateHuman(dateInput) {
    if (!dateInput) return "-";
    try {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    } catch (e) {
        return "-";
    }
}

function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

/* ---------------- Toast ---------------- */
function showToast(message, type = "info") {
    const stack = document.getElementById("toastStack");
    if (!stack) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    stack.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity .2s ease";
        setTimeout(() => toast.remove(), 200);
    }, 2600);
}
