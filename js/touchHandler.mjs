function TouchHandler(canvas) {
    const widgets = [];     // Liste der registrierten Touch-Widgets
    const touches = {};     // Aktive Touches mit ihren Positionen
    
    // Konvertiert Touch-Koordinaten in Canvas-Koordinaten
    function getTouchPos(touch) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY
        };
    }
    
    // canvas.addEventListener('touchstart', (ev) => {
    //     ev.preventDefault();
    //     for (let t of ev.changedTouches) {
    //         const pos = getTouchPos(t);
    //         touches[t.identifier] = pos;
    //         widgets.forEach(w => w.isTouched(t.identifier, pos.x, pos.y, touches));
    //     }
    // });

    canvas.addEventListener('touchstart', (ev) => {
        ev.preventDefault();
        
        for (let t of ev.changedTouches) {
            const pos = getTouchPos(t);
            touches[t.identifier] = pos;
            
            // Alle Widgets benachrichtigen über neuen Touch
            widgets.forEach((w, index) => {
                w.isTouched(t.identifier, pos.x, pos.y, touches);
            });
        }
    });
    
    canvas.addEventListener('touchmove', (ev) => {
        ev.preventDefault();
        for (let t of ev.changedTouches) {
            const pos = getTouchPos(t);
            touches[t.identifier] = pos;
            widgets.forEach(w => w.move(t.identifier, pos.x, pos.y, touches));
        }
    });
    
    canvas.addEventListener('touchend', (ev) => {
        ev.preventDefault();
        for (let t of ev.changedTouches) {
            widgets.forEach(w => w.reset(t.identifier, touches));
            delete touches[t.identifier];
        }
    });
    
    function addTouchWidget(widget) {
        if (typeof widget.isTouched === 'function' && 
            typeof widget.reset === 'function' && 
            typeof widget.move === 'function') {
            widgets.push(widget);
        } else {
            console.error('Ein Touch-Widget muss die Methoden isTouched, reset und move implementieren.');
        }
    }
    
    return { addTouchWidget };
}

export { TouchHandler };