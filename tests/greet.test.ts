import { greet } from '../src/greet';

describe('greet', () => {
  it('returns English greeting', () => {
    expect(greet('en')).toBe('Hello, World!');
  });

  it('returns Japanese greeting', () => {
    expect(greet('ja')).toBe('こんにちは、世界！');
  });

  it('returns Spanish greeting', () => {
    expect(greet('es')).toBe('¡Hola, Mundo!');
  });

  it('defaults to English when no language is provided', () => {
    expect(greet()).toBe('Hello, World!');
  });
});
