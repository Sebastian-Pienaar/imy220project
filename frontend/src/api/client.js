
let API_BASE = '/api';
try {
  if (typeof process !== 'undefined' && process.env && process.env.API_BASE) {
    API_BASE = process.env.API_BASE;
  }
} catch (_) {
  // ignore
}

let authToken = null;
export function setAuthToken(t) { authToken = t; }

async function http(path, { method='GET', body, headers, timeout = 10000 } = {}) {
  const finalHeaders = { 'Content-Type': 'application/json', ...(headers||{}) };
  if (authToken) finalHeaders['Authorization'] = `Bearer ${authToken}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const res = await fetch(API_BASE + path, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Request failed ${res.status}: ${text}`);
    }
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

//Bootstrap
export async function fetchBootstrap() { 
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Bootstrap] Attempt ${attempt}/${maxRetries}`);
      const result = await http('/bootstrap', { timeout: 15000 });
      console.log('[Bootstrap] Success');
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`[Bootstrap] Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
  
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`[Bootstrap] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('[Bootstrap] All attempts failed');
  throw lastError;
}

//Auth
export function loginApi(usernameOrEmail, password) { return http('/auth/login', { method:'POST', body:{ usernameOrEmail, password } }); }
export function signupApi({ username, name, email, password }) { return http('/auth/signup', { method:'POST', body:{ username, name, email, password } }); }

//Users
export function searchUsersApi(q) { return http(`/users/search?q=${encodeURIComponent(q)}`); }
export function listUsersApi() { return http('/users'); }
export function getUserApi(id) { return http(`/users/${id}`); }
export function updateUserApi(id, patch) { return http(`/users/${id}`, { method:'PATCH', body: patch }); }

// Projects
export function listProjectsApi() { return http('/projects'); }
export function getProjectApi(id) { return http(`/projects/${id}`); }
export function createProjectApi(data) { return http('/projects', { method:'POST', body:data }); }
export function updateProjectApi(id, patch) { return http(`/projects/${id}`, { method:'PATCH', body: patch }); }
export function addCheckInApi(projectId, data) { return http(`/projects/${projectId}/checkins`, { method:'POST', body:data }); }
export function searchCheckInsApi(q) { return http(`/projects/search/checkins?q=${encodeURIComponent(q)}`); }
export function checkoutProjectApi(id, userId) { return http(`/projects/${id}/checkout`, { method:'PATCH', body:{ userId } }); }
export function returnProjectApi(id, userId) { return http(`/projects/${id}/return`, { method:'PATCH', body:{ userId } }); }
export function deleteProjectApi(id, userId) { return http(`/projects/${id}?userId=${userId}`, { method:'DELETE' }); }

//Friendships
export function listFriendshipsApi(userId) { return http(`/friendships/user/${userId}`); }
export function createFriendRequestApi(requesterId, recipientId) { return http('/friendships', { method:'POST', body:{ requesterId, recipientId } }); }
export function acceptFriendRequestApi(id) { return http(`/friendships/${id}/accept`, { method:'PATCH' }); }
export function deleteFriendshipApi(id) { return http(`/friendships/${id}`, { method:'DELETE' }); }

export default {
  fetchBootstrap,
  loginApi,
  signupApi,
  searchUsersApi,
  listUsersApi,
  getUserApi,
  updateUserApi,
  listProjectsApi,
  getProjectApi,
  createProjectApi,
  updateProjectApi,
  addCheckInApi,
  searchCheckInsApi,
  checkoutProjectApi,
  returnProjectApi,
  deleteProjectApi,
  listFriendshipsApi,
  createFriendRequestApi,
  acceptFriendRequestApi,
  deleteFriendshipApi,
  setAuthToken
};
