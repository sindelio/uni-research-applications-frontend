import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../helpers/check-session-jwt.js';
import exists from '../../../helpers/exists.js';
import maskPhone from '../../../helpers/mask-phone.js';
import request from '../../../helpers/request.js';
import Navbar from '../../../components/app/navbar.jsx';
import Heading from '../../../components/app/heading.jsx';
import P from '../../../components/app/paragraph.jsx';
import InputText from '../../../components/app/input-text.jsx';
import InputPassword from '../../../components/app/input-password.jsx';
import Button from '../../../components/app/button.jsx';
import Divider from '../../../components/app/divider.jsx';

const [getAccount, setAccount] = createSignal({});
const [getName, setName] = createSignal('');
const [getInstitution, setInstitution] = createSignal('');
const [getEmail, setEmail] = createSignal('');
const [getPhone, setPhone] = createSignal('');

async function readAccount() {
  const responseJson = await request('GET', '/admin', null, true);
  if (responseJson.error) {
    await Swal.fire({
      title: 'Oops',
      text: responseJson?.error?.message,
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/admin/dashboard';
    return null;
  }
  const account = responseJson.data;
  setAccount(account);
  setName(account.name);
  setInstitution(account.institution);
  setEmail(account.email);
  setPhone(account.phone);
}

async function addInputListeners() {
  // Phone
  const phoneEl = document.getElementById('newPhone');
  phoneEl.addEventListener('input', async (event) => {
    event.target.value = await maskPhone(event.target.value);
  });
}

async function addDetailsSubmitListener() {
  const detailsSubmitEl = document.getElementById('submitDetails');
  detailsSubmitEl.addEventListener('click', async (event) => {
    Swal.fire({ title: 'Um momento ...' });
    event.preventDefault();
    const detailsFormEl = document.querySelector('#detailsForm');
    const formData = new FormData(detailsFormEl);
    const newName = formData.get('newName');
    const newInstitution = formData.get('newInstitution');
    const newPhone = formData.get('newPhone');
    if (!exists(newName) || !exists(newInstitution) || !exists(newPhone)) {
      await Swal.fire({
        title: 'Oops',
        text: 'Por favor verifique os dados.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    const responseJson = await request(
      'PATCH',
      '/admin',
      {
        name: newName,
        institution: newInstitution,
        phone: newPhone,
      },
      true,
    );
    if (responseJson.error) {
      await Swal.fire({
        title: 'Oops',
        text: responseJson?.error?.message,
        confirmButtonText: 'OK',
      });
      window.location.href = '/app/participant/dashboard';
      return null;
    }
    detailsFormEl.classList.add('hidden');
    const detailsUpdateEl = document.querySelector('#updateDetails');
    const passwordUpdateEl = document.querySelector('#updatePassword');
    detailsUpdateEl.classList.remove('hidden');
    passwordUpdateEl.classList.remove('hidden');
    const newNameEl = document.querySelector('#newName');
    newNameEl.value = '';
    const newInstitutionEl = document.querySelector('#newInstitution');
    newInstitutionEl.value = '';
    const newPhoneEl = document.querySelector('#newPhone');
    newPhoneEl.value = '';
    await readAccount();
    await Swal.fire({
      title: 'Sucesso',
      text: 'Dados atualizados!',
      confirmButtonText: 'OK',
    });
  });
}

async function addDetailsUpdateListener() {
  const updateDetailsEl = document.querySelector('#updateDetails');
  updateDetailsEl.addEventListener('click', () => {
    const detailsFormEl = document.querySelector('#detailsForm');
    const updatePasswordEl = document.querySelector('#updatePassword');
    updateDetailsEl.classList.add('hidden');
    detailsFormEl.classList.remove('hidden');
    updatePasswordEl.classList.add('hidden');
  });
}

async function addPasswordSubmitListener() {
  const account = getAccount();
  const storedPassword = account.password;

  const passwordSubmitEl = document.getElementById('submitPassword');
  passwordSubmitEl.addEventListener('click', async (event) => {
    Swal.fire({ title: 'Please wait ...' });
    event.preventDefault();
    const passwordFormEl = document.querySelector('#passwordForm');
    const formData = new FormData(passwordFormEl);
    const currentPassword = formData.get('password');
    const newPassword = formData.get('newPassword');
    const repeatNewPassword = formData.get('repeatNewPassword');
    if (
      !exists(currentPassword) ||
      !exists(newPassword) ||
      !exists(repeatNewPassword)
    ) {
      await Swal.fire({
        title: 'Oops',
        text: 'Por favor verifique os dados submetidos.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    if (newPassword.length < 8) {
      await Swal.fire({
        title: 'Oops',
        text: 'A nova senha deve conter no mínimo 8 caracteres.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    if (newPassword !== repeatNewPassword) {
      await Swal.fire({
        title: 'Oops',
        text: 'A nova senha deve ser igual à sua repetição.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    if (currentPassword !== storedPassword) {
      await Swal.fire({
        title: 'Oops',
        text: 'A senha atual provida é diferente da senha salva na nossa base de dados.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    const responseJson = await request(
      'PATCH',
      '/admin',
      {
        password: newPassword,
      },
      true,
    );
    if (responseJson.error) {
      await Swal.fire({
        title: 'Oops',
        text: responseJson?.error?.message,
        confirmButtonText: 'OK',
      });
      window.location.href = '/app/admin/dashboard';
      return null;
    }
    passwordFormEl.classList.add('hidden');
    const passwordUpdateEl = document.querySelector('#updatePassword');
    passwordUpdateEl.classList.remove('hidden');
    const detailsUpdateEl = document.querySelector('#updateDetails');
    detailsUpdateEl.classList.remove('hidden');
    const passwordEl = document.querySelector('#password');
    passwordEl.value = '';
    const newPasswordEl = document.querySelector('#newPassword');
    newPasswordEl.value = '';
    const repeatNewPasswordEl = document.querySelector('#repeatNewPassword');
    repeatNewPasswordEl.value = '';
    await Swal.fire({
      title: 'Sucesso',
      text: 'Senha atualizada!',
      confirmButtonText: 'OK',
    });
  });
}

async function addPasswordUpdateListener() {
  const updatePasswordEl = document.querySelector('#updatePassword');
  updatePasswordEl.addEventListener('click', () => {
    const passwordFormEl = document.querySelector('#passwordForm');
    const updateDetailsEl = document.querySelector('#updateDetails');
    updatePasswordEl.classList.add('hidden');
    passwordFormEl.classList.remove('hidden');
    updateDetailsEl.classList.add('hidden');
  });
}

function AdminAccount() {
  onMount(async () => {
    await checkSessionJwt();
    await readAccount();
    await addInputListeners();
    await addDetailsSubmitListener();
    await addDetailsUpdateListener();
    await addPasswordSubmitListener();
    await addPasswordUpdateListener();
  });
  return (
    <div class="flex flex-row text-lg">
      <Navbar></Navbar>
      <div class="ml-72 m-8">
        {/* Heading */}
        <Heading>Dados da conta</Heading>
        <P>
          Nome: <span id="name">{getName()}</span>
        </P>
        <P>
          Instituição: <span id="institution">{getInstitution()}</span>
        </P>
        <P>
          Email: <span id="email">{getEmail()}</span>
        </P>
        <P>
          Fone: <span id="phone">{getPhone()}</span>
        </P>

        {/* Update details */}
        <Button id="updateDetails" type="button">
          Atualizar dados
        </Button>
        <form id="detailsForm" class="hidden">
          <Divider inputClass="w-full bg-purple-500 border-purple-500"></Divider>
          <InputText
            id="newName"
            label="Novo nome *"
            size={24}
            placeholder=""
          ></InputText>
          <InputText
            id="newInstitution"
            label="Nova instituição *"
            size={24}
            placeholder=""
          ></InputText>
          <InputText
            id="newPhone"
            label="Novo fone *"
            size={11}
            placeholder=""
          ></InputText>
          <Button id="submitDetails" type="button">
            Salvar
          </Button>
        </form>

        {/* Update password */}
        <Button id="updatePassword" type="button" inputClass="mx-4">
          Atualizar senha
        </Button>
        <form id="passwordForm" class="hidden">
          <Divider inputClass="w-full bg-purple-500 border-purple-500"></Divider>
          <InputPassword
            id="password"
            label="Senha atual *"
            size={24}
            placeholder=""
          ></InputPassword>
          <InputPassword
            id="newPassword"
            label="Nova senha *"
            size={24}
            placeholder=""
          ></InputPassword>
          <InputPassword
            id="repeatNewPassword"
            label="Repetição da nova senha *"
            size={24}
            placeholder=""
          ></InputPassword>
          <Button id="submitPassword" type="button">
            Salvar
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AdminAccount;
