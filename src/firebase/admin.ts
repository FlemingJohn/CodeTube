import { initializeApp, getApps, App } from 'firebase-admin/app';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }
  // Initialize without credentials, relies on GAE default credentials
  return initializeApp();
}
