/**
 * API Key Manager for Electron
 * Secure storage of API keys using Electron's safeStorage
 *
 * Built by Claude for Don Key
 */

import { app, safeStorage } from 'electron';
import fs from 'fs';
import path from 'path';

const API_KEYS_FILE = path.join(app.getPath('userData'), 'api-keys.enc');

/**
 * Load encrypted API keys from file
 */
function loadEncryptedKeys() {
  try {
    if (!fs.existsSync(API_KEYS_FILE)) {
      return {};
    }

    const data = fs.readFileSync(API_KEYS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load API keys:', error);
    return {};
  }
}

/**
 * Save encrypted API keys to file
 */
function saveEncryptedKeys(keys) {
  try {
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Failed to save API keys:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save API key (encrypted)
 */
export function saveApiKey(service, key) {
  try {
    // Check if encryption is available
    if (!safeStorage.isEncryptionAvailable()) {
      return {
        success: false,
        error: 'Encryption not available on this system'
      };
    }

    // Encrypt the key
    const encrypted = safeStorage.encryptString(key);
    const encryptedHex = encrypted.toString('hex');

    // Load existing keys
    const keys = loadEncryptedKeys();

    // Save encrypted key
    keys[service] = {
      encrypted: encryptedHex,
      createdAt: Date.now(),
      lastUsed: Date.now()
    };

    // Write to file
    const result = saveEncryptedKeys(keys);

    if (result.success) {
      console.log(`API key for ${service} saved successfully`);
    }

    return result;
  } catch (error) {
    console.error('Failed to encrypt and save API key:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get API key (decrypted)
 */
export function getApiKey(service) {
  try {
    const keys = loadEncryptedKeys();

    if (!keys[service]) {
      return { success: false, error: 'API key not found' };
    }

    // Decrypt the key
    const encryptedBuffer = Buffer.from(keys[service].encrypted, 'hex');
    const decrypted = safeStorage.decryptString(encryptedBuffer);

    // Update last used timestamp
    keys[service].lastUsed = Date.now();
    saveEncryptedKeys(keys);

    return {
      success: true,
      key: decrypted,
      createdAt: keys[service].createdAt,
      lastUsed: keys[service].lastUsed
    };
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete API key
 */
export function deleteApiKey(service) {
  try {
    const keys = loadEncryptedKeys();

    if (!keys[service]) {
      return { success: false, error: 'API key not found' };
    }

    delete keys[service];
    const result = saveEncryptedKeys(keys);

    if (result.success) {
      console.log(`API key for ${service} deleted successfully`);
    }

    return result;
  } catch (error) {
    console.error('Failed to delete API key:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List all stored API key services (without keys)
 */
export function listApiKeys() {
  try {
    const keys = loadEncryptedKeys();

    const services = Object.keys(keys).map(service => ({
      service,
      createdAt: keys[service].createdAt,
      lastUsed: keys[service].lastUsed,
      hasKey: true
    }));

    return { success: true, services };
  } catch (error) {
    console.error('Failed to list API keys:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if API key exists for service
 */
export function hasApiKey(service) {
  const keys = loadEncryptedKeys();
  return !!keys[service];
}

/**
 * Clear all API keys (use with caution!)
 */
export function clearAllApiKeys() {
  try {
    if (fs.existsSync(API_KEYS_FILE)) {
      fs.unlinkSync(API_KEYS_FILE);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to clear API keys:', error);
    return { success: false, error: error.message };
  }
}
