/**
 * ====================================================================
 * SIMULASI DATA ARSIP (FRONTEND-ONLY)
 * ====================================================================
 * Fitur ini BELUM menyentuh backend/database Supabase.
 * Data arsip disimpan sementara di localStorage browser sebagai simulasi,
 * sesuai instruksi: gunakan local state dulu sebelum backend disetujui.
 *
 * Cara kerja:
 * - Saat "Simpan ke Arsip" ditekan, snapshot data pesanan disalin ke
 *   localStorage dan order tersebut disembunyikan dari daftar aktif.
 * - Baris asli di tabel `orders` Supabase TIDAK dihapus/diubah, sehingga
 *   aman dan reversibel (bisa "Pulihkan" kapan saja).
 * - "Hapus Permanen" dari halaman arsip akan menghapus baris asli via
 *   fungsi deleteOrder() yang SUDAH ADA (tidak membuat backend baru).
 * ====================================================================
 */

const ARCHIVE_STORAGE_KEY = "lenstore_archive_v1";

function getArchiveList() {
    try {
        const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error("Gagal membaca data arsip:", err);
        return [];
    }
}

function saveArchiveList(list) {
    try {
        localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
        console.error("Gagal menyimpan data arsip:", err);
        showToast("Gagal menyimpan data arsip (local storage penuh?)", "danger");
    }
}

function isOrderArchived(orderId) {
    return getArchiveList().some(a => a.order_id === orderId);
}

function archiveOrder(order) {
    const list = getArchiveList();

    list.push({
        archive_id: `arc_${order.id}_${Date.now()}`,
        order_id: order.id,
        dashboard: order.dashboard,
        nomor_pesanan: order.nomor_pesanan,
        tagar: order.tagar,
        nomor_whatsapp: order.nomor_whatsapp || "",
        paket_total: order.paket_total,
        paket_terkirim: order.paket_terkirim,
        created_at: order.created_at || null,
        archived_at: new Date().toISOString()
    });

    saveArchiveList(list);
}

function restoreArchiveEntry(archiveId) {
    const list = getArchiveList().filter(a => a.archive_id !== archiveId);
    saveArchiveList(list);
}

function removeArchiveEntryLocal(archiveId) {
    const list = getArchiveList().filter(a => a.archive_id !== archiveId);
    saveArchiveList(list);
}

function getArchiveCount() {
    return getArchiveList().length;
}

/* ---------------- Rendering Halaman Data Arsip ---------------- */

function renderArchivePage() {
    const grid = document.getElementById("archiveGrid");
    const emptyState = document.getElementById("archiveEmptyState");
    const searchValue = document.getElementById("archiveSearchInput").value.toLowerCase().trim();
    const filterDashboard = document.getElementById("archiveFilterDashboard").value;
    const sortMode = document.getElementById("archiveSort").value;

    let list = getArchiveList();

    if (filterDashboard !== "ALL") {
        list = list.filter(a => a.dashboard === filterDashboard);
    }

    if (searchValue) {
        list = list.filter(a =>
            a.nomor_pesanan.toLowerCase().includes(searchValue) ||
            a.tagar.toLowerCase().includes(searchValue) ||
            (a.nomor_whatsapp || "").toLowerCase().includes(searchValue)
        );
    }

    if (sortMode === "newest") {
        list.sort((a, b) => new Date(b.archived_at) - new Date(a.archived_at));
    } else if (sortMode === "oldest") {
        list.sort((a, b) => new Date(a.archived_at) - new Date(b.archived_at));
    } else if (sortMode === "name") {
        list.sort((a, b) => a.nomor_pesanan.localeCompare(b.nomor_pesanan));
    }

    document.getElementById("archiveCountBadge").innerText = getArchiveCount();

    if (list.length === 0) {
        grid.innerHTML = "";
        emptyState.style.display = "flex";
        return;
    }

    emptyState.style.display = "none";

    grid.innerHTML = list.map(a => {
        const status = getOrderStatus(a.paket_terkirim, a.paket_total);
        const percent = Math.min(100, Math.round((a.paket_terkirim / a.paket_total) * 100));

        return `
        <div class="archive-card">
            <div class="archive-card-top">
                <div class="archive-card-title">${escapeHtml(a.nomor_pesanan)}</div>
                <span class="badge badge-archived">🗂️ Diarsipkan</span>
            </div>

            <div class="archive-card-meta">
                <span class="chip">${escapeHtml(a.dashboard)}</span>
                <span class="chip">${escapeHtml(a.tagar)}</span>
                ${a.nomor_whatsapp ? `<span class="chip">${escapeHtml(a.nomor_whatsapp)}</span>` : ""}
            </div>

            <div class="progress-cell">
                <div class="progress-text">H${a.paket_terkirim}/H${a.paket_total} &middot; ${status.label}</div>
                <div class="progress-track">
                    <div class="progress-fill ${status.barClass}" style="width:${percent}%;"></div>
                </div>
            </div>

            <div class="archive-card-dates">
                <span>📅 Dibuat: ${formatDateHuman(a.created_at)}</span>
                <span>🗂️ Diarsipkan: ${formatDateHuman(a.archived_at)}</span>
            </div>

            <div class="archive-card-actions">
                <button type="button" class="btn btn-outline" onclick="handleRestoreArchive('${a.archive_id}')">↩️ Pulihkan</button>
                <button type="button" class="btn btn-danger" onclick="handleDeleteArchive('${a.archive_id}', ${a.order_id}, '${escapeHtml(a.nomor_pesanan)}')">🗑 Hapus Permanen</button>
            </div>
        </div>`;
    }).join("");
}

function handleRestoreArchive(archiveId) {
    openConfirmModal({
        icon: "↩️",
        iconClass: "archive",
        title: "Pulihkan Pesanan?",
        body: "Pesanan ini akan dikembalikan ke daftar <b>Pesanan Aktif</b>.",
        confirmText: "Pulihkan",
        confirmClass: "btn-archive",
        onConfirm: () => {
            restoreArchiveEntry(archiveId);
            renderArchivePage();
            loadData();
            showToast("Pesanan dipulihkan ke daftar aktif", "archive");
        }
    });
}

function handleDeleteArchive(archiveId, orderId, nama) {
    openConfirmModal({
        icon: "🗑",
        iconClass: "danger",
        title: "Hapus Permanen?",
        body: `Data <b>${escapeHtml(nama)}</b> akan dihapus permanen dan tidak dapat dikembalikan.`,
        confirmText: "Hapus Permanen",
        confirmClass: "btn-danger",
        onConfirm: async () => {
            if (orderId) {
                await supabaseClient.from("orders").delete().eq("id", orderId);
            }
            removeArchiveEntryLocal(archiveId);
            renderArchivePage();
            showToast("Data arsip dihapus permanen", "danger");
        }
    });
}
