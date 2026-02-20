import { MainLayout } from '../layouts/MainLayout';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';

export const Dashboard = () => {
    const { t } = useTranslation();

    const apiBaseUrl = useMemo(() => {
        const configured = import.meta.env.VITE_API_URL;
        if (typeof configured === 'string' && configured.trim().length > 0) {
            return configured.replace(/\/$/, '');
        }

        const { protocol, hostname, host } = window.location;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return '/api';
        }

        return `${protocol}//api.${host}`;
    }, []);

    const [authUser, setAuthUser] = useState<{
        id: number | null;
        email: string | null;
        name: string | null;
        professional_title: string | null;
        professional_description: string | null;
    } | null>(null);

    const [profileForm, setProfileForm] = useState({
        name: '',
        professional_title: '',
        professional_description: ''
    });

    const [profileError, setProfileError] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        const readAuthUser = () => {
            try {
                const raw = localStorage.getItem('vfcs_auth_user');
                if (!raw) return null;

                const parsed: unknown = JSON.parse(raw);
                if (!parsed || typeof parsed !== 'object') return null;

                const id =
                    'id' in parsed && typeof (parsed as { id?: unknown }).id === 'number'
                        ? (parsed as { id: number }).id
                        : null;
                const email =
                    'email' in parsed && typeof (parsed as { email?: unknown }).email === 'string'
                        ? (parsed as { email: string }).email
                        : null;
                const name =
                    'name' in parsed && typeof (parsed as { name?: unknown }).name === 'string'
                        ? (parsed as { name: string }).name
                        : null;
                const professionalTitle =
                    'professional_title' in parsed && typeof (parsed as { professional_title?: unknown }).professional_title === 'string'
                        ? (parsed as { professional_title: string }).professional_title
                        : null;
                const professionalDescription =
                    'professional_description' in parsed &&
                    typeof (parsed as { professional_description?: unknown }).professional_description === 'string'
                        ? (parsed as { professional_description: string }).professional_description
                        : null;

                return {
                    id,
                    email,
                    name,
                    professional_title: professionalTitle,
                    professional_description: professionalDescription
                };
            } catch {
                return null;
            }
        };

        const nextAuthUser = readAuthUser();
        setAuthUser(nextAuthUser);
        setProfileForm({
            name: nextAuthUser?.name ?? '',
            professional_title: nextAuthUser?.professional_title ?? '',
            professional_description: nextAuthUser?.professional_description ?? ''
        });
        setShowProfileModal(
            Boolean(
                nextAuthUser &&
                (!nextAuthUser.name || nextAuthUser.name.trim().length === 0 ||
                    !nextAuthUser.professional_title || nextAuthUser.professional_title.trim().length === 0 ||
                    !nextAuthUser.professional_description || nextAuthUser.professional_description.trim().length === 0)
            )
        );
    }, []);

    const email = authUser?.email ?? null;

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfileForm((prev) => ({
            ...prev,
            [e.target.id]: e.target.value
        }));
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError('');

        if (!authUser?.id) {
            setProfileError(t('profile_missing_user_id'));
            return;
        }

        const name = profileForm.name.trim();
        const professionalTitle = profileForm.professional_title.trim();
        const professionalDescription = profileForm.professional_description.trim();

        if (!name || !professionalTitle || !professionalDescription) {
            setProfileError(t('profile_required_fields'));
            return;
        }

        setProfileSaving(true);

        try {
            const response = await fetch(`${apiBaseUrl}/users/${authUser.id}/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    professional_title: professionalTitle,
                    professional_description: professionalDescription
                }),
            });

            const data: unknown = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    data && typeof data === 'object' && 'message' in data && typeof (data as { message?: unknown }).message === 'string'
                        ? (data as { message: string }).message
                        : t('profile_save_error');
                throw new Error(message);
            }

            const nextUser =
                data && typeof data === 'object' && 'user' in data && (data as { user?: unknown }).user && typeof (data as { user?: unknown }).user === 'object'
                    ? (data as { user: Record<string, unknown> }).user
                    : null;

            if (!nextUser) {
                throw new Error(t('profile_save_error'));
            }

            localStorage.setItem('vfcs_auth_user', JSON.stringify(nextUser));

            setAuthUser({
                id: typeof nextUser.id === 'number' ? nextUser.id : authUser.id,
                email: typeof nextUser.email === 'string' ? nextUser.email : authUser.email,
                name: typeof nextUser.name === 'string' ? nextUser.name : name,
                professional_title: typeof nextUser.professional_title === 'string' ? nextUser.professional_title : professionalTitle,
                professional_description:
                    typeof nextUser.professional_description === 'string' ? nextUser.professional_description : professionalDescription
            });

            setShowProfileModal(false);
        } catch (err: unknown) {
            setProfileError(err instanceof Error ? err.message : t('profile_save_error'));
        } finally {
            setProfileSaving(false);
        }
    };

    return (
        <MainLayout>
            {showProfileModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                        zIndex: 9999
                    }}
                >
                    <div className="contact-form-wrapper" style={{ width: '100%', maxWidth: '560px', margin: 0 }}>
                        <form className="contact-form" onSubmit={handleProfileSubmit} style={{ padding: '24px' }}>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>{t('profile_complete_title')}</h3>
                            <div style={{ color: 'var(--text-primary)', opacity: 0.9, marginBottom: '16px' }}>
                                {t('profile_complete_subtitle')}
                            </div>

                            {profileError && <div style={{ color: 'red', marginBottom: '10px' }}>{profileError}</div>}

                            <div className="form-group">
                                <label htmlFor="name">{t('profile_name_label')}</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder={t('profile_name_placeholder')}
                                    required
                                    value={profileForm.name}
                                    onChange={handleProfileChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="professional_title">{t('profile_professional_title_label')}</label>
                                <input
                                    type="text"
                                    id="professional_title"
                                    placeholder={t('profile_professional_title_placeholder')}
                                    required
                                    value={profileForm.professional_title}
                                    onChange={handleProfileChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="professional_description">{t('profile_professional_description_label')}</label>
                                <textarea
                                    id="professional_description"
                                    placeholder={t('profile_professional_description_placeholder')}
                                    required
                                    value={profileForm.professional_description}
                                    onChange={handleProfileChange}
                                    rows={4}
                                />
                            </div>

                            <button type="submit" className="btn-primary btn-submit" disabled={profileSaving}>
                                {profileSaving ? t('profile_saving') : t('profile_save')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <section className="hero">
                <div className="hero-container">
                    <h2 className="section-title">{t('dashboard_title')}</h2>
                    <div className="contact-form-wrapper" style={{maxWidth: '600px', margin: '0 auto'}}>
                        <div className="contact-form" style={{padding: '24px'}}>
                            <div style={{color: 'var(--text-primary)', fontSize: '1.2rem'}}>
                                {email ? t('dashboard_welcome_with_email', { email }) : t('dashboard_welcome')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};
