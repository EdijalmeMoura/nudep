import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { companyContact } from '../lib/contact';

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-top container">
    <div className="footer-brand-col"><Logo light /><p>Núcleo de Desenvolvimento Profissional. Conectando estudantes, empresas e instituições de ensino.</p></div>
    <div className="footer-links-col"><h3>Explore</h3><Link to="/sobre">Sobre a NUDEP</Link><Link to="/area-do-candidato">Área do candidato</Link><Link to="/vagas">Vagas</Link><Link to="/conteudos">Blog</Link><Link to="/solicitar-proposta">Solicitar proposta</Link><Link to="/contato">Fale conosco</Link></div>
    <div className="footer-links-col"><h3>Cadastros</h3><Link to="/curriculo">Estudantes</Link><Link to="/empresas">Empresas</Link><Link to="/instituicoes">Instituições de ensino</Link></div>
    <div className="footer-contact-col"><h3>Fale conosco</h3><a className="footer-contact-detail" href={`tel:${companyContact.phoneHref}`}><Phone size={14} />{companyContact.phoneDisplay}</a><a className="footer-contact-detail" href={`mailto:${companyContact.email}`}><Mail size={14} />{companyContact.email}</a><p>Segunda a sexta: 08h–12h e 13h–17h<br />Sábado: 08h–12h</p><div className="footer-socials"><a href="https://www.instagram.com/nudepestagios/" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.facebook.com/nucleodeestagios/" target="_blank" rel="noreferrer">Facebook</a><a href="https://www.linkedin.com/company/nudepbr" target="_blank" rel="noreferrer">LinkedIn</a></div></div>
  </div><div className="footer-bottom container"><span>© {new Date().getFullYear()} NUDEP – Estágio e Capacitação.</span><div><Link to="/privacidade">Privacidade</Link><Link to="/cookies">Cookies</Link><Link to="/admin">Acesso administrativo <ArrowUpRight size={12} /></Link></div></div></footer>;
}
