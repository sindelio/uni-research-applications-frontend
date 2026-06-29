import { onMount } from 'solid-js';
import Navbar from '../../components/website/navbar.jsx';
import Footer from '../../components/website/footer.jsx';
import exists from '../../helpers/exists.js';

async function scrollToSection(section) {
  if (exists(section)) {
    // requestAnimationFrame ensures the browser has finished its current task
    requestAnimationFrame(() => {
      const sectionEl = document.getElementById(section);
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

async function wordFlick() {
  const words = ['● Evento presencial', '● Fórum', '● Mostra científica'];
  const len = words.length;
  const speed = 105;
  let skip_count = 0;
  let skip_delay = 15;
  let part;
  let i = 0;
  let offset = 0;
  let forwards = true;
  const wordEl = document.getElementById('flickering-word');
  setInterval(function () {
    if (forwards) {
      if (offset >= words[i].length) {
        skip_count += 1;
        if (skip_count === skip_delay) {
          forwards = false;
          skip_count = 0;
        }
      }
    } else {
      if (offset === 0) {
        forwards = true;
        i++;
        offset = 0;
        if (i >= len) {
          i = 0;
        }
      }
    }
    part = words[i].substr(0, offset);
    if (skip_count == 0) {
      if (forwards) {
        offset += 1;
      } else {
        offset -= 1;
      }
    }
    wordEl.textContent = part;
  }, speed);
}

function Intro(props) {
  onMount(async () => {
    const section = props?.section;
    await scrollToSection(section);
    await wordFlick();
  });
  return (
    <div>
      <Navbar></Navbar>

      {/* HERO */}
      <section id="hero" class="gradient p-10 text-white">
        <div class="text-center">
          <div class="text-center">
            <h1 class="my-2 text-3xl md:text-5xl font-bold">VIII ENPCV</h1>
            <p class="my-2 leading-normal text-xl md:text-2xl">
              Encontro Nacional de
              <br />
              Patologia Clínica Veterinária
            </p>
            <p class=" my-2 leading-normal text-xl md:text-2xl">
              &nbsp;<span id="flickering-word"></span>&nbsp;
            </p>
            <p class="my-2 leading-normal text-xl md:text-2xl">
              <span class="text-amber-400">16, 17 e 18</span> de Outubro de 2026
            </p>
          </div>
        </div>
      </section>

      {/* EVENT */}
      <section
        id="event"
        class="grid grid-cols-1 md:grid-cols-5 text-gray-800 text-center p-6"
      >
        <h1 class="text-[1.875rem] md:text-5xl col-start-1 col-span-full text-gray-800 my-2 text-5xl font-bold">
          Evento
        </h1>

        <div class="col-start-1 col-span-full">
          <div class="h-1 mx-auto gradient w-64 rounded-t"></div>
        </div>

        <div class="col-start-1 md:col-start-2 md:col-span-3 px-4 pb-4">
          <div class="rounded-2xl bg-white border-2 border-purple-400 shadow-lg">
            <div class="p-4 text-center text-xl md:text-xl">
              ● Evento presencial ● Fórum ● Mostra Científica
            </div>
          </div>
        </div>
      </section>

      {/* REALIZATION */}
      <section
        id="realization"
        class="grid grid-cols-1 md:grid-cols-5 text-gray-800 text-center p-6"
      >
        {/* Heading spans all columns */}
        <h1 class="text-[1.875rem] md:text-5xl col-span-full text-gray-800 my-2 font-bold">
          Realização
        </h1>

        {/* Divider spans all columns */}
        <div class="col-span-full">
          <div class="h-1 mx-auto gradient w-64 rounded-t"></div>
        </div>

        {/* Card Container: 
          Spans all 4 columns to provide maximum room for the 4 sponsor images.
        */}
        <div class="col-start-1 md:col-start-2 md:col-span-3 px-4 pb-4">
          <div class="rounded-2xl bg-white border-2 border-purple-400 shadow-lg p-6">
            {/* Inner Grid: 2 columns on mobile, 4 columns on desktop */}
            <div class="grid grid-cols-2 md:grid-cols-3 gap-8 justify-items-center items-center">
              <img
                src="/images/realizators/realizator1.jpeg"
                class="w-32 h-32 object-contain"
                alt="Realizador 1"
              />
              <img
                src="/images/realizators/realizator2.jpeg"
                class="w-32 h-32 object-contain"
                alt="Realizador 2"
              />
              <img
                src="/images/realizators/realizator3.jpeg"
                class="w-32 h-32 object-contain"
                alt="Realizador 3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORTERS */}
      <section
        id="supporters"
        class="grid grid-cols-1 md:grid-cols-5 text-gray-800 text-center p-6"
      >
        {/* Heading spans all columns */}
        <h1 class="text-[1.875rem] md:text-5xl col-span-full text-gray-800 my-2 font-bold">
          Apoio
        </h1>

        {/* Divider spans all columns */}
        <div class="col-span-full">
          <div class="h-1 mx-auto gradient w-64 rounded-t"></div>
        </div>

        {/* Card Container: 
          Spans all 4 columns to provide maximum room for the 4 sponsor images.
        */}
        <div class="col-start-1 md:col-start-2 md:col-span-3 px-4 pb-4">
          <div class="rounded-2xl bg-white border-2 border-purple-400 shadow-lg p-6">
            {/* Inner Grid: 2 columns on mobile, 4 columns on desktop */}
            <div class="grid grid-cols-2 md:grid-cols-3 gap-8 justify-items-center items-center">
              <img
                src="/images/supporters/supporter-1.jpeg"
                class="w-32 h-32 object-contain"
                alt="Apoiador 1"
              />
              <img
                src="/images//supporters/supporter-2.jpeg"
                class="w-32 h-32 object-contain"
                alt="Apoiador 2"
              />
              <img
                src="/images//supporters/supporter-3.jpeg"
                class="w-32 h-32 object-contain"
                alt="Apoiador 3"
              />
              <img
                src="/images//supporters/supporter-4.jpeg"
                class="w-32 h-32 object-contain"
                alt="Apoiador 4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SPONSORS DIAMOND */}
      <section
        id="sponsorsDiamond"
        class="grid grid-cols-1 md:grid-cols-5 text-gray-800 text-center p-6"
      >
        {/* Heading spans all columns */}
        <h1 class="text-[1.875rem] md:text-5xl col-span-full text-gray-800 my-2 font-bold">
          Patrocinadores Diamante
        </h1>

        {/* Divider spans all columns */}
        <div class="col-span-full">
          <div class="h-1 mx-auto gradient w-64 rounded-t"></div>
        </div>

        {/* Card Container: 
          Spans all 4 columns to provide maximum room for the 4 sponsor images.
        */}
        <div class="col-start-1 md:col-start-2 md:col-span-3 px-4 pb-4">
          <div class="rounded-2xl bg-white border-2 border-purple-400 shadow-lg p-6">
            {/* Inner Grid: 2 columns on mobile, 4 columns on desktop */}
            <div class="grid grid-cols-2 md:grid-cols-3 gap-8 justify-items-center items-center">
              <img
                src="/images/sponsors/sponsor-diamond-1.jpeg"
                class="w-32 h-32 object-contain"
                alt="Patrocinador Diamante 1"
              />
              <img
                src="/images/sponsors/sponsor-diamond-2.jpeg"
                class="w-32 h-32 object-contain"
                alt="Patrocinador Diamante 2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SPONSORS BRONZE */}
      <section
        id="sponsorsBronze"
        class="grid grid-cols-1 md:grid-cols-5 text-gray-800 text-center p-6"
      >
        {/* Heading spans all columns */}
        <h1 class="text-[1.875rem] md:text-5xl col-span-full text-gray-800 my-2 font-bold">
          Patrocinadores Bronze
        </h1>

        {/* Divider spans all columns */}
        <div class="col-span-full">
          <div class="h-1 mx-auto gradient w-64 rounded-t"></div>
        </div>

        {/* Card Container: 
          Spans all 4 columns to provide maximum room for the 4 sponsor images.
        */}
        <div class="col-start-1 md:col-start-2 md:col-span-3 px-4 pb-4">
          <div class="rounded-2xl bg-white border-2 border-purple-400 shadow-lg p-6">
            {/* Inner Grid: 2 columns on mobile, 4 columns on desktop */}
            <div class="grid grid-cols-2 md:grid-cols-3 gap-8 justify-items-center items-center">
              <img
                src="/images/sponsors/sponsor-bronze-1.jpeg"
                class="w-32 h-32 object-contain"
                alt="Patrocinador Bronze 1"
              />
              <img
                src="/images/sponsors/sponsor-bronze-2.jpeg"
                class="w-32 h-32 object-contain"
                alt="Patrocinador Bronze 2"
              />
              <img
                src="/images/sponsors/sponsor-bronze-3.jpeg"
                class="w-32 h-32 object-contain"
                alt="Patrocinador Bronze 3"
              />
              <img
                src="/images/sponsors/sponsor-bronze-4.png"
                class="w-32 h-32 object-contain"
                alt="Patrocinador Bronze 4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section id="CallToAction" class="gradient p-10 text-center text-white">
        <h1 class="w-full text-3xl md:text-5xl my-2 font-bold leading-tight text-center">
          Participe do evento
        </h1>
        <div class="h-1 mx-auto bg-white w-64 opacity-50 mt-0 mb-8 py-0 rounded-t"></div>
        <div class="mb-4 mt-12 text-lg md:text-2xl leading-tight">
          Cadastre-se na plataforma para submeter projetos
        </div>
        <button class="mt-2 mb-6 py-4 px-8 lg:mx-0 hover:underline bg-white text-purple-500 rounded-full shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out">
          <a
            href="https://app.talentsourcery.io/signup"
            target="_blank"
            rel="noreferrer"
          >
            Cadastrar
          </a>
        </button>
      </section>

      <Footer></Footer>
    </div>
  );
}

export default Intro;
