import { useTranslation } from 'react-i18next';

export const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-links">
                    <a href="#">{t('footer_privacy')}</a>
                    <span className="footer-separator">•</span>
                    <a href="#">{t('footer_terms')}</a>
                    <span className="footer-separator">•</span>
                    <a href="#">{t('footer_docs')}</a>
                    <span className="footer-separator">•</span>
                    <a href="#">{t('footer_support')}</a>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 Vou Falar Com Meu Sócio. {t('footer_rights')}</p>
                </div>
            </div>
        </footer>
    );
};
