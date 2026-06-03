import Waves from '../../components/app/waves.jsx';
import { onMount } from 'solid-js';
import Swal from 'sweetalert2';
import request from '../../helpers/request.js';
import Anchor from '../../components/app/anchor.jsx';
import Button from '../../components/app/button.jsx';
import InputText from '../../components/app/input-text.jsx';
import Select from '../../components/app/select.jsx';
import OutsideImage from '../../components/app/outside-image.jsx';

async function addSubmitListener() {
  const formEl = document.querySelector('#form');
  formEl.addEventListener(
    'submit',
    async (event) => {
      Swal.fire({ title: 'Um momento ...' });
      event.preventDefault(); // To stop the form from being sent automatically
      const formData = new FormData(formEl);
      const email = formData.get('email');
      const userType = formData.get('userType');
      const path = `/${userType}/recover-password`;
      const responseJson = await request('POST', path, { email });
      if (responseJson.success === true) {
        await Swal.fire({
          title: 'Sucesso',
          text: 'Um email de recuperação foi enviado para o seu endereço eletrônico. Caso não apareça na sua caixa de entrada, verifique em spam.',
          confirmButtonText: 'OK',
        });
        window.location.href = '/app/signin';
      } else if (responseJson?.error) {
        await Swal.fire({
          title: 'Oops',
          text: responseJson?.error?.message,
          confirmButtonText: 'OK',
        });
      }
    },
    false,
  );
}

function PasswordRecovery() {
  onMount(async () => {
    await addSubmitListener();
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
            <form id="form" class="flex flex-col">
              <Select id="userType" label="">
                <option value="participant">Participante</option>
                <option value="examiner">Avaliador</option>
                <option value="admin">Admin</option>
              </Select>
              <InputText
                id="email"
                placeholder="Email"
                required
                inputClass="w-[90%] my-2 text-center"
              ></InputText>
              <Button type="submit" id="submit" inputClass="mx-auto mb-2">
                Enviar email de recuperação
              </Button>
            </form>
            <hr class="w-[90%] h-[0.15rem] mx-auto my-6 bg-purple-400 rounded-2xl"></hr>
            <div class="mt-2 mb-6 flex flex-row justify-center">
              <Anchor href="/app/signin" inputClass="my-0 text-sm">
                Entrar
              </Anchor>
            </div>
          </div>
          <OutsideImage></OutsideImage>
        </div>
      </div>
      <Waves />
    </div>
  );
}

export default PasswordRecovery;
