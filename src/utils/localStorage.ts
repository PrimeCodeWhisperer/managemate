/**
 * Clear all application-related localStorage data
 */
export const clearAppCache = () => {
  const keysToRemove = [
    'employees',
    'userData', 
    'cacheVersion'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('Application cache cleared');
};

/**
 * Clear localStorage and reload the page
 */
export const clearCacheAndReload = () => {
  clearAppCache();
  window.location.reload();
};

/**
 * Clear localStorage and redirect to login
 */
export const clearCacheAndLogout = () => {
  clearAppCache();
  window.location.href = '/login';
};

/**
 * Force cache refresh by incrementing version
 */
export const invalidateCache = () => {
  const currentVersion = localStorage.getItem('cacheVersion') || '0';
  const newVersion = (parseFloat(currentVersion) + 0.1).toFixed(1);
  localStorage.setItem('cacheVersion', newVersion);
  console.log(`Cache version updated to ${newVersion}`);
};

/**
 * Clear specific cache items
 */
export const clearSpecificCache = (keys: string[]) => {
  keys.forEach(key => {
    localStorage.removeItem(key);
  });
  console.log(`Cleared cache for: ${keys.join(', ')}`);
};