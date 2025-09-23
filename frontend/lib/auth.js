// User authentication utilities
export const getUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const user = localStorage.getItem('kokendUser');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setUser = (userData) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('kokendUser', JSON.stringify(userData));
};

export const clearUser = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('kokendUser');
};

export const isAuthenticated = () => {
  return getUser() !== null;
};

export const requireAuth = (router) => {
  const user = getUser();
  if (!user) {
    router.push('/login');
    return false;
  }
  return user;
};