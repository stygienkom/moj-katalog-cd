// --- KONFIGURACJA I ELEMENTY ---
const cdForm = document.getElementById('cd-form');
const mainContent = document.getElementById('main-content');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const yearInput = document.getElementById('year');
const discsInput = document.getElementById('discs');
const formatInput = document.getElementById('format-select-input');
const toBuyInput = document.getElementById('to-buy-input');
const coverInput = document.getElementById('cover');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const filterFormat = document.getElementById('filter-format'); 
const userSelect = document.getElementById('user-select');
const addUserBtn = document.getElementById('add-user-btn');
const removeUserBtn = document.getElementById('remove-user-btn');
const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');

let editId = null;
let currentLang = localStorage.getItem('app_lang') || 'pl';

// --- SŁOWNIK TŁUMACZEŃ ---
const translations = {
    pl: {
        header: "💿 Katalog Muzyczny",
        profile: "Profil:",
        saveFile: "💾 Zapisz",
        loadFile: "📂 Wczytaj",
        titleLabel: "Tytuł albumu:",
        artistLabel: "Wykonawca:",
        yearLabel: "Rok wydania:",
        countLabel: "Ilość:",
        formatLabel: "Format nośnika:",
        toBuyLabel: 'Dodaj do listy "Do kupienia" 🛒',
        coverLabel: "Link do okładki (URL):",
        addBtn: "Dodaj do kolekcji",
        updateBtn: "Zaktualizuj dane",
        statAlbums: "Albumy",
        statDiscs: "Sztuk (Nośniki)",
        statVinyls: "Winyle",
        statCDs: "Płyty CD",
        searchPlaceholder: "🔍 Szukaj w całej kolekcji...",
        filterAll: "Wszystkie nośniki",
        filterWishlist: "🛒 Do kupienia (Wishlista)",
        sortNewest: "Najnowsze",
        sortOldest: "Najstarsze",
        sortTitle: "Tytuł A-Z",
        sortArtist: "Wykonawca A-Z",
        emptyMsg: "Lista jest pusta.",
        unit: "szt.",
        toBuyBadge: "🛒 Do kupienia",
        confirmDelete: "Czy na pewno chcesz usunąć ten album?",
        confirmImport: "Czy zastąpić kolekcję profilu danymi z pliku?",
        formatVinyl: "Winyle",
        formatCD: "Płyty CD",
        formatOther: "Inne nośniki"
    },
    en: {
        header: "💿 Music Catalog",
        profile: "Profile:",
        saveFile: "💾 Save",
        loadFile: "📂 Load",
        titleLabel: "Album Title:",
        artistLabel: "Artist:",
        yearLabel: "Release Year:",
        countLabel: "Quantity:",
        formatLabel: "Media Format:",
        toBuyLabel: 'Add to "To Buy" list 🛒',
        coverLabel: "Cover Link (URL):",
        addBtn: "Add to Collection",
        updateBtn: "Update Data",
        statAlbums: "Albums",
        statDiscs: "Items (Discs)",
        statVinyls: "Vinyls",
        statCDs: "CD Discs",
        searchPlaceholder: "🔍 Search collection...",
        filterAll: "All Media",
        filterWishlist: "🛒 To Buy (Wishlist)",
        sortNewest: "Newest",
        sortOldest: "Oldest",
        sortTitle: "Title A-Z",
        sortArtist: "Artist A-Z",
        emptyMsg: "The list is empty.",
        unit: "pcs",
        toBuyBadge: "🛒 To Buy",
        confirmDelete: "Are you sure you want to delete this album?",
        confirmImport: "Replace profile collection with file data?",
        formatVinyl: "Vinyls",
        formatCD: "CD Discs",
        formatOther: "Other Media"
    }
};

// --- SYSTEM TŁUMACZEŃ ---
window.setLanguage = (lang) => {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    updateUI();
};

function updateUI() {
    const t = translations[currentLang];
    
    document.querySelector('h1').innerText = t.header;
    document.querySelector('label[for="user-select"]').innerText = t.profile;
    exportBtn.innerText = t.saveFile;
    document.querySelector('.custom-file-upload').innerText = t.loadFile;
    
    // Formularz
    document.querySelector('label[for="title"]').innerText = t.titleLabel;
    document.querySelector('label[for="artist"]').innerText = t.artistLabel;
    document.querySelector('label[for="year"]').innerText = t.yearLabel;
    document.querySelector('label[for="discs"]').innerText = t.countLabel;
    document.querySelector('label[for="format-select-input"]').innerText = t.formatLabel;
    document.querySelector('label[for="to-buy-input"]').innerText = t.toBuyLabel;
    document.querySelector('label[for="cover"]').innerText = t.coverLabel;
    document.getElementById('add-btn').innerText = editId ? t.updateBtn : t.addBtn;

    // Statystyki labels
    const statLabels = document.querySelectorAll('.stat-label');
    statLabels[0].innerText = t.statAlbums;
    statLabels[1].innerText = t.statDiscs;
    statLabels[2].innerText = t.statVinyls;
    statLabels[3].innerText = t.statCDs;

    // Placeholdery i Selecty
    searchInput.placeholder = t.searchPlaceholder;
    filterFormat.options[0].text = t.filterAll;
    filterFormat.options[4].text = t.filterWishlist;
    sortSelect.options[0].text = t.sortNewest;
    sortSelect.options[1].text = t.sortOldest;
    sortSelect.options[2].text = t.sortTitle;
    sortSelect.options[3].text = t.sortArtist;

    displayCDs();
}

// --- PROFILE ---
function loadUsersList() {
    const savedUsers = localStorage.getItem('app_users');
    let users = ["Domyslny", "Ania", "Marek"];
    if (savedUsers) users = JSON.parse(savedUsers);
    else localStorage.setItem('app_users', JSON.stringify(users));

    userSelect.innerHTML = '';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user;
        option.textContent = user;
        userSelect.appendChild(option);
    });
}

function saveUsersToStorage() {
    const users = Array.from(userSelect.options).map(opt => opt.value);
    localStorage.setItem('app_users', JSON.stringify(users));
}

function getStorageKey() { return `cds_${userSelect.value}`; }
function getCDsFromStorage() {
    const key = getStorageKey();
    return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [];
}
function saveAllCDs(cds) { localStorage.setItem(getStorageKey(), JSON.stringify(cds)); }

// --- STATYSTYKI ---
function updateStatistics() {
    const cds = getCDsFromStorage();
    document.getElementById('stat-total-albums').innerText = cds.length;
    document.getElementById('stat-total-discs').innerText = cds.reduce((sum, cd) => sum + parseInt(cd.discs || 0), 0);
    document.getElementById('stat-vinyl-count').innerText = cds.filter(c => c.format === 'Vinyl').length;
    document.getElementById('stat-cd-count').innerText = cds.filter(c => c.format === 'CD').length;
}

// --- OPERACJE NA PLIKACH ---
exportBtn.addEventListener('click', () => {
    const cds = getCDsFromStorage();
    if (cds.length === 0) return;
    const dataStr = JSON.stringify(cds, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kolekcja_${userSelect.value}.json`;
    link.click();
});

importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported) && confirm(translations[currentLang].confirmImport)) {
                saveAllCDs(imported);
                displayCDs();
            }
        } catch (err) { console.error("JSON Error"); }
    };
    reader.readAsText(file);
});

// --- RENDEROWANIE ---
function displayCDs() {
    updateStatistics();
    const t = translations[currentLang];
    let cds = getCDsFromStorage();
    const search = searchInput.value.toLowerCase();
    const format = filterFormat.value;

    cds = cds.filter(c => {
        const matchSearch = c.title.toLowerCase().includes(search) || c.artist.toLowerCase().includes(search);
        const matchFormat = format === 'all' ? true : (format === 'wishlist' ? c.toBuy : c.format === format);
        return matchSearch && matchFormat;
    });

    cds.sort((a, b) => {
        const s = sortSelect.value;
        if (s === 'newest') return b.year - a.year;
        if (s === 'oldest') return a.year - b.year;
        return a[s].localeCompare(b[s]);
    });

    const groups = { 'Vinyl': [], 'CD': [], 'Inny': [] };
    cds.forEach(c => groups[c.format || 'Inny'].push(c));

    mainContent.innerHTML = '';
    for (const [key, items] of Object.entries(groups)) {
        if (items.length === 0) continue;
        const section = document.createElement('div');
        section.className = 'format-section';
        const label = key === 'Vinyl' ? t.formatVinyl : (key === 'CD' ? t.formatCD : t.formatOther);
        const icon = key === 'Vinyl' ? '🎵' : (key === 'CD' ? '💿' : '📦');

        section.innerHTML = `
            <div class="format-section-title">
                <span>${icon} ${label}</span>
                <span class="count-badge">${items.length}</span>
            </div>
            <div class="grid-container"></div>
        `;
        const grid = section.querySelector('.grid-container');
        items.forEach(cd => {
            const card = document.createElement('div');
            card.className = `cd-card ${cd.toBuy ? 'to-buy' : ''}`;
            card.innerHTML = `
                <div class="cd-header">
                    <img src="${cd.cover || 'https://via.placeholder.com/100'}" alt="cover">
                    <div class="cd-info">
                        <h3>${cd.title}</h3>
                        <p><strong>${cd.artist}</strong></p>
                        <p>${cd.year} | ${cd.discs} ${t.unit}</p>
                        ${cd.toBuy ? `<span class="to-buy-badge">${t.toBuyBadge}</span>` : ''}
                    </div>
                </div>
                <div class="actions">
                    <button class="edit-btn" onclick="editCD(${cd.id})">${currentLang === 'pl' ? 'Edytuj' : 'Edit'}</button>
                    <button class="delete-btn" onclick="deleteCD(${cd.id})">${currentLang === 'pl' ? 'Usuń' : 'Delete'}</button>
                </div>
            `;
            grid.appendChild(card);
        });
        mainContent.appendChild(section);
    }
    if (cds.length === 0) mainContent.innerHTML = `<p style="text-align:center; color:#888;">${t.emptyMsg}</p>`;
}

// --- LOGIKA FORMULARZA I AKCJI ---
cdForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cdData = {
        title: titleInput.value, artist: artistInput.value,
        year: yearInput.value, discs: discsInput.value,
        format: formatInput.value, toBuy: toBuyInput.checked,
        cover: coverInput.value || 'https://via.placeholder.com/100'
    };
    let cds = getCDsFromStorage();
    if (editId) {
        const idx = cds.findIndex(c => c.id === editId);
        if (idx !== -1) cds[idx] = { ...cdData, id: editId };
        editId = null;
    } else {
        cds.push({ ...cdData, id: Date.now() });
    }
    saveAllCDs(cds);
    cdForm.reset();
    updateUI();
});

window.deleteCD = (id) => {
    if (confirm(translations[currentLang].confirmDelete)) {
        saveAllCDs(getCDsFromStorage().filter(c => c.id !== id));
        displayCDs();
    }
};

window.editCD = (id) => {
    const cd = getCDsFromStorage().find(c => c.id === id);
    if (!cd) return;
    titleInput.value = cd.title; artistInput.value = cd.artist;
    yearInput.value = cd.year; discsInput.value = cd.discs;
    formatInput.value = cd.format; toBuyInput.checked = cd.toBuy;
    coverInput.value = cd.cover;
    editId = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateUI();
};

// --- PROFILE BTNS ---
addUserBtn.onclick = () => {
    const n = prompt("Name:");
    if (n?.trim()) {
        const opt = document.createElement('option');
        opt.value = opt.textContent = n.trim();
        userSelect.appendChild(opt);
        userSelect.value = n.trim();
        saveUsersToStorage();
        displayCDs();
    }
};

removeUserBtn.onclick = () => {
    if (userSelect.options.length > 1 && confirm("Delete?")) {
        localStorage.removeItem(getStorageKey());
        let users = JSON.parse(localStorage.getItem('app_users')).filter(u => u !== userSelect.value);
        localStorage.setItem('app_users', JSON.stringify(users));
        loadUsersList();
        displayCDs();
    }
};

// --- START ---
document.addEventListener('DOMContentLoaded', () => { 
    loadUsersList(); 
    updateUI(); 
});
userSelect.onchange = displayCDs;
searchInput.oninput = displayCDs;
sortSelect.onchange = displayCDs;
filterFormat.onchange = displayCDs;
            
