import { ArrowUpRight, Clock, Mail, MessageCircle, Phone } from 'lucide-react';
import { PageIntro } from '../components/PageIntro';
import { companyContact } from '../lib/contact';
import { usePageMeta } from '../hooks/usePageMeta';

export function Contact() {
  usePageMeta('Fale conosco', 'Entre em contato com a NUDEP por telefone, WhatsApp ou e-mail.', '/contato');
  return <main><PageIntro eyebrow="FALE CONOSCO" title={<>Estamos aqui<br /><span className="intro-title-accent">para conversar.</span></>} text="Entre em contato com a equipe NUDEP pelo canal de sua preferência." current="Contato" />
    <section className="section-pad"><div className="container"><div className="nudep-section-head"><span className="eyebrow">CANAIS DE ATENDIMENTO</span><h2>Conte com a gente.</h2></div><div className="nudep-register-grid">
      <article><span className="candidate-icon"><Phone size={25} /></span><h3>Telefone</h3><p>Fale com nossa equipe.</p><a className="text-link" href={`tel:${companyContact.phoneHref}`}>{companyContact.phoneDisplay} <ArrowUpRight size={16} /></a></article>
      <article><span className="candidate-icon"><Mail size={25} /></span><h3>E-mail</h3><p>Envie sua mensagem para a NUDEP.</p><a className="text-link" href={`mailto:${companyContact.email}`}>{companyContact.email} <ArrowUpRight size={16} /></a></article>
      <article><span className="candidate-icon"><MessageCircle size={25} /></span><h3>WhatsApp</h3><p>Converse com nosso atendimento.</p><a className="text-link" href={companyContact.whatsappHref} target="_blank" rel="noreferrer">Iniciar conversa <ArrowUpRight size={16} /></a></article>
    </div><div className="nudep-hours"><Clock size={20} /><div><strong>Horário de atendimento</strong><p>Segunda a sexta: 08h–12h e 13h–17h<br />Sábado: 08h–12h</p></div></div></div></section></main>;
}
