💿 Music Catalog App
Nowoczesna, przeglądarkowa aplikacja do zarządzania kolekcją płyt CD oraz winyli. Pozwala na szybkie katalogowanie albumów, śledzenie statystyk oraz prowadzenie listy zakupowej (Wishlist).
🚀 Główne Funkcje
Automatyczne pobieranie danych: Po wpisaniu wykonawcy i tytułu, aplikacja automatycznie pobiera rok wydania oraz okładkę albumu z bazy iTunes API.
System Profili: Możliwość tworzenia osobnych kolekcji dla różnych użytkowników (dane zapisywane w pamięci przeglądarki).
Zarządzanie Formatami: Podział na sekcje: Płyty CD, Winyle oraz Inne nośniki.
Lista zakupowa (Wishlist): Oznaczanie płyt, których jeszcze nie posiadasz, specjalną ikoną 🛒.
Import/Eksport danych: Zapisywanie całej kolekcji do pliku .json i jej łatwe wczytywanie na innym urządzeniu.
Statystyki: Licznik albumów, łącznej liczby nośników oraz podział na formaty w czasie rzeczywistym.
🛠 Jak to działa? (Instrukcja)
1. Dodawanie płyty
Wpisz Wykonawcę oraz Tytuł albumu.
Kliknij poza pole tekstowe (lub przejdź do kolejnego pola) – jeśli album istnieje w bazie iTunes, Rok i Okładka uzupełnią się same.
Wybierz format (CD/Vinyl) i określ liczbę nośników.
Kliknij Dodaj do kolekcji.
2. Edycja i Usuwanie
Przy każdej karcie albumu znajdują się przyciski Edytuj oraz Usuń.
Kliknięcie "Edytuj" przewinie stronę do formularza i wypełni go danymi płyty. Po poprawkach przycisk zmieni nazwę na Zaktualizuj dane.
3. Zarządzanie plikami
Zapisz (Eksport): Pobiera aktualnie wybrany profil jako plik .json.
Wczytaj (Import): Pozwala wgrać wcześniej zapisany plik. Uwaga: Import zastępuje aktualną listę w wybranym profilu.
🏗 Struktura Techniczna
Aplikacja została zbudowana w oparciu o:
HTML5: Struktura formularzy i kontenerów.
CSS3: Nowoczesny Dark Mode, system Grid oraz Flexbox (zapewniający responsywność 50/50 dla przycisków i kart).
JavaScript (Vanilla):
localStorage: Przechowywanie danych bez konieczności posiadania bazy danych SQL.
Fetch API: Komunikacja z zewnętrznym serwerem iTunes w celu pobierania metadanych.
FileReader API: Obsługa importu plików JSON.
📋 Wymagania
Dowolna nowoczesna przeglądarka internetowa (Chrome, Firefox, Edge, Safari).
Połączenie z internetem (wymagane tylko do pobierania okładek i roku wydania).
💡 Wskazówka
Jeśli okładka nie pobierze się automatycznie, upewnij się, że w nazwie wykonawcy nie ma literówek. Możesz też wkleić własny link do zdjęcia w polu Link do okładki (URL).# moj-katalog-cd
