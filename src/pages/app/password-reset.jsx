import env from '../../client-envs/current.js';
import Waves from '../../components/app/waves.jsx';
import { onMount } from 'solid-js';
import Swal from 'sweetalert2';
import exists from '../../helpers/exists.js';
import request from '../../helpers/request.js';
import Anchor from '../../components/app/anchor.jsx';
import Button from '../../components/app/button.jsx';
import InputPassword from '../../components/app/input-password.jsx';
import OutsideImage from '../../components/app/outside-image.jsx';

const { SUPPORT_EMAIL } = env;

async function getQueryParams() {
  const urlQueryParams = new URLSearchParams(window.location.search);
  const email = urlQueryParams.get('email');
  const userType = urlQueryParams.get('userType');
  const token = urlQueryParams.get('token');
  if (!exists(email) || !exists(userType) || !exists(token)) {
    await Swal.fire({
      title: 'Oops',
      text: `Algo inesperado aconteceu. Busque suporte no endereço eletrônico "${SUPPORT_EMAIL}"`,
      confirmButtonText: 'OK',
    });
  }
  return { email, userType, token };
}

async function checkPasswordLength() {
  const passwordEl = document.getElementById('password');
  const passwordCheckLengthEl = document.getElementById('passwordCheckLength');
  const passwordLength = passwordEl?.value?.length;
  if (passwordLength >= 8) {
    passwordCheckLengthEl.classList.add('hidden');
    return true;
  } else {
    passwordCheckLengthEl.classList.remove('hidden');
    return false;
  }
}

async function checkPasswordMatch() {
  const passwordEl = document.getElementById('password');
  const repeatPasswordEl = document.getElementById('repeatPassword');
  const password = passwordEl?.value;
  const repeatPassword = repeatPasswordEl?.value;
  const passwordCheckMatchEl = document.getElementById('passwordCheckMatch');
  if (password === repeatPassword) {
    passwordCheckMatchEl.classList.add('hidden');
    return true;
  } else {
    passwordCheckMatchEl.classList.remove('hidden');
    return false;
  }
}

async function addPasswordChangeListener() {
  const passwordEl = document.getElementById('password');
  passwordEl.addEventListener('keyup', checkPasswordLength);
  const repeatPasswordEl = document.getElementById('repeatPassword');
  repeatPasswordEl.addEventListener('keyup', checkPasswordMatch);
}

async function addSubmitListener() {
  const formEl = document.querySelector('#form');
  formEl.addEventListener(
    'submit',
    async (event) => {
      Swal.fire({ title: 'Please wait ...' });
      event.preventDefault(); // To stop the form from being sent automatically
      const passwordCheckLength = await checkPasswordLength();
      if (passwordCheckLength === false) {
        await Swal.fire({
          title: 'Oops',
          text: 'Senha deve conter no mínimo 8 caracteres.',
          confirmButtonText: 'OK',
        });
        return null;
      }
      const passwordCheckMatch = await checkPasswordMatch();
      if (passwordCheckMatch === false) {
        await Swal.fire({
          title: 'Oops',
          text: 'Senhas devem ser iguais.',
          confirmButtonText: 'OK',
        });
        return null;
      }
      const formData = new FormData(formEl);
      const newPassword = formData.get('password');
      const { email, userType, token } = await getQueryParams();
      const path = `/${userType}/reset-password`;
      const responseJson = await request('POST', path, {
        email,
        passwordRecoveryToken: token,
        newPassword,
      });
      if (responseJson.success === true) {
        await Swal.fire({
          title: 'Sucesso',
          text: 'Sua senha foi resetada!',
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

function PasswordReset() {
  onMount(async () => {
    await addSubmitListener();
    await addPasswordChangeListener();
  });
  return (
    <div
      class="grid grid-cols-1 md:grid-cols-10 md:text-lg text-center"
      style={{ 'font-family': 'Poppins, sans-serif' }}
    >
      <div class="col-start-1 col-span-1 md:col-start-1 md:col-span-full text-3xl md:text-5xl">
        <h1 class="font-[Wizzta] p-8 text-purple-600">TalentSourcery</h1>
      </div>
      <div class="col-start-1 col-span-1 md:col-start-3 md:col-span-6 flex flex-row p-4 bg-white border-2 border-purple-500 rounded-2xl">
        <div class="grid grid-cols-2">
          <div class="col-start-1 col-span-2 md:col-span-1 flex flex-col">
            <form id="form" class="flex flex-col">
              <InputPassword
                id="password"
                placeholder="Password"
                required
                inputClass="w-[90%] mt-2 mb-2 text-center text-purple-600"
              ></InputPassword>
              <InputPassword
                id="repeatPassword"
                placeholder="Repeat password"
                required
                inputClass="w-[90%] mt-2 mb-4 text-center text-purple-600"
              ></InputPassword>
              <p id="passwordCheckLength" class="my-0 text-xs text-red-600">
                Password must have 8 characters or more
              </p>
              <p id="passwordCheckMatch" class="mt-0 mb-2 text-xs text-red-600">
                Passwords must match
              </p>
              <Button type="submit" id="submit" inputClass="mx-auto">
                Reset password
              </Button>
            </form>
            <hr class="w-[90%] h-[0.15rem] mx-auto my-6 bg-purple-400 rounded-2xl"></hr>
            <div class="mt-2 mb-6 flex flex-row justify-center">
              <Anchor href="/app/signin" inputClass="my-0 text-sm">
                Sign in
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

export default PasswordReset;
