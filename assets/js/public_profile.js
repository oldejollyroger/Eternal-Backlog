(function() {
    // ---- 1. MOCK DATA ---- //
    let allGames = [];
    const MOCK_REVIEWS = [
        { gameTitle: "Elden Ring", rating: "9.5/10", text: "The trophy list is challenging but fair, making the Platinum one of the most satisfying achievements in gaming.", color: "eab308" },
        { gameTitle: "Baldur's Gate 3", rating: "10/10", text: "A masterpiece of the genre. The 'Leave No One Behind' achievement is a true test of planning and patience.", color: "1b2838" }
    ];
    const MOCK_FAVORITE_GAMES = [
    { title: "Bloodborne", imgUrl: "https://images.unsplash.com/photo-1592155931584-9069c97b4a86?q=80&w=1920&auto=format&fit=crop" },
    { title: "The Witcher 3", imgUrl: "https://images.unsplash.com/photo-1560623640-501b44c6800a?q=80&w=1920&auto=format&fit=crop" },
    { title: "Red Dead Redemption 2", imgUrl: "https://images.unsplash.com/photo-1558981852-426c6c22a060?q=80&w=1920&auto=format&fit=crop" },
    { title: "Sekiro", imgUrl: "https://images.unsplash.com/photo-1610475034358-96869cb4a4b4?q=80&w=1920&auto=format&fit=crop" },
    { title: "Nioh 2", imgUrl: "https://images.unsplash.com/photo-1587831990711-23d284c6423b?q=80&w=1920&auto=format&fit=crop" },
];
    
    // ---- 2. HELPER FUNCTIONS ---- //
    const createSvgPlaceholder = (title, color = '4A5568') => { const words=title.split(' ');let l1='',l2='';for(const w of words){if((l1+w).length<12)l1+=`${w} `;else if((l2+w).length<12)l2+=`${w} `} const svg=`<svg width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#${color}"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="bold" fill="#fff">${l1.trim()}</text><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="bold" fill="#fff">${l2.trim()}</text></svg>`; return `data:image/svg+xml;base64,${btoa(svg)}`;};
    const generate = (count, platform) => { const details = { psn_library: {color: '2d3748'}, xbox_library: {color: '107c10'}, steam_library: {color: '1b2838'}}[platform]; return Array.from({length:count}, (_,i)=>({title:`${platform.slice(0,3)} Game ${i+1}`, platform, imgUrl:createSvgPlaceholder(`${platform.slice(0,3)} Game ${i+1}`, details.color), lastPlayed: new Date(Date.now() - Math.random() * 1e11)})); };

    const createRecentGameCard = (game) => `<div class="bg-gray-800/70 rounded-lg group overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-pointer"><img src="${game.imgUrl}" alt="${game.title}" class="w-full object-cover aspect-[3/4]"></div>`;
    const createFavoriteGameSlide = (game) => `<div class="swiper-slide bg-cover bg-center" style="background-image: url('${game.imgUrl}')"><div class="w-full h-full bg-black/60 flex items-end p-4"><p class="text-white text-xl font-bold">${game.title}</p></div></div>`;
    const createReviewCard = (review) => `<article class="bg-gray-800/50 p-6 rounded-lg flex items-start space-x-6"><img src="${createSvgPlaceholder(review.gameTitle, review.color)}" alt="${review.gameTitle}" class="w-20 md:w-24 rounded-md shadow-md"><div class="flex-1"><div class="flex justify-between items-start"><h3 class="text-xl font-bold">${review.gameTitle}</h3><div class="bg-green-500/20 text-green-300 font-bold text-lg py-1 px-3 rounded-full">${review.rating}</div></div><blockquote class="text-gray-300 mt-2 italic border-l-2 border-gray-600 pl-4">"${review.text}"</blockquote></div></article>`;

    // ---- 3. RENDER LOGIC ---- //
    function renderRecentlyPlayed(platform) {
        const container = document.getElementById('recently_played_container');
        const gamesToShow = allGames.filter(g => g.platform === platform).sort((a,b) => b.lastPlayed.getTime() - a.lastPlayed.getTime()).slice(0, 10);
        if(gamesToShow.length) container.innerHTML = gamesToShow.map(createRecentGameCard).join('');
        else container.innerHTML = `<p class="text-gray-500 col-span-full text-center">No recently played games on this platform.</p>`;
    }

    // ---- 4. INITIALIZATION ---- //
    function init() {
        allGames.push(...generate(15, 'psn_library'), ...generate(8, 'xbox_library'), ...generate(12, 'steam_library'));

        renderRecentlyPlayed('psn_library');

        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                const currentBtn = e.currentTarget;
                currentBtn.classList.add('active');
                renderRecentlyPlayed(currentBtn.dataset.platform);
            });
        });

        const favSwiperWrapper = document.querySelector('.favorite-games-swiper .swiper-wrapper');
        if(favSwiperWrapper) {
            favSwiperWrapper.innerHTML = MOCK_FAVORITE_GAMES.map(createFavoriteGameSlide).join('');
            new Swiper('.favorite-games-swiper', {
                loop: true, slidesPerView: 'auto', spaceBetween: 20, centeredSlides: true,
                autoplay: { delay: 5000, disableOnInteraction: false },
                pagination: { el: '.swiper-pagination', clickable: true },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            });
        }
        
        const reviewsContainer = document.getElementById('reviews-container');
        if(reviewsContainer) reviewsContainer.innerHTML = MOCK_REVIEWS.map(createReviewCard).join('');
    }
    
    document.addEventListener('DOMContentLoaded', init);
})();