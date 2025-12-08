import { useState, useEffect } from 'react';
import ToolLinkButtons from './ToolLinkButtons';
import SmartPrompts from './SmartPrompts';
import './TaskTracker.css';

/**
 * TaskTracker Component
 * Complete time tracking system for project tasks
 *
 * Features:
 * - Start/Stop/Pause timer
 * - Estimated vs Actual time tracking
 * - Efficiency calculation
 * - Task dependencies
 * - Progress tracking
 *
 * Built by Claude for Don Key
 */
function TaskTracker({ project, onUpdateProject }) {
  const [tasks, setTasks] = useState(project.tasks || []);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showStats, setShowStats] = useState(false);

  // Update current time every second for timer display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate task statistics
  const calculateStats = () => {
    const completed = tasks.filter(t => t.status === 'completed');
    const totalEstimated = tasks.reduce((sum, t) => sum + t.estimatedTime, 0);
    const totalActual = completed.reduce((sum, t) => sum + (t.actualTime || 0), 0);
    const efficiency = totalActual > 0 ? (totalEstimated / totalActual) * 100 : 100;

    return {
      total: tasks.length,
      completed: completed.length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      totalEstimated,
      totalActual,
      efficiency: Math.round(efficiency),
      progress: tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0
    };
  };

  // Start task timer
  const startTask = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: 'in_progress',
          startedAt: task.startedAt || Date.now(),
          pausedDuration: task.pausedDuration || 0
        };
      }
      return task;
    });

    setTasks(updatedTasks);
    setActiveTaskId(taskId);
    saveToProject(updatedTasks);
  };

  // Pause task timer
  const pauseTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.startedAt) return;

    const elapsed = Date.now() - task.startedAt;
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'paused',
          pausedDuration: (t.pausedDuration || 0) + elapsed,
          startedAt: null
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    setActiveTaskId(null);
    saveToProject(updatedTasks);
  };

  // Complete task
  const completeTask = (taskId, notes = '') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let actualTime = 0;
    if (task.startedAt) {
      actualTime = Math.round((Date.now() - task.startedAt + (task.pausedDuration || 0)) / 60000); // minutes
    } else if (task.pausedDuration) {
      actualTime = Math.round(task.pausedDuration / 60000);
    }

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'completed',
          completedAt: Date.now(),
          actualTime: actualTime || t.estimatedTime,
          notes: notes || t.notes,
          startedAt: null,
          pausedDuration: 0
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    setActiveTaskId(null);
    saveToProject(updatedTasks);
    checkDependencies(taskId, updatedTasks);
  };

  // Skip task
  const skipTask = (taskId, reason = '') => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'skipped',
          skippedReason: reason,
          skippedAt: Date.now()
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    saveToProject(updatedTasks);
    checkDependencies(taskId, updatedTasks);
  };

  // Check and unblock dependent tasks
  const checkDependencies = (completedTaskId, currentTasks) => {
    const task = currentTasks.find(t => t.id === completedTaskId);
    if (!task || !task.dependencies) return;

    const updatedTasks = currentTasks.map(t => {
      if (t.dependencies && t.dependencies.includes(completedTaskId)) {
        const allDependenciesMet = t.dependencies.every(depId => {
          const dep = currentTasks.find(dt => dt.id === depId);
          return dep && (dep.status === 'completed' || dep.status === 'skipped');
        });

        if (allDependenciesMet && t.status === 'blocked') {
          return { ...t, status: 'pending' };
        }
      }
      return t;
    });

    if (JSON.stringify(updatedTasks) !== JSON.stringify(currentTasks)) {
      setTasks(updatedTasks);
      saveToProject(updatedTasks);
    }
  };

  // Get elapsed time for active task
  const getElapsedTime = (task) => {
    if (!task.startedAt) return task.pausedDuration || 0;
    return currentTime - task.startedAt + (task.pausedDuration || 0);
  };

  // Format time display
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Save tasks to project
  const saveToProject = (updatedTasks) => {
    if (onUpdateProject) {
      onUpdateProject({ ...project, tasks: updatedTasks });
    }
  };

  // Get next available task
  const getNextTask = () => {
    return tasks.find(t =>
      t.status === 'pending' &&
      (!t.dependencies || t.dependencies.every(depId => {
        const dep = tasks.find(dt => dt.id === depId);
        return dep && (dep.status === 'completed' || dep.status === 'skipped');
      }))
    );
  };

  // Check if task is blocked
  const isTaskBlocked = (task) => {
    if (!task.dependencies) return false;
    return task.dependencies.some(depId => {
      const dep = tasks.find(t => t.id === depId);
      return dep && dep.status !== 'completed' && dep.status !== 'skipped';
    });
  };

  const stats = calculateStats();
  const nextTask = getNextTask();

  // Helper for Smart Prompts
  const getPromptType = (taskId) => {
    const types = {
      'song_generated': 'suno',
      'cover_created': 'cover',
      'video_rendered': 'video',
      'story_written': 'story',
      'youtube_upload': 'youtube',
      'social_promotion': 'social',
      'album_cover': 'cover',
      'tracks_generated': 'suno'
    };

    // Check for exact match or strict prefix match (task.id contains dynamic suffix)
    for (const [key, type] of Object.entries(types)) {
      if (taskId === key || taskId.startsWith(key + '_')) {
        return type;
      }
    }
    return null;
  };

  return (
    <div className="task-tracker">
      {/* Stats Header */}
      <div className="tracker-header">
        <div className="header-left">
          <h3>📋 Task Tracking</h3>
          <div className="task-counts">
            <span className="count completed">{stats.completed} ✓</span>
            <span className="count in-progress">{stats.inProgress} ⏳</span>
            <span className="count pending">{stats.pending} ⏸️</span>
          </div>
        </div>
        <div className="header-right">
          <button
            className="btn-stats"
            onClick={() => setShowStats(!showStats)}
          >
            📊 Stats
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div className="stats-panel">
          <div className="stat-card">
            <div className="stat-label">Progress</div>
            <div className="stat-value">{stats.progress}%</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Zeit Geschätzt</div>
            <div className="stat-value">{stats.totalEstimated}min</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Zeit Tatsächlich</div>
            <div className="stat-value">{stats.totalActual}min</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Effizienz</div>
            <div className={`stat-value ${stats.efficiency >= 90 ? 'good' : stats.efficiency >= 70 ? 'ok' : 'bad'}`}>
              {stats.efficiency}%
            </div>
          </div>
        </div>
      )}

      {/* Next Task Recommendation */}
      {nextTask && (
        <div className="next-task-banner">
          <span className="banner-icon">💡</span>
          <span className="banner-text">
            Nächste Aufgabe: <strong>{nextTask.label}</strong> ({nextTask.estimatedTime}min)
          </span>
          <button
            className="btn-start-next"
            onClick={() => startTask(nextTask.id)}
          >
            Starten ▶️
          </button>
        </div>
      )}

      {/* Task List */}
      <div className="task-list">
        {tasks.map(task => {
          const isActive = activeTaskId === task.id;
          const isBlocked = isTaskBlocked(task);
          const elapsed = isActive ? getElapsedTime(task) : (task.pausedDuration || 0);

          return (
            <div
              key={task.id}
              className={`task-item ${task.status} ${isBlocked ? 'blocked' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="task-main">
                <div className="task-icon">
                  {task.icon || '📝'}
                </div>

                <div className="task-content">
                  <div className="task-header">
                    <span className="task-label">{task.label}</span>
                    <span className="task-time">
                      {task.status === 'completed' && task.actualTime && (
                        <>
                          {task.actualTime}min
                          {task.actualTime !== task.estimatedTime && (
                            <span className={task.actualTime < task.estimatedTime ? 'time-saved' : 'time-over'}>
                              {task.actualTime < task.estimatedTime ? ' ↓' : ' ↑'}
                              {Math.abs(task.actualTime - task.estimatedTime)}min
                            </span>
                          )}
                        </>
                      )}
                      {task.status !== 'completed' && `~${task.estimatedTime}min`}
                    </span>
                  </div>

                  {/* Timer Display */}
                  {(isActive || task.pausedDuration > 0) && task.status === 'in_progress' && (
                    <div className="task-timer">
                      <span className="timer-display">{formatTime(elapsed)}</span>
                      <span className="timer-estimated">/ ~{task.estimatedTime}min</span>
                    </div>
                  )}

                  {/* Task Type Badge */}
                  {task.type && (
                    <span className={`task-badge ${task.type}`}>
                      {task.type === 'manual' && '👤 Manual'}
                      {task.type === 'automated' && '🤖 Auto'}
                      {task.type === 'waiting' && '⏳ Warten'}
                      {task.type === 'review' && '✅ Review'}
                    </span>
                  )}

                  {/* Dependencies Warning */}
                  {isBlocked && (
                    <div className="task-warning">
                      ⚠️ Blockiert durch: {task.dependencies.map(depId => {
                        const dep = tasks.find(t => t.id === depId);
                        return dep ? dep.label : depId;
                      }).join(', ')}
                    </div>
                  )}


                  {/* Tool Links Integration */}
                  <ToolLinkButtons project={project} task={task} />

                  {/* Smart Prompts Integration */}
                  {task.status === 'in_progress' && getPromptType(task.id) && (
                    <SmartPrompts project={project} type={getPromptType(task.id)} />
                  )}
                </div>

                <div className="task-actions">
                  {task.status === 'pending' && !isBlocked && (
                    <button
                      className="btn-action start"
                      onClick={() => startTask(task.id)}
                      title="Start"
                    >
                      ▶️
                    </button>
                  )}

                  {task.status === 'in_progress' && (
                    <>
                      <button
                        className="btn-action pause"
                        onClick={() => pauseTask(task.id)}
                        title="Pause"
                      >
                        ⏸️
                      </button>
                      <button
                        className="btn-action complete"
                        onClick={() => completeTask(task.id)}
                        title="Complete"
                      >
                        ✅
                      </button>
                    </>
                  )}

                  {task.status === 'paused' && (
                    <>
                      <button
                        className="btn-action start"
                        onClick={() => startTask(task.id)}
                        title="Resume"
                      >
                        ▶️
                      </button>
                      <button
                        className="btn-action complete"
                        onClick={() => completeTask(task.id)}
                        title="Complete"
                      >
                        ✅
                      </button>
                    </>
                  )}

                  {(task.status === 'pending' || task.status === 'in_progress' || task.status === 'paused') && (
                    <button
                      className="btn-action skip"
                      onClick={() => {
                        // prompt() is often blocked in Electron/Apps, using simple confirm for now
                        if (confirm('Möchtest du diesen Task wirklich überspringen?')) {
                          skipTask(task.id, 'Skipped by user');
                        }
                      }}
                      title="Skip"
                    >
                      ⏭️
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>Keine Tasks für dieses Projekt</p>
        </div>
      )}
    </div>
  );
}

export default TaskTracker;
