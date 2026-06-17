import * as pdfjsLib from 'pdfjs-dist';
import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../helpers/check-session-jwt.js';
import exists from '../../../helpers/exists.js';
import toBase64 from '../../../helpers/to-base-64.js';
import request from '../../../helpers/request.js';
import Navbar from '../../../components/app/navbar.jsx';
import Anchor from '../../../components/app/anchor.jsx';
import Heading from '../../../components/app/heading.jsx';
import P from '../../../components/app/paragraph.jsx';
import InputText from '../../../components/app/input-text.jsx';
import InputPassword from '../../../components/app/input-password.jsx';
import Button from '../../../components/app/button.jsx';
import Divider from '../../../components/app/divider.jsx';
import errorMessage from '../../../helpers/error-message.js';

// Configure the worker to use the local file from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const [getAccount, setAccount] = createSignal(null);

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
  setAccount(account);
}

async function addAccountInfo() {
  // Get account
  const account = getAccount();

  // Add content
  const nameEl = document.getElementById('name');
  nameEl.textContent = account.name;
  const institutionEl = document.getElementById('institution');
  institutionEl.textContent = account.institution;
  const emailEl = document.getElementById('email');
  emailEl.textContent = account.email;
  const phoneEl = document.getElementById('phone');
  phoneEl.textContent = account.phone;
  const receiptEl = document.getElementById('receipt');
  if (account.receiptFile.isSubmitted) {
    receiptEl.innerHTML = 'Enviado';
    receiptEl.classList.add('text-green-500');
  } else {
    receiptEl.innerHTML = 'Pendente';
    receiptEl.classList.add('text-red-500');
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

async function addPasswordSubmitListener() {
  // Get account
  const account = getAccount();

  // Get stored password
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

async function updateReceiptButtonVisibility() {
  // Get account
  const account = getAccount();

  // Get receipt file submission status
  const isSubmitted = account.receiptFile.isSubmitted;

  // Check if submitted
  if (isSubmitted) {
    // Hide the submit button
    const sendReceiptEl = document.querySelector('#sendReceipt');
    sendReceiptEl.classList.add('hidden');

    // Hide the registration link
    const linkRegistrationEl = document.querySelector('#registrationLink');
    linkRegistrationEl.classList.add('hidden');
  }
}

async function addReceiptSubmitListener() {
  // Add listener
  const receiptSubmitEl = document.getElementById('submitReceipt');
  receiptSubmitEl.addEventListener('click', async (event) => {
    event.preventDefault();
    const receiptFileEl = document.getElementById('receiptFile');

    // Check if a file was selected
    if (receiptFileEl.files.length === 0) {
      await Swal.fire({
        title: 'Oops',
        text: 'Por favor, selecione um arquivo.',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Get file
    const files = receiptFileEl.files;
    const receiptFile = files[0];

    // Notify user
    Swal.fire({
      title: 'Validando documento...',
      text: 'Por favor, aguarde.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    let nameOnFile = '';
    try {
      // Read file into an ArrayBuffer for processing locally
      const arrayBuffer = await receiptFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // Extract layout text from the first page
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      const extractedText = textContent.items
        .map((item) => item.str)
        .join(' ')
        .toUpperCase();

      const expectedEvent = 'ENPCV 2026';
      const expectedDocType = 'COMPROVANTE DE INSCRIÇÃO';

      // Template Validation
      if (
        !extractedText.includes(expectedEvent) ||
        !extractedText.includes(expectedDocType)
      ) {
        await Swal.fire({
          title: 'Documento Inválido',
          text: 'O arquivo enviado não foi reconhecido como um comprovante oficial do ENPCV 2026.',
          confirmButtonText: 'OK',
        });
        return;
      }

      // Extract participant name
      // Capture the text between "ATESTAMOS QUE" and "EFETUOU"
      const nameMatch = extractedText.match(/ATESTAMOS QUE\s+(.+?)\s+EFETUOU/);

      if (nameMatch && nameMatch[1]) {
        nameOnFile = nameMatch[1].trim();
      } else {
        await Swal.fire({
          title: 'Documento Inválido',
          text: 'Não foi possível extrair o nome do participante do comprovante.',
          confirmButtonText: 'OK',
        });
        return;
      }

      // // Identity Match Verification
      // // Get account
      // const account = getAccount();
      // const expectedName = account.name.toUpperCase();
      // if (!extractedText.includes(expectedName)) {
      //   await Swal.fire({
      //     title: 'Nome Divergente',
      //     text: `Este comprovante não pertence a você. O documento deve estar explicitamente emitido sob o nome: ${account.name}.`,
      //     confirmButtonText: 'OK',
      //   });
      //   return;
      // }
    } catch (error) {
      // Log the error
      console.error('Erro na leitura do PDF local:', error);
      await Swal.fire({
        title: 'Erro de Leitura',
        text: 'Não foi possível ler a estrutura do PDF. Certifique-se de que o arquivo não está corrompido.',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Convert the file to a Base64 string
    const receiptFile64Encoded = await toBase64(receiptFile);

    // Send request
    const responseJson = await request(
      'POST',
      '/participant/upload-receipt',
      { receiptFile64Encoded, nameOnFile },
      true,
    );

    // Process response
    if (responseJson.error) {
      await Swal.fire({
        title: 'Oops',
        text: responseJson?.error?.message,
        confirmButtonText: 'OK',
      });
      return;
    }

    await Swal.fire({
      title: 'Sucesso',
      text: 'Comprovante verificado e enviado com sucesso!',
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

function ParticipantAccount() {
  onMount(async () => {
    await checkSessionJwt();
    await readAccount();
    await addAccountInfo();
    await addInputListeners();
    await addDetailsSubmitListener();
    await addDetailsUpdateListener();
    await addPasswordSubmitListener();
    await addPasswordUpdateListener();
    await addReceiptSubmitListener();
    await addReceiptUpdateListener();
    await updateReceiptButtonVisibility();
  });
  return (
    <div class="flex flex-row text-lg">
      <Navbar></Navbar>
      <div class="ml-72 m-8">
        {/* Heading */}
        <Heading>Dados da conta</Heading>
        <P>
          Nome: <span id="name"></span>
        </P>
        <P>
          Instituição: <span id="institution"></span>
        </P>
        <P>
          Email: <span id="email"></span>
        </P>
        <P>
          Fone: <span id="phone"></span>
        </P>
        <P inputClass="mb-6">
          Comprovante de inscrição na FUNEP: <span id="receipt"></span>
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

        {/* Link to registration */}
        <Anchor
          id="registrationLink"
          href="https://www.funep.org.br/evento/viiienpcv2026/"
          target="_blank"
          inputClass="ml-0"
        >
          Link para Inscrição na FUNEP
        </Anchor>

        {/* Send registration receipt */}
        <Button id="sendReceipt" type="button">
          Enviar comprovante de inscrição na FUNEP
        </Button>
        <form id="receiptForm" class="hidden" enctype="multipart/form-data">
          <Divider inputClass="w-full bg-purple-500 border-purple-500"></Divider>
          <div class="my-4">
            <label class="block mb-2 text-sm font-medium text-gray-900">
              Comprovante de inscrição na FUNEP (PDF) *
            </label>
            <input
              type="file"
              id="receiptFile"
              name="receiptFile"
              accept="application/pdf"
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

export default ParticipantAccount;
