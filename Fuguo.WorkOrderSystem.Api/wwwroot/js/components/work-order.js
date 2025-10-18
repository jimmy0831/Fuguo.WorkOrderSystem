Vue.component('work-order-component', {
    props: ['userData'],
    data() {
        return {
            showDialog: false,
            users: [],
            selectedUserId: '',
            customerPoSuffix: '0001',
            packagingTypes: [], // Dropdown data
            formingTypes: [],   // Dropdown data
            cuttingTypes: [],   // Dropdown data
            packageFields: {
                packageWidth: { label: '整數寬' },
                packageLength: { label: '整數長' },
                packageHeight: { label: '整數高' },
            },
            integerPackage: [
                { selected: 'packageWidth' },
                { selected: 'packageLength' }
            ],
            fractionalPackageFields: {
                fractionalPackageWidth: { label: '零數寬' },
                fractionalPackageLength: { label: '零數長' },
                fractionalPackageHeight: { label: '零數高' },
            },
            selectedFractionalField: 'fractionalPackageHeight',
            newOrder: {
                workOrder: {
                    workOrderId: '',
                    customerPoNumber: '',
                    productName: '',
                    leatherSupplier: '',
                    material: '',
                    thickness: null,
                    width: null,
                    usedLength: null,
                    remarks: '',
                    foldingRequired: false,
                    punchingRequired: false,
                    processingRequired: false
                },
                molds: {
                    moldId: '',
                    moldQuantity: null,
                    carQuantity: null,
                    setQuantity: null,
                    moldDevelopmentNotes: '',
                    punchDevelopmentNotes: '',
                    moldPhotos: [],
                    punchingPhotos: []
                },
                cuttingDies: {
                    cuttingDieQuantity: null,
                    productionLength: null,
                    deliveryQuantity: null,
                    packagingMethod: '',
                    packageLength: null,
                    packageWidth: null,
                    packageHeight: null,
                    fractionalPackageLength: null,
                    fractionalPackageWidth: null,
                    fractionalPackageHeight: null,
                    weightPerPiece: null,
                    cuttingDieDevelopmentNotes: '',
                    formingNotes: '',
                    hasUpperMold: false,
                    cuttingNotes: '',
                    punchingNotes: '',
                    externalProcessingNotes: '',
                    cuttingDiePhotos: []
                }
            }
        };
    },
    computed: {
        integerOptions() {
            return Object.keys(this.packageFields);
        },
        availableIntegerOptions1() {
            const selectedInSecond = this.integerPackage[1].selected;
            return this.integerOptions.filter(opt => opt !== selectedInSecond);
        },
        availableIntegerOptions2() {
            const selectedInFirst = this.integerPackage[0].selected;
            return this.integerOptions.filter(opt => opt !== selectedInFirst);
        },
        fractionalOptions() {
            return Object.keys(this.fractionalPackageFields);
        },
        fullCustomerPoNumber() {
            if (this.selectedUserId && this.customerPoSuffix) {
                return `${this.selectedUserId}-${this.customerPoSuffix}`;
            }
            return '';
        }
    },
    watch: {
        selectedUserId(newUserId) {
            if (newUserId) {
                this.generateNextCustomerPoNumber(newUserId);
            } else {
                this.customerPoSuffix = '0001';
            }
            this.updateCustomerPoNumber();
        },
        customerPoSuffix() {
            this.updateCustomerPoNumber();
        },
        'integerPackage': {
            handler(newVal, oldVal) {
                if (!oldVal) return;
                for (let i = 0; i < oldVal.length; i++) {
                    const oldField = oldVal[i].selected;
                    const newField = newVal[i].selected;
                    if (oldField !== newField) {
                        this.newOrder.cuttingDies[oldField] = null;
                    }
                }
            },
            deep: true
        },
        selectedFractionalField(newField, oldField) {
            if (oldField) {
                this.newOrder.cuttingDies[oldField] = null;
            }
        }
    },
    template: `
        <div class="work-order-container">
            <button type="button" class="btn btn-primary" @click="openDialog">新增工單</button>
            
            <div v-if="showDialog" class="modal-overlay" @click.self="closeDialog">
                <div class="modal work-order-modal">
                    
                    <div class="modal-body">
                        <form @submit.prevent="handleSubmit">
                            <fieldset class="form-section">
                                <legend>工單資料</legend>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="workOrderId">工單編號</label>
                                        <div class="input-group">
                                            <span class="input-group-text">BU</span>
                                            <input type="text" id="workOrderId" class="form-control" v-model="newOrder.workOrder.workOrderId" @blur="validateWorkOrderId" maxlength="6">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="customerPoNumber">客戶編號</label>
                                        <div class="input-wrapper">
                                            <div class="customer-po-container">
                                                <select v-model="selectedUserId" class="customer-po-user-select">
                                                    <option value="">Select</option>
                                                    <option v-for="user in users" :key="user.userId" :value="user.userId">
                                                        {{ user.userId }}
                                                    </option>
                                                </select>
                                                <span class="customer-po-separator">-</span>
                                                <input 
                                                    type="text" 
                                                    v-model="customerPoSuffix" 
                                                    class="customer-po-suffix"
                                                    maxlength="4"
                                                    pattern="[0-9]{4}"
                                                    @input="validateCustomerPoSuffix"
                                                    @blur="validateFullCustomerPo"
                                                    placeholder="0001">
                                            </div>
                                            <small class="form-hint">格式：使用者ID-4碼數字 (例如：11-0001)</small>
                                        </div>
                                        <input type="hidden" v-model="newOrder.workOrder.customerPoNumber">
                                    </div>
                                    <div class="form-group">
                                        <label for="productName">品名</label>
                                        <input type="text" id="productName" v-model="newOrder.workOrder.productName">
                                    </div>
                                    <div class="form-group">
                                        <label for="leatherSupplier">皮料廠商</label>
                                        <input type="text" id="leatherSupplier" v-model="newOrder.workOrder.leatherSupplier">
                                    </div>
                                    <div class="form-group">
                                        <label for="material">材質</label>
                                        <input type="text" id="material" v-model="newOrder.workOrder.material">
                                    </div>
                                    <div class="form-group">
                                        <label for="thickness">厚度</label>
                                        <div class="input-group">
                                            <input type="text" id="thickness" class="form-control" v-model="newOrder.workOrder.thickness" @input="numericOnly('newOrder.workOrder.thickness', true)">
                                            <span class="input-group-text">條</span>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="width">寬度</label>
                                        <div class="input-group">
                                            <input type="text" id="width" class="form-control" v-model="newOrder.workOrder.width" @input="numericOnly('newOrder.workOrder.width', true)">
                                            <span class="input-group-text">cm</span>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="usedLength">使用長度</label>
                                        <div class="input-group">
                                            <input type="text" id="usedLength" class="form-control" v-model="newOrder.workOrder.usedLength" @input="numericOnly('newOrder.workOrder.usedLength', true)">
                                            <span class="input-group-text">cm</span>
                                        </div>
                                    </div>                                    
                                    <div class="form-group">
                                        <label class="form-checkbox-label">
                                            <span>是否折邊</span>
                                            <input type="checkbox" v-model="newOrder.workOrder.foldingRequired" class="form-checkbox">
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-checkbox-label">
                                            <span>是否沖床</span>
                                            <input type="checkbox" v-model="newOrder.workOrder.punchingRequired" class="form-checkbox">
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-checkbox-label">
                                            <span>是否加工</span>
                                            <input type="checkbox" v-model="newOrder.workOrder.processingRequired" class="form-checkbox">
                                        </label>
                                    </div>
                                    <div class="form-group form-group-span-1">
                                        <label for="remarks">備註</label>
                                        <textarea id="remarks" v-model="newOrder.workOrder.remarks"></textarea>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset class="form-section">
                                <legend>模具資料</legend>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="moldId">模具編號</label>
                                        <input type="text" id="moldId" v-model="newOrder.molds.moldId">
                                    </div>
                                    <div class="form-group">
                                        <label for="moldQuantity">模具數</label>
                                        <input type="text" id="moldQuantity" v-model="newOrder.molds.moldQuantity" @input="numericOnly('newOrder.molds.moldQuantity')">
                                    </div>
                                    <div class="form-group">
                                        <label for="carQuantity">車數</label>
                                        <input type="text" id="carQuantity" v-model="newOrder.molds.carQuantity" @input="numericOnly('newOrder.molds.carQuantity')">
                                    </div>
                                    <div class="form-group">
                                        <label for="setQuantity">放數</label>
                                        <input type="text" id="setQuantity" v-model="newOrder.molds.setQuantity" @input="numericOnly('newOrder.molds.setQuantity')">
                                    </div>
                                    <div class="form-group form-group-span-2">
                                        <label for="moldDevelopmentNotes">模具開發</label>
                                        <textarea id="moldDevelopmentNotes" v-model="newOrder.molds.moldDevelopmentNotes"></textarea>
                                    </div>
                                    <div class="form-group form-group-span-2">
                                        <label for="punchDevelopmentNotes">刀模開發</label>
                                        <textarea id="punchDevelopmentNotes" v-model="newOrder.molds.punchDevelopmentNotes"></textarea>
                                    </div>
                                    <div class="form-group form-group-span-4">
                                        <label>模具照片</label>
                                        <div class="photo-uploader-container">
                                            <div class="photo-list-horizontal">
                                                <label for="mold-photo-upload" class="photo-uploader-label">上傳照片</label>
                                                <input id="mold-photo-upload" type="file" multiple @change="handleMoldPhotoUpload" accept="image/*" class="photo-uploader-input">
                                                
                                                <div v-for="photo in newOrder.molds.moldPhotos" :key="photo.id" class="photo-preview-item" :class="{ 'is-report-photo': photo.isReportPhoto }">
                                                    <img :src="photo.url" alt="Mold photo preview" class="photo-preview-img">
                                                    <div class="photo-actions">
                                                        <button type="button" title="設定為報表照片" @click="setReportMoldPhoto(photo)" class="report-btn" :class="{ 'active': photo.isReportPhoto }">★</button>
                                                        <button type="button" title="刪除照片" @click="deleteMoldPhoto(photo)">❌</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group form-group-span-4">
                                        <label>沖床照片</label>
                                        <div class="photo-uploader-container">
                                            <div class="photo-list-horizontal">
                                                <label for="mold-punching-photo-upload" class="photo-uploader-label">上傳照片</label>
                                                <input id="mold-punching-photo-upload" type="file" multiple @change="handleMoldPunchingPhotoUpload" accept="image/*" class="photo-uploader-input">
                                                
                                                <div v-for="photo in newOrder.molds.punchingPhotos" :key="photo.id" class="photo-preview-item" :class="{ 'is-report-photo': photo.isReportPhoto }">
                                                    <img :src="photo.url" alt="Punching photo preview" class="photo-preview-img">
                                                    <div class="photo-actions">
                                                        <button type="button" title="設定為報表照片" @click="setReportMoldPunchingPhoto(photo)" class="report-btn" :class="{ 'active': photo.isReportPhoto }">★</button>
                                                        <button type="button" title="刪除照片" @click="deleteMoldPunchingPhoto(photo)">❌</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset class="form-section">
                                <legend>刀模資料</legend>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="cuttingDieQuantity">刀模數</label>
                                        <input type="text" id="cuttingDieQuantity" v-model="newOrder.cuttingDies.cuttingDieQuantity" @input="numericOnly('newOrder.cuttingDies.cuttingDieQuantity')">
                                    </div>
                                    <div class="form-group">
                                        <label for="productionLength">總生產米數</label>
                                        <input type="text" id="productionLength" v-model="newOrder.cuttingDies.productionLength" @input="numericOnly('newOrder.cuttingDies.productionLength', true)">
                                    </div>
                                    <div class="form-group">
                                        <label for="deliveryQuantity">交貨數量</label>
                                        <div class="input-group">
                                            <input type="text" id="deliveryQuantity" v-model="newOrder.cuttingDies.deliveryQuantity" @input="numericOnly('newOrder.cuttingDies.deliveryQuantity')">
                                            <span class="input-group-text">pice</span>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="packagingMethod">包裝方式</label>
                                        <select id="packagingMethod" v-model="newOrder.cuttingDies.packagingMethod">
                                            <option value="">請選擇</option>
                                            <option v-for="type in packagingTypes" :key="type.id" :value="type.name">{{ type.name }}</option>
                                        </select>
                                    </div>
                                    <div v-for="(field, index) in integerPackage" :key="'integer-' + index" class="form-group">
                                        <label :for="'packageField' + index">
                                            <select v-model="field.selected" class="form-label-select">
                                                <option v-for="optionKey in (index === 0 ? availableIntegerOptions1 : availableIntegerOptions2)" :key="optionKey" :value="optionKey">
                                                    {{ packageFields[optionKey].label }}
                                                </option>
                                            </select>
                                        </label>
                                        <input type="text" :id="'packageField' + index" v-model.number="newOrder.cuttingDies[field.selected]" @input="numericOnly('newOrder.cuttingDies.' + field.selected, true)" class="form-control">
                                    </div>                                    
                                    <div class="form-group">
                                        <label for="fractionalPackage">
                                            <select v-model="selectedFractionalField" class="form-label-select">
                                                <option v-for="optionKey in fractionalOptions" :key="optionKey" :value="optionKey">
                                                    {{ fractionalPackageFields[optionKey].label }}
                                                </option>
                                            </select>
                                        </label>
                                        <input type="text" id="fractionalPackage" v-model.number="newOrder.cuttingDies[selectedFractionalField]" @input="numericOnly('newOrder.cuttingDies.' + selectedFractionalField, true)" class="form-control">
                                    </div>
                                    <div class="form-group"></div>
                                    <div class="form-group">
                                        <label for="weightPerPiece">1PCS重量</label>
                                        <input type="text" id="weightPerPiece" v-model="newOrder.cuttingDies.weightPerPiece" @input="numericOnly('newOrder.cuttingDies.weightPerPiece', true)">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-checkbox-label">
                                            <span>上模</span>
                                            <input type="checkbox" v-model="newOrder.cuttingDies.hasUpperMold" class="form-checkbox">
                                        </label>
                                    </div>
                                    <div class="form-group form-group-span-2">
                                        <label for="cuttingDieDevelopmentNotes">刀模開發</label>
                                        <textarea id="cuttingDieDevelopmentNotes" v-model="newOrder.cuttingDies.cuttingDieDevelopmentNotes"></textarea>
                                    </div>
                                    <div class="form-group form-group-span">
                                        <label for="formingNotes">成形</label>
                                        <select id="formingNotes" v-model="newOrder.cuttingDies.formingNotes">
                                            <option value="">請選擇</option>
                                            <option v-for="type in formingTypes" :key="type.id" :value="type.name">{{ type.name }}</option>
                                        </select>
                                    </div>
                                    <div class="form-group form-group-span">
                                        <label for="cuttingNotes">斬型</label>
                                        <select id="cuttingNotes" v-model="newOrder.cuttingDies.cuttingNotes">
                                            <option value="">請選擇</option>
                                            <option v-for="type in cuttingTypes" :key="type.id" :value="type.name">{{ type.name }}</option>
                                        </select>
                                    </div>
                                    <div class="form-group"></div>
                                    <div class="form-group"></div>
                                    <div class="form-group form-group-span-2">
                                        <label for="punchingNotes">沖床</label>
                                        <textarea id="punchingNotes" v-model="newOrder.cuttingDies.punchingNotes"></textarea>
                                    </div>
                                    <div class="form-group form-group-span-2">
                                        <label for="externalProcessingNotes">外加工</label>
                                        <textarea id="externalProcessingNotes" v-model="newOrder.cuttingDies.externalProcessingNotes"></textarea>
                                    </div>
                                    <div class="form-group form-group-span-4">
                                        <label>刀模照片</label>
                                        <div class="photo-uploader-container">
                                            <div class="photo-list-horizontal">
                                                <label for="cutting-die-photo-upload" class="photo-uploader-label">上傳照片</label>
                                                <input id="cutting-die-photo-upload" type="file" multiple @change="handleCuttingDiePhotoUpload" accept="image/*" class="photo-uploader-input">
                                                
                                                <div v-for="photo in newOrder.cuttingDies.cuttingDiePhotos" :key="photo.id" class="photo-preview-item" :class="{ 'is-report-photo': photo.isReportPhoto }">
                                                    <img :src="photo.url" alt="Cutting die photo preview" class="photo-preview-img">
                                                    <div class="photo-actions">
                                                        <button type="button" title="設定為報表照片" @click="setReportCuttingDiePhoto(photo)" class="report-btn" :class="{ 'active': photo.isReportPhoto }">★</button>
                                                        <button type="button" title="刪除照片" @click="deleteCuttingDiePhoto(photo)">❌</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeDialog">取消</button>
                        <button type="submit" class="btn btn-primary" @click="handleSubmit">儲存</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    methods: {
        numericOnly(modelPath, allowDecimal = false) {
            const keys = modelPath.split('.');
            let current = this;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
                if (!current) return;
            }
            const finalKey = keys[keys.length - 1];
            let value = current[finalKey];

            if (value === null || value === undefined) {
                return;
            }
            
            value = String(value);

            let regex = allowDecimal ? /[^0-9.]/g : /[^0-9]/g;
            let sanitized = value.replace(regex, '');

            if (allowDecimal && sanitized.includes('.')) {
                const parts = sanitized.split('.');
                if (parts.length > 2) {
                    sanitized = parts[0] + '.' + parts.slice(1).join('');
                }
            }
            
            if (sanitized !== value) {
                current[finalKey] = sanitized;
            }
        },
        // Mold Photos
        handleMoldPhotoUpload(event) {
            const files = event.target.files;
            for (const file of files) {
                if (!file.type.startsWith('image/')) continue;

                const photo = {
                    id: Date.now() + Math.random(),
                    url: URL.createObjectURL(file),
                    file: file,
                    isReportPhoto: false
                };
                this.newOrder.molds.moldPhotos.push(photo);
            }
            event.target.value = '';
        },
        setReportMoldPhoto(photoToSet) {
            this.newOrder.molds.moldPhotos.forEach(photo => {
                photo.isReportPhoto = (photo.id === photoToSet.id);
            });
        },
        deleteMoldPhoto(photoToDelete) {
            URL.revokeObjectURL(photoToDelete.url);
            this.newOrder.molds.moldPhotos = this.newOrder.molds.moldPhotos.filter(photo => photo.id !== photoToDelete.id);
        },
        // Mold Punching Photos
        handleMoldPunchingPhotoUpload(event) {
            const files = event.target.files;
            for (const file of files) {
                if (!file.type.startsWith('image/')) continue;

                const photo = {
                    id: Date.now() + Math.random(),
                    url: URL.createObjectURL(file),
                    file: file,
                    isReportPhoto: false
                };
                this.newOrder.molds.punchingPhotos.push(photo);
            }
            event.target.value = '';
        },
        setReportMoldPunchingPhoto(photoToSet) {
            this.newOrder.molds.punchingPhotos.forEach(photo => {
                photo.isReportPhoto = (photo.id === photoToSet.id);
            });
        },
        deleteMoldPunchingPhoto(photoToDelete) {
            URL.revokeObjectURL(photoToDelete.url);
            this.newOrder.molds.punchingPhotos = this.newOrder.molds.punchingPhotos.filter(photo => photo.id !== photoToDelete.id);
        },
        // Cutting Die Photos
        handleCuttingDiePhotoUpload(event) {
            const files = event.target.files;
            for (const file of files) {
                if (!file.type.startsWith('image/')) continue;

                const photo = {
                    id: Date.now() + Math.random(),
                    url: URL.createObjectURL(file),
                    file: file,
                    isReportPhoto: false
                };
                this.newOrder.cuttingDies.cuttingDiePhotos.push(photo);
            }
            event.target.value = '';
        },
        setReportCuttingDiePhoto(photoToSet) {
            this.newOrder.cuttingDies.cuttingDiePhotos.forEach(photo => {
                photo.isReportPhoto = (photo.id === photoToSet.id);
            });
        },
        deleteCuttingDiePhoto(photoToDelete) {
            URL.revokeObjectURL(photoToDelete.url);
            this.newOrder.cuttingDies.cuttingDiePhotos = this.newOrder.cuttingDies.cuttingDiePhotos.filter(photo => photo.id !== photoToDelete.id);
        },
        async loadDropdownData() {
            try {
                const [pkgRes, formRes, cutRes] = await Promise.all([
                    axios.get('/api/dropdown/packaging-types'),
                    axios.get('/api/dropdown/forming-types'),
                    axios.get('/api/dropdown/cutting-types')
                ]);
                this.packagingTypes = pkgRes.data;
                this.formingTypes = formRes.data;
                this.cuttingTypes = cutRes.data;
            } catch (error) {
                console.error('Error loading dropdown data:', error);
                showPopup('載入下拉選單資料失敗', 'error');
            }
        },
        async openDialog() {
            this.showDialog = true;
            await Promise.all([
                this.generateNextWorkOrderId(),
                this.loadUsers(),
                this.loadDropdownData()
            ]);
        },
        closeDialog() {
            this.showDialog = false;
            this.resetForm();
        },
        async loadUsers() {
            try {
                const response = await axios.get('/api/workorder/users');
                this.users = response.data.sort((a, b) => {
                    const aIsNumber = !isNaN(a.userId);
                    const bIsNumber = !isNaN(b.userId);
                    
                    if (aIsNumber && !bIsNumber) return -1;
                    if (!aIsNumber && bIsNumber) return 1;
                    if (aIsNumber && bIsNumber) {
                        return parseInt(a.userId) - parseInt(b.userId);
                    }
                    return a.userId.localeCompare(b.userId);
                });
            } catch (error) {
                console.error('Error loading users:', error);
                showPopup('載入使用者列表失敗', 'error');
            }
        },
        async generateNextWorkOrderId() {
            try {
                const response = await axios.get('/api/workorder/next-id');
                this.newOrder.workOrder.workOrderId = response.data.workOrderId.replace('BU', '');
            } catch (error) {
                console.error('Error getting next work order ID:', error);
                this.newOrder.workOrder.workOrderId = 'BU000001';
            }
        },
        async generateNextCustomerPoNumber(userId) {
            try {
                const response = await axios.get(`/api/workorder/next-customer-po/${encodeURIComponent(userId)}`);
                const fullNumber = response.data.customerPoNumber;
                const parts = fullNumber.split('-');
                if (parts.length === 2) {
                    this.customerPoSuffix = parts[1];
                }
            } catch (error) {
                console.error('Error getting next customer PO number:', error);
                this.customerPoSuffix = '0001';
            }
        },
        updateCustomerPoNumber() {
            this.newOrder.workOrder.customerPoNumber = this.fullCustomerPoNumber;
        },
        validateCustomerPoSuffix(event) {
            let value = event.target.value.replace(/[^0-9]/g, '');
            if (value.length > 4) {
                value = value.substring(0, 4);
            }
            if (value.length > 0) {
                value = value.padStart(4, '0');
            }
            this.customerPoSuffix = value;
            event.target.value = value;
        },
        async validateFullCustomerPo() {
            if (!this.fullCustomerPoNumber) return;
            
            try {
                const response = await axios.get(`/api/workorder/check-customer-po/${encodeURIComponent(this.fullCustomerPoNumber)}`);
                if (response.data.exists) {
                    showPopup('此客戶編號已存在，請使用其他編號', 'error');
                }
            } catch (error) {
                console.error('Error checking customer PO number:', error);
            }
        },
        async validateWorkOrderId() {
            const workOrderNumber = this.newOrder.workOrder.workOrderId;
            const pattern = /^\d{6}$/;
            if (!pattern.test(workOrderNumber)) {
                showPopup('工單編號格式錯誤，必須為 6 碼數字', 'error');
                return;
            }
            
            try {
                const fullWorkOrderId = 'BU' + workOrderNumber;
                const response = await axios.get(`/api/workorder/check-id/${encodeURIComponent(fullWorkOrderId)}`);
                if (response.data.exists) {
                    showPopup('此工單編號已存在，請使用其他編號', 'error');
                }
            } catch (error) {
                console.error('Error checking work order ID:', error);
            }
        },
        handleSubmit() {
            console.log('工單資料:', this.newOrder);
            this.closeDialog();
        },
        resetForm() {
            this.customerPoSuffix = '0001';

            this.integerPackage = [
                { selected: 'packageWidth' },
                { selected: 'packageLength' }
            ];
            this.selectedFractionalField = 'fractionalPackageHeight';

            if (this.newOrder.molds.moldPhotos) {
                this.newOrder.molds.moldPhotos.forEach(photo => URL.revokeObjectURL(photo.url));
            }
            if (this.newOrder.molds.punchingPhotos) {
                this.newOrder.molds.punchingPhotos.forEach(photo => URL.revokeObjectURL(photo.url));
            }
            if (this.newOrder.cuttingDies.cuttingDiePhotos) {
                this.newOrder.cuttingDies.cuttingDiePhotos.forEach(photo => URL.revokeObjectURL(photo.url));
            }

            this.newOrder = {
                workOrder: {
                    workOrderId: '',
                    customerPoNumber: '',
                    productName: '',
                    leatherSupplier: '',
                    material: '',
                    thickness: null,
                    width: null,
                    usedLength: null,
                    remarks: '',
                    foldingRequired: false,
                    punchingRequired: false,
                    processingRequired: false
                },
                molds: {
                    moldId: '',
                    moldQuantity: null,
                    carQuantity: null,
                    setQuantity: null,
                    moldDevelopmentNotes: '',
                    punchDevelopmentNotes: '',
                    moldPhotos: [],
                    punchingPhotos: []
                },
                cuttingDies: {
                    cuttingDieQuantity: null,
                    productionLength: null,
                    deliveryQuantity: null,
                    packagingMethod: '',
                    packageLength: null,
                    packageWidth: null,
                    packageHeight: null,
                    fractionalPackageLength: null,
                    fractionalPackageWidth: null,
                    fractionalPackageHeight: null,
                    weightPerPiece: null,
                    cuttingDieDevelopmentNotes: '',
                    formingNotes: '',
                    hasUpperMold: false,
                    cuttingNotes: '',
                    punchingNotes: '',
                    externalProcessingNotes: '',
                    cuttingDiePhotos: []
                }
            };
        }
    }
});