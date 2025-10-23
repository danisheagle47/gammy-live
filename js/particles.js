// Animazione particelle nebulosa - Cinematic Purple Edition
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 100;
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2.5 + 0.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                color: this.getRandomColor(),
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            '94, 23, 235',    // Purple medium
            '181, 55, 242',   // Purple light
            '218, 119, 242',  // Purple glow
            '114, 9, 183',    // Purple dark
            '138, 43, 226'    // Blue violet
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle with glow effect
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            
            // Outer glow
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.radius * 3
            );
            gradient.addColorStop(0, `rgba(${particle.color}, ${particle.opacity})`);
            gradient.addColorStop(0.5, `rgba(${particle.color}, ${particle.opacity * 0.3})`);
            gradient.addColorStop(1, `rgba(${particle.color}, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Inner core
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity * 1.2})`;
            this.ctx.fill();
            
            // Draw connections
            for (let j = index + 1; j < this.particles.length; j++) {
                const dx = this.particles[j].x - particle.x;
                const dy = this.particles[j].y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 200) {
                    this.ctx.beginPath();
                    const lineOpacity = (1 - distance / 200) * 0.15;
                    this.ctx.strokeStyle = `rgba(${particle.color}, ${lineOpacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});