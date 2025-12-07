/**
 * YouTube API Service
 * Video upload and management via YouTube Data API v3
 *
 * Built by Claude for Don Key
 */

import APIClient from './client';
import { API_CONFIG } from '../../config/api.config';

class YouTubeService extends APIClient {
  constructor() {
    super('youtube');
  }

  /**
   * Upload video to YouTube
   * @param {Object} params
   * @param {File} params.videoFile - Video file to upload
   * @param {string} params.title - Video title
   * @param {string} params.description - Video description
   * @param {Array<string>} params.tags - Video tags
   * @param {string} params.categoryId - YouTube category ID (default: 10 = Music)
   * @param {string} params.privacyStatus - 'public', 'private', or 'unlisted'
   */
  async uploadVideo(params) {
    const {
      videoFile,
      title,
      description,
      tags = [],
      categoryId = '10', // Music
      privacyStatus = 'public',
      thumbnailFile = null
    } = params;

    // Step 1: Initialize upload
    const metadata = {
      snippet: {
        title,
        description,
        tags,
        categoryId
      },
      status: {
        privacyStatus,
        selfDeclaredMadeForKids: false
      }
    };

    const formData = new FormData();
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('file', videoFile);

    const uploadResult = await this.post(
      `${API_CONFIG.youtube.endpoints.videos}?part=snippet,status`,
      formData,
      { useFormData: true, timeout: 300000 } // 5min timeout
    );

    if (!uploadResult.success) {
      return uploadResult;
    }

    const videoId = uploadResult.data.id;

    // Step 2: Upload thumbnail if provided
    if (thumbnailFile) {
      await this.uploadThumbnail(videoId, thumbnailFile);
    }

    return {
      success: true,
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`
    };
  }

  /**
   * Upload custom thumbnail
   * @param {string} videoId
   * @param {File} thumbnailFile
   */
  async uploadThumbnail(videoId, thumbnailFile) {
    const formData = new FormData();
    formData.append('file', thumbnailFile);

    return this.post(
      `/videos/thumbnails/set?videoId=${videoId}`,
      formData,
      { useFormData: true }
    );
  }

  /**
   * Update video metadata
   * @param {string} videoId
   * @param {Object} updates
   */
  async updateVideo(videoId, updates) {
    const { title, description, tags, privacyStatus } = updates;

    const payload = {
      id: videoId,
      snippet: {}
    };

    if (title) payload.snippet.title = title;
    if (description) payload.snippet.description = description;
    if (tags) payload.snippet.tags = tags;
    if (privacyStatus) payload.status = { privacyStatus };

    return this.put(
      `${API_CONFIG.youtube.endpoints.videos}?part=snippet,status`,
      payload
    );
  }

  /**
   * Get video details
   * @param {string} videoId
   */
  async getVideo(videoId) {
    return this.get(
      `${API_CONFIG.youtube.endpoints.videos}?part=snippet,contentDetails,statistics&id=${videoId}`
    );
  }

  /**
   * Delete video
   * @param {string} videoId
   */
  async deleteVideo(videoId) {
    return this.delete(`${API_CONFIG.youtube.endpoints.videos}?id=${videoId}`);
  }

  /**
   * Create playlist
   * @param {string} title
   * @param {string} description
   */
  async createPlaylist(title, description) {
    const payload = {
      snippet: {
        title,
        description
      },
      status: {
        privacyStatus: 'public'
      }
    };

    const result = await this.post(
      `${API_CONFIG.youtube.endpoints.playlists}?part=snippet,status`,
      payload
    );

    if (result.success) {
      return {
        success: true,
        playlistId: result.data.id,
        url: `https://www.youtube.com/playlist?list=${result.data.id}`
      };
    }

    return result;
  }

  /**
   * Add video to playlist
   * @param {string} playlistId
   * @param {string} videoId
   */
  async addToPlaylist(playlistId, videoId) {
    const payload = {
      snippet: {
        playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId
        }
      }
    };

    return this.post('/playlistItems?part=snippet', payload);
  }

  /**
   * Generate optimized description from project
   * @param {Object} project
   */
  generateDescription(project) {
    const meta = project.metadata || {};
    const artist = meta.artistName || 'Artist';
    const name = meta.songName || project.name;
    const genre = meta.genre || '';
    const description = meta.description || 'Neuer Song verfügbar!';

    const hashtags = [
      artist.replace(/\s+/g, ''),
      name.replace(/\s+/g, ''),
      genre,
      'music',
      'newsong'
    ]
      .filter(Boolean)
      .map(t => `#${t}`)
      .join(' ');

    return `${name} - ${artist}

${description}

${genre ? `🎵 Genre: ${genre}\n` : ''}🎧 Jetzt streamen auf allen Plattformen!

---

${hashtags}

Produziert mit ❤️
© ${new Date().getFullYear()} ${artist}`;
  }

  /**
   * Upload from project
   * @param {Object} project
   * @param {File} videoFile
   * @param {File} thumbnailFile
   */
  async uploadFromProject(project, videoFile, thumbnailFile) {
    const meta = project.metadata || {};
    const title = meta.songName || project.name;
    const description = this.generateDescription(project);
    const tags = [
      meta.artistName,
      meta.genre,
      'music',
      meta.mood
    ].filter(Boolean);

    return this.uploadVideo({
      videoFile,
      thumbnailFile,
      title,
      description,
      tags,
      categoryId: '10', // Music
      privacyStatus: meta.privacyStatus || 'public'
    });
  }
}

export default new YouTubeService();
