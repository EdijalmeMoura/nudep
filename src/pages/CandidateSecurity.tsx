import { useState, type FormEvent } from 'react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiPost } from '../lib/api';
import { PageIntro } from '../components/PageIntro';
import { usePageMeta } from '../hooks/usePageMeta';

type Mode = 'request-reset' | 'request-verify' | 'reset' | 'verify';
export function CandidateSecurity({ mode }: { mode: Mode }) {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const request = mode === 'request-reset' || mode === 'request-verify';
  const verify = mode === 'verify' || mode === 'request-verify';
  const title = verify ? 'Confirmação de e-mail' : 'Recuperação de senha';
  usePageMeta(title, 'Segurança da conta do candidato NUDEP.', undefined, true);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') || '');
    if (mode === 'reset' && (password.length < 14 || password.length > 256 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password))) { setError('Use de 14 a 256 caracteres com letras maiúsculas, minúsculas e números.'); return; }
    if (mode === 'reset' && password !== String(form.get('confirmation') || '')) { setError('As senhas não coincidem.'); return; }
    if (!request && !token) { setError('Link inválido. Solicite um novo link.'); return; }
    const endpoint = { 'request-reset': '/api/candidate/forgot-password', 'request-verify': '/api/candidate/request-verification', 'reset': '/api/candidate/reset-password', 'verify': '/api/candidate/verify-email' }[mode];
    const body = request ? { email: form.get('email') } : mode === 'reset' ? { token, password } : { token };
    setBusy(true);
    try { const result = await apiPost<{ message: string }>(endpoint, body); setMessage(result.message); if (!request) window.history.replaceState(null, '', window.location.pathname); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível concluir. Tente novamente.'); }
    finally { setBusy(false); }
  }
  return <main><PageIntro eyebrow="SEGURANÇA DA CONTA" title={title} text="Cuide do acesso à sua área do candidato." current={title} compact />
    <section className="section-pad"><div className="container candidate-security-wrap"><form className="form-card candidate-security-form" onSubmit={submit}>
      <ShieldCheck size={28} color="#0876b9" /><h2>{request ? (verify ? 'Receber novo link de confirmação' : 'Esqueceu sua senha?') : (verify ? 'Confirme seu e-mail' : 'Crie uma nova senha')}</h2>
      <p>{request ? 'Informe o e-mail utilizado no cadastro. Se houver uma conta elegível, enviaremos as instruções.' : verify ? 'Clique no botão abaixo para confirmar o endereço de e-mail da sua conta.' : 'Escolha uma senha com pelo menos 14 caracteres, letras maiúsculas, minúsculas e números.'}</p>
      {!message && <div className="form-grid">{request ? <label className="field-full"><span>E-mail *</span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label> : mode === 'reset' ? <><label className="field-full"><span>Nova senha *</span><input name="password" type="password" autoComplete="new-password" required minLength={14} maxLength={256} /></label><label className="field-full"><span>Confirme a senha *</span><input name="confirmation" type="password" autoComplete="new-password" required minLength={14} maxLength={256} /></label></> : null}</div>}
      {error && <div className="form-error" role="alert">{error}</div>}{message && <div className="form-success" role="status">{message}</div>}
      {!message && <button className="button button-primary" disabled={busy}>{busy ? 'Aguarde…' : request ? 'Enviar instruções' : verify ? 'Confirmar e-mail' : 'Salvar nova senha'} <ArrowUpRight size={16} /></button>}
      <p><Link to="/area-do-candidato" className="text-link">Voltar à área do candidato <ArrowUpRight size={16} /></Link></p>
      {!request && error && <p><Link to={verify ? '/reenviar-confirmacao' : '/recuperar-senha'} className="text-link">Solicitar outro link <ArrowUpRight size={16} /></Link></p>}
    </form></div></section></main>;
}
