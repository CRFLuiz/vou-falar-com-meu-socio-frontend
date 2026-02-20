import { MainLayout } from '../layouts/MainLayout';
import { useTranslation } from 'react-i18next';

export const Profile = () => {
    const { t } = useTranslation();

    const email = (() => {
        try {
            const raw = localStorage.getItem('vfcs_auth_user');
            if (!raw) return null;
            const parsed: unknown = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            if (!('email' in parsed)) return null;
            return typeof (parsed as { email?: unknown }).email === 'string' ? (parsed as { email: string }).email : null;
        } catch {
            return null;
        }
    })();

    return (
        <MainLayout>
            <section className="hero">
                <div className="hero-container">
                    <h2 className="section-title">{t('profile_title')}</h2>
                    <div className="contact-form-wrapper" style={{maxWidth: '600px', margin: '0 auto'}}>
                        <div className="contact-form" style={{padding: '24px'}}>
                            <div style={{color: 'var(--text-primary)', fontSize: '1.2rem'}}>
                                {email ? t('profile_email', { email }) : t('profile_email_missing')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};
