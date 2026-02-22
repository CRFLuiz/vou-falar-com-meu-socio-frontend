import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { BackgroundEffects } from '../components/BackgroundEffects';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useLocation } from 'react-router-dom';
import { SideMenu } from '../components/SideMenu';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    const location = useLocation();

    const isAuthenticated = (() => {
        try {
            return Boolean(localStorage.getItem('vfcs_auth_user'));
        } catch {
            return false;
        }
    })();

    const isAppArea =
        location.pathname.startsWith('/dashboard') ||
        location.pathname.startsWith('/profile') ||
        location.pathname.startsWith('/projects') ||
        location.pathname.startsWith('/settings');

    const showSideMenu = isAuthenticated && isAppArea;

    useEffect(() => {
        // Scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        const fadeElements = document.querySelectorAll('.fade-up');
        fadeElements.forEach(el => {
            observer.observe(el);
        });

        return () => {
            fadeElements.forEach(el => observer.unobserve(el));
        };
    }, [location.pathname, children]); // Re-run when location changes or children update

    return (
        <div id="top" className={showSideMenu ? 'with-side-menu' : undefined}>
            <BackgroundEffects />
            <Navbar />
            <div className="app-shell">
                {showSideMenu && <SideMenu />}
                <main className="app-main">{children}</main>
            </div>
            <Footer />
        </div>
    );
};
