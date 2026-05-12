import env from '../../client-envs/current.js';
import { createSignal, onMount } from 'solid-js';
import { A } from '@solidjs/router';

const { FRONTEND_URL } = env;

const [getMenuVisibility, setMenuVisibility] = createSignal(false);

const [getDropdownVisibility, setDropdownVisibility] = createSignal([
  false,
  false,
  false,
  false,
]);

async function listenToResponsiveMenu() {
  const menuIconEl = document.getElementById('menuIcon');
  menuIconEl.addEventListener('click', () => {
    const navContentEl = document.getElementById('navContent');
    const visibility = getMenuVisibility();
    if (visibility === false) {
      setMenuVisibility(true);
      navContentEl.classList.remove('hidden');
      menuIconEl.classList.remove('fa-bars');
      menuIconEl.classList.add('fa-x');
    } else {
      setMenuVisibility(false);
      navContentEl.classList.add('hidden');
      menuIconEl.classList.remove('fa-x');
      menuIconEl.classList.add('fa-bars');
    }
  });
}

async function listenToDropdowns() {
  const dropdownEls = document.getElementsByClassName('dropdownButton');
  const listEls = document.getElementsByClassName('dropdownList');
  for (let i = 0; i < dropdownEls.length; i += 1) {
    const dropdownEl = dropdownEls[i];
    const listEl = listEls[i];
    dropdownEl.addEventListener('click', async () => {
      const isVisible = getDropdownVisibility()[i];
      if (isVisible === false) {
        listEl.removeAttribute('hidden');
        const visibility = getDropdownVisibility();
        visibility[i] = true;
        setDropdownVisibility(visibility);
      } else if (isVisible === true) {
        listEl.setAttribute('hidden', '');
        const visibility = getDropdownVisibility();
        visibility[i] = false;
        setDropdownVisibility(visibility);
      }
    });
    // Hide on scroll movement
    window.addEventListener('scroll', () => {
      listEl.setAttribute('hidden', '');
      setDropdownVisibility([false, false, false, false]);
    });
    // Hide on mouse wheel movement
    listEl.addEventListener('wheel', (event) => {
      listEl.setAttribute('hidden', '');
      setDropdownVisibility([false, false, false, false]);
    });
    // Hide all dropdowns on any list click
    listEl.addEventListener('click', async () => {
      for (let currentListEl of listEls) {
        currentListEl.setAttribute('hidden', '');
      }
      setDropdownVisibility([false, false, false, false]);
    });
  }
}

function Navbar() {
  onMount(async () => {
    await listenToDropdowns();
    await listenToResponsiveMenu();
  });
  return (
    <nav
      id="nav"
      class="flex flex-col md:flex-row md:w-full justify-between items-center px-4 bg-white text-purple-500"
    >
      {/* BRAND */}
      <div class="flex justify-between items-center w-full md:w-auto">
        {/* BRAND ICON */}
        <A href="/" class="flex items-center md:pr-16">
          <img src="/images/icon.jpeg" alt="ENPCV" class="w-28 h-20" />
          <div
            style={{ 'font-family': 'Wizzta' }}
            class="hidden xs:block text-3xl pl-2 lg:text-4xl lg:pl-6"
          >
            ENPCV
          </div>
        </A>

        {/* MENU ICON */}
        <div class="md:hidden">
          <i id="menuIcon" class="fa-solid fa-bars md:hidden text-xl"></i>
        </div>
      </div>

      {/* NAVIGATION CONTENT */}
      <div
        id="navContent"
        class="hidden md:flex md:w-full md:justify-end text-center px-4"
      >
        {/* DROPDOWN BUTTONS */}
        <ul id="dropdowns" class="md:flex md:my-auto">
          {/* INTRO DROPDOWN */}
          <li class="md:px-2 lg:px-8">
            <button
              id="introDropdown"
              type="button"
              class="dropdownButton p-2 transform transition hover:scale-110 duration-300 ease-in-out"
            >
              Intro ⌄
            </button>
            <ul
              id="introList"
              hidden={true}
              class="dropdownList fixed bg-white z-40 rounded-lg border-2 border-purple-400 shadow list-none text-left"
            >
              <li id="introItem1" class="p-2">
                <A href="/event" class="p-2">
                  Evento
                </A>
              </li>
              <li id="introItem2" class="p-2">
                <A href="/organization" class="p-2">
                  Realização
                </A>
              </li>
              <li id="introItem3" class="p-2">
                <A href="/support" class="p-2">
                  Apoio
                </A>
              </li>
              <li id="introItem4" class="p-2">
                <A href="/sponsors" class="p-2">
                  Patrocinadores
                </A>
              </li>
            </ul>
          </li>
        </ul>

        {/* LINK BUTTON */}
        <button
          id="certificates"
          class="px-8 py-4 md:py-0 hover:underline rounded-full focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
        >
          <A href="/certificates" class="">
            Certificados
          </A>
        </button>

        {/* SIGNIN BUTTON */}
        <button
          id="signin"
          class="px-10 py-4 md:py-0 hover:underline rounded-full focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
        >
          <a
            href={`${FRONTEND_URL}/app/signin`}
            target="_blank"
            rel="noreferrer"
          >
            Entrar
          </a>
        </button>

        {/* SIGNUP BUTTON */}
        <button
          id="singup"
          class="px-6 py-4 text-white bg-purple-600 hover:underline rounded-full shadow opacity-75 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
        >
          <a
            href={`${FRONTEND_URL}/app/signup`}
            target="_blank"
            rel="noreferrer"
          >
            Cadastrar
          </a>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
