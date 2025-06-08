(function () {
    // --- STATE MANAGEMENT ---
    let state = {
        allGames: {},
        activePlatform: 'psn_library',
        currentPage: 1,
        itemsPerPage: 20,
        sort: 'progress_desc',
        view: 'grid',
        filters: {
            showDLC: true,
            completion: 'all' // 'all', '100', 'plat_no_100', 'in_progress'
        }
    };

    // --- MOCK DATA ---
    const generateGames = (count, baseData, platform) => { /* same as before */ };
    
    // Helper function to initialize all mock data
    function initializeMockData() {
        // Mock data initialization... (same logic as your original script)
        // Add `hasDLC` and `platinum` flags to some games
        state.allGames.psn_library[2].hasDLC = true;
        state.allGames.psn_library[2].platinum = true; // Elden Ring has plat but not 100% due to DLC
        state.allGames.psn_library[2].progress = 85;

        state.allGames.psn_library[1].progress = 100; // Ghost of Tsushima 100%
        state.allGames.psn_library[1].platinum = true;
        state.allGames.psn_library[1].hasDLC = true;

        // Set dynamic cover image from most recently "played" game
        const mostRecentGame = Object.values(state.allGames).flat().sort((a,b) => b.lastPlayed - a.lastPlayed)[0];
        document.getElementById('profile-header').style.backgroundImage = `url('${mostRecentGame.imgUrl.replace('300x400', '800x400')}')`; // Use a wider image
    }


    // --- DOM ELEMENTS ---
    const elements = { /* Get all relevant DOM elements by ID here */ };
    // Example: const dlcToggle = document.getElementById('dlc_toggle');

    // --- RENDER LOGIC ---
    function render() {
        // 1. Get current games for the active platform
        let currentGames = state.allGames[state.activePlatform] || [];

        // 2. Apply Filters
        if (!state.filters.showDLC) {
            currentGames = currentGames.filter(g => !g.hasDLC);
        }
        switch (state.filters.completion) {
            case '100':
                currentGames = currentGames.filter(g => g.progress === 100);
                break;
            case 'plat_no_100':
                currentGames = currentGames.filter(g => g.platinum && g.progress < 100);
                break;
            case 'in_progress':
                currentGames = currentGames.filter(g => g.progress > 0 && g.progress < 100);
                break;
        }

        // 3. Apply Sorting (logic is same as before)
        
        // 4. Apply Pagination
        const totalItems = currentGames.length;
        const totalPages = Math.ceil(totalItems / state.itemsPerPage);
        state.currentPage = Math.min(state.currentPage, totalPages) || 1;
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        const paginatedGames = currentGames.slice(startIndex, endIndex);

        // 5. Render HTML (createGridCard, createListRow functions are the same)
        // This will update the innerHTML of grid and list containers

        // 6. Update UI elements (pagination buttons, counts)
        // Example: elements.pageIndicator.textContent = `Page ${state.currentPage} of ${totalPages}`;
        // Disable/enable prev/next buttons based on currentPage
    }
    
    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        // Listen for clicks on tab buttons, filter dropdowns, toggles, pagination, etc.
        // Each listener will update the 'state' object and then call `render()`
        
        // Example for DLC toggle:
        elements.dlcToggle.addEventListener('change', (e) => {
            state.filters.showDLC = e.target.checked;
            state.currentPage = 1; // Reset to first page on filter change
            render();
        });
    }

    // --- INITIALIZATION ---
    document.addEventListener('DOMContentLoaded', () => {
        // Cache all DOM elements
        // Initialize mock data
        // Setup event listeners
        // Perform initial render
        render(); 
    });

})();