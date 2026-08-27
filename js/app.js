const tbody = document.getElementById("tableBody");
const addBtn = document.getElementById("addData");

/* ---------------- Navigasi Halaman (Dashboard Aktif / Data Arsip) ---------------- */
document.querySelectorAll("#pageNav button").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll("#pageNav button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const page = btn.dataset.page;

        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        document.getElementById(`view-${page}`).classList.add("active");

        if (page === "arsip") {
            renderArchivePage();
        } else {
            loadData();
        }
    });
});

/* ---------------- Sub-tab Dashboard (BEM / LEM / SEM) ---------------- */
document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
        btn.classList.add("active");
        currentDashboard = btn.dataset.dashboard;
        loadData();
    });
});

/* ---------------- Search ---------------- */
document.getElementById("searchInput").addEventListener("input", filterTable);

document.getElementById("archiveSearchInput").addEventListener("input", renderArchivePage);
document.getElementById("archiveFilterDashboard").addEventListener("change", renderArchivePage);
document.getElementById("archiveSort").addEventListener("change", renderArchivePage);

/* ---------------- Tambah Pesanan ---------------- */
addBtn.addEventListener("click", async () => {
    const nomorPesanan = document.getElementById("orderNumber").value.trim();
    const tagar = document.getElementById("hashtag").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const paket = parseInt(document.getElementById("packageTotal").value);

    if (!nomorPesanan || !tagar || !paket) {
        showToast("Lengkapi data terlebih dahulu", "danger");
        return;
    }

    if (whatsapp && !validWhatsapp(whatsapp)) {
        showToast("Format WA harus diawali tanda +...", "danger");
        return;
    }

    const keterangan = `${currentDashboard} H0/H${paket} | ${tagar} | ${
        whatsapp ? "https://wa.me/" + whatsapp.replace("+", "") : ""
    }`;

    const { error } = await supabaseClient
        .from("orders")
        .insert([{
            dashboard: currentDashboard,
            nomor_pesanan: nomorPesanan,
            tagar: tagar,
            nomor_whatsapp: whatsapp,
            paket_total: paket,
            paket_terkirim: 0,
            last_check_utc: "",
            keterangan: keterangan
        }]);

    if (error) {
        console.error(error);
        showToast("Gagal menambahkan pesanan", "danger");
        return;
    }

    document.getElementById("orderNumber").value = "";
    document.getElementById("hashtag").value = "";
    document.getElementById("whatsapp").value = "";
    document.getElementById("packageTotal").value = "";

    showToast("Pesanan baru berhasil ditambahkan", "success");
    loadData();
});

loadData();
