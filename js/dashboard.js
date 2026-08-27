async function loadData() {
    const todayUTC = getUTCDate();
    const { data, error } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("dashboard", currentDashboard)
        .order("id", { ascending: true });
    
    if (error) {
        console.error(error);
        return;
    }
        const total =
    data.length;

    const selesai =
        data.filter(
            x =>
            x.paket_terkirim >=
            x.paket_total
        ).length;
    
    const proses =
        total - selesai;
    
    document
        .getElementById(
            "totalOrder"
        ).innerText =
        total;
    
    document
        .getElementById(
            "prosesOrder"
        ).innerText =
        proses;
    
    document
        .getElementById(
            "selesaiOrder"
        ).innerText =
        selesai;

    tbody.innerHTML = "";

    for (let i = 0; i < data.length; i++) {

        const item = data[i];

        // reset tombol setiap hari UTC
        const sudahCheck =
            item.last_check_utc === todayUTC;

        const paketText =
            `H${item.paket_terkirim}/H${item.paket_total}`;
        let status = "";
            if (
                item.paket_terkirim >=
                item.paket_total
            ) {
            
                status =
                    "✅ Selesai";
            
            } else {
            
                status =
                    "⏳ Proses";
            }

        const wa =
            item.nomor_whatsapp || "-";

        const ket =
            item.keterangan || "";

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${i + 1}</td>

            <td>${item.nomor_pesanan}</td>

            <td>
                <span
                    class="copy-tag"
                    onclick="copyTag('${item.tagar}')">
                    ${item.tagar}
                </span>
            </td>

            <td>${wa}</td>

            <td>
                ${paketText}
                <br>
                <small>${status}</small>
            </td>

            <td>

    <button
        class="check-btn"
        onclick="checkDaily(${item.id})"
        ${sudahCheck ? "disabled" : ""}>
        ✓
    </button>

    <button
        class="delete-btn"
        onclick="deleteOrder(${item.id})">
        🗑
    </button>

</td>

<td>

    <button
        class="check-btn"
        onclick="checkDaily(${item.id})"
        ${sudahCheck ? "disabled" : ""}>
        ✓
    </button>

    <button
        class="edit-btn"
        onclick="editOrder(${item.id})">
        ✏️
    </button>

    <button
        class="delete-btn"
        onclick="deleteOrder(${item.id})">
        🗑
    </button>

</td>
        <td>
            <span
                class="copy-keterangan"
                data-copy="${ket}">
                ${ket}
            </span>
        </td>
        `;

        tbody.appendChild(tr);
    }
}

async function deleteOrder(id) {

    const confirmDelete =
        confirm("Hapus data?");

    if (!confirmDelete)
        return;

    await supabaseClient
        .from("orders")
        .delete()
        .eq("id", id);

    loadData();
}

async function editOrder(id) {

    const { data } =
        await supabaseClient
            .from("orders")
            .select("*")
            .eq("id", id)
            .single();

    const nomor =
        prompt(
            "Nomor Pesanan",
            data.nomor_pesanan
        );

    const tagar =
        prompt(
            "Tagar",
            data.tagar
        );

    const wa =
        prompt(
            "WhatsApp",
            data.nomor_whatsapp
        );

    const paket =
        prompt(
            "Jumlah Paket",
            data.paket_total
        );

    if (!nomor || !tagar)
        return;

    const ket =
        createKeterangan(
            tagar,
            data.paket_terkirim,
            paket,
            wa
        );

    await supabaseClient
        .from("orders")
        .update({
            nomor_pesanan: nomor,
            tagar: tagar,
            nomor_whatsapp: wa,
            paket_total: paket,
            keterangan: ket
        })
        .eq("id", id);

    loadData();
}
