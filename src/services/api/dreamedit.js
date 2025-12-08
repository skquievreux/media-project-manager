/**
 * DreamEdit API Service
 * Image generation with DreamEdit AI
 *
 * Built by Claude for Don Key
 */

import APIClient from './client';
import { API_CONFIG } from '../../config/api.config';

class DreamEditService extends APIClient {
  constructor() {
    super('dreamedit');
  }

  /**
   * Generate image from prompt
   * @param {Object} params
   * @param {string} params.prompt - Image description
   * @param {string} params.style - Art style (default: 'realistic')
   * @param {string} params.size - Image size (default: '1024x1024')
   * @param {number} params.quality - Quality 1-100 (default: 80)
   */
  async generateImage(params) {
    const {
      prompt,
      style = 'realistic',
      size = '1024x1024',
      quality = 80,
      negativePrompt = ''
    } = params;

    const payload = {
      prompt,
      style,
      size,
      quality,
      negative_prompt: negativePrompt
    };

    const result = await this.post(API_CONFIG.dreamedit.endpoints.generate, payload);

    if (result.success) {
      return {
        success: true,
        imageId: result.data.id,
        imageUrl: result.data.url,
        thumbnailUrl: result.data.thumbnail_url
      };
    }

    return result;
  }

  /**
   * Upscale existing image
   * @param {string} imageUrl - URL of image to upscale
   * @param {number} scale - Upscale factor (2, 4, or 8)
   */
  async upscaleImage(imageUrl, scale = 2) {
    const payload = {
      image_url: imageUrl,
      scale
    };

    const result = await this.post(API_CONFIG.dreamedit.endpoints.upscale, payload);

    if (result.success) {
      return {
        success: true,
        imageUrl: result.data.url
      };
    }

    return result;
  }

  /**
   * Generate image variations
   * @param {string} imageUrl - Base image URL
   * @param {number} count - Number of variations (default: 4)
   */
  async generateVariations(imageUrl, count = 4) {
    const payload = {
      image_url: imageUrl,
      count
    };

    const result = await this.post(API_CONFIG.dreamedit.endpoints.variations, payload);

    if (result.success) {
      return {
        success: true,
        variations: result.data.variations
      };
    }

    return result;
  }

  /**
   * Generate cover art from project
   * @param {Object} project
   */
  async generateCoverArt(project) {
    const meta = project.metadata || {};
    const name = meta.songName || meta.albumTitle || project.name;
    const artist = meta.artistName || 'Artist';
    const genre = meta.genre || 'Pop';
    const style = meta.coverStyle || 'modern, professional, album cover';

    const prompt = `Professional album cover art for "${name}" by ${artist}. 
Genre: ${genre}. 
Style: ${style}. 
High quality, modern design, suitable for streaming platforms. 
3000x3000px, square format.`;

    return this.generateImage({
      prompt,
      style: 'artistic',
      size: '1024x1024',
      quality: 95
    });
  }

  /**
   * Download image to local file
   * @param {string} imageUrl
   * @param {string} savePath
   */
  async downloadImage(imageUrl, savePath) {
    if (window.electron?.downloadFile) {
      return await window.electron.downloadFile(imageUrl, savePath);
    }

    // Browser download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = savePath.split('/').pop() || 'image.png';
    link.click();

    return { success: true };
  }
}

export default new DreamEditService();
