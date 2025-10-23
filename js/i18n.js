// Sistema di internazionalizzazione
const translations = {
    it: {
        nav: {
            library: 'Libreria',
            wishlist: 'Wishlist',
            diary: 'Diario di Gioco',
            upcoming: 'In Uscita',
            calendar: 'Calendario',
            news: 'Notizie'
        },
        search: {
            placeholder: 'Cerca un gioco...',
            button: 'Cerca',
            results: 'Risultati della Ricerca',
            noResults: 'Nessun risultato trovato'
        },
        library: {
            title: 'La Mia Libreria',
            empty: 'La tua libreria è vuota',
            emptyDesc: 'Inizia cercando i tuoi giochi preferiti e aggiungili alla tua collezione!'
        },
        wishlist: {
            title: 'La Mia Wishlist',
            empty: 'La tua wishlist è vuota',
            emptyDesc: 'Aggiungi i giochi che desideri acquistare!'
        },
        diary: {
            title: 'Diario di Gioco',
            empty: 'Nessuna nota nel diario',
            emptyDesc: 'Inizia a documentare le tue sessioni di gioco!',
            addEntry: 'Aggiungi Nota',
            selectGame: 'Seleziona un gioco',
            titlePlaceholder: 'Titolo della sessione',
            contentPlaceholder: 'Racconta la tua esperienza...',
            save: 'Salva Nota',
            delete: 'Elimina'
        },
        upcoming: {
            title: 'Giochi in Uscita',
            loading: 'Caricamento...'
        },
        calendar: {
            title: 'Calendario Uscite',
            months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                     'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
            days: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
        },
        news: {
            title: 'Ultime Notizie',
            readMore: 'Leggi di più'
        },
        game: {
            addToLibrary: 'Aggiungi alla Libreria',
            addToWishlist: 'Aggiungi alla Wishlist',
            removeFromLibrary: 'Rimuovi dalla Libreria',
            removeFromWishlist: 'Rimuovi dalla Wishlist',
            inLibrary: 'Nella Libreria',
            inWishlist: 'Nella Wishlist',
            platforms: 'Piattaforme',
            releaseDate: 'Data di Uscita',
            developer: 'Sviluppatore',
            metacritic: 'Metacritic',
            yourRating: 'La Tua Valutazione',
            description: 'Descrizione'
        }
    },
    en: {
        nav: {
            library: 'Library',
            wishlist: 'Wishlist',
            diary: 'Game Diary',
            upcoming: 'Upcoming',
            calendar: 'Calendar',
            news: 'News'
        },
        search: {
            placeholder: 'Search for a game...',
            button: 'Search',
            results: 'Search Results',
            noResults: 'No results found'
        },
        library: {
            title: 'My Library',
            empty: 'Your library is empty',
            emptyDesc: 'Start by searching for your favorite games and add them to your collection!'
        },
        wishlist: {
            title: 'My Wishlist',
            empty: 'Your wishlist is empty',
            emptyDesc: 'Add games you want to purchase!'
        },
        diary: {
            title: 'Game Diary',
            empty: 'No diary entries',
            emptyDesc: 'Start documenting your gaming sessions!',
            addEntry: 'Add Entry',
            selectGame: 'Select a game',
            titlePlaceholder: 'Session title',
            contentPlaceholder: 'Tell us about your experience...',
            save: 'Save Entry',
            delete: 'Delete'
        },
        upcoming: {
            title: 'Upcoming Games',
            loading: 'Loading...'
        },
        calendar: {
            title: 'Release Calendar',
            months: ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'],
            days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        },
        news: {
            title: 'Latest News',
            readMore: 'Read more'
        },
        game: {
            addToLibrary: 'Add to Library',
            addToWishlist: 'Add to Wishlist',
            removeFromLibrary: 'Remove from Library',
            removeFromWishlist: 'Remove from Wishlist',
            inLibrary: 'In Library',
            inWishlist: 'In Wishlist',
            platforms: 'Platforms',
            releaseDate: 'Release Date',
            developer: 'Developer',
            metacritic: 'Metacritic',
            yourRating: 'Your Rating',
            description: 'Description'
        }
    }
};

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('gammy_language') || 'it';
        this.init();
    }
    
    init() {
        // Set active language button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
            
            btn.addEventListener('click', () => {
                this.setLanguage(btn.dataset.lang);
            });
        });
        
        this.translate();
    }
    
    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('gammy_language', lang);
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        this.translate();
        
        // Trigger custom event for language change
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
    
    translate() {
        // Translate text content
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.get(key);
            if (translation) {
                element.textContent = translation;
            }
        });
        
        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.dataset.i18nPlaceholder;
            const translation = this.get(key);
            if (translation) {
                element.placeholder = translation;
            }
        });
    }
    
    get(key) {
        const keys = key.split('.');
        let value = translations[this.currentLang];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return null;
            }
        }
        
        return value;
    }
    
    getLang() {
        return this.currentLang;
    }
}

// Export instance
const i18n = new I18n();