/**
 * API Services Index
 * Export all API services
 *
 * Built by Claude for Don Key
 */

export { default as sunoService } from './suno';
export { default as youtubeService } from './youtube';

// Lazy-loaded services (create on demand)
export const getDreamEditService = async () => {
  const module = await import('./dreamedit');
  return module.default;
};

export const getDistroKidService = async () => {
  const module = await import('./distrokid');
  return module.default;
};

export const getElevenLabsService = async () => {
  const module = await import('./elevenlabs');
  return module.default;
};

// Re-export client for custom services
export { default as APIClient } from './client';
