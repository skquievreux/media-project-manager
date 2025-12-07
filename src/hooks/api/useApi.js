/**
 * useApi Hook
 * Generic React hook for API calls with loading/error states
 *
 * Built by Claude for Don Key
 */

import { useState, useCallback } from 'react';

/**
 * Generic API hook
 * @param {Function} apiFunction - API function to call
 * @returns {Object} { data, loading, error, execute, reset }
 */
export function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        // Check if last argument is a progress callback
        let progressCallback = null;
        let apiArgs = args;

        if (typeof args[args.length - 1] === 'function') {
          progressCallback = args[args.length - 1];
          apiArgs = args.slice(0, -1);
        }

        // Wrap progress callback
        const wrappedProgressCallback = progressCallback
          ? (progressData) => {
              setProgress(progressData.progress || 0);
              progressCallback(progressData);
            }
          : undefined;

        // Execute API call
        const result = wrappedProgressCallback
          ? await apiFunction(...apiArgs, wrappedProgressCallback)
          : await apiFunction(...apiArgs);

        if (result.success) {
          setData(result.data || result);
          return result;
        } else {
          setError(result.error || 'Unknown error');
          return result;
        }
      } catch (err) {
        const errorMessage = err.message || 'An error occurred';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setProgress(0);
  }, []);

  return {
    data,
    loading,
    error,
    progress,
    execute,
    reset
  };
}

/**
 * Suno-specific hook
 */
export function useSuno() {
  const [generationId, setGenerationId] = useState(null);

  const generateMusic = useApi(async (params, onProgress) => {
    const suno = (await import('../../services/api/suno')).default;
    const result = await suno.generateMusicAndWait(params, onProgress);

    if (result.success && result.generationId) {
      setGenerationId(result.generationId);
    }

    return result;
  });

  const downloadAudio = useApi(async (savePath) => {
    const suno = (await import('../../services/api/suno')).default;
    return suno.downloadAudio(generationId, savePath);
  });

  return {
    generateMusic: generateMusic.execute,
    downloadAudio: downloadAudio.execute,
    loading: generateMusic.loading || downloadAudio.loading,
    error: generateMusic.error || downloadAudio.error,
    progress: generateMusic.progress,
    audioData: generateMusic.data,
    generationId,
    reset: () => {
      generateMusic.reset();
      downloadAudio.reset();
      setGenerationId(null);
    }
  };
}

/**
 * YouTube-specific hook
 */
export function useYouTube() {
  const [videoId, setVideoId] = useState(null);

  const uploadVideo = useApi(async (params) => {
    const youtube = (await import('../../services/api/youtube')).default;
    const result = await youtube.uploadVideo(params);

    if (result.success && result.videoId) {
      setVideoId(result.videoId);
    }

    return result;
  });

  const uploadFromProject = useApi(async (project, videoFile, thumbnailFile) => {
    const youtube = (await import('../../services/api/youtube')).default;
    const result = await youtube.uploadFromProject(project, videoFile, thumbnailFile);

    if (result.success && result.videoId) {
      setVideoId(result.videoId);
    }

    return result;
  });

  return {
    uploadVideo: uploadVideo.execute,
    uploadFromProject: uploadFromProject.execute,
    loading: uploadVideo.loading || uploadFromProject.loading,
    error: uploadVideo.error || uploadFromProject.error,
    videoId,
    videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
    reset: () => {
      uploadVideo.reset();
      uploadFromProject.reset();
      setVideoId(null);
    }
  };
}

/**
 * Hook for multiple concurrent API calls
 */
export function useApiQueue() {
  const [queue, setQueue] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const addToQueue = useCallback((id, apiFunction, ...args) => {
    setQueue(prev => [...prev, { id, apiFunction, args }]);
  }, []);

  const executeQueue = useCallback(async () => {
    if (queue.length === 0) return;

    setLoading(true);
    const newResults = {};

    for (const item of queue) {
      try {
        const result = await item.apiFunction(...item.args);
        newResults[item.id] = result;
      } catch (error) {
        newResults[item.id] = { success: false, error: error.message };
      }
    }

    setResults(newResults);
    setQueue([]);
    setLoading(false);

    return newResults;
  }, [queue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setResults({});
  }, []);

  return {
    queue,
    results,
    loading,
    addToQueue,
    executeQueue,
    clearQueue
  };
}

export default useApi;
