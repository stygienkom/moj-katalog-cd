const cdForm = document.getElementById('cd-form');
const cdList = document.getElementById('cd-list');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const yearInput = document.getElementById('year');
const discsInput = document.getElementById('discs');
const coverInput = document.getElementById('cover');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const userSelect = document.getElementById('user-select');
const addUserBtn = document.getElementById('add-user-btn');
const removeUserBtn = document.getElementById('remove-user-btn'); // Nowy przycisk

let editId = null; 

// --- LOGIKA PROFILI UŻYTKOWNIKÓW (Z AUTOMATYCZNYM ZAPISEM) ---

// Ładuje listę użytkowników z localStorage przy starcie
function loadUsersList() {
    const savedUsers = localStorage.getItem('app_users');
    let users = ["Domyslny", "Ania", "Marek"]; // Domyślne imiona

    if (savedUsers) {
        users = JSON.parse(savedUsers);
    } else {
        localStorage.setItem('app_users', JSON.stringify(users));
    }

    userSelect.innerHTML = ''; 
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user;
        option.textContent = user;
        userSelect.appendChild(option);
    });
}

// Zapisuje aktualną listę użytkowników widoczną w <select>
function saveUsersToStorage() {
    const users = Array.from(userSelect.options).map(opt => opt.value);
    localStorage.setItem('app_users', JSON.stringify(users));
}

function getStorageKey() {
    return `cds_${userSelect.value}`;
}

function getCDsFromStorage() {
    const key = getStorageKey();
    return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [];
}

function saveAllCDs(cds) {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(cds));
}

// Dodawanie nowego profilu
addUserBtn.addEventListener('click', () => {
    const newUser = prompt("Wpisz imię nowego użytkownika:");
    if (newUser && newUser.trim() !== "") {
        const trimmedUser = newUser.trim();
        const exists = Array.from(userSelect.options).some(opt => opt.value === trimmedUser);
        
        if (!exists) {
            const option = document.createElement('option');
            option.value = trimmedUser;
            option.textContent = trimmedUser;
            userSelect.appendChild(option);
            
            userSelect.value = trimmedUser;
            saveUsersToStorage();
            displayCDs();
        } else {
            alert("Użytkownik o tym imieniu już istnieje!");
        }
    }
});

// USUWANIE AKTUALNEGO PROFILU
removeUserBtn.addEventListener('click', () => {
    const userToDelete = userSelect.value;

    // Zabezpieczenie: musi zostać choć jeden użytkownik
    if (userSelect.options.length <= 1) {
        alert("Nie można usunąć ostatniego użytkownika!");
        return;
    }

    const confirmDelete = confirm(`Czy na pewno chcesz usunąć profil "${userToDelete}"? Wszystkie płyty tego użytkownika zostaną skasowane.`);
    
    if (confirmDelete) {
        // 1. Usuwamy kolekcję płyt z pamięci
        localStorage.removeItem(`cds_${userToDelete}`);

        // 2. Usuwamy użytkownika z listy w pamięci
        let users = JSON.parse(localStorage.getItem('app_users'));
        users = users.filter(u => u !== userToDelete);
        localStorage.setItem('app_users', JSON.stringify(users));

        // 3. Odświeżamy listę i widok
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

// --- AUTOMATYCZNE POBIERANIE DANYCH (iTunes API) ---

async function autoFetchData() {
    const title = titleInput.value.trim();
    const artist = artistInput.value.trim();

    if (title && artist && !editId) {
        const query = encodeURIComponent(`${artist} ${title}`);
        const url = `https://itunes.apple.com/search?term=${query}&entity=album&limit=1`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.results.length > 0) {
                const result = data.results[0];
                if (!yearInput.value) {
                    yearInput.value = result.releaseDate.substring(0, 4);
                }
                if (!coverInput.value) {
                    coverInput.value = result.artworkUrl100.replace('100x100bb', '600x600bb');
                }
            }
        } catch (e) {
            console.error("Błąd auto-pobierania:", e);
        }
    }
}

titleInput.addEventListener('blur', autoFetchData);
artistInput.addEventListener('blur', autoFetchData);

// --- OBSŁUGA LISTY I FORMULARZA ---

document.addEventListener('DOMContentLoaded', () => {
    loadUsersList();
    displayCDs();
});

searchInput.addEventListener('input', displayCDs);
sortSelect.addEventListener('change', displayCDs);

function displayCDs() {
    let cds = getCDsFromStorage();
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;

    cds = cds.filter(cd => 
        cd.title.toLowerCase().includes(searchTerm) || 
        cd.artist.toLowerCase().includes(searchTerm)
    );

    cds.sort((a, b) => {
        switch(sortBy) {
            case 'newest': return b.year - a.year;
            case 'oldest': return a.year - b.year;
            case 'title': return a.title.localeCompare(b.title);
            case 'artist': return a.artist.localeCompare(b.artist);
            default: return 0;
        }
    });

    cdList.innerHTML = '';
    cds.forEach(cd => addCDToDOM(cd));
}

cdForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const cdData = {
        title: titleInput.value,
        artist: artistInput.value,
        year: yearInput.value,
        discs: discsInput.value,
        cover: coverInput.value || 'https://via.placeholder.com/200?text=No+Cover'
    };

    let cds = getCDsFromStorage();

    if (editId) {
        const index = cds.findIndex(cd => cd.id === editId);
        if (index !== -1) {
            cds[index] = { ...cdData, id: editId };
        }
        editId = null;
        document.getElementById('add-btn').innerText = "Dodaj do kolekcji";
    } else {
        const newCD = { ...cdData, id: Date.now() };
        cds.push(newCD);
    }

    saveAllCDs(cds);
    cdForm.reset();
    displayCDs();
});

// --- KOMPONENTY KARTY CD ---

function addCDToDOM(cd) {
    const card = document.createElement('div');
    card.classList.add('cd-card');
    card.innerHTML = `
        <img src="${cd.cover}" alt="Okładka" loading="lazy">
        <div class="cd-info">
            <h3>${cd.title}</h3>
            <p><strong>${cd.artist}</strong></p>
            <p>Rok: ${cd.year} | CD: ${cd.discs}</p>
            <div class="actions">
                <button class="edit-btn" onclick="editCD(${cd.id})">Edytuj</button>
                <button class="delete-btn" onclick="deleteCD(${cd.id})">Usuń</button>
            </div>
        </div>
    `;
    cdList.appendChild(card);
}

function deleteCD(id) {
    if (confirm("Usunąć tę płytę z kolekcji użytkownika " + userSelect.value + "?")) {
        let cds = getCDsFromStorage();
        cds = cds.filter(cd => cd.id !== id);
        saveAllCDs(cds);
        displayCDs();
    }
}

function editCD(id) {
    const cds = getCDsFromStorage();
    const cd = cds.find(item => item.id === id);

    if (cd) {
        titleInput.value = cd.title;
        artistInput.value = cd.artist;
        yearInput.value = cd.year;
        discsInput.value = cd.discs;
        coverInput.value = cd.cover;

        editId = id;
        document.getElementById('add-btn').innerText = "Zaktualizuj dane";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
