// Sistema di internazionalizzazione - Aggiornato
const translations = {
    it: {
        nav: {
            library: 'Libreria',
            wishlist: 'Wishlist',
            diary: 'Diario di Gioco',
            upcoming: 'Più Attesi',
            calendar: 'Calendario',
            news: 'Notizie',
            reminders: 'Promemoria'
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
            editEntry: 'Modifica Nota',
            selectGame: 'Seleziona un gioco',
            titlePlaceholder: 'Titolo della sessione',
            contentPlaceholder: 'Racconta la tua esperienza...',
            save: 'Salva Nota',
            addButton: '+ Aggiungi Nota',
            rating: 'Voto',
            photos: 'Foto',
            edit: 'Modifica',
            delete: 'Elimina',
            confirmDelete: 'Sei sicuro di voler eliminare questa nota?'
        },
        upcoming: {
            title: 'Giochi Più Attesi',
            mostAnticipated: 'I Più Attesi',
            hype: 'Hype'
        },
        calendar: {
            title: 'Calendario Uscite',
            months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                     'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
            days: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
            prev: '← Precedente',
            next: 'Successivo →',
            gamesOnDay: 'giochi in uscita',
            viewAll: 'Vedi tutti'
        },
        news: {
            title: 'Ultime Notizie',
            readMore: 'Leggi di più',
            source: 'Fonte'
        },
        reminders: {
            title: 'I Miei Promemoria',
            empty: 'Nessun promemoria',
            emptyDesc: 'Aggiungi promemoria dai dettagli dei giochi!',
            daysLeft: 'giorni',
            today: 'Esce oggi!',
            tomorrow: 'Esce domani!',
            remove: 'Rimuovi',
            addReminder: 'Aggiungi Promemoria',
            removeReminder: 'Rimuovi Promemoria'
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
            notAvailable: 'Non disponibile',
            addReminder: 'Aggiungi Promemoria',
            removeReminder: 'Rimuovi Promemoria'
        },
        common: {
            loading: 'Caricamento...',
            error: 'Si è verificato un errore',
            close: 'Chiudi',
            save: 'Salva',
            cancel: 'Annulla'
        }
    },
    en: {
        nav: {
            library: 'Library',
            wishlist: 'Wishlist',
            diary: 'Game Diary',
            upcoming: 'Most Anticipated',
            calendar: 'Calendar',
            news: 'News',
            reminders: 'Reminders'
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
            editEntry: 'Edit Entry',
            selectGame: 'Select a game',
            titlePlaceholder: 'Session title',
            contentPlaceholder: 'Tell us about your experience...',
            save: 'Save Entry',
            addButton: '+ Add Entry',
            rating: 'Rating',
            photos: 'Photos',
            edit: 'Edit',
            delete: 'Delete',
            confirmDelete: 'Are you sure you want to delete this entry?'
        },
        upcoming: {
            title: 'Most Anticipated Games',
            mostAnticipated: 'Most Anticipated',
            hype: 'Hype'
        },
        calendar: {
            title: 'Release Calendar',
            months: ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'],
            days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            prev: '← Previous',
            next: 'Next →',
            gamesOnDay: 'releases',
            viewAll: 'View all'
        },
        news: {
            title: 'Latest News',
            readMore: 'Read more',
            source: 'Source'
        },
        reminders: {
            title: 'My Reminders',
            empty: 'No reminders',
            emptyDesc: 'Add reminders from game details!',
            daysLeft: 'days',
            today: 'Releases today!',
            tomorrow: 'Releases tomorrow!',
            remove: 'Remove',
            addReminder: 'Add Reminder',
            removeReminder: 'Remove Reminder'
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
            notAvailable: 'Not available',
            addReminder: 'Add Reminder',
            removeReminder: 'Remove Reminder'
        },
        common: {
            loading: 'Loading...',
            error: 'An error occurred',
            close: 'Close',
            save: 'Save',
            cancel: 'Cancel'
        }
    }
};

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('gammy-lang') || 'it';
        this.init();
    }
    
    init() {
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
        
        const currentPage = document.querySelector('.nav-link.active')?.dataset.page || 'library';
        if (window.app) {
            window.app.loadPage(currentPage);
        }
    }
    
    translate() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.get(key);
            if (translation) {
                element.textContent = translation;
            }
        });
        
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

window.i18n = new I18n();