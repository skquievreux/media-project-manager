# Project Types System - Integration Guide

Built by Claude for Don Key (Steffen Quievreux)

## 📦 Files hinzugefügt

```
src/
├── constants/
│   └── projectTypes.js          # Projekt-Typen Definitionen
└── components/
    ├── ProjectTypeSelector.jsx   # React Component
    └── ProjectTypeSelector.css   # Styles
```

## 🎯 Features

### Project Types:
1. **Einzelsong** (🎵) - ~54min
   - Song + Cover + Video + Landing Page + YouTube + Social
   
2. **Album** (💿) - ~12h
   - Konzept + 22 Tracks + Cover + DistroKid + Promotion
   
3. **Kinderbuch** (📚) - ~5h
   - Geschichte + 24 Illustrationen + Layout + Hörbuch + Druck
   - Mit: Professor Steini, Quantus, Don Quai
   
4. **Video** (🎬) - ~4h
   - Script + Footage + Edit + Thumbnail + Upload + Promo

### Workflow Features:
- ⏱️ Zeit-Tracking (geschätzt pro Step)
- 🤖 Automation-Markers (manual/automated/waiting)
- 📊 Progress-Berechnung
- 📁 Default-Folder-Struktur
- 🔗 External Links (Artify, DreamEdit, etc.)

## 🔧 Integration in App.jsx

### Option A: Als Modal/Dialog

```jsx
import { useState } from 'react';
import ProjectTypeSelector from './components/ProjectTypeSelector';

function App() {
  const [selectedType, setSelectedType] = useState(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const handleNewProject = () => {
    setShowTypeSelector(true);
  };

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    // Weiter zur Projekt-Erstellung mit dem gewählten Typ
  };

  return (
    <div>
      {/* Existing Header */}
      <Header onNewProject={handleNewProject} />
      
      {/* Type Selector Modal */}
      {showTypeSelector && (
        <div className="modal">
          <ProjectTypeSelector 
            onSelect={handleTypeSelect}
            selectedType={selectedType}
          />
          <button onClick={() => setShowTypeSelector(false)}>
            Abbrechen
          </button>
        </div>
      )}
      
      {/* Rest of your app */}
    </div>
  );
}
```

### Option B: Als Step im Workflow

```jsx
function App() {
  const [step, setStep] = useState('selectType'); // selectType, enterDetails, confirm
  const [selectedType, setSelectedType] = useState(null);
  const [projectData, setProjectData] = useState({});

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    setStep('enterDetails');
  };

  return (
    <div>
      {step === 'selectType' && (
        <ProjectTypeSelector 
          onSelect={handleTypeSelect}
          selectedType={selectedType}
        />
      )}
      
      {step === 'enterDetails' && (
        <ProjectDetailsForm 
          type={selectedType}
          onSubmit={(data) => {
            setProjectData(data);
            setStep('confirm');
          }}
        />
      )}
    </div>
  );
}
```

## 🎨 Verwendung der Typen

```jsx
import { PROJECT_TYPES, getProjectType } from './constants/projectTypes';

// Alle Typen holen
const allTypes = Object.values(PROJECT_TYPES);

// Einzelnen Typ holen
const songType = getProjectType('SINGLE_SONG');

// Typ-Properties nutzen
console.log(songType.icon);         // 🎵
console.log(songType.label);        // "Einzelsong"
console.log(songType.estimatedTime); // 54
console.log(songType.workflow);     // Array mit 6 Steps
console.log(songType.fields);       // Array mit Form-Feldern
```

## 📝 Projekt-Erstellung mit Typ

```jsx
const createProjectFromType = (typeId, userData) => {
  const type = getProjectType(typeId);
  
  const newProject = {
    id: Date.now(),
    name: userData.songName || userData.albumTitle || userData.bookTitle,
    type: type.baseType,
    projectType: typeId,
    description: type.description,
    
    // Form-Daten
    ...userData,
    
    // Workflow initialisieren
    workflow: type.workflow.map(step => ({
      ...step,
      status: 'pending',
      actualTime: null,
      completedAt: null
    })),
    
    // Meta
    createdAt: new Date().toISOString(),
    estimatedTime: type.estimatedTime,
    progress: 0
  };
  
  return newProject;
};
```

## 🎯 Nächste Schritte

1. ✅ Files in `src/` kopieren
2. ✅ Import in `App.jsx` hinzufügen
3. ✅ `handleNewProject` anpassen
4. 📋 Task-Tracking-System integrieren (next PR)
5. 🔗 Tool-Links integrieren (Artify, YouTube-LP, etc.)

## 📊 Workflow Status Tracking

Später kannst du:

```jsx
const updateWorkflowStep = (projectId, stepId, status, actualTime) => {
  // Update step status: pending -> in-progress -> completed
  // Track actualTime vs estimatedTime
  // Calculate efficiency: actualTime / estimatedTime
};
```

## 🚀 Testing

```bash
npm run dev
# → http://localhost:5173

# Test:
1. Click "Neues Projekt"
2. Wähle Projekt-Typ
3. Sieh Workflow-Preview
4. Hover über Type-Cards für Beschreibung
```

---

**Built with ❤️ by Claude für Don Key** 🫏
