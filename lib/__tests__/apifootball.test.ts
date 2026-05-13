import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getApiStatus } from '@/lib/apifootball';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('API Football Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockedAxios.create as any).mockReturnValue({
        get: vi.fn().mockResolvedValue(mockResponse),
      } as unknown as typeof axios);

      const result = await getApiStatus();
      expect(result).toEqual(mockResponse.data.response);
    });

    it('should handle API errors', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockedAxios.create as any).mockReturnValue({
        get: vi.fn().mockRejectedValue(new Error('API Error')),
      } as unknown as typeof axios);

      await expect(getApiStatus()).rejects.toThrow('API Error');
    });
  });
});