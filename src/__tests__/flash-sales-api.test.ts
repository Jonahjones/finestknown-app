// API contract tests for flash sales

import { getActiveFlashSales } from '../api/discounts';

// Mock Supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => ({
                    data: [],
                    error: null
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    }))
  }
}));

describe('Flash Sales API', () => {
  test('should return flash sales response with correct structure', async () => {
    const response = await getActiveFlashSales(12);
    
    expect(response).toHaveProperty('items');
    expect(response).toHaveProperty('serverTime');
    expect(Array.isArray(response.items)).toBe(true);
    expect(typeof response.serverTime).toBe('string');
  });

  test('should limit results to specified limit', async () => {
    const limit = 5;
    const response = await getActiveFlashSales(limit);
    
    expect(response.items.length).toBeLessThanOrEqual(limit);
  });

  test('should return server time in ISO format', async () => {
    const response = await getActiveFlashSales(12);
    
    // Check if it's a valid ISO date string
    expect(() => new Date(response.serverTime)).not.toThrow();
    expect(new Date(response.serverTime).toISOString()).toBe(response.serverTime);
  });
});









