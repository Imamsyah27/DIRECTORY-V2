const tbody = document.getElementById("tableBody");
const addBtn = document.getElementById("addData");

document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {

        document
            .querySelectorAll(".tab")
            .forEach(x => x.classList.remove("active"));

        btn.classList.add("active");

        currentDashboard = btn.dataset.dashboard;

        loadData();
    });
});

document
    .getElementById("searchInput")
    .addEventListener(
        "keyup",
        filterTable
    );

addBtn.addEventListener("click", async () => {

    const nomorPesanan =
        document.getElementById("orderNumber").value.trim();

    const tagar =
        document.getElementById("hashtag").value.trim();

    const whatsapp =
        document.getElementById("whatsapp").value.trim();

    const paket =
        parseInt(document.getElementById("packageTotal").value);

    if (!nomorPesanan || !tagar || !paket) {
        alert("Lengkapi data");
        return;
    }

    if (
        whatsapp &&
        !/^\+\d+$/.test(whatsapp)
    ) {
        alert("Format WA harus diawali tanda +...");
        return;
    }

        const keterangan =
            `${currentDashboard} H0/H${paket} | ${tagar} | ${
                whatsapp
                ? "https://wa.me/" + whatsapp.replace("+","")
                : ""
            }`;
    
    await supabaseClient
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

    document.getElementById("orderNumber").value = "";
    document.getElementById("hashtag").value = "";
    document.getElementById("whatsapp").value = "";
    document.getElementById("packageTotal").value = "";

    loadData();
});

loadData();
