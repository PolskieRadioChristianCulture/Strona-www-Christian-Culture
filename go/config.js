/** Public-only UI configuration. Never put API keys or secrets here. */
export const CONFIG = Object.freeze({
  origin: 'https://polskieradio.cc',
  base: '/go/',
  searchUrl: '/wyszukiwarka',
  privacyUrl: '/polityka-prywatnosci', // Verify canonical privacy route before launch.
  analytics: {
    enabled: false,
    measurementId: '', // e.g. G-XXXXXXXXXX; do not activate without consent checks.
    consentGranted: false
  }
});
