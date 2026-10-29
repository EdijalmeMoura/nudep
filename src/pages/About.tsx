import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageIntro } from '../components/PageIntro';
import { usePageMeta } from '../hooks/usePageMeta';

export function About() {
  usePageMeta('Sobre a NUDEP', 'Conheça a missão, a visão e os valores da NUDEP, Núcleo de Desenvolvimento Profissional.', '/sobre');
  return <main><PageIntro eyebrow="SOBRE A NUDEP" title={<>Desenvolver pessoas.<br /><span className="intro-title-accent">Transformar futuros.</span></>} text="Núcleo de Desenvolvimento Profissional: conectando estudantes, empresas e instituições de ensino." current="Sobre a NUDEP" />
    <section className="section-pad"><div className="container"><div className="nudep-section-head"><span className="eyebrow">NOSSA ESSÊNCIA</span><h2>Missão, visão e valores.</h2><p>O que nos orienta no trabalho diário para facilitar a vida de nossos clientes e contribuir com o desenvolvimento de equipes e jovens.</p></div><div className="nudep-register-grid">
      <article><span className="small-index">01 / MISSÃO</span><h3>Abrir caminhos</h3><p>Facilitar a interação dos jovens estudantes com o mercado de estágio, para que desenvolvam competências e se tornem profissionais capazes de contribuir para o desenvolvimento sustentável da sociedade.</p></article>
      <article><span className="small-index">02 / VISÃO</span><h3>Alcançar mais estudantes</h3><p>Alcançar cada vez mais alunos e, assim, contribuir para a educação no país.</p></article>
      <article><span className="small-index">03 / VALORES</span><h3>Agir com responsabilidade</h3><p>Ética, excelência profissional em conformidade com a legislação, transparência, facilidade na comunicação e responsabilidade socioambiental.</p></article>
    </div><p style={{marginTop: '32px'}}><Link to="/contato" className="button button-primary">Fale conosco <ArrowUpRight size={16} /></Link></p></div></section></main>;
}
