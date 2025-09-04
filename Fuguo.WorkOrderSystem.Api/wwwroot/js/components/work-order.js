Vue.component('work-order-component', {
    props: ['userData'],
    data() {
        return {
            showDialog: false,
            newOrder: {
                workOrder: {
                    customerPoNumber: '',  // 客戶編號
                    productName: '',  // 品名
                    leatherSupplier: '', // 皮料廠商
                    material: '', // 材質
                    thickness: '', // 厚度-顯示單位：cm 
                    width: '', // 寬度-顯示單位：cm 
                    usedLength: '',     // 使用長度-顯示單位：cm 
                    remarks: '', // 備註
                    foldingRequired: '', // 摺邊 checkbox 
                    punchingRequired: '', // 沖床 checkbox
                    processingRequired: '', // 加工 checkbox

                },
                molds: {
                    moldId: '', // 模具編號
                    moldQuantity: '', // 模具數量
                    carQuantity: '', // 車數 (整數)
                    setQuantity: '', // 放數 (整數)
                    moldDevelopmentNotes: '', // 模具開發
                    punchDevelopmentNotes: '', // 沖床開發
                },
                cuttingDies: {
                    cuttingDieId: '', // 刀模編號 
                    cuttingDieQuantity: '', // 刀模數量 (整數)
                    productionLength: '', //總生產米數 (整數)
                    deliveryQuantity: '', // 交貨數量 (顯示單位: pice，整數)
                    packagingMethod: '', // 包裝方式
                    packageLength: '', // 整數長
                    packageWidth: '', // 整數寬
                    packageHeight: '', // 整數立
                    fractionalPackageLength: '', // 零數長
                    fractionalPackageWidth: '', // 零數寬
                    fractionalPackageHeight: '', // 零數立
                    weightPerPiece: '', // 1PCS重量 (顯示單位 : g)
                    cuttingDieDevelopmentNotes: '', // 刀模開發
                    formingNotes: '', // 成形
                    hasUpperMold: '', // 上摸
                    cuttingNotes: '', // 斬型
                    punchingNotes: '', // 沖床
                    externalProcessingNotes: '', // 外加工
                }
            },
            
        };
    },
    template: `
        <div class="work-order-container">
            <button type="button" class="btn btn-primary" @click="openDialog">新增工單</button>
            
            <div v-if="showDialog" class="modal-overlay" @click.self="closeDialog">
                <div class="modal work-order-modal">

                </div>
            </div>
        </div>
    `,
    methods: {
        openDialog() {
            this.resetWorkOrder();
            this.showDialog = true;
        },
        closeDialog() {
            this.showDialog = false;
        },
        saveWorkOrder() {
            if (!this.validateWorkOrder()) {
                return;
            }

            // 組合完整的工單內容 (BU + 輸入內容)
            const fullOrderContent = 'BU' + this.workOrder.orderContent;

            console.log('工單資料:', {
                ...this.workOrder,
                fullOrderContent: fullOrderContent
            });

            showPopup('工單建立成功', 'success');
            this.closeDialog();
        },
        resetWorkOrder() {
            this.workOrder = {
                orderContent: '',
                deliveryDate: '',
                customerCode: '',
                productName: '',
                leatherSupplier: '',
                material: '',
                thickness: '',
                width: '',
                usageLength: ''
            };
        },
        validateWorkOrder() {
            if (!this.workOrder.orderContent.trim()) {
                showPopup('請輸入工單內容', 'error');
                return false;
            }
            if (!this.workOrder.deliveryDate) {
                showPopup('請選擇交貨日期', 'error');
                return false;
            }
            if (!this.workOrder.customerCode.trim()) {
                showPopup('請輸入客戶編號', 'error');
                return false;
            }
            if (!this.workOrder.productName.trim()) {
                showPopup('請輸入品名', 'error');
                return false;
            }
            return true;
        }
    },

    watch: {

    },

    mounted() {

    }
});