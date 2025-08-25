Vue.component('admin-component', {
	props: ['userData'],
	data() {
		return {
			users: [],
			loading: false,
			showCreateModal: false,
			showEditModal: false,
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
            <div class="admin-header">
                <h3>後台管理系統</h3>
                <button class="btn btn-primary" @click="showCreateUserModal">新增使用者</button>
            </div>
            
            <div class="user-table-container">
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
                            <td class="password-cell" :title="user.password">{{ formatPassword(user.password) }}</td>
                            <td>{{ user.isAdmin === 'Y' ? '是' : '否' }}</td>
                            <td>
                                <button class="btn btn-edit" @click="editUserModal(user)">編輯</button>
                                <button class="btn btn-delete" @click="deleteUser(user.userId)" :disabled="user.account === userData.account">刪除</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="loading" class="loading">載入中...</div>
            </div>

            <!-- 新增使用者 Modal -->
            <div v-if="showCreateModal" class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h4>新增使用者</h4>
                        <button class="close-btn" @click="closeCreateModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>使用者ID:</label>
                            <input type="text" v-model="newUser.userId" required>
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
                            <input type="password" v-model="newUser.password" required>
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

            <!-- 編輯使用者 Modal -->
            <div v-if="showEditModal" class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h4>編輯使用者</h4>
                        <button class="close-btn" @click="closeEditModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>使用者ID:</label>
                            <input type="text" v-model="editUser.userId" readonly>
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
                            <input type="password" v-model="editUser.password">
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
		// 格式化密碼顯示 - 直接顯示完整密碼
		formatPassword(password) {
			if (!password) return '';
			// 直接返回完整密碼，不再截短
			return password;
		},

		// 載入使用者列表
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

		// 顯示新增使用者 Modal
		showCreateUserModal() {
			this.newUser = {
				userId: '',
				userName: '',
				account: '',
				password: '',
				isAdmin: 'N'
			};
			this.showCreateModal = true;
		},

		// 關閉新增 Modal
		closeCreateModal() {
			this.showCreateModal = false;
		},

		// 建立新使用者
		async createUser() {
			if (!this.newUser.userId || !this.newUser.userName || !this.newUser.account || !this.newUser.password) {
				showPopup('請填寫所有必填欄位', 'error');
				return;
			}

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

		// 顯示編輯使用者 Modal
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

		// 關閉編輯 Modal
		closeEditModal() {
			this.showEditModal = false;
		},

		// 更新使用者
		async updateUser() {
			if (!this.editUser.userName || !this.editUser.account) {
				showPopup('請填寫所有必填欄位', 'error');
				return;
			}

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

		// 刪除使用者
		async deleteUser(userId) {
			if (!confirm('確定要刪除此使用者嗎？')) {
				return;
			}

			try {
				await axios.delete(`/api/Admin/users/${userId}`);
				showPopup('使用者刪除成功', 'success');
				this.loadUsers();
			} catch (error) {
				console.error('刪除使用者失敗:', error);
				const message = error.response?.data?.message || '刪除使用者失敗';
				showPopup(message, 'error');
			}
		}
	},
	async mounted() {
		// 檢查使用者權限
		if (this.userData?.isAdmin !== 'Y') {
			showPopup('您沒有權限存取此功能', 'error');
			return;
		}

		// 載入使用者列表
		await this.loadUsers();
	}
});