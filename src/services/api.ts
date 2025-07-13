export const API_BASE_URL = 'http://152.53.241.72:4500';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (response.ok) {
        return { data };
      } else {
        return { error: data.error || 'Request failed' };
      }
    } catch (error) {
      return { error: 'Network error. Please check your connection.' };
    }
  }

  // Authentication endpoints
  static async login(phone: string, password: string) {
    return this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  }

  static async register(phone: string, password: string, name: string) {
    return this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, password, name }),
    });
  }

  // Contact endpoints
  static async searchContact(phoneNumber: string, token: string) {
    return this.makeRequest('/api/contacts/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ phoneNumber }),
    });
  }

  static async uploadContacts(contacts: Array<{ name: string; phone: string }>, token: string) {
    return this.makeRequest('/api/contacts/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contacts }),
    });
  }

  static async getMyContacts(token: string) {
    return this.makeRequest('/api/contacts/my-contacts', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Health check
  static async healthCheck() {
    return this.makeRequest('/health');
  }
}

export default ApiService; 