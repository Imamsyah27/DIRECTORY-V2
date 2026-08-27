async function checkDaily(id) {

    const todayUTC = getUTCDate();

    const { data, error } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        return;
            }
            if (
            data.paket_terkirim >=
            data.paket_total
        ) {

    alert(
        "Paket sudah selesai"
    );

    return;
}

    // hanya sekali per hari UTC
    if (data.last_check_utc === todayUTC) {
        alert("Pengiriman hari ini sudah dicentang.");
        return;
    }

    let terkirim = data.paket_terkirim + 1;

    if (terkirim > data.paket_total) {
        terkirim = data.paket_total;
    }

    const paketBaru =
        `H${terkirim}/H${data.paket_total}`;
    
    const wa =
        data.nomor_whatsapp
            ? `https://wa.me/${data.nomor_whatsapp.replace("+","")}`
            : "";
    
    const keterangan =
        `${data.dashboard} ${paketBaru} | ${data.tagar}${
            wa ? " | " + wa : ""
        }`;

    await supabaseClient
        .from("orders")
        .update({
            paket_terkirim: terkirim,
            last_check_utc: todayUTC,
            keterangan: keterangan
        })
        .eq("id", id);

    loadData();
}

async function resetDailyUTC() {

    const todayUTC = getUTCDate();

    const { data } = await supabaseClient
        .from("orders")
        .select("*");

    for (const item of data) {

        if (item.last_check_utc !== todayUTC) {

            await supabaseClient
                .from("orders")
                .update({
                    keterangan: ""
                })
                .eq("id", item.id);
        }
    }
}

// cek pergantian hari UTC setiap 1 menit
setInterval(resetDailyUTC, 60000);
