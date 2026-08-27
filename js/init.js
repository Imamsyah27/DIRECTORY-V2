document.addEventListener("DOMContentLoaded", async () => {

    try {

        // reset tampilan jika sudah berganti hari UTC
        await resetDailyUTC();

        // load dashboard default
        await loadData();

    } catch (err) {

        console.error(err);

        alert("Gagal memuat dashboard");
    }

});

document.addEventListener(
    "click",
    async function(e){

        if(
            e.target.classList.contains(
                "copy-keterangan"
            )
        ){

            await navigator
                .clipboard
                .writeText(
                    e.target.dataset.copy
                );

            alert(
                "Keterangan berhasil disalin"
            );
        }
    }
);

// refresh data setiap 30 detik
setInterval(() => {
    loadData();
}, 30000);
