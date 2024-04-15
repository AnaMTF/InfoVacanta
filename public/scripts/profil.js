document.addEventListener("DOMContentLoaded", function () {

    // Selectează butonul de schimbare a bannerului
    var btnChangeBanner = document.getElementById('btnChangeBanner');

    // Adaugă eveniment de click pentru butonul de schimbare a bannerului
    btnChangeBanner.addEventListener('click', function () {
        // Afișează o alertă când butonul este apăsat
        alert('Butonul de schimbare a bannerului a fost apăsat');
    });

    // Selectează butonul de schimbare a profilului
    var btnChangeProfile = document.getElementById('btnChangeProfile');

    // Adaugă eveniment de click pentru butonul de schimbare a profilului
    btnChangeProfile.addEventListener('click', function () {
        // Afișează o alertă când butonul este apăsat
        alert('Butonul de schimbare a profilului a fost apăsat');
    });
});
