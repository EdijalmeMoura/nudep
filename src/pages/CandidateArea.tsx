import { useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, BriefcaseBusiness, FileText, LayoutDashboard, LogOut, UserRound, ShieldCheck, Camera, Trash2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { AcademicFields, type AcademicInfo } from '../components/AcademicFields';
import { PageIntro } from '../components/PageIntro';
import { apiGet, apiPost, formatDate } from '../lib/api';
import { usePageMeta } from '../hooks/usePageMeta';

type CandidateSession = { authenticated: boolean; user?: { email: string; name: string }; csrf?: string };
type CandidateApplication = { id: string; title: string; slug: string; status: string; created_at: string; updated_at: string; job_available: number };
type CandidateProfile = AcademicInfo & { full_name: string; email: string; phone: string; city: string; state: string; area: string; linkedin: string; has_resume: boolean; has_photo: boolean; updated_at: string };
type CandidateSection = 'candidaturas' | 'perfil' | 'privacidade';

export function CandidateArea() {
  const [session, setSession] = useState<CandidateSession | null>(null);
  const [items, setItems] = useState<CandidateApplication[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [searchParams] = useSearchParams();
  const [section, setSection] = useState<CandidateSection>(() => searchParams.get('secao') === 'perfil' ? 'perfil' : 'candidaturas');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [privacyReference, setPrivacyReference] = useState('');
  const [loading, setLoading] = useState(false);
  usePageMeta('Área do candidato', 'Entre para acompanhar candidaturas ou descubra oportunidades de estágio.', '/area-do-candidato', true);
  useEffect(() => { apiGet<CandidateSession>('/api/candidate/session').then(setSession).catch(() => { setError('Não foi possível verificar sua sessão. Atualize a página.'); setSession({ authenticated: false }); }); }, []);
  useEffect(() => {
    if (!session?.authenticated) return;
    let cancelled = false;
    Promise.all([apiGet<{items: CandidateApplication[]}>('/api/candidate/applications'), apiGet<{profile: CandidateProfile}>('/api/candidate/profile')])
      .then(([applications, candidate]) => { if (!cancelled) { setItems(applications.items); setProfile(candidate.profile); } })
      .catch(() => { if (!cancelled) setError('Não foi possível carregar seus dados. Atualize a página ou entre novamente.'); });
    return () => { cancelled = true; };
  }, [session?.authenticated]);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true);
    const form = new FormData(event.currentTarget);
    try { setSession(await apiPost<CandidateSession>('/api/candidate/login', { email: form.get('email'), password: form.get('password') })); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível entrar.'); }
    finally { setLoading(false); }
  }
  async function logout() {
    if (!session?.csrf) return;
    setError(''); setLoading(true);
    try { const response = await fetch('/api/candidate/logout', { method: 'POST', credentials: 'same-origin', headers: { 'X-Candidate-CSRF': session.csrf } }); if (!response.ok) throw new Error('Não foi possível sair. Tente novamente.'); setItems([]); setProfile(null); setSession({ authenticated: false }); setSection('candidaturas'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível sair.'); }
    finally { setLoading(false); }
  }
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!session?.csrf) return;
    setError(''); setFeedback('');
    const form = new FormData(event.currentTarget);
    const resume = form.get('resume');
    if (resume instanceof File && resume.size === 0) form.delete('resume');
    else if (resume instanceof File && (resume.size > 5 * 1024 * 1024 || !['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(resume.type))) { setError('Envie um currículo PDF ou DOCX de até 5 MB.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/candidate/profile', { method: 'PUT', credentials: 'same-origin', headers: { 'X-Candidate-CSRF': session.csrf }, body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar seu perfil.');
      setProfile(data.profile); setSession(previous => previous?.user ? { ...previous, user: { ...previous.user, name: data.profile.full_name } } : previous);
      setFeedback('Seus dados foram atualizados com sucesso.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível atualizar seu perfil.'); }
    finally { setLoading(false); }
  }
  async function updatePhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!session?.csrf) return;
    const formElement = event.currentTarget; const form = new FormData(formElement); const photo = form.get('photo');
    setError(''); setFeedback('');
    if (!(photo instanceof File) || !photo.size || photo.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(photo.type)) { setError('Selecione uma foto JPG, PNG ou WebP de até 5 MB.'); return; }
    setLoading(true);
    try { const response = await fetch('/api/candidate/profile/photo', { method: 'PUT', credentials: 'same-origin', headers: { 'X-Candidate-CSRF': session.csrf }, body: form }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar a foto.'); setProfile(data.profile); formElement.reset(); setFeedback('Foto atualizada com sucesso.'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível atualizar a foto.'); }
    finally { setLoading(false); }
  }
  async function removePhoto() {
    if (!session?.csrf || !window.confirm('Deseja remover sua foto do perfil?')) return;
    setError(''); setFeedback(''); setLoading(true);
    try { const response = await fetch('/api/candidate/profile/photo', { method: 'DELETE', credentials: 'same-origin', headers: { 'X-Candidate-CSRF': session.csrf } }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Não foi possível remover a foto.'); setProfile(data.profile); setFeedback('Foto removida do perfil.'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível remover a foto.'); }
    finally { setLoading(false); }
  }
  async function requestDeletion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!session?.csrf) return;
    const form = new FormData(event.currentTarget); if (!form.get('confirmed')) { setError('Confirme que deseja enviar a solicitação.'); return; }
    setError(''); setFeedback(''); setLoading(true);
    try { const response = await fetch('/api/candidate/privacy-request', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Candidate-CSRF': session.csrf }, body: JSON.stringify({ confirmed: true, details: form.get('details') }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Não foi possível enviar a solicitação.'); setPrivacyReference(data.reference); setFeedback(data.message); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível enviar a solicitação.'); }
    finally { setLoading(false); }
  }
  function chooseSection(next: CandidateSection) { setSection(next); setError(''); setFeedback(''); }
  return <main><PageIntro eyebrow="ÁREA DO CANDIDATO" title={<>Seu próximo passo<br /><span className="intro-title-accent">começa aqui.</span></>} text="Entre para acompanhar suas candidaturas ou encontre novas oportunidades de estágio." current="Área do candidato" />
    <section className="section-pad"><div className="container candidate-area">
      {!session ? <p>Carregando área do candidato…</p> : session.authenticated ? <>
        <div className="candidate-area-heading"><span className="eyebrow">MINHA CONTA</span><h2>Olá, {session.user?.name}!</h2><p>Você está conectado com {session.user?.email}.</p></div>
        <div className="candidate-account-layout"><nav className="candidate-account-menu" aria-label="Menu da área do candidato"><button type="button" className={section === 'candidaturas' ? 'is-active' : ''} onClick={() => chooseSection('candidaturas')} aria-current={section === 'candidaturas' ? 'page' : undefined}><LayoutDashboard size={18} /> Minhas candidaturas</button><button type="button" className={section === 'perfil' ? 'is-active' : ''} onClick={() => chooseSection('perfil')} aria-current={section === 'perfil' ? 'page' : undefined}><UserRound size={18} /> Meu perfil e currículo</button><Link to="/vagas"><BriefcaseBusiness size={18} /> Buscar vagas</Link><button type="button" className={section === 'privacidade' ? 'is-active' : ''} onClick={() => chooseSection('privacidade')} aria-current={section === 'privacidade' ? 'page' : undefined}><ShieldCheck size={18} /> Privacidade</button><button type="button" onClick={logout} disabled={loading}><LogOut size={18} /> Sair da conta</button></nav>
        <div className="candidate-account-content">{error && <div className="form-error" role="alert">{error}</div>}{feedback && <div className="form-success" role="status">{feedback}</div>}
          {section === 'candidaturas' ? <div className="candidate-dashboard"><div className="candidate-dashboard-heading"><div><span className="eyebrow">ACOMPANHAMENTO</span><h2>Minhas candidaturas</h2></div><Link className="text-link" to="/vagas">Encontrar vagas <ArrowUpRight size={16} /></Link></div><p>Aqui aparecem somente candidaturas enviadas enquanto você estava conectado. O status é atualizado pela equipe responsável.</p>{items.length ? items.map(item => <article className="candidate-application-card" key={item.id}><div className="candidate-application-heading"><div><strong>{item.title}</strong><p>Enviada em {formatDate(item.created_at)} · Última atualização do registro em {formatDate(item.updated_at)}</p></div><span className="candidate-current-status">{item.status}</span></div><p className="candidate-status-help">{({ 'Candidatura recebida': 'Sua inscrição foi registrada.', 'Em análise': 'A equipe está analisando a candidatura.', 'Em processo seletivo': 'Sua candidatura está em processo seletivo.', 'Encerrada': 'Este processo foi encerrado. Entre em contato com a equipe se precisar de informações.' } as Record<string, string>)[item.status] || 'Consulte a equipe para mais informações.'}</p>{item.job_available ? <Link className="text-link" to={`/vagas/${item.slug}`}>Ver vaga <ArrowUpRight size={16} /></Link> : <span className="candidate-unavailable">Vaga indisponível para consulta</span>}</article>) : <p>Você ainda não enviou candidaturas conectado nesta conta. Explore as vagas e candidate-se.</p>}</div> : section === 'privacidade' ? <div className="form-card candidate-privacy-form"><ShieldCheck size={26} /><span className="eyebrow">SEUS DADOS</span><h2>Privacidade e exclusão</h2><p>Você pode solicitar a exclusão da sua conta e dos dados associados. A solicitação será analisada pela equipe, considerando eventuais obrigações legais; <strong>o envio não exclui seus dados automaticamente</strong>.</p>{privacyReference ? <div className="application-reference"><span>Protocolo da solicitação</span><strong>{privacyReference}</strong></div> : <form onSubmit={requestDeletion}><label className="privacy-detail-label"><span>Detalhes <small>Opcional</small></span><textarea name="details" rows={4} maxLength={1600} placeholder="Conte algo que ajude nossa equipe a atender sua solicitação." /></label><label className="privacy-ack"><input name="confirmed" type="checkbox" required /><span>Quero solicitar a análise da exclusão da minha conta e dos meus dados.</span></label><button className="button button-primary" type="submit" disabled={loading}>{loading ? 'Enviando…' : 'Solicitar exclusão'} <ArrowUpRight size={16} /></button></form>}<p><Link to="/privacidade" className="text-link">Consultar aviso de privacidade <ArrowUpRight size={16} /></Link></p></div> : profile ? <><form className="form-card candidate-profile-form" key={profile.updated_at} onSubmit={saveProfile}>
            <span className="eyebrow">MEU CADASTRO</span><h2>Meu perfil e currículo</h2><p>Atualize seus dados para futuras oportunidades. Alterações não modificam candidaturas já enviadas.</p><div className="form-grid">
            <label className="field-full"><span>Nome completo *</span><input name="full_name" defaultValue={profile.full_name} required maxLength={160} autoComplete="name" /></label>
            <label className="field-full"><span>E-mail de acesso</span><input value={profile.email} readOnly type="email" /><small>O e-mail de acesso não pode ser alterado por aqui. Para solicitar alterações, fale com a NUDEP.</small></label>
            <label><span>Telefone *</span><input name="phone" type="tel" defaultValue={profile.phone} required maxLength={24} autoComplete="tel" /></label><label><span>Cidade *</span><input name="city" defaultValue={profile.city} required maxLength={100} autoComplete="address-level2" /></label><label><span>Estado (UF) *</span><input name="state" defaultValue={profile.state} required minLength={2} maxLength={2} pattern="[A-Za-z]{2}" autoComplete="address-level1" /></label><label><span>Área de interesse *</span><input name="area" defaultValue={profile.area} required maxLength={100} /></label><label className="field-full"><span>LinkedIn <small>Opcional</small></span><input name="linkedin" type="url" defaultValue={profile.linkedin} maxLength={500} placeholder="https://www.linkedin.com/in/..." /></label>
            <label className="field-full candidate-resume-field"><span>Substituir currículo <small>Opcional</small></span><input name="resume" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /><small>PDF ou DOCX de até 5 MB. Se não escolher um arquivo, manteremos o atual.</small></label></div>
            <div className="candidate-academic-heading"><h3>Formação acadêmica</h3><p>Informe ou atualize seus dados de estudante. Todos os campos são opcionais.</p></div><AcademicFields values={profile} />
            {profile.has_resume && <a className="text-link candidate-resume-link" href="/api/candidate/profile/resume">Baixar currículo atual <ArrowUpRight size={16} /></a>}<div><button className="button button-primary" disabled={loading} type="submit">{loading ? 'Salvando…' : 'Salvar alterações'} <ArrowUpRight size={16} /></button></div>
          </form><div className="form-card candidate-photo-editor"><div className="candidate-photo-current">{profile.has_photo ? <img src={`/api/candidate/profile/photo?v=${encodeURIComponent(profile.updated_at)}`} alt="Sua foto de perfil" /> : <span aria-hidden="true"><UserRound size={30} /></span>}<div><h3>Minha foto</h3><p>Visível somente para a equipe autorizada. A foto é opcional.</p></div></div><form onSubmit={updatePhoto}><label><span>Escolher nova foto</span><input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required /><small>JPG, PNG ou WebP de até 5 MB.</small></label><div className="candidate-photo-actions"><button className="button button-primary" disabled={loading}><Camera size={16} /> Salvar foto</button>{profile.has_photo && <button type="button" className="button button-outline" onClick={removePhoto} disabled={loading}><Trash2 size={16} /> Remover foto</button>}</div></form></div></> : <p>Carregando seu perfil…</p>}
        </div></div></> : <div className="candidate-login-grid"><div><div className="candidate-area-heading"><span className="eyebrow">BEM-VINDO À NUDEP</span><h2>Acompanhe sua jornada.</h2><p>Entre na sua conta para acompanhar as candidaturas enviadas enquanto estiver conectado. Se ainda não tem conta, faça seu cadastro.</p></div><Link className="button button-primary" to="/curriculo">Criar conta e cadastrar currículo <ArrowUpRight size={16} /></Link><p><Link className="text-link" to="/vagas">Ver vagas disponíveis <ArrowUpRight size={16} /></Link></p></div><form className="form-card candidate-login" onSubmit={login}><h2>Entrar na minha conta</h2><p>Use o e-mail e a senha cadastrados.</p><div className="form-grid"><label className="field-full"><span>E-mail *</span><input name="email" type="email" autoComplete="email" required /></label><label className="field-full"><span>Senha *</span><input name="password" type="password" autoComplete="current-password" required maxLength={256} /></label></div>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary" type="submit" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'} <ArrowUpRight size={16} /></button><p><Link to="/recuperar-senha" className="text-link">Esqueci minha senha</Link> · <Link to="/reenviar-confirmacao" className="text-link">Reenviar confirmação de e-mail</Link></p></form></div>}
      <div className="candidate-shortcuts"><Link to="/vagas"><BriefcaseBusiness size={20} /> Explorar oportunidades <ArrowUpRight size={16} /></Link><Link to="/conteudos"><FileText size={20} /> Conteúdos para crescer <ArrowUpRight size={16} /></Link></div>
    </div></section></main>;
}
