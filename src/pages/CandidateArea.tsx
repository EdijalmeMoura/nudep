import { ArrowUpRight, BriefcaseBusiness, FileText, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageIntro } from '../components/PageIntro';
import { usePageMeta } from '../hooks/usePageMeta';

export function CandidateArea() {
  usePageMeta('Área do candidato', 'Encontre oportunidades e cadastre seu currículo no banco de talentos NUDEP.', '/area-do-candidato');
  return <main>
    <PageIntro eyebrow="PARA ESTUDANTES E CANDIDATOS" title={<>Seu próximo passo<br /><span className="intro-title-accent">começa aqui.</span></>} text="Explore oportunidades, apresente seu perfil e dê o primeiro passo para desenvolver seu futuro profissional." current="Área do candidato" />
    <section className="section-pad"><div className="container candidate-area">
      <div className="candidate-area-heading"><span className="eyebrow">NUDEP / ÁREA DO CANDIDATO</span><h2>Oportunidades para quem quer crescer.</h2><p>Escolha por onde começar sua jornada. Estamos aqui para aproximar você de novas possibilidades.</p></div>
      <div className="candidate-area-grid">
        <article><span className="candidate-icon"><BriefcaseBusiness size={25} /></span><span className="small-index">01 / OPORTUNIDADES</span><h3>Encontre sua vaga</h3><p>Explore as oportunidades disponíveis e candidate-se às que combinam com seu perfil.</p><Link className="text-link" to="/vagas">Ver vagas <ArrowUpRight size={17} /></Link></article>
        <article><span className="candidate-icon"><FileText size={25} /></span><span className="small-index">02 / SEU CURRÍCULO</span><h3>Cadastre seu currículo</h3><p>Compartilhe seu perfil em nosso banco de talentos para futuras oportunidades.</p><Link className="text-link" to="/curriculo">Cadastrar currículo <ArrowUpRight size={17} /></Link></article>
        <article><span className="candidate-icon"><GraduationCap size={25} /></span><span className="small-index">03 / ESTUDANTES</span><h3>Conhecimento para crescer</h3><p>Confira conteúdos para apoiar sua jornada de desenvolvimento profissional.</p><Link className="text-link" to="/conteudos">Acessar conteúdos <ArrowUpRight size={17} /></Link></article>
      </div>
    </div></section>
  </main>;
}
