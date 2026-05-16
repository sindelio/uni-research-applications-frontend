import env from '../../../../../client-envs/current.js';
import { onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../../../helpers/check-session-jwt.js';
import exists from '../../../../../helpers/exists.js';
import request from '../../../../../helpers/request.js';
import Navbar from '../../../../../components/app/navbar.jsx';
import Heading from '../../../../../components/app/heading.jsx';
import Button from '../../../../../components/app/button.jsx';
import errorMessage from '../../../../../helpers/error-message.js';

const { PROJECT_PENDING_REVIEW, PROJECT_APPROVED, PROJECT_REJECTED } = env;

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
    window.location.href = '/app/participant/dashboard';
    return null;
  }
  return responseJson.data;
}

// Helper to handle Buffer download
function downloadBuffer(bufferObj, fileName) {
  const bytes = new Uint8Array(bufferObj.data.data);
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'banner-projeto';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

async function addProjectInfo(project) {
  // Title
  document.getElementById('title').textContent = project?.title || '-';

  // Authors (Array of Objects)
  const authorsContainer = document.getElementById('authors-list');
  authorsContainer.innerHTML = ''; // Clear
  project.authors.forEach((author) => {
    const span = document.createElement('span');
    span.className =
      'block text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-1 mb-1 w-fit';
    span.textContent = `${author.name} — ${author.institution}`;
    authorsContainer.appendChild(span);
  });

  // Areas
  const areasEl = document.getElementById('areas');
  areasEl.textContent = project.areas.join(', ');

  // Keywords
  const keywordsContainer = document.getElementById('keywords-list');
  keywordsContainer.innerHTML = '';
  if (project.keywords && project.keywords.length > 0) {
    project.keywords.forEach((keyword) => {
      const span = document.createElement('span');
      span.className =
        'text-xs font-medium text-purple-700 bg-purple-50 border border-purple-100 rounded-md px-2.5 py-0.5 w-fit';
      span.textContent = keyword;
      keywordsContainer.appendChild(span);
    });
  } else {
    keywordsContainer.textContent = '-';
  }

  // Summary
  document.getElementById('summary').textContent = project?.summary || '-';
  document.getElementById('type').textContent = project?.type || '-';
  document.getElementById('createdAt').textContent =
    project?.createdAt?.readableDate || '-';

  // References
  const referencesContainer = document.getElementById('references-list');
  referencesContainer.innerHTML = '';
  if (project.references && project.references.length > 0) {
    project.references.forEach((reference) => {
      const li = document.createElement('li');
      li.className = 'text-sm text-gray-700';
      li.textContent = reference;
      referencesContainer.appendChild(li);
    });
  } else {
    referencesContainer.textContent = '-';
  }

  // Status Badge Logic
  const statusEl = document.getElementById('status');
  let statusText = 'Aguardando avaliador';
  let statusClass = 'bg-amber-100 text-amber-700 border-amber-200';
  if (project.status === PROJECT_PENDING_REVIEW) {
    statusText = 'Aguardando avaliação';
    statusClass = 'bg-blue-100 text-blue-700 border-blue-200';
  } else if (project.status === PROJECT_APPROVED) {
    statusText = 'Aprovado';
    statusClass = 'bg-green-100 text-green-700 border-green-200';
  } else if (project.status === PROJECT_REJECTED) {
    statusText = 'Reprovado';
    statusClass = 'bg-red-100 text-red-700 border-red-200';
  }
  statusEl.textContent = statusText;
  statusEl.className = `px-3 py-1 rounded-full border text-sm font-medium ${statusClass}`;

  // Download Banner Listener
  const downloadBtn = document.getElementById('downloadBanner');
  if (project.bannerFile?.isSubmitted) {
    downloadBtn.addEventListener('click', () => {
      downloadBuffer(
        project.bannerFile,
        `banner_${project.title.replace(/\s+/g, '_')}`,
      );
    });
  } else {
    downloadBtn.classList.add('hidden');
  }
}

async function addBackListener() {
  const backButtonEl = document.getElementById('back');
  backButtonEl.addEventListener('click', () => {
    window.history.back();
  });
}

function ParticipantProjectListDetails() {
  onMount(async () => {
    await checkSessionJwt();
    const project = await readProject();
    if (exists(project)) {
      await addProjectInfo(project);
    }
    await addBackListener();
  });

  return (
    <div class="flex flex-row min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <div class="ml-72 m-8 w-full max-w-4xl">
        <div class="flex justify-between items-center mb-6">
          <Heading>Detalhes do Projeto</Heading>
        </div>

        <div class="bg-white shadow-sm border border-gray-200 rounded-xl p-8 space-y-6">
          {/* Main Info */}
          <section>
            <label class="text-xs font-bold uppercase tracking-wider text-purple-600">
              Título
            </label>
            <p id="title" class="text-2xl font-semibold mt-1"></p>
          </section>

          <section class="flex">
            <div id="status"></div>
          </section>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500">
                Tipo de Projeto
              </label>
              <p id="type" class="mt-1 font-medium"></p>
            </section>
          </div>

          <hr class="border-gray-100" />

          {/* Authors */}
          <section>
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500">
              Equipe de Autores
            </label>
            <div id="authors-list" class="mt-2 flex flex-wrap gap-2"></div>
          </section>

          {/* Areas */}
          <section>
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500">
              Áreas Atuantes
            </label>
            <p id="areas" class="mt-1 italic text-gray-600"></p>
          </section>

          {/* Keywords */}
          <section>
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500">
              Palavras-chave
            </label>
            <div id="keywords-list" class="mt-2 flex flex-wrap gap-2"></div>
          </section>
          <hr class="border-gray-100" />

          {/* Summary */}
          <section>
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500">
              Resumo
            </label>
            <p
              id="summary"
              class="mt-2 text-gray-700 leading-relaxed whitespace-pre-wrap text-base"
            ></p>
          </section>

          {/* References */}
          <section>
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500">
              Referências Bibliográficas
            </label>
            <ol
              id="references-list"
              class="mt-2 space-y-1 list-decimal list-inside text-gray-700"
            ></ol>
          </section>

          <hr class="border-gray-100" />

          {/* Footer Info & Actions */}
          <div class="flex flex-col justify-between items-left gap-4 pt-4">
            <div>
              <p class="text-sm text-gray-400">
                Submetido em: <span id="createdAt" class="font-medium"></span>
              </p>
            </div>

            <div class="flex flex-row items-center text-center gap-4">
              {/* Download button */}
              <Button
                id="downloadBanner"
                inputClass="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
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
                Baixar Banner
              </Button>

              {/* Back button */}
              <Button
                id="back"
                inputClass="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipantProjectListDetails;
