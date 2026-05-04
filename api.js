const API_URL = 'https://tcc-loja-node.railway.app';

function api(path, options = {}) {
  return fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });
}