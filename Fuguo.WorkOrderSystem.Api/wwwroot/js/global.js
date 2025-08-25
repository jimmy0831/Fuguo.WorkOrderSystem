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

// 全域設定 axios 攔截器
$(document).ready(function() {
    // 從 localStorage 恢復 Authorization header（如果存在）
    const sessionString = localStorage.getItem('appSession');
    if (sessionString) {
        try {
            const session = JSON.parse(sessionString);
            if (session.token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
            }
        } catch (error) {
            console.error('無法恢復 Authorization header:', error);
        }
    }
});
