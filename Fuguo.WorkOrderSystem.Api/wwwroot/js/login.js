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
                const session = {
                    userData: response.data,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem('appSession', JSON.stringify(session));

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
