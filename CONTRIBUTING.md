# Contributing Guide

Willkommen im Team! Wir freuen uns, dass du mitarbeiten möchtest.
Um die Entwicklung strukturiert und übersichtlich zu halten, arbeiten wir nach einem **Issue-Driven Workflow**.

## 🔄 Der Workflow

Jede Code-Änderung beginnt mit einem Ticket (Issue).

1.  **Issue erstellen:**
    *   Beschreibe den Bug oder das Feature in einem neuen GitHub Issue.
    *   Merke dir die **Issue-Nummer** (z.B. `#42`).

2.  **Branch erstellen:**
    *   Erstelle einen Branch, der die Issue-Nummer im Namen trägt.
    *   Schema: `typ/NUMMER-kurzbeschreibung`
    *   Beispiel: `feat/42-folder-view` oder `fix/15-explorer-bug`

3.  **Code schreiben & Testen:**
    *   Implementiere deine Änderungen.
    *   Teste lokal mit `npm run electron`.

4.  **Committen:**
    *   Nutze aussagekräftige Commit-Messages (siehe unten).
    *   Referenziere das Issue, wenn möglich.

5.  **Pull Request (PR) erstellen:**
    *   Erstelle einen PR auf `main` (oder den entsprechenden Release-Branch).
    *   Nutze "Magic Words" im PR-Text, um das Issue automatisch zu schließen (z.B. `Closes #42`).

---

## 🌿 Branching Strategie

Wir verwenden folgende Präfixe für Brnach-Namen:

*   `feat/`: Neue Funktionen (Features)
*   `fix/`: Fehlerbehebungen (Bugfixes)
*   `docs/`: Änderungen an der Dokumentation
*   `ui/`: Reine Design/CSS Anpassungen
*   `refactor/`: Code-Aufräumarbeiten ohne neue Funktion

**Beispiele:**
*   `feat/12-neuer-audio-player`
*   `fix/55-crash-beim-laden`
*   `docs/10-readme-update`

---

## 📝 Commit Messages (Conventional Commits)

Wir orientieren uns an den [Conventional Commits](https://www.conventionalcommits.org/).
Dies hilft uns, den Changelog automatisch zu generieren.

**Format:**
`typ(scope): beschreibung (referenz)`

**Typen:**
*   `feat`: Ein neues Feature
*   `fix`: Ein Bugfix
*   `docs`: Dokumentation
*   `style`: Formatierung, fehlende Semikolons, etc. (kein Code-Change)
*   `refactor`: Code-Umbau
*   `perf`: Performance-Verbesserungen
*   `chore`: Build-Tools, Abhängigkeiten, etc.

**Beispiele:**
*   `feat(assets): add folder view toggle (closes #12)`
*   `fix(importer): resolve mp3 decoding error (refs #34)`
*   `docs: update installation guide`
*   `ui(sidebar): adjust contrast for dark mode`

---

## 🔗 Issues verknüpfen

Damit GitHub den Status sauber hält, nutze folgende Keywords in deinen Commits oder der PR-Beschreibung:

*   `Closes #123` (Schließt das Issue, sobald der PR gemergt wird)
*   `Fixes #123`
*   `Resolves #123`
*   `Refs #123` (Verlinkt nur, schließt nicht)
