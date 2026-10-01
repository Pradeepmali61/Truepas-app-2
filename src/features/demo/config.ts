/**
 * Demo mode — a self-contained design preview for stakeholders.
 * Enabled at build time with EXPO_PUBLIC_DEMO=true: the app opens on the
 * Demo Tour (/demo), every API call resolves against the mock fixtures, and
 * a floating "Tour" button returns to the screen catalogue from anywhere.
 */
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO === 'true';
