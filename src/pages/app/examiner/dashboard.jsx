import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../helpers/check-session-jwt.js';
import request from '../../../helpers/request.js';
import Navbar from '../../../components/app/navbar.jsx';
import Heading from '../../../components/app/heading.jsx';

const [getStats, setStats] = createSignal(null);
const [getNumberOfProjects1, setNumberOfProjects1] = createSignal(null);
const [getNumberOfProjects2, setNumberOfProjects2] = createSignal(null);
const [getNumberOfProjects3, setNumberOfProjects3] = createSignal(null);
const [getNumberOfProjects4, setNumberOfProjects4] = createSignal(null);

async function readStats() {
  const responseJson = await request('GET', '/examiner/stats', null, true);
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
    <div class="flex flex-row text-lg min-h-screen bg-gray-50">
      <Navbar userType="examiner"></Navbar>
      <div class="ml-72 m-8 w-full mr-8">
        {/* Heading */}
        <Heading>Dashboard</Heading>

        {/* Dashboard info */}
        <div class="mt-6 mb-3">
          <h2 class="text-lg font-semibold text-gray-700">
            Projetos por Status
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card: Em Avaliação */}
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-blue-400 border-t border-r border-b border-gray-200 p-4 flex flex-col max-w-xs">
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
          <div class="bg-white rounded-lg shadow-sm border-l-4 border-l-teal-400 border-t border-r border-b border-gray-200 p-4 flex flex-col max-w-xs">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Parc. Aprovados
            </span>
            <span
              class="text-2xl font-extrabold text-teal-600 mt-1"
              id="projects2"
            >
              {getNumberOfProjects2() ?? '-'}
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
              {getNumberOfProjects3() ?? '-'}
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
              {getNumberOfProjects4() ?? '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
