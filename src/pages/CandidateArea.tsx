import { useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, BriefcaseBusiness, FileText, LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageIntro } from '../components/PageIntro';
import { apiGet, apiPost, formatDate } from '../lib/api';
import { usePageMeta } from '../hooks/usePageMeta';

type CandidateSession = { authenticated: boolean; user?: { email: string; name: string }; csrf?: string };
type CandidateApplication = { id: string; title: string; slug: string; status: string; created_at: string };
type CandidateProfile = { full_name: string; email: string; phone: string; city: string; state: string; area: string; linkedin: string; has_resume: boolean; updated_at: string };
type CandidateSection = 'candidaturas' | 'perfil';

export function CandidateArea() {
  const [session, setSession] = useState<CandidateSession | null>(null);
  const [items, setItems] = useState<CandidateApplication[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [section, setSection] = useState<CandidateSection>('candidaturas');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
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
  function chooseSection(next: CandidateSection) { setSection(next); setError(''); setFeedback(''); }
  return <main><PageIntro eyebrow="ÁREA DO CANDIDATO" title={<>Seu próximo passo<br /><span className="intro-title-accent">começa aqui.</span></>} text="Entre para acompanhar suas candidaturas ou encontre novas oportunidades de estágio." current="Área do candidato" />
    <section className="section-pad"><div className="container candidate-area">
      {!session ? <p>Carregando área do candidato…</p> : session.authenticated ? <>
        <div className="candidate-area-heading"><span className="eyebrow">MINHA CONTA</span><h2>Olá, {session.user?.name}!</h2><p>Você está conectado com {session.user?.email}.</p></div>
        <div className="candidate-account-layout"><nav className="candidate-account-menu" aria-label="Menu da área do candidato"><button type="button" className={section === 'candidaturas' ? 'is-active' : ''} onClick={() => chooseSection('candidaturas')} aria-current={section === 'candidaturas' ? 'page' : undefined}><LayoutDashboard size={18} /> Minhas candidaturas</button><button type="button" className={section === 'perfil' ? 'is-active' : ''} onClick={() => chooseSection('perfil')} aria-current={section === 'perfil' ? 'page' : undefined}><UserRound size={18} /> Meu perfil e currículo</button><Link to="/vagas"><BriefcaseBusiness size={18} /> Buscar vagas</Link><button type="button" onClick={logout} disabled={loading}><LogOut size={18} /> Sair da conta</button></nav>
        <div className="candidate-account-content">{error && <div className="form-error" role="alert">{error}</div>}{feedback && <div className="form-success" role="status">{feedback}</div>}
          {section === 'candidaturas' ? <div className="candidate-dashboard"><div className="candidate-dashboard-heading"><div><span className="eyebrow">ACOMPANHAMENTO</span><h2>Minhas candidaturas</h2></div><Link className="text-link" to="/vagas">Encontrar vagas <ArrowUpRight size={16} /></Link></div><p>Aqui aparecem as candidaturas enviadas enquanto você estava conectado.</p>{items.length ? items.map(item => <article className="candidate-application" key={item.id}><div><strong>{item.title}</strong><p>Enviada em {formatDate(item.created_at)}</p></div><span className="admin-status-pill">{item.status}</span><Link className="text-link" to={`/vagas/${item.slug}`}>Ver vaga <ArrowUpRight size={16} /></Link></article>) : <p>Você ainda não enviou candidaturas conectado nesta conta. Explore as vagas e candidate-se.</p>}</div> : profile ? <form className="form-card candidate-profile-form" key={profile.updated_at} onSubmit={saveProfile}>
            <span className="eyebrow">MEU CADASTRO</span><h2>Meu perfil e currículo</h2><p>Atualize seus dados para futuras oportunidades. Alterações não modificam candidaturas já enviadas.</p><div className="form-grid">
            <label className="field-full"><span>Nome completo *</span><input name="full_name" defaultValue={profile.full_name} required maxLength={160} autoComplete="name" /></label>
            <label className="field-full"><span>E-mail de acesso</span><input value={profile.email} readOnly type="email" /><small>O e-mail de acesso não pode ser alterado por aqui. Para solicitar alterações, fale com a NUDEP.</small></label>
            <label><span>Telefone *</span><input name="phone" type="tel" defaultValue={profile.phone} required maxLength={24} autoComplete="tel" /></label><label><span>Cidade *</span><input name="city" defaultValue={profile.city} required maxLength={100} autoComplete="address-level2" /></label><label><span>Estado (UF) *</span><input name="state" defaultValue={profile.state} required minLength={2} maxLength={2} pattern="[A-Za-z]{2}" autoComplete="address-level1" /></label><label><span>Área de interesse *</span><input name="area" defaultValue={profile.area} required maxLength={100} /></label><label className="field-full"><span>LinkedIn <small>Opcional</small></span><input name="linkedin" type="url" defaultValue={profile.linkedin} maxLength={500} placeholder="https://www.linkedin.com/in/..." /></label>
            <label className="field-full candidate-resume-field"><span>Substituir currículo <small>Opcional</small></span><input name="resume" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /><small>PDF ou DOCX de até 5 MB. Se não escolher um arquivo, manteremos o atual.</small></label></div>
            {profile.has_resume && <a className="text-link candidate-resume-link" href="/api/candidate/profile/resume">Baixar currículo atual <ArrowUpRight size={16} /></a>}<div><button className="button button-primary" disabled={loading} type="submit">{loading ? 'Salvando…' : 'Salvar alterações'} <ArrowUpRight size={16} /></button></div>
          </form> : <p>Carregando seu perfil…</p>}
        </div></div></> : <div className="candidate-login-grid"><div><div className="candidate-area-heading"><span className="eyebrow">BEM-VINDO À NUDEP</span><h2>Acompanhe sua jornada.</h2><p>Entre na sua conta para acompanhar as candidaturas enviadas enquanto estiver conectado. Se ainda não tem conta, faça seu cadastro.</p></div><Link className="button button-primary" to="/curriculo">Criar conta e cadastrar currículo <ArrowUpRight size={16} /></Link><p><Link className="text-link" to="/vagas">Ver vagas disponíveis <ArrowUpRight size={16} /></Link></p></div><form className="form-card candidate-login" onSubmit={login}><h2>Entrar na minha conta</h2><p>Use o e-mail e a senha cadastrados.</p><div className="form-grid"><label className="field-full"><span>E-mail *</span><input name="email" type="email" autoComplete="email" required /></label><label className="field-full"><span>Senha *</span><input name="password" type="password" autoComplete="current-password" required maxLength={256} /></label></div>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary" type="submit" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'} <ArrowUpRight size={16} /></button><p>Esqueceu sua senha? <Link to="/contato" className="text-link">Entre em contato com a NUDEP.</Link></p></form></div>}
      <div className="candidate-shortcuts"><Link to="/vagas"><BriefcaseBusiness size={20} /> Explorar oportunidades <ArrowUpRight size={16} /></Link><Link to="/conteudos"><FileText size={20} /> Conteúdos para crescer <ArrowUpRight size={16} /></Link></div>
    </div></section></main>;
}
