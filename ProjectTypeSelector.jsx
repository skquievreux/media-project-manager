import { useState } from 'react';
import { PROJECT_TYPES } from '../constants/projectTypes';
import './ProjectTypeSelector.css';

/**
 * ProjectTypeSelector Component
 * Allows user to select a project type and displays relevant information
 * 
 * Built by Claude for Don Key
 */
function ProjectTypeSelector({ onSelect, selectedType }) {
  const [hoveredType, setHoveredType] = useState(null);

  const handleSelect = (typeId) => {
    onSelect(typeId);
  };

  const formatTime = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${minutes}min`;
  };

  return (
    <div className="project-type-selector">
      <h2 className="selector-title">Wähle Projekt-Typ</h2>
      
      <div className="type-grid">
        {Object.values(PROJECT_TYPES).map((type) => (
          <button
            key={type.id}
            className={`type-card ${selectedType === type.id ? 'selected' : ''}`}
            style={{
              borderColor: selectedType === type.id ? type.color : 'transparent',
              '--type-color': type.color
            }}
            onClick={() => handleSelect(type.id)}
            onMouseEnter={() => setHoveredType(type.id)}
            onMouseLeave={() => setHoveredType(null)}
          >
            <div className="type-icon">{type.icon}</div>
            <div className="type-label">{type.label}</div>
            <div className="type-time">
              ⏱️ {formatTime(type.estimatedTime)}
            </div>
            
            {(hoveredType === type.id || selectedType === type.id) && (
              <div className="type-description">
                {type.description}
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedType && PROJECT_TYPES[selectedType] && (
        <div className="type-details">
          <div className="details-header" style={{ color: PROJECT_TYPES[selectedType].color }}>
            <span className="details-icon">{PROJECT_TYPES[selectedType].icon}</span>
            <h3>{PROJECT_TYPES[selectedType].label}</h3>
          </div>
          
          <div className="workflow-preview">
            <h4>Workflow ({PROJECT_TYPES[selectedType].workflow.length} Schritte)</h4>
            <div className="workflow-steps">
              {PROJECT_TYPES[selectedType].workflow.map((step) => (
                <div key={step.id} className="workflow-step">
                  <span className="step-icon">{step.icon}</span>
                  <span className="step-label">{step.label}</span>
                  <span className="step-time">{step.estimatedTime}min</span>
                  {step.type === 'automated' && (
                    <span className="step-badge automated">🤖 Auto</span>
                  )}
                  {step.type === 'waiting' && (
                    <span className="step-badge waiting">⏳ Warten</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="type-metadata">
            <div className="metadata-item">
              <strong>Geschätzte Zeit:</strong> {formatTime(PROJECT_TYPES[selectedType].estimatedTime)}
            </div>
            {PROJECT_TYPES[selectedType].defaultFolder && (
              <div className="metadata-item">
                <strong>Standard-Ordner:</strong> 
                <code>{PROJECT_TYPES[selectedType].defaultFolder}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectTypeSelector;
