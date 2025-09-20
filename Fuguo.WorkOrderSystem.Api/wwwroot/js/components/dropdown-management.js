Vue.component('dropdown-management-component', {
    props: ['userData'],
    data() {
        return {
            loading: false,
            activeTab: 'packaging', // packaging, forming, cutting
            
            // 數據存儲
            packagingTypes: [],
            formingTypes: [],
            cuttingTypes: [],
            
            // Modal 狀態
            showCreateModal: false,
            showEditModal: false,
            
            // 表單數據
            newItem: {
                name: ''
            },
            editItem: {
                id: null,
                name: ''
            },
            
            // 當前操作的表格類型
            currentTableType: 'packaging'
        };
    },
    
    computed: {
        currentData() {
            switch (this.activeTab) {
                case 'packaging': return this.packagingTypes;
                case 'forming': return this.formingTypes;
                case 'cutting': return this.cuttingTypes;
                default: return [];
            }
        },        
        currentTableTitle() {
            switch (this.activeTab) {
                case 'packaging': return '包裝方式';
                case 'forming': return '成形';
                case 'cutting': return '斬型';
                default: return '';
            }
        },        
        createModalTitle() {
            return `新增${this.currentTableTitle}`;
        },        
        editModalTitle() {
            return `編輯${this.currentTableTitle}`;
        }
    },    
    template: `
        <div class="dropdown-management-container"">
            <!-- 頁籤 -->
            <div class="tab-container">
                <button 
                    class="tab-button" 
                    :class="{ active: activeTab === 'packaging' }"
                    @click="switchTab('packaging')">
                    包裝方式
                </button>
                <button 
                    class="tab-button" 
                    :class="{ active: activeTab === 'forming' }"
                    @click="switchTab('forming')">
                    成形
                </button>
                <button 
                    class="tab-button" 
                    :class="{ active: activeTab === 'cutting' }"
                    @click="switchTab('cutting')">
                    斬型
                </button>
            </div>
            
            <!-- 表格內容 -->
            <div class="table-area">
                <div class="table-action-header">
                    <h3>{{ currentTableTitle }}</h3>
                    <button class="btn btn-primary" @click="showCreateItemModal">新增</button>
                </div>
                <table class="user-table" v-if="!loading">
                    <thead>
                        <tr>
                            <th>名稱</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in currentData" :key="item.id">
                            <td>{{ item.name }}</td>
                            <td>
                                <button class="btn btn-edit" @click="editItemModal(item)">編輯</button>
                                <button class="btn btn-delete" @click="deleteItem(item.id, item.name)">刪除</button>
                            </td>
                        </tr>
                        <tr v-if="currentData.length === 0">
                            <td colspan="2" class="no-data">暫無{{ currentTableTitle }}資料</td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="loading" class="loading">載入中...</div>
            </div>
            
            <!-- 新增 Modal -->
            <div v-if="showCreateModal" class="modal-overlay">
                <div class="modal">
                    <div class="modal-body">
                        <h3>{{ createModalTitle }}</h3>
                        <div class="form-group">
                            <label>名稱:</label>
                            <input 
                                type="text" 
                                v-model="newItem.name" 
                                placeholder="請輸入名稱"
                                ref="createNameInput"
                                required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="closeCreateModal">取消</button>
                        <button class="btn btn-primary" @click="createItem">建立</button>
                    </div>
                </div>
            </div>

            <!-- 編輯 Modal -->
            <div v-if="showEditModal" class="modal-overlay">
                <div class="modal">
                    <div class="modal-body">
                        <h3>{{ editModalTitle }}</h3>
                        <div class="form-group">
                            <label>名稱:</label>
                            <input 
                                type="text" 
                                v-model="editItem.name" 
                                placeholder="請輸入名稱"
                                ref="editNameInput"
                                required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="closeEditModal">取消</button>
                        <button class="btn btn-primary" @click="updateItem">更新</button>
                    </div>
                </div>
            </div>
        </div>
    `,    
    methods: {
        switchTab(tab) {
            this.activeTab = tab;
            this.currentTableType = tab;
            this.loadCurrentData();
        },
        
        async loadCurrentData() {
            switch (this.activeTab) {
                case 'packaging': 
                    await this.loadPackagingTypes();
                    break;
                case 'forming':
                    await this.loadFormingTypes();
                    break;
                case 'cutting':
                    await this.loadCuttingTypes();
                    break;
            }
        },
        
        async loadPackagingTypes() {
            this.loading = true;
            try {
                const response = await axios.get('/api/Dropdown/packaging-types');
                this.packagingTypes = response.data;
            } catch (error) {
                console.error('載入包裝方式失敗:', error);
                showPopup('載入包裝方式列表失敗', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        async loadFormingTypes() {
            this.loading = true;
            try {
                const response = await axios.get('/api/Dropdown/forming-types');
                this.formingTypes = response.data;
            } catch (error) {
                console.error('載入成形方式失敗:', error);
                showPopup('載入成形方式列表失敗', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        async loadCuttingTypes() {
            this.loading = true;
            try {
                const response = await axios.get('/api/Dropdown/cutting-types');
                this.cuttingTypes = response.data;
            } catch (error) {
                console.error('載入斬型方式失敗:', error);
                showPopup('載入斬型方式列表失敗', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        showCreateItemModal() {
            this.resetNewItem();
            this.showCreateModal = true;
            this.$nextTick(() => {
                if (this.$refs.createNameInput) {
                    this.$refs.createNameInput.focus();
                }
            });
        },
        
        closeCreateModal() {
            this.showCreateModal = false;
        },
        
        async createItem() {
            if (!this.validateItemForm(this.newItem)) return;
            
            const apiEndpoint = this.getApiEndpoint();
            
            try {
                await axios.post(apiEndpoint, this.newItem);
                showPopup(`${this.currentTableTitle}建立成功`, 'success');
                this.closeCreateModal();
                this.loadCurrentData();
            } catch (error) {
                console.error(`建立${this.currentTableTitle}失敗:`, error);
                const message = error.response?.data?.message || `建立${this.currentTableTitle}失敗`;
                showPopup(message, 'error');
            }
        },
        
        editItemModal(item) {
            this.editItem = {
                id: item.id,
                name: item.name
            };
            this.showEditModal = true;
            this.$nextTick(() => {
                if (this.$refs.editNameInput) {
                    this.$refs.editNameInput.focus();
                }
            });
        },
        
        closeEditModal() {
            this.showEditModal = false;
        },
        
        async updateItem() {
            if (!this.validateItemForm(this.editItem)) return;
            
            const apiEndpoint = this.getApiEndpoint();
            
            try {
                await axios.put(`${apiEndpoint}/${this.editItem.id}`, { name: this.editItem.name });
                showPopup(`${this.currentTableTitle}更新成功`, 'success');
                this.closeEditModal();
                this.loadCurrentData();
            } catch (error) {
                console.error(`更新${this.currentTableTitle}失敗:`, error);
                const message = error.response?.data?.message || `更新${this.currentTableTitle}失敗`;
                showPopup(message, 'error');
            }
        },        
        deleteItem(id, name) {
            if (!confirm(`確定要刪除「${name}」嗎？`)) return;
            
            this.performDeleteItem(id);
        },        
        async performDeleteItem(id) {
            const apiEndpoint = this.getApiEndpoint();
            
            try {
                await axios.delete(`${apiEndpoint}/${id}`);
                showPopup(`${this.currentTableTitle}刪除成功`, 'success');
                this.loadCurrentData();
            } catch (error) {
                console.error(`刪除${this.currentTableTitle}失敗:`, error);
                const message = error.response?.data?.message || `刪除${this.currentTableTitle}失敗`;
                showPopup(message, 'error');
            }
        },
        
        getApiEndpoint() {
            switch (this.activeTab) {
                case 'packaging': return '/api/Dropdown/packaging-types';
                case 'forming': return '/api/Dropdown/forming-types';
                case 'cutting': return '/api/Dropdown/cutting-types';
                default: return '';
            }
        },
        
        validateItemForm(item) {
            if (!item.name || !item.name.trim()) {
                showPopup('請填寫名稱', 'error');
                return false;
            }
            return true;
        },
        
        resetNewItem() {
            this.newItem = {
                name: ''
            };
        }
    },
    
    created() {
        console.log('dropdown-management-component created，接收到的 userData:', this.userData);
    },
    
    async mounted() {
        console.log('dropdown-management-component mounted');
        console.log('使用者權限檢查:', this.userData?.isAdmin);
        
        if (this.userData?.isAdmin !== 'Y') {
            console.log('使用者沒有管理員權限，isAdmin:', this.userData?.isAdmin);
            showPopup('您沒有權限存取此功能', 'error');
            return;
        }
        console.log('使用者有管理員權限，開始載入資料');
        await this.loadCurrentData();
    }
});

console.log('dropdown-management-component 已註冊完成');
