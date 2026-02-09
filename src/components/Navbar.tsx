import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

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

    return (
        <>
            <nav style={{ 
                background: scrolled ? 'rgba(15, 15, 35, 0.95)' : 'rgba(15, 15, 35, 0.9)',
                boxShadow: scrolled ? '0 0 30px rgba(0, 255, 255, 0.2)' : 'none'
            }}>
                <div className="nav-container">
                    <Link to="/" className="logo">Vou Falar Com Meu Sócio</Link>
                    <div className="nav-bottom" style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                         <Link to="/login" className="cyber-button">Login</Link>
                         <Link to="/signup" className="cyber-button" style={{ background: 'transparent', border: '1px solid var(--primary-cyan)', color: 'var(--primary-cyan)' }}>Sign Up</Link>
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
