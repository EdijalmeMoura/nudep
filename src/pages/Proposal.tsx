import { useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Check, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageIntro } from '../components/PageIntro';
import { companyContact } from '../lib/contact';
import { apiPost } from '../lib/api';
import { usePageMeta } from '../hooks/usePageMeta';

export function Proposal() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ reference: string; message: string } | null>(null);
  usePageMeta('Solicitar proposta', 'Conte à NUDEP o que sua empresa precisa para abrir oportunidades de estágio.', '/solicitar-proposta');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    setBusy(true);
    try { setResult(await apiPost('/api/leads', body)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível enviar sua solicitação.'); }
    finally { setBusy(false); }
  }
  return <main><PageIntro eyebrow="PARA EMPRESAS / SOLICITAR PROPOSTA" title={<>Talentos para hoje.<br /><span className="intro-title-accent">Futuro para sua empresa.</span></>} text="Conte sobre sua necessidade de estágio. Nossa equipe entrará em contato para entender seu desafio e apresentar uma proposta." current="Solicitar proposta" />
    <section className="contact-page section-pad"><div className="container contact-layout"><div className="contact-form-col">
      {result ? <div className="application-success"><span className="success-check"><Check size={25} /></span><span className="eyebrow">SOLICITAÇÃO REGISTRADA</span><h2>Obrigado por conversar com a NUDEP.</h2><p>Sua solicitação foi registrada. Nossa equipe poderá entrar em contato pelos dados informados.</p><div className="application-reference"><span>Protocolo</span><strong>{result.reference}</strong></div><Link to="/" className="button button-primary">Voltar ao início <ArrowRight size={16} /></Link></div> : <form className="lead-form form-card" onSubmit={submit}>
        <div className="form-section-title"><span className="form-number">01</span><div><h2>Conte sobre sua empresa</h2><p>Preencha os dados abaixo para que possamos conhecer sua necessidade. Campos com * são obrigatórios.</p></div></div>
        <div className="form-grid">
          <label><span>Seu nome <i>*</i></span><input name="contact_name" autoComplete="name" maxLength={160} required placeholder="Nome completo" /></label>
          <label><span>Cargo</span><input name="contact_role" maxLength={120} placeholder="Seu cargo" /></label>
          <label><span>Empresa <i>*</i></span><input name="company" autoComplete="organization" maxLength={180} required placeholder="Nome da empresa" /></label>
          <label><span>E-mail <i>*</i></span><input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="voce@empresa.com.br" /></label>
          <label><span>Telefone <i>*</i></span><input name="phone" type="tel" autoComplete="tel" maxLength={24} required placeholder="(81) 99999-9999" /></label>
          <label><span>Segmento</span><input name="segment" maxLength={120} placeholder="Ex.: comércio, serviços" /></label>
          <label><span>Cidade <i>*</i></span><input name="city" autoComplete="address-level2" maxLength={100} required placeholder="Sua cidade" /></label>
          <label><span>Estado (UF) <i>*</i></span><input name="state" autoComplete="address-level1" minLength={2} maxLength={2} required placeholder="PE" /></label>
          <label className="field-full"><span>Como podemos ajudar? <i>*</i></span><select name="service" required defaultValue=""><option value="">Selecione uma opção</option><option>Divulgação de vagas de estágio</option><option>Seleção de estagiários</option><option>Parceria para estágio</option><option>Outro / ainda não sei</option></select></label>
          <label><span>Quantidade de vagas</span><select name="position_count" defaultValue=""><option value="">Selecione</option><option>1 vaga</option><option>2 a 5 vagas</option><option>6 a 10 vagas</option><option>Mais de 10 vagas</option><option>A definir</option></select></label>
          <label><span>Prazo desejado</span><select name="desired_timeline" defaultValue=""><option value="">Selecione</option><option>O mais breve possível</option><option>Até 30 dias</option><option>De 1 a 3 meses</option><option>A definir</option></select></label>
          <label className="field-full"><span>Conte sobre sua necessidade <i>*</i></span><textarea name="need" rows={5} minLength={15} maxLength={3000} required placeholder="Fale um pouco sobre as vagas, áreas de atuação e o que sua empresa precisa." /></label>
        </div><div className="honeypot" aria-hidden="true"><label>Não preencher<input name="website" tabIndex={-1} autoComplete="off" /></label></div><div className="lead-form-privacy"><ShieldCheck size={16} /><span>Usaremos seus dados para responder à solicitação. Conheça nosso <Link to="/privacidade" target="_blank">aviso de privacidade</Link>.</span></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="form-submit-row"><button className="button button-primary" disabled={busy}>{busy ? 'Enviando…' : 'Solicitar proposta'} <ArrowUpRight size={17} /></button></div>
      </form>}</div><aside className="contact-aside"><span className="eyebrow eyebrow-light">PARCERIA COM A NUDEP</span><h2>O primeiro passo é uma conversa.</h2><p>Cada empresa tem necessidades diferentes. Compartilhe seu desafio para construirmos os próximos passos juntos.</p><div className="contact-aside-rule" /><a className="contact-detail contact-detail-link" href={companyContact.whatsappHref} target="_blank" rel="noreferrer"><span className="contact-detail-icon"><MessageCircle size={18} /></span><div><strong>WhatsApp</strong><small>{companyContact.phoneDisplay}</small></div></a><a className="contact-detail contact-detail-link" href={`mailto:${companyContact.email}`}><span className="contact-detail-icon"><Mail size={18} /></span><div><strong>E-mail</strong><small>{companyContact.email}</small></div></a><div className="contact-response-note">Segunda a sexta: 08h–12h e 13h–17h<br />Sábado: 08h–12h</div></aside></div></section></main>;
}
