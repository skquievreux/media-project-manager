# Media Project Manager (MPM)

![Version](https://img.shields.io/badge/version-1.5.3-blue.svg)
![Electron](https://img.shields.io/badge/Electron-Desktop-orange.svg)
![Feature](https://img.shields.io/badge/feature-Audio_Visualizer-purple.svg)
![Language](https://img.shields.io/badge/language-Deutsch-red.svg)

## 📄 Über das Projekt

Der **Media Project Manager (MPM)** ist eine spezialisierte Desktop-Anwendung zur Verwaltung komplexer Medienproduktionen. Sie wurde entwickelt, um den Workflow von Agenturen und Freelancern zu standardisieren, die mit Audio-, Video- und Foto-Projekten arbeiten.

Das Ziel der Anwendung ist es, die Lücke zwischen Dateisystem (Explorer/Finder) und Projektmanagement zu schließen. Anstatt Projekte manuell zu verwalten, scannt der MPM intelligente Ordnerstrukturen und visualisiert den Status, die Assets und den Fortschritt jedes Projekts in einer modernen, dunklen Benutzeroberfläche.

### 🎯 Kernprobleme, die wir lösen
*   **Verlorene Übersicht:** Bei hunderten von Projektordnern geht der Überblick über den Status schnell verloren.
*   **Medien-Chaos:** Assets (Bilder, Videos) liegen verstreut in Unterordnern.
*   **Manuelle Prozesse:** Das Zählen von Tracks oder das Prüfen auf Vorhandensein notwendiger Schritte kostet Zeit.

## 🚀 Hauptfunktionen (v1.5.2)

### 1. 🪄 Smart Templates & Workflows
Starten Sie neue Projekte blitzschnell mit vordefinierten Schablonen für verschiedene Medientypen (Single Song, Album, Kinderbuch, Werbespot). Jedes Template enthält automatisch alle notwendigen Tasks und Milestones.

### 2. 📋 Advanced Task-Tracking
Verwalten Sie Ihre Aufgaben präzise:
*   **Bearbeiten:** Passen Sie Aufgabennamen und geschätzte Zeiten direkt an.
*   **Zeit-Tracking:** Erfassen Sie die tatsächliche Arbeitszeit.
*   **Flexibilität:** Starten Sie abgeschlossene Aufgaben neu oder überspringen Sie unnötige Schritte.
*   **Integration:** Quick-Links zu Tools wie Suno, Transkriptor oder Canva direkt in der Aufgabe.

### 3. Intelligente Projekt-Erkennung
Die App arbeitet nahtlos mit Ihrer bestehenden Ordnerstruktur zusammen. Sie erkennt Projekte basierend auf Namenskonventionen (`Typ-Name`, z.B. `Album-SommerHits`) und analysiert automatisch den Inhalt.

### 4. Desktop-Integration & Ressourcen
*   **Lokaler Zugriff:** Basiert auf Electron für direkten, performanten Zugriff auf die Festplatte.
*   **Asset-Scan:** Automatische Indizierung von Medien (JPG, MP3, MP4) im Projektordner.
*   **Inline-Editing:** Bearbeiten Sie Projektdetails direkt in der Oberfläche.

## 🛠️ Technischer Stack

*   **Frontend:** React, Vite, CSS Modules (Modernes Dark-Theme)
*   **Backend/Desktop:** Electron (IPC Communication)
*   **Datenbank:** Lokale JSON-Persistenz (`projects.json`)
*   **Sprache:** JavaScript (ES6+)

## 🔄 Workflow für Entwickler & Feature-Branches

Wir setzen auf einen Feature-Branch-Workflow. Das Repository ist so konfiguriert, dass neue Funktionen isoliert entwickelt und getestet werden können.

### Branching-Strategie
*   `main`: Der stabile Produktions-Code.
*   `feature/name-des-features`: Für neue Entwicklungen (z.B. `feature/cloud-sync`, `feature/drag-drop`).

### CI/CD (GitHub Actions)
Wir haben Workflows eingerichtet, um die Qualität sicherzustellen:
1.  **CI (Continuous Integration):** Bei jedem Push auf einen Feature-Branch oder Pull Request wird der Code automatisch gebaut (`npm run build`), um Fehler frühzeitig zu erkennen.
2.  **Release:** Beim Erstellen eines Tags (z.B. `v1.2.0`) kann optional ein Release-Build angestoßen werden.

## 🚀 Installation & Setup

1.  **Repository klonen:**
    ```bash
    git clone https://github.com/skquievreux/media-project-manager.git
    cd media-project-manager
    ```

2.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    ```

3.  **App starten:**
    ```bash
    npm run electron
    ```

## 🤝 Mitwirken

1.  Erstellen Sie einen Feature-Branch (`git checkout -b feature/MeinFeature`).
2.  Implementieren Sie Ihre Änderungen.
3.  Pushen Sie den Branch (`git push origin feature/MeinFeature`).
4.  Erstellen Sie einen Pull Request auf GitHub.

## 📄 Lizenz

Internes Projekt. Alle Rechte vorbehalten.
