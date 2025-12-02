import './ProgressTracker.css';

const ProgressTracker = ({ progress, stages }) => {
    const defaultStages = [
        { name: 'Planning', value: 0 },
        { name: 'Production', value: 25 },
        { name: 'Editing', value: 50 },
        { name: 'Review', value: 75 },
        { name: 'Complete', value: 100 }
    ];

    const activeStages = stages || defaultStages;
    const currentStageIndex = activeStages.findIndex((stage, index) => {
        const nextStage = activeStages[index + 1];
        return !nextStage || progress < nextStage.value;
    });

    return (
        <div className="progress-tracker">
            <div className="progress-stages">
                {activeStages.map((stage, index) => {
                    const isCompleted = progress >= stage.value;
                    const isCurrent = index === currentStageIndex;

                    return (
                        <div
                            key={stage.name}
                            className={`progress-stage ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                        >
                            <div className="stage-marker">
                                <div className="stage-dot">
                                    {isCompleted && (
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                {index < activeStages.length - 1 && (
                                    <div className={`stage-line ${isCompleted ? 'completed' : ''}`}></div>
                                )}
                            </div>
                            <div className="stage-label">
                                <span className="stage-name">{stage.name}</span>
                                <span className="stage-value">{stage.value}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="progress-percentage">
                <div className="percentage-circle">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="var(--color-bg-tertiary)"
                            strokeWidth="8"
                        />
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 54}`}
                            strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                            transform="rotate(-90 60 60)"
                            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="percentage-text">
                        <span className="percentage-number">{progress}</span>
                        <span className="percentage-symbol">%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;
