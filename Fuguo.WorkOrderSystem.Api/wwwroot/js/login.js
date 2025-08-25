// 登入頁面 Vue 應用
new Vue({
    el: '#app',
    data: {
        username: '',
        password: '',
        error: null,
        loading: false
    },
    methods: {
        async login() {
            // 清除錯誤訊息
            this.error = null;

            // 驗證輸入
            if (!this.username || !this.password) {
                this.error = '帳號和密碼不能為空';
                return;
            }

            this.loading = true;
            showLoading();

            try {
                const response = await axios.post('/api/Auth/login', {
                    account: this.username,
                    password: this.password
                });

                // 儲存登入資訊
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

                showPopup(`登入成功！歡迎 ${response.data.userName}`);

                // 跳轉到主頁面
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);

            } catch (error) {
                console.error('登入失敗:', error);
                const message = error.response?.data?.message || '登入時發生錯誤';
                this.error = message;
                showPopup(message, 'error');
            } finally {
                this.loading = false;
                hideLoading();
            }
        }
    }
});
