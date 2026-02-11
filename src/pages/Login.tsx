import { MainLayout } from '../layouts/MainLayout';
import { useTranslation } from 'react-i18next';

export const Login = () => {
    const { t } = useTranslation();

    return (
        <MainLayout>
            <section className="hero">
                <div className="hero-container">
                    <h2 className="section-title">{t('login_title')}</h2>
                    <div className="contact-form-wrapper" style={{maxWidth: '400px', margin: '0 auto'}}>
                         <form className="contact-form">
                            <div className="form-group">
                                <label htmlFor="email">{t('email_label')}</label>
                                <input type="email" id="email" placeholder={t('login_email_placeholder')} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">{t('password_label')}</label>
                                <input type="password" id="password" placeholder={t('login_password_placeholder')} required />
                            </div>
                            <button type="submit" className="btn-primary btn-submit">{t('login_btn')}</button>
                        </form>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};
