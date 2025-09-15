Vue.component('work-order-component', {
    props: ['userData'],
    data() {
        return {
            showDialog: false,
            newOrder: {
                workOrder: {
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
                    punchDevelopmentNotes: ''
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
                    externalProcessingNotes: ''
                }
            }
        };
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
                                        <label for="customerPoNumber">客戶編號</label>
                                        <input type="text" id="customerPoNumber" v-model="newOrder.workOrder.customerPoNumber">
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
                                        <input type="number" id="thickness" v-model.number="newOrder.workOrder.thickness">
                                    </div>
                                    <div class="form-group">
                                        <label for="width">寬度</label>
                                        <input type="number" id="width" v-model.number="newOrder.workOrder.width">
                                    </div>
                                    <div class="form-group">
                                        <label for="usedLength">使用長度</label>
                                        <input type="number" id="usedLength" v-model.number="newOrder.workOrder.usedLength">
                                    </div>
                                    <div class="form-group form-group-full">
                                        <label for="remarks">備註</label>
                                        <textarea id="remarks" v-model="newOrder.workOrder.remarks"></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" v-model="newOrder.workOrder.foldingRequired" class="form-checkbox">
                                            是否折邊
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" v-model="newOrder.workOrder.punchingRequired" class="form-checkbox">
                                            是否沖床
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" v-model="newOrder.workOrder.processingRequired" class="form-checkbox">
                                            是否加工
                                        </label>
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
                                        <input type="number" id="moldQuantity" v-model.number="newOrder.molds.moldQuantity">
                                    </div>
                                    <div class="form-group">
                                        <label for="carQuantity">車數</label>
                                        <input type="number" id="carQuantity" v-model.number="newOrder.molds.carQuantity">
                                    </div>
                                    <div class="form-group">
                                        <label for="setQuantity">放數</label>
                                        <input type="number" id="setQuantity" v-model.number="newOrder.molds.setQuantity">
                                    </div>
                                    <div class="form-group form-group-full">
                                        <label for="moldDevelopmentNotes">模具開發</label>
                                        <textarea id="moldDevelopmentNotes" v-model="newOrder.molds.moldDevelopmentNotes"></textarea>
                                    </div>
                                    <div class="form-group form-group-full">
                                        <label for="punchDevelopmentNotes">刀模開發</label>
                                        <textarea id="punchDevelopmentNotes" v-model="newOrder.molds.punchDevelopmentNotes"></textarea>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset class="form-section">
                                <legend>刀模資料</legend>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="cuttingDieQuantity">刀模數</label>
                                        <input type="number" id="cuttingDieQuantity" v-model.number="newOrder.cuttingDies.cuttingDieQuantity">
                                    </div>
                                    <div class="form-group">
                                        <label for="productionLength">總生產米數</label>
                                        <input type="number" id="productionLength" v-model.number="newOrder.cuttingDies.productionLength">
                                    </div>
                                    <div class="form-group">
                                        <label for="deliveryQuantity">交貨數量</label>
                                        <input type="number" id="deliveryQuantity" v-model.number="newOrder.cuttingDies.deliveryQuantity">
                                    </div>
                                    <div class="form-group">
                                        <label for="packagingMethod">包裝方式</label>
                                        <input type="text" id="packagingMethod" v-model="newOrder.cuttingDies.packagingMethod">
                                    </div>
                                    <div class="form-group">
                                        <label for="packageLength">整數寬</label>
                                        <input type="number" id="packageLength" v-model.number="newOrder.cuttingDies.packageLength">
                                    </div>
                                    <div class="form-group">
                                        <label for="packageWidth">整數長</label>
                                        <input type="number" id="packageWidth" v-model.number="newOrder.cuttingDies.packageWidth">
                                    </div>
                                    <div class="form-group">
                                        <label for="packageHeight">整數高</label>
                                        <input type="number" id="packageHeight" v-model.number="newOrder.cuttingDies.packageHeight">
                                    </div>
                                    <div class="form-group">
                                        <label for="fractionalPackageLength">零數長</label>
                                        <input type="number" id="fractionalPackageLength" v-model.number="newOrder.cuttingDies.fractionalPackageLength">
                                    </div>
                                    <div class="form-group">
                                        <label for="fractionalPackageWidth">零數寬</label>
                                        <input type="number" id="fractionalPackageWidth" v-model.number="newOrder.cuttingDies.fractionalPackageWidth">
                                    </div>
                                    <div class="form-group">
                                        <label for="fractionalPackageHeight">零數高</label>
                                        <input type="number" id="fractionalPackageHeight" v-model.number="newOrder.cuttingDies.fractionalPackageHeight">
                                    </div>
                                    <div class="form-group">
                                        <label for="weightPerPiece">1PCS重量</label>
                                        <input type="number" step="0.01" id="weightPerPiece" v-model.number="newOrder.cuttingDies.weightPerPiece">
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" v-model="newOrder.cuttingDies.hasUpperMold" class="form-checkbox">
                                            上模
                                        </label>
                                    </div>
                                    <div class="form-group form-group-full">
                                        <label for="cuttingDieDevelopmentNotes">刀模開發</label>
                                        <textarea id="cuttingDieDevelopmentNotes" v-model="newOrder.cuttingDies.cuttingDieDevelopmentNotes"></textarea>
                                    </div>
                                    <div class="form-group form-group-full">
                                        <label for="formingNotes">成形</label>
                                        <textarea id="formingNotes" v-model="newOrder.cuttingDies.formingNotes"></textarea>
                                    </div>
                                    <div class="form-group form-group-full">
                                        <label for="cuttingNotes">斬型</label>
                                        <textarea id="cuttingNotes" v-model="newOrder.cuttingDies.cuttingNotes"></textarea>
                                    </div>
                                    <div class="form-group form-group-full">
                                        <label for="punchingNotes">沖床</label>
                                        <textarea id="punchingNotes" v-model="newOrder.cuttingDies.punchingNotes"></textarea>
                                    </div>
                                    <div class="form-group form-group-full">
                                        <label for="externalProcessingNotes">外加工</label>
                                        <textarea id="externalProcessingNotes" v-model="newOrder.cuttingDies.externalProcessingNotes"></textarea>
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
        openDialog() {
            this.showDialog = true;
        },
        closeDialog() {
            this.showDialog = false;
            this.resetForm();
        },
        handleSubmit() {
            // TODO: Implement save functionality
            console.log('工單資料:', this.newOrder);
            this.closeDialog();
        },
        resetForm() {
            this.newOrder = {
                workOrder: {
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
                    punchDevelopmentNotes: ''
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
                    externalProcessingNotes: ''
                }
            };
        }
    }
});

