import env from '../../../client-envs/current.js';
import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../helpers/check-session-jwt.js';
import request from '../../../helpers/request.js';
import Navbar from '../../../components/app/navbar.jsx';
import Heading from '../../../components/app/heading.jsx';
import P from '../../../components/app/paragraph.jsx';
import errorMessage from '../../../helpers/error-message.js';

const {
  PROJECT_WAITING_EXAMINER,
  PROJECT_PENDING_REVIEW,
  PROJECT_APPROVED,
  PROJECT_REJECTED,
} = env;

const [getProjects, setProjects] = createSignal(null);

async function readProjects() {
  const responseJson = await request(
    'GET',
    '/participant/projects',
    null,
    true,
  );
  if (responseJson.error) {
    await Swal.fire({
      title: 'Oops',
      text: errorMessage,
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/participant/dashboard';
    return null;
  }
  const projects = responseJson.data;
  setProjects(projects);
}

async function addProjectsOnStatusCount(status, elementId) {
  const projects = getProjects();
  const projectsOnStatus = projects.filter((project) => {
    if (project.status === status) {
      return true;
    }
    return false;
  });
  const projectsEl = document.getElementById(elementId);
  projectsEl.textContent = projectsOnStatus.length;
}

async function addProjectsInfo() {
  await addProjectsOnStatusCount(PROJECT_WAITING_EXAMINER, 'projects0');
  await addProjectsOnStatusCount(PROJECT_PENDING_REVIEW, 'projects1');
  await addProjectsOnStatusCount(PROJECT_APPROVED, 'projects2');
  await addProjectsOnStatusCount(PROJECT_REJECTED, 'projects3');
}

function Dashboard() {
  onMount(async () => {
    await checkSessionJwt();
    await readProjects();
    await addProjectsInfo();
  });
  return (
    <div class="flex flex-row text-lg">
      <Navbar></Navbar>
      <div class="ml-72 m-8">
        {/* Heading */}
        <Heading>Dashboard</Heading>

        {/* Dashboard info */}
        <P>
          Projetos aguardando avaliador: <span id="projects0"></span>
        </P>
        <P>
          Projetos aguardando avaliação: <span id="projects1"></span>
        </P>
        <P>
          Projetos aprovados: <span id="projects2"></span>
        </P>
        <P>
          Projetos reprovados: <span id="projects3"></span>
        </P>
      </div>
    </div>
  );
}

export default Dashboard;
