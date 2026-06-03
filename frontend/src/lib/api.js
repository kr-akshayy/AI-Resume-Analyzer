const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * API client wrapper with authentication support
 */
class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  getHeaders(isFormData = false) {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.isFormData),
    };

    // Don't set Content-Type for FormData (browser sets it automatically with boundary)
    if (options.isFormData) {
      delete config.headers['Content-Type'];
      delete config.isFormData;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.error || 'Request failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Network error', 0);
    }
  }

  // Auth endpoints
  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Resume endpoints
  async uploadResumes(files) {
    const formData = new FormData();
    files.forEach(file => formData.append('resumes', file));

    return this.request('/resumes/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  }

  async analyzeResumes(resumeIds, jobDescription, jobId = null) {
    return this.request('/resumes/analyze', {
      method: 'POST',
      body: JSON.stringify({ resumeIds, jobDescription, jobId }),
    });
  }

  async getResumes() {
    return this.request('/resumes');
  }

  async getResume(id) {
    return this.request(`/resumes/${id}`);
  }

  // Job endpoints
  async createJob(title, description) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  }

  async getJobs() {
    return this.request('/jobs');
  }

  async deleteJob(id) {
    return this.request(`/jobs/${id}`, { method: 'DELETE' });
  }
}

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const api = new ApiClient();
export default api;
export { ApiError };
