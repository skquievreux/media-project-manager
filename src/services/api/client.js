/**
 * API Base Client
 * Generic HTTP client with retry, timeout, and error handling
 *
 * Built by Claude for Don Key
 */

import { API_CONFIG, API_ERRORS } from '../../config/api.config';

class APIClient {
  constructor(service) {
    this.config = API_CONFIG[service];
    this.service = service;
    this.requestQueue = [];
    this.activeRequests = 0;
  }

  /**
   * Generic request method
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      timeout = this.config.timeout,
      retries = this.config.retries,
      useFormData = false
    } = options;

    const url = `${this.config.baseUrl}${endpoint}`;

    // Get API key securely
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error(API_ERRORS.UNAUTHORIZED);
    }

    const requestOptions = {
      method,
      headers: {
        ...this.getDefaultHeaders(apiKey),
        ...headers
      }
    };

    // Add body if present
    if (body) {
      if (useFormData) {
        requestOptions.body = body; // FormData
      } else {
        requestOptions.body = JSON.stringify(body);
        requestOptions.headers['Content-Type'] = 'application/json';
      }
    }

    // Execute with retry logic
    return this.executeWithRetry(url, requestOptions, timeout, retries);
  }

  /**
   * Execute request with retry and timeout
   */
  async executeWithRetry(url, options, timeout, retries) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
          await this.handleHttpError(response);
        }

        // Parse response
        const data = await response.json();
        return { success: true, data };

      } catch (error) {
        lastError = error;

        // Don't retry on authentication errors
        if (error.message === API_ERRORS.UNAUTHORIZED) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await this.wait(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: this.formatError(lastError)
    };
  }

  /**
   * Handle HTTP errors
   */
  async handleHttpError(response) {
    switch (response.status) {
      case 401:
      case 403:
        throw new Error(API_ERRORS.UNAUTHORIZED);
      case 429:
        throw new Error(API_ERRORS.RATE_LIMIT);
      case 500:
      case 502:
      case 503:
        throw new Error(API_ERRORS.SERVER_ERROR);
      default:
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || API_ERRORS.INVALID_RESPONSE);
    }
  }

  /**
   * Get API key securely (from Electron or localStorage)
   */
  async getApiKey() {
    // In Electron: Get from secure storage
    if (window.electron) {
      try {
        const result = await window.electron.getApiKey?.(this.service);
        return result?.key;
      } catch (error) {
        console.error('Failed to get API key:', error);
        return null;
      }
    }

    // Fallback: localStorage (less secure, nur für Development)
    return localStorage.getItem(`api_key_${this.service}`);
  }

  /**
   * Get default headers
   */
  getDefaultHeaders(apiKey) {
    return {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    };
  }

  /**
   * Format error for user display
   */
  formatError(error) {
    if (error.name === 'AbortError') {
      return API_ERRORS.TIMEOUT;
    }
    if (error.message === 'Failed to fetch') {
      return API_ERRORS.NETWORK_ERROR;
    }
    return error.message || API_ERRORS.UNKNOWN;
  }

  /**
   * Wait helper for retry backoff
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export default APIClient;
