import { useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, FileText, LockKeyhole, ShieldCheck, UploadCloud, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiForm } from '../lib/api';
import { PageIntro } from '../components/PageIntro';
import { usePageMeta } from '../hooks/usePageMeta';

export function TalentBank() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<{ reference: string; message: string } | null>(null);
  usePageMeta('Banco de Talentos', 'Apresente seu perfil profissional à NUDEP para futuras oportunidades, com consentimento e controle sobre seus dados.', '/banco-de-talentos');
  function chooseFile(next: File | null) {
    setError('');
    if (next && (!['pdf', 'docx'].includes(next.name.toLowerCase().split('.').pop() || '') || next.size > 5 * 1024 * 1024)) { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; setError('Envie um currículo PDF ou DOCX de até 5 MB.'); return; }
    if (next?.type && !['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(next.type)) { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; setError('O formato do arquivo não é compatível. Use PDF ou DOCX.'); return; }
    setFile(next);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const element = event.currentTarget;
    const form = new FormData(element);
    const value = (name: string) => String(form.get(name) || '').trim();
    const errors: Record<string, string> = {};
    if (!value('full_name')) errors.full_name = 'Informe seu nome completo.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email'))) errors.email = 'Informe um e-mail válido.';
    if (!/^[+()\d\s.-]{8,24}$/.test(value('phone'))) errors.phone = 'Informe um telefone válido com DDD.';
    if (!value('city')) errors.city = 'Informe sua cidade.';
    if (!/^[a-zA-Z]{2}$/.test(value('state'))) errors.state = 'Informe a sigla do estado com duas letras, por exemplo PE.';
    if (!value('area')) errors.area = 'Informe sua área de interesse.';
    const password = String(form.get('password') || '');
    if (password.length < 14 || password.length > 256 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) errors.password = 'Use pelo menos 14 caracteres, com letras maiúsculas, minúsculas e números.';
    if (password !== String(form.get('password_confirmation') || '')) errors.password_confirmation = 'As senhas não coincidem.';
    const linkedin = value('linkedin');
    if (linkedin) {
      try { const url = new URL(linkedin); if (url.protocol !== 'https:' || !(url.hostname === 'linkedin.com' || url.hostname.endsWith('.linkedin.com')) || url.username || url.password) errors.linkedin = 'Informe um endereço HTTPS válido do LinkedIn.'; }
      catch { errors.linkedin = 'Informe um endereço HTTPS válido do LinkedIn.'; }
    }
    if (!file) errors.resume = 'Anexe seu currículo em PDF ou DOCX.';
    if (photo && (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type) || photo.size > 5 * 1024 * 1024)) errors.photo = 'Envie uma foto JPG, PNG ou WebP de até 5 MB.';
    if (!consent) errors.consent = 'Marque a autorização para cadastrar seu perfil.';
    setFieldErrors(errors);
    const first = Object.keys(errors)[0];
    if (first) {
      setError('Confira os campos destacados abaixo antes de enviar.');
      const field = element.querySelector<HTMLElement>(`[name="${first}"]`);
      field?.focus();
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    form.delete('password_confirmation'); form.set('resume', file!); form.set('consent', 'true'); setBusy(true);
    try { setSuccess(await apiForm('/api/talent', form)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível enviar seus dados.'); }
    finally { setBusy(false); }
  }
  return <main>
    <PageIntro eyebrow="Banco de Talentos" title={success ? 'Perfil recebido.' : <>Compartilhe seu talento.<br /><span className="intro-title-accent">No seu tempo.</span></>} text={success ? 'Obrigado por apresentar seu perfil à NUDEP.' : 'Cadastre seu perfil para que a equipe da NUDEP possa considerá-lo em futuras oportunidades alinhadas à sua experiência.'} current="Banco de Talentos" />
    <section className="talent-page section-pad"><div className="container talent-layout">
      <div className="talent-form-column">
        {success ? <div className="application-success"><span className="success-check"><Check size={25} /></span><span className="eyebrow">CADASTRO RECEBIDO</span><h2>Seu perfil chegou até nós.</h2><p>{success.message}</p><div className="application-reference"><span>Protocolo</span><strong>{success.reference}</strong></div><p className="success-followup">Você pode solicitar a atualização ou exclusão dos dados a qualquer momento pelo canal de privacidade.</p><Link className="button button-dark" to="/area-do-candidato">Acompanhar candidaturas <ArrowUpRight size={16} /></Link> <Link className="button button-dark" to="/vagas">Explorar oportunidades <ArrowUpRight size={16} /></Link></div> : <form className="talent-form form-card" onSubmit={submit} noValidate>
          <div className="form-section-title"><span className="form-number">01</span><div><h2>Seu perfil profissional</h2><p>Preencha os dados e crie uma senha para acessar a área do candidato. Sua senha deve ter pelo menos 14 caracteres, incluindo letras maiúsculas, minúsculas e números.</p></div></div>
          {error && <div className="form-error talent-error-summary" role="alert">{error}</div>}
          <p className="talent-required-note">Os campos marcados com * são obrigatórios.</p>
          <div className="form-grid">
            {([
              { name: 'full_name', label: 'Nome completo', autoComplete: 'name', maxLength: 160, placeholder: 'Seu nome completo', required: true, full: true },
              { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email', maxLength: 254, placeholder: 'voce@email.com', required: true },
              { name: 'phone', label: 'Telefone', type: 'tel', autoComplete: 'tel', maxLength: 24, placeholder: '(00) 00000-0000', required: true },
              { name: 'city', label: 'Cidade', autoComplete: 'address-level2', maxLength: 100, placeholder: 'Sua cidade', required: true },
              { name: 'state', label: 'Estado (UF)', autoComplete: 'address-level1', maxLength: 2, placeholder: 'Ex.: PE', required: true },
              { name: 'area', label: 'Área de interesse', maxLength: 100, placeholder: 'Ex.: Recursos Humanos, Engenharia, Comercial', required: true, full: true },
              { name: 'linkedin', label: 'LinkedIn', type: 'url', maxLength: 500, placeholder: 'https://www.linkedin.com/in/...', required: false, full: true },
              { name: 'password', label: 'Senha de acesso', type: 'password', autoComplete: 'new-password', maxLength: 256, placeholder: 'Pelo menos 14 caracteres', required: true },
              { name: 'password_confirmation', label: 'Confirmar senha', type: 'password', autoComplete: 'new-password', maxLength: 256, placeholder: 'Repita sua senha', required: true },
            ]).map((field) => <label key={field.name} className={field.full ? 'field-full' : undefined}><span>{field.label} {field.required ? <i>*</i> : <small>Opcional</small>}</span><input name={field.name} type={field.type || 'text'} autoComplete={field.autoComplete} maxLength={field.maxLength} required={field.required} placeholder={field.placeholder} aria-invalid={!!fieldErrors[field.name]} aria-describedby={fieldErrors[field.name] ? `talent-error-${field.name}` : undefined} onChange={() => setFieldErrors((previous) => { const next = { ...previous }; delete next[field.name]; return next; })} />{fieldErrors[field.name] && <small className="talent-field-error" id={`talent-error-${field.name}`}>{fieldErrors[field.name]}</small>}</label>)}
          </div>
          <div className="form-section-title form-section-spaced"><span className="form-number">02</span><div><h2>Currículo</h2><p>PDF ou DOCX · até 5 MB · acesso interno restrito.</p></div></div>
          <label className={`upload-zone ${file ? 'upload-zone-selected' : ''}`} htmlFor="talent-resume" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files?.[0] || null); }}><input ref={fileInputRef} type="file" id="talent-resume" name="resume" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required aria-invalid={!!fieldErrors.resume} aria-describedby={fieldErrors.resume ? "talent-error-resume" : undefined} onChange={(event) => { chooseFile(event.target.files?.[0] || null); setFieldErrors(previous => { const next = { ...previous }; delete next.resume; return next; }); }} /><span className="upload-icon">{file ? <FileText size={21} /> : <UploadCloud size={22} />}</span><span className="upload-copy"><strong>{file ? file.name : 'Escolha um arquivo ou arraste até aqui'}</strong><small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Clique para substituir` : 'PDF ou DOCX, no máximo 5 MB'}</small></span>{file && <button className="remove-upload" type="button" aria-label="Remover currículo" onClick={(event) => { event.preventDefault(); event.stopPropagation(); chooseFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}><X size={17} /></button>}</label>
          {fieldErrors.resume && <p className="talent-field-error" id="talent-error-resume">{fieldErrors.resume}</p>}
          <div className="form-section-title form-section-spaced"><span className="form-number">03</span><div><h2>Foto de perfil <small>(opcional)</small></h2><p>JPG, PNG ou WebP até 5 MB. A foto será acessível apenas à equipe autorizada.</p></div></div>
          <label className="candidate-photo-field"><span>Escolher foto</span><input type="file" name="photo" accept="image/jpeg,image/png,image/webp" aria-invalid={!!fieldErrors.photo} aria-describedby={fieldErrors.photo ? "talent-error-photo" : undefined} onChange={(event) => setPhoto(event.target.files?.[0] || null)} /></label>{fieldErrors.photo && <p className="talent-field-error" id="talent-error-photo">{fieldErrors.photo}</p>}
          <div className="consent-box"><ShieldCheck size={20} /><div><strong>Como seu perfil será utilizado</strong><p>Seu currículo e sua foto, se enviada, ficarão disponíveis apenas para usuários internos autorizados da NUDEP, para identificação em futuras oportunidades compatíveis com seu perfil. O cadastro é opcional. Você pode retirar a autorização ou solicitar a exclusão dos dados pelo canal indicado no <Link to="/privacidade" target="_blank">Aviso de Privacidade</Link>.</p><label className="privacy-ack"><input type="checkbox" name="consent" required checked={consent} aria-invalid={!!fieldErrors.consent} aria-describedby={fieldErrors.consent ? "talent-error-consent" : undefined} onChange={(event) => { setConsent(event.target.checked); if (event.target.checked) setFieldErrors(previous => { const next = { ...previous }; delete next.consent; return next; }); }} /><span>Autorizo o uso dos dados para a finalidade descrita e registro que li o aviso de privacidade. <i>*</i></span></label>{fieldErrors.consent && <p className="talent-field-error" id="talent-error-consent">{fieldErrors.consent}</p>}</div></div>
          <div className="honeypot" aria-hidden="true"><label>Não preencher<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <div className="form-submit-row"><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Enviando perfil…' : 'Cadastrar meu perfil'} <ArrowUpRight size={17} /></button><span><LockKeyhole size={14} /> Envio protegido</span></div>
        </form>}
      </div>
      <aside className="talent-side"><div className="talent-side-card"><span className="eyebrow">SEU PERFIL, SEU CONTROLE</span><h2>Você escolhe como participar.</h2><div className="talent-side-line" /><ul><li><Check size={15} />Acompanhe candidaturas na sua conta</li><li><Check size={15} />Currículo com acesso restrito</li><li><Check size={15} />Pedido de atualização ou remoção</li><li><Check size={15} />Consentimento registrado</li></ul><p>Entre na sua conta antes de se candidatar para acompanhar o andamento pela área do candidato.</p><Link to="/vagas">Ver oportunidades <ArrowUpRight size={14} /></Link></div><div className="talent-side-note"><LockKeyhole size={17} /><span>Currículos e fotos não são públicos nem enviados a serviços externos de IA.</span></div></aside>
    </div></section>
  </main>;
}
