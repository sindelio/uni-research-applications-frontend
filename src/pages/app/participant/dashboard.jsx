import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../helpers/check-session-jwt.js';
import request from '../../../helpers/request.js';
import Navbar from '../../../components/app/navbar.jsx';
import Heading from '../../../components/app/heading.jsx';

const [getStats, setStats] = createSignal(null);
const [getNumberOfProjectsStatus0, setNumberOfProjectsStatus0] =
  createSignal(null);
const [getNumberOfProjectsStatus1, setNumberOfProjectsStatus1] =
  createSignal(null);
const [getNumberOfProjectsStatus2, setNumberOfProjectsStatus2] =
  createSignal(null);
const [getNumberOfProjectsStatus3, setNumberOfProjectsStatus3] =
  createSignal(null);
const [getNumberOfProjectsStatus4, setNumberOfProjectsStatus4] =
  createSignal(null);
const [getNumberOfProjectsType0, setNumberOfProjectsType0] = createSignal(null);
const [getNumberOfProjectsType1, setNumberOfProjectsType1] = createSignal(null);

async function readStats() {
  const responseJson = await request('GET', '/participant/stats', null, true);
  if (responseJson.error) {
    await Swal.fire({
      title: 'Oops',
      text: responseJson?.error?.message,
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/support';
    return null;
  }
  const stats = responseJson.data;
  setStats(stats);
  setNumberOfProjectsStatus0(stats.projectsByStatus.waitingExaminer);
  setNumberOfProjectsStatus1(stats.projectsByStatus.pendingReview);
  setNumberOfProjectsStatus2(stats.projectsByStatus.partiallyApproved);
  setNumberOfProjectsStatus3(stats.projectsByStatus.approved);
  setNumberOfProjectsStatus4(stats.projectsByStatus.rejected);
  setNumberOfProjectsType0(stats.projectsByType.conventional);
  setNumberOfProjectsType1(stats.projectsByType.photo);
}

function Dashboard() {
  onMount(async () => {
    await checkSessionJwt();
    await readStats();
  });

  return (
    <div class="flex flex-row text-lg min-h-screen bg-gray-50">
      <Navbar></Navbar>
      <div class="ml-72 m-8 w-full mr-8">
        {/* Heading */}
        <Heading>Dashboard</Heading>

        {/* Projects by Status Section */}
        <div class="mt-6 mb-3">
          <h2 class="text-lg font-semibold text-gray-700">
            Projetos por Status
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Card: Aguardando Avaliador */}
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-amber-400 border-t border-r border-b border-gray-200 p-4 flex flex-col max-w-xs">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Aguardando Avaliador
            </span>
            <span
              class="text-2xl font-extrabold text-amber-600 mt-1"
              id="projects0"
            >
              {getNumberOfProjectsStatus0() ?? '-'}
            </span>
          </div>

          {/* Card: Em Avaliação */}
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-blue-400 border-t border-r border-b border-gray-200 p-4 flex flex-col max-w-xs">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Em Avaliação
            </span>
            <span
              class="text-2xl font-extrabold text-blue-600 mt-1"
              id="projects1"
            >
              {getNumberOfProjectsStatus1() ?? '-'}
            </span>
          </div>

          {/* Card: Parcialmente Aprovados */}
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-teal-400 border-t border-r border-b border-gray-200 p-4 flex flex-col max-w-xs">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Parc. Aprovados
            </span>
            <span
              class="text-2xl font-extrabold text-teal-600 mt-1"
              id="projects2"
            >
              {getNumberOfProjectsStatus2() ?? '-'}
            </span>
          </div>

          {/* Card: Aprovados */}
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-green-400 border-t border-r border-b border-gray-200 p-4 flex flex-col max-w-xs">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Aprovados
            </span>
            <span
              class="text-2xl font-extrabold text-green-600 mt-1"
              id="projects3"
            >
              {getNumberOfProjectsStatus3() ?? '-'}
            </span>
          </div>

          {/* Card: Reprovados */}
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-red-500 border-t border-r border-b border-gray-200 p-4 flex flex-col max-w-xs">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Reprovados
            </span>
            <span
              class="text-2xl font-extrabold text-red-600 mt-1"
              id="projects4"
            >
              {getNumberOfProjectsStatus4() ?? '-'}
            </span>
          </div>
        </div>

        {/* Projects by Type Section */}
        <div class="mt-8 mb-3">
          <h2 class="text-lg font-semibold text-gray-700">Projetos por Tipo</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Card: Convencional */}
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-purple-500 border-t border-r border-b border-gray-200 p-4 flex flex-col max-w-xs">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Convencionais
            </span>
            <div class="flex items-baseline gap-1 mt-1">
              <span
                class="text-2xl font-extrabold text-purple-600"
                id="projectsType0"
              >
                {getNumberOfProjectsType0() ?? '-'}
              </span>
              <span class="text-sm font-semibold text-gray-400">/ 2</span>
            </div>
          </div>

          {/* Card: Fotográfico */}
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-fuchsia-500 border-t border-r border-b border-gray-200 p-4 flex flex-col max-w-xs">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Fotográficos
            </span>
            <div class="flex items-baseline gap-1 mt-1">
              <span
                class="text-2xl font-extrabold text-fuchsia-600"
                id="projectsType1"
              >
                {getNumberOfProjectsType1() ?? '-'}
              </span>
              <span class="text-sm font-semibold text-gray-400">/ 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
