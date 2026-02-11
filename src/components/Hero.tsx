import { useTranslation } from 'react-i18next';

export const Hero = () => {
    const { t } = useTranslation();

    return (
        <section className="hero">
            <div className="hero-container">
                <h1 className="hero-title">
                    <span className="hero-nexus">{t('hero_nexus')}</span><span className="hero-flow">{t('hero_flow')}</span>
                </h1>
                <p className="hero-subtitle">{t('hero_subtitle')}</p>
                <div className="hero-buttons">
                    <a href="#" className="btn-primary">{t('btn_primary')}</a>
                    <a href="#" className="btn-secondary">{t('btn_secondary')}</a>
                </div>
            </div>
        </section>
    );
};
