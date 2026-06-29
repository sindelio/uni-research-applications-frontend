import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../helpers/check-session-jwt.js';
import errorMessage from '../../../helpers/error-message.js';
import request from '../../../helpers/request.js';
import Navbar from '../../../components/app/navbar.jsx';
import Heading from '../../../components/app/heading.jsx';

const [getStats, setStats] = createSignal(null);
const [getNumberOfAdmins, setNumberOfAdmins] = createSignal(0);
const [getNumberOfExaminers, setNumberOfExaminers] = createSignal(0);
const [getNumberOfParticipants, setNumberOfParticipants] = createSignal(0);
const [getNumberOfProjects0, setNumberOfProjects0] = createSignal(0);
const [getNumberOfProjects1, setNumberOfProjects1] = createSignal(0);
const [getNumberOfProjects2, setNumberOfProjects2] = createSignal(0);
const [getNumberOfProjects3, setNumberOfProjects3] = createSignal(0);
const [getNumberOfProjects4, setNumberOfProjects4] = createSignal(0);

async function readStats() {
  const responseJson = await request('GET', '/admin/stats', null, true);
  if (responseJson.error) {
    await Swal.fire({
      title: 'Oops',
      text: errorMessage,
      confirmButtonText: 'OK',
    });
    window.location.href = '/app/support';
    return null;
  }
  const stats = responseJson.data;
  setStats(stats);
  setNumberOfAdmins(stats.admins);
  setNumberOfExaminers(stats.examiners);
  setNumberOfParticipants(stats.participants);
  setNumberOfProjects0(stats.projectsWaitingExaminer);
  setNumberOfProjects1(stats.projectsPendingReview);
  setNumberOfProjects2(stats.projectsPartiallyApproved);
  setNumberOfProjects3(stats.projectsApproved);
  setNumberOfProjects4(stats.projectsRejected);
}

function Dashboard() {
  onMount(async () => {
    await checkSessionJwt();
    await readStats();
  });

  return (
    <div class="flex flex-row min-h-screen bg-gray-50">
      <Navbar userType="examiner"></Navbar>

      <div class="ml-72 p-6 w-full max-w-6xl">
        {/* Heading */}
        <Heading>Dashboard</Heading>

        {/* Users Section */}
        <div class="mt-6 mb-3">
          <h2 class="text-lg font-semibold text-gray-700">Usuários</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {/* Card: Avaliadores */}
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col max-w-xs">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Admins
            </span>
            <span
              class="text-2xl font-extrabold text-indigo-600 mt-1"
              id="admins"
            >
              {getNumberOfAdmins() ?? '-'}
            </span>
          </div>

          {/* Card: Avaliadores */}
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col max-w-xs">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Avaliadores
            </span>
            <span
              class="text-2xl font-extrabold text-indigo-600 mt-1"
              id="examiners"
            >
              {getNumberOfExaminers() ?? '-'}
            </span>
          </div>

          {/* Card: Participantes */}
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col max-w-xs">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Participantes
            </span>
            <span
              class="text-2xl font-extrabold text-indigo-600 mt-1"
              id="participants"
            >
              {getNumberOfParticipants() ?? '-'}
            </span>
          </div>
        </div>

        {/* Projects Section */}
        <div class="mb-3">
          <h2 class="text-lg font-semibold text-gray-700">Projetos</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card: Aguardando Avaliador */}
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-amber-400 border-t border-r border-b border-gray-200 p-4 flex flex-col">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Aguardando Avaliador
            </span>
            <span
              class="text-2xl font-extrabold text-amber-600 mt-1"
              id="projects0"
            >
              {getNumberOfProjects0() ?? '-'}
            </span>
          </div>

          {/* Card: Em Avaliação */}
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-blue-400 border-t border-r border-b border-gray-200 p-4 flex flex-col">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Em Avaliação
            </span>
            <span
              class="text-2xl font-extrabold text-blue-600 mt-1"
              id="projects1"
            >
              {getNumberOfProjects1() ?? '-'}
            </span>
          </div>

          {/* Card: Parcialmente Aprovados */}
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-teal-400 border-t border-r border-b border-gray-200 p-4 flex flex-col">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Parcialmente Aprovados
            </span>
            <span
              class="text-2xl font-extrabold text-teal-600 mt-1"
              id="projects2"
            >
              {getNumberOfProjects2() ?? '-'}
            </span>
          </div>

          {/* Card: Aprovados */}
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-green-400 border-t border-r border-b border-gray-200 p-4 flex flex-col">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Aprovados
            </span>
            <span
              class="text-2xl font-extrabold text-green-600 mt-1"
              id="projects2"
            >
              {getNumberOfProjects3() ?? '-'}
            </span>
          </div>

          {/* Card: Reprovados */}
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-red-500 border-t border-r border-b border-gray-200 p-4 flex flex-col">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Reprovados
            </span>
            <span
              class="text-2xl font-extrabold text-red-600 mt-1"
              id="projects3"
            >
              {getNumberOfProjects4() ?? '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
