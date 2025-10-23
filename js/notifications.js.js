// Sistema di Notifiche e Reminder
class NotificationSystem {
    constructor() {
        this.reminders = JSON.parse(localStorage.getItem('gammy-reminders')) || [];
        this.checkPermission();
        this.startChecking();
    }
    
    checkPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    
    addReminder(game) {
        const exists = this.reminders.find(r => r.gameId === game.id);
        if (exists) {
            return false;
        }
        
        const releaseDate = game.released || game.releaseDate;
        if (!releaseDate) {
            alert('Data di uscita non disponibile');
            return false;
        }
        
        const reminder = {
            id: Date.now(),
            gameId: game.id,
            gameName: game.name,
            gameImage: game.background_image || game.cover,
            releaseDate: releaseDate,
            notifyBeforeDays: 1,
            created: new Date().toISOString()
        };
        
        this.reminders.push(reminder);
        this.save();
        return true;
    }
    
    removeReminder(gameId) {
        this.reminders = this.reminders.filter(r => r.gameId !== gameId);
        this.save();
    }
    
    hasReminder(gameId) {
        return this.reminders.some(r => r.gameId === gameId);
    }
    
    getReminders() {
        return this.reminders.sort((a, b) => 
            new Date(a.releaseDate) - new Date(b.releaseDate)
        );
    }
    
    getDaysUntilRelease(releaseDate) {
        const now = new Date();
        const release = new Date(releaseDate);
        const diff = release - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    
    startChecking() {
        // Controlla ogni ora
        setInterval(() => this.checkReminders(), 1000 * 60 * 60);
        // Controlla anche all'avvio
        setTimeout(() => this.checkReminders(), 5000);
    }
    
    checkReminders() {
        this.reminders.forEach(reminder => {
            const daysLeft = this.getDaysUntilRelease(reminder.releaseDate);
            
            if (daysLeft === 1 && this.shouldNotify(reminder)) {
                this.sendNotification(reminder, 'Esce domani!');
            } else if (daysLeft === 0 && this.shouldNotify(reminder)) {
                this.sendNotification(reminder, 'Esce oggi!');
            }
        });
    }
    
    shouldNotify(reminder) {
        const lastNotified = localStorage.getItem(`notified-${reminder.id}`);
        if (!lastNotified) return true;
        
        const lastDate = new Date(lastNotified);
        const now = new Date();
        const daysDiff = (now - lastDate) / (1000 * 60 * 60 * 24);
        
        return daysDiff >= 1;
    }
    
    sendNotification(reminder, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🎮 Gammy - Promemoria Gioco', {
                body: `${reminder.gameName} - ${message}`,
                icon: reminder.gameImage || '/favicon.ico',
                badge: '/favicon.ico',
                tag: `reminder-${reminder.id}`
            });
            
            localStorage.setItem(`notified-${reminder.id}`, new Date().toISOString());
        }
    }
    
    save() {
        localStorage.setItem('gammy-reminders', JSON.stringify(this.reminders));
    }
}

window.notifications = new NotificationSystem();