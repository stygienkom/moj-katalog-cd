const cdForm = document.getElementById('cd-form');
const cdList = document.getElementById('cd-list');

const coverInput = document.getElementById('cover');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const yearInput = document.getElementById('year');
const discsInput = document.getElementById('discs');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

let editId = null; // Przechowuje ID edytowanej płyty

// Załaduj płyty przy starcie
document.addEventListener('DOMContentLoaded', displayCDs);

// --- AUTOMATYCZNE POBIERANIE ROKU I OKŁADKI PRZY WPISYWANIU ---
async function autoFetchData() {
    const title = titleInput.value.trim();
    const artist = artistInput.value.trim();

    // Pobieraj tylko jeśli oba pola są pełne, a rok jest pusty
    if (title && artist && !yearInput.value) {
        const query = encodeURIComponent(`${artist} ${title}`);
        const url = `https://itunes.apple.com/search?term=${query}&entity=album&limit=1`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.results.length > 0) {
                const result = data.results[0];
                if (result.releaseDate) yearInput.value = result.releaseDate.substring(0, 4);
                if (!coverInput.value) coverInput.value = result.artworkUrl100;
                fetchCoverBtn.innerText = "✅ Jest!";
            }
        } catch (e) { console.error("Auto-fetch error:", e); }
    }
}

titleInput.addEventListener('blur', autoFetchData);
artistInput.addEventListener('blur', autoFetchData);

// --- OBSŁUGA FORMULARZA (DODAWANIE I EDYCJA) ---
cdForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const cdData = {
        title: titleInput.value,
        artist: artistInput.value,
        year: yearInput.value,
        discs: discsInput.value,
        cover: coverInput.value || 'https://via.placeholder.com/100?text=No+Cover'
    };

    let cds = getCDsFromStorage();

    if (editId) {
        // Tryb edycji: znajdź i podmień dane
        const index = cds.findIndex(cd => cd.id === editId);
        if (index !== -1) {
            cds[index] = { ...cdData, id: editId };
        }
        editId = null;
        document.getElementById('add-btn').innerText = "Dodaj do kolekcji";
    } else {
        // Tryb dodawania: stwórz nowy obiekt
        const newCD = { ...cdData, id: Date.now() };
        cds.push(newCD);
    }

    localStorage.setItem('cds', JSON.stringify(cds));
    
    cdForm.reset(); 
    displayCDs(); // Odśwież listę z uwzględnieniem filtrów
});

// --- POBIERANIE DANYCH Z STORAGE ---
function getCDsFromStorage() {
    return localStorage.getItem('cds') ? JSON.parse(localStorage.getItem('cds')) : [];
}

// --- WYŚWIETLANIE I FILTROWANIE ---
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

// --- FUNKCJE PRZYCISKÓW NA KARCIE ---
function deleteCD(id) {
    if (!confirm("Czy na pewno chcesz usunąć tę płytę?")) return;

    let cds = getCDsFromStorage();
    cds = cds.filter(cd => cd.id !== id);
    localStorage.setItem('cds', JSON.stringify(cds));
    displayCDs();
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
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Przewiń do formularza
    }
}

// --- RENDEROWANIE KARTY ---
function addCDToDOM(cd) {
    const card = document.createElement('div');
    card.classList.add('cd-card');
    card.innerHTML = `
        <img src="${cd.cover}" alt="Okładka" loading="lazy">
        <div class="cd-info">
            <h3>${cd.title}</h3>
            <p><strong>Wykonawca:</strong> ${cd.artist}</p>
            <p><strong>Rok:</strong> ${cd.year} | <strong>CD:</strong> ${cd.discs}</p>
            <div class="actions" style="display: flex; gap: 5px; margin-top: 10px;">
                <button class="edit-btn" onclick="editCD(${cd.id})" style="flex:1; background:#f39c12; color:white; border:none; padding:5px; border-radius:4px;">Edytuj</button>
                <button class="delete-btn" onclick="deleteCD(${cd.id})" style="flex:1; background:#ff4d4d; color:white; border:none; padding:5px; border-radius:4px;">Usuń</button>
            </div>
        </div>
    `;
    cdList.appendChild(card);
}
