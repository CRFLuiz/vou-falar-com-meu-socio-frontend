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
        rate: string | null;
        hours_per_day: string | null;
        days_per_week: number | null;
        level: string | null;
    } | null>(null);

    const [profileForm, setProfileForm] = useState({
        name: '',
        professional_title: '',
        professional_description: '',
        rate: '',
        hours_per_day: '',
        days_per_week: '',
        level: ''
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
                const rate =
                    'rate' in parsed && (typeof (parsed as { rate?: unknown }).rate === 'string' || typeof (parsed as { rate?: unknown }).rate === 'number')
                        ? String((parsed as { rate: string | number }).rate)
                        : null;
                const hoursPerDay =
                    'hours_per_day' in parsed &&
                    (typeof (parsed as { hours_per_day?: unknown }).hours_per_day === 'string' ||
                        typeof (parsed as { hours_per_day?: unknown }).hours_per_day === 'number')
                        ? String((parsed as { hours_per_day: string | number }).hours_per_day)
                        : null;
                const daysPerWeek =
                    'days_per_week' in parsed && typeof (parsed as { days_per_week?: unknown }).days_per_week === 'number'
                        ? (parsed as { days_per_week: number }).days_per_week
                        : null;
                const level =
                    'level' in parsed && typeof (parsed as { level?: unknown }).level === 'string'
                        ? (parsed as { level: string }).level
                        : null;

                return {
                    id,
                    email,
                    name,
                    professional_title: professionalTitle,
                    professional_description: professionalDescription,
                    rate,
                    hours_per_day: hoursPerDay,
                    days_per_week: daysPerWeek,
                    level
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
            professional_description: nextAuthUser?.professional_description ?? '',
            rate: nextAuthUser?.rate ?? '',
            hours_per_day: nextAuthUser?.hours_per_day ?? '',
            days_per_week: typeof nextAuthUser?.days_per_week === 'number' ? String(nextAuthUser.days_per_week) : '',
            level: nextAuthUser?.level ?? ''
        });
        const isProfileComplete = Boolean(
            nextAuthUser &&
            nextAuthUser.name &&
            nextAuthUser.name.trim().length > 0 &&
            nextAuthUser.professional_title &&
            nextAuthUser.professional_title.trim().length > 0 &&
            nextAuthUser.professional_description &&
            nextAuthUser.professional_description.trim().length > 0
        );

        setShowProfileModal(Boolean(nextAuthUser && !isProfileComplete));
    }, []);

    const email = authUser?.email ?? null;

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        const rateInput = profileForm.rate.trim();
        const hoursPerDayInput = profileForm.hours_per_day.trim();
        const daysPerWeekInput = profileForm.days_per_week.trim();
        const level = profileForm.level.trim();

        if (!name || !professionalTitle || !professionalDescription) {
            setProfileError(t('profile_required_fields'));
            return;
        }

        let rate: number | null = null;
        if (rateInput) {
            const parsedRate = Number(rateInput);
            if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
                setProfileError(t('profile_invalid_rate'));
                return;
            }
            rate = parsedRate;
        }

        let hoursPerDay: number | null = null;
        if (hoursPerDayInput) {
            const parsedHoursPerDay = Number(hoursPerDayInput);
            if (!Number.isFinite(parsedHoursPerDay) || parsedHoursPerDay <= 0 || parsedHoursPerDay > 24) {
                setProfileError(t('profile_invalid_hours_per_day'));
                return;
            }
            hoursPerDay = parsedHoursPerDay;
        }

        let daysPerWeek: number | null = null;
        if (daysPerWeekInput) {
            const parsedDaysPerWeek = Number(daysPerWeekInput);
            if (
                !Number.isFinite(parsedDaysPerWeek) ||
                !Number.isInteger(parsedDaysPerWeek) ||
                parsedDaysPerWeek < 1 ||
                parsedDaysPerWeek > 7
            ) {
                setProfileError(t('profile_invalid_days_per_week'));
                return;
            }
            daysPerWeek = parsedDaysPerWeek;
        }

        if (level && level !== 'junior' && level !== 'pleno' && level !== 'senior') {
            setProfileError(t('profile_invalid_level'));
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
                    professional_description: professionalDescription,
                    rate,
                    hours_per_day: hoursPerDay,
                    days_per_week: daysPerWeek,
                    level: level || null
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
                    typeof nextUser.professional_description === 'string' ? nextUser.professional_description : professionalDescription,
                rate:
                    typeof nextUser.rate === 'string' || typeof nextUser.rate === 'number'
                        ? String(nextUser.rate)
                        : rate === null
                          ? null
                          : String(rate),
                hours_per_day:
                    typeof nextUser.hours_per_day === 'string' || typeof nextUser.hours_per_day === 'number'
                        ? String(nextUser.hours_per_day)
                        : hoursPerDay === null
                          ? null
                          : String(hoursPerDay),
                days_per_week:
                    typeof nextUser.days_per_week === 'number' ? nextUser.days_per_week : daysPerWeek === null ? null : daysPerWeek,
                level: typeof nextUser.level === 'string' ? nextUser.level : (level || null)
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
                        top: '78px',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.65)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        padding: '24px',
                        overflowY: 'auto',
                        zIndex: 9999
                    }}
                >
                    <div
                        className="contact-form-wrapper"
                        style={{
                            width: '100%',
                            maxWidth: '560px',
                            margin: 0,
                            maxHeight: 'calc(100vh - 78px - 48px)',
                            overflowY: 'auto'
                        }}
                    >
                        <form className="contact-form" onSubmit={handleProfileSubmit} style={{ padding: '24px' }}>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>{t('profile_complete_title')}</h3>
                            <div style={{ color: 'var(--text-primary)', opacity: 0.9, marginBottom: '16px' }}>
                                {t('profile_complete_subtitle')}
                            </div>

                            {profileError && <div style={{ color: 'red', marginBottom: '10px' }}>{profileError}</div>}

                            <div style={{ color: 'var(--primary-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                {t('profile_required_section')}
                            </div>

                            <div className="form-group">
                                <label htmlFor="name">
                                    {t('profile_name_label')} <span>{t('profile_required_indicator')}</span>
                                </label>
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
                                <label htmlFor="professional_title">
                                    {t('profile_professional_title_label')} <span>{t('profile_required_indicator')}</span>
                                </label>
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
                                <label htmlFor="professional_description">
                                    {t('profile_professional_description_label')} <span>{t('profile_required_indicator')}</span>
                                </label>
                                <textarea
                                    id="professional_description"
                                    placeholder={t('profile_professional_description_placeholder')}
                                    required
                                    value={profileForm.professional_description}
                                    onChange={handleProfileChange}
                                    rows={4}
                                />
                                <div style={{ marginTop: '12px' }}>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        style={{
                                            width: '100%',
                                            padding: '0.9rem 1.2rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            letterSpacing: '1px',
                                            textTransform: 'none'
                                        }}
                                    >
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M12 2l1.2 4.1L17 7l-3.8 1L12 12l-1.2-4L7 7l3.8-.9L12 2Z"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M19 12l.8 2.7L22 15l-2.2.7L19 18l-.8-2.3L16 15l2.2-.3L19 12Z"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M5 13l.8 2.7L8 16l-2.2.7L5 19l-.8-2.3L2 16l2.2-.3L5 13Z"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <span>{t('profile_help_with_required')}</span>
                                    </button>
                                </div>
                            </div>

                            <div style={{ color: 'var(--primary-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                {t('profile_optional_section')}
                            </div>

                            <div className="form-group">
                                <label htmlFor="rate">
                                    {t('profile_rate_label')} <span style={{ opacity: 0.8 }}>({t('profile_optional_indicator')})</span>
                                </label>
                                <input
                                    type="number"
                                    id="rate"
                                    placeholder={t('profile_rate_placeholder')}
                                    value={profileForm.rate}
                                    onChange={handleProfileChange}
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="hours_per_day">
                                    {t('profile_hours_per_day_label')} <span style={{ opacity: 0.8 }}>({t('profile_optional_indicator')})</span>
                                </label>
                                <input
                                    type="number"
                                    id="hours_per_day"
                                    placeholder={t('profile_hours_per_day_placeholder')}
                                    value={profileForm.hours_per_day}
                                    onChange={handleProfileChange}
                                    min="0"
                                    step="0.25"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="days_per_week">
                                    {t('profile_days_per_week_label')} <span style={{ opacity: 0.8 }}>({t('profile_optional_indicator')})</span>
                                </label>
                                <input
                                    type="number"
                                    id="days_per_week"
                                    placeholder={t('profile_days_per_week_placeholder')}
                                    value={profileForm.days_per_week}
                                    onChange={handleProfileChange}
                                    min="1"
                                    max="7"
                                    step="1"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="level">
                                    {t('profile_level_label')} <span style={{ opacity: 0.8 }}>({t('profile_optional_indicator')})</span>
                                </label>
                                <select id="level" value={profileForm.level} onChange={handleProfileChange}>
                                    <option value="">{t('profile_level_empty')}</option>
                                    <option value="junior">{t('profile_level_junior')}</option>
                                    <option value="pleno">{t('profile_level_pleno')}</option>
                                    <option value="senior">{t('profile_level_senior')}</option>
                                </select>
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
