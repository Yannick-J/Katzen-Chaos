# Katzen-Chaos

Ein interaktives Mobile-Spiel, bei dem Katzen durch Touch-Gesten hypnotisiert, gestreichelt und in Körbe gerettet werden müssen. Entwickelt im Rahmen des Kurses Mensch-Computer-Interaktion 2 an der Hochschule Esslingen.

## Screenshots

<p align="center">
  <img src="screenshots/tutorialHD.png" width="300" alt="Tutorial">
</p>

<p align="center">
  <img src="screenshots/level1HD.png" width="350" alt="Level 1 - Wohnzimmer">
  <img src="screenshots/level2HD.png" width="350" alt="Level 2 - Bad">
</p>
## Technologien

- JavaScript (ES6 Modules)
- Touch Events API
- Canvas

## Installation

Mit VS Code:
- Extension "Live Server" installieren
- Rechtsklick auf `index.html` → "Open with Live Server"

Alternativ über Terminal:
```bash
npx serve .
```

Dann auf dem Smartphone öffnen oder in den Browser-DevTools mit Touch-Emulation spielen.

## Spielanleitung

### Ziel
Rette die angegebene Anzahl von Katzen pro Level, indem du sie ins Körbchen ziehst.

### Steuerung

**1. Katze hypnotisieren (2 Finger):**
- Platziere zwei Finger auf einer aktiven Katze
- Drehe die Finger kreisförmig um die Katze
- Die Katze bekommt Spiral-Augen und wird langsamer

**2. Katze streicheln (2 Finger - Pinch):**
- Hypnotisierte Katze mit zwei Fingern berühren
- Finger zusammenführen (Pinch-Geste)
- Die Katze schläft ein und zeigt Herzen

**3. Katze retten (1 Finger):**
- Schlafende Katze mit einem Finger anfassen
- Zur Mitte des Körbchens ziehen
- Loslassen um Katze zu retten

### Levels

1. Tutorial-Screen erklärt die Mechaniken
2. Level 1: Wohnzimmer - Rette 3 Katzen
3. Level 2: Bad - Rette 4 Katzen
4. Endscreen mit Gesamtpunkten

### Punktesystem

| Aktion | Punkte |
|--------|--------|
| Hypnotisieren | 10 |
| Einschläfern | 50 |
| Retten | 100 |

### Besonderheiten

- Katzen werden nach jedem Aufwachen schneller (bis zu einem Maximum)
- Energieanzeige über jeder Katze (Batterie-Symbol)
- Blitz-Symbol bei sehr schnellen Katzen
