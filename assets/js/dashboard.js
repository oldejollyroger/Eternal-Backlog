// This is the new, full content for assets/js/dashboard.js

(function() {
    // ---- 1. STATE & MOCK DATA ---- //
    // The central 'state' object holds all current settings for the page.
    // When a user clicks a button, we change the state, then re-render.
    const state = {
        allGames: {},
        activePlatform: 'psn_library',
        currentPage: 1,
        itemsPerPage: 20,
        sort: 'progress_desc',
        view: 'grid',
        filters: {
            showDLC: true,
            completion: 'all',
        }
    };

    // We add 'hasDLC' and 'platinum' properties to our mock data for filtering.
    const MOCK_GAME_DATA = {
        psn: [
            { title: "The Last of Us Part II", total: 26, imgUrl: "https://placehold.co/300x400/2d3748/ffffff?text=TLOU2", hasDLC: true, platinum: false },
            { title: "Ghost of Tsushima", total: 52, imgUrl: "https://placehold.co/300x400/2d3748/ffffff?text=GoT", hasDLC: true, platinum: true },
            { title: "Elden Ring", total: 42, imgUrl: "https://placehold.co/300x400/2d3748/ffffff?text=Elden+Ring", hasDLC: false, platinum: true },
            { title: "Bloodborne", total: 34, imgUrl: "https://placehold.co/300x400/2d3748/ffffff?text=Bloodborne", hasDLC: true, platinum: true },
            //...
        ],
        xbox: [ /*...*/ ],
        steam: [ /*...*/ ]
    };


    // ---- 2. DOM ELEMENT REFERENCES ---- //
    // We get references to all our HTML elements at the start for efficiency.
    const elements = {
        tabs: document.querySelectorAll('.tab-button'),
        completionFilter: document.getElementById('completion_filter'),
        dlcToggle: document.getElementById('dlc_toggle'),
        sortDropdown: document.getElementById('sort_dropdown'),
        viewGridBtn: document.getElementById('view_grid_btn'),
        viewListBtn: document.getElementById('view_list_btn'),
        gameCountDisplay: document.getElementById('game_count_display'),
        gridContainer: document.querySelector('#psn_library .view-grid'),
        listContainer: document.querySelector('#psn_library .view-list'), // Note: We might need to simplify this if we reuse containers
        prevPageBtn: document.getElementById('prev_page_btn'),
        nextPageBtn: document.getElementById('next_page_btn'),
        pageIndicator: document.getElementById('page_indicator'),
        profileHeader: document.getElementById('profile-header'),
    };
    
    // ---- 3. THE MAIN RENDER FUNCTION ---- //
    // This is the most important function. It redraws the library based on the current 'state'.
    function render() {
        // Step A: Get the full list of games for the active platform
        let gamesToDisplay = state.allGames[state.activePlatform] || [];

        // Step B: Apply the Completion filter
        const filter = state.filters.completion;
        if (filter === '100') {
            gamesToDisplay = gamesToDisplay.filter(g => g.progress === 100);
        } else if (filter === 'plat_no_100') {
            gamesToDisplay = gamesToDisplay.filter(g => g.platinum && g.progress < 100);
        } else if (filter === 'in_progress') {
            gamesToDisplay = gamesToDisplay.filter(g => g.progress > 0 && g.progress < 100);
        }

        // Step C: Apply the DLC filter
        if (!state.filters.showDLC) {
            gamesToDisplay = gamesToDisplay.filter(g => !g.hasDLC);
        }

        // Step D: Apply Sorting
        gamesToDisplay.sort((a, b) => {
            switch (state.sort) {
                case 'progress_desc': return b.progress - a.progress;
                case 'progress_asc': return a.progress - b.progress;
                case 'name_asc': return a.title.localeCompare(b.title);
                case 'last_played_desc': return b.lastPlayed - a.lastPlayed;
                default: return 0;
            }
        });

        // Step E: Apply Pagination
        const totalItems = gamesToDisplay.length;
        const totalPages = Math.ceil(totalItems / state.itemsPerPage) || 1;
        state.currentPage = Math.min(state.currentPage, totalPages);
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const paginatedGames = gamesToDisplay.slice(startIndex, startIndex + state.itemsPerPage);

        // Step F: Create the HTML and render it to the page
        // (These are your original 'createGridCard' and 'createListRow' functions)
        elements.gridContainer.innerHTML = paginatedGames.map(createGridCard).join('');
        elements.listContainer.innerHTML = paginatedGames.map(createListRow).join('');

        // Step G: Update the UI elements like buttons and text
        elements.pageIndicator.textContent = `Page ${state.currentPage} of ${totalPages}`;
        elements.gameCountDisplay.textContent = `Showing ${paginatedGames.length} of ${totalItems} games`;
        elements.prevPageBtn.disabled = (state.currentPage === 1);
        elements.nextPageBtn.disabled = (state.currentPage === totalPages);
        
        // Update view toggle buttons
        elements.viewGridBtn.classList.toggle('active', state.view === 'grid');
        elements.viewListBtn.classList.toggle('active', state.view === 'list');
        elements.gridContainer.style.display = state.view === 'grid' ? 'grid' : 'none';
        elements.listContainer.style.display = state.view === 'list' ? 'flex' : 'none';
    }


    // ---- 4. EVENT LISTENERS ---- //
    // Here we listen for clicks and changes, update the state, and call render().
    function setupEventListeners() {
        // Tab switching
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                state.activePlatform = tab.onclick.toString().match(/'([^']+)'/)[1];
                state.currentPage = 1;
                document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                render();
            });
        });
        
        // Completion filter change
        elements.completionFilter.addEventListener('change', (e) => {
            state.filters.completion = e.target.value;
            state.currentPage = 1;
            render();
        });

        // DLC Toggle change
        elements.dlcToggle.addEventListener('change', (e) => {
            state.filters.showDLC = e.target.checked;
            state.currentPage = 1;
            render();
        });
        
        // Pagination buttons
        elements.prevPageBtn.addEventListener('click', () => { if (state.currentPage > 1) { state.currentPage--; render(); } });
        elements.nextPageBtn.addEventListener('click', () => { state.currentPage++; render(); });

        // ... Add listeners for sort and view toggles here ...
    }


    // ---- 5. INITIALIZATION ---- //
    // This runs when the page first loads.
    function init() {
        // Generate full mock data (your original data generation logic here)
        // ...
        
        // Set dynamic cover image
        const mostRecentGame = Object.values(state.allGames).flat().sort((a,b) => b.lastPlayed - a.lastPlayed)[0];
        if (mostRecentGame) {
            elements.profileHeader.style.backgroundImage = `url('${mostRecentGame.imgUrl.replace('300x400', '800x400')}')`;
        }
        
        setupEventListeners();
        render(); // The first render to draw the page.
    }
    
    // Run the initialization function when the page is ready
    document.addEventListener('DOMContentLoaded', init);


    // ---- HELPER FUNCTIONS (Your originals, keep these) ---- //
    function createGridCard(game) { /* ...your original function... */ }
    function createListRow(game) { /* ...your original function... */ }
    function getRank(progress) { /* ...your original function... */ }

})();