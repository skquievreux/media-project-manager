# Konzept: Intelligenter Ordner-Import & Auto-Renaming

## 1. Zielsetzung
Wenn ein bestehender Ordner (z.B. aus Downloads) als Projekt hinzugefügt wird, soll das System diesen **vollständig einlesen** und **automatisch strukturieren**.
Das Ziel ist eine standardisierte Projektstruktur ohne manuelles Sortieren.

## 2. Der "Smart Import" Workflow

### Phase 1: Analyse (Automatisches Einlesen)
*   **Trigger**: Beim Hinzufügen eines neuen Projektordners oder Klick auf "Smart Scan".
*   **Deep Scan**: Das System liest rekursiv **alle** Dateien ein.
*   **Mustererkennung**:
    *   Erkennen von `TRACK_XX` Ordnern.
    *   Erkennen von Keywords wie `Mix`, `Master`, `Stem`, `Demo`, `Video`.
    *   Erkennen von Dateitypen (.wav, .mp3, .png, .mp4).

### Phase 2: Strukturierung & Mapping
Die Dateien werden virtuell Kategorien zugeordnet:
*   **Tracks**: Inhalte aus `TRACK_01` bis `TRACK_99`.
*   **Mixes**: Inhalte aus `MIXES` Folder oder Dateien mit "Mix" im Namen.
*   **Concept**: PDFs, Textdateien.
*   **Artwork**: Bilder, Cover.

### Phase 3: Automatische Umbenennung (Auto-Renaming)
Das Kernstück der Anforderung. Dateien werden nach einem festen Schema umbenannt, um Konsistenz zu gewährleisten.

**Namenskonvention (Vorschlag):**
`[ProjektName] - [Kategorie] - [OriginalName].[Ext]`

*Beispiele:*
*   `TRACK_8/audio.wav` -> `TRACK_8/DonKey - Track 08 - audio.wav`
*   `Skizze.jpg` -> `CONCEPT/DonKey - Skizze.jpg`
*   `Final_Mix_v3.mp3` -> `MIXES/DonKey - Mix - v3.mp3`

### Phase 4: Physische Organisation (Optional)
*   Erstellen der Standard-Ordner (`STEMS`, `MIXES`, `REFERENCES`, `TRACKS`), falls diese fehlen.
*   Verschieben von "losen" Dateien in die passenden Ordner.

## 3. Technische Umsetzung

### Backend (Electron/Node.js)
Erweiterung der `main.js` um einen `smart-import` Handler:
1.  `fs.readdir` (rekursiv).
2.  Logik zur Analyse der Dateinamen.
3.  `fs.rename` Operationen (mit Konfliktprüfung, um Überschreiben zu verhindern).

### Frontend (React)
1.  **Import Dialog**: Zeigt eine Vorschau der Änderungen ("Diese 50 Dateien werden umbenannt").
2.  **One-Click Action**: "Struktur anwenden".
3.  **Ergebnis**: Die Ansicht im "Struktur"-Tab aktualisiert sich sofort.

## 4. Nächste Schritte
1.  Implementierung der Preview-Logik (Simulation der Umbenennung).
2.  UI-Komponente zur Bestätigung.
3.  Scharfschalten der Datei-Operationen.
