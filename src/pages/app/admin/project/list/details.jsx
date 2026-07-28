import env from '../../../../../client-envs/current.js';
import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../../../helpers/check-session-jwt.js';
import request from '../../../../../helpers/request.js';
import validateEmail from '../../../../../helpers/validate-email.js';
import downloadBuffer from '../../../../../helpers/download-buffer.js';
import Navbar from '../../../../../components/app/navbar.jsx';
import Heading from '../../../../../components/app/heading.jsx';
import Button from '../../../../../components/app/button.jsx';

const {
  LOCAL_STORAGE_USER_TYPE,
  PROJECT_WAITING_EXAMINER,
  PROJECT_PENDING_REVIEW,
  PROJECT_PARTIALLY_APPROVED,
  PROJECT_APPROVED,
  PROJECT_REJECTED,
} = env;

const userType = localStorage.getItem(LOCAL_STORAGE_USER_TYPE);
const [getProject, setProject] = createSignal(null);
const [getExaminers, setExaminers] = createSignal(null);

async function readProject() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('projectId');
  const responseJson = await request(
    'GET',
    `/${userType}/project?projectId=${projectId}`,
    null,
    true,
  );
  if (responseJson.error !== null) {
    await Swal.fire({
      title: 'Oops',
      text: responseJson?.error?.message,
      confirmButtonText: 'OK',
    });
    window.location.href = `/app/${userType}/dashboard`;
    return null;
  }
  const project = responseJson.data;
  setProject(project);
}

async function readExaminers() {
  const responseJson = await request(
    'GET',
    `/${userType}/examiners`,
    null,
    true,
  );
  if (responseJson.error !== null) {
    await Swal.fire({
      title: 'Oops',
      text: responseJson?.error?.message,
      confirmButtonText: 'OK',
    });
    window.location.href = `/app/${userType}/dashboard`;
    return null;
  }
  const examiners = responseJson.data;
  setExaminers(examiners);
}

async function addProjectInfo() {
  // Get project
  const project = getProject();

  // Title
  document.getElementById('title').textContent = project?.title || '-';

  // Status
  const statusEl = document.getElementById('status');
  let statusText = 'Aguardando avaliador';
  let statusClass = 'bg-amber-100 text-amber-700 border-amber-200';
  if (project.status === PROJECT_PENDING_REVIEW) {
    statusText = 'Aguardando avaliação';
    statusClass = 'bg-blue-100 text-blue-700 border-blue-200';
  } else if (project.status === PROJECT_PARTIALLY_APPROVED) {
    statusText = 'Parcialmente Aprovado';
    statusClass = 'bg-teal-100 text-teal-700 border-teal-200';
  } else if (project.status === PROJECT_APPROVED) {
    statusText = 'Aprovado';
    statusClass = 'bg-green-100 text-green-700 border-green-200';
  } else if (project.status === PROJECT_REJECTED) {
    statusText = 'Reprovado';
    statusClass = 'bg-red-100 text-red-700 border-red-200';
  }
  statusEl.textContent = statusText;
  statusEl.className = `px-3 py-1 rounded-full border text-sm font-medium ${statusClass}`;

  // Project type
  document.getElementById('projectType').textContent =
    project?.projectType || '-';

  // Participant email
  document.getElementById('participantEmail').textContent =
    project?.participantEmail || '-';

  // Authors
  const authorsEl = document.getElementById('authors-list');
  authorsEl.innerHTML = '';
  project.authors.forEach((author) => {
    const span = document.createElement('span');
    span.className =
      'block text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-1 mb-1 w-fit';
    span.textContent = `${author.name} — ${author.institution}`;
    authorsEl.appendChild(span);
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

  // Created at
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

  // Resubmission commentaries
  if (project?.resubmissionCommentaries) {
    const resubmissionCommentariesSectionEl = document.getElementById(
      'resubmissionCommentariesSection',
    );
    resubmissionCommentariesSectionEl.classList.remove('hidden');
    const resubmissionCommentariesEl = document.getElementById(
      'resubmissionCommentaries',
    );
    resubmissionCommentariesEl.textContent = project?.resubmissionCommentaries;
  }

  // Allocated examiner
  document.getElementById('allocatedExaminer').textContent =
    project?.examinerEmail || '-';

  // Download
  if (project.photoFile?.isSubmitted) {
    const downloadEl = document.getElementById('downloadFile');
    downloadEl.classList.remove('hidden');
    downloadEl.addEventListener('click', () => {
      const fileName = `projeto_${project.title.replace(/\s+/g, '_')}.docx`;
      downloadBuffer(project.photoFile, fileName);
    });
  }
}

async function addEvaluationInfo() {
  // Get project
  const project = getProject();

  const viewEvaluationBtn = document.getElementById('viewEvaluation');
  const evaluationModal = document.getElementById('evaluationModal');
  const closeEvaluationModalBtn = document.getElementById(
    'closeEvaluationModal',
  );

  const projectStatus = project.status;
  if (
    projectStatus === PROJECT_PARTIALLY_APPROVED ||
    projectStatus === PROJECT_APPROVED ||
    projectStatus === PROJECT_REJECTED
  ) {
    // Show the view evaluation button since an evaluation exists
    viewEvaluationBtn.classList.remove('hidden');

    const evaluation = project.evaluation;
    const fields = [
      'title',
      'areas',
      'summary',
      'keywords',
      'references',
      'projectType',
      'photo',
    ];

    // Populate checklist statuses
    fields.forEach((field) => {
      const elementId = `eval${field.charAt(0).toUpperCase() + field.slice(1)}`;
      const el = document.getElementById(elementId);
      if (el) {
        if (evaluation[field] === true) {
          el.textContent = 'Aprovado';
          el.className = 'text-sm font-semibold text-green-600';
        } else {
          el.textContent = 'Reprovado';
          el.className = 'text-sm font-semibold text-red-600';
        }
      }
    });

    // Populate criteria scores
    if (evaluation.score) {
      document.getElementById('evalScoreRelevancy').textContent =
        evaluation.score.relevancy !== undefined
          ? `${evaluation.score.relevancy} / 5`
          : '-';
      document.getElementById('evalScoreOriginality').textContent =
        evaluation.score.originality !== undefined
          ? `${evaluation.score.originality} / 5`
          : '-';
      document.getElementById('evalScoreMethodology').textContent =
        evaluation.score.methodology !== undefined
          ? `${evaluation.score.methodology} / 5`
          : '-';
      document.getElementById('evalScoreQuality').textContent =
        evaluation.score.quality !== undefined
          ? `${evaluation.score.quality} / 5`
          : '-';
      document.getElementById('evalScoreImpact').textContent =
        evaluation.score.impact !== undefined
          ? `${evaluation.score.impact} / 5`
          : '-';
    } else {
      document.getElementById('evalScoreRelevancy').textContent = '-';
      document.getElementById('evalScoreOriginality').textContent = '-';
      document.getElementById('evalScoreMethodology').textContent = '-';
      document.getElementById('evalScoreQuality').textContent = '-';
      document.getElementById('evalScoreImpact').textContent = '-';
    }

    // Populate premium nomination status
    const premiumNominationEl = document.getElementById(
      'evalPremiumNomination',
    );
    if (premiumNominationEl) {
      if (evaluation.premiumNomination === true) {
        premiumNominationEl.textContent = 'Sim';
        premiumNominationEl.className = 'text-sm font-bold text-amber-600';
      } else {
        premiumNominationEl.textContent = 'Não';
        premiumNominationEl.className = 'text-sm font-semibold text-gray-500';
      }
    }

    // Populate commentaries and caveats text content
    document.getElementById('evalCommentaries').textContent =
      evaluation.commentaries || 'Nenhum comentário.';
    document.getElementById('evalCaveats').textContent =
      evaluation.caveats || 'Nenhuma ressalva.';

    // Add click listeners to handle visibility toggle
    viewEvaluationBtn.addEventListener('click', () => {
      evaluationModal.classList.remove('hidden');
    });

    closeEvaluationModalBtn.addEventListener('click', () => {
      evaluationModal.classList.add('hidden');
    });

    // Close modal if user clicks on the outer translucent background overlay
    evaluationModal.addEventListener('click', (event) => {
      if (event.target === evaluationModal) {
        evaluationModal.classList.add('hidden');
      }
    });
  } else {
    // Hide the view evaluation button if no review data exists
    viewEvaluationBtn.classList.add('hidden');
  }
}

async function addExaminerAllocationListener() {
  const project = getProject();
  const { status } = project;

  if (status !== PROJECT_WAITING_EXAMINER) {
    return;
  }

  // Elements
  const allocateExaminerBtn = document.getElementById('allocateExaminerBtn');
  const allocateInputContainer = document.getElementById(
    'allocateInputContainer',
  );
  const closeAllocateModalBtn = document.getElementById('closeAllocateModal');
  const examinersListContainer = document.getElementById(
    'examinersListContainer',
  );

  const populateExaminersList = () => {
    const examiners = getExaminers() || [];
    examinersListContainer.innerHTML = '';

    if (examiners.length === 0) {
      examinersListContainer.innerHTML =
        '<p class="text-sm text-gray-500 italic p-2 text-center">Nenhum avaliador encontrado.</p>';
      return;
    }

    let hasSelectedFirstAvailable = false;

    examiners.forEach((examiner) => {
      const numProjects = examiner.numProjects ?? 0;
      const maxProjects = examiner.maxProjects ?? 0;
      const isFull = numProjects >= maxProjects;

      const label = document.createElement('label');
      label.className = `flex items-start justify-between p-3 rounded-lg border transition-colors ${
        isFull
          ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
          : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer'
      }`;

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'selectedExaminer';
      radio.value = examiner.email;
      radio.disabled = isFull;
      radio.className = 'text-purple-600 focus:ring-purple-500 h-4 w-4 mt-0.5';

      if (!isFull && !hasSelectedFirstAvailable) {
        radio.checked = true;
        hasSelectedFirstAvailable = true;
      }

      const infoDiv = document.createElement('div');
      infoDiv.className = 'ml-3 flex-1 min-w-0 pr-2';

      const nameP = document.createElement('p');
      nameP.className = 'text-sm font-semibold text-gray-800';
      nameP.textContent = examiner.name || examiner.email;

      const emailP = document.createElement('p');
      emailP.className = 'text-xs text-gray-500';
      emailP.textContent = examiner.email;

      infoDiv.appendChild(nameP);
      infoDiv.appendChild(emailP);

      // Render Areas of Knowledge
      const examinerAreas = examiner.areas || [];
      if (examinerAreas.length > 0) {
        const areasDiv = document.createElement('div');
        areasDiv.className = 'mt-2 flex flex-wrap gap-1';

        examinerAreas.forEach((area) => {
          const areaSpan = document.createElement('span');
          areaSpan.className =
            'text-[10px] font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 leading-none';
          areaSpan.textContent = area;
          areasDiv.appendChild(areaSpan);
        });

        infoDiv.appendChild(areasDiv);
      }

      const badgeSpan = document.createElement('span');
      badgeSpan.className = `text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${
        isFull
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-purple-50 text-purple-700 border-purple-200'
      }`;
      badgeSpan.textContent = `${numProjects} / ${maxProjects} projetos`;

      label.appendChild(radio);
      label.appendChild(infoDiv);
      label.appendChild(badgeSpan);

      examinersListContainer.appendChild(label);
    });
  };

  // Button click listener
  allocateExaminerBtn.classList.remove('hidden');
  allocateExaminerBtn.addEventListener('click', () => {
    populateExaminersList();
    allocateInputContainer.classList.remove('hidden');
  });

  // Modal listener
  closeAllocateModalBtn.addEventListener('click', () => {
    allocateInputContainer.classList.add('hidden');
  });

  // Input listener
  allocateInputContainer.addEventListener('click', (event) => {
    if (event.target === allocateInputContainer) {
      allocateInputContainer.classList.add('hidden');
    }
  });

  // Confirmation listener
  const confirmAllocateBtn = document.getElementById('confirmAllocateBtn');
  confirmAllocateBtn.addEventListener('click', async () => {
    const selectedRadio = document.querySelector(
      'input[name="selectedExaminer"]:checked',
    );
    const examinerEmail = selectedRadio ? selectedRadio.value : '';

    if (!validateEmail(examinerEmail)) {
      await Swal.fire({
        title: 'Oops',
        text: 'Por favor, selecione um avaliador válido.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const project = getProject();
    const projectId = project._id;

    const responseJson = await request(
      'POST',
      `/${userType}/allocate-examiner-to-project?projectId=${projectId}`,
      { examinerEmail },
      true,
    );
    if (responseJson.error !== null) {
      await Swal.fire({
        title: 'Oops',
        text: responseJson?.error?.message,
        confirmButtonText: 'OK',
      });
      return null;
    }
    await Swal.fire({
      title: 'Sucesso',
      text: 'Avaliador alocado para o projeto!',
      confirmButtonText: 'OK',
    });
    window.location.reload();
  });
}

async function addBackListener() {
  const backButtonEl = document.getElementById('back');
  backButtonEl.addEventListener('click', () => {
    window.location.href = `/app/${userType}/project/list`;
  });
}

function AdminProjectListDetails() {
  onMount(async () => {
    await checkSessionJwt();
    await readProject();
    await readExaminers();
    await addProjectInfo();
    await addEvaluationInfo();
    await addBackListener();
    await addExaminerAllocationListener();
  });

  return (
    <div class="flex flex-row min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <div class="ml-72 m-8 w-full max-w-4xl space-y-6">
        <div class="flex justify-between items-center mb-6">
          <Heading>Detalhes do Projeto</Heading>
        </div>

        {/* Project View Card */}
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
            {/* Project type */}
            <section>
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500">
                Tipo de Projeto
              </label>
              <p id="projectType" class="mt-1 font-medium"></p>
            </section>

            {/* Participant email */}
            <section>
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500">
                Email do Submissor
              </label>
              <p id="participantEmail" class="mt-1 font-medium"></p>
            </section>
          </div>

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
              Áreas do Conhecimento
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

          {/* Resubmission Commentaries */}
          <section id="resubmissionCommentariesSection" class="hidden">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500">
              Comentários de Ressubmissão
            </label>
            <p
              id="resubmissionCommentaries"
              class="mt-2 text-gray-700 leading-relaxed whitespace-pre-wrap text-base"
            ></p>
          </section>

          {/* Examiners Information */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500">
                Avaliador Alocado
              </label>
              <p
                id="allocatedExaminer"
                class="mt-1 font-medium text-gray-700"
              ></p>
            </section>
          </div>

          <hr class="border-gray-100" />

          {/* Footer Info & Actions */}
          <div class="flex flex-col justify-between items-left gap-4 pt-4">
            <div>
              <p class="text-sm text-gray-400">
                Submetido em: <span id="createdAt" class="font-medium"></span>
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              {/* Evaluation View Action & Modal Window */}
              <Button
                id="viewEvaluation"
                inputClass="hidden bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  />
                </svg>
                Ver Avaliação
              </Button>
              <div
                id="evaluationModal"
                class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
              >
                <div class="bg-white rounded-xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl border border-gray-100 text-left">
                  <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 class="text-lg font-bold text-gray-900">
                      Resultado detalhado da Avaliação
                    </h3>
                    <button
                      id="closeEvaluationModal"
                      type="button"
                      class="text-gray-400 hover:text-gray-600 font-bold text-2xl transition-colors"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Checklist Results Grid */}
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                      <span class="font-medium text-gray-600">Título:</span>
                      <span id="evalTitle"></span>
                    </div>
                    <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                      <span class="font-medium text-gray-600">Áreas:</span>
                      <span id="evalAreas"></span>
                    </div>
                    <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                      <span class="font-medium text-gray-600">Resumo:</span>
                      <span id="evalSummary"></span>
                    </div>
                    <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                      <span class="font-medium text-gray-600">
                        Palavras-chave:
                      </span>
                      <span id="evalKeywords"></span>
                    </div>
                    <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                      <span class="font-medium text-gray-600">
                        Referências:
                      </span>
                      <span id="evalReferences"></span>
                    </div>
                    <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                      <span class="font-medium text-gray-600">
                        Tipo de Projeto:
                      </span>
                      <span id="evalProjectType"></span>
                    </div>
                    <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                      <span class="font-medium text-gray-600">Fotografia:</span>
                      <span id="evalBanner"></span>
                    </div>
                  </div>

                  {/* Criteria Scores Section */}
                  <div class="pt-2 border-t border-gray-100">
                    <label class="text-xs font-bold uppercase tracking-wider text-purple-600 block mb-2">
                      Notas por Critério (0 a 5)
                    </label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                        <span class="font-medium text-gray-600">
                          Relevância:
                        </span>
                        <span
                          id="evalScoreRelevancy"
                          class="font-semibold text-gray-800"
                        ></span>
                      </div>
                      <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                        <span class="font-medium text-gray-600">
                          Originalidade:
                        </span>
                        <span
                          id="evalScoreOriginality"
                          class="font-semibold text-gray-800"
                        ></span>
                      </div>
                      <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                        <span class="font-medium text-gray-600">
                          Metodologia:
                        </span>
                        <span
                          id="evalScoreMethodology"
                          class="font-semibold text-gray-800"
                        ></span>
                      </div>
                      <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                        <span class="font-medium text-gray-600">
                          Qualidade:
                        </span>
                        <span
                          id="evalScoreQuality"
                          class="font-semibold text-gray-800"
                        ></span>
                      </div>
                      <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                        <span class="font-medium text-gray-600">Impacto:</span>
                        <span
                          id="evalScoreImpact"
                          class="font-semibold text-gray-800"
                        ></span>
                      </div>
                      <div class="flex items-center justify-between p-2 bg-amber-50/60 rounded border border-amber-200">
                        <span class="font-medium text-amber-800 font-semibold">
                          Indicação ao Prêmio:
                        </span>
                        <span id="evalPremiumNomination"></span>
                      </div>
                    </div>
                  </div>

                  {/* Text Comments Sections */}
                  <div class="space-y-4 pt-2">
                    <div>
                      <label class="text-xs font-bold uppercase tracking-wider text-purple-600 block">
                        Comentários
                      </label>
                      <p
                        id="evalCommentaries"
                        class="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap"
                      ></p>
                    </div>
                    <div>
                      <label class="text-xs font-bold uppercase tracking-wider text-amber-600 block">
                        Ressalvas / Alterações Obrigatórias
                      </label>
                      <p
                        id="evalCaveats"
                        class="mt-1 text-sm text-gray-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100 whitespace-pre-wrap"
                      ></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download button */}
              <Button
                id="downloadFile"
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
                Baixar Arquivo
              </Button>

              {/* Allocate examiner section */}
              <div class="flex items-center gap-2">
                <Button
                  id="allocateExaminerBtn"
                  inputClass="hidden bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  Alocar Avaliador
                </Button>

                {/* Allocate Examiner Modal Window */}
                <div
                  id="allocateInputContainer"
                  class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
                >
                  <div class="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-gray-100 text-left">
                    <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                      <h3 class="text-lg font-bold text-gray-900">
                        Alocar Avaliador ao Projeto
                      </h3>
                      <button
                        id="closeAllocateModal"
                        type="button"
                        class="text-gray-400 hover:text-gray-600 font-bold text-2xl transition-colors"
                      >
                        &times;
                      </button>
                    </div>

                    <div class="space-y-1.5">
                      <label class="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                        Selecione o Avaliador
                      </label>
                      <div
                        id="examinersListContainer"
                        class="max-h-60 overflow-y-auto space-y-2 pr-1"
                      ></div>
                    </div>

                    <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
                      <Button
                        id="confirmAllocateBtn"
                        inputClass="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                      >
                        Confirmar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

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

export default AdminProjectListDetails;
