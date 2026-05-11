import env from '../../../../../client-envs/current.js';
import { onMount } from 'solid-js';
import checkSessionJwt from '../../../../../helpers/check-session-jwt.js';
import request from '../../../../../helpers/request.js';
import Navbar from '../../../../../components/app/navbar.jsx';
import P from '../../../../../components/app/paragraph.jsx';
import errorMessage from '../../../../../helpers/error-message.js';

const {
  PROJECT_WAITING_EXAMINER,
  PROJECT_PENDING_REVIEW,
  PROJECT_APPROVED,
  PROJECT_REJECTED,
} = env;

async function readProject() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const responseJson = await request(
    'GET',
    `/participant/project?id=${id}`,
    null,
    true,
  );
  if (responseJson.error !== null) {
    await Swal.fire({
      title: 'Oops',
      text: errorMessage,
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/dashboard';
  }
  const requestInfo = responseJson.data;
  return requestInfo;
}

async function addProjectInfo(projectInfo) {
  // Title
  const titleEl = document.getElementById('title');
  titleEl.textContent = `Títutlo: ${projectInfo?.title || '-'}`;

  // Status
  let statusInfo = '<span class="text-amber-400">Aguardando avaliador</span>';
  if (projectInfo.status === PROJECT_PENDING_REVIEW) {
    statusInfo = '<span class="text-blue-400">Aguardando avaliação</span>';
  }
  if (projectInfo.status === PROJECT_APPROVED) {
    statusInfo = '<span class="text-green-400">Aprovado</span>';
  }
  if (projectInfo.status === PROJECT_REJECTED) {
    statusInfo = '<span class="text-red-400">Reprovado</span>';
  }
  const statusEl = document.getElementById('status');
  statusEl.innerHTML = `Estado: ${statusInfo}`;

  // Institution
  const institutionEl = document.getElementById('institution');
  institutionEl.textContent = `Instituição: ${projectInfo?.institution || '-'}`;

  // Authors
  const authorsEl = document.getElementById('authors');
  authorsEl.textContent = `Autores: `;
  projectInfo.authors.forEach((author) => {
    authorsEl.textContent = authorsEl.textContent.concat(`${author}; `);
  });

  // Areas
  const areasEl = document.getElementById('areas');
  areasEl.textContent = 'Áreas: ';
  projectInfo.areas.forEach((area) => {
    areasEl.textContent = areasEl.textContent.concat(`${area}; `);
  });

  // Description
  const descriptionEl = document.getElementById('description');
  descriptionEl.textContent = `Descrição: ${projectInfo?.description || '-'}`;

  // Type
  const typeEl = document.getElementById('type');
  typeEl.textContent = `Tipo: ${projectInfo?.type || '-'}`;

  // CreatedAt
  const createdAtEl = document.getElementById('createdAt');
  createdAtEl.textContent = `Data de criação: ${projectInfo?.createdAt?.readableDate || '-'}`;
}

function ParticipantProjectListDetails() {
  onMount(async () => {
    await checkSessionJwt();
    const projectInfo = await readProject();
    await addProjectInfo(projectInfo);
  });
  return (
    <div class="flex flex-row text-lg">
      <Navbar></Navbar>
      <div class="ml-72 m-8">
        <P id="title"></P>
        <P id="status"></P>
        <P id="institution"></P>
        <P id="authors"></P>
        <P id="areas"></P>
        <P id="description"></P>
        <P id="type"></P>
        <P id="createdAt"></P>
      </div>
    </div>
  );
}

export default ParticipantProjectListDetails;
