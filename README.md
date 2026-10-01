# KaraokeTexty Lyrics Scraper

Rozšíření pro Chrome / Edge (Manifest V3), které z písňové stránky na
[KaraokeTexty.cz](https://www.karaoketexty.cz) vytáhne čistý text bez reklam,
fotogalerie a výzvy „Chceš vidět méně reklam? Registruj se“ a uloží ho jako `.txt`.

## Co umí

Na stránce `https://www.karaoketexty.cz/texty-pisni/<interpret>/<pisen>` se vpravo dole objeví tlačítka:

- **Uložit text** – originální text písně → `Interpret-Nazev.txt`
- **Uložit překlad** – jen pokud stránka překlad má → `Interpret-Nazev_preklad.txt`
- **Uložit text + překlad** – sloky originálu a překladu pod sebou, oddělené `---` → `Interpret-Nazev_text+preklad.txt`

Sloky jsou odděleny prázdným řádkem, uvnitř sloky je každý verš na vlastním řádku.

## Instalace

1. Otevři `chrome://extensions` (Edge: `edge://extensions`).
2. Zapni **Režim pro vývojáře**.
3. Klikni na **Načíst rozbalené** a vyber tuto složku.
4. Po úpravě souborů klikni u rozšíření na ikonu obnovení.

## Soubory

- `manifest.json` – definice rozšíření
- `content.js` – extrakce textu a tlačítka
- `style.css` – vzhled tlačítek a notifikace
- `icon48.png`, `icon128.png` – ikony

Sesterský doplněk pro Genius.com: [genius-lyrics-scraper](https://github.com/davehornik/genius-lyrics-scraper).
