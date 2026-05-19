import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../helpers/check-session-jwt.js';
import request from '../../../helpers/request.js';
import Navbar from '../../../components/app/navbar.jsx';
import Anchor from '../../../components/app/anchor.jsx';

const [getAccount, setAccount] = createSignal(null);

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

async function checkAdminAuthorization() {
  const account = getAccount();
  const hasAdminAuthorization = account.hasAdminAuthorization;
  if (!hasAdminAuthorization) {
    await Swal.fire({
      title: 'Oops',
      text: 'Por favor aguarde a autorização de um administrador antes de avaliar projetos.',
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/examiner/dashboard';
  }
}

function ExaminerProject() {
  onMount(async () => {
    await checkSessionJwt();
    await readAccount();
    await checkAdminAuthorization();
  });
  return (
    <div class="flex flex-row text-lg">
      <Navbar></Navbar>
      <div class="ml-72 m-8 flex flex-row mt-[8%]">
        <Anchor
          id="readProjects"
          href="/app/examiner/project/list"
          inputClass="mx-4 px-8 py-6"
        >
          Ver projetos
        </Anchor>
      </div>
    </div>
  );
}

export default ExaminerProject;
