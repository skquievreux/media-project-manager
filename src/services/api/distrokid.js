/**
 * DistroKid API Service
 * Music distribution to streaming platforms
 *
 * Built by Claude for Don Key
 */

import APIClient from './client';
import { API_CONFIG } from '../../config/api.config';

class DistroKidService extends APIClient {
  constructor() {
    super('distrokid');
  }

  /**
   * Create new release
   * @param {Object} params
   * @param {string} params.artistName - Artist name
   * @param {string} params.title - Release title
   * @param {string} params.releaseType - 'single' or 'album'
   * @param {string} params.genre - Primary genre
   * @param {string} params.releaseDate - Release date (YYYY-MM-DD)
   * @param {Array<Object>} params.tracks - Array of track objects
   * @param {Object} params.artwork - Cover artwork info
   */
  async createRelease(params) {
    const {
      artistName,
      title,
      releaseType = 'single',
      genre,
      subgenre = '',
      releaseDate,
      tracks = [],
      artwork,
      upc = null,
      label = artistName,
      copyrightYear = new Date().getFullYear(),
      copyrightHolder = artistName
    } = params;

    const payload = {
      artist_name: artistName,
      title,
      release_type: releaseType,
      primary_genre: genre,
      secondary_genre: subgenre,
      release_date: releaseDate,
      tracks,
      artwork,
      upc,
      label,
      copyright_year: copyrightYear,
      copyright_holder: copyrightHolder
    };

    const result = await this.post(API_CONFIG.distrokid.endpoints.releases, payload);

    if (result.success) {
      return {
        success: true,
        releaseId: result.data.id,
        status: result.data.status,
        trackingUrl: result.data.tracking_url
      };
    }

    return result;
  }

  /**
   * Get release status
   * @param {string} releaseId
   */
  async getReleaseStatus(releaseId) {
    const result = await this.get(`${API_CONFIG.distrokid.endpoints.releases}/${releaseId}`);

    if (result.success) {
      return {
        success: true,
        status: result.data.status, // 'pending', 'processing', 'live', 'failed'
        stores: result.data.stores, // Array of store statuses
        links: result.data.links // Store links when live
      };
    }

    return result;
  }

  /**
   * Upload track file
   * @param {File} audioFile - Audio file (MP3, WAV, FLAC)
   */
  async uploadTrack(audioFile) {
    const formData = new FormData();
    formData.append('file', audioFile);

    const result = await this.post(
      `${API_CONFIG.distrokid.endpoints.tracks}/upload`,
      formData,
      { useFormData: true }
    );

    if (result.success) {
      return {
        success: true,
        trackId: result.data.id,
        trackUrl: result.data.url,
        duration: result.data.duration
      };
    }

    return result;
  }

  /**
   * Upload artwork
   * @param {File} artworkFile - Image file (min 3000x3000px)
   */
  async uploadArtwork(artworkFile) {
    const formData = new FormData();
    formData.append('file', artworkFile);

    const result = await this.post(
      `${API_CONFIG.distrokid.endpoints.releases}/artwork`,
      formData,
      { useFormData: true }
    );

    if (result.success) {
      return {
        success: true,
        artworkId: result.data.id,
        artworkUrl: result.data.url
      };
    }

    return result;
  }

  /**
   * Create release from project
   * @param {Object} project
   * @param {File} audioFile - Audio file
   * @param {File} artworkFile - Cover image
   */
  async releaseFromProject(project, audioFile, artworkFile) {
    const meta = project.metadata || {};

    // 1. Upload track
    const trackResult = await this.uploadTrack(audioFile);
    if (!trackResult.success) {
      return trackResult;
    }

    // 2. Upload artwork
    const artworkResult = await this.uploadArtwork(artworkFile);
    if (!artworkResult.success) {
      return artworkResult;
    }

    // 3. Create release
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 14); // 2 weeks from now

    const releaseParams = {
      artistName: meta.artistName || 'Artist',
      title: meta.songName || project.name,
      releaseType: meta.releaseType || 'single',
      genre: meta.genre || 'Pop',
      subgenre: meta.subgenre || '',
      releaseDate: releaseDate.toISOString().split('T')[0],
      tracks: [
        {
          title: meta.songName || project.name,
          track_id: trackResult.trackId,
          explicit: false,
          language: 'de'
        }
      ],
      artwork: {
        artwork_id: artworkResult.artworkId
      }
    };

    return this.createRelease(releaseParams);
  }

  /**
   * Get all releases for artist
   */
  async getArtistReleases() {
    return this.get(API_CONFIG.distrokid.endpoints.releases);
  }

  /**
   * Delete release
   * @param {string} releaseId
   */
  async deleteRelease(releaseId) {
    return this.delete(`${API_CONFIG.distrokid.endpoints.releases}/${releaseId}`);
  }
}

export default new DistroKidService();
