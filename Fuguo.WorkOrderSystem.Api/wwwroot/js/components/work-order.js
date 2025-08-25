Vue.component('work-order-component', {
    props: ['userData'],
    data() {
        return {
            workOrders: [],
            loading: false,
            searchKeyword: '',
            statusFilter: 'all'
        };
    },
    template: `
        <div class="work-order-container">
            <div class="work-order-header">
                <h3>工單系統</h3>
                <div class="header-actions">
                    <div class="filter-group">
                        <select v-model="statusFilter" class="status-filter">
                            <option value="all">全部狀態</option>
                            <option value="pending">待處理</option>
                            <option value="processing">處理中</option>
                            <option value="completed">已完成</option>
                        </select>
                    </div>
                    <div class="search-box">
                        <input 
                            type="text" 
                            v-model="searchKeyword" 
                            placeholder="搜尋工單..."
                            class="search-input">
                    </div>
                    <button class="btn btn-primary" @click="createWorkOrder">新增工單</button>
                </div>
            </div>
            
            <div class="work-order-content">
                <div v-if="loading" class="loading">載入中...</div>
                <div v-else class="work-order-list">
                    <p>工單系統功能開發中...</p>
                </div>
            </div>
        </div>
    `,
    methods: {
        createWorkOrder() {
            showPopup('新增工單功能開發中...');
        },
        
        async loadWorkOrders() {
            this.loading = true;
            try {
                // TODO: 實作載入工單資料的 API 呼叫
                // const response = await axios.get('/api/WorkOrders');
                // this.workOrders = response.data;
            } catch (error) {
                console.error('載入工單資料失敗:', error);
                showPopup('載入工單資料失敗', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        filterWorkOrders() {
            // TODO: 實作工單篩選邏輯
        }
    },
    
    watch: {
        statusFilter: 'filterWorkOrders',
        searchKeyword: 'filterWorkOrders'
    },
    
    mounted() {
        this.loadWorkOrders();
    }
});