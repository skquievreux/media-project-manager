/**
 * VibeCoder API Service
 * Integration with Architecture Review Dashboard
 * 
 * Built by Claude for Don Key
 */

const VIBECODER_API = 'http://localhost:3000/api';
const API_KEY = 'uoriweuroirqwrwer';

class VibeCoderService {
  constructor() {
    this.baseURL = VIBECODER_API;
    this.apiKey = API_KEY;
  }

  // Helper: Make API Request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('VibeCoder API Error:', error);
      throw error;
    }
  }

  // ============================================================================
  // AI Features
  // ============================================================================

  /**
   * Generate architecture for a project
   * @param {Object} projectData - Project information
   * @returns {Promise<Object>} Architecture design
   */
  async generateArchitecture(projectData) {
    return this.request('/ai/architect', {
      method: 'POST',
      body: JSON.stringify({
        projectName: projectData.name,
        projectType: projectData.type,
        description: projectData.description,
        requirements: projectData.requirements || [],
        constraints: projectData.constraints || []
      })
    });
  }

  /**
   * Generate description for a project
   * @param {string} name - Project name
   * @param {string} type - Project type
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Generated description
   */
  async generateDescription(name, type, context = {}) {
    return this.request('/ai/describe', {
      method: 'POST',
      body: JSON.stringify({
        name,
        type,
        ...context
      })
    });
  }

  /**
   * Generate content using AI
   * @param {string} prompt - Generation prompt
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Generated content
   */
  async generateContent(prompt, context = {}) {
    return this.request('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        context
      })
    });
  }

  /**
   * Get AI reports
   * @returns {Promise<Array>} List of reports
   */
  async getReports() {
    return this.request('/ai/reports', {
      method: 'GET'
    });
  }

  /**
   * Create AI-powered tasks
   * @param {Object} taskData - Task information
   * @returns {Promise<Object>} Created tasks
   */
  async createAITasks(taskData) {
    return this.request('/ai/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  // ============================================================================
  // Task Management
  // ============================================================================

  /**
   * Get all tasks
   * @returns {Promise<Array>} List of tasks
   */
  async getTasks() {
    return this.request('/tasks', {
      method: 'GET'
    });
  }

  /**
   * Update tasks
   * @param {Object} updates - Task updates
   * @returns {Promise<Object>} Updated tasks
   */
  async updateTasks(updates) {
    return this.request('/tasks', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Verify tasks completion
   * @param {Array} taskIds - Task IDs to verify
   * @returns {Promise<Object>} Verification results
   */
  async verifyTasks(taskIds) {
    return this.request('/tasks/verify', {
      method: 'POST',
      body: JSON.stringify({ taskIds })
    });
  }

  // ============================================================================
  // Architecture Decisions (ADRs)
  // ============================================================================

  /**
   * Get all architecture decisions
   * @returns {Promise<Array>} List of decisions
   */
  async getDecisions() {
    return this.request('/architect/decisions', {
      method: 'GET'
    });
  }

  /**
   * Create architecture decision
   * @param {Object} decision - Decision data
   * @returns {Promise<Object>} Created decision
   */
  async createDecision(decision) {
    return this.request('/architect/decisions', {
      method: 'POST',
      body: JSON.stringify(decision)
    });
  }

  /**
   * Get specific decision
   * @param {string} id - Decision ID
   * @returns {Promise<Object>} Decision details
   */
  async getDecision(id) {
    return this.request(`/architect/decisions/${id}`, {
      method: 'GET'
    });
  }

  /**
   * Update decision
   * @param {string} id - Decision ID
   * @param {Object} updates - Decision updates
   * @returns {Promise<Object>} Updated decision
   */
  async updateDecision(id, updates) {
    return this.request(`/architect/decisions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Delete decision
   * @param {string} id - Decision ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteDecision(id) {
    return this.request(`/architect/decisions/${id}`, {
      method: 'DELETE'
    });
  }

  // ============================================================================
  // Portfolio & Repos
  // ============================================================================

  /**
   * Get portfolio overview
   * @returns {Promise<Object>} Portfolio data
   */
  async getPortfolio() {
    return this.request('/portfolio', {
      method: 'GET'
    });
  }

  /**
   * Get portfolio insights
   * @returns {Promise<Object>} Insights data
   */
  async getPortfolioInsights() {
    return this.request('/portfolio/insights', {
      method: 'GET'
    });
  }

  /**
   * Get all repositories
   * @returns {Promise<Array>} List of repos
   */
  async getRepos() {
    return this.request('/repos', {
      method: 'GET'
    });
  }

  /**
   * Get specific repository
   * @param {string} name - Repo name
   * @returns {Promise<Object>} Repo details
   */
  async getRepo(name) {
    return this.request(`/repos/${name}`, {
      method: 'GET'
    });
  }

  // ============================================================================
  // Analytics
  // ============================================================================

  /**
   * Check API health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    return this.request('/analytics/health', {
      method: 'GET'
    });
  }

  /**
   * Get logs
   * @returns {Promise<Array>} System logs
   */
  async getLogs() {
    return this.request('/logs', {
      method: 'GET'
    });
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  /**
   * Generate PDF
   * @param {Object} data - PDF data
   * @returns {Promise<Blob>} PDF blob
   */
  async generatePDF(data) {
    return this.request('/generate-pdf', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Check if API is available
   * @returns {Promise<boolean>} API availability
   */
  async isAvailable() {
    try {
      await this.checkHealth();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const vibeCoderAPI = new VibeCoderService();

// Export class for custom instances
export default VibeCoderService;

// ============================================================================
// Usage Examples
// ============================================================================

/*
// 1. Generate Architecture for new project
const architecture = await vibeCoderAPI.generateArchitecture({
  name: 'My Awesome Song',
  type: 'SINGLE_SONG',
  description: 'Hip-Hop track about space',
  requirements: ['Suno generation', 'Cover art', 'YouTube video']
});

// 2. Generate project description
const description = await vibeCoderAPI.generateDescription(
  'Album: Greatest Hits',
  'ALBUM',
  { genre: 'Pop', tracks: 22 }
);

// 3. Create AI-powered tasks
const tasks = await vibeCoderAPI.createAITasks({
  projectId: 'proj_123',
  projectType: 'KINDERBUCH',
  autoGenerate: true
});

// 4. Get all tasks and verify
const allTasks = await vibeCoderAPI.getTasks();
await vibeCoderAPI.verifyTasks(['task_1', 'task_2']);

// 5. Create architecture decision
const decision = await vibeCoderAPI.createDecision({
  title: 'Use React for UI',
  status: 'accepted',
  context: 'Need modern UI framework',
  decision: 'Use React 18 with Vite'
});

// 6. Check if API is available
if (await vibeCoderAPI.isAvailable()) {
  console.log('VibeCoder API is ready!');
}
*/
