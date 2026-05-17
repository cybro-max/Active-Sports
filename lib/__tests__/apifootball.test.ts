import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios with a factory so it's initialized before apifootball is imported
vi.mock('axios', () => {
  const mockGet = vi.fn();
  const mockInstance = {
    get: mockGet,
  };
  return {
    default: {
      create: vi.fn(() => mockInstance),
      isAxiosError: vi.fn(),
    },
  };
});

// Import after defining mock
import { getApiStatus } from '@/lib/apifootball';

describe('API Football Client', () => {
  // Retrieve the mocked get function from the created axios instance
  const mockGet = vi.mocked(axios.create()).get;

  beforeEach(() => {
    vi.mocked(mockGet).mockReset();
  });

  describe('getApiStatus', () => {
    it('should return API status data', async () => {
      const mockResponse = {
        data: {
          response: {
            account: { firstname: 'Test', lastname: 'User' },
            requests: { current: 10, limit_day: 100 },
            subscription: { plan: 'Free', active: true },
          },
        },
      };

      vi.mocked(mockGet).mockResolvedValue(mockResponse);

      const result = await getApiStatus();
      expect(result).toEqual(mockResponse.data.response);
      expect(mockGet).toHaveBeenCalledWith('/status');
    });

    it('should handle API errors', async () => {
      vi.mocked(mockGet).mockRejectedValue(new Error('API Error'));

      await expect(getApiStatus()).rejects.toThrow('API Error');
    });
  });
});