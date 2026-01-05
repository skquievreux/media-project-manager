# Icon Placeholder

Um ein professionelles Icon für deine App zu erstellen:

1. **Erstelle ein 256x256 PNG-Icon** (z.B. mit Figma, Photoshop, oder GIMP)
2. **Konvertiere es zu .ico** mit einem Online-Tool:
   - https://convertio.co/de/png-ico/
   - https://www.icoconverter.com/
3. **Speichere es als:** `build/icon.ico`

## Temporäre Lösung

Wenn du noch kein Icon hast, kannst du die Icon-Zeile aus `package.json` entfernen:

```json
"win": {
  "target": [...],
  // "icon": "build/icon.ico",  // <-- Diese Zeile auskommentieren
  ...
}
```

Electron Builder wird dann ein Standard-Electron-Icon verwenden.

## Icon-Anforderungen

- **Format:** .ico (Windows), .icns (macOS), .png (Linux)
- **Größe:** Mindestens 256x256 Pixel
- **Empfohlen:** 512x512 oder 1024x1024 für beste Qualität
- **Transparenz:** Ja, für moderne Windows-Versionen

## Design-Tipps

- Einfaches, klares Design (funktioniert auch in kleinen Größen wie 16x16)
- Hoher Kontrast für gute Sichtbarkeit
- Vermeide zu viele Details
- Teste das Icon in verschiedenen Größen
