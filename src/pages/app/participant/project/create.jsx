import env from '../../../../client-envs/current.js';
import { onMount } from 'solid-js';
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

const MAX_AREAS = 2;
let currentAuthorId = 1;

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

async function checkReceiptSubmission(account) {
  const isSubmitted = account?.receiptFile?.isSubmitted;
  if (!isSubmitted) {
    await Swal.fire({
      title: 'Oops',
      text: 'Por favor envie seu comprovante de inscrição antes de criar um projeto.',
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/participant/account';
  }
}

async function addAccountInfo(account) {
  const firstAuthorEl = document.getElementById('author0');
  firstAuthorEl.textContent = `${account.name}`;
}

async function addRemoveAuthorListener(authorButtonId) {
  const authorButtonEl = document.getElementById(authorButtonId);
  authorButtonEl.addEventListener('click', async (event) => {
    authorButtonEl.remove();
  });
}

async function addNewAuthorListener() {
  const newAuthorButtonEl = document.getElementById('plusAuthorButton');
  newAuthorButtonEl.addEventListener('click', async (event) => {
    const authorNameEl = document.getElementById('authorName');
    const newAuthorName = authorNameEl.value;

    const newAuthorEl = document.createElement('button');
    const newAuthorId = `author${currentAuthorId}`;
    newAuthorEl.id = newAuthorId;
    newAuthorEl.classList =
      'm-2 px-4 py-1 text-purple-600 border border-purple-400 rounded-lg hover:bg-purple-600 hover:text-white hover:cursor-pointer focus:outline-purple-600';
    newAuthorEl.textContent = newAuthorName;

    const authorsEl = document.getElementById('authors');
    authorsEl.appendChild(newAuthorEl);

    const breakLineEl = document.createElement('br');
    authorsEl.appendChild(breakLineEl);

    await addRemoveAuthorListener(newAuthorId);

    currentAuthorId++;
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

async function addSubmitListener() {
  const detailsSubmitEl = document.getElementById('submit');
  detailsSubmitEl.addEventListener('click', async (event) => {
    Swal.fire({ title: 'Please wait ...' });
    event.preventDefault();

    // Get form data
    const detailsFormEl = document.querySelector('#detailsForm');
    const formData = new FormData(detailsFormEl);
    const title = formData.get('title');
    const institution = formData.get('institution');
    const authors = [];
    const authorButtonEls = document.querySelectorAll('#authors button');
    authorButtonEls.forEach((authorButtonEl) => {
      const author = authorButtonEl.textContent;
      const trimmedAuthor = author.trim();
      if (trimmedAuthor !== '') {
        authors.push(trimmedAuthor);
      }
    });
    const areaCheckboxEls = document.querySelectorAll('input[type="checkbox"]');
    const checkedAreaCheckboxEls = Array.from(areaCheckboxEls).filter(
      (checkboxEl) => checkboxEl.checked,
    );
    const areas = checkedAreaCheckboxEls.map((checkedAreaCheckboxEl) => {
      const area = checkedAreaCheckboxEl.getAttribute('area');
      return area;
    });
    const description = formData.get('description');
    const type = formData.get('projectType');
    const bannerEl = document.getElementById('bannerFile');
    const bannerFile = bannerEl.files[0];

    // Check input
    if (!exists(title) || title?.length < 3) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique o título.',
        confirmButtonText: 'OK',
      });
      return null;
    }
    if (!exists(institution) || institution?.length < 2) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique a instituição.',
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
    if (!exists(description) || description?.length < 3) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique a descrição.',
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
    if (!exists(bannerFile)) {
      await Swal.fire({
        title: 'Oops',
        text: 'Verifique o banner.',
        confirmButtonText: 'OK',
      });
      return null;
    }

    // Convert the file to a Base64 string
    const bannerFile64Encoded = await toBase64(bannerFile);

    // Send request
    const responseJson = await request(
      'POST',
      '/participant/project',
      {
        title,
        institution,
        authors,
        areas,
        description,
        type,
        bannerFile64Encoded, // This is now a long string
      },
      true,
    );

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
    const account = await readAccount();
    await checkReceiptSubmission(account);
    await addAccountInfo(account);
    await addRemoveAuthorListener('author0');
    await addNewAuthorListener();
    await addMaxAreasListeners();
    await addSubmitListener();
  });
  return (
    <div class="flex flex-row text-lg">
      <Navbar></Navbar>
      <div class="ml-72 m-8">
        <Heading>Novo Projeto</Heading>
        <form id="detailsForm" class="">
          <Divider inputClass="w-full bg-purple-500 border-purple-500"></Divider>

          {/* Title */}
          <InputText
            id="title"
            label="Título *"
            size={24}
            placeholder=""
          ></InputText>

          {/* Institution */}
          <InputText
            id="institution"
            label="Instituição *"
            size={24}
            placeholder=""
          ></InputText>

          {/* Authors */}
          <div>
            <p>Autores *</p>
            <input
              type="text"
              id="authorName"
              class="mt-2 mb-6 px-4 py-1 border border-purple-400 rounded-lg focus:outline-purple-600"
              size={24}
              maxlength={256}
            />
            <Button id="plusAuthorButton" inputClass="mx-4">
              +
            </Button>
          </div>
          <div id="authors">
            <button
              id="author0"
              type="button"
              class="m-2 px-4 py-1 text-purple-600 border border-purple-400 rounded-lg hover:bg-purple-600 hover:text-white hover:cursor-pointer focus:outline-purple-600"
            ></button>
            <br />
          </div>
          <br />

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

          {/* Description */}
          <TextArea
            id="description"
            label="Descrição * (max 512 caracteres)"
            placeholder="Descrição do projeto .."
            rows={8}
            cols={48}
          ></TextArea>

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
            <p class="mb-2">Banner do Projeto (PDF ou imagem) *</p>
            <input
              type="file"
              id="bannerFile"
              name="bannerFile"
              accept="application/pdf,image/*"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          {/* Submit */}
          <Button id="submit" type="button">
            Submeter para aprovação
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ParticipantProjectCreate;
