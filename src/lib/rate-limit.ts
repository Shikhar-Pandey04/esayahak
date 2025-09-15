import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (in production, use Redis)
const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest, identifier: string) => {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Clean up old entries
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < windowStart) {
        delete store[key];
      }
    });
    
    // Get or create entry for this identifier
    if (!store[identifier]) {
      store[identifier] = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }
    
    const entry = store[identifier];
    
    // Reset if window has passed
    if (entry.resetTime < now) {
      entry.count = 0;
      entry.resetTime = now + config.windowMs;
    }
    
    // Increment counter
    entry.count++;
    
    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      const resetIn = Math.ceil((entry.resetTime - now) / 1000);
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: entry.resetTime,
        resetIn,
        message: config.message || `Rate limit exceeded. Try again in ${resetIn} seconds.`,
      };
    }
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  };
}

// Helper to get client identifier
export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return ip;
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many API requests. Please try again later.',
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 auth attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again later.',
  },
  csvImport: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 CSV imports per hour
    message: 'Too many CSV import attempts. Please try again later.',
  },
};
