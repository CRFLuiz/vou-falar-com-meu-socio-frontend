import { useTranslation } from 'react-i18next';

export const Features = () => {
    const { t } = useTranslation();

    return (
        <section className="features fade-up" id="features">
            <div className="features-container">
                <div className="section-header">
                    <h2 className="section-title">Lorem Ipsum</h2>
                    <p className="section-subtitle">Dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore</p>
                </div>
                
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Lorem Ipsum</h3>
                        <p>Dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">🔮</div>
                        <h3>Dolor Sit</h3>
                        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">🌐</div>
                        <h3>Amet Consectetur</h3>
                        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3>Adipiscing Elit</h3>
                        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">🚀</div>
                        <h3>Sed Do Eiusmod</h3>
                        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>Tempor Incididunt</h3>
                        <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
