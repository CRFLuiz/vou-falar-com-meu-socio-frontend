import { MainLayout } from '../layouts/MainLayout';

export const Login = () => {
    return (
        <MainLayout>
            <section className="hero">
                <div className="hero-container">
                    <h2 className="section-title">Login</h2>
                    <div className="contact-form-wrapper" style={{maxWidth: '400px', margin: '0 auto'}}>
                         <form className="contact-form">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" placeholder="Enter email" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" placeholder="Enter password" required />
                            </div>
                            <button type="submit" className="btn-primary btn-submit">Login</button>
                        </form>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};
