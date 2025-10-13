import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GrokClient } from '../src/grok-client';

describe('GrokClient', () => {
  beforeEach(() => {
    // Reset environment
    vi.stubEnv('GROK_API_KEY', 'test-api-key');
  });

  it('should throw error if API key is not provided', () => {
    vi.unstubAllEnvs();
    expect(() => new GrokClient()).toThrow('GROK_API_KEY not found');
  });

  it('should initialize with API key from constructor', () => {
    expect(() => new GrokClient('custom-key')).not.toThrow();
  });

  it('should initialize with API key from environment', () => {
    expect(() => new GrokClient()).not.toThrow();
  });
});
