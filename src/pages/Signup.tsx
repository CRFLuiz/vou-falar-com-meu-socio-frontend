import { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Signup = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

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
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            setSuccess(t('signup_success'));
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message || t('signup_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
             <section className="hero">
                <div className="hero-container">
                    <h2 className="section-title">{t('signup_title')}</h2>
                    <div className="contact-form-wrapper" style={{maxWidth: '400px', margin: '0 auto'}}>
                         <form className="contact-form" onSubmit={handleSubmit}>
                            {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
                            {success && <div style={{color: '#00ffff', marginBottom: '10px'}}>{success}</div>}
                            
                            <div className="form-group">
                                <label htmlFor="email">{t('email_label')}</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    placeholder={t('contact_email_placeholder')} 
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
                                {loading ? t('signup_loading') : t('signup_btn')}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};
