import env from '../client-envs/current.js';
import Swal from 'sweetalert2';
import exists from './exists.js';

const {
  LOCAL_STORAGE_JWT,
  BACKEND_URL,
  SUPPORT_EMAIL,
} = env;

async function request(method, path, data, isAuth) {
  try {
    const options = { 
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (method !== 'GET' && exists(data)) {
      options.body = JSON.stringify(data);
    }
    if (isAuth) {
      const jwt = localStorage.getItem(LOCAL_STORAGE_JWT);
      options.headers.authorization = `Bearer ${jwt}`;
    }
    const url = `${BACKEND_URL}${path}`;
    const response = await fetch(url, options);
    const responseJson = await response.json();
    return responseJson;
  } catch (err) {
    console.error(err);
    await Swal.fire({
      title: 'Oops',
      text: `Algo inesperado aconteceu. Por favor busque suporte no endereço eletrônico ${SUPPORT_EMAIL}`,
      confirmButtonText: 'OK',
    });
  }
}

export default request;
