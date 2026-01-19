# 🚀 Media Project Manager - Startanleitung

## Schnellstart (Entwicklung)

### Option 1: .bat-Datei (Empfohlen für tägliche Nutzung)

Einfach **doppelklicken** auf:
```
start-mpm.bat
```

Die Datei:
- Prüft automatisch, ob Dependencies installiert sind
- Startet die App im Entwicklungsmodus
- Zeigt alle Logs im Konsolenfenster

**Tipp:** Du kannst die .bat-Datei auf den Desktop ziehen oder eine Verknüpfung erstellen!

### Option 2: Terminal

```bash
npm run electron
```

---

## Produktive .exe erstellen

### Voraussetzungen

1. **Icon erstellen** (optional, aber empfohlen):
   - Erstelle ein 256x256 PNG-Icon für deine App
   - Konvertiere es zu `.ico` (z.B. mit https://convertio.co/de/png-ico/)
   - Speichere es als `build/icon.ico`

2. **Dependencies installieren** (falls noch nicht geschehen):
   ```bash
   npm install
   ```

### Build-Befehle

#### 1. Installer + Portable .exe (Empfohlen)
```bash
npm run dist:win
```

**Erstellt:**
- `release/Media Project Manager Setup 1.6.1.exe` - Installer mit Desktop-Shortcut
- `release/MediaProjectManager-Portable-1.6.1.exe` - Portable .exe (keine Installation nötig)

#### 2. Nur Portable .exe
```bash
npm run dist:portable
```

**Erstellt:**
- `release/MediaProjectManager-Portable-1.6.1.exe` - Kann direkt gestartet werden

#### 3. Standard Build (alle Plattformen)
```bash
npm run dist
```

---

## Was passiert beim Build?

1. **Vite Build** (`npm run build`):
   - Kompiliert React-App → `dist/` Ordner
   - Optimiert und minifiziert Code

2. **Electron Builder**:
   - Packt Electron + deine App
   - Erstellt Windows-Installer (NSIS)
   - Erstellt portable .exe
   - Fügt Icon und Metadaten hinzu

---

## Ausgabe-Dateien

Nach dem Build findest du im `release/` Ordner:

```
release/
├── Media Project Manager Setup 1.6.1.exe    # Installer (ca. 80-120 MB)
├── MediaProjectManager-Portable-1.6.1.exe   # Portable (ca. 80-120 MB)
└── win-unpacked/                             # Entpackte App (für Tests)
    └── Media Project Manager.exe
```

### Installer vs. Portable

| Feature            | Installer     | Portable  |
| ------------------ | ------------- | --------- |
| Installation nötig | ✅ Ja          | ❌ Nein    |
| Desktop-Shortcut   | ✅ Automatisch | ❌ Manuell |
| Startmenü-Eintrag  | ✅ Ja          | ❌ Nein    |
| Updates            | ✅ Einfacher   | ⚠️ Manuell |
| USB-Stick nutzbar  | ❌ Nein        | ✅ Ja      |
| Größe              | ~80 MB        | ~80 MB    |

---

## Troubleshooting

### "Icon not found" Warnung
- Erstelle `build/icon.ico` oder entferne die Zeile aus `package.json`
- Electron Builder nutzt dann ein Standard-Icon

### Build schlägt fehl
```bash
# Cache löschen und neu bauen
rm -rf node_modules dist release
npm install
npm run dist:win
```

### App startet nicht nach Build
- Prüfe, ob `dist/` Ordner existiert und Dateien enthält
- Teste mit `npm run electron` im Dev-Modus

### Portable .exe wird von Antivirus blockiert
- Normal bei unsigned .exe-Dateien
- Lösung: Code-Signing-Zertifikat kaufen (~300€/Jahr)
- Oder: Antivirus-Ausnahme hinzufügen

---

## Nächste Schritte

### Auto-Updates einrichten
Für automatische Updates in der App:
1. GitHub Releases nutzen
2. `electron-updater` integrieren
3. Siehe: https://www.electron.build/auto-update

### Code Signing
Für professionelle Distribution:
1. Code-Signing-Zertifikat kaufen (z.B. DigiCert, Sectigo)
2. In `package.json` konfigurieren:
   ```json
   "win": {
     "certificateFile": "path/to/cert.pfx",
     "certificatePassword": "password"
   }
   ```

### macOS/Linux Support
```bash
npm run dist  # Baut für alle Plattformen
```

---

## Entwickler-Tipps

### Schneller Build-Zyklus
```bash
# Nur Build ohne Packaging (schneller)
npm run build

# Dann manuell testen
npm run electron
```

### Debug-Build
```bash
# Keine Komprimierung für schnellere Builds
cross-env DEBUG=electron-builder npm run dist:win
```

### Build-Größe reduzieren
- Ungenutzte Dependencies entfernen
- `asar` Archivierung aktiviert (Standard)
- Tree-shaking durch Vite (bereits aktiv)

---

## Versionen

- **Aktuelle Version:** 1.6.1 (aus `package.json`)
- **Electron:** 39.2.4
- **Vite:** 7.2.4
- **React:** 19.2.3

---

**Viel Erfolg mit deinem Media Project Manager! 🎬**
