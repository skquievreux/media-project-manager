/**
 * ElevenLabs API Service  
 * AI voice generation and text-to-speech
 *
 * Built by Claude for Don Key
 */

import APIClient from './client';
import { API_CONFIG } from '../../config/api.config';

class ElevenLabsService extends APIClient {
  constructor() {
    super('elevenlabs');
  }

  /**
   * Generate speech from text
   * @param {Object} params
   * @param {string} params.text - Text to convert to speech
   * @param {string} params.voiceId - Voice ID (default: Rachel)
   * @param {string} params.modelId - Model ID (default: eleven_monolingual_v1)
   * @param {Object} params.voiceSettings - Voice settings
   */
  async textToSpeech(params) {
    const {
      text,
      voiceId = '21m00Tcm4TlvDq8ikWAM', // Rachel
      modelId = 'eleven_monolingual_v1',
      voiceSettings = {
        stability: 0.5,
        similarity_boost: 0.75
      }
    } = params;

    const endpoint = API_CONFIG.elevenlabs.endpoints.textToSpeech.replace('{voice_id}', voiceId);

    const payload = {
      text,
      model_id: modelId,
      voice_settings: voiceSettings
    };

    const result = await this.post(endpoint, payload);

    if (result.success) {
      return {
        success: true,
        audioUrl: result.data.audio_url,
        characterCount: text.length,
        duration: result.data.duration
      };
    }

    return result;
  }

  /**
   * Get available voices
   */
  async getVoices() {
    const result = await this.get(API_CONFIG.elevenlabs.endpoints.voices);

    if (result.success) {
      return {
        success: true,
        voices: result.data.voices.map(v => ({
          id: v.voice_id,
          name: v.name,
          category: v.category,
          description: v.description,
          previewUrl: v.preview_url
        }))
      };
    }

    return result;
  }

  /**
   * Get generation history
   */
  async getHistory() {
    const result = await this.get(API_CONFIG.elevenlabs.endpoints.history);

    if (result.success) {
      return {
        success: true,
        history: result.data.history
      };
    }

    return result;
  }

  /**
   * Download audio file
   * @param {string} audioUrl - URL of generated audio
   * @param {string} savePath - Path to save file
   */
  async downloadAudio(audioUrl, savePath) {
    if (window.electron?.downloadFile) {
      return await window.electron.downloadFile(audioUrl, savePath);
    }

    // Browser download
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = savePath.split('/').pop() || 'audio.mp3';
    link.click();

    return { success: true };
  }

  /**
   * Generate narration for children's book
   * @param {Object} project - Kinderbuch project
   * @param {string} text - Story text
   * @param {Object} options - Voice options
   */
  async generateNarration(project, text, options = {}) {
    const meta = project.metadata || {};

    const voiceOptions = {
      voiceId: options.voiceId || meta.narratorVoiceId || '21m00Tcm4TlvDq8ikWAM',
      modelId: 'eleven_multilingual_v2', // Better for German
      voiceSettings: {
        stability: options.stability || 0.6,
        similarity_boost: options.similarityBoost || 0.8,
        style: options.style || 0.5
      }
    };

    return this.textToSpeech({
      text,
      ...voiceOptions
    });
  }

  /**
   * Generate multiple voice clips (batch)
   * @param {Array<Object>} textSegments - Array of {text, voiceId}
   */
  async generateBatch(textSegments) {
    const results = [];

    for (const segment of textSegments) {
      try {
        const result = await this.textToSpeech({
          text: segment.text,
          voiceId: segment.voiceId,
          voiceSettings: segment.voiceSettings
        });

        results.push({
          ...result,
          segmentId: segment.id
        });

        // Wait to respect rate limits
        await this.wait(500);
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          segmentId: segment.id
        });
      }
    }

    return {
      success: true,
      results,
      totalCount: results.length,
      successCount: results.filter(r => r.success).length
    };
  }

  /**
   * Get user subscription info
   */
  async getSubscription() {
    const result = await this.get('/user/subscription');

    if (result.success) {
      return {
        success: true,
        characterCount: result.data.character_count,
        characterLimit: result.data.character_limit,
        plan: result.data.tier
      };
    }

    return result;
  }
}

export default new ElevenLabsService();
