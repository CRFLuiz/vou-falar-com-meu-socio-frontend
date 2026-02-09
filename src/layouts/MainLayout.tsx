import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { BackgroundEffects } from '../components/BackgroundEffects';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    const location = useLocation();

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
        <div id="top">
            <BackgroundEffects />
            <Navbar />
            <main>
                {children}
            </main>
            <Footer />
        </div>
    );
};
