import { useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, BriefcaseBusiness, FileText, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageIntro } from '../components/PageIntro';
import { apiGet, apiPost, formatDate } from '../lib/api';
import { usePageMeta } from '../hooks/usePageMeta';

type CandidateSession = { authenticated: boolean; user?: { email: string; name: string }; csrf?: string };
type CandidateApplication = { id: string; title: string; slug: string; status: string; created_at: string };

export function CandidateArea() {
  const [session, setSession] = useState<CandidateSession | null>(null);
  const [items, setItems] = useState<CandidateApplication[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  usePageMeta('Área do candidato', 'Entre para acompanhar candidaturas ou descubra oportunidades de estágio.', '/area-do-candidato', true);
  useEffect(() => { apiGet<CandidateSession>('/api/candidate/session').then(setSession).catch(() => { setError('Não foi possível verificar sua sessão. Atualize a página.'); setSession({ authenticated: false }); }); }, []);
  useEffect(() => { if (session?.authenticated) apiGet<{items: CandidateApplication[]}>('/api/candidate/applications').then(data => setItems(data.items)).catch(() => setError('Não foi possível carregar suas candidaturas.')); }, [session]);
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
    try { const response = await fetch('/api/candidate/logout', { method: 'POST', credentials: 'same-origin', headers: { 'X-Candidate-CSRF': session.csrf } }); if (!response.ok) throw new Error('Não foi possível sair. Tente novamente.'); setItems([]); setSession({ authenticated: false }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível sair.'); }
    finally { setLoading(false); }
  }
  return <main><PageIntro eyebrow="ÁREA DO CANDIDATO" title={<>Seu próximo passo<br /><span className="intro-title-accent">começa aqui.</span></>} text="Entre para acompanhar suas candidaturas ou encontre novas oportunidades de estágio." current="Área do candidato" />
    <section className="section-pad"><div className="container candidate-area">
      {!session ? <p>Carregando área do candidato…</p> : session.authenticated ? <><div className="candidate-area-heading"><span className="eyebrow">MINHA CONTA</span><h2>Olá, {session.user?.name}!</h2><p>Você está conectado com {session.user?.email}. Aqui aparecem as candidaturas enviadas enquanto você estava conectado.</p><button className="button button-outline" type="button" onClick={logout} disabled={loading}><LogOut size={16} /> Sair da conta</button></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="candidate-dashboard"><div className="candidate-dashboard-heading"><h2>Minhas candidaturas</h2><Link className="text-link" to="/vagas">Encontrar vagas <ArrowUpRight size={16} /></Link></div>{items.length ? items.map(item => <article className="candidate-application" key={item.id}><div><strong>{item.title}</strong><p>Enviada em {formatDate(item.created_at)}</p></div><span className="admin-status-pill">{item.status}</span><Link className="text-link" to={`/vagas/${item.slug}`}>Ver vaga <ArrowUpRight size={16} /></Link></article>) : <p>Você ainda não enviou candidaturas conectado nesta conta. Explore as vagas e candidate-se.</p>}</div></> : <div className="candidate-login-grid"><div><div className="candidate-area-heading"><span className="eyebrow">BEM-VINDO À NUDEP</span><h2>Acompanhe sua jornada.</h2><p>Entre na sua conta para acompanhar as candidaturas enviadas enquanto estiver conectado. Se ainda não tem conta, faça seu cadastro.</p></div><Link className="button button-primary" to="/curriculo">Criar conta e cadastrar currículo <ArrowUpRight size={16} /></Link><p><Link className="text-link" to="/vagas">Ver vagas disponíveis <ArrowUpRight size={16} /></Link></p></div><form className="form-card candidate-login" onSubmit={login}><h2>Entrar na minha conta</h2><p>Use o e-mail e a senha cadastrados.</p><div className="form-grid"><label className="field-full"><span>E-mail *</span><input name="email" type="email" autoComplete="email" required /></label><label className="field-full"><span>Senha *</span><input name="password" type="password" autoComplete="current-password" required maxLength={256} /></label></div>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary" type="submit" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'} <ArrowUpRight size={16} /></button><p>Esqueceu sua senha? <Link to="/contato" className="text-link">Entre em contato com a NUDEP.</Link></p></form></div>}
      <div className="candidate-shortcuts"><Link to="/vagas"><BriefcaseBusiness size={20} /> Explorar oportunidades <ArrowUpRight size={16} /></Link><Link to="/conteudos"><FileText size={20} /> Conteúdos para crescer <ArrowUpRight size={16} /></Link></div>
    </div></section></main>;
}
