import Waves from '../../components/app/waves.jsx';
import env from '../../client-envs/current.js';
import { onMount } from 'solid-js';
import Swal from 'sweetalert2';
import exists from '../../helpers/exists.js';
import request from '../../helpers/request.js';
import Anchor from '../../components/app/anchor.jsx';
import InputText from '../../components/app/input-text.jsx';
import OutsideImage from '../../components/app/outside-image.jsx';

const { SUPPORT_EMAIL } = env;

async function getQueryParams() {
  const urlQueryParams = new URLSearchParams(window.location.search);
  const email = urlQueryParams.get('email');
  const userType = urlQueryParams.get('userType');
  if (!exists(email) || !exists(userType)) {
    await Swal.fire({
      title: 'Oops',
      text: `Algo inesperado aconteceu. Busque suporte no endereço eletrônico "${SUPPORT_EMAIL}"`,
      confirmButtonText: 'OK',
    });
  }
  return { email, userType };
}

async function confirmEmail(email, userType) {
  Swal.fire({ title: 'Please wait ...' });
  const path = `/${userType.toLowerCase()}/confirm-email`;
  const responseJson = await request('POST', path, { email }, null);
  if (responseJson.error) {
    await Swal.fire({
      title: 'Oops',
      text: responseJson?.error?.message,
      confirmButtonText: 'OK',
    });
  } else {
    await Swal.fire({
      title: 'Sucesso',
      text: 'Seu email foi confirmado!',
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/signin';
  }
}

function EmailConfirmation() {
  onMount(async () => {
    const { email, userType } = await getQueryParams();
    await confirmEmail(email, userType);
  });
  return (
    <div
      class="grid grid-cols-1 md:grid-cols-10 md:text-lg text-center"
      style={{ 'font-family': 'Poppins, sans-serif' }}
    >
      <div class="col-start-1 col-span-1 md:col-start-1 md:col-span-full text-3xl md:text-5xl">
        <h1 class="font-[Wizzta] p-8 text-purple-600">ENPCV</h1>
      </div>
      <div class="col-start-1 col-span-1 md:col-start-3 md:col-span-6 flex flex-row p-4 bg-white border-2 border-purple-500 rounded-2xl">
        <div class="grid grid-cols-2">
          <div class="col-start-1 col-span-2 md:col-span-1 flex flex-col">
            <InputText inputClass="invisible w-[90%] my-0 py-0 text-center"></InputText>
            <Anchor href="/signin" inputClass="mx-auto mt-[10%] mb-[20%]">
              Entrar
            </Anchor>
          </div>
          <OutsideImage></OutsideImage>
        </div>
      </div>
      <Waves />
    </div>
  );
}

export default EmailConfirmation;
