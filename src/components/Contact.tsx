import { useState } from 'react';

export const Contact = () => {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitText, setSubmitText] = useState('Transmit Message');
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
            setSubmitText('TRANSMITTING...');
            setButtonStyle({ background: 'linear-gradient(135deg, var(--primary-cyan), var(--primary-pink))' });
            
            setTimeout(() => {
                setSubmitText('TRANSMISSION COMPLETE');
                setButtonStyle({ background: 'var(--primary-cyan)' });
                
                // Clear form
                setFormState({ name: '', email: '', message: '' });
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    setSubmitText('Transmit Message');
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
                            <label htmlFor="name">Lorem</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                placeholder="Lorem ipsum" 
                                required 
                                value={formState.name}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="email">Ipsum</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                placeholder="dolor@sit.com" 
                                required 
                                value={formState.email}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="message">Dolor</label>
                            <textarea 
                                id="message" 
                                name="message" 
                                rows={5} 
                                placeholder="Sit amet consectetur..." 
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
