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
      text: responseJson?.error?.message,
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

      {/* Main Container changed to flex-col to stack the rows vertically */}
      <div class="ml-72 m-8 flex flex-col gap-6 mt-[8%]">
        {/* Row 1: Projects */}
        <div class="flex flex-row gap-4">
          {/* Project Creation */}
          {/* <Anchor
            id="createProject"
            href="/app/examiner/project/create"
            inputClass="px-8 py-6"
          >
            Criar projeto
          </Anchor> */}

          {/* Project List */}
          <Anchor
            id="readProjects"
            href="/app/examiner/project/list"
            inputClass="px-8 py-6"
          >
            Ver projetos
          </Anchor>
        </div>

        {/* Row 2: Resources */}
        <div class="flex flex-row gap-4">
          {/* Edital */}
          <Anchor
            id=""
            href="/images/documents/edital.pdf"
            inputClass="px-8 py-6"
            download="Edital.pdf"
          >
            Edital
          </Anchor>

          {/* Video */}
          {/* <Anchor
            id=""
            href="https://www.instagram.com/reel/DZa5s1JhpPa/?igsh=MWF3dTM0aHZwbHd3Zw=="
            target="_blank"
            inputClass="px-8 py-6"
          >
            Vídeo Guia
          </Anchor> */}

          {/* Banner */}
          <Anchor
            id=""
            href="/images/documents/banner.pptx"
            inputClass="px-8 py-6"
            download="Banner.pptx"
          >
            Banner
          </Anchor>
        </div>
      </div>
    </div>
  );
}

export default ExaminerProject;
