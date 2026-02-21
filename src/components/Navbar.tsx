import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import brazilFlag from '../assets/images/brazil-100.svg';
import spainFlag from '../assets/images/spain-100.svg';
import usaFlag from '../assets/images/usa-100.svg';

export const Navbar = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsLangDropdownOpen(false);
        setIsUserDropdownOpen(false);
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = () => {
            setIsLangDropdownOpen(false);
            setIsUserDropdownOpen(false);
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsLangDropdownOpen(false);
    };

    const languages = [
        { code: 'en', label: 'English', flagSrc: usaFlag },
        { code: 'pt', label: 'Português', flagSrc: brazilFlag },
        { code: 'es', label: 'Español', flagSrc: spainFlag }
    ];

    const activeLangCode = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
    const currentLang = languages.find(l => l.code === activeLangCode) || languages[0];
    const isAuthenticated = (() => {
        try {
            return Boolean(localStorage.getItem('vfcs_auth_user'));
        } catch {
            return false;
        }
    })();

    const isDashboardArea =
        location.pathname.startsWith('/dashboard') ||
        location.pathname.startsWith('/profile') ||
        location.pathname.startsWith('/project') ||
        location.pathname.startsWith('/settings');
    const showUserMenu = isAuthenticated && isDashboardArea;
    const showAuthButtons = !showUserMenu;

    const logout = () => {
        try {
            localStorage.removeItem('vfcs_auth_user');
        } finally {
            setIsUserDropdownOpen(false);
            setIsMobileMenuOpen(false);
            navigate('/login');
        }
    };

    return (
        <>
            <nav style={{ 
                background: scrolled ? 'rgba(15, 15, 35, 0.95)' : 'rgba(15, 15, 35, 0.9)',
                boxShadow: scrolled ? '0 0 30px rgba(0, 255, 255, 0.2)' : 'none'
            }}>
                <div className="nav-container">
                    <Link to="/" className="logo">{t('app_title')}</Link>
                    <div className="nav-bottom" style={{ display: 'flex', gap: '10px', marginLeft: 'auto', alignItems: 'center' }}>
                         <div className="language-selector" style={{ position: 'relative', marginRight: '15px' }}>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsLangDropdownOpen(!isLangDropdownOpen);
                                    setIsUserDropdownOpen(false);
                                }}
                                style={{
                                    background: 'transparent',
                                    color: 'var(--primary-cyan)',
                                    border: '1px solid var(--primary-cyan)',
                                    padding: '12px 20px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    minWidth: '180px',
                                    justifyContent: 'space-between',
                                    fontSize: '1.2rem'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <img
                                        src={currentLang.flagSrc}
                                        alt=""
                                        aria-hidden="true"
                                        loading="eager"
                                        fetchPriority="high"
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50%',
                                            marginRight: '12px',
                                            display: 'inline-block',
                                            objectFit: 'cover',
                                        }}
                                    />
                                    {currentLang.label}
                                </div>
                                <span style={{ fontSize: '0.8em', marginLeft: '8px' }}>▼</span>
                            </button>

                            {isLangDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    width: '100%',
                                    background: 'rgba(15, 15, 35, 0.98)',
                                    border: '1px solid var(--primary-cyan)',
                                    borderRadius: '5px',
                                    marginTop: '5px',
                                    zIndex: 1000,
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                                }}>
                                    {languages.map((lang) => (
                                        <div 
                                            key={lang.code}
                                            onClick={() => changeLanguage(lang.code)}
                                            style={{
                                                padding: '12px 20px',
                                                color: 'var(--primary-cyan)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                borderBottom: lang.code !== languages[languages.length - 1].code ? '1px solid rgba(0, 255, 255, 0.1)' : 'none',
                                                background: activeLangCode === lang.code ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                                                fontSize: '1.2rem'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = activeLangCode === lang.code ? 'rgba(0, 255, 255, 0.1)' : 'transparent'}
                                        >
                                            <img
                                                src={lang.flagSrc}
                                                alt=""
                                                aria-hidden="true"
                                                loading="eager"
                                                fetchPriority="high"
                                                style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    borderRadius: '50%',
                                                    marginRight: '12px',
                                                    display: 'inline-block',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            {lang.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                         </div>

                         {showAuthButtons && (
                            <>
                                <Link to="/login" className="cyber-button">{t('login')}</Link>
                                <Link to="/signup" className="cyber-button" style={{ background: 'transparent', border: '1px solid var(--primary-cyan)', color: 'var(--primary-cyan)' }}>{t('signup')}</Link>
                            </>
                         )}

                         {showUserMenu && (
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsUserDropdownOpen(!isUserDropdownOpen);
                                        setIsLangDropdownOpen(false);
                                    }}
                                    style={{
                                        background: 'transparent',
                                        color: 'var(--primary-cyan)',
                                        border: '1px solid var(--primary-cyan)',
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    aria-label={t('profile')}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path
                                            d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M20 21a8 8 0 1 0-16 0"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </button>

                                {isUserDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 8px)',
                                        right: 0,
                                        minWidth: '180px',
                                        background: 'rgba(15, 15, 35, 0.98)',
                                        border: '1px solid var(--primary-cyan)',
                                        borderRadius: '8px',
                                        zIndex: 1000,
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                                    }}>
                                        <Link
                                            to="/profile"
                                            style={{
                                                display: 'block',
                                                padding: '12px 16px',
                                                color: 'var(--primary-cyan)',
                                                textDecoration: 'none',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            {t('profile')}
                                        </Link>
                                        <button
                                            onClick={logout}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '12px 16px',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--primary-cyan)',
                                                cursor: 'pointer',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            {t('logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                         )}
                    </div>
                    <button 
                        className={`mobile-menu-button ${isMobileMenuOpen ? 'active' : ''}`} 
                        id="mobileMenuBtn"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleMobileMenu();
                            setIsLangDropdownOpen(false);
                            setIsUserDropdownOpen(false);
                        }}
                    >
                        <div className="hamburger">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`} id="mobileMenuOverlay" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`} id="mobileMenu">
                <div className="mobile-menu-header">
                    <Link to="/" className="mobile-menu-logo">Vou Falar Com Meu Sócio</Link>
                    <button className="mobile-menu-close" id="mobileMenuClose" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                </div>
                <div className="mobile-menu-cta">
                    {showAuthButtons && (
                        <>
                            <Link to="/login" className="cyber-button">{t('login')}</Link>
                            <Link to="/signup" className="cyber-button" style={{ marginTop: '10px', background: 'transparent', border: '1px solid var(--primary-cyan)', color: 'var(--primary-cyan)' }}>{t('signup')}</Link>
                        </>
                    )}
                    {showUserMenu && (
                        <>
                            <Link to="/profile" className="cyber-button">{t('profile')}</Link>
                            <button
                                onClick={logout}
                                className="cyber-button"
                                style={{ marginTop: '10px', background: 'transparent', border: '1px solid var(--primary-cyan)', color: 'var(--primary-cyan)' }}
                            >
                                {t('logout')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};
