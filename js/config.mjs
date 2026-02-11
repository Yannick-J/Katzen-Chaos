// Konfiguration
const CONFIG = {
    // Canvas
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    LEVELS: [
        {
            name: 'Wohnzimmer',
            background: 'images/HintergrundWohnzimmer.png',
            catsToRescue: 3,
            catCount: 3
        },
        {
            name: 'Bad',
            background: 'images/HintergrundBad.png',
            catsToRescue: 4,
            catCount: 4
        }
    ],
    
    // Katzen Einstellungen
    CAT_SIZE: 40,
    CAT_SPEED: 2,
    CAT_COLORS: ['#ff6b6b', '#4ecdc4', '#f9ca24', '#6c5ce7', '#fd79a8'],
    
    // Zustände der Katzen
    STATE_ACTIVE: 'active',
    STATE_HYPNOTIZED: 'hypnotized',
    STATE_SLEEPING: 'sleeping',
    STATE_RESCUED: 'rescued',
    
    // Energielevel
    MAX_ENERGY: 100,
    HYPNOTIZE_ENERGY_DRAIN: 5,
    CUDDLE_ENERGY_DRAIN: 10,
    HYPNOTIZE_DURATION: 200, // frames bis Katze wieder aktiv wird
    SLEEP_DURATION: 3000,   // ms bis Katze wieder aufwacht
    
    // Touch Interaktion
    ROTATION_THRESHOLD: Math.PI / 3, // benötigte Rotation
    PINCH_THRESHOLD: 20, // benötigter "Pinch" Abstand in Pixeln
    
    // Körbchen Einstellungen
    BASKET_SIZE: 50,
    BASKET_COLOR: '#8e44ad',
    
    INITIAL_CAT_COUNT: 3,
    TARGET_RESCUED: 3,
    GAME_TIME: 60, // sekunden
    
    // Score
    POINTS_HYPNOTIZE: 10,
    POINTS_SLEEPING: 50,
    POINTS_RESCUED: 100,

    SIZE_MULTIPLIER: 2.5,
    
    // Level Progression
    CATS_PER_LEVEL: 1 // zusätzliche Katze pro Level
};

export { CONFIG };