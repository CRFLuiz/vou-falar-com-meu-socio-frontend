import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

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

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsLangDropdownOpen(false);
    };

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'pt', label: 'Português' },
        { code: 'es', label: 'Español' }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

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
                                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
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
                                    <span style={{ 
                                        width: '14px', 
                                        height: '14px', 
                                        backgroundColor: 'red', 
                                        borderRadius: '50%', 
                                        marginRight: '12px',
                                        display: 'inline-block'
                                    }}></span>
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
                                                background: i18n.language === lang.code ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                                                fontSize: '1.2rem'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = i18n.language === lang.code ? 'rgba(0, 255, 255, 0.1)' : 'transparent'}
                                        >
                                            <span style={{ 
                                                width: '14px', 
                                                height: '14px', 
                                                backgroundColor: 'red', 
                                                borderRadius: '50%', 
                                                marginRight: '12px',
                                                display: 'inline-block'
                                            }}></span>
                                            {lang.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                         </div>
                         <Link to="/login" className="cyber-button">{t('login')}</Link>
                         <Link to="/signup" className="cyber-button" style={{ background: 'transparent', border: '1px solid var(--primary-cyan)', color: 'var(--primary-cyan)' }}>{t('signup')}</Link>
                    </div>
                    <button 
                        className={`mobile-menu-button ${isMobileMenuOpen ? 'active' : ''}`} 
                        id="mobileMenuBtn"
                        onClick={toggleMobileMenu}
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
                    <Link to="/login" className="cyber-button">Login</Link>
                    <Link to="/signup" className="cyber-button" style={{ marginTop: '10px', background: 'transparent', border: '1px solid var(--primary-cyan)', color: 'var(--primary-cyan)' }}>Sign Up</Link>
                </div>
            </div>
        </>
    );
};
