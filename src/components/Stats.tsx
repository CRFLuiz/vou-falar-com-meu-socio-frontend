import { useEffect, useRef } from 'react';

export const Stats = () => {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const animateStats = () => {
            const stats = document.querySelectorAll('.stat-number');
            stats.forEach(stat => {
                const text = stat.textContent || '';
                const target = parseInt(text.replace(/[^\d]/g, ''));
                let count = 0;
                const increment = target / 100;
                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        clearInterval(timer);
                        count = target;
                    }
                    const suffix = text.replace(/[\d]/g, '');
                    stat.textContent = Math.floor(count) + suffix;
                }, 20);
            });
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section className="stats fade-up" id="stats" ref={sectionRef}>
            <div className="stats-container">
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-number">50K+</span>
                        <span className="stat-label">Lorem Ipsum</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">99.9%</span>
                        <span className="stat-label">Dolor Sit</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">500M+</span>
                        <span className="stat-label">Amet Consectetur</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">180+</span>
                        <span className="stat-label">Adipiscing Elit</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
