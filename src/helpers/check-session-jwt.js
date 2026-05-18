import env from '../client-envs/current.js';

const { LOCAL_STORAGE_JWT } = env;

async function checkSessionJwt() {
  const jwt = localStorage.getItem(LOCAL_STORAGE_JWT);
  if (jwt === '') {
    window.location.href = '/app/signin';
  }
}

export default checkSessionJwt;
