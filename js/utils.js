function getUTCDate() {
    return new Date()
        .toISOString()
        .split("T")[0];
}

async function copyTag(tagar) {

    try {

        await navigator.clipboard.writeText(tagar);

        const oldTitle = document.title;

        document.title = "✓ Tagar disalin";

        setTimeout(() => {
            document.title = oldTitle;
        }, 1000);

    } catch (err) {

        console.error(err);

        alert("Gagal menyalin tagar");
    }
}

function formatPaket(
    terkirim,
    total
) {
    return `H${terkirim}/H${total}`;
}

function createKeterangan(
    tagar,
    terkirim,
    total,
    whatsapp
) {

    const paket =
        formatPaket(
            terkirim,
            total
        );

    const wa =
        whatsapp
            ? `https://wa.me/${whatsapp.replace("+","")}`
            : "";

    return `${tagar} | ${paket} | ${wa}`;
}

function validWhatsapp(
    nomor
) {
    return /^\+\d+$/
        .test(nomor);
}

function filterTable() {

    const value =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .toLowerCase();

    const rows =
        document
            .querySelectorAll(
                "#tableBody tr"
            );

    rows.forEach(row => {

        const text =
            row.innerText
                .toLowerCase();

        row.style.display =
            text.includes(value)
            ? ""
            : "none";
    });
}

async function copyKeterangan(keterangan) {

    try {

        await navigator.clipboard.writeText(
            keterangan
        );

        alert(
            "Keterangan berhasil disalin"
        );

    } catch (err) {

        console.error(err);

        alert(
            "Gagal menyalin keterangan"
        );
    }
}
