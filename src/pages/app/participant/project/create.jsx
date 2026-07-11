import env from '../../../../client-envs/current.js';
import { createSignal, onMount, For } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../../helpers/check-session-jwt.js';
import exists from '../../../../helpers/exists.js';
import areas from '../../../../helpers/areas.js';
import toBase64 from '../../../../helpers/to-base-64.js';
import request from '../../../../helpers/request.js';
import Navbar from '../../../../components/app/navbar.jsx';
import Heading from '../../../../components/app/heading.jsx';
import InputText from '../../../../components/app/input-text.jsx';
import Button from '../../../../components/app/button.jsx';
import Divider from '../../../../components/app/divider.jsx';

const {
  PROJECT_STATUS_PENDING_REVIEW,
  PROJECT_TYPE_CONVENTIONAL,
  PROJECT_TYPE_PHOTO,
} = env;

const [getAccount, setAccount] = createSignal(null);
const [getSettings, setSettings] = createSignal(null);
const [getProject, setProject] = createSignal(null);

const MAX_AREAS = 2;
let authorIndex = 0;
let keywordIndex = 0;
let referenceIndex = 0;

const brazilianStates = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
];

async function readAccount() {
  const responseJson = await request('GET', '/participant', null, true);
  if (responseJson.error) {
    await Swal.fire({
      title: 'Oops',
      text: responseJson?.error?.message,
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/participant/dashboard';
    return null;
  }
  const account = responseJson.data;
  setAccount(account);
}

async function readSettings() {
  const responseJson = await request(
    'GET',
    '/participant/settings',
    null,
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
  const settings = responseJson.data;
  setSettings(settings);
}

async function checkSubmissionEnabled() {
  // Get settings
  const settings = getSettings();

  // Check if project submission is enabled
  const { projectSubmissionEnabled } = settings;
  if (!projectSubmissionEnabled) {
    await Swal.fire({
      title: 'Oops',
      text: 'Submissão de projetos encerrada',
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/participant/dashboard';
    return null;
  }
}

async function checkReceiptSubmission() {
  // Get account
  const account = getAccount();

  // Check receipt
  const isSubmitted = account.receiptFile.isSubmitted;
  if (!isSubmitted) {
    await Swal.fire({
      title: 'Oops',
      text: 'Por favor envie seu comprovante de inscrição antes de criar um projeto.',
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/participant/account';
  }
}

async function populateProjectInfo() {
  // Get projectId if present
  const urlQueryParams = new URLSearchParams(window.location.search);
  const projectId = urlQueryParams.get('projectId');

  // Check if project exists
  if (exists(projectId)) {
    const responseJson = await request(
      'GET',
      `/participant/project?projectId=${projectId}`,
      null,
      true,
    );
    if (responseJson.error !== null) {
      await Swal.fire({
        title: 'Oops',
        text: responseJson?.error?.message,
        confirmButtonText: 'OK',
      });
      window.location.href = '/app/participant/dashboard';
      return null;
    }
    const project = responseJson.data;
    setProject(project);

    // Title
    const titleEl = document.getElementById('title');
    titleEl.value = project.title;

    // Authors
    if (exists(project.authors)) {
      for (let i = 0; i < project.authors.length; i++) {
        const author = project.authors[i];

        const newAuthorId = `author${authorIndex}`;
        const newAuthorEl = document.createElement('button');
        newAuthorEl.id = newAuthorId;
        newAuthorEl.type = 'button';
        newAuthorEl.classList =
          'px-4 py-1 text-purple-600 border border-purple-400 rounded-lg hover:bg-red-100 hover:text-red-600 hover:border-red-400 hover:cursor-pointer';

        let text = `${author.name} (${author.institution || ''}`;
        if (author.city && author.state)
          text += ` - ${author.city}/${author.state}`;
        text += `)`;
        newAuthorEl.textContent = text;

        newAuthorEl.dataset.name = author.name;
        newAuthorEl.dataset.institution = author.institution || '';
        newAuthorEl.dataset.city = author.city || '';
        newAuthorEl.dataset.state = author.state || '';

        document.getElementById('authors').appendChild(newAuthorEl);
        await addRemoveElementListener(newAuthorId);
        authorIndex++;
      }
    }

    // Areas (Checkboxes)
    if (project.areas) {
      const areaCheckboxEls = document.querySelectorAll(
        'input[type="checkbox"]',
      );
      areaCheckboxEls.forEach((checkbox) => {
        const areaName = checkbox.getAttribute('area');
        if (project.areas.includes(areaName)) {
          checkbox.checked = true;
        }
      });
    }

    // Populate Keywords
    if (project.keywords) {
      for (const keyword of project.keywords) {
        const newKeywordId = `keyword${keywordIndex}`;
        const newKeywordEl = document.createElement('button');
        newKeywordEl.id = newKeywordId;
        newKeywordEl.type = 'button';
        newKeywordEl.classList =
          'px-4 py-1 text-purple-600 border border-purple-400 rounded-lg hover:bg-red-100 hover:text-red-600 hover:border-red-400 hover:cursor-pointer';
        newKeywordEl.textContent = keyword;

        newKeywordEl.dataset.keyword = keyword;

        document.getElementById('keywords').appendChild(newKeywordEl);
        await addRemoveElementListener(newKeywordId);
        keywordIndex++;
      }
    }

    // Summary
    const summaryEl = document.getElementById('summary');
    if (summaryEl) {
      summaryEl.value = project.summary;
    }

    // References
    if (project.references) {
      for (const reference of project.references) {
        const newReferenceId = `reference${referenceIndex}`;
        const newReferenceEl = document.createElement('button');
        newReferenceEl.id = newReferenceId;
        newReferenceEl.type = 'button';
        newReferenceEl.classList =
          'px-4 py-1 text-purple-600 border border-purple-400 rounded-lg hover:bg-red-100 hover:text-red-600 hover:border-red-400 hover:cursor-pointer';
        newReferenceEl.textContent = reference;

        newReferenceEl.dataset.reference = reference;

        document.getElementById('references').appendChild(newReferenceEl);
        await addRemoveElementListener(newReferenceId);
        referenceIndex++;
      }
    }

    // Project Type (Radio Buttons)
    if (project.projectType) {
      const radioEl = document.querySelector(
        `input[name="projectType"][value="${project.projectType}"]`,
      );
      if (exists(radioEl)) {
        radioEl.checked = true;

        // Unhide the file upload input if the loaded project is Fotográfico
        const projectPhotoEl = document.getElementById('projectPhoto');
        if (project.projectType === 'Fotográfico') {
          projectPhotoEl.classList.remove('hidden');
        } else {
          projectPhotoEl.classList.add('hidden');
        }
      }
    }
  }
}

async function addRemoveElementListener(elementId) {
  const el = document.getElementById(elementId);
  el.addEventListener('click', async (event) => {
    el.remove();
  });
}

async function addNewAuthorListener() {
  const plusAuthorButtonEl = document.getElementById('plusAuthorButton');
  plusAuthorButtonEl.addEventListener('click', async (event) => {
    const authorNameEl = document.getElementById('authorName');
    const authorInstitutionEl = document.getElementById('authorInstitution');
    const authorCityEl = document.getElementById('authorCity');
    const authorStateEl = document.getElementById('authorState');

    // Check input
    if (
      authorNameEl.value.trim() === '' ||
      authorInstitutionEl.value.trim() === '' ||
      authorCityEl.value.trim() === '' ||
      authorStateEl.value.trim() === ''
    ) {
      Swal.fire(
        'Oops',
        'Preencha nome, instituição, cidade e estado do autor.',
        'warning',
      );
      return;
    }

    // Create element
    const newAuthorId = `author${authorIndex}`;
    const newAuthorEl = document.createElement('button');
    newAuthorEl.id = newAuthorId;
    newAuthorEl.type = 'button';
    newAuthorEl.classList =
      'px-4 py-1 text-purple-600 border border-purple-400 rounded-lg hover:bg-red-100 hover:text-red-600 hover:border-red-400 hover:cursor-pointer';
    newAuthorEl.textContent = `${authorNameEl.value} (${authorInstitutionEl.value} - ${authorCityEl.value}/${authorStateEl.value})`;

    // Store data in attributes
    newAuthorEl.dataset.name = authorNameEl.value;
    newAuthorEl.dataset.institution = authorInstitutionEl.value;
    newAuthorEl.dataset.city = authorCityEl.value;
    newAuthorEl.dataset.state = authorStateEl.value;

    // Append new element
    document.getElementById('authors').appendChild(newAuthorEl);

    // Clear inputs
    authorNameEl.value = '';
    authorInstitutionEl.value = '';
    authorCityEl.value = '';
    authorStateEl.value = '';

    // Add removal listener
    await addRemoveElementListener(newAuthorId);

    // Increment index
    authorIndex++;
  });
}

async function addMaxAreasListeners() {
  const areaCheckboxEls = document.querySelectorAll('input[type="checkbox"]');
  areaCheckboxEls.forEach((checkbox) => {
    checkbox.addEventListener('change', (_event) => {
      const checkedCount = Array.from(areaCheckboxEls).filter(
        (checkboxEl) => checkboxEl.checked,
      ).length;

      if (checkedCount > MAX_AREAS) {
        checkbox.checked = false; // Revert the change
        Swal.fire({
          title: 'Limite atingido',
          text: 'Você pode selecionar no máximo 2 áreas.',
          icon: 'warning',
          confirmButtonText: 'OK',
        });
      }
    });
  });
}

async function addNewKeywordListener() {
  const plusKeywordButtonEl = document.getElementById('plusKeywordButton');
  plusKeywordButtonEl.addEventListener('click', async (event) => {
    const keywordEl = document.getElementById('keyword');

    // Check input
    if (keywordEl.value.trim() === '') {
      Swal.fire('Oops', 'Preencha a palavra-chave.', 'warning');
      return;
    }

    // Create element
    const newKeywordId = `keyword${keywordIndex}`;
    const newKeywordEl = document.createElement('button');
    newKeywordEl.id = newKeywordId;
    newKeywordEl.type = 'button';
    newKeywordEl.classList =
      'px-4 py-1 text-purple-600 border border-purple-400 rounded-lg hover:bg-red-100 hover:text-red-600 hover:border-red-400 hover:cursor-pointer';
    newKeywordEl.textContent = `${keywordEl.value}`;

    // Store data in attributes
    newKeywordEl.dataset.keyword = keywordEl.value;

    // Append new element
    document.getElementById('keywords').appendChild(newKeywordEl);

    // Clear inputs
    keywordEl.value = '';

    // Add removal listener
    await addRemoveElementListener(newKeywordId);

    // Increment index
    keywordIndex++;
  });
}

async function addNewReferenceListener() {
  const plusReferenceButtonEl = document.getElementById('plusReferenceButton');
  plusReferenceButtonEl.addEventListener('click', async (event) => {
    const referenceEl = document.getElementById('reference');

    // Check input
    if (referenceEl.value.trim() === '') {
      Swal.fire('Oops', 'Preencha a referência.', 'warning');
      return;
    }

    // Create element
    const newReferenceId = `reference${referenceIndex}`;
    const newReferenceEl = document.createElement('button');
    newReferenceEl.id = newReferenceId;
    newReferenceEl.type = 'button';
    newReferenceEl.classList =
      'px-4 py-1 text-purple-600 border border-purple-400 rounded-lg hover:bg-red-100 hover:text-red-600 hover:border-red-400 hover:cursor-pointer';
    newReferenceEl.textContent = `${referenceEl.value}`;

    // Store data in attributes
    newReferenceEl.dataset.reference = referenceEl.value;

    // Append new element
    document.getElementById('references').appendChild(newReferenceEl);

    // Clear inputs
    referenceEl.value = '';

    // Add removal listener
    await addRemoveElementListener(newReferenceId);

    // Increment index
    referenceIndex++;
  });
}

async function addProjectTypeListener() {
  const radioEls = document.querySelectorAll('input[name="projectType"]');
  const projectPhotoEl = document.getElementById('projectPhoto');

  radioEls.forEach((radio) => {
    radio.addEventListener('change', (event) => {
      if (event.target.value === PROJECT_TYPE_PHOTO) {
        projectPhotoEl.classList.remove('hidden');
      } else {
        projectPhotoEl.classList.add('hidden');
      }
    });
  });
}

async function addSubmitListener() {
  const detailsSubmitEl = document.getElementById('submit');
  detailsSubmitEl.addEventListener('click', async (event) => {
    Swal.fire({ title: 'Please wait ...' });
    event.preventDefault();

    // Get form data
    const detailsFormEl = document.querySelector('#detailsForm');
    const formData = new FormData(detailsFormEl);

    // Title
    const title = formData.get('title');

    // Authors
    const authors = [];
    const authorButtonEls = document.querySelectorAll('#authors button');
    authorButtonEls.forEach((authorButtonEl) => {
      const name = authorButtonEl.dataset.name;
      const institution = authorButtonEl.dataset.institution;
      const city = authorButtonEl.dataset.city;
      const state = authorButtonEl.dataset.state;

      if (name && institution && city && state) {
        authors.push({
          name: name.trim(),
          institution: institution.trim(),
          city: city ? city.trim() : '',
          state: state ? state.trim() : '',
        });
      }
    });

    // Areas
    const areaCheckboxEls = document.querySelectorAll('input[type="checkbox"]');
    const checkedAreaCheckboxEls = Array.from(areaCheckboxEls).filter(
      (checkboxEl) => checkboxEl.checked,
    );
    const areas = checkedAreaCheckboxEls.map((checkedAreaCheckboxEl) => {
      const area = checkedAreaCheckboxEl.getAttribute('area');
      return area;
    });

    // Keywords
    const keywords = [];
    const keywordButtonEls = document.querySelectorAll('#keywords button');
    keywordButtonEls.forEach((keywordButtonEl) => {
      const keyword = keywordButtonEl.dataset.keyword;

      if (keyword) {
        keywords.push(keyword.trim());
      }
    });

    // Summary
    const summary = formData.get('summary');

    // References
    const references = [];
    const referenceButtonEls = document.querySelectorAll('#references button');
    referenceButtonEls.forEach((referenceButtonEl) => {
      const reference = referenceButtonEl.dataset.reference;

      if (reference) {
        references.push(reference.trim());
      }
    });

    // Type
    const projectType = formData.get('projectType');

    // Photo file
    const photoEl = document.getElementById('photoFile');
    const photoFile = photoEl?.files[0];

    // Check title
    if (!exists(title) || title?.length < 3 || title?.length > 500) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique o título.',
        confirmButtonText: 'OK',
      });
      return null;
    }

    // Check authors
    if (authors.length < 1) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique os autores.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    for (let i = 0; i < authors?.length; i++) {
      const author = authors[i];
      if (
        author?.name?.length > 500 ||
        author?.institution?.length > 500 ||
        author?.city?.length > 500 ||
        author?.state.length != 2
      ) {
        await Swal.fire({
          title: 'Oops',
          text: 'Verifique os autores.',
          confirmButtonText: 'OK',
        });
        return null;
      }
    }

    // Check keywords
    if (keywords.length < 3 || keywords.length > 5) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique as palavras-chave.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    for (let i = 0; i < keywords?.length; i++) {
      const keyword = keywords[i];
      if (keyword?.length > 500) {
        await Swal.fire({
          title: 'Oops',
          text: 'Verifique as palavras-chave.',
          confirmButtonText: 'OK',
        });
        return null;
      }
    }

    // Check summary
    if (projectType === PROJECT_TYPE_CONVENTIONAL) {
      if (
        !exists(summary) ||
        summary?.length < 1750 ||
        summary?.length > 2450
      ) {
        await Swal.fire({
          title: 'Oops',
          text: 'Verifique o resumo.',
          confirmButtonText: 'OK',
        });
        return null;
      }
    } else if (projectType === PROJECT_TYPE_PHOTO) {
      if (
        !exists(summary) ||
        summary?.length < 1500 ||
        summary?.length > 2100
      ) {
        await Swal.fire({
          title: 'Oops',
          text: 'Verifique o resumo.',
          confirmButtonText: 'OK',
        });
        return null;
      }
    }

    // Check references
    if (references.length < 1) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique as referências.',
        confirmButtonText: 'OK',
      });
      return null;
    }

    // Check areas
    if (areas.length < 1) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique as áreas.',
        confirmButtonText: 'OK',
      });
      return null;
    }

    // Only validate the document if the project type is "Fotográfico"
    if (projectType === PROJECT_TYPE_PHOTO) {
      if (!exists(photoFile)) {
        await Swal.fire({
          title: 'Oops',
          text: 'Verifique o arquivo (WORD) do projeto.',
          confirmButtonText: 'OK',
        });
        return null;
      }
    }

    let photoFile64Encoded = '';
    if (projectType === PROJECT_TYPE_PHOTO) {
      // Check if the file exists and is valid
      if (exists(photoFile)) {
        // Convert the file object to a Base64 string
        photoFile64Encoded = await toBase64(photoFile);
      }
    }

    // Request params
    let httpMethod = 'POST';
    let url = '/participant/project';
    const payload = {
      title,
      authors,
      areas,
      keywords,
      summary,
      references,
      projectType,
      photoFile64Encoded, // Contains the string Base64 representation of the Word file
    };

    // If resubmitting
    const project = getProject();
    if (exists(project)) {
      httpMethod = 'PATCH';
      url = `/participant/project?projectId=${project._id}`;
      payload.status = PROJECT_STATUS_PENDING_REVIEW;
    }

    // Send request
    const responseJson = await request(httpMethod, url, payload, true);

    // Process response
    if (responseJson.error) {
      await Swal.fire({
        title: 'Oops',
        text: responseJson?.error?.message,
        confirmButtonText: 'OK',
      });
      window.location.href = '/app/participant/dashboard';
      return null;
    }
    await Swal.fire({
      title: 'Sucesso',
      text: 'Projeto submetido para avaliação!',
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/participant/project/create';
  });
}

function ParticipantProjectCreate() {
  onMount(async () => {
    await checkSessionJwt();
    await readAccount();
    await readSettings();
    await checkSubmissionEnabled();
    await checkReceiptSubmission();
    await populateProjectInfo();
    await addNewAuthorListener();
    await addMaxAreasListeners();
    await addNewKeywordListener();
    await addNewReferenceListener();
    await addProjectTypeListener();
    await addSubmitListener();
  });
  return (
    <div class="flex flex-row text-lg">
      <Navbar></Navbar>
      <div class="ml-72 m-8">
        <Heading id="heading">Novo Projeto</Heading>
        <form id="detailsForm" class="">
          <Divider inputClass="w-full bg-purple-500 border-purple-500"></Divider>

          {/* Title */}
          <InputText
            id="title"
            label="Título * (max 500 caracteres)"
            size={24}
            placeholder="Título do projeto .."
            maxlength={500}
          ></InputText>

          {/* Authors */}
          <div>
            <p class="mb-2">Autores *</p>
            <div class="flex flex-col gap-2">
              <input
                type="text"
                id="authorName"
                placeholder="Nome completo do autor * (max 500 caracteres)"
                class="px-4 py-1 border border-purple-400 rounded-lg focus:outline-purple-600"
                size={24}
                maxLength={500}
              />
              <input
                type="text"
                id="authorInstitution"
                placeholder="Instituição * (max 500 caracteres)"
                class="px-4 py-1 border border-purple-400 rounded-lg focus:outline-purple-600"
                size={24}
                maxLength={500}
              />
              <div class="flex gap-2">
                <input
                  type="text"
                  id="authorCity"
                  placeholder="Cidade * (max 500 caracteres)"
                  class="w-full px-4 py-1 border border-purple-400 rounded-lg focus:outline-purple-600"
                  maxLength={500}
                />
                <select
                  id="authorState"
                  name="authorState"
                  class="w-1/3 px-4 py-1 border border-purple-400 rounded-lg focus:outline-purple-600 bg-white"
                >
                  <option value="" disabled selected>
                    UF *
                  </option>
                  <For each={brazilianStates}>
                    {(state) => <option value={state}>{state}</option>}
                  </For>
                </select>
              </div>
              <Button id="plusAuthorButton" inputClass="w-fit mt-2">
                Adicionar Autor
              </Button>
            </div>
          </div>
          {/* Added authors */}
          <div id="authors" class="flex flex-wrap gap-2 mb-8 mt-4"></div>

          {/* Areas */}
          <div>
            <p class="my-2">Areas * (1 a 2)</p>
            <For each={areas}>
              {(area, index) => (
                <>
                  <input id={`area${index()}`} type="checkbox" area={area} />
                  <label class="mx-4">{area}</label>
                  <br />
                </>
              )}
            </For>
          </div>
          <br />

          {/* Keywords */}
          <div>
            <p class="mb-2">Palavras-chave * (3 a 5, max 500 caracteres)</p>
            <div class="flex flex-col gap-2">
              <input
                type="text"
                id="keyword"
                placeholder="Palavra-chave .."
                class="px-4 py-1 border border-purple-400 rounded-lg focus:outline-purple-600"
                size={24}
                maxLength={500}
              />
              <Button id="plusKeywordButton" inputClass="w-fit">
                Adicionar Palavra-Chave
              </Button>
            </div>
          </div>
          {/* Added keywords */}
          <div id="keywords" class="flex flex-wrap gap-2 mb-8"></div>

          {/* Summary */}
          <div>
            <p class="flex">
              Resumo * <br />
              (1750 a 2450 caracteres para projetos convencionais)
              <br />
              (1500 a 2100 caracteres para projetos fotográficos)
            </p>
            <textarea
              id="summary"
              name="summary"
              class="mt-2 mb-6 p-4 border border-purple-400 rounded-lg focus:outline-purple-600"
              placeholder="Resumo do projeto .."
              rows={8}
              cols={48}
              maxlength={2450}
              style={{ resize: 'none' }}
            ></textarea>
          </div>

          {/* References */}
          <div>
            <p class="mb-2">Referências * (1 a 50, max 500 caracteres)</p>
            <div class="flex flex-col gap-2">
              <input
                type="text"
                id="reference"
                placeholder="Referência .."
                class="px-4 py-1 border border-purple-400 rounded-lg focus:outline-purple-600"
                size={24}
                maxlength={500}
              />
              <Button id="plusReferenceButton" inputClass="w-fit">
                Adicionar Referência
              </Button>
            </div>
          </div>
          {/* Added keywords */}
          <div id="references" class="flex flex-wrap gap-2 mb-8"></div>

          {/* Type */}
          <div class="mb-6">
            <p class="mb-2">Tipo de Projeto *</p>
            <div class="flex items-center space-x-6">
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="projectType"
                  value="Convencional"
                  checked
                  class="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <span class="ml-2 text-gray-700">Convencional</span>
              </label>

              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="projectType"
                  value="Fotográfico"
                  class="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <span class="ml-2 text-gray-700">Fotográfico</span>
              </label>
            </div>
          </div>

          <div id="projectPhoto" class="hidden mb-6">
            <p class="mb-2">Arquivo do Projeto (Word) *</p>
            <input
              type="file"
              id="photoFile"
              name="photoFile"
              accept=".doc,.docx"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          {/* Submit */}
          <Button id="submit" type="button">
            Submeter para avaliação
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ParticipantProjectCreate;
