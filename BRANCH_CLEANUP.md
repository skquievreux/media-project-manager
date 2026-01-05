# Branch Cleanup Report

Generiert am: 2026-01-05

## Zusammenfassung

Dieses Dokument listet alle Branches auf, die bereits in `main` gemerged wurden und sicher gelöscht werden können.

## Branches zum Löschen

Die folgenden Branches sind bereits in `main` gemerged und können gelöscht werden:

### Feature Branches
- `feature/governance-v3-pnpm-migration` - Bereits gemerged
- `feature/smart-templates-integration` - Bereits gemerged

### Release Branches
- `release/v1.5.1` - Bereits gemerged
- `release/v1.5.2` - Bereits gemerged

### Security Branches
- `security/patch-cve-2025-55182` - Bereits gemerged

## Aktive Branches (behalten)

Die folgenden Branches sind noch nicht gemerged und sollten behalten werden:

- `chore/add-workflow-templates`
- `chore/enforce-versioning-standards`
- `claude/review-project-01U1xvwDoZntR4xSjMDVyHUB`
- `feat/27-ui-polish-favorites`
- `feature/add-workflow-templates`
- `feature/asset-enhancements-v1.5.4`
- `release/v1.5.3`
- `main` (Hauptbranch)

## Manuelle Löschung erforderlich

Da automatische Branch-Löschung aufgrund von Berechtigungen nicht möglich ist, können die gemergten Branches manuell über die GitHub-Weboberfläche oder mit folgenden Befehlen gelöscht werden:

```bash
git push origin --delete feature/governance-v3-pnpm-migration
git push origin --delete feature/smart-templates-integration
git push origin --delete release/v1.5.1
git push origin --delete release/v1.5.2
git push origin --delete security/patch-cve-2025-55182
```

## Hinweise

- Alle aufgelisteten Branches zum Löschen wurden bereits erfolgreich in `main` gemerged
- Tags für Releases (v1.5.1, v1.5.2, etc.) bleiben erhalten
- Lokale Tracking-Referenzen wurden bereits aufgeräumt
