import { CONFIG } from './config.mjs';
class Cat {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.CAT_SIZE;
        this.speedMultiplier = 1;
        this.vx = (Math.random() - 0.5) * CONFIG.CAT_SPEED * this.speedMultiplier;     // Katze bekommt eine zufällige Geschwindigkeit
        this.vy = (Math.random() - 0.5) * CONFIG.CAT_SPEED * this.speedMultiplier;
        this.color = color;
        this.energy = CONFIG.MAX_ENERGY;
        this.state = CONFIG.STATE_ACTIVE;
        this.hypnotizeProgress = 0;
        this.hearts = [];
        this.lightning = [];

        // Lade Katzenbilder
        this.images = {
            normal: new Image(),
            hypnotized: new Image(),
            sleeping: new Image()
        };
        this.images.normal.src = 'images/Katze.png';
        this.images.hypnotized.src = 'images/KatzeHypnose.png';
        this.images.sleeping.src = 'images/KatzeSchlafendLiegend2.png';
        
        this.imagesLoaded = false;
        let loadedCount = 0;
        Object.values(this.images).forEach(img => {
            img.onload = () => {
                loadedCount++;
                if (loadedCount === 3) {
                    this.imagesLoaded = true;
                }
            };
        });

    }
    
    update(canvasWidth, canvasHeight) {
        if (this.state === CONFIG.STATE_RESCUED) {
            return;
        }
        
        // ändert die Geschwindigkeit basierend auf dem Zustand
        const speed = this.state === CONFIG.STATE_HYPNOTIZED ? 0.3 : this.speedMultiplier;
        
        if (this.state === CONFIG.STATE_ACTIVE || this.state === CONFIG.STATE_HYPNOTIZED) {
            this.x += this.vx * speed;
            this.y += this.vy * speed;
            
            // Lässt die Katze an den Wänden abprallen
            if (this.x - this.size < 0 || this.x + this.size > canvasWidth) {
                this.vx *= -1;
                this.x = Math.max(this.size, Math.min(canvasWidth - this.size, this.x));
            }
            
            if (this.y - this.size < 0 || this.y + this.size > canvasHeight) {
                this.vy *= -1;
                this.y = Math.max(this.size, Math.min(canvasHeight - this.size, this.y));
            }
        }
        
        // Hypnotisierungsfortschritt aktualisieren
        if (this.state === CONFIG.STATE_HYPNOTIZED && this.hypnotizeProgress > 0) {
            const minHypnotizeDuration = 0.5; // Mindestens 50% der ursprünglichen Dauer
            const hypnotizeSpeed = Math.max(minHypnotizeDuration, 1 / this.speedMultiplier);    // Katze wacht nicht schneller als doppelt so schnell auf
            this.hypnotizeProgress -= 1 / hypnotizeSpeed;
            if (this.hypnotizeProgress <= 0) {
                this.state = CONFIG.STATE_ACTIVE;
                this.speedMultiplier = Math.min(this.speedMultiplier + 0.3, 2.5);   // Katze wird schneller wenn sie wieder aufwacht, aber nie schneller als 2.5x
                // Setzt neue Geschwindigkeit basierend auf dem speedMultiplier
                const angle = Math.atan2(this.vy, this.vx);
                this.vx = Math.cos(angle) * CONFIG.CAT_SPEED * this.speedMultiplier;
                this.vy = Math.sin(angle) * CONFIG.CAT_SPEED * this.speedMultiplier;
                this.energy = Math.min(CONFIG.MAX_ENERGY, this.energy + 20);
            }
        }

        // Animiert Herzchen wenn die Katze schläft
        this.hearts = this.hearts.filter(heart => {
            heart.x += heart.vx;
            heart.y += heart.vy;
            heart.life--;
            return heart.life > 0;
        });

        // Animiert Blitze wenn die Katze hyperaktiv ist
        if (this.speedMultiplier > 1.3 && this.state !== CONFIG.STATE_SLEEPING) {
            if (Math.random() < 0.3) {
                this.lightning.push({
                    x: this.x,
                    y: this.y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    life: 30,
                    size: 12 + Math.random() * 6
                });
            }
        }
        this.lightning = this.lightning.filter(bolt => {
            bolt.x += bolt.vx;
            bolt.y += bolt.vy;
            bolt.life--;
            return bolt.life > 0;
        });

    }
    
    // Kollisionsprüfung mit anderen Katzen
    checkCollision(otherCat) {
        if (otherCat === this || otherCat.state === CONFIG.STATE_RESCUED) {
            return false;
        }
        
        const dx = otherCat.x - this.x;
        const dy = otherCat.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Wenn sie sich berühren, prallen sie ab
        if (distance < this.size + otherCat.size) {
            const angle = Math.atan2(dy, dx);
            this.vx = -Math.cos(angle) * CONFIG.CAT_SPEED;
            this.vy = -Math.sin(angle) * CONFIG.CAT_SPEED;
            return true;
        }
        
        return false;
    }
    
    hypnotize() {
        if (this.state === CONFIG.STATE_ACTIVE) {
            this.state = CONFIG.STATE_HYPNOTIZED;
            this.hypnotizeProgress = CONFIG.HYPNOTIZE_DURATION;
            this.energy = Math.max(0, this.energy - CONFIG.HYPNOTIZE_ENERGY_DRAIN);
            return CONFIG.POINTS_HYPNOTIZE;
        }
        return 0;
    }
    
    cuddle() {
        if (this.state === CONFIG.STATE_HYPNOTIZED) {
            this.energy = Math.max(0, this.energy - CONFIG.CUDDLE_ENERGY_DRAIN);
            
            if (this.energy <= 0) {
                this.state = CONFIG.STATE_SLEEPING;

                // Herzchen erzeugen
                for (let i = 0; i < 5; i++) {
                    this.hearts.push({
                        x: this.x,
                        y: this.y,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -Math.random() * 3 - 1,
                        life: 60,
                        size: 20 + Math.random() * 4
                    });
                }
                
                // Katze wacht nach einer Weile wieder auf
                setTimeout(() => {
                    if (this.state === CONFIG.STATE_SLEEPING) {
                        this.state = CONFIG.STATE_ACTIVE;
                        this.energy = CONFIG.MAX_ENERGY;
                    }
                }, CONFIG.SLEEP_DURATION);
                
                return CONFIG.POINTS_SLEEPING;
            }
        }
        return 0;
    }
    
    rescue() {
        if (this.state === CONFIG.STATE_SLEEPING) {
            this.state = CONFIG.STATE_RESCUED;
            return CONFIG.POINTS_RESCUED;
        }
        return 0;
    }

    slowDown() {
        this.vx *= 0.3;
        this.vy *= 0.3;
    }

    speedUp() {
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed < CONFIG.CAT_SPEED * 0.5) {
            const angle = Math.atan2(this.vy, this.vx);
            this.vx = Math.cos(angle) * CONFIG.CAT_SPEED;
            this.vy = Math.sin(angle) * CONFIG.CAT_SPEED;
        }
    }
    
    // draw Funktion der Katze
    draw(ctx) {
        if (this.state === CONFIG.STATE_RESCUED) {
            return;
        }
        
        // Zeichne Blitze
        this.lightning.forEach(bolt => {
            ctx.save();
            ctx.globalAlpha = bolt.life / 30;
            ctx.fillStyle = '#ffff00';
            ctx.strokeStyle = '#ff8800';
            ctx.lineWidth = 1;
            ctx.font = `${bolt.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText('⚡', bolt.x, bolt.y);
            ctx.fillText('⚡', bolt.x, bolt.y);
            ctx.restore();
        });
        
        ctx.save();
        
        // Zittern bei hoher Geschwindigkeit (aber nicht beim Schlafen)
        if (this.speedMultiplier > 1.3 && this.state !== CONFIG.STATE_SLEEPING) {
            const shake = 3;
            ctx.translate(
                this.x + (Math.random() - 0.5) * shake,
                this.y + (Math.random() - 0.5) * shake
            );
        } else {
            ctx.translate(this.x, this.y);
        }
        
        // Wähle das richtige Bild basierend auf State
        let currentImage;
        if (this.imagesLoaded) {
            if (this.state === CONFIG.STATE_SLEEPING) {
                currentImage = this.images.sleeping;
            } else if (this.state === CONFIG.STATE_HYPNOTIZED) {
                currentImage = this.images.hypnotized;
            } else {
                currentImage = this.images.normal;
            }
            
            const imgSize = this.size * CONFIG.SIZE_MULTIPLIER;
            ctx.drawImage(currentImage, -imgSize/2, -imgSize/2, imgSize, imgSize);
        } else {
            // Fallback während Bilder laden
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // Energieanzeige als Batterie
        if (this.state !== CONFIG.STATE_SLEEPING) {
            const batteryWidth = this.size * 1.2;
            const batteryHeight = 10;
            const batteryX = this.x - batteryWidth / 2;
            const batteryY = this.y - this.size - 20;
            
            ctx.strokeStyle = '#2d3436';
            ctx.lineWidth = 2;
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(batteryX, batteryY, batteryWidth, batteryHeight);
            ctx.strokeRect(batteryX, batteryY, batteryWidth, batteryHeight);
            
            ctx.fillStyle = '#2d3436';
            ctx.fillRect(batteryX + batteryWidth, batteryY + 2, 3, batteryHeight - 4);
            
            const energyPercent = this.energy / CONFIG.MAX_ENERGY;
            const energyColor = energyPercent > 0.5 ? '#2ecc71' : 
                                energyPercent > 0.2 ? '#f39c12' : '#e74c3c';
            
            ctx.fillStyle = energyColor;
            const padding = 2;
            ctx.fillRect(
                batteryX + padding,
                batteryY + padding,
                (batteryWidth - padding * 2) * energyPercent,
                batteryHeight - padding * 2
            );
            
            if (this.speedMultiplier > 1.3) {
                ctx.fillStyle = '#ffff00';
                ctx.font = 'bold 16px Arial';
                ctx.fillText('⚡', batteryX + batteryWidth + 8, batteryY + batteryHeight - 2);
            }

            if (this.speedMultiplier >= CONFIG.MAX_SPEED_MULTIPLIER) {
                ctx.fillStyle = '#ff0000';
                ctx.font = 'bold 16px Arial';
                ctx.fillText('MAX', batteryX + batteryWidth + 8, batteryY + batteryHeight - 2);
            }
        }
        
        // Zeichne Herzchen
        this.hearts.forEach(heart => {
            ctx.save();
            ctx.globalAlpha = heart.life / 60;
            ctx.fillStyle = '#ff69b4';
            ctx.font = `${heart.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('♥', heart.x, heart.y);
            ctx.restore();
        });
    }

}

export { Cat };