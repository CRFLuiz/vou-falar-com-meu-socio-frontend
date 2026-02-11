import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Contact = () => {
    const { t } = useTranslation();
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitText, setSubmitText] = useState(t('contact_submit_btn'));
    const [buttonStyle, setButtonStyle] = useState({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formState.name && formState.email && formState.message) {
            setIsSubmitting(true);
            setSubmitText(t('contact_submitting'));
            setButtonStyle({ background: 'linear-gradient(135deg, var(--primary-cyan), var(--primary-pink))' });
            
            setTimeout(() => {
                setSubmitText(t('contact_success'));
                setButtonStyle({ background: 'var(--primary-cyan)' });
                
                // Clear form
                setFormState({ name: '', email: '', message: '' });
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    setSubmitText(t('contact_submit_btn'));
                    setButtonStyle({});
                    setIsSubmitting(false);
                }, 3000);
            }, 2000);
        }
    };

    return (
        <section className="contact fade-up" id="contact">
            <div className="contact-container">
                <div className="section-header">
                    <h2 className="section-title">Lorem Ipsum</h2>
                    <p className="section-subtitle">Dolor sit amet consectetur adipiscing elit</p>
                </div>
                
                <div className="contact-form-wrapper">
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">{t('contact_name_label')}</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                placeholder={t('contact_name_placeholder')}
                                required 
                                value={formState.name}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="email">{t('contact_email_label')}</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                placeholder={t('contact_email_placeholder')}
                                required 
                                value={formState.email}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="message">{t('contact_message_label')}</label>
                            <textarea 
                                id="message" 
                                name="message" 
                                rows={5} 
                                placeholder={t('contact_message_placeholder')}
                                required
                                value={formState.message}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn-primary btn-submit"
                            style={buttonStyle}
                            disabled={isSubmitting}
                        >
                            {submitText}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};
