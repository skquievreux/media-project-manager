/**
 * Suno API Service
 * Music generation with Suno AI
 *
 * Built by Claude for Don Key
 */

import APIClient from './client';
import { API_CONFIG } from '../../config/api.config';

class SunoService extends APIClient {
  constructor() {
    super('suno');
  }

  /**
   * Generate music from prompt
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - Music description
   * @param {string} params.genre - Music genre
   * @param {number} params.duration - Duration in seconds (default: 180)
   * @param {string} params.mood - Mood/energy level
   */
  async generateMusic(params) {
    const {
      prompt,
      genre = 'Pop',
      duration = 180,
      mood = 'energetic',
      title = 'Untitled',
      instrumental = false
    } = params;

    const payload = {
      prompt: `[${genre}]\n${prompt}\nMood: ${mood}`,
      title,
      duration,
      instrumental,
      make_instrumental: instrumental,
      wait_audio: false // Async generation
    };

    const result = await this.post(API_CONFIG.suno.endpoints.generate, payload);

    if (result.success) {
      return {
        success: true,
        generationId: result.data.id,
        status: result.data.status,
        estimatedTime: result.data.estimated_time || 60
      };
    }

    return result;
  }

  /**
   * Check generation status
   * @param {string} generationId
   */
  async getStatus(generationId) {
    const endpoint = API_CONFIG.suno.endpoints.status.replace('{id}', generationId);
    const result = await this.get(endpoint);

    if (result.success) {
      return {
        success: true,
        status: result.data.status, // 'pending', 'processing', 'completed', 'failed'
        progress: result.data.progress || 0,
        audioUrl: result.data.audio_url,
        videoUrl: result.data.video_url,
        duration: result.data.duration
      };
    }

    return result;
  }

  /**
   * Download generated audio
   * @param {string} generationId
   * @param {string} savePath - Path to save file
   */
  async downloadAudio(generationId, savePath) {
    const statusResult = await this.getStatus(generationId);

    if (!statusResult.success || statusResult.status !== 'completed') {
      return {
        success: false,
        error: 'Generation not completed yet'
      };
    }

    // Download via Electron
    if (window.electron?.downloadFile) {
      return await window.electron.downloadFile(statusResult.audioUrl, savePath);
    }

    // Browser download
    const link = document.createElement('a');
    link.href = statusResult.audioUrl;
    link.download = `suno-${generationId}.mp3`;
    link.click();

    return { success: true };
  }

  /**
   * Generate music and wait for completion (polling)
   * @param {Object} params - Generation parameters
   * @param {Function} onProgress - Progress callback (optional)
   */
  async generateMusicAndWait(params, onProgress) {
    // Start generation
    const generateResult = await this.generateMusic(params);
    if (!generateResult.success) {
      return generateResult;
    }

    const { generationId } = generateResult;

    // Poll for completion
    return this.pollStatus(generationId, onProgress);
  }

  /**
   * Poll generation status until completion
   * @param {string} generationId
   * @param {Function} onProgress - Callback with progress updates
   */
  async pollStatus(generationId, onProgress) {
    const maxAttempts = 120; // 2 minutes max (1 check per second)
    let attempts = 0;

    while (attempts < maxAttempts) {
      const statusResult = await this.getStatus(generationId);

      if (!statusResult.success) {
        return statusResult;
      }

      // Call progress callback
      if (onProgress) {
        onProgress({
          status: statusResult.status,
          progress: statusResult.progress
        });
      }

      // Check if completed
      if (statusResult.status === 'completed') {
        return {
          success: true,
          audioUrl: statusResult.audioUrl,
          videoUrl: statusResult.videoUrl,
          duration: statusResult.duration
        };
      }

      // Check if failed
      if (statusResult.status === 'failed') {
        return {
          success: false,
          error: 'Generation failed'
        };
      }

      // Wait before next check
      await this.wait(1000);
      attempts++;
    }

    return {
      success: false,
      error: 'Timeout waiting for generation'
    };
  }

  /**
   * Generate music from project metadata
   * @param {Object} project - Project object
   */
  async generateFromProject(project) {
    const meta = project.metadata || {};

    return this.generateMusicAndWait({
      prompt: meta.theme || project.name,
      genre: meta.genre || 'Pop',
      mood: meta.mood || 'energetic',
      title: meta.songName || project.name,
      duration: meta.duration || 180,
      instrumental: meta.instrumental || false
    });
  }
}

export default new SunoService();
