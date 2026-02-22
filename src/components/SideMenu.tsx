import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const SideMenu = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname === path;

    const logout = () => {
        try {
            localStorage.removeItem('vfcs_auth_user');
        } finally {
            navigate('/login');
        }
    };

    return (
        <aside className="side-menu" aria-label="Side menu">
            <div className="side-menu-content">
                <div className="side-menu-section">
                    <Link to="/profile" className={`side-menu-item ${isActive('/profile') ? 'active' : ''}`}>
                        {t('profile')}
                    </Link>
                    <Link to="/projects" className={`side-menu-item ${isActive('/projects') ? 'active' : ''}`}>
                        {t('project')}
                    </Link>
                </div>

                <div className="side-menu-section side-menu-section-bottom">
                    <Link to="/settings" className={`side-menu-item ${isActive('/settings') ? 'active' : ''}`}>
                        {t('settings')}
                    </Link>
                    <button type="button" className="side-menu-item side-menu-button" onClick={logout}>
                        {t('logout')}
                    </button>
                </div>
            </div>
        </aside>
    );
};
