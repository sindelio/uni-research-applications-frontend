import env from '../../client-envs/current.js';
import { onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../helpers/check-session-jwt.js';
import Navbar from '../../components/app/navbar.jsx';
import Heading from '../../components/app/heading.jsx';
import P from '../../components/app/paragraph.jsx';
import Button from '../../components/app/button.jsx';

const { SUPPORT_EMAIL } = env;

async function listenToEmailToClipboard() {
  const emailEl = document.getElementById('email');
  emailEl.addEventListener('click', async () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    await Swal.fire({
      title: 'Sucesso',
      text: `Endereço eletrônico "${SUPPORT_EMAIL}" copiado para área de transferência.`,
      confirmButtonText: 'OK',
    });
  });
}

function Support() {
  onMount(async () => {
    await checkSessionJwt();
    await listenToEmailToClipboard();
  });
  return (
    <div class="flex flex-row text-lg">
      <Navbar></Navbar>
      <div class="ml-72 m-8">
        {/* Heading */}
        <Heading>Suporte</Heading>

        {/* Support message */}
        <P>
          Para obter suporte envie um e-mail descrevendo sua solicitação para:
        </P>
        <Button id="email">{SUPPORT_EMAIL}</Button>
        <br />

        {/* LGPD */}
        <P>
          Os direitos garantidos pela Lei Geral de Proteção de Dados - LGPD,
          <br />
          podem ser solicitados via email.
          <br />
          Exemplos:
          <ul class="list-disc ml-6">
            <li>Deleção completa da conta;</li>
            <li>Obtenção de uma cópia dos seus dados.</li>
          </ul>
        </P>
        <br />

        {/* Report problems */}
        <P>
          Esta plataforma está em fase de testes (alfa). Por gentileza reporte
          problemas ou bugs caso encontre algum.
        </P>
      </div>
    </div>
  );
}

export default Support;
