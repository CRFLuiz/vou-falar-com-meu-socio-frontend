import { MainLayout } from '../layouts/MainLayout';
import { useTranslation } from 'react-i18next';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Project } from '../types/project';

const Tooltip = ({ text }: { text: string }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div 
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            style={{ 
                position: 'relative', 
                display: 'inline-flex', 
                marginLeft: '8px', 
                verticalAlign: 'middle',
                cursor: 'help'
            }}
        >
            <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '1px solid var(--text-secondary)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold'
            }}>?</div>
            
            {isVisible && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: '8px',
                    width: '220px',
                    padding: '0.75rem',
                    background: '#1a1a2e',
                    border: '1px solid var(--primary-cyan)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.8rem',
                    lineHeight: '1.4',
                    zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    pointerEvents: 'none',
                    textAlign: 'center'
                }}>
                    {text}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        marginLeft: '-6px',
                        borderWidth: '6px',
                        borderStyle: 'solid',
                        borderColor: '#1a1a2e transparent transparent transparent'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        marginLeft: '-6px',
                        marginTop: '-1px',
                        borderWidth: '6px',
                        borderStyle: 'solid',
                        borderColor: 'var(--primary-cyan) transparent transparent transparent',
                        zIndex: -1
                    }}></div>
                </div>
            )}
        </div>
    );
};

export const Projects = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // New Project Form State
    const [projectUrl, setProjectUrl] = useState('');
    const [projectText, setProjectText] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);

    const apiBaseUrl = useMemo(() => {
        const configured = import.meta.env.VITE_API_URL;
        if (typeof configured === 'string' && configured.trim().length > 0) {
            return configured.replace(/\/$/, '');
        }

        const { protocol, hostname, host } = window.location;
        
        // If using the specific domain, use the api subdomain
        if (hostname.includes('vou-falar-com-meu-socio.lcdev.click')) {
             return `${protocol}//api.${host}`;
        }
        
        // Fallback for localhost (assuming backend port might be exposed or proxied)
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000'; 
        }

        return `${protocol}//api.${host}`;
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/projects`);
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Failed to fetch projects', error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [apiBaseUrl]);

    const handleProjectClick = (project: Project) => {
        navigate(`/projects/${project.id}`);
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setProjectUrl('');
        setProjectText('');
        setToastMessage(null);
        setIsLoading(false);
    };

    const handleImportProject = async () => {
        if (!projectUrl.trim() && !projectText.trim()) {
            setToastMessage(t('project_import_error_empty'));
            // Auto hide after 3 seconds
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }

        setToastMessage(null);
        setIsLoading(true);
        
        try {
            const response = await fetch(`${apiBaseUrl}/projects/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    url: projectUrl,
                    text: projectText
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to import project');
            }

            const newProject = await response.json();
            setProjects([newProject, ...projects]);
            handleCloseModal();
        } catch (error) {
            console.error('Import project error:', error);
            alert(error instanceof Error ? error.message : 'Failed to import project');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProjects = useMemo(() => {
        return projects
            .filter((project) =>
                project.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                if (sortBy === 'name') {
                    return a.name.localeCompare(b.name);
                } else {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }
            });
    }, [projects, searchTerm, sortBy]);

    const getStatusLabel = (status: string) => {
        // Map backend status to keys if needed, or just return status for now
        return status;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'in_progress':
                return 'var(--primary-cyan)';
            case 'completed':
                return 'var(--primary-purple)';
            case 'on_hold':
            case 'pending':
                return 'var(--secondary-amber)';
            default:
                return 'var(--text-secondary)';
        }
    };

    return (
        <MainLayout>
            <section className="hero">
                <div className="hero-container">
                    <h2 className="section-title">{t('project_title')}</h2>
                    
                    <div className="projects-controls" style={{ 
                        display: 'flex', 
                        gap: '1rem', 
                        marginBottom: '2rem', 
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--card-bg)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
                            <input
                                type="text"
                                placeholder={t('project_search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="date">{t('project_sort_date')}</option>
                                <option value="name">{t('project_sort_name')}</option>
                            </select>
                        </div>
                        <button
                            onClick={handleOpenModal}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '4px',
                                border: 'none',
                                background: 'var(--primary-orange)',
                                color: '#fff',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            {t('project_add_new')}
                        </button>
                    </div>

                    <div className="projects-list" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => handleProjectClick(project)}
                                    style={{
                                        background: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        padding: '1.5rem',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{project.name}</h3>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            background: 'rgba(0,0,0,0.2)',
                                            color: getStatusColor(project.status),
                                            border: `1px solid ${getStatusColor(project.status)}`
                                        }}>
                                            {getStatusLabel(project.status)}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {project.description}
                                    </p>
                                    
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                {t('project_list_empty')}
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {isModalOpen && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        background: 'var(--card-bg)',
                        padding: '2rem',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '500px',
                        border: '1px solid var(--primary-cyan)',
                        boxShadow: '0 0 30px rgba(0, 255, 242, 0.15)',
                        position: 'relative'
                    }}>
                        {toastMessage && (
                            <div style={{
                                position: 'absolute',
                                top: '-60px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(255, 68, 68, 0.9)',
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                zIndex: 2000,
                                whiteSpace: 'nowrap',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid #ff4444'
                            }}>
                                ⚠️ {toastMessage}
                            </div>
                        )}
                        <button 
                            onClick={handleCloseModal}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                lineHeight: 1
                            }}
                        >
                            &times;
                        </button>
                        
                        <h3 
                            id="modal-title"
                            style={{ 
                            marginTop: 0, 
                            marginBottom: '1.5rem', 
                            color: 'var(--text-primary)',
                            fontSize: '1.5rem',
                            borderBottom: '1px solid var(--border-color)',
                            paddingBottom: '1rem'
                        }}>
                            {t('project_modal_title')}
                        </h3>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '0.5rem', 
                                color: 'var(--text-secondary)',
                                fontSize: '0.9rem' 
                            }}>
                                {t('project_modal_url_label')}
                                <Tooltip text={t('project_modal_url_tooltip')} />
                            </label>
                            <input
                                type="text"
                                value={projectUrl}
                                onChange={(e) => setProjectUrl(e.target.value)}
                                placeholder={t('project_modal_url_placeholder')}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '0.5rem', 
                                color: 'var(--text-secondary)', 
                                fontSize: '0.9rem' 
                            }}>
                                {t('project_modal_text_label')}
                                <Tooltip text={t('project_modal_text_tooltip')} />
                            </label>
                            <textarea
                                value={projectText}
                                onChange={(e) => setProjectText(e.target.value)}
                                placeholder={t('project_modal_text_placeholder')}
                                rows={5}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                {projectText.length} characters
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={handleCloseModal}
                                disabled={isLoading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    background: 'transparent',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {t('project_modal_cancel')}
                            </button>
                            <button
                                onClick={handleImportProject}
                                disabled={isLoading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'var(--primary-cyan)',
                                    color: '#000',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    opacity: isLoading ? 0.7 : 1
                                }}
                            >
                                {isLoading ? t('project_modal_loading') : t('project_modal_load')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};
