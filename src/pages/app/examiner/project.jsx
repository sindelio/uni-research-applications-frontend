import { onMount } from 'solid-js';
import checkSessionJwt from '../../../helpers/check-session-jwt.js';
import Navbar from '../../../components/app/navbar.jsx';
import Anchor from '../../../components/app/anchor.jsx';

function ExaminerProject() {
  onMount(async () => {
    await checkSessionJwt();
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
