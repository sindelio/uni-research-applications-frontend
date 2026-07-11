import { onMount } from 'solid-js';
import { A } from '@solidjs/router';
import Swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.css';

async function listenToEmailToClipboard() {
  const emailEl = document.getElementById('email');
  emailEl.addEventListener('click', async () => {
    navigator.clipboard.writeText('enpcv.unesp@gmail.com');
    await Swal.fire({
      title: 'Sucesso',
      text: 'Endereço eletrônico "enpcv.unesp@gmail.com" copiado para área de transferência.',
      confirmButtonText: 'OK',
    });
  });
}

async function listenToHomeScroll() {
  const homeEl = document.getElementById('home');
  homeEl.addEventListener('click', () => {
    // Verifica se o usuário já se encontra na URL Home da aplicação
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

function Footer() {
  onMount(async () => {
    await listenToEmailToClipboard();
    await listenToHomeScroll();
  });
  return (
    <footer class="bg-gray-100 p-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 text-center">
        {/* OTHER LINKS */}
        <div class="col-start-1 col-span-1 md:col-start-2 col-span-2 text-3xl text-purple-500">
          <div class="flex flex-row justify-center">
            <A id="home" href="/" class="p-6">
              <i class="fa fa-house px-4"></i>
            </A>
            <button id="email" title="Copy email to clipboard" class="p-6">
              <i class="fa fa-envelope px-4"></i>
            </button>
            <A
              id="instagram"
              href="https://www.instagram.com/enpcv2026"
              target="_blank"
              rel="noopener noreferrer"
              class="p-6"
            >
              <i class="fa-brands fa-instagram px-4"></i>
            </A>
          </div>
        </div>

        {/* DIVIDER */}
        <div class="col-start-1 sm:col-span-2 md:col-start-2 md:col-span-2 p-0 h-0 border-1 rounded"></div>

        {/* FINAL MESSAGE */}
        <p class="col-start-1 sm:col-span-2 md:col-start-1 md:col-span-4 pt-4 text-purple-400 text-center text-sm">
          Copyright © UNESP Jaboticabal - FCAV - GECITO
          <br />
          Laboratório de Patologia Clínica Veterinária Prof. Dr. Joaquim Martins
          Ferreira Neto
          <br />
          Made with ♡
        </p>
      </div>
    </footer>
  );
}

export default Footer;
