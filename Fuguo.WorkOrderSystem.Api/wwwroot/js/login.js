new Vue({
    el: '#app',
    data: {
        username: '',
        password: '',
        error: null
    },
    methods: {
        login: function() {
            this.error = null;

            if (!this.username || !this.password) {
                this.error = '帳號和密碼不能為空';
                return;
            }

            showLoading();

            axios.post('/api/Auth/login', {
                account: this.username,
                password: this.password
            })
            .then(response => {
                // 儲存 JWT Token 和使用者資訊
                const session = {
                    token: response.data.token,
                    userData: {
                        userId: response.data.userId,
                        userName: response.data.userName,
                        account: response.data.account,
                        isAdmin: response.data.isAdmin
                    },
                    timestamp: new Date().getTime()
                };
                localStorage.setItem('appSession', JSON.stringify(session));

                // 設定 axios 預設 Authorization header
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

                showPopup('登入成功！歡迎 ' + response.data.userName);

                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);

            })
            .catch(error => {
                console.error('登入失敗:', error.response);
                const message = error.response?.data?.message || '登入時發生未知的錯誤';
                this.error = message;
                showPopup(message, 'error');
            })
            .finally(() => {
                hideLoading();
            });
        }
    }
});
