// 富國工單管理系統主應用
new Vue({
    el: '#app',
    data: {
        // 認證狀態
        isAuthenticated: false,
        userData: null,
        
        // 導航狀態
        currentPage: 'work-order',
        currentPageTitle: '工單系統',
        
        // 選單配置
        menuItems: [
            { key: 'work-order', title: '工單系統', component: 'work-order-component' },
            { key: 'molds', title: '模具刀模系統', component: 'molds-component' },
            { key: 'admin', title: '後台管理', component: 'admin-component', requireAdmin: true }
        ]
    },
    
    computed: {
        currentComponent() {
            const item = this.menuItems.find(item => item.key === this.currentPage);
            return item ? item.component : 'work-order-component';
        },
        
        visibleMenuItems() {
            return this.menuItems.filter(item => {
                return !item.requireAdmin || (this.userData?.isAdmin === 'Y');
            });
        },
        
        userDisplayName() {
            return this.userData?.userName || this.userData?.account || '';
        }
    },
    
    template: `
        <div v-if="!isAuthenticated" class="loading-container">
            <div class="loading">驗證登入中...</div>
        </div>
        <div v-else class="main-container">
            <aside class="sidebar">
                <div class="sidebar-header">
                    <h2>富國塑膠</h2>
                </div>
                <nav class="sidebar-nav">
                    <ul>
                        <li v-for="item in visibleMenuItems" :key="item.key">
                            <a href="#" 
                               :class="{ active: currentPage === item.key }"
                               @click.prevent="navigateTo(item.key, item.title)">
                                {{ item.title }}
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>
            
            <main class="content-area">
                <header class="content-header">
                    <h1>{{ currentPageTitle }}</h1>
                    <div class="user-info">
                        <span>{{ userDisplayName }}</span>
                        <button @click="logout" class="logout-button">登出</button>
                    </div>
                </header>
                
                <div class="content-body">
                    <component :is="currentComponent" :user-data="userData"></component>
                </div>
            </main>
        </div>
    `,
    
    methods: {
        // 驗證使用者登入狀態
        validateSession() {
            try {
                const sessionString = localStorage.getItem('appSession');
                if (!sessionString) return null;

                const session = JSON.parse(sessionString);
                
                // 檢查日期有效性（當天有效）
                const storedDate = new Date(session.timestamp).toDateString();
                const currentDate = new Date().toDateString();
                
                if (storedDate !== currentDate) {
                    localStorage.removeItem('appSession');
                    return null;
                }

                return session;
            } catch (error) {
                console.error('Session validation error:', error);
                localStorage.removeItem('appSession');
                return null;
            }
        },
        
        // 導航功能
        navigateTo(pageKey, pageTitle) {
            this.currentPage = pageKey;
            this.currentPageTitle = pageTitle;
        },
        
        // 登出功能
        logout() {
            showPopup('您已成功登出');
            localStorage.removeItem('appSession');
            delete axios.defaults.headers.common['Authorization'];
            
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        },
        
        // 初始化應用
        initializeApp() {
            const session = this.validateSession();
            
            if (!session) {
                window.location.href = '/login.html';
                return;
            }
            
            // 設定使用者資料和認證狀態
            this.userData = session.userData;
            this.isAuthenticated = true;
            
            // 設定 axios Authorization header
            if (session.token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
            }
        },
        
        // 設定 axios 攔截器處理 401 錯誤
        setupAxiosInterceptors() {
            axios.interceptors.response.use(
                response => response,
                error => {
                    if (error.response?.status === 401) {
                        showPopup('登入已過期，請重新登入', 'error');
                        localStorage.removeItem('appSession');
                        delete axios.defaults.headers.common['Authorization'];
                        
                        setTimeout(() => {
                            window.location.href = '/login.html';
                        }, 1500);
                    }
                    return Promise.reject(error);
                }
            );
        }
    },
    
    created() {
        // 設定 axios 攔截器
        this.setupAxiosInterceptors();
        
        // 初始化應用
        this.initializeApp();
    },
    
    mounted() {
        // 導航到第一個可見頁面
        if (this.isAuthenticated && this.visibleMenuItems.length > 0) {
            const firstItem = this.visibleMenuItems[0];
            this.navigateTo(firstItem.key, firstItem.title);
        }
    }
});