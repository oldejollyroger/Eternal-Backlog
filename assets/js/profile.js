(function() { 
   const MOCK_GAME_DATA = {
       psn: [
            // Use your original placehold.co links here
           { title: "The Last of Us Part II", total: 26, imgUrl: "https://placehold.co/300x400/2d3748/ffffff?text=TLOU2" },
           { title: "Ghost of Tsushima", total: 52, imgUrl: "https://placehold.co/300x400/2d3748/ffffff?text=GoT" },
           { title: "Elden Ring", total: 42, imgUrl: "https://placehold.co/300x400/2d3748/ffffff?text=Elden+Ring" },
            { title: "Bloodborne", total: 34, imgUrl: "https://placehold.co/300x400/2d3748/ffffff?text=Bloodborne" },
            { title: "God of War Ragnarök", total: 36, imgUrl: "https://placehold.co/300x400/2d3748/ffffff?text=GoW+R" },
       ],
       xbox: [
           { title: "Halo Infinite", total: 1000, imgUrl: "https://placehold.co/300x400/107c10/ffffff?text=Halo" },
           { title: "Gears 5", total: 1000, imgUrl: "https://placehold.co/300x400/107c10/ffffff?text=Gears+5" },
           { title: "Starfield", total: 1000, imgUrl: "https://placehold.co/300x400/107c10/ffffff?text=Starfield" },
       ],
       steam: [
           { title: "Baldur's Gate 3", total: 53, imgUrl: "https://placehold.co/300x400/1b2838/ffffff?text=BG3" },
           { title: "Stardew Valley", total: 30, imgUrl: "https://placehold.co/300x400/1b2838/ffffff?text=Stardew" },
       ]
   };

   let allGames = {};
   let currentSort = 'progress_desc';
   let currentView = 'grid'; // Keep track of view state

   function getRank(progress) {
       if (progress === 100) return { letter: 'S', color: '#facc15', textColor: 'text-yellow-400', borderColor: 'border-yellow-400' }; // Gold
       if (progress >= 90) return { letter: 'A', color: '#a855f7', textColor: 'text-purple-400', borderColor: 'border-purple-400' }; // Purple
       if (progress >= 70) return { letter: 'B', color: '#3b82f6', textColor: 'text-blue-400', borderColor: 'border-blue-400' };    // Blue
       if (progress >= 40) return { letter: 'C', color: '#22c55e', textColor: 'text-green-400', borderColor: 'border-green-400' };   // Green
       if (progress >= 10) return { letter: 'D', color: '#f97316', textColor: 'text-orange-500', borderColor: 'border-orange-500' }; // Orange
        if (progress > 0) return { letter: 'E', color: '#ef4444', textColor: 'text-red-500', borderColor: 'border-red-500' }; // Red
       return { letter: '-', color: '#6b7280', textColor: 'text-gray-400', borderColor: 'border-gray-500' }; // Gray
   }

   // --- HTML RENDERING FUNCTIONS (Minor tweaks for clarity) ---
   function createGridCard(game) {
       const rank = getRank(game.progress);
   	 const unitLabel = game.platform === 'xbox_library' ? 'G' : 'trophies';
        return `
       <div class="bg-gray-800/70 rounded-lg group overflow-hidden flex flex-col text-sm shadow-lg transition-transform hover:scale-105 hover:bg-gray-700/80 cursor-pointer">
           <div class="relative">
               <img src="${game.imgUrl}" alt="${game.title}" class="w-full object-cover aspect-[3/4]">
               <div class="absolute top-2 right-2 w-9 h-9 flex items-center justify-center rounded-full bg-gray-900/80 border-2 ${rank.borderColor}">
                   <span class="text-xl font-bold ${rank.textColor}">${rank.letter}</span>
               </div>
           </div>
           <div class="p-3 flex-grow flex flex-col">
               <p class="font-bold truncate mb-2">${game.title}</p>
                <div class="mt-auto pt-2">
   			   <div class="flex justify-between text-xs text-gray-400 mb-1"><span>${game.earned}/${game.total} ${unitLabel}</span><span>${game.progress}%</span></div>
   			   <div class="w-full bg-gray-700 rounded-full h-1.5">
   			     <div class="h-1.5 rounded-full" style="width: ${game.progress}%; background-color: ${rank.color};"></div>
   			   </div>
   			 </div>
             </div>
       </div>`;
   }

   function createListRow(game) {
       const rank = getRank(game.progress);
   	 const unitLabel = game.platform === 'xbox_library' ? 'G' : 'trophies';
        return `
       <div class="bg-gray-800/70 p-3 rounded-md flex items-center space-x-4 text-sm hover:bg-gray-700/80 cursor-pointer">
           <img src="${game.imgUrl}" alt="${game.title}" class="w-10 h-14 object-cover rounded-sm shrink-0">
           <p class="font-bold flex-grow truncate">${game.title}</p>
           <div class="w-56 hidden md:block">
   			<div class="flex justify-between text-xs text-gray-400 mb-1"><span>${game.earned}/${game.total} ${unitLabel}</span><span>${game.progress}%</span></div>
   			 <div class="w-full bg-gray-700 rounded-full h-1.5"><div class="h-1.5 rounded-full" style="width: ${game.progress}%; background-color: ${rank.color};"></div></div>
   		</div>
           <p class="hidden lg:block w-40 text-right text-gray-400 text-xs">${game.lastPlayed.toLocaleDateString()} <span class="text-gray-500 block">Last Played</span></p>
   		<div class="flex w-9 h-9 items-center justify-center rounded-full border-2 ${rank.borderColor} shrink-0"><span class="text-xl font-bold ${rank.textColor}">${rank.letter}</span></div>
       </div>`;
   }
   
   function renderPlatform(platformId) {
       let games = allGames[platformId];
       if (!games) return;
       games.sort((a, b) => {
            switch (currentSort) {
               case 'progress_desc': return b.progress - a.progress;
               case 'progress_asc': return a.progress - b.progress;
               case 'name_asc': return a.title.localeCompare(b.title);
               case 'last_played_desc': return b.lastPlayed.getTime() - a.lastPlayed.getTime(); // sort dates
               default: return 0;
           }
       });

       const gridContainer = document.querySelector(`#${platformId} .view-grid`);
       const listContainer = document.querySelector(`#${platformId} .view-list`);
        if (!gridContainer || !listContainer) {
            console.error("Containers not found for:", platformId);
            return;
        }
       gridContainer.innerHTML = games.map(createGridCard).join('');
       listContainer.innerHTML = games.map(createListRow).join('');
        // Ensure the correct view is shown after render
        changeView(currentView, false); // Pass false to not overwrite currentView
   }

    function changeLibraryTab(event, tabID) {
       document.querySelectorAll('.library-panel').forEach(p => p.classList.add('hidden'));
       document.querySelectorAll('.tab-button').forEach(b => {
            // Refined class toggle
           b.classList.remove('bg-gray-800', 'text-white');
           b.classList.add('text-gray-400');
       });
       document.getElementById(tabID).classList.remove('hidden');
        // Refined class toggle
       event.currentTarget.classList.add('bg-gray-800', 'text-white');
        event.currentTarget.classList.remove('text-gray-400');
       renderPlatform(tabID); // Re-render when tab changes
   }
   
    // Adjusted to handle state properly
    function changeView(view, updateState = true) {
      if(updateState) currentView = view; // only update state if called by button click
       const gridBtn = document.getElementById('view_grid_btn');
       const listBtn = document.getElementById('view_list_btn');
   	const activeClass ='bg-purple-600'; const inactiveText = 'text-gray-400';

       document.querySelectorAll('.view-grid').forEach(el => view === 'grid' ? el.classList.remove('hidden') : el.classList.add('hidden'));
       document.querySelectorAll('.view-list').forEach(el => view === 'list' ? el.classList.remove('hidden') : el.classList.add('hidden'));
       
       if (view === 'grid') {
            gridBtn.classList.add(activeClass, 'text-white'); gridBtn.classList.remove(inactiveText);
           listBtn.classList.remove(activeClass, 'text-white'); listBtn.classList.add(inactiveText);
       } else {
            listBtn.classList.add(activeClass, 'text-white'); listBtn.classList.remove(inactiveText);
           gridBtn.classList.remove(activeClass, 'text-white');  gridBtn.classList.add(inactiveText);
       }
   }
   
   function handleSortChange(event) {
       currentSort = event.target.value;
       const activePanelId = document.querySelector('.library-panel:not(.hidden)').id;
        if(activePanelId) {
          renderPlatform(activePanelId);
   	}
   }

   document.addEventListener('DOMContentLoaded', () => {
        // --- Generate Full Data Set with more realistic numbers ---
       const generateGames = (count, baseData, platform, unit) => 
           baseData.concat(Array.from({ length: count - baseData.length }, (_, i) => ({ 
                title: `${platform} Game ${i + baseData.length + 1}`, 
                total: unit === 'G' ? 1000 : Math.floor(Math.random() * 40) + 20,
               imgUrl: `https://placehold.co/300x400/${unit==='G' ? '107c10':'2d3748'}/ffffff?text=Game+${i + baseData.length + 1}`
            }))).map(game => {
                const progress = game.title.includes("Stardew") ? 100 : Math.floor(Math.random() * 101); // Force one 100%
                const earned = unit === 'G' ? Math.round((progress / 100) * game.total / 5) * 5 : Math.round(game.total * (progress / 100));
                return {
                   ...game, progress, earned, platform, unit,
                    lastPlayed: new Date(Date.now() - Math.random() * 1e11) // ~ 3 years
                };
            });

        allGames['psn_library'] = generateGames(50, MOCK_GAME_DATA.psn, 'psn_library', 'trophies');
        allGames['xbox_library'] = generateGames(30, MOCK_GAME_DATA.xbox, 'xbox_library', 'G');
        allGames['steam_library'] = generateGames(10, MOCK_GAME_DATA.steam, 'steam_library', 'achievements');
   	
       // Attach event listeners & make functions global for onclick
       window.changeLibraryTab = changeLibraryTab; 
       window.changeView = changeView;
       document.getElementById('sort_dropdown')?.addEventListener('change', handleSortChange);
       
        // Initial render and setup
   	document.getElementById('btn-psn')?.click(); // Use the button click to initialise everything
       changeView('grid'); 
   });

})(); 