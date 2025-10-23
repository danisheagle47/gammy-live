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
            emptyDesc: 'Inizia ad aggiungere giochi dalla ricerca!',
            yourRating: 'La tua valutazione'
        },
        wishlist: {
            title: 'La Mia Wishlist',
            empty: 'La tua wishlist è vuota',
            emptyDesc: 'Aggiungi i giochi che desideri giocare!'
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
            addButton: '+ Aggiungi Nota'
        },
        upcoming: {
            title: 'Giochi in Uscita',
            mostAnticipated: 'I Più Attesi'
        },
        calendar: {
            title: 'Calendario Uscite',
            months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                     'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
            days: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
            prev: '← Precedente',
            next: 'Successivo →'
        },
        news: {
            title: 'Ultime Notizie',
            readMore: 'Leggi di più'
        },
        gameDetail: {
            addToLibrary: 'Aggiungi alla Libreria',
            addToWishlist: 'Aggiungi alla Wishlist',
            removeFromLibrary: 'Rimuovi dalla Libreria',
            removeFromWishlist: 'Rimuovi dalla Wishlist',
            developer: 'Sviluppatore',
            releaseDate: 'Data di Uscita',
            platforms: 'Piattaforme',
            metacritic: 'Metacritic',
            rating: 'Valutazione',
            description: 'Descrizione',
            yourRating: 'La Tua Valutazione',
            notAvailable: 'Non disponibile'
        },
        common: {
            loading: 'Caricamento...',
            error: 'Si è verificato un errore',
            close: 'Chiudi'
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
            emptyDesc: 'Start adding games from search!',
            yourRating: 'Your rating'
        },
        wishlist: {
            title: 'My Wishlist',
            empty: 'Your wishlist is empty',
            emptyDesc: 'Add games you want to play!'
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
            addButton: '+ Add Entry'
        },
        upcoming: {
            title: 'Upcoming Games',
            mostAnticipated: 'Most Anticipated'
        },
        calendar: {
            title: 'Release Calendar',
            months: ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'],
            days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            prev: '← Previous',
            next: 'Next →'
        },
        news: {
            title: 'Latest News',
            readMore: 'Read more'
        },
        gameDetail: {
            addToLibrary: 'Add to Library',
            addToWishlist: 'Add to Wishlist',
            removeFromLibrary: 'Remove from Library',
            removeFromWishlist: 'Remove from Wishlist',
            developer: 'Developer',
            releaseDate: 'Release Date',
            platforms: 'Platforms',
            metacritic: 'Metacritic',
            rating: 'Rating',
            description: 'Description',
            yourRating: 'Your Rating',
            notAvailable: 'Not available'
        },
        common: {
            loading: 'Loading...',
            error: 'An error occurred',
            close: 'Close'
        }
    }
};

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('gammy-lang') || 'it';
        this.init();
    }
    
    init() {
        // Imposta lingua attiva nei pulsanti
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
            btn.addEventListener('click', () => this.setLanguage(btn.dataset.lang));
        });
        
        this.translate();
    }
    
    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('gammy-lang', lang);
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        this.translate();
        
        // Ricarica la pagina corrente per aggiornare i contenuti dinamici
        const currentPage = document.querySelector('.nav-link.active')?.dataset.page || 'library';
        if (window.app) {
            window.app.loadPage(currentPage);
        }
    }
    
    translate() {
        // Traduci elementi con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.get(key);
            if (translation) {
                element.textContent = translation;
            }
        });
        
        // Traduci placeholder
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
            value = value?.[k];
        }
        
        return value || key;
    }
    
    getLang() {
        return this.currentLang;
    }
}

// Inizializza i18n globalmente
window.i18n = new I18n();