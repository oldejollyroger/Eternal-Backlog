(function() {
    // ---- 1. STATE & CONFIG ---- //
    const state = { allGames: {}, activePlatform: 'psn_library', currentPage: 1, itemsPerPage: 20, sort: 'progress_desc', view: 'grid', filters: { showDLC: true, completion: 'all' } };

    // ---- 2. MOCK DATA & GENERATION ---- //
    const MOCK_GAME_DATA = {
        psn: [{ title: "Ghost of Tsushima", hasDLC: true, platinum: true }, { title: "Elden Ring", hasDLC: false, platinum: true }, { title: "God of War Ragnarök", hasDLC: false, platinum: true }],
        xbox: [{ title: "Halo Infinite", hasDLC: true }],
        steam: [{ title: "Baldur's Gate 3", hasDLC: false, platinum: true }, { title: "Stardew Valley", hasDLC: false, platinum: true }]
    };

    const createSvgPlaceholder = (title, color = '4A5568') => { const words = title.split(' '); let l1 = '', l2 = ''; for(const w of words) { if((l1+w).length<12){l1+=`${w} `} else if((l2+w).length<12){l2+=`${w} `}} const svg = `<svg width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#${color}"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="bold" fill="#fff">${l1.trim()}</text><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="bold" fill="#fff">${l2.trim()}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`;};
    const generateGames = (count, baseData, platform) => {
        const pDetails = { psn_library: { u: 'trophies', c: '2d3748' }, xbox_library: { u: 'G', c: '107c10' }, steam_library: { u: 'achievements', c: '1b2838' } };
        const d = pDetails[platform] || { u: 'items', c: '333333' };
        return baseData.concat(Array.from({ length: Math.max(0, count - baseData.length) }, (_, i) => ({ title: `${platform.slice(0,1).toUpperCase()}${platform.slice(1,3)} Game ${i+1}` }))).map(g => {
            const prog = g.title.includes("Elden Ring")?85:g.title.includes("Stardew")?100:Math.floor(Math.random()*101);
            const total = d.u === 'G'?1000:(g.total||Math.floor(Math.random()*40)+20);
            return {...g, prog, total, earned:d.u==='G'?Math.round(prog/100*1000/5)*5:Math.round(total*prog/100), platform, unit:d.u, imgUrl:createSvgPlaceholder(g.title, d.c), hasDLC:g.hasDLC??(Math.random()>0.8), platinum:g.platinum??(prog>80&&Math.random()>0.5), lastPlayed: new Date(Date.now() - Math.random() * 1e12)};
        });
    };

    // ---- 3. DOM ELEMENT REFERENCES ---- //
    const elements = { tabButtons: document.querySelectorAll('.tab-button'), completionFilter: document.getElementById('completion_filter'), dlcToggle: document.getElementById('dlc_toggle'), sortDropdown: document.getElementById('sort_dropdown'), viewGridBtn: document.getElementById('view_grid_btn'), viewListBtn: document.getElementById('view_list_btn'), gameCountDisplay: document.getElementById('game_count_display'), paginationControls: document.getElementById('pagination_controls'), prevPageBtn: document.getElementById('prev_page_btn'), nextPageBtn: document.getElementById('next_page_btn'), pageIndicator: document.getElementById('page_indicator'), profileHeader: document.getElementById('profile-header'), };

    // ---- 4. RENDER HELPER FUNCTIONS ---- //
    const getRank = (p) => { if(p===100)return{l:'S',c:'#facc15',t:'text-yellow-400',b:'border-yellow-400'};if(p>=90)return{l:'A',c:'#a855f7',t:'text-purple-400',b:'border-purple-400'};if(p>=70)return{l:'B',c:'#3b82f6',t:'text-blue-400',b:'border-blue-400'};if(p>=40)return{l:'C',c:'#22c55e',t:'text-green-400',b:'border-green-400'};if(p>=10)return{l:'D',c:'#f97316',t:'text-orange-500',b:'border-orange-500'};if(p>0)return{l:'E',c:'#ef4444',t:'text-red-500',b:'border-red-500'};return{l:'-',c:'#6b7280',t:'text-gray-400',b:'border-gray-500'}; };
    const createGridCard = (g) => { const r=getRank(g.prog); return `<div class="bg-gray-800/70 rounded-lg group overflow-hidden flex flex-col text-sm shadow-lg transition-transform hover:scale-105 hover:bg-gray-700/80 cursor-pointer"><div class="relative"><img src="${g.imgUrl}" alt="${g.title}" class="w-full object-cover aspect-[3/4]"><div class="absolute top-2 right-2 w-9 h-9 flex items-center justify-center rounded-full bg-gray-900/80 border-2 ${r.b}"><span class="text-xl font-bold ${r.t}">${r.l}</span></div></div><div class="p-3 flex-grow flex flex-col"><p class="font-bold truncate mb-2">${g.title}</p><div class="mt-auto pt-2"><div class="flex justify-between text-xs text-gray-400 mb-1"><span>${g.earned}/${g.total} ${g.unit}</span><span>${g.prog}%</span></div><div class="w-full bg-gray-700 rounded-full h-1.5"><div class="h-1.5 rounded-full" style="width:${g.prog}%; background-color:${r.c};"></div></div></div></div></div>`;};
    const createListRow = (g) => { const r=getRank(g.prog); return `<div class="bg-gray-800/70 p-3 rounded-md flex items-center space-x-4 text-sm hover:bg-gray-700/80 cursor-pointer"><img src="${g.imgUrl}" alt="${g.title}" class="w-10 h-14 object-cover rounded-sm shrink-0"><p class="font-bold flex-grow truncate">${g.title}</p><div class="w-56 hidden md:block"><div class="flex justify-between text-xs text-gray-400 mb-1"><span>${g.earned}/${g.total} ${g.unit}</span><span>${g.prog}%</span></div><div class="w-full bg-gray-700 rounded-full h-1.5"><div class="h-1.5 rounded-full" style="width:${g.prog}%; background-color:${r.c};"></div></div></div><p class="hidden lg:block w-40 text-right text-gray-400 text-xs">${g.lastPlayed.toLocaleDateString()}<span class="text-gray-500 block">Last Played</span></p><div class="flex w-9 h-9 items-center justify-center rounded-full border-2 ${r.b} shrink-0"><span class="text-xl font-bold ${r.t}">${r.l}</span></div></div>`;};

    // ---- 5. MAIN RENDER FUNCTION ---- //
    function render() {
        let games = state.allGames[state.activePlatform] || [];
        const f=state.filters; if(f.completion==='100')games=games.filter(g=>g.prog===100);else if(f.completion==='plat_no_100')games=games.filter(g=>g.platinum&&g.prog<100);else if(f.completion==='in_progress')games=games.filter(g=>g.prog>0&&g.prog<100); if(!f.showDLC)games=games.filter(g=>!g.hasDLC);
        games.sort((a, b) => { switch(state.sort){ case 'progress_desc':return b.prog-a.prog; case 'progress_asc':return a.prog-b.prog; case 'name_asc':return a.title.localeCompare(b.title); case 'last_played_desc':return b.lastPlayed.getTime()-a.lastPlayed.getTime(); default:return 0; }});
        const total=games.length, pages=Math.ceil(total/state.itemsPerPage)||1; state.currentPage=Math.min(state.currentPage,pages);
        const paginated=games.slice((state.currentPage-1)*state.itemsPerPage, state.currentPage*state.itemsPerPage);
        const panel=document.getElementById(`${state.activePlatform}_panel`); if(!panel)return;
        panel.querySelector('.view-grid').innerHTML=paginated.map(createGridCard).join(''); panel.querySelector('.view-list').innerHTML=paginated.map(createListRow).join('');
        elements.gameCountDisplay.textContent=`Showing ${paginated.length} of ${total} games`; elements.pageIndicator.textContent=`Page ${state.currentPage} of ${pages}`;
        elements.prevPageBtn.disabled=(state.currentPage===1); elements.nextPageBtn.disabled=(state.currentPage===pages);
        elements.paginationControls.style.display=pages>1?'flex':'none';
    }

    // ---- 6. UI UPDATE HELPERS ---- //
    const updateActiveTabUI = () => { elements.tabButtons.forEach(b => { b.classList.toggle('active',b.dataset.platform===state.activePlatform); b.classList.toggle('text-gray-400', b.dataset.platform !== state.activePlatform); }); };
    const updateViewToggleUI = () => { const isGrid = state.view === 'grid'; elements.viewGridBtn.classList.toggle('active', isGrid); elements.viewListBtn.classList.toggle('active', !isGrid); document.querySelectorAll('.library-panel').forEach(p => { p.querySelector('.view-grid').style.display = isGrid ? 'grid' : 'none'; p.querySelector('.view-list').style.display = isGrid ? 'none' : 'flex'; }); };

    // ---- 7. EVENT LISTENERS ---- //
    function setupEventListeners() {
        elements.tabButtons.forEach(b=>{b.addEventListener('click',(e)=>{state.activePlatform=e.currentTarget.dataset.platform;state.currentPage=1;document.querySelectorAll('.library-panel').forEach(p=>p.classList.add('hidden'));document.getElementById(`${state.activePlatform}_panel`).classList.remove('hidden');updateActiveTabUI();render();});});
        elements.completionFilter.addEventListener('change',(e)=>{state.filters.completion=e.target.value;state.currentPage=1;render();});
        elements.dlcToggle.addEventListener('change',(e)=>{state.filters.showDLC=e.target.checked;state.currentPage=1;render();});
        elements.sortDropdown.addEventListener('change',(e)=>{state.sort=e.target.value;render();});
        elements.viewGridBtn.addEventListener('click',()=>{if(state.view!=='grid'){state.view='grid';updateViewToggleUI();}});
        elements.viewListBtn.addEventListener('click',()=>{if(state.view!=='list'){state.view='list';updateViewToggleUI();}});
        elements.prevPageBtn.addEventListener('click',()=>{if(state.currentPage>1){state.currentPage--;render();}});
        elements.nextPageBtn.addEventListener('click',()=>{const totalPages = Math.ceil((state.allGames[state.activePlatform]||[]).length / state.itemsPerPage);if(state.currentPage < totalPages){state.currentPage++;render();}});
    }

    // ---- 8. INITIALIZATION ---- //
    function init() {
        state.allGames.psn_library=generateGames(50, MOCK_GAME_DATA.psn, 'psn_library');
        state.allGames.xbox_library=generateGames(30, MOCK_GAME_DATA.xbox, 'xbox_library');
        state.allGames.steam_library=generateGames(10, MOCK_GAME_DATA.steam, 'steam_library');

        const showcaseBanners={"Elden Ring":"https://images.unsplash.com/photo-1672723930113-7a91a9d86c47?q=80&w=1932&auto=format&fit=crop","God of War Ragnarök":"https://images.unsplash.com/photo-1669938805358-26164d1a4d46?q=80&w=1932&auto=format&fit=crop","Ghost of Tsushima":"https://images.unsplash.com/photo-1600179515003-97a157755d9d?q=80&w=1932&auto=format&fit=crop"};
        const recentGame = Object.values(state.allGames).flat().sort((a,b)=>b.lastPlayed.getTime()-a.lastPlayed.getTime())[0];
        if (recentGame && showcaseBanners[recentGame.title]) { elements.profileHeader.style.backgroundImage = `url('${showcaseBanners[recentGame.title]}')`;}

        setupEventListeners(); updateActiveTabUI(); updateViewToggleUI();
        document.getElementById('psn_library_panel').classList.remove('hidden');
        render();
    }
    document.addEventListener('DOMContentLoaded', init);
})();