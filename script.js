const cdForm = document.getElementById('cd-form');
const mainContent = document.getElementById('main-content');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const yearInput = document.getElementById('year');
const discsInput = document.getElementById('discs');
const formatInput = document.getElementById('format-select-input');
const toBuyInput = document.getElementById('to-buy-input'); // NOWE
const coverInput = document.getElementById('cover');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const filterFormat = document.getElementById('filter-format'); 
const userSelect = document.getElementById('user-select');
const addUserBtn = document.getElementById('add-user-btn');
const removeUserBtn = document.getElementById('remove-user-btn');

// ELEMENTY DO OBSŁUGI PLIKÓW
const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');

let editId = null;

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

function saveAllCDs(cds) {
    localStorage.setItem(getStorageKey(), JSON.stringify(cds));
}

// --- STATYSTYKI ---
function updateStatistics() {
    const cds = getCDsFromStorage();
    
    // Liczymy tylko to, co już mamy (pomijamy wishlistę w głównych statystykach lub wliczamy - wg uznania)
    // Tutaj: liczymy wszystko, ale separujemy formaty
    const totalAlbums = cds.length;
    const totalDiscs = cds.reduce((sum, cd) => sum + parseInt(cd.discs || 0), 0);
    const vinylCount = cds.filter(c => c.format === 'Vinyl').length;
    const cdCount = cds.filter(c => c.format === 'CD').length;

    document.getElementById('stat-total-albums').innerText = totalAlbums;
    document.getElementById('stat-total-discs').innerText = totalDiscs;
    document.getElementById('stat-vinyl-count').innerText = vinylCount;
    document.getElementById('stat-cd-count').innerText = cdCount;
}

// --- OPERACJE NA PLIKACH ---
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        const cds = getCDsFromStorage();
        if (cds.length === 0) {
            alert("Kolekcja tego profilu jest pusta!");
            return;
        }
        const dataStr = JSON.stringify(cds, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", url);
        downloadAnchorNode.setAttribute("download", `kolekcja_${userSelect.value}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        URL.revokeObjectURL(url);
    });
}

if (importInput) {
    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedCDs = JSON.parse(event.target.result);
                if (Array.isArray(importedCDs)) {
                    if (confirm(`Czy zastąpić kolekcję profilu "${userSelect.value}"?`)) {
                        saveAllCDs(importedCDs);
                        displayCDs();
                        alert("Kolekcja wczytana pomyślnie!");
                    }
                }
            } catch (err) { alert("Błąd pliku JSON."); }
            importInput.value = "";
        };
        reader.readAsText(file);
    });
}

// --- ZARZĄDZANIE PROFILAMI ---
addUserBtn.addEventListener('click', () => {
    const newUser = prompt("Imię nowego użytkownika:");
    if (newUser?.trim()) {
        const trimmed = newUser.trim();
        if (!Array.from(userSelect.options).some(o => o.value === trimmed)) {
            const opt = document.createElement('option');
            opt.value = trimmed; opt.textContent = trimmed;
            userSelect.appendChild(opt);
            userSelect.value = trimmed;
            saveUsersToStorage();
            displayCDs();
        }
    }
});

removeUserBtn.addEventListener('click', () => {
    if (userSelect.options.length <= 1) return alert("Nie można usunąć ostatniego profilu!");
    if (confirm(`Usunąć profil ${userSelect.value}?`)) {
        localStorage.removeItem(getStorageKey());
        let users = JSON.parse(localStorage.getItem('app_users')).filter(u => u !== userSelect.value);
        localStorage.setItem('app_users', JSON.stringify(users));
        loadUsersList();
        displayCDs();
    }
});

userSelect.addEventListener('change', () => {
    editId = null; 
    cdForm.reset();
    document.getElementById('add-btn').innerText = "Dodaj do kolekcji";
    displayCDs();
});

// --- API ITUNES ---
async function autoFetchData() {
    if (titleInput.value && artistInput.value && !editId) {
        const query = encodeURIComponent(`${artistInput.value} ${titleInput.value}`);
        try {
            const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=album&limit=1`);
            const data = await res.json();
            if (data.results[0]) {
                const res0 = data.results[0];
                if (!yearInput.value) yearInput.value = res0.releaseDate.substring(0, 4);
                if (!coverInput.value) coverInput.value = res0.artworkUrl100.replace('100x100bb', '600x600bb');
            }
        } catch (e) { console.error(e); }
    }
}
titleInput.addEventListener('blur', autoFetchData);
artistInput.addEventListener('blur', autoFetchData);

// --- RENDEROWANIE LISTY ---
function displayCDs() {
    updateStatistics();
    let cds = getCDsFromStorage();
    const search = searchInput.value.toLowerCase();
    const selectedFormat = filterFormat.value;

    // Filtrowanie (z uwzględnieniem wishlisty)
    cds = cds.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search) || c.artist.toLowerCase().includes(search);
        let matchesFormat = false;
        if (selectedFormat === 'all') matchesFormat = true;
        else if (selectedFormat === 'wishlist') matchesFormat = c.toBuy === true;
        else matchesFormat = c.format === selectedFormat;
        
        return matchesSearch && matchesFormat;
    });
    
    // Sortowanie
    cds.sort((a, b) => {
        const s = sortSelect.value;
        if (s === 'newest') return b.year - a.year;
        if (s === 'oldest') return a.year - b.year;
        return a[s].localeCompare(b[s]);
    });

    const grouped = {
        'Vinyl': cds.filter(c => c.format === 'Vinyl'),
        'CD': cds.filter(c => c.format === 'CD'),
        'Inny': cds.filter(c => c.format === 'Inny')
    };

    mainContent.innerHTML = '';

    for (const [formatName, items] of Object.entries(grouped)) {
        if (items.length > 0) {
            const section = document.createElement('div');
            section.className = 'format-section';
            const icon = formatName === 'Vinyl' ? '🎵' : (formatName === 'CD' ? '💿' : '📦');
            const titleLabel = formatName === 'Vinyl' ? 'Winyle' : (formatName === 'CD' ? 'Płyty CD' : 'Inne nośniki');
            
            section.innerHTML = `
                <div class="format-section-title">
                    <span>${icon} ${titleLabel}</span>
                    <span class="count-badge">${items.length}</span>
                </div>
                <div class="grid-container" id="list-${formatName}"></div>
            `;
            
            mainContent.appendChild(section);
            const grid = document.getElementById(`list-${formatName}`);
            
            items.forEach(cd => {
                const card = document.createElement('div');
                // Dodajemy klasę to-buy do karty jeśli zaznaczone
                card.className = `cd-card ${cd.toBuy ? 'to-buy' : ''}`;
                card.innerHTML = `
                    <div class="cd-header">
                        <img src="${cd.cover || 'https://via.placeholder.com/80'}" alt="okładka">
                        <div class="cd-info">
                            <h3>${cd.title}</h3>
                            <p><strong>${cd.artist}</strong></p>
                            <p>${cd.year} | ${cd.discs} szt.</p>
                            ${cd.toBuy ? '<span class="to-buy-badge">🛒 Do kupienia</span>' : ''}
                        </div>
                    </div>
                    <div class="actions">
                        <button class="edit-btn" onclick="editCD(${cd.id})">Edytuj</button>
                        <button class="delete-btn" onclick="deleteCD(${cd.id})">Usuń</button>
                    </div>`;
                grid.appendChild(card);
            });
        }
    }

    if (cds.length === 0) {
        mainContent.innerHTML = '<p style="text-align:center; color:#888; margin-top: 20px;">Lista jest pusta.</p>';
    }
}

// --- DODAWANIE / EDYCJA ---
cdForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cdData = {
        title: titleInput.value, 
        artist: artistInput.value,
        year: yearInput.value, 
        discs: discsInput.value,
        format: formatInput.value, 
        toBuy: toBuyInput.checked, // Zapis statusu "Do kupienia"
        cover: coverInput.value || 'https://via.placeholder.com/100'
    };

    let cds = getCDsFromStorage();
    if (editId) {
        const idx = cds.findIndex(c => c.id === editId);
        if (idx !== -1) cds[idx] = { ...cdData, id: editId };
        editId = null;
        document.getElementById('add-btn').innerText = "Dodaj do kolekcji";
    } else {
        cds.push({ ...cdData, id: Date.now() });
    }
    
    saveAllCDs(cds);
    cdForm.reset();
    displayCDs();
});

window.deleteCD = (id) => {
    if (confirm("Czy na pewno chcesz usunąć ten album?")) {
        saveAllCDs(getCDsFromStorage().filter(c => c.id !== id));
        displayCDs();
    }
};

window.editCD = (id) => {
    const cd = getCDsFromStorage().find(c => c.id === id);
    if (cd) {
        titleInput.value = cd.title; 
        artistInput.value = cd.artist;
        yearInput.value = cd.year; 
        discsInput.value = cd.discs;
        formatInput.value = cd.format || 'CD'; 
        toBuyInput.checked = cd.toBuy || false; // Przywrócenie stanu checkboxa
        coverInput.value = cd.cover;
        editId = id;
        document.getElementById('add-btn').innerText = "Zaktualizuj dane";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// --- START ---
document.addEventListener('DOMContentLoaded', () => { 
    loadUsersList(); 
    displayCDs(); 
});

searchInput.addEventListener('input', displayCDs);
sortSelect.addEventListener('change', displayCDs);
filterFormat.addEventListener('change', displayCDs);
    
