import env from '../../../../client-envs/current.js';
import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../../helpers/check-session-jwt.js';
import request from '../../../../helpers/request.js';
import Navbar from '../../../../components/app/navbar.jsx';
import Button from '../../../../components/app/button.jsx';
import P from '../../../../components/app/paragraph.jsx';
import InputNumber from '../../../../components/app/input-number.jsx';
import errorMessage from '../../../../helpers/error-message.js';

const {
  PROJECT_WAITING_EXAMINER,
  PROJECT_PENDING_REVIEW,
  PROJECT_APPROVED,
  PROJECT_REJECTED,
} = env;

const [getAccount, setAccount] = createSignal(null);
const [getList, setList] = createSignal(null);

async function readAccount() {
  const responseJson = await request('GET', '/examiner', null, true);
  if (responseJson.error) {
    await Swal.fire({
      title: 'Oops',
      text: errorMessage,
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/examiner/dashboard';
    return null;
  }
  const account = responseJson.data;
  setAccount(account);
}

async function readList(pageRequested = 1) {
  // Get account
  const account = getAccount();

  // get examiner email
  const { email } = account;

  const responseJson = await request(
    'POST',
    '/examiner/paginated-find',
    {
      model: 'Project',
      query: { examinerEmail: email },
      page: pageRequested,
    },
    true,
  );
  if (responseJson.error !== null) {
    await Swal.fire({
      title: 'Oops',
      text: errorMessage,
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/examiner/dashboard';
  }
  const list = responseJson.data;
  setList(list);
}

async function addListInfo() {
  // Get list
  const list = getList();
  const { itemsInPage } = list;

  // Get listEl
  const listEl = document.getElementById('list-of-items-in-page');
  while (listEl.firstChild) {
    listEl.removeChild(listEl.lastChild);
  }

  // Add info
  itemsInPage?.forEach((item) => {
    const el = document.createElement('li');

    // Status
    let statusInfo = '<span class="text-blue-400">Aguardando avaliação</span>';
    if (item.status === PROJECT_APPROVED) {
      statusInfo = '<span class="text-green-400">Aprovado</span>';
    }
    if (item.status === PROJECT_REJECTED) {
      statusInfo = '<span class="text-red-400">Reprovado</span>';
    }

    // Classes
    el.className =
      'list-none my-6 px-6 py-4 border-2 border-purple-500 rounded-xl col-start-1 col-span-full shadow-md hover:cursor-pointer';

    // Contents
    const itemInfo = `<div class="py-1">Título: ${item?.title}<br />Estado: ${statusInfo}</div>`;
    const plus = `<div class="text-center text-purple-500 text-xl">+</div>`;
    el.innerHTML = `${itemInfo}${plus}`;

    // Add click listener
    el.addEventListener('click', async () => {
      window.location.href = `/app/examiner/project/list/details?projectId=${item._id}`;
    });

    // Append element
    listEl.appendChild(el);
  });
}

async function addPaginationInfo(pageRequested) {
  // Get list
  const list = getList();
  const { numberOfItems } = list;

  // Get page element
  const pageEl = document.getElementById('page');
  pageEl.value = pageRequested;

  // Page info element
  const pageInfoEl = document.getElementById('pageInfo');
  pageInfoEl.innerHTML = `Mostrando página <b>${pageRequested}</b>, dos registros <b>${
    (pageRequested - 1) * 10 + 1
  }</b> ao <b>${pageRequested * 10}</b> do total <b>${numberOfItems}</b>`;
}

async function jumpToPage(pageRequested = 1) {
  if (
    Number.isNaN(pageRequested) ||
    pageRequested < 1 ||
    !Number.isInteger(pageRequested)
  ) {
    await Swal.fire({
      title: 'Oops',
      text: `Por favor verifique a página.`,
      confirmButtonText: 'OK',
    });
    return null;
  }
  await readList(pageRequested);
  const { numberOfItems, itemsInPage } = getList();
  if (pageRequested > Math.ceil(numberOfItems / 10)) {
    await Swal.fire({
      title: 'Oops',
      text: `A página selecionada não existe.`,
      confirmButtonText: 'OK',
    });
    return null;
  }
  await addListInfo(itemsInPage);
  await addPaginationInfo(pageRequested, numberOfItems);
}

async function addPageJumpListener() {
  const jumpEl = document.getElementById('jump');
  jumpEl.addEventListener('click', async () => {
    const pageEl = document.getElementById('page');
    const pageRequested = Number(pageEl.value);
    await jumpToPage(pageRequested);
  });
}

async function addPreviousListener() {
  const previousEl = document.getElementById('previous');
  previousEl.addEventListener('click', async () => {
    const pageEl = document.getElementById('page');
    const currentPage = Number(pageEl.value);
    const requestedPage = currentPage - 1;
    await jumpToPage(requestedPage);
  });
}

async function addNextListener() {
  const nextEl = document.getElementById('next');
  nextEl.addEventListener('click', async () => {
    const pageEl = document.getElementById('page');
    const currentPage = Number(pageEl.value);
    const requestedPage = currentPage + 1;
    await jumpToPage(requestedPage);
  });
}

function ExaminerProjectList() {
  onMount(async () => {
    await checkSessionJwt();
    await readAccount();
    await readList();
    await addListInfo();
    await addPaginationInfo(1);
    await addPageJumpListener();
    await addPreviousListener();
    await addNextListener();
  });
  return (
    <div class="flex flex-row text-lg">
      <Navbar></Navbar>
      <div class="ml-72 m-8 grid grid-cols-12 grid-rows-12">
        <div class="col-start-2 col-span-full row-start-1">
          <ul id="list-of-items-in-page"></ul>
          <br />
          <P id="pageInfo"></P>
          <Button id="previous">Anterior</Button>
          <Button id="jump" inputClass="ml-6">
            Pular para página
          </Button>
          <InputNumber id="page" inputClass="mr-6" />
          <Button id="next">Próximo</Button>
        </div>
      </div>
    </div>
  );
}

export default ExaminerProjectList;
