import { MainLayout } from '../layouts/MainLayout';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const apiBaseUrl = (() => {
        const configured = import.meta.env.VITE_API_URL;
        if (typeof configured === 'string' && configured.trim().length > 0) {
            return configured.replace(/\/$/, '');
        }

        const { protocol, hostname, host } = window.location;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return '/api';
        }

        return `${protocol}//api.${host}`;
    })();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(`${apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data: unknown = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    data && typeof data === 'object' && 'message' in data && typeof (data as { message?: unknown }).message === 'string'
                        ? (data as { message: string }).message
                        : t('login_error');
                throw new Error(message === 'Invalid email format' ? t('invalid_email') : message);
            }

            try {
                if (data && typeof data === 'object' && 'user' in data) {
                    localStorage.setItem('vfcs_auth_user', JSON.stringify((data as { user: unknown }).user));
                } else {
                    localStorage.setItem('vfcs_auth_user', JSON.stringify({ email: formData.email }));
                }
            } catch {
                localStorage.setItem('vfcs_auth_user', JSON.stringify({ email: formData.email }));
            }

            setSuccess(t('login_success'));
            setTimeout(() => {
                navigate('/dashboard');
            }, 1200);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('login_error');
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <section className="hero">
                <div className="hero-container">
                    <h2 className="section-title">{t('login_title')}</h2>
                    <div className="contact-form-wrapper" style={{maxWidth: '400px', margin: '0 auto'}}>
                         <form className="contact-form" onSubmit={handleSubmit}>
                            {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
                            {success && <div style={{color: '#00ffff', marginBottom: '10px'}}>{success}</div>}

                            <div className="form-group">
                                <label htmlFor="email">{t('email_label')}</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder={t('login_email_placeholder')}
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">{t('password_label')}</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder={t('login_password_placeholder')}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <button type="submit" className="btn-primary btn-submit" disabled={loading}>
                                {loading ? t('login_loading') : t('login_btn')}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};
