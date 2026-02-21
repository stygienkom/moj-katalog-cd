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
const addBtn = document.getElementById('add-btn');

let editId = null;

// --- PROFILE ---
function loadUsersList() {
    const savedUsers = localStorage.getItem('app_users');
    let users = ["Domyslny"];
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

// --- API ITUNES ---
async function autoFetchData() {
    if (titleInput.value && artistInput.value && !editId) {
        const query = encodeURIComponent(`${artistInput.value} ${titleInput.value}`);
        try {
            const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=album&limit=1`);
            const data = await res.json();
            if (data.results && data.results[0]) {
                const album = data.results[0];
                if (!yearInput.value) yearInput.value = album.releaseDate.substring(0, 4);
                if (!coverInput.value) coverInput.value = album.artworkUrl100.replace('100x100bb', '600x600bb');
            }
        } catch (e) { console.error("Błąd API iTunes:", e); }
    }
}

// --- RENDEROWANIE ---
function displayCDs() {
    updateStatistics();
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
        const label = key === 'Vinyl' ? 'Winyle' : (key === 'CD' ? 'Płyty CD' : 'Inne nośniki');
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
                        <p>${cd.year} | ${cd.discs} szt.</p>
                        ${cd.toBuy ? `<span class="to-buy-badge">🛒 Do kupienia</span>` : ''}
                    </div>
                </div>
                <div class="actions">
                    <button class="edit-btn" onclick="editCD(${cd.id})">Edytuj</button>
                    <button class="delete-btn" onclick="deleteCD(${cd.id})">Usuń</button>
                </div>
            `;
            grid.appendChild(card);
        });
        mainContent.appendChild(section);
    }
    if (cds.length === 0) mainContent.innerHTML = `<p style="text-align:center; color:#888;">Lista jest pusta.</p>`;
}

// --- LOGIKA FORMULARZA ---
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
        addBtn.innerText = "Dodaj do kolekcji";
    } else {
        cds.push({ ...cdData, id: Date.now() });
    }
    
    saveAllCDs(cds);
    cdForm.reset();
    displayCDs();
});

// --- AKCJE ---
window.deleteCD = (id) => {
    if (confirm("Czy na pewno chcesz usunąć?")) {
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
    addBtn.innerText = "Zaktualizuj dane";
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- PROFILE BTNS ---
addUserBtn.onclick = () => {
    const n = prompt("Imię użytkownika:");
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
    if (userSelect.options.length > 1 && confirm("Usunąć profil?")) {
        localStorage.removeItem(getStorageKey());
        let users = JSON.parse(localStorage.getItem('app_users')).filter(u => u !== userSelect.value);
        localStorage.setItem('app_users', JSON.stringify(users));
        loadUsersList();
        displayCDs();
    }
};

// --- OPERACJE NA PLIKACH ---
exportBtn.onclick = () => {
    const cds = getCDsFromStorage();
    if (cds.length === 0) return alert("Pusta lista!");
    const dataStr = JSON.stringify(cds, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kolekcja_${userSelect.value}.json`;
    link.click();
};

importInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported) && confirm("Zastąpić listę?")) {
                saveAllCDs(imported);
                displayCDs();
            }
        } catch (err) { alert("Błąd pliku!"); }
    };
    reader.readAsText(file);
};

// --- START ---
document.addEventListener('DOMContentLoaded', () => { 
    loadUsersList(); 
    displayCDs(); 
});
userSelect.onchange = displayCDs;
searchInput.oninput = displayCDs;
sortSelect.onchange = displayCDs;
filterFormat.onchange = displayCDs;
titleInput.addEventListener('blur', autoFetchData);
artistInput.addEventListener('blur', autoFetchData);
