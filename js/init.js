document.addEventListener("DOMContentLoaded", async () => {
    try {
        await resetDailyUTC();
        await loadData();
    } catch (err) {
        console.error(err);
        showToast("Gagal memuat dashboard", "danger");
    }
});

// refresh data setiap 30 detik (hanya jika sedang di halaman Dashboard Aktif)
setInterval(() => {
    const dashboardView = document.getElementById("view-dashboard");
    if (dashboardView && dashboardView.classList.contains("active")) {
        loadData();
    }
}, 30000);
