import env from '../../../client-envs/current.js';
import { onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../helpers/check-session-jwt.js';
import exists from '../../../helpers/exists.js';
import toBase64 from '../../../helpers/to-base-64.js';
import request from '../../../helpers/request.js';
import Navbar from '../../../components/app/navbar.jsx';
import Heading from '../../../components/app/heading.jsx';
import P from '../../../components/app/paragraph.jsx';
import InputText from '../../../components/app/input-text.jsx';
import InputPassword from '../../../components/app/input-password.jsx';
import Button from '../../../components/app/button.jsx';
import Divider from '../../../components/app/divider.jsx';
import errorMessage from '../../../helpers/error-message.js';

async function readAccount() {
  const responseJson = await request('GET', '/participant', null, true);
  if (responseJson.error) {
    await Swal.fire({
      title: 'Oops',
      text: errorMessage,
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/participant/dashboard';
    return null;
  }
  const account = responseJson.data;
  return account;
}

async function addAccountInfo(account) {
  const nameEl = document.getElementById('name');
  nameEl.textContent = `Nome: ${account.name}`;
  const institutionEl = document.getElementById('institution');
  institutionEl.textContent = `Instituição: ${account.institution}`;
  const emailEl = document.getElementById('email');
  emailEl.textContent = `Email: ${account.email}`;
  const phoneEl = document.getElementById('phone');
  phoneEl.textContent = `Phone: ${account.phone}`;
  const receiptEl = document.getElementById('receipt');
  receiptEl.innerHTML = `Comprovante de inscrição: <span class="text-red-500">Pendente</span>`;
  if (account.receiptFile.isSubmitted) {
    receiptEl.innerHTML = `Comprovante de inscrição: <span class="text-green-500">Enviado</span>`;
  }
}

async function maskPhone(phone) {
  return phone
    .replace(/\D/g, '') // Remove non-digits
    .replace(/(\d{2})(\d)/, '($1) $2') // Add area code parens
    .replace(/(\d{5})(\d)/, '$1-$2') // Add hyphen for 9 digits
    .replace(/(-\d{4})\d+?$/, '$1'); // Limit to 11 digits total
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
    const sendReceiptEl = document.querySelector('#sendReceipt');
    detailsUpdateEl.classList.remove('hidden');
    passwordUpdateEl.classList.remove('hidden');
    sendReceiptEl.classList.remove('hidden');
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
    const sendReceiptEl = document.querySelector('#sendReceipt');
    updateDetailsEl.classList.add('hidden');
    detailsFormEl.classList.remove('hidden');
    updatePasswordEl.classList.add('hidden');
    sendReceiptEl.classList.add('hidden');
  });
}

async function addPasswordSubmitListener(storedPassword) {
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
    const sendReceiptEl = document.querySelector('#sendReceipt');
    passwordUpdateEl.classList.remove('hidden');
    detailsUpdateEl.classList.remove('hidden');
    sendReceiptEl.classList.remove('hidden');
    await Swal.fire({
      title: 'Sucesso',
      text: 'Senha atualizada!',
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/participant/account';
  });
}

async function addPasswordUpdateListener() {
  const updatePasswordEl = document.querySelector('#updatePassword');
  updatePasswordEl.addEventListener('click', () => {
    const passwordFormEl = document.querySelector('#passwordForm');
    const updateDetailsEl = document.querySelector('#updateDetails');
    const sendReceiptEl = document.querySelector('#sendReceipt');
    updatePasswordEl.classList.add('hidden');
    passwordFormEl.classList.remove('hidden');
    updateDetailsEl.classList.add('hidden');
    sendReceiptEl.classList.add('hidden');
  });
}

async function addReceiptSubmitListener() {
  const receiptSubmitEl = document.getElementById('submitReceipt');
  receiptSubmitEl.addEventListener('click', async (event) => {
    event.preventDefault();
    const receiptFileEl = document.getElementById('receiptFile');

    // Check input
    if (receiptFileEl.files.length === 0) {
      await Swal.fire({
        title: 'Oops',
        text: 'Por favor, selecione um arquivo.',
        confirmButtonText: 'OK',
      });
      return;
    }
    Swal.fire({ title: 'Enviando arquivo...' });

    // Get receipt file
    const receiptFile = receiptFileEl.files[0];

    // Convert the file to a Base64 string
    const receiptFile64Encoded = await toBase64(receiptFile);

    // Send request
    const responseJson = await request(
      'POST',
      '/participant/upload-receipt',
      { receiptFile64Encoded },
      true,
    );

    // Process response
    if (responseJson.error) {
      await Swal.fire({
        title: 'Oops',
        text: 'Erro ao enviar o comprovante. Tente novamente.',
        confirmButtonText: 'OK',
      });
      return;
    }
    await Swal.fire({
      title: 'Sucesso',
      text: 'Comprovante enviado com sucesso!',
      confirmButtonText: 'OK',
    });
    window.location.reload(); // Refresh to reset state
  });
}

async function addReceiptUpdateListener() {
  const sendReceiptEl = document.querySelector('#sendReceipt');
  sendReceiptEl.addEventListener('click', () => {
    const receiptFormEl = document.querySelector('#receiptForm');
    const updateDetailsEl = document.querySelector('#updateDetails');
    const updatePasswordEl = document.querySelector('#updatePassword');
    sendReceiptEl.classList.add('hidden');
    receiptFormEl.classList.remove('hidden');
    updateDetailsEl.classList.add('hidden');
    updatePasswordEl.classList.add('hidden');
  });
}

function Account() {
  onMount(async () => {
    await checkSessionJwt();
    const account = await readAccount();
    await addAccountInfo(account);
    await addInputListeners();
    await addDetailsSubmitListener();
    await addDetailsUpdateListener();
    await addPasswordSubmitListener(account?.password);
    await addPasswordUpdateListener();
    await addReceiptSubmitListener();
    await addReceiptUpdateListener();
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
        <P id="receipt">Comprovante de inscrição:</P>

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

        {/* Send receipt */}
        <Button id="sendReceipt" type="button">
          Enviar comprovante de inscrição
        </Button>
        <form id="receiptForm" class="hidden" enctype="multipart/form-data">
          <Divider inputClass="w-full bg-purple-500 border-purple-500"></Divider>
          <div class="my-4">
            <label class="block mb-2 text-sm font-medium text-gray-900">
              Comprovante de pagamento (PDF ou imagem) *
            </label>
            <input
              type="file"
              id="receiptFile"
              name="receiptFile"
              accept="application/pdf,image/*"
              class="block w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
          </div>
          <Button id="submitReceipt" type="button">
            Enviar Arquivo
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Account;
