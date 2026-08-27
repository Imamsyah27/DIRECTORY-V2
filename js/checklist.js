async function checkDaily(id) {
    const todayUTC = getUTCDate();

    const { data, error } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        showToast("Gagal memuat data pesanan", "danger");
        return;
    }

    if (data.paket_terkirim >= data.paket_total) {
        showToast("Paket sudah mencapai limit — simpan ke arsip atau hapus", "danger");
        return;
    }

    if (data.last_check_utc === todayUTC) {
        showToast("Pengiriman hari ini sudah dicentang", "danger");
        return;
    }

    let terkirim = data.paket_terkirim + 1;
    if (terkirim > data.paket_total) terkirim = data.paket_total;

    const paketBaru = `H${terkirim}/H${data.paket_total}`;
    const wa = data.nomor_whatsapp ? `https://wa.me/${data.nomor_whatsapp.replace("+", "")}` : "";
    const keterangan = `${data.dashboard} ${paketBaru} | ${data.tagar}${wa ? " | " + wa : ""}`;

    await supabaseClient
        .from("orders")
        .update({
            paket_terkirim: terkirim,
            last_check_utc: todayUTC,
            keterangan: keterangan
        })
        .eq("id", id);

    showToast(`Pengiriman hari ini dicatat (${paketBaru})`, "success");
    loadData();
}

async function resetDailyUTC() {
    const todayUTC = getUTCDate();

    const { data } = await supabaseClient.from("orders").select("*");
    if (!data) return;

    for (const item of data) {
        if (item.last_check_utc !== todayUTC) {
            await supabaseClient
                .from("orders")
                .update({ keterangan: "" })
                .eq("id", item.id);
        }
    }
}

// cek pergantian hari UTC setiap 1 menit
setInterval(resetDailyUTC, 60000);
