export const Pricing = () => {
    return (
        <section className="pricing fade-up" id="pricing">
            <div className="pricing-container">
                <div className="section-header">
                    <h2 className="section-title">Lorem Ipsum</h2>
                    <p className="section-subtitle">Dolor sit amet, consectetur adipiscing elit</p>
                </div>
                
                <div className="pricing-grid">
                    <div className="pricing-card">
                        <div className="plan-name">Lorem</div>
                        <div className="plan-price">$49</div>
                        <div className="plan-period">per ipsum</div>
                        <ul className="plan-features">
                            <li>Lorem ipsum dolor</li>
                            <li>Sit amet consectetur</li>
                            <li>Adipiscing elit</li>
                            <li>Sed do eiusmod</li>
                            <li>Tempor incididunt</li>
                        </ul>
                        <a href="#" className="btn-secondary">Lorem</a>
                    </div>
                    
                    <div className="pricing-card featured">
                        <div className="plan-name">Ipsum</div>
                        <div className="plan-price">$149</div>
                        <div className="plan-period">per dolor</div>
                        <ul className="plan-features">
                            <li>Ut enim ad minim</li>
                            <li>Veniam quis nostrud</li>
                            <li>Exercitation ullamco</li>
                            <li>Laboris nisi ut</li>
                            <li>Aliquip ex ea</li>
                            <li>Commodo consequat</li>
                        </ul>
                        <a href="#" className="btn-primary">Ipsum</a>
                    </div>
                    
                    <div className="pricing-card">
                        <div className="plan-name">Dolor</div>
                        <div className="plan-price">$399</div>
                        <div className="plan-period">per amet</div>
                        <ul className="plan-features">
                            <li>Duis aute irure</li>
                            <li>Dolor in reprehenderit</li>
                            <li>Voluptate velit esse</li>
                            <li>Cillum dolore eu</li>
                            <li>Fugiat nulla pariatur</li>
                            <li>Excepteur sint occaecat</li>
                        </ul>
                        <a href="#" className="btn-secondary">Dolor</a>
                    </div>
                </div>
            </div>
        </section>
    );
};
