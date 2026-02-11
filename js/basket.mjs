import { CONFIG } from './config.mjs';

class Basket {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.BASKET_SIZE;
        this.color = CONFIG.BASKET_COLOR;

        this.image = new Image();
        this.image.src = 'images/Korb.png';
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }
    
    // checkt ob Katze im Körbchen ist
    contains(cat) {
        const dx = cat.x - this.x;
        const dy = cat.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size;
    }
    
    // draw Funktion des Körbchens
    draw(ctx) {
        if (this.imageLoaded) {
            // Zeichne Bild
            ctx.drawImage(
                this.image,
                this.x - this.size,
                this.y - this.size,
                this.size * 2,
                this.size * 2
            );
        } else {
            // Körbchen Umriss
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Körbchen Füllung
            ctx.fillStyle = 'rgba(142, 68, 173, 0.2)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Körbchen Text
            ctx.fillStyle = this.color;
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('KORB', this.x, this.y);
        }
    }
}

export { Basket };