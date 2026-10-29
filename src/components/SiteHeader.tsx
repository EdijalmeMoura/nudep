import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Logo } from './Logo';

export function SiteHeader() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(() => window.scrollY > 30);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = location.pathname === '/';
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 30); const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); }; window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('keydown', onKey); return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); }; }, []);
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => { document.body.classList.toggle('menu-is-open', mobileOpen); return () => document.body.classList.remove('menu-is-open'); }, [mobileOpen]);
  return <header className={`site-header ${isHome && !scrolled ? 'header-on-hero' : 'header-solid'} ${mobileOpen ? 'mobile-open' : ''}`}><div className="header-inner"><Logo light={isHome && !scrolled} /><nav id="main-navigation" className={`main-nav ${mobileOpen ? 'nav-open' : ''}`} aria-label="Navegação principal">
    <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Início</NavLink><NavLink to="/sobre" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Sobre a NUDEP</NavLink><NavLink to="/vagas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Vagas</NavLink><NavLink to="/empresas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Empresas</NavLink><NavLink to="/instituicoes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Instituições</NavLink><NavLink to="/conteudos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Blog</NavLink><NavLink to="/contato" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Contato</NavLink>
    <div className="mobile-nav-actions"><Link className="mobile-candidate" to="/solicitar-proposta">Solicitar proposta <ArrowUpRight size={15} /></Link><Link className="button button-primary button-mobile" to="/area-do-candidato">Área do candidato <ArrowUpRight size={16} /></Link></div></nav>
    <div className="header-actions"><Link className="candidate-link" to="/solicitar-proposta">Solicitar proposta</Link><Link className="button button-primary header-cta" to="/area-do-candidato">Área do candidato <ArrowUpRight size={16} /></Link></div><button type="button" className="mobile-menu-button" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileOpen} aria-controls="main-navigation">{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button></div>{mobileOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}</header>;
}
