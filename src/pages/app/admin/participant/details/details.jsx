import env from '../../../../../client-envs/current.js';
import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../../../helpers/check-session-jwt.js';
import request from '../../../../../helpers/request.js';
import Navbar from '../../../../../components/app/navbar.jsx';
import Heading from '../../../../../components/app/heading.jsx';
import P from '../../../../../components/app/paragraph.jsx';
import errorMessage from '../../../../../helpers/error-message.js';

const {
  LOCAL_STORAGE_USER_TYPE,
  USER_STATUS_PENDING_EMAIL_CONFIRMATION,
  USER_STATUS_EMAIL_CONFIRMED,
} = env;

const userType = localStorage.getItem(LOCAL_STORAGE_USER_TYPE);
const [getAccount, setAccount] = createSignal(null);

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
      text: errorMessage,
      confirmButtonText: 'OK',
    });
    window.location.href = `/app/${userType}/dashboard`;
    return null;
  }
  const account = responseJson.data;
  setAccount(account);
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

function AdminParticipantListDetails() {
  onMount(async () => {
    await checkSessionJwt();
    await readAccount();
    await addAccountInfo();
  });

  return (
    <div class="flex flex-row min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <div class="ml-72 m-8 w-full max-w-4xl">
        {/* Heading */}
        <Heading>Participante</Heading>
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
        <P inputClass="mb-6">
          Comprovante de inscrição na FUNEP: <span id="receipt"></span>
        </P>
        {/* <P inputClass="mb-6">
          Projetos convencionais: <span id="conventionalProjects"></span>
        </P>
        <P inputClass="mb-6">
          Projetos fotográficos: <span id="photoProjects"></span>
        </P> */}
      </div>
    </div>
  );
}

export default AdminParticipantListDetails;
