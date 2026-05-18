import env from '../../client-envs/current';
import { onMount } from 'solid-js';
import Swal from 'sweetalert2';

const { LOCAL_STORAGE_JWT, LOCAL_STORAGE_USER_TYPE } = env;

const userType = localStorage.getItem(LOCAL_STORAGE_USER_TYPE);

async function windowWidthHandler() {
  const windowInnerWidth = window.innerWidth;
  const desktopNavbar = document.getElementById('navbar');
  if (windowInnerWidth < 768) {
    desktopNavbar.classList.add('hidden');
  } else {
    desktopNavbar.classList.remove('hidden');
  }
}

async function addWindowWidthListener() {
  window.addEventListener('resize', windowWidthHandler);
}

async function addSignOutListener() {
  const signOutEl = document.getElementById('signOut');
  signOutEl.addEventListener('click', async () => {
    await Swal.fire({
      title: 'Sucesso',
      text: 'Sessão encerrada.',
      confirmButtonText: 'OK',
    });
    localStorage.setItem(LOCAL_STORAGE_JWT, '');
    window.location.href = '/app/signin';
  });
}

function Navbar() {
  onMount(async () => {
    await addWindowWidthListener();
    await addSignOutListener();
  });

  return (
    // These classes work together to create the fixed behavior with a screen height: h-screen fixed flex
    <div id="navbar" class="h-screen fixed flex text-sm text-white">
      <div
        id="desktopNavbar"
        class="w-48 p-4 bg-purple-600 transition duration-300 ease-in-out"
      >
        <img
          id="hat"
          src="/images/icon.jpeg"
          alt="Icon"
          class="mx-auto my-4 w-16 h-16"
        />
        <nav class="mx-auto text-center">
          <a
            href={`/app/${userType}/dashboard`}
            class=" flex my-2 p-3 rounded-lg transition duration-200 hover:bg-purple-800"
          >
            <img
              id="dashboard"
              src="/images/dashboard.svg"
              class="h-6 w-6"
            ></img>
            <span class="ml-4 mt-0.5">Dashboard</span>
          </a>
          <a
            href={`/app/${userType}/project`}
            class=" flex my-2 p-3 rounded-lg transition duration-200 hover:bg-purple-800"
          >
            <img id="api" src="/images/api.svg" class="h-6 w-6"></img>
            <span class="ml-4 mt-0.5">Projetos</span>
          </a>
          <a
            href={`/app/${userType}/account`}
            class="flex my-2 p-3 rounded-lg transition duration-200 hover:bg-purple-800"
          >
            <img id="account" src="/images/account.svg" class="h-6 w-6"></img>
            <span class="ml-4 mt-0.5">Conta</span>
          </a>
          <a
            href="/app/support"
            class="flex my-2 p-3 rounded-lg transition duration-200 hover:bg-purple-800"
          >
            <img id="support" src="/images/support.svg" class="h-6 w-6"></img>
            <span class="ml-4 mt-0.5">Suporte</span>
          </a>
          <hr class="w-[80%] h-[0.15rem] mx-auto my-8 bg-white rounded-2xl"></hr>
          <button
            id="signOut"
            type="button"
            class="flex mx-auto p-3 rounded-lg transition duration-200 hover:bg-purple-800 hover:cursor-pointer"
          >
            <img id="support" src="/images/sign-out.svg" class="h-6 w-6"></img>
            <span class="ml-4 mt-0.5">Sair</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
