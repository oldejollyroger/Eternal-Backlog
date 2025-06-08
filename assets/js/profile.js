// In assets/js/profile.js
function changeLibraryTab(event, tabID) {
    document.querySelectorAll('.library-panel').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));

    const activePanel = document.getElementById(tabID);
    activePanel.classList.remove('hidden');
    event.currentTarget.classList.add('active');
    
    // Use the dataset to find the panel content to render
    renderPlatform(event.currentTarget.dataset.tabId);
}