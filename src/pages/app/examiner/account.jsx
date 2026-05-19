import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../helpers/check-session-jwt.js';
import exists from '../../../helpers/exists.js';
import areas from '../../../helpers/areas.js';
import maskPhone from '../../../helpers/mask-phone.js';
import request from '../../../helpers/request.js';
import errorMessage from '../../../helpers/error-message.js';
import Navbar from '../../../components/app/navbar.jsx';
import Heading from '../../../components/app/heading.jsx';
import P from '../../../components/app/paragraph.jsx';
import InputText from '../../../components/app/input-text.jsx';
import InputPassword from '../../../components/app/input-password.jsx';
import Button from '../../../components/app/button.jsx';
import Divider from '../../../components/app/divider.jsx';

const [getAccount, setAccount] = createSignal(null);

async function readAccount() {
  const responseJson = await request('GET', '/examiner', null, true);
  if (responseJson.error) {
    await Swal.fire({
      title: 'Oops',
      text: errorMessage,
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/examiner/dashboard';
    return null;
  }
  const account = responseJson.data;
  setAccount(account);
}

async function addAccountInfo() {
  const account = getAccount();

  // Name
  const nameEl = document.getElementById('name');
  nameEl.textContent = `Nome: ${account.name}`;

  // Institution
  const institutionEl = document.getElementById('institution');
  institutionEl.textContent = `Instituição: ${account.institution}`;

  // Email
  const emailEl = document.getElementById('email');
  emailEl.textContent = `Email: ${account.email}`;

  // Phone
  const phoneEl = document.getElementById('phone');
  phoneEl.textContent = `Phone: ${account.phone}`;

  // Number of projects
  const numProjectsEl = document.getElementById('numProjects');
  numProjectsEl.textContent = `Número de projetos avaliados: ${account.numProjects}`;

  // Max projects
  const maxProjectsEl = document.getElementById('maxProjects');
  maxProjectsEl.textContent = `Máximo de projetos: ${account.maxProjects}`;

  // Areas
  const areasEl = document.getElementById('areas');
  const accountAreas = account.areas || [];
  areasEl.textContent = `Áreas de atuação: ${accountAreas.length > 0 ? accountAreas.join(', ') : 'Nenhuma selecionada'}`;

  // Sincronizar checkboxes do formulário com os dados salvos
  areas.forEach((area, index) => {
    const checkboxEl = document.getElementById(`area_${index}`);
    if (checkboxEl) {
      checkboxEl.checked = accountAreas.includes(area);
    }
  });
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
      '/participant',
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
        text: `Algo inesperado aconteceu. Por favor busque suporte no endereço eletrônico ${SUPPORT_EMAIL}`,
        confirmButtonText: 'OK',
      });
      window.location.href = '/app/participant/dashboard';
      return null;
    }
    const account = await readAccount();
    await addAccountInfo(account);
    detailsFormEl.classList.add('hidden');
    const detailsUpdateEl = document.querySelector('#updateDetails');
    const passwordUpdateEl = document.querySelector('#updatePassword');
    const areasUpdateEl = document.querySelector('#updateAreas');
    detailsUpdateEl.classList.remove('hidden');
    passwordUpdateEl.classList.remove('hidden');
    areasUpdateEl.classList.remove('hidden');
    Swal.fire({
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
    const updateAreasEl = document.querySelector('#updateAreas');
    updateDetailsEl.classList.add('hidden');
    detailsFormEl.classList.remove('hidden');
    updatePasswordEl.classList.add('hidden');
    updateAreasEl.classList.add('hidden');
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
      '/participant',
      {
        password: newPassword,
      },
      true,
    );
    if (responseJson.error) {
      await Swal.fire({
        title: 'Oops',
        text: `Algo inesperado aconteceu. Por favor busque suporte no endereço eletrônico ${SUPPORT_EMAIL}`,
        confirmButtonText: 'OK',
      });
      window.location.href = '/app/participant/dashboard';
      return null;
    }
    passwordFormEl.classList.add('hidden');
    const passwordUpdateEl = document.querySelector('#updatePassword');
    const detailsUpdateEl = document.querySelector('#updateDetails');
    const areasUpdateEl = document.querySelector('#updateAreas');
    passwordUpdateEl.classList.remove('hidden');
    detailsUpdateEl.classList.remove('hidden');
    areasUpdateEl.classList.remove('hidden');
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
    const updateAreasEl = document.querySelector('#updateAreas');
    updatePasswordEl.classList.add('hidden');
    passwordFormEl.classList.remove('hidden');
    updateDetailsEl.classList.add('hidden');
    updateAreasEl.classList.add('hidden');
  });
}

async function addAreasUpdateListener() {
  const updateAreasEl = document.querySelector('#updateAreas');
  updateAreasEl.addEventListener('click', () => {
    const areasFormEl = document.querySelector('#areasForm');
    const updateDetailsEl = document.querySelector('#updateDetails');
    const updatePasswordEl = document.querySelector('#updatePassword');
    updateAreasEl.classList.add('hidden');
    areasFormEl.classList.remove('hidden');
    updateDetailsEl.classList.add('hidden');
    updatePasswordEl.classList.add('hidden');
  });
}

async function addAreasSubmitListener() {
  const areasSubmitEl = document.getElementById('submitAreas');
  areasSubmitEl.addEventListener('click', async (event) => {
    Swal.fire({ title: 'Um momento ...' });
    event.preventDefault();

    // Map checked checkboxes
    const selectedAreas = [];
    areas.forEach((area, index) => {
      const checkboxEl = document.getElementById(`area_${index}`);
      if (checkboxEl && checkboxEl.checked) {
        selectedAreas.push(area);
      }
    });

    const responseJson = await request(
      'PATCH',
      '/examiner',
      {
        areas: selectedAreas,
      },
      true,
    );

    if (responseJson.error) {
      await Swal.fire({
        title: 'Oops',
        text: errorMessage,
        confirmButtonText: 'OK',
      });
      window.location.href = '/app/examiner/dashboard';
      return null;
    }

    const account = await readAccount();
    await addAccountInfo(account);

    const areasFormEl = document.querySelector('#areasForm');
    areasFormEl.classList.add('hidden');

    const detailsUpdateEl = document.querySelector('#updateDetails');
    const passwordUpdateEl = document.querySelector('#updatePassword');
    const areasUpdateEl = document.querySelector('#updateAreas');
    detailsUpdateEl.classList.remove('hidden');
    passwordUpdateEl.classList.remove('hidden');
    areasUpdateEl.classList.remove('hidden');

    await Swal.fire({
      title: 'Sucesso',
      text: 'Áreas de atuação atualizadas!',
      confirmButtonText: 'OK',
    });
  });
}

function ExaminerAccount() {
  onMount(async () => {
    await checkSessionJwt();
    await readAccount();
    await addAccountInfo();
    await addInputListeners();
    await addDetailsSubmitListener();
    await addDetailsUpdateListener();
    await addPasswordSubmitListener();
    await addPasswordUpdateListener();
    await addAreasUpdateListener();
    await addAreasSubmitListener();
  });
  return (
    <div class="flex flex-row text-lg">
      <Navbar></Navbar>
      <div class="ml-72 m-8">
        {/* Heading */}
        <Heading>Dados da conta</Heading>
        <P id="name">Nome:</P>
        <P id="institution">Instituição:</P>
        <P id="email">Email:</P>
        <P id="phone">Fone:</P>
        <P id="numProjects">Número de projetos avaliados:</P>
        <P id="maxProjects">Máximo de projetos:</P>
        <P id="areas">Áreas de atuação:</P>

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

        {/* Update areas */}
        <Button id="updateAreas" type="button">
          Atualizar áreas de avaliação
        </Button>
        <form id="areasForm" class="hidden">
          <Divider inputClass="w-full bg-purple-500 border-purple-500"></Divider>
          <div class="my-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {areas.map((area, index) => (
              <label class="flex items-center space-x-3 cursor-pointer text-base text-gray-700 hover:text-gray-900">
                <input
                  type="checkbox"
                  id={`area_${index}`}
                  class="w-5 h-5 accent-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span>{area}</span>
              </label>
            ))}
          </div>
          <Button id="submitAreas" type="button">
            Salvar
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ExaminerAccount;
