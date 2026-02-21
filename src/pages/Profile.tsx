import { MainLayout } from '../layouts/MainLayout';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useRef, useState } from 'react';

export const Profile = () => {
    const { t, i18n } = useTranslation();

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
    const [profileSuccess, setProfileSuccess] = useState('');
    const [isProfileSuccessVisible, setIsProfileSuccessVisible] = useState(false);
    const [isProfileSuccessFading, setIsProfileSuccessFading] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileAiHelping, setProfileAiHelping] = useState(false);
    const [profileAiError, setProfileAiError] = useState('');
    const [previousProfessionalTitle, setPreviousProfessionalTitle] = useState<string | null>(null);
    const [previousProfessionalDescription, setPreviousProfessionalDescription] = useState<string | null>(null);
    const profileSuccessAutoCloseTimeoutRef = useRef<number | null>(null);
    const profileSuccessFadeTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (profileSuccessAutoCloseTimeoutRef.current !== null) {
                window.clearTimeout(profileSuccessAutoCloseTimeoutRef.current);
                profileSuccessAutoCloseTimeoutRef.current = null;
            }
            if (profileSuccessFadeTimeoutRef.current !== null) {
                window.clearTimeout(profileSuccessFadeTimeoutRef.current);
                profileSuccessFadeTimeoutRef.current = null;
            }
        };
    }, []);

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
    }, []);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProfileSuccess('');
        setIsProfileSuccessVisible(false);
        setIsProfileSuccessFading(false);
        setProfileForm((prev) => ({
            ...prev,
            [e.target.id]: e.target.value
        }));
    };

    const startProfileSuccessFade = () => {
        if (profileSuccessFadeTimeoutRef.current !== null) {
            window.clearTimeout(profileSuccessFadeTimeoutRef.current);
            profileSuccessFadeTimeoutRef.current = null;
        }

        setIsProfileSuccessFading(true);
        profileSuccessFadeTimeoutRef.current = window.setTimeout(() => {
            setIsProfileSuccessVisible(false);
            setIsProfileSuccessFading(false);
            setProfileSuccess('');
            profileSuccessFadeTimeoutRef.current = null;
        }, 350);
    };

    const showProfileSuccess = (message: string) => {
        if (profileSuccessAutoCloseTimeoutRef.current !== null) {
            window.clearTimeout(profileSuccessAutoCloseTimeoutRef.current);
            profileSuccessAutoCloseTimeoutRef.current = null;
        }
        if (profileSuccessFadeTimeoutRef.current !== null) {
            window.clearTimeout(profileSuccessFadeTimeoutRef.current);
            profileSuccessFadeTimeoutRef.current = null;
        }

        setProfileSuccess(message);
        setIsProfileSuccessVisible(true);
        setIsProfileSuccessFading(false);

        profileSuccessAutoCloseTimeoutRef.current = window.setTimeout(() => {
            startProfileSuccessFade();
            profileSuccessAutoCloseTimeoutRef.current = null;
        }, 3000);
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        setIsProfileSuccessVisible(false);
        setIsProfileSuccessFading(false);

        if (profileSuccessAutoCloseTimeoutRef.current !== null) {
            window.clearTimeout(profileSuccessAutoCloseTimeoutRef.current);
            profileSuccessAutoCloseTimeoutRef.current = null;
        }
        if (profileSuccessFadeTimeoutRef.current !== null) {
            window.clearTimeout(profileSuccessFadeTimeoutRef.current);
            profileSuccessFadeTimeoutRef.current = null;
        }

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

            showProfileSuccess(t('profile_save_success'));
        } catch (err: unknown) {
            setProfileError(err instanceof Error ? err.message : t('profile_save_error'));
        } finally {
            setProfileSaving(false);
        }
    };

    const handleProfileAiHelp = async () => {
        setProfileAiError('');

        const name = profileForm.name.trim();
        const professionalTitle = profileForm.professional_title.trim();
        const professionalDescription = profileForm.professional_description.trim();

        if (!name) {
            setProfileAiError(t('profile_required_fields'));
            return;
        }

        if (!professionalTitle && !professionalDescription) {
            return;
        }

        setPreviousProfessionalTitle(profileForm.professional_title);
        setPreviousProfessionalDescription(profileForm.professional_description);
        setProfileAiHelping(true);

        try {
            const language = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
            const response = await fetch(`${apiBaseUrl}/ai/profile/help-required`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    professional_title: professionalTitle,
                    professional_description: professionalDescription,
                    language,
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

            const nextTitle =
                data && typeof data === 'object' && 'professional_title' in data && typeof (data as { professional_title?: unknown }).professional_title === 'string'
                    ? (data as { professional_title: string }).professional_title
                    : null;
            const nextDescription =
                data &&
                typeof data === 'object' &&
                'professional_description' in data &&
                typeof (data as { professional_description?: unknown }).professional_description === 'string'
                    ? (data as { professional_description: string }).professional_description
                    : null;

            setProfileForm((prev) => ({
                ...prev,
                professional_title: typeof nextTitle === 'string' ? nextTitle : prev.professional_title,
                professional_description: typeof nextDescription === 'string' ? nextDescription : prev.professional_description,
            }));
        } catch (err: unknown) {
            setProfileAiError(err instanceof Error ? err.message : t('profile_save_error'));
        } finally {
            setProfileAiHelping(false);
        }
    };

    const handleRevertProfessionalTitle = () => {
        if (previousProfessionalTitle === null) return;
        setProfileForm((prev) => ({
            ...prev,
            professional_title: previousProfessionalTitle,
        }));
        setPreviousProfessionalTitle(null);
    };

    const handleRevertProfessionalDescription = () => {
        if (previousProfessionalDescription === null) return;
        setProfileForm((prev) => ({
            ...prev,
            professional_description: previousProfessionalDescription,
        }));
        setPreviousProfessionalDescription(null);
    };

    return (
        <MainLayout>
            {isProfileSuccessVisible && (
                <div
                    role="status"
                    aria-live="polite"
                    style={{
                        position: 'fixed',
                        top: '96px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'min(720px, calc(100% - 24px))',
                        background: 'rgba(15, 15, 35, 0.98)',
                        border: '1px solid rgba(34, 197, 94, 0.9)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.55)',
                        borderRadius: '10px',
                        padding: '16px 16px',
                        zIndex: 10000,
                        opacity: isProfileSuccessFading ? 0 : 1,
                        transition: 'opacity 300ms ease',
                        color: 'var(--text-primary)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.25 }}>
                            {profileSuccess}
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (profileSuccessAutoCloseTimeoutRef.current !== null) {
                                    window.clearTimeout(profileSuccessAutoCloseTimeoutRef.current);
                                    profileSuccessAutoCloseTimeoutRef.current = null;
                                }
                                startProfileSuccessFade();
                            }}
                            aria-label={t('close')}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(34, 197, 94, 0.9)',
                                color: 'rgba(34, 197, 94, 0.95)',
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                lineHeight: 1,
                                flex: '0 0 auto',
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            <section className="hero">
                <div className="hero-container">
                    <h2 className="section-title">{t('user_profile')}</h2>
                    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 12px' }}>
                        {profileError && <div style={{ color: 'red', marginBottom: '10px' }}>{profileError}</div>}
                        {profileAiError && <div style={{ color: 'red', marginBottom: '10px' }}>{profileAiError}</div>}

                        <form onSubmit={handleProfileSubmit}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                                    gap: '18px',
                                    alignItems: 'start'
                                }}
                            >
                                <div className="contact-form-wrapper" style={{ margin: 0 }}>
                                    <div className="contact-form" style={{ padding: '24px' }}>
                                        <div
                                            style={{
                                                color: 'var(--primary-cyan)',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                marginBottom: '12px'
                                            }}
                                        >
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
                                            <label
                                                htmlFor="professional_title"
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
                                            >
                                                <span>
                                                    {t('profile_professional_title_label')} <span>{t('profile_required_indicator')}</span>
                                                </span>
                                                {previousProfessionalTitle !== null && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRevertProfessionalTitle}
                                                        disabled={profileAiHelping}
                                                        style={{
                                                            background: 'transparent',
                                                            border: '1px solid var(--primary-cyan)',
                                                            color: 'var(--primary-cyan)',
                                                            padding: '6px 10px',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                        aria-label="Revert title suggestion"
                                                    >
                                                        <svg
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                d="M9 14l-4-4 4-4"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                            <path
                                                                d="M20 20a8 8 0 0 0-8-8H5"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </label>
                                            <div className="vfcs-field-overlay-container" aria-busy={profileAiHelping}>
                                                <input
                                                    type="text"
                                                    id="professional_title"
                                                    placeholder={t('profile_professional_title_placeholder')}
                                                    required
                                                    value={profileForm.professional_title}
                                                    onChange={handleProfileChange}
                                                    disabled={profileAiHelping}
                                                />
                                                {profileAiHelping && (
                                                    <div className="vfcs-field-overlay" aria-hidden="true">
                                                        <span className="vfcs-inline-spinner" aria-hidden="true" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label
                                                htmlFor="professional_description"
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
                                            >
                                                <span>
                                                    {t('profile_professional_description_label')} <span>{t('profile_required_indicator')}</span>
                                                </span>
                                                {previousProfessionalDescription !== null && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRevertProfessionalDescription}
                                                        disabled={profileAiHelping}
                                                        style={{
                                                            background: 'transparent',
                                                            border: '1px solid var(--primary-cyan)',
                                                            color: 'var(--primary-cyan)',
                                                            padding: '6px 10px',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                        aria-label="Revert description suggestion"
                                                    >
                                                        <svg
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                d="M9 14l-4-4 4-4"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                            <path
                                                                d="M20 20a8 8 0 0 0-8-8H5"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </label>
                                            <div className="vfcs-field-overlay-container" aria-busy={profileAiHelping}>
                                                <textarea
                                                    id="professional_description"
                                                    placeholder={t('profile_professional_description_placeholder')}
                                                    required
                                                    value={profileForm.professional_description}
                                                    onChange={handleProfileChange}
                                                    rows={6}
                                                    disabled={profileAiHelping}
                                                />
                                                {profileAiHelping && (
                                                    <div className="vfcs-field-overlay" aria-hidden="true">
                                                        <span className="vfcs-inline-spinner" aria-hidden="true" />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ marginTop: '12px' }}>
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    onClick={handleProfileAiHelp}
                                                    disabled={
                                                        profileAiHelping ||
                                                        profileSaving ||
                                                        profileForm.name.trim().length === 0 ||
                                                        (profileForm.professional_title.trim().length === 0 &&
                                                            profileForm.professional_description.trim().length === 0)
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.9rem 1.2rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '10px',
                                                        letterSpacing: '1px',
                                                        textTransform: 'none',
                                                        opacity:
                                                            profileAiHelping ||
                                                            profileSaving ||
                                                            profileForm.name.trim().length === 0 ||
                                                            (profileForm.professional_title.trim().length === 0 &&
                                                                profileForm.professional_description.trim().length === 0)
                                                                ? 0.6
                                                                : 1,
                                                        cursor:
                                                            profileAiHelping ||
                                                            profileSaving ||
                                                            profileForm.name.trim().length === 0 ||
                                                            (profileForm.professional_title.trim().length === 0 &&
                                                                profileForm.professional_description.trim().length === 0)
                                                                ? 'not-allowed'
                                                                : 'pointer'
                                                    }}
                                                >
                                                    {profileAiHelping ? (
                                                        <span className="vfcs-inline-spinner" aria-hidden="true" />
                                                    ) : (
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
                                                    )}
                                                    <span>{profileAiHelping ? t('profile_help_loading') : t('profile_help_with_required')}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="contact-form-wrapper" style={{ margin: 0 }}>
                                    <div className="contact-form" style={{ padding: '24px' }}>
                                        <div
                                            style={{
                                                color: 'var(--primary-cyan)',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                marginBottom: '12px'
                                            }}
                                        >
                                            {t('profile_optional_section')}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="rate">
                                                {t('profile_rate_label')}{' '}
                                                <span style={{ opacity: 0.8 }}>({t('profile_optional_indicator')})</span>
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
                                                {t('profile_hours_per_day_label')}{' '}
                                                <span style={{ opacity: 0.8 }}>({t('profile_optional_indicator')})</span>
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
                                                {t('profile_days_per_week_label')}{' '}
                                                <span style={{ opacity: 0.8 }}>({t('profile_optional_indicator')})</span>
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
                                                {t('profile_level_label')}{' '}
                                                <span style={{ opacity: 0.8 }}>({t('profile_optional_indicator')})</span>
                                            </label>
                                            <select id="level" value={profileForm.level} onChange={handleProfileChange}>
                                                <option value="">{t('profile_level_empty')}</option>
                                                <option value="junior">{t('profile_level_junior')}</option>
                                                <option value="pleno">{t('profile_level_pleno')}</option>
                                                <option value="senior">{t('profile_level_senior')}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn-primary btn-submit" disabled={profileSaving}>
                                    {profileSaving ? t('profile_saving') : t('profile_save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};
