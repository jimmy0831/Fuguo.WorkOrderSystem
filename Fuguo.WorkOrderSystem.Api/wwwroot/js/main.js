$(document).ready(function() {
    function validateSession() {
        const sessionString = localStorage.getItem('appSession');
        if (!sessionString) {
            return null;
        }

        const session = JSON.parse(sessionString);
        const storedDate = new Date(session.timestamp).toLocaleDateString();
        const currentDate = new Date().toLocaleDateString();

        if (storedDate === currentDate) {
            return session.userData;
        }

        localStorage.removeItem('appSession');
        return null;
    }

    const userData = validateSession();

    if (!userData) {
        window.location.href = '/login.html';
        return;
    }

    function initialize() {
        setupUserInfo();
        setupNavigation();
        setupLogout();
    }

    function setupUserInfo() {
        $('#user-name').text(userData.userName);
        if (userData.isAdmin === 'Y') {
            $('#admin-menu-item').show();
        }
    }

    function setupNavigation() {
        const $navLinks = $('.sidebar-nav a');

        $navLinks.on('click', function(e) {
            e.preventDefault();
            const $this = $(this);

            $navLinks.removeClass('active');
            $this.addClass('active');

            const pageTitle = $this.text();
            $('.content-header h1').text(pageTitle);
            $('.content-body').html(`<p>這裡是「${pageTitle}」的內容。</p>`);
        });

        $navLinks.first().trigger('click');
    }

    function setupLogout() {
        $('#logout-button').on('click', function() {
            showPopup('您已成功登出');
            localStorage.removeItem('appSession');
            setTimeout(() => window.location.href = '/login.html', 1500);
        });
    }

    initialize();

});