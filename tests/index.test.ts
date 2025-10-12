import { describe, it, expect } from 'vitest';
import { main } from '../src/index';

describe('miyabi-project-01', () => {
  it('should run main function without errors', () => {
    expect(() => main()).not.toThrow();
  });
});
