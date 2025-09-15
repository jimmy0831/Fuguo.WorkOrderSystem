function showPopup(message, type = 'success') {
    $('.popup').remove();

    const $popup = $('<div>', {
        class: `popup ${type}`,
        text: message
    });

    $('body').append($popup);
    $popup.delay(2000).fadeOut(500, () => $popup.remove());
}

function showLoading() {
    if ($('.loading-overlay').length === 0) {
        const $overlay = $('<div>', { class: 'loading-overlay' });
        const $spinner = $('<div>', { class: 'loading-spinner' });
        $overlay.append($spinner);
        $('body').append($overlay);
    }
}

function hideLoading() {
    $('.loading-overlay').fadeOut(300, () => $('.loading-overlay').remove());
}
