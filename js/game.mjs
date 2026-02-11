import { CONFIG } from './config.mjs';
import { Cat } from './cat.mjs';
import { Basket } from './basket.mjs';
import { TouchHandler } from './touchHandler.mjs';

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.cats = [];
        this.baskets = [];
        this.score = 0;
        this.rescued = 0;
        this.level = 0;
        this.targetRescued = CONFIG.LEVELS[this.level].catsToRescue;
        this.gameRunning = false;

        // Lädt Hintergrundbilder
        this.backgroundImages = [];
        CONFIG.LEVELS.forEach((levelData, index) => {
            const img = new Image();
            img.src = levelData.background;
            this.backgroundImages[index] = img;
        });
        
        // Setup
        this.setupCanvas();
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.createBaskets();
        this.createCats(CONFIG.LEVELS[this.level].catCount);;
        this.setupTouchHandler();

        // resize-handler
        window.addEventListener('resize', () => this.handleResize());
              
        // startet game loop wenn Start-Button geklickt wird
        this.gameRunning = false;
        document.getElementById('playButton').addEventListener('click', () => {
            document.getElementById('tutorialScreen').style.display = 'none';
            document.getElementById('gameCanvas').style.display = 'block';
            document.getElementById('ui').style.display = 'flex'; 
            this.gameRunning = true;
            this.gameLoop();
        });

        // Restart-Button
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });

    }
    
    // Setup für responsive Design
    setupCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = window.innerHeight;
        
        // Mobile
        if (window.innerWidth < 768) {
            this.canvas.width = containerWidth - 10; // Padding
            const availableHeight = containerHeight - 80;
            this.canvas.height = Math.max(400, availableHeight); // Minimum 400px
        } 
        // Tablet
        else if (window.innerWidth < 1024) {
            this.canvas.width = Math.min(containerWidth - 40, 700);
            this.canvas.height = Math.min(containerHeight - 150, 700);
        }
        // Desktop
        else {
            this.canvas.width = Math.min(containerWidth - 40, 800);
            this.canvas.height = Math.min(containerHeight - 150, 800);
        }
        
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
    }

    handleResize() {
        this.setupCanvas();
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;

        this.baskets = [];
        this.createBaskets();
    }
    
    createBaskets() {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        this.baskets.push(new Basket(centerX, centerY));
    }
    
    createCats(count) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * (this.canvasWidth - 100) + 50;
            const y = Math.random() * (this.canvasHeight - 100) + 50;
            const color = CONFIG.CAT_COLORS[i % CONFIG.CAT_COLORS.length];
            this.cats.push(new Cat(x, y, color));
        }
    }
    
    setupTouchHandler() {
        
        this.touchHandler = TouchHandler(this.canvas);

        
        // Referenz auf Game für die Widgets
        const game = this;
        
        // Geteilte selectedCat Variable für beide Widgets
        let selectedCat2Finger = null;
        let selectedCat1Finger = null;
        
        // Interaktions-Widget für 2-Finger-Gesten (Rotation & Pinch)
        const twoFingerWidget = {
            lastRotation: 0,
            totalRotation: 0,
            initialPinchDist: 0,
            
            isTouched: (id, x, y, touches) => {
                const touchArray = Object.values(touches);

                
                if (touchArray.length === 2) {

                    
                    // Zwei Finger: Finde Katze zwischen den Fingern
                    const centerX = (touchArray[0].x + touchArray[1].x) / 2;
                    const centerY = (touchArray[0].y + touchArray[1].y) / 2;
                    
                    selectedCat2Finger = game.findCatAt(centerX, centerY);
                    
                    if (selectedCat2Finger) {

                        
                        // Katze verlangsamen für bessere Kontrolle
                        selectedCat2Finger.slowDown();
                        
                        const dx = touchArray[1].x - touchArray[0].x;
                        const dy = touchArray[1].y - touchArray[0].y;
                        this.lastRotation = Math.atan2(dy, dx);
                        this.totalRotation = 0;
                        this.initialPinchDist = Math.sqrt(dx * dx + dy * dy);
                    }
                }
            },
            
            move: (id, x, y, touches) => {
                const touchArray = Object.values(touches);
                
                if (touchArray.length === 2 && selectedCat2Finger) {
                    const dx = touchArray[1].x - touchArray[0].x;
                    const dy = touchArray[1].y - touchArray[0].y;
                    const currentRotation = Math.atan2(dy, dx);
                    const currentDist = Math.sqrt(dx * dx + dy * dy);
                    
                    // Rotation erkennen
                    let rotationDelta = currentRotation - this.lastRotation;
                    if (rotationDelta > Math.PI) rotationDelta -= 2 * Math.PI;
                    if (rotationDelta < -Math.PI) rotationDelta += 2 * Math.PI;
                    this.totalRotation += Math.abs(rotationDelta);
                    this.lastRotation = currentRotation;
                    
                    // Pinch erkennen
                    const pinchDelta = this.initialPinchDist - currentDist;
                    
                    // Hypnotisieren durch Rotation
                    if (this.totalRotation > CONFIG.ROTATION_THRESHOLD && 
                        selectedCat2Finger.state === CONFIG.STATE_ACTIVE) {
                        const points = selectedCat2Finger.hypnotize();
                        game.addScore(points);
                        this.totalRotation = 0;
                    }
                    
                    // Streicheln durch Pinch
                    if (pinchDelta > CONFIG.PINCH_THRESHOLD && 
                        selectedCat2Finger.state === CONFIG.STATE_HYPNOTIZED) {
                        const points = selectedCat2Finger.cuddle();
                        game.addScore(points);
                        this.initialPinchDist = currentDist;
                    }
                }
            },
            
            reset: (id, touches) => {
                if (Object.keys(touches).length === 0) {
                    if (selectedCat2Finger) {

                        // Katze wieder auf normale Geschwindigkeit
                        selectedCat2Finger.speedUp();
                    }
                    selectedCat2Finger = null;
                }
            }
        };
        
        // Drag-Widget für 1-Finger-Geste (Katze ziehen)
        const dragWidget = {
            isTouched: (id, x, y, touches) => {
                const touchArray = Object.values(touches);

                
                if (touchArray.length === 1) {

                    
                    // Ein Finger: Finde schlafende Katze
                    const foundCat = game.findCatAt(x, y);

                    
                    selectedCat1Finger = foundCat;
                    
                    if (selectedCat1Finger) {

                        
                        if (selectedCat1Finger.state !== CONFIG.STATE_SLEEPING) {

                            selectedCat1Finger = null;
                        }
                    }
                }
            },
            
            move: (id, x, y, touches) => {
                const touchArray = Object.values(touches);
                
                if (touchArray.length === 1 && selectedCat1Finger && 
                    selectedCat1Finger.state === CONFIG.STATE_SLEEPING) {
                    // Katze an Finger-Position ziehen
                    selectedCat1Finger.x = x;
                    selectedCat1Finger.y = y;
                }
            },
            
            reset: (id, touches) => {
                if (selectedCat1Finger && selectedCat1Finger.state === CONFIG.STATE_SLEEPING) {

                    
                    // Prüfe ob Katze in einem Korb ist
                    let inBasket = false;
                    game.baskets.forEach(basket => {
                        if (basket.contains(selectedCat1Finger)) {
                            const points = selectedCat1Finger.rescue();
                            game.addScore(points);
                            game.rescued++;
                            game.updateUI();
                            const margin = game.baskets[0].size;        // Setzt neues Körbchen an zufälliger Position nachdem eine Katze gerettet wurde
                            const newX = margin + Math.random() * (game.canvasWidth - 1.5 * margin);
                            const newY = margin + Math.random() * (game.canvasHeight - 1.5 * margin);
                            game.baskets[0].x = newX;
                            game.baskets[0].y = newY;
                            inBasket = true;
                            
                            if (game.rescued >= game.targetRescued) {
                                game.levelComplete();
                            }
                        }
                    });
                }
                
                if (Object.keys(touches).length === 0) {
                    selectedCat1Finger = null;
                }
            }
        };
        
        // Widgets registrieren
        this.touchHandler.addTouchWidget(twoFingerWidget);
        this.touchHandler.addTouchWidget(dragWidget);
    }
    
    findCatAt(x, y) {

        for (let cat of this.cats) {
            if (cat.state === CONFIG.STATE_RESCUED) continue;
            
            const dx = cat.x - x;
            const dy = cat.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const hitRadius = cat.size * CONFIG.SIZE_MULTIPLIER/2;

            if (distance < hitRadius) {
                return cat;
            }
        }
        return null;
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('rescued').textContent = this.rescued;
        document.getElementById('target').textContent = this.targetRescued;
        document.getElementById('level').textContent = this.level + 1;
    }
   
    gameLoop() {
        if (!this.gameRunning) return;
        
        // cleart den Canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Zeichne Hintergrundbild des aktuellen Levels
        if (this.backgroundImages[this.level] && this.backgroundImages[this.level].complete) {
            this.ctx.drawImage(this.backgroundImages[this.level], 0, 0, this.canvasWidth, this.canvasHeight);
        } else {
            this.ctx.fillStyle = '#fff9e6';
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
        
        // updatet die Katzen
        this.cats.forEach(cat => {
            cat.update(this.canvasWidth, this.canvasHeight);
        });

        // checkt Kollisionen mit anderen Katzen
        for (let i = 0; i < this.cats.length; i++) {
            for (let j = i + 1; j < this.cats.length; j++) {
                // Prüfe Kollision zwischen Katze i und j
                if (this.cats[i].checkCollision(this.cats[j])) {
                    // Wenn Kollision, stoße auch die andere Katze ab
                    this.cats[j].checkCollision(this.cats[i]);
                }
            }
        }
        
        // drawt die Körbchen
        this.baskets.forEach(basket => basket.draw(this.ctx));
        
        // drawt die Katzen
        this.cats.forEach(cat => cat.draw(this.ctx));
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    levelComplete() {
        this.gameRunning = false;
        
        // Prüfe ob es noch weitere Level gibt
        if (this.level < CONFIG.LEVELS.length - 1) {
            this.level++;
            this.nextLevel();
        } else {
            this.showEndScreen();
        }
    }

    nextLevel() {
        this.rescued = 0;
        this.targetRescued = CONFIG.LEVELS[this.level].catsToRescue;
        this.cats = [];
        this.createCats(CONFIG.LEVELS[this.level].catCount);
        this.gameRunning = true;
        this.updateUI();
    }
        
    showEndScreen() {
        // Verstecke Canvas und UI
        document.getElementById('gameCanvas').style.display = 'none';
        document.getElementById('ui').style.display = 'none';
        
        // Zeige Endscreen mit finalen Punkten
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('endScreen').style.display = 'flex';
    }

    restartGame() {        
        // Verstecke Endscreen
        document.getElementById('endScreen').style.display = 'none';
        
        // WICHTIG: Zuerst alles komplett zurücksetzen
        this.gameRunning = false;
        
        // Reset alle Werte auf Level 1
        this.level = 0;
        this.score = 0;
        this.rescued = 0;
        this.targetRescued = CONFIG.LEVELS[0].catsToRescue;
        
        // Leere Arrays komplett
        this.cats = [];
        this.baskets = [];
        
        // Erstelle alles neu
        this.createBaskets();
        this.createCats(CONFIG.LEVELS[0].catCount);
        
        // Zeige Canvas und UI
        document.getElementById('gameCanvas').style.display = 'block';
        document.getElementById('ui').style.display = 'flex';
        
        // Update UI und starte Spiel
        this.updateUI();
        this.gameRunning = true;
        this.gameLoop();
    }
    
}

export { Game };