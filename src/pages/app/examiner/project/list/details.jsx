import env from '../../../../../client-envs/current.js';
import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../../../helpers/check-session-jwt.js';
import request from '../../../../../helpers/request.js';
import downloadBuffer from '../../../../../helpers/download-buffer.js';
import Navbar from '../../../../../components/app/navbar.jsx';
import Heading from '../../../../../components/app/heading.jsx';
import Button from '../../../../../components/app/button.jsx';
import TextArea from '../../../../../components/app/text-area.jsx'; // Imported your custom TextArea component

const {
  LOCAL_STORAGE_USER_TYPE,
  PROJECT_TYPE_PHOTO,
  PROJECT_PENDING_REVIEW,
  PROJECT_PARTIALLY_APPROVED,
  PROJECT_APPROVED,
  PROJECT_REJECTED,
} = env;

const userType = localStorage.getItem(LOCAL_STORAGE_USER_TYPE);
const [getProject, setProject] = createSignal(null);

async function readProject() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('projectId');
  const responseJson = await request(
    'GET',
    `/examiner/project?projectId=${projectId}`,
    null,
    true,
  );
  if (responseJson.error !== null) {
    await Swal.fire({
      title: 'Oops',
      text: responseJson?.error?.message,
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/examiner/dashboard';
    return null;
  }
  const project = responseJson.data;
  setProject(project);
}

async function addProjectInfo() {
  // Get project
  const project = getProject();

  // Title
  document.getElementById('title').textContent = project?.title || '-';

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

  // Project type
  document.getElementById('projectType').textContent =
    project?.projectType || '-';

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

  // Download
  if (projectType === PROJECT_TYPE_PHOTO && project.photoFile?.isSubmitted) {
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

async function addBackListener() {
  const backButtonEl = document.getElementById('back');
  backButtonEl.addEventListener('click', () => {
    window.location.href = `/app/${userType}/project/list`;
  });
}

async function addEvaluationListeners() {
  // Get project
  const project = getProject();

  // Exit if project is not in review
  if (project.status !== PROJECT_PENDING_REVIEW) {
    return;
  }

  // Show evaluation button
  const openEvaluationEl = document.getElementById('openEvaluation');
  openEvaluationEl.classList.remove('hidden');

  // Add open evaluation listener
  const evaluationEl = document.getElementById('evaluation');
  openEvaluationEl.addEventListener('click', () => {
    evaluationEl.classList.toggle('hidden');
    if (!evaluationEl.classList.contains('hidden')) {
      evaluationEl.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Add submit listener
  const submitEvaluationEl = document.getElementById('submitEvaluation');
  submitEvaluationEl.addEventListener('click', async () => {
    const projectId = project._id;
    const payload = {
      status: document.getElementById('evaluationStatus').value,
      title: document.getElementById('evaluationTitle').checked,
      areas: document.getElementById('evaluationAreas').checked,
      summary: document.getElementById('evaluationSummary').checked,
      keywords: document.getElementById('evaluationKeywords').checked,
      references: document.getElementById('evaluationReferences').checked,
      projectType: document.getElementById('evaluationProjectType').checked, // Uses fixed 'projectType' key to avoid Mongoose conflict
      banner: document.getElementById('evaluationBanner').checked,
      premiumNomination: document.getElementById('evaluationPremiumNomination')
        .checked,
      score: {
        relevancy: Number(
          document.getElementById('evaluationScoreRelevancy').value,
        ),
        originality: Number(
          document.getElementById('evaluationScoreOriginality').value,
        ),
        methodology: Number(
          document.getElementById('evaluationScoreMethodology').value,
        ),
        quality: Number(
          document.getElementById('evaluationScoreQuality').value,
        ),
        impact: Number(document.getElementById('evaluationScoreImpact').value),
      },
      commentaries: document.getElementById('evaluationCommentaries').value,
      caveats: document.getElementById('evaluationCaveats').value,
    };

    // Temp submit disable
    submitEvaluationEl.disabled = true;

    // Request
    const responseJson = await request(
      'POST',
      `/examiner/evaluate-project?projectId=${projectId}`,
      payload,
      true,
    );

    // Submit reenable
    submitEvaluationEl.disabled = false;

    // Error message
    if (responseJson.error !== null) {
      await Swal.fire({
        title: 'Oops',
        text: responseJson?.error?.message || 'Verifique os dados enviados.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Success message
    await Swal.fire({
      title: 'Sucesso!',
      text: 'Avaliação submetida com sucesso.',
      icon: 'success',
      confirmButtonText: 'OK',
    });

    // Reload the page
    window.location.reload();
  });
}

function ExaminerProjectListDetails() {
  onMount(async () => {
    await checkSessionJwt();
    await readProject();
    await addProjectInfo();
    await addEvaluationInfo();
    await addBackListener();
    await addEvaluationListeners();
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
            <section>
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500">
                Tipo de Projeto
              </label>
              <p id="projectType" class="mt-1 font-medium"></p>
            </section>
          </div>

          <hr class="border-gray-100" />

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
                        Ressalvas / Alterações
                      </label>
                      <p
                        id="evalCaveats"
                        class="mt-1 text-sm text-gray-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100 whitespace-pre-wrap"
                      ></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start evaluation button */}
              <Button
                id="openEvaluation"
                inputClass="hidden bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Avaliar Projeto
              </Button>

              {/* Download button */}
              <Button
                id="downloadFile"
                inputClass="hidden bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
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

        {/* Evaluation */}
        <div
          id="evaluation"
          class="hidden bg-white shadow-sm border border-gray-200 rounded-xl p-8 space-y-6"
        >
          <h2 class="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
            Formulário de Avaliação
          </h2>

          {/* Evaluation checkboxes */}
          <div>
            <p class="text-sm font-semibold text-gray-700 mb-3">
              Marque os campos validados com sucesso * (submissor terá acesso)
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="evaluationTitle"
                  class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 border-gray-300"
                  checked
                />
                <span class="text-sm text-gray-700">Título adequado</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="evaluationAreas"
                  class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 border-gray-300"
                  checked
                />
                <span class="text-sm text-gray-700">
                  Áreas do conhecimento adequadas
                </span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="evaluationSummary"
                  class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 border-gray-300"
                  checked
                />
                <span class="text-sm text-gray-700">
                  Resumo bem estruturado
                </span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="evaluationKeywords"
                  class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 border-gray-300"
                  checked
                />
                <span class="text-sm text-gray-700">
                  Palavras-chave coerentes
                </span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="evaluationReferences"
                  class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 border-gray-300"
                  checked
                />
                <span class="text-sm text-gray-700">Referências coerentes</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="evaluationProjectType"
                  class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 border-gray-300"
                  checked
                />
                <span class="text-sm text-gray-700">
                  Tipo de projeto adequado
                </span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="evaluationBanner"
                  class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 border-gray-300"
                  checked
                />
                <span class="text-sm text-gray-700">Fotografia adequada</span>
              </label>
            </div>
          </div>

          <hr class="border-gray-100" />

          {/* Scores Section (0 to 5) */}
          <div>
            <p class="text-sm font-semibold text-gray-700 mb-3">
              Notas por Critério (0 a 5, o submissor NÃO terá acesso) *
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">
                  Relevância
                </label>
                <select
                  id="evaluationScoreRelevancy"
                  class="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">
                  Originalidade
                </label>
                <select
                  id="evaluationScoreOriginality"
                  class="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">
                  Metodologia
                </label>
                <select
                  id="evaluationScoreMethodology"
                  class="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">
                  Qualidade
                </label>
                <select
                  id="evaluationScoreQuality"
                  class="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">
                  Impacto
                </label>
                <select
                  id="evaluationScoreImpact"
                  class="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>
          </div>

          <hr class="border-gray-100" />

          {/* Status Toggle & Premium Nomination */}
          <div class="flex flex-col sm:flex-row sm:items-end gap-6">
            <div class="w-full max-w-xs">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Decisão Final * (submissor terá acesso)
              </label>
              <select
                id="evaluationStatus"
                class="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-800 font-medium focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              >
                <option
                  value="Partially approved" // Consumed by backend, do not change
                  class="text-teal-600 font-medium"
                >
                  Parcialmente Aprovado
                </option>
                <option
                  value="Approved" // Do not change
                  class="text-green-600 font-medium"
                >
                  Aprovado
                </option>
                <option
                  value="Rejected" // Do not change
                  class="text-red-600 font-medium"
                >
                  Reprovado
                </option>
              </select>
            </div>

            <div class="flex items-center h-11">
              <label class="flex items-center gap-3 cursor-pointer p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <input
                  type="checkbox"
                  id="evaluationPremiumNomination"
                  class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 border-gray-300"
                />
                <span class="text-sm font-semibold text-purple-900">
                  Indicar ao Prêmio * (submissor NÃO terá acesso)
                </span>
              </label>
            </div>
          </div>

          {/* Text Areas */}
          <div class="space-y-1">
            <TextArea
              id="evaluationCommentaries"
              label="Comentários Adicionais * (submissor NÃO terá acesso)"
              placeholder="Escreva pontos fortes, elogios e observações gerais..."
              inputClass="w-full mt-1 border-gray-300 focus:border-purple-600 focus:ring-purple-600"
            />
            <TextArea
              id="evaluationCaveats"
              label="Ressalvas / Alterações Obrigatórias * (submissor terá acesso)"
              placeholder="Descreva correções urgentes e pontos a ajustar caso reprovado..."
              inputClass="w-full mt-1 border-gray-300 focus:border-purple-600 focus:ring-purple-600"
            />
          </div>

          {/* Submit evaluation */}
          <div class="pt-4 border-t border-gray-100 flex justify-end">
            <Button
              id="submitEvaluation"
              inputClass="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              Submeter Avaliação
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExaminerProjectListDetails;
