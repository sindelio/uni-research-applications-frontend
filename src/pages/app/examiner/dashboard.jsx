import { createSignal, onMount } from 'solid-js';
import Swal from 'sweetalert2';
import checkSessionJwt from '../../../helpers/check-session-jwt.js';
import request from '../../../helpers/request.js';
import Navbar from '../../../components/app/navbar.jsx';
import Heading from '../../../components/app/heading.jsx';
import P from '../../../components/app/paragraph.jsx';
import errorMessage from '../../../helpers/error-message.js';

const [getStats, setStats] = createSignal(null);

async function readStats() {
  const responseJson = await request('GET', '/examiner/stats', null, true);
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
}

async function addStatsInfo() {
  const stats = getStats();

  // Projects pending review
  const projectsPendingReviewEl = document.getElementById('projects1');
  projectsPendingReviewEl.textContent = stats.projectsPendingReview;

  // Projects approved
  const projectsApprovedEl = document.getElementById('projects2');
  projectsApprovedEl.textContent = stats.projectsApproved;

  // Projects rejected
  const projectsRejectedEl = document.getElementById('projects3');
  projectsRejectedEl.textContent = stats.projectsRejected;
}

function Dashboard() {
  onMount(async () => {
    await checkSessionJwt();
    await readStats();
    await addStatsInfo();
  });
  return (
    <div class="flex flex-row text-lg">
      <Navbar userType="examiner"></Navbar>
      <div class="ml-72 m-8">
        {/* Heading */}
        <Heading>Dashboard</Heading>

        {/* Dashboard info */}
        <P>
          Projetos em avaliação: <span id="projects1"></span>
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
