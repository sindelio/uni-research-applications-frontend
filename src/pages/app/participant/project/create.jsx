import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../../helpers/check-session-jwt.js';
import exists from '../../../../helpers/exists.js';
import toBase64 from '../../../../helpers/to-base-64.js';
import request from '../../../../helpers/request.js';
import Navbar from '../../../../components/app/navbar.jsx';
import Heading from '../../../../components/app/heading.jsx';
import InputText from '../../../../components/app/input-text.jsx';
import Button from '../../../../components/app/button.jsx';
import Divider from '../../../../components/app/divider.jsx';
import TextArea from '../../../../components/app/text-area.jsx';
import errorMessage from '../../../../helpers/error-message.js';

const [getAccount, setAccount] = createSignal(null);
const [getProject, setProject] = createSignal(null);

const MAX_AREAS = 2;
let authorIndex = 1;
let keywordIndex = 1;
let referenceIndex = 1;

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
        text: errorMessage,
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
    titleEl.disabled = true;
    // Replicates the style in InputText component
    titleEl.className =
      'mt-2 mb-6 px-4 py-1 bg-transparent-100 text-gray-400 border border-gray-300 rounded-lg hover:cursor-default';

    // Authors
    if (exists(project.authors)) {
      for (let i = 0; i < project.authors.length; i++) {
        const author = project.authors[i];

        if (i === 0) {
          // Update the pre-rendered first author button
          const firstAuthorEl = document.getElementById('author0');
          firstAuthorEl.dataset.name = author.name;
          firstAuthorEl.dataset.institution = author.institution || '';
          firstAuthorEl.textContent = `${author.name} (${author.institution})`;
        } else {
          // Programmatically build additional authors
          const newAuthorId = `author${authorIndex}`;
          const newAuthorEl = document.createElement('button');
          newAuthorEl.id = newAuthorId;
          newAuthorEl.type = 'button';
          newAuthorEl.classList =
            'px-4 py-1 text-purple-600 border border-purple-400 rounded-lg hover:bg-red-100 hover:text-red-600 hover:border-red-400 hover:cursor-pointer';
          newAuthorEl.textContent = `${author.name} (${author.institution})`;

          newAuthorEl.dataset.name = author.name;
          newAuthorEl.dataset.institution = author.institution;

          document.getElementById('authors').appendChild(newAuthorEl);
          await addRemoveElementListener(newAuthorId);
          authorIndex++;
        }
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
      }
    }
  }
  // Else populate only the first author
  else {
    // Get account
    const account = getAccount();

    // Get first author element
    const firstAuthorEl = document.getElementById('author0');

    // We use dataset to store the values for easy retrieval later
    firstAuthorEl.dataset.name = account.name;
    firstAuthorEl.dataset.institution = account.institution || '';
    firstAuthorEl.textContent = `${account.name} (${account.institution})`;
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

    // Check input
    if (
      authorNameEl.value.trim() === '' ||
      authorInstitutionEl.value.trim() === ''
    ) {
      Swal.fire('Oops', 'Preencha nome e instituição do autor.', 'warning');
      return;
    }

    // Create element
    const newAuthorId = `author${authorIndex}`;
    const newAuthorEl = document.createElement('button');
    newAuthorEl.id = newAuthorId;
    newAuthorEl.type = 'button';
    newAuthorEl.classList =
      'px-4 py-1 text-purple-600 border border-purple-400 rounded-lg hover:bg-red-100 hover:text-red-600 hover:border-red-400 hover:cursor-pointer';
    newAuthorEl.textContent = `${authorNameEl.value} (${authorInstitutionEl.value})`;

    // Store data in attributes
    newAuthorEl.dataset.name = authorNameEl.value;
    newAuthorEl.dataset.institution = authorInstitutionEl.value;

    // Append new element
    document.getElementById('authors').appendChild(newAuthorEl);

    // Clear inputs
    authorNameEl.value = '';
    authorInstitutionEl.value = '';

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

      if (name && institution) {
        authors.push({
          name: name.trim(),
          institution: institution.trim(),
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
    const photoFile = photoEl.files[0];

    // Check input
    if (!exists(title) || title?.length < 3) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique o título.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    if (authors.length < 1) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique os autores.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    if (keywords.length < 1) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique as palavras-chave.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    if (!exists(summary) || summary.length < 3) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique o resumo.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    if (references.length < 1) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique as referências.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    if (areas.length < 1) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique as áreas.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    if (!exists(photoFile)) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique a foto.',
        confirmButtonText: 'OK',
      });
      return null;
    }

    // Convert the file to a Base64 string
    const photoFile64Encoded = await toBase64(photoFile);

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
      photoFile64Encoded, // This is now a long string
    };

    // If resubmitting
    const project = getProject();
    if (exists(project)) {
      httpMethod = 'PATCH';
      delete payload.title;
      url = `/participant/project?projectId=${project._id}`;
    }

    // Send request
    const responseJson = await request(httpMethod, url, payload, true);

    // Process response
    if (responseJson.error) {
      await Swal.fire({
        title: 'Oops',
        text: errorMessage,
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
    window.location.reload(); // Refresh to reset state
  });
}

function ParticipantProjectCreate() {
  onMount(async () => {
    await checkSessionJwt();
    await readAccount();
    await checkReceiptSubmission();
    await populateProjectInfo();
    await addRemoveElementListener('author0');
    await addNewAuthorListener();
    await addMaxAreasListeners();
    await addNewKeywordListener();
    await addNewReferenceListener();
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
            label="Título *"
            size={24}
            placeholder="Título do projeto .."
          ></InputText>

          {/* Authors */}
          <div>
            <p class="mb-2">Autores *</p>
            <div class="flex flex-col gap-2">
              <input
                type="text"
                id="authorName"
                placeholder="Nome do autor .."
                class="px-4 py-1 border border-purple-400 rounded-lg focus:outline-purple-600"
                size={24}
              />
              <input
                type="text"
                id="authorInstitution"
                placeholder="Instituição do autor .."
                class="px-4 py-1 border border-purple-400 rounded-lg focus:outline-purple-600"
                size={24}
              />
              <Button id="plusAuthorButton" inputClass="w-fit">
                Adicionar Autor
              </Button>
            </div>
          </div>
          {/* Added authors */}
          <div id="authors" class="flex flex-wrap gap-2 mb-8">
            {/* The first author (the user) will be injected here */}
            <button
              id="author0"
              type="button"
              class="px-4 py-1 text-purple-600 border border-purple-400 rounded-lg hover:bg-red-100 hover:text-red-600 hover:border-red-400"
            ></button>
          </div>

          {/* Areas */}
          <div>
            <p class="my-2">Areas * (max 2)</p>
            <input id="area0" type="checkbox" area="Hematologia"></input>
            <label class="mx-4">Hematologia</label>
            <br />

            <input id="area1" type="checkbox" area="Citopatologia"></input>
            <label class="mx-4">Citopatologia</label>
            <br />

            <input id="area2" type="checkbox" area="Parasitologia"></input>
            <label class="mx-4">Parasitologia</label>
            <br />

            <input
              id="area3"
              type="checkbox"
              area="Pet não convencional"
            ></input>
            <label class="mx-4">Pet não convencional</label>
            <br />

            <input id="area4" type="checkbox" area="Biologia molecular"></input>
            <label class="mx-4">Biologia molecular</label>
            <br />

            <input id="area5" type="checkbox" area="Dermatologia"></input>
            <label class="mx-4">Dermatologia</label>
            <br />

            <input id="area6" type="checkbox" area="Urinálise"></input>
            <label class="mx-4">Urinálise</label>
            <br />

            <input id="area7" type="checkbox" area="Derrame cavitário"></input>
            <label class="mx-4">Derrame cavitário</label>
            <br />

            <input id="area8" type="checkbox" area="Medula óssea"></input>
            <label class="mx-4">Medula óssea</label>
            <br />

            <input
              id="area9"
              type="checkbox"
              area="Líquido sinovial e cefalorraquidiano"
            ></input>
            <label class="mx-4">Líquido sinovial e cefalorraquidiano</label>
            <br />
          </div>
          <br />

          {/* Keywords */}
          <div>
            <p class="mb-2">Palavras-chave *</p>
            <div class="flex flex-col gap-2">
              <input
                type="text"
                id="keyword"
                placeholder="Palavra-chave .."
                class="px-4 py-1 border border-purple-400 rounded-lg focus:outline-purple-600"
                size={24}
              />
              <Button id="plusKeywordButton" inputClass="w-fit">
                Adicionar Palavra-Chave
              </Button>
            </div>
          </div>
          {/* Added keywords */}
          <div id="keywords" class="flex flex-wrap gap-2 mb-8"></div>

          {/* Summary */}
          <TextArea
            id="summary"
            label="Resumo * (max 512 caracteres)"
            placeholder="Resumo do projeto .."
            rows={8}
            cols={48}
          ></TextArea>

          {/* References */}
          <div>
            <p class="mb-2">Referências *</p>
            <div class="flex flex-col gap-2">
              <input
                type="text"
                id="reference"
                placeholder="Referência .."
                class="px-4 py-1 border border-purple-400 rounded-lg focus:outline-purple-600"
                size={24}
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

          <div class="mb-6">
            <p class="mb-2">Foto do Projeto (imagem) *</p>
            <input
              type="file"
              id="photoFile"
              name="photoFile"
              accept="application/image/*"
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
