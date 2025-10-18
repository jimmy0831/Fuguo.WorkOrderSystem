// 富國工單管理系統主應用
new Vue({
    el: '#app',
    data: {
        isAuthenticated: false,
        userData: null,
        currentPage: 'work-order',
        currentPageTitle: '工單系統',
        menuItems: [
            { key: 'work-order', title: '工單系統', component: 'work-order-component' },
            { key: 'molds', title: '模具刀模系統', component: 'molds-component' },
            { key: 'dropdown-management', title: '下拉選單管理', component: 'dropdown-management-component', requireAdmin: true },
            { key: 'admin', title: '後台管理', component: 'admin-component', requireAdmin: true },
        ]
    },
    computed: {
        currentComponent() {
            const item = this.menuItems.find(item => item.key === this.currentPage);
            return item ? item.component : 'work-order-component';
        },
        visibleMenuItems() {
            console.log('=== 選單權限檢查開始 ===');
            console.log('當前使用者資料:', this.userData);
            console.log('isAdmin 值:', this.userData?.isAdmin);
            console.log('isAdmin 類型:', typeof this.userData?.isAdmin);
            console.log('所有選單項目:', this.menuItems);
            
            const filteredItems = this.menuItems.filter(item => {
                const hasAdminRequirement = item.requireAdmin;
                const userIsAdmin = this.userData?.isAdmin === 'Y';
                const shouldShow = !hasAdminRequirement || userIsAdmin;
                
                console.log(`選單項目 "${item.title}":`, {
                    requireAdmin: hasAdminRequirement,
                    userIsAdmin: userIsAdmin,
                    shouldShow: shouldShow
                });
                
                return shouldShow;
            });
            
            console.log('可見的選單項目:', filteredItems);
            console.log('=== 選單權限檢查結束 ===');
            
            return filteredItems;
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
                <div class="sidebar-footer">
                    <div class="user-info">
                        <span class="user-name">{{ userDisplayName }}</span>
                        <button @click="logout" class="logout-button">登出</button>
                    </div>
                </div>
            </aside>
            
            <main class="content-area">             
                <div class="content-body">
                    <component :is="currentComponent" :user-data="userData"></component>
                </div>
            </main>
        </div>
    `,
    methods: {
        validateSession() {
            try {
                const sessionString = localStorage.getItem('appSession');
                if (!sessionString) return null;

                const session = JSON.parse(sessionString);
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
        navigateTo(pageKey, pageTitle) {
            this.currentPage = pageKey;
            this.currentPageTitle = pageTitle;
        },
        logout() {
            showPopup('您已成功登出');
            localStorage.removeItem('appSession');
            delete axios.defaults.headers.common['Authorization'];

            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        },
        initializeApp() {
            const session = this.validateSession();
            if (!session) {
                window.location.href = '/login.html';
                return;
            }

            console.log('初始化應用程式，使用者會話資料:', session);
            this.userData = session.userData;
            this.isAuthenticated = true;

            if (session.token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
            }
        },
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
        this.setupAxiosInterceptors();
        this.initializeApp();
    },
    mounted() {
        console.log('=== Vue 應用程式 mounted ===');
        console.log('檢查 Vue 組件是否已註冊:');
        console.log('dropdown-management-component:', !!this.$options.components['dropdown-management-component']);
        
        // 檢查全域組件
        const globalComponents = Object.keys(Vue.options.components || {});
        console.log('全域 Vue 組件:', globalComponents);
        
        if (this.isAuthenticated && this.visibleMenuItems.length > 0) {
            const firstItem = this.visibleMenuItems[0];
            this.navigateTo(firstItem.key, firstItem.title);
        }
    }
});