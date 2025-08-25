$(document).ready(function() {
    function validateSession() {
        const sessionString = localStorage.getItem('appSession');
        if (!sessionString) {
            return null;
        }

        try {
            const session = JSON.parse(sessionString);
            
            // 檢查是否為當天（JWT Token 時效檢查）
            const storedDate = new Date(session.timestamp).toLocaleDateString();
            const currentDate = new Date().toLocaleDateString();

            if (storedDate !== currentDate) {
                localStorage.removeItem('appSession');
                return null;
            }

            // 設定 axios 預設 Authorization header
            if (session.token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
            }

            return session.userData;
        } catch (error) {
            console.error('Session validation error:', error);
            localStorage.removeItem('appSession');
            return null;
        }
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
            // 清除 axios Authorization header
            delete axios.defaults.headers.common['Authorization'];
            setTimeout(() => window.location.href = '/login.html', 1500);
        });
    }

    // 設定 axios 攔截器處理 JWT Token 過期
    axios.interceptors.response.use(
        function (response) {
            return response;
        },
        function (error) {
            if (error.response && error.response.status === 401) {
                // Token 過期或無效，重新導向到登入頁面
                showPopup('登入已過期，請重新登入', 'error');
                localStorage.removeItem('appSession');
                delete axios.defaults.headers.common['Authorization'];
                setTimeout(() => window.location.href = '/login.html', 1500);
            }
            return Promise.reject(error);
        }
    );

    initialize();
});