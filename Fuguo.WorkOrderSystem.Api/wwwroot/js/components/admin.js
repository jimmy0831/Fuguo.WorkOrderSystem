Vue.component('admin-component', {
    props: ['userData'],
    data() {
        return {
            users: [],
            loading: false,
            showCreateModal: false,
            showEditModal: false,
            userIdCheckTimer: null,
            newUser: {
                userId: '',
                userName: '',
                account: '',
                password: '',
                isAdmin: 'N'
            },
            editUser: {
                userId: '',
                userName: '',
                account: '',
                password: '',
                isAdmin: 'N'
            }
        };
    },
    template: `
        <div class="admin-container">
            <div class="table-action-header">
                <button class="btn btn-primary" @click="showCreateUserModal">新增使用者</button>
            </div>
            <table class="user-table" v-if="!loading">
                <thead>
                    <tr>
                        <th>使用者ID</th>
                        <th>使用者名稱</th>
                        <th>帳號</th>
                        <th>密碼</th>
                        <th>管理員</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.userId">
                        <td>{{ user.userId }}</td>
                        <td>{{ user.userName }}</td>
                        <td>{{ user.account }}</td>
                        <td class="password-cell" :title="user.password">{{ user.password }}</td>
                        <td>
                            <span :class="['admin-badge', user.isAdmin === 'Y' ? 'yes' : 'no']">
                                {{ user.isAdmin === 'Y' ? '是' : '否' }}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-edit" @click="editUserModal(user)">編輯</button>
                            <button class="btn btn-delete" @click="deleteUser(user.userId)" :disabled="user.account === userData.account">刪除</button>
                        </td>
                    </tr>
                    <tr v-if="users.length === 0">
                        <td colspan="6" class="no-data">暫無使用者資料</td>
                    </tr>
                </tbody>
            </table>
            <div v-if="loading" class="loading">載入中...</div>
            
            <div v-if="showCreateModal" class="modal-overlay">
                <div class="modal">
                    <div class="modal-body">
                        <h3>建立新使用者</h3>
                        <div class="form-group">
                            <label>使用者ID:</label>
                            <input 
                                type="text" 
                                ref="createUserIdInput"
                                v-model="newUser.userId" 
                                @input="handleUserIdInput('create', $event)"
                                @keypress="restrictToNumbers($event)"
                                @paste="handlePaste($event)"
                                @blur="checkUserIdExists('create')"
                                placeholder="請輸入正整數"
                                autocomplete="off"
                                required>
                            <small class="form-hint">請輸入正整數</small>
                        </div>
                        <div class="form-group">
                            <label>使用者名稱:</label>
                            <input type="text" v-model="newUser.userName" required>
                        </div>
                        <div class="form-group">
                            <label>帳號:</label>
                            <input type="text" v-model="newUser.account" required>
                        </div>
                        <div class="form-group">
                            <label>密碼:</label>
                            <input type="text" v-model="newUser.password" required>
                        </div>
                        <div class="form-group">
                            <label>管理員:</label>
                            <select v-model="newUser.isAdmin">
                                <option value="N">否</option>
                                <option value="Y">是</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="closeCreateModal">取消</button>
                        <button class="btn btn-primary" @click="createUser">建立</button>
                    </div>
                </div>
            </div>

            <div v-if="showEditModal" class="modal-overlay">
                <div class="modal">
                    <div class="modal-body">
                        <h3>編輯使用者</h3>
                        <div class="form-group">
                            <label>使用者ID:</label>
                            <input type="text" v-model="editUser.userId" readonly>
                            <small class="form-hint">使用者ID無法修改</small>
                        </div>
                        <div class="form-group">
                            <label>使用者名稱:</label>
                            <input type="text" v-model="editUser.userName" required>
                        </div>
                        <div class="form-group">
                            <label>帳號:</label>
                            <input type="text" v-model="editUser.account" required>
                        </div>
                        <div class="form-group">
                            <label>新密碼 (留空則不修改):</label>
                            <input type="text" v-model="editUser.password">
                        </div>
                        <div class="form-group">
                            <label>管理員:</label>
                            <select v-model="editUser.isAdmin">
                                <option value="N">否</option>
                                <option value="Y">是</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="closeEditModal">取消</button>
                        <button class="btn btn-primary" @click="updateUser">更新</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    methods: {
        isValidPositiveInteger(value) {
            return /^\d+$/.test(value) && Number(value) > 0;
        },
        cleanUserId(value) {
            let cleaned = value.replace(/[^0-9]/g, '');

            if (cleaned.length > 1) {
                cleaned = cleaned.replace(/^0+/, '');
            }

            if (cleaned.length > 10) {
                cleaned = cleaned.substring(0, 10);
            }
            return cleaned === '' || cleaned === '0' ? '' : cleaned;
        },
        restrictToNumbers(event) {
            const char = String.fromCharCode(event.which);

            if (!/[0-9]/.test(char)) {
                event.preventDefault();
            }
        },
        handlePaste(event) {
            event.preventDefault();
            const paste = (event.clipboardData || window.clipboardData).getData('text');
            const numbersOnly = paste.replace(/[^0-9]/g, '');

            if (numbersOnly) {
                const target = event.target;
                const start = target.selectionStart;
                const end = target.selectionEnd;
                const currentValue = target.value;
                const newValue = currentValue.substring(0, start) + numbersOnly + currentValue.substring(end);
                target.value = newValue;
                const inputEvent = new Event('input', { bubbles: true });
                target.dispatchEvent(inputEvent);
            }
        },
        handleUserIdInput(mode, event) {
            const userIdField = mode === 'create' ? 'newUser' : 'editUser';
            const cleanedValue = this.cleanUserId(event.target.value);
            this[userIdField].userId = cleanedValue;
            event.target.value = cleanedValue;
        },
        checkUserIdExists(mode) {
            const userIdField = mode === 'create' ? 'newUser' : 'editUser';
            const userId = this[userIdField].userId;

            if (!userId) return;

            this.clearUserIdCheckTimer();
            this.userIdCheckTimer = setTimeout(() => {
                this.performUserIdCheck(userId, mode);
            }, 500);
        },
        async performUserIdCheck(userId, mode) {
            try {
                const response = await axios.get(`/api/Admin/check-userid/${userId}`);

                if (response.data.exists) {
                    showPopup(`使用者ID ${userId} 已存在，請輸入其他ID`, 'error');
                    const userIdField = mode === 'create' ? 'newUser' : 'editUser';
                    this[userIdField].userId = '';
                    this.$nextTick(() => {
                        this.focusUserIdInput(mode);
                    });
                }
            } catch (error) {
                console.error('檢查使用者ID失敗:', error);
            }
        },
        focusUserIdInput(mode) {
            if (mode === 'create' && this.$refs.createUserIdInput) {
                this.$refs.createUserIdInput.focus();
            }
        },
        async loadUsers() {
            this.loading = true;
            try {
                const response = await axios.get('/api/Admin/users');
                this.users = response.data;
            } catch (error) {
                console.error('載入使用者失敗:', error);
                showPopup('載入使用者列表失敗', 'error');
            } finally {
                this.loading = false;
            }
        },
        showCreateUserModal() {
            this.resetNewUser();
            this.showCreateModal = true;
            this.$nextTick(() => this.focusUserIdInput('create'));
        },
        closeCreateModal() {
            this.showCreateModal = false;
            this.clearUserIdCheckTimer();
        },
        createUser() {
            if (!this.validateUserForm(this.newUser, true)) return;
            this.performCreateUser();
        },
        validateUserForm(user, isCreate = false) {
            if (isCreate && !this.isValidPositiveInteger(user.userId)) {
                showPopup('使用者ID必須是正整數', 'error');

                if (isCreate) {
                    this.$nextTick(() => this.focusUserIdInput('create'));
                }
                return false;
            }

            if (!user.userName || !user.account) {
                showPopup('請填寫所有必填欄位', 'error');
                return false;
            }

            if (isCreate && !user.password) {
                showPopup('請填寫密碼', 'error');
                return false;
            }
            return true;
        },
        async performCreateUser() {
            try {
                await axios.post('/api/Admin/users', this.newUser);
                showPopup('使用者建立成功', 'success');
                this.closeCreateModal();
                this.loadUsers();
            } catch (error) {
                console.error('建立使用者失敗:', error);
                const message = error.response?.data?.message || '建立使用者失敗';
                showPopup(message, 'error');
            }
        },
        editUserModal(user) {
            this.editUser = {
                userId: user.userId,
                userName: user.userName,
                account: user.account,
                password: '',
                isAdmin: user.isAdmin
            };
            this.showEditModal = true;
        },
        closeEditModal() {
            this.showEditModal = false;
            this.clearUserIdCheckTimer();
        },
        updateUser() {
            if (!this.validateUserForm(this.editUser)) return;
            this.performUpdateUser();
        },
        async performUpdateUser() {
            try {
                await axios.put(`/api/Admin/users/${this.editUser.userId}`, this.editUser);
                showPopup('使用者更新成功', 'success');
                this.closeEditModal();
                this.loadUsers();
            } catch (error) {
                console.error('更新使用者失敗:', error);
                const message = error.response?.data?.message || '更新使用者失敗';
                showPopup(message, 'error');
            }
        },
        deleteUser(userId) {
            if (!confirm('確定要刪除此使用者嗎？')) return;
            this.performDeleteUser(userId);
        },
        async performDeleteUser(userId) {
            try {
                await axios.delete(`/api/Admin/users/${userId}`);
                showPopup('使用者刪除成功', 'success');
                this.loadUsers();
            } catch (error) {
                console.error('刪除使用者失敗:', error);
                const message = error.response?.data?.message || '刪除使用者失敗';
                showPopup(message, 'error');
            }
        },
        resetNewUser() {
            this.newUser = {
                userId: '',
                userName: '',
                account: '',
                password: '',
                isAdmin: 'N'
            };
        },
        clearUserIdCheckTimer() {
            if (this.userIdCheckTimer) {
                clearTimeout(this.userIdCheckTimer);
                this.userIdCheckTimer = null;
            }
        }
    },
    async mounted() {
        if (this.userData?.isAdmin !== 'Y') {
            showPopup('您沒有權限存取此功能', 'error');
            return;
        }
        await this.loadUsers();
    },
    beforeDestroy() {
        this.clearUserIdCheckTimer();
    }
});