export const GREETS: Record<'en'|'ja'|'es', string> = {
  en: 'Hello, World!',
  ja: 'こんにちは、世界！',
  es: '¡Hola, Mundo!'
};

export function greet(language: 'en'|'ja'|'es' = 'en'): string {
  return GREETS[language];
}
