export const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

export const formatTimeAgo = (isoString) => {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format event dateTime for display: "March 14, 20:00"
export const formatEventDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${month} ${day}, ${hour}:${min}`;
};

// Parse dateTime into parts for the poster date widget
export const parseDateParts = (isoString) => {
  if (!isoString) return { day: '--', month: '--', hour: '--', min: '--' };
  const date = new Date(isoString);
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    hour: String(date.getHours()).padStart(2, '0'),
    min: String(date.getMinutes()).padStart(2, '0'),
  };
};

export const truncate = (str, maxLen = 100) =>
  str && str.length > maxLen ? str.slice(0, maxLen) + '…' : str;

export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Default location: Rome, Italy
export const DEFAULT_LOCATION = {
  latitude: 41.9028,
  longitude: 12.4964,
};

export const DEFAULT_DELTA = {
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};
