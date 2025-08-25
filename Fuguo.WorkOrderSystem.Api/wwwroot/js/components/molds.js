Vue.component('molds-component', {
    props: ['userData'],
    data() {
        return {
            molds: [],
            loading: false,
            searchKeyword: ''
        };
    },
    template: `
        <div class="molds-container">
            <div class="molds-header">
                <h3>家ㄣ家╰参</h3>
                <div class="header-actions">
                    <div class="search-box">
                        <input 
                            type="text" 
                            v-model="searchKeyword" 
                            placeholder="穓碝家ㄣ..."
                            class="search-input">
                    </div>
                    <button class="btn btn-primary" @click="createMold">穝糤家ㄣ</button>
                </div>
            </div>
            
            <div class="molds-content">
                <div v-if="loading" class="loading">更い...</div>
                <div v-else class="molds-list">
                    <p>家ㄣ家╰参秨祇い...</p>
                </div>
            </div>
        </div>
    `,
    methods: {
        createMold() {
            showPopup('穝糤家ㄣ秨祇い...');
        },
        
        async loadMolds() {
            this.loading = true;
            try {
                // TODO: 龟更家ㄣ戈 API ㊣
                // const response = await axios.get('/api/Molds');
                // this.molds = response.data;
            } catch (error) {
                console.error('更家ㄣ戈ア毖:', error);
                showPopup('更家ㄣ戈ア毖', 'error');
            } finally {
                this.loading = false;
            }
        }
    },
    
    mounted() {
        this.loadMolds();
    }
});