import Waves from '../../components/app/waves.jsx';
import { onMount } from 'solid-js';
import Swal from 'sweetalert2';
import request from '../../helpers/request.js';
import Anchor from '../../components/app/anchor.jsx';
import Button from '../../components/app/button.jsx';
import InputText from '../../components/app/input-text.jsx';
import InputPassword from '../../components/app/input-password.jsx';
import Select from '../../components/app/select.jsx';
import OutsideImage from '../../components/app/outside-image.jsx';

async function checkEmailFormat() {
  const emailEl = document.getElementById('email');
  const email = emailEl?.value;
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
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

async function maskPhone(value) {
  return value
    .replace(/\D/g, '') // Remove non-digits
    .replace(/(\d{2})(\d)/, '($1) $2') // Add area code parens
    .replace(/(\d{5})(\d)/, '$1-$2') // Add hyphen for 9 digits
    .replace(/(-\d{4})\d+?$/, '$1'); // Limit to 11 digits total
}

async function checkPhoneFormat() {
  const phoneEl = document.getElementById('phone');
  const phone = phoneEl?.value;
  // Validates (XX) 9XXXX-XXXX or (XX) XXXX-XXXX
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
}

// async function checkTermsAgreement() {
//   const termsAgreementEl = document.getElementById('termsAgreement');
//   return termsAgreementEl?.checked;
// }

async function addInputListeners() {
  // Password length
  const passwordEl = document.getElementById('password');
  passwordEl.addEventListener('keyup', checkPasswordLength);

  // Password match
  const repeatPasswordEl = document.getElementById('repeatPassword');
  repeatPasswordEl.addEventListener('keyup', checkPasswordMatch);

  // Phone
  const phoneEl = document.getElementById('phone');
  phoneEl.addEventListener('input', async (event) => {
    event.target.value = await maskPhone(event.target.value);
  });
}

async function addSubmitListener() {
  const formEl = document.querySelector('#form');
  formEl.addEventListener(
    'submit',
    async (event) => {
      Swal.fire({ title: 'Espere um momento ...' });
      event.preventDefault();
      // const termsAgreement = await checkTermsAgreement();
      // if (termsAgreement === false) {
      //   await Swal.fire({
      //     title: 'Oops',
      //     text: 'Please agree to the terms of service and privacy policy before signin up.',
      //     confirmButtonText: 'OK',
      //   });
      //   return null;
      // }
      const emailCheckFormat = await checkEmailFormat();
      if (emailCheckFormat === false) {
        await Swal.fire({
          title: 'Oops',
          text: 'Informe um endereço eletrônico válido.',
          confirmButtonText: 'OK',
        });
        return null;
      }
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
      const phoneCheckFormat = await checkPhoneFormat();
      if (phoneCheckFormat === false) {
        await Swal.fire({
          title: 'Oops',
          text: 'Informe um telefone válido: (99) 99999-9999',
          confirmButtonText: 'OK',
        });
        return null;
      }
      const formData = new FormData(formEl);
      const userType = formData.get('userType');
      const user = {
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        institution: formData.get('institution'),
        name: formData.get('name'),
      };
      const responseJson = await request('POST', `/${userType}`, user);
      if (responseJson.success === true) {
        await Swal.fire({
          title: 'Sucesso',
          text: 'Um email de confirmação foi enviado para o seu endereço eletrônico.',
          confirmButtonText: 'OK',
        });
        window.location.href = `/app/signin`;
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

function SignUp() {
  onMount(async () => {
    await addSubmitListener();
    await addInputListeners();
  });
  return (
    <div class="grid grid:cols-1 md:grid-cols-10 md:text-lg text-center">
      <div class="col-start-1 col-span-1 md:col-start-1 md:col-span-full text-3xl md:text-5xl">
        <h1 class="font-[Wizzta] p-6 text-purple-600">ENPCV</h1>
      </div>
      <div class="col-start-1 col-span-1 md:col-start-3 md:col-span-6 flex flex-row p-4 bg-white border-2 border-purple-500 rounded-2xl">
        <div class="grid grid-cols-2">
          <div class="col-start-1 col-span-2 md:col-span-1 flex flex-col">
            <form id="form" class="flex flex-col">
              <Select id="userType" label="">
                <option value="participant">Participante</option>
                <option value="examiner">Avaliador</option>
              </Select>
              <InputText
                id="email"
                placeholder="Email"
                required
                inputClass="w-[90%] my-2 text-center text-purple-600"
              ></InputText>
              <InputPassword
                id="password"
                placeholder="Senha"
                required
                inputClass="w-[90%] mt-2 mb-2 text-center text-purple-600"
              ></InputPassword>
              <InputPassword
                id="repeatPassword"
                placeholder="Repetir senha"
                required
                inputClass="w-[90%] mt-2 mb-4 text-center text-purple-600"
              ></InputPassword>
              <InputText
                id="phone"
                placeholder="Telefone (DDD + Número)"
                required
                inputClass="w-[90%] my-2 text-center text-purple-600"
              ></InputText>
              <InputText
                id="institution"
                placeholder="Instituição"
                required
                inputClass="w-[90%] my-2 text-center text-purple-600"
              ></InputText>
              <InputText
                id="name"
                placeholder="Nome completo"
                required
                inputClass="w-[90%] my-2 text-center text-purple-600"
              ></InputText>
              <p
                id="passwordCheckLength"
                class="mt-0 mb-0 text-xs text-red-600"
              >
                Senhas devem conter no mínimo 8 caracteres
              </p>
              <p id="passwordCheckMatch" class="mt-0 mb-2 text-xs text-red-600">
                Senhas devem ser iguais
              </p>
              {/* <div class="my-4">
                <input
                  type="checkbox"
                  id="termsAgreement"
                  name="termsAgreement"
                  class="accent-purple-600 w-[1em] h-[1em] mr-2 my-0 text-xs"
                />
                <label for="termsAgreement" class="my-0 text-sm">
                  I agree to the{' '}
                  <a
                    href="https://talentsourcery.io/terms-of-service"
                    class="text-purple-600"
                  >
                    terms
                  </a>{' '}
                  and{' '}
                  <a
                    href="https://talentsourcery.io/privacy-policy"
                    class="text-purple-600"
                  >
                    policy
                  </a>
                </label>
              </div> */}
              <Button type="submit" id="submit" inputClass="mx-auto mb-2">
                Cadastrar
              </Button>
            </form>
            <hr class="w-[90%] h-[0.15rem] mx-auto my-6 bg-purple-400 rounded-2xl"></hr>
            <div class="mt-2 mb-6 flex flex-row justify-center">
              <Anchor href="/app/signin" inputClass="mx-4 my-0 text-sm">
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

export default SignUp;
