import React from 'react';
import { PROJECT_TYPES } from '../constants/projectTypes';
import './TemplatesView.css';

const TemplatesView = ({ onNewProject }) => {
    return (
        <div className="templates-view">
            <div className="view-header">
                <h1>🪄 Smart Templates</h1>
                <p>Start a new project with pre-configured task workflows.</p>
            </div>

            <div className="templates-grid">
                {Object.entries(PROJECT_TYPES).map(([key, type]) => (
                    <div key={key} className="template-card" style={{ '--accent-color': type.color }}>
                        <div className="template-header">
                            <div className="template-icon">{type.icon}</div>
                            <h3>{type.label}</h3>
                        </div>

                        <div className="template-tasks">
                            <h4>Included Tasks:</h4>
                            <ul>
                                {type.defaultTasks.slice(0, 5).map(task => (
                                    <li key={task.id}>
                                        <span className="task-icon">{task.icon}</span>
                                        {task.label}
                                    </li>
                                ))}
                                {type.defaultTasks.length > 5 && (
                                    <li className="more-tasks">+{type.defaultTasks.length - 5} more...</li>
                                )}
                            </ul>
                        </div>

                        <button
                            className="btn-use-template"
                            onClick={() => onNewProject({ type: key, name: `New ${type.label} Project` })}
                        >
                            Start Project
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplatesView;
