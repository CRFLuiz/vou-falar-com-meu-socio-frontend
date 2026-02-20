import { MainLayout } from '../layouts/MainLayout';
import { useTranslation } from 'react-i18next';

export const Project = () => {
    const { t } = useTranslation();

    return (
        <MainLayout>
            <section className="hero">
                <div className="hero-container">
                    <h2 className="section-title">{t('project_title')}</h2>
                    <div className="contact-form-wrapper" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className="contact-form" style={{ padding: '24px' }}>
                            <div style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                                {t('project_placeholder')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};
