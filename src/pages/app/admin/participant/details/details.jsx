import env from '../../../../../client-envs/current.js';
import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../../../helpers/check-session-jwt.js';
import request from '../../../../../helpers/request.js';
import downloadBuffer from '../../../../../helpers/download-buffer.js';
import Navbar from '../../../../../components/app/navbar.jsx';
import Heading from '../../../../../components/app/heading.jsx';
import P from '../../../../../components/app/paragraph.jsx';
import Button from '../../../../../components/app/button.jsx';

const {
  LOCAL_STORAGE_USER_TYPE,
  USER_STATUS_PENDING_EMAIL_CONFIRMATION,
  USER_STATUS_EMAIL_CONFIRMED,
  PROJECT_TYPE_CONVENTIONAL,
  PROJECT_TYPE_PHOTO,
} = env;

const userType = localStorage.getItem(LOCAL_STORAGE_USER_TYPE);
const [getAccount, setAccount] = createSignal(null);
const [getNumConventionalProjects, setNumConventionalProjects] =
  createSignal(0);
const [getNumPhotoProjects, setNumPhotoProjects] = createSignal(0);

async function readAccount() {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');
  const responseJson = await request(
    'GET',
    `/${userType}/participant?email=${email}`,
    null,
    true,
  );
  if (responseJson.error) {
    await Swal.fire({
      title: 'Oops',
      text: responseJson?.error?.message,
      confirmButtonText: 'OK',
    });
    window.location.href = `/app/${userType}/dashboard`;
    return null;
  }
  const account = responseJson.data;
  setAccount(account);
}

async function readProjects() {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');
  const responseJson = await request(
    'POST',
    `/${userType}/paginated-find`,
    { model: 'Project', query: { participantEmail: email }, page: 1 },
    true,
  );
  if (responseJson.error) {
    await Swal.fire({
      title: 'Oops',
      text: responseJson?.error?.message,
      confirmButtonText: 'OK',
    });
    window.location.href = `/app/${userType}/dashboard`;
    return null;
  }
  const projects = responseJson.data.itemsInPage;
  projects.map((project) => {
    const { projectType } = project;
    if (projectType === PROJECT_TYPE_CONVENTIONAL) {
      setNumConventionalProjects(getNumConventionalProjects() + 1);
    } else if (projectType === PROJECT_TYPE_PHOTO) {
      setNumPhotoProjects(getNumPhotoProjects() + 1);
    }
  });
}

async function addAccountInfo() {
  // Get account
  const account = getAccount();

  // Name
  const nameEl = document.getElementById('name');
  nameEl.textContent = account.name;

  // Institution
  const institutionEl = document.getElementById('institution');
  institutionEl.textContent = account.institution;

  // Email
  const emailEl = document.getElementById('email');
  emailEl.textContent = account.email;

  // Phone
  const phoneEl = document.getElementById('phone');
  phoneEl.textContent = account.phone;

  // Status
  const statusEl = document.getElementById('status');
  const { status } = account;
  if (status === USER_STATUS_PENDING_EMAIL_CONFIRMATION) {
    statusEl.textContent = 'Aguardando confirmação de e-mail';
    statusEl.classList.add('text-blue-400');
  } else if (status === USER_STATUS_EMAIL_CONFIRMED) {
    statusEl.textContent = 'E-mail confirmado';
    statusEl.classList.add('text-green-400');
  }

  // Receipt
  const receiptEl = document.getElementById('receipt');
  if (account.receiptFile.isSubmitted) {
    receiptEl.innerHTML = 'Enviado';
    receiptEl.classList.add('text-green-400');
  } else {
    receiptEl.innerHTML = 'Pendente';
    receiptEl.classList.add('text-red-400');
  }

  // // Conventional projects
  // const conventionalProjectsEl = document.getElementById('conventionalProjects');
  // conventionalProjectsEl.textContent = account.
}

async function addDownloadListener() {
  // Get project
  const account = getAccount();

  // Add click listener
  if (account?.receiptFile?.isSubmitted) {
    // Show download button
    const downloadEl = document.getElementById('downloadFile');
    downloadEl.classList.remove('hidden');

    // Add download listener
    downloadEl.addEventListener('click', () => {
      const fileName = `comprovante_${account.name.replace(/\s+/g, '_')}.pdf`;
      downloadBuffer(account.receiptFile, fileName);
    });
  }
}

function AdminParticipantListDetails() {
  onMount(async () => {
    await checkSessionJwt();
    await readAccount();
    await readProjects();
    await addAccountInfo();
    await addDownloadListener();
  });

  return (
    <div class="flex flex-row min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <div class="ml-72 m-8 w-full max-w-4xl">
        {/* Heading */}
        <Heading>Participante</Heading>

        {/* Account data */}
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
        <P>
          Estado da conta: <span id="status"></span>
        </P>
        <P>
          Comprovante de inscrição na FUNEP: <span id="receipt"></span>
        </P>
        <P>
          Projetos convencionais:{' '}
          <span id="conventionalProjects">{getNumConventionalProjects()}</span>
        </P>
        <P>
          Projetos fotográficos:{' '}
          <span id="photoProjects">{getNumPhotoProjects()}</span>
        </P>

        {/* Download button */}
        <Button
          id="downloadFile"
          inputClass="hidden bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 mt-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          Baixar Comprovante
        </Button>
      </div>
    </div>
  );
}

export default AdminParticipantListDetails;
