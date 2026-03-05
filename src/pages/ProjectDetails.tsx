import { MainLayout } from '../layouts/MainLayout';
import { useTranslation } from 'react-i18next';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Project } from '../types/project';

type Phase = 'reconnaissance' | 'hat_trick' | 'delivery';
type Tab = 'discovery' | 'risk' | 'architecture' | 'engineering' | 'risk_intel' | 'estimation' | 'documents';
type ChatMessage = { id: string; role: 'system' | 'user'; text: string };
type DiscoverySocketMessage = {
    type: string;
    message?: string;
    project?: Project;
    intent?: string;
};

const phases: { id: Phase; label: string }[] = [
    { id: 'reconnaissance', label: 'Reconnaissance and Discovery' },
    { id: 'hat_trick', label: 'Hat-Trick' },
    { id: 'delivery', label: 'Delivery' },
];

const tabs: { id: Tab; label: string; phase: Phase }[] = [
    { id: 'discovery', label: 'Structured Discovery', phase: 'reconnaissance' },
    { id: 'risk', label: 'Completeness & Risk Scanner', phase: 'reconnaissance' },
    { id: 'architecture', label: 'Architecture Generator', phase: 'hat_trick' },
    { id: 'engineering', label: 'Engineering Breakdown Engine', phase: 'hat_trick' },
    { id: 'risk_intel', label: 'Risk Intelligence Module', phase: 'hat_trick' },
    { id: 'estimation', label: 'Estimation Engine', phase: 'delivery' },
    { id: 'documents', label: 'Document Composer', phase: 'delivery' },
];

export const ProjectDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [activePhase, setActivePhase] = useState<Phase>('reconnaissance');
    const [activeTab, setActiveTab] = useState<Tab>('discovery');
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [projectDescriptionMessage, setProjectDescriptionMessage] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
        {
            id: 'system-1',
            role: 'system',
            text: 'Posso prosseguir com a geração do Structured Discovery ou você gostaria de acrescentar mais alguma informação antes de gerar o conteúdo?',
        },
    ]);
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const discoverySocketRef = useRef<WebSocket | null>(null);
    const [isDiscoverySocketConnected, setIsDiscoverySocketConnected] = useState(false);
    const isDiscoverySocketClosingRef = useRef(false);
    const userStr = localStorage.getItem('vfcs_auth_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user && user.id ? String(user.id) : '';

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }, [chatMessages.length]);

    const handleSendChatMessage = () => {
        const text = projectDescriptionMessage.trim();
        if (!text) return;
        if (!id) return;
        const socket = discoverySocketRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.error('[DiscoveryChat] WebSocket indisponível para envio de mensagem');
            return;
        }

        console.log('[DiscoveryChat] Enviando mensagem do usuário via WebSocket', text);
        setChatMessages(prev => [
            ...prev,
            {
                id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                role: 'user',
                text,
            },
        ]);
        socket.send(JSON.stringify({
            type: 'discovery_chat_user_message',
            projectId: id,
            userId,
            message: text,
        }));
        setProjectDescriptionMessage('');
    };

    const normalizeDocumentContentForDisplay = (text: string) => {
        const normalized = String(text ?? '').replace(/\r\n/g, '\n');
        const lines = normalized.split('\n');
        const nonEmpty = lines.filter(line => line.trim().length > 0);
        const indents = nonEmpty.map(line => (line.match(/^[ \t]*/)?.[0].length ?? 0));
        const minIndent = indents.length > 0 ? Math.min(...indents) : 0;

        if (minIndent <= 0) return normalized;

        return lines
            .map(line => {
                const prefixLen = line.match(/^[ \t]*/)?.[0].length ?? 0;
                const cut = Math.min(prefixLen, minIndent);
                return line.slice(cut);
            })
            .join('\n');
    };

    const normalizeProjectDescriptionForDisplay = (text: string) => {
        const normalized = String(text ?? '').replace(/\r\n/g, '\n');
        return normalized.replace(/\n\n---\n###\s+Extracted Metadata[\s\S]*$/i, '').trim();
    };

    const handlePhaseChange = (phaseId: Phase) => {
        setActivePhase(phaseId);
        // Set active tab to the first tab of the new phase
        const firstTab = tabs.find(t => t.phase === phaseId);
        if (firstTab) {
            setActiveTab(firstTab.id);
        }
    };

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

    const discoveryWsUrl = useMemo(() => {
        if (apiBaseUrl.startsWith('https://')) return `${apiBaseUrl.replace('https://', 'wss://')}/ws/discovery`;
        if (apiBaseUrl.startsWith('http://')) return `${apiBaseUrl.replace('http://', 'ws://')}/ws/discovery`;
        return `${apiBaseUrl}/ws/discovery`;
    }, [apiBaseUrl]);

    const fetchProject = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const userStr = localStorage.getItem('vfcs_auth_user');
            const user = userStr ? JSON.parse(userStr) : null;
            const headers: Record<string, string> = {};

            if (user && user.id) {
                headers['x-user-id'] = String(user.id);
            }

            console.log('Fetching project from:', `${apiBaseUrl}/projects/${id}`);
            const response = await fetch(`${apiBaseUrl}/projects/${id}`, { headers });
            if (response.ok) {
                const data = await response.json();
                setProject(data);
            } else {
                console.error('Failed to fetch project');
                navigate('/projects');
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setIsLoading(false);
        }
    }, [apiBaseUrl, id, navigate]);

    const generateStage = async (stageName: string, endpointSuffix: string) => {
        if (!project || !id) return;
        setIsGenerating(true);
        try {
            const userStr = localStorage.getItem('vfcs_auth_user');
            const user = userStr ? JSON.parse(userStr) : null;
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };
            
            if (user && user.id) {
                headers['x-user-id'] = String(user.id);
            }

            console.log(`Generating ${stageName} via:`, `${apiBaseUrl}/projects/${id}/stage/${endpointSuffix}`);
            const response = await fetch(`${apiBaseUrl}/projects/${id}/stage/${endpointSuffix}`, {
                method: 'POST',
                headers,
            });
            if (response.ok) {
                const updatedProject = await response.json();
                setProject(updatedProject);
            } else {
                const errorText = await response.text();
                let message = 'Unknown error';
                try {
                    const parsed = JSON.parse(errorText) as { message?: unknown };
                    if (typeof parsed?.message === 'string' && parsed.message.trim().length > 0) {
                        message = parsed.message;
                    }
                } catch {
                    if (errorText.trim().length > 0) {
                        message = errorText.trim();
                    }
                }
                console.error(`Failed to generate ${stageName}:`, errorText);
                alert(`Failed to generate ${stageName}: ${message}`);
            }
        } catch (error) {
            console.error(`Error generating ${stageName}:`, error);
            const message = error instanceof Error ? error.message : String(error);
            alert(`Error generating ${stageName}: ${message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        void fetchProject();
    }, [fetchProject]);

    useEffect(() => {
        if (!id) return;
        console.log('[DiscoveryChat] Iniciando conexão WebSocket', discoveryWsUrl);
        isDiscoverySocketClosingRef.current = false;
        const socket = new WebSocket(discoveryWsUrl);
        discoverySocketRef.current = socket;

        socket.onopen = () => {
            if (discoverySocketRef.current !== socket) return;
            console.log('[DiscoveryChat] WebSocket conectado');
            setIsDiscoverySocketConnected(true);
        };

        socket.onmessage = (event) => {
            const raw = String(event.data ?? '');
            console.log('[DiscoveryChat] Mensagem recebida', raw);
            try {
                const payload = JSON.parse(raw) as DiscoverySocketMessage;
                if (payload.type === 'assistant_message' && payload.message) {
                    setChatMessages(prev => [
                        ...prev,
                        {
                            id: `system-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                            role: 'system',
                            text: payload.message ?? '',
                        },
                    ]);
                }
                if (payload.type === 'project_updated' && payload.project) {
                    console.log('[DiscoveryChat] Projeto atualizado pela LLM');
                    setProject(payload.project);
                }
                if (payload.type === 'generation_started') {
                    console.log('[DiscoveryChat] Geração Structured Discovery iniciada');
                    setIsGenerating(true);
                }
                if (payload.type === 'generation_completed' && payload.project) {
                    console.log('[DiscoveryChat] Geração Structured Discovery concluída');
                    setProject(payload.project);
                    setIsGenerating(false);
                }
                if (payload.type === 'processing_started') {
                    setIsGenerating(true);
                }
                if (payload.type === 'processing_finished') {
                    setIsGenerating(false);
                }
                if (payload.type === 'error' && payload.message) {
                    console.error('[DiscoveryChat] Erro recebido do backend', payload.message);
                    setChatMessages(prev => [
                        ...prev,
                        {
                            id: `system-error-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                            role: 'system',
                            text: payload.message ?? 'Falha ao processar mensagem.',
                        },
                    ]);
                }
            } catch (error) {
                console.error('[DiscoveryChat] Falha ao interpretar payload WebSocket', error);
            }
        };

        socket.onerror = (error) => {
            if (isDiscoverySocketClosingRef.current || discoverySocketRef.current !== socket) {
                return;
            }
            console.error('[DiscoveryChat] Erro na conexão WebSocket', error);
        };

        socket.onclose = () => {
            if (discoverySocketRef.current !== socket) {
                return;
            }
            console.log('[DiscoveryChat] WebSocket desconectado');
            setIsDiscoverySocketConnected(false);
            discoverySocketRef.current = null;
        };

        return () => {
            console.log('[DiscoveryChat] Finalizando conexão WebSocket');
            isDiscoverySocketClosingRef.current = true;
            if (discoverySocketRef.current === socket) {
                setIsDiscoverySocketConnected(false);
                discoverySocketRef.current = null;
            }
            socket.close();
        };
    }, [discoveryWsUrl, id]);

    const renderTabContent = () => {
        if (!project) return null;

        const renderGenerateButton = (label: string, endpoint: string, disabled: boolean = false, disabledReason?: string) => (
            <div style={{ marginBottom: '0.75rem' }}>
                <button
                    onClick={() => generateStage(label, endpoint)}
                    disabled={disabled || isGenerating}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: disabled ? '#4b5563' : 'var(--primary-cyan)',
                        color: disabled ? '#9ca3af' : '#000',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.7 : 1,
                    }}
                >
                    {isGenerating ? t('project_details_processing') : `${t('project_details_generate')} ${label}`}
                </button>
                {disabled && disabledReason && (
                    <p className="text-sm text-yellow-500 mt-2">⚠️ {disabledReason}</p>
                )}
            </div>
        );

        // Helper to render a section card
        const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
            <div className="bg-gray-800 p-4 rounded mb-4 border border-gray-700">
                <h4 className="font-bold mb-3 text-cyan-400 uppercase text-sm tracking-wider">{title}</h4>
                {children}
            </div>
        );

        // Helper for key-value display
        const formatValue = (value: unknown) => {
            if (value === null || value === undefined) return '';
            if (typeof value === 'string') return value;
            if (typeof value === 'number' || typeof value === 'boolean') return String(value);
            try {
                return JSON.stringify(value);
            } catch {
                return String(value);
            }
        };

        const KeyValue = ({ label, value }: { label: string, value: unknown }) => (
            <div className="mb-2 grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-gray-700 pb-2 last:border-0">
                <span className="text-gray-400 font-medium">{label}:</span>
                <span className="md:col-span-2 text-gray-100">{formatValue(value)}</span>
            </div>
        );

        // Helper for list display
        const ListDisplay = ({ items }: { items: string[] }) => (
             <ul className="list-disc pl-5 text-gray-300 space-y-1">
                {items?.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
        );

        type EngineeringTask = { name: string; domain: string; complexity: string };
        type RiskMatrixItem = {
            description: string;
            category: string;
            probability: string;
            impact: string;
            mitigation: string;
        };
        type DocumentItem = { type: string; audience: string; format: string; content: string };

        const toRecord = (value: unknown): Record<string, unknown> =>
            typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

        const toEngineeringTask = (task: unknown): EngineeringTask => {
            const t = toRecord(task);
            return {
                name: typeof t.name === 'string' ? t.name : '',
                domain: typeof t.domain === 'string' ? t.domain : '',
                complexity: typeof t.complexity === 'string' ? t.complexity : String(t.complexity ?? ''),
            };
        };

        const toRiskMatrixItem = (risk: unknown): RiskMatrixItem => {
            const r = toRecord(risk);
            return {
                description: typeof r.description === 'string' ? r.description : '',
                category: typeof r.category === 'string' ? r.category : '',
                probability: typeof r.probability === 'string' ? r.probability : String(r.probability ?? ''),
                impact: typeof r.impact === 'string' ? r.impact : String(r.impact ?? ''),
                mitigation: typeof r.mitigation === 'string' ? r.mitigation : '',
            };
        };

        const toDocumentItem = (doc: unknown): DocumentItem => {
            const d = toRecord(doc);
            return {
                type: typeof d.type === 'string' ? d.type : 'document',
                audience: typeof d.audience === 'string' ? d.audience : '',
                format: typeof d.format === 'string' ? d.format : '',
                content: typeof d.content === 'string' ? d.content : '',
            };
        };

        switch (activeTab) {
            case 'discovery': {
                const description = normalizeProjectDescriptionForDisplay(project.description);
                const discoveryData = project.discovery_data;
                return (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div
                            style={{
                                textAlign: 'left',
                                backgroundColor: 'rgba(15, 15, 35, 0.55)',
                                border: '1px solid rgba(0, 0, 0, 0.85)',
                                borderRadius: '10px 10px 0 0',
                                padding: '16px',
                                maxHeight: '30vh',
                                overflowY: 'auto',
                            }}
                        >
                            <h3
                                style={{
                                    marginTop: 0,
                                    marginBottom: '12px',
                                    fontSize: '1.25rem',
                                    fontWeight: 800,
                                    color: 'var(--primary-cyan)',
                                }}
                            >
                                {t('project_details_project_description_title')}
                            </h3>
                            <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>{description}</div>
                        </div>

                        <div
                            style={{
                                height: '40vh',
                                backgroundColor: 'rgb(15, 15, 35)',
                                border: '1px solid rgba(0, 0, 0, 0.85)',
                                borderTop: '2px solid rgba(0, 255, 255, 0.55)',
                                borderBottom: '2px solid rgba(0, 255, 255, 0.55)',
                                borderRadius: '0 0 10px 10px',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    padding: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                }}
                            >
                                {chatMessages.map(message => {
                                    const isSystem = message.role === 'system';
                                    return (
                                        <div
                                            key={message.id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: isSystem ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    maxWidth: '80%',
                                                    padding: '10px 12px',
                                                    borderRadius: '12px',
                                                    backgroundColor: isSystem ? 'rgba(0, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.08)',
                                                    border: isSystem ? '1px solid rgba(0, 255, 255, 0.25)' : '1px solid rgba(0, 0, 0, 0.55)',
                                                    color: 'var(--text-primary)',
                                                    whiteSpace: 'pre-wrap',
                                                    lineHeight: 1.35,
                                                }}
                                            >
                                                {message.text}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '12px',
                                    borderTop: '1px solid rgba(0, 0, 0, 0.65)',
                                }}
                            >
                                <input
                                    value={projectDescriptionMessage}
                                    onChange={(e) => setProjectDescriptionMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSendChatMessage();
                                        }
                                    }}
                                    placeholder="Digite aqui..."
                                    style={{
                                        flex: 1,
                                        height: '40px',
                                        padding: '0 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(0, 0, 0, 0.65)',
                                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleSendChatMessage}
                                    disabled={!projectDescriptionMessage.trim() || !isDiscoverySocketConnected}
                                    style={{
                                        height: '40px',
                                        padding: '0 14px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(0, 0, 0, 0.65)',
                                        backgroundColor: 'var(--primary-cyan)',
                                        color: '#000',
                                        fontWeight: 800,
                                        cursor: projectDescriptionMessage.trim() && isDiscoverySocketConnected ? 'pointer' : 'not-allowed',
                                        opacity: projectDescriptionMessage.trim() && isDiscoverySocketConnected ? 1 : 0.6,
                                    }}
                                >
                                    Enviar
                                </button>
                            </div>
                        </div>

                        <div
                            style={{
                                textAlign: 'left',
                                backgroundColor: 'rgba(15, 15, 35, 0.55)',
                                border: '1px solid rgba(0, 0, 0, 0.85)',
                                borderRadius: '10px',
                                padding: '16px',
                            }}
                        >
                            {!discoveryData ? (
                                <div style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                                    Ainda não foi gerado nenhum conteúdo do Structured Discovery.
                                </div>
                            ) : (
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-primary)' }}>
                                    {JSON.stringify(discoveryData, null, 2)}
                                </pre>
                            )}
                        </div>
                    </div>
                );
            }
            case 'risk': {
                const riskDisabled = !project.discovery_data;
                const rData = project.risk_analysis_data;
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                             <div>
                                <h3 className="text-2xl font-bold text-white">Completeness & Risk Scanner</h3>
                                <p className="text-gray-400">Evaluate project maturity and potential blockers</p>
                            </div>
                            {renderGenerateButton('Risk Analysis', 'risk-analysis', riskDisabled, 'Requires Discovery Data')}
                        </div>

                        {rData ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <SectionCard title="Risk Overview">
                                    <div className="flex items-center gap-4 mb-4">
                                         <div className="text-center p-3 bg-gray-700 rounded-lg min-w-[100px]">
                                            <div className="text-2xl font-bold text-cyan-400">{rData.completeness_score}%</div>
                                            <div className="text-xs text-gray-400">Completeness</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-700 rounded-lg min-w-[100px]">
                                            <div className={`text-xl font-bold ${rData.estimation_status === 'BLOCKED' ? 'text-red-500' : 'text-green-500'}`}>
                                                {rData.estimation_status}
                                            </div>
                                            <div className="text-xs text-gray-400">Status</div>
                                        </div>
                                    </div>
                                    <KeyValue label="Risk Class" value={rData.risk_classification} />
                                    <KeyValue label="Uncertainty" value={rData.uncertainty_level} />
                                    <KeyValue label="Confidence" value={`${rData.confidence_to_proceed}%`} />
                                </SectionCard>

                                <SectionCard title="Assessment Summary">
                                    <p className="text-gray-300 italic mb-4">"{rData.risk_summary}"</p>
                                    {rData.critical_gaps?.length > 0 && (
                                        <div className="mt-4 p-3 bg-red-900/20 border border-red-900 rounded">
                                            <h5 className="text-red-400 font-bold mb-2">CRITICAL GAPS</h5>
                                            <ListDisplay items={rData.critical_gaps} />
                                        </div>
                                    )}
                                </SectionCard>

                                <SectionCard title="Ambiguities & Questions">
                                    <div className="mb-4">
                                        <h5 className="text-sm font-semibold text-yellow-400 mb-2">Ambiguities Detected:</h5>
                                        <ListDisplay items={rData.ambiguities} />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-semibold text-cyan-400 mb-2">Clarification Questions:</h5>
                                        <ListDisplay items={rData.generated_questions} />
                                    </div>
                                </SectionCard>
                            </div>
                        ) : (
                             <div className="text-center py-12 bg-gray-800 rounded border border-dashed border-gray-600">
                                <p className="text-gray-400 mb-4">No risk analysis generated yet.</p>
                                <p className="text-sm text-gray-500">Generate discovery data first, then run the risk scanner.</p>
                            </div>
                        )}
                    </div>
                );
            }
            case 'architecture': {
                const archDisabled = !project.discovery_data || !project.risk_analysis_data;
                const aData = project.architecture_data;
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Core Architecture</h3>
                                <p className="text-gray-400">System design and technology strategy</p>
                            </div>
                            {renderGenerateButton('Architecture', 'architecture', archDisabled, 'Requires Discovery & Risk Analysis')}
                        </div>

                        {aData ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <SectionCard title="High-Level Design">
                                    <KeyValue label="Pattern" value={aData.selected_pattern} />
                                    <KeyValue label="Deployment" value={aData.deployment_strategy} />
                                    <KeyValue label="Complexity" value={`${aData.overall_architecture_complexity}/10`} />
                                </SectionCard>

                                <SectionCard title="Environments">
                                    <div className="flex flex-wrap gap-2">
                                        {aData.environments?.map((env: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-gray-700 text-cyan-300 rounded-full text-sm border border-gray-600">{env}</span>
                                        ))}
                                    </div>
                                </SectionCard>

                                <SectionCard title="Strategic Decisions">
                                    <ul className="space-y-2">
                                        {aData.decision_log?.map((dec: string, i: number) => (
                                            <li key={i} className="flex gap-2 text-sm text-gray-300 bg-gray-900/50 p-2 rounded">
                                                <span className="text-cyan-500">✓</span> {dec}
                                            </li>
                                        ))}
                                    </ul>
                                </SectionCard>

                                <SectionCard title="Technical Stack Strategies">
                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-1">Availability</h5>
                                            <p className="text-sm text-gray-300 bg-gray-900 p-2 rounded">{JSON.stringify(aData.availability_strategy)}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-1">Observability</h5>
                                            <p className="text-sm text-gray-300 bg-gray-900 p-2 rounded">{JSON.stringify(aData.observability_stack)}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-1">Security</h5>
                                            <p className="text-sm text-gray-300 bg-gray-900 p-2 rounded">{JSON.stringify(aData.security)}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-1">Disaster Recovery</h5>
                                            <p className="text-sm text-gray-300 bg-gray-900 p-2 rounded">{JSON.stringify(aData.disaster_recovery)}</p>
                                        </div>
                                    </div>
                                </SectionCard>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-800 rounded border border-dashed border-gray-600">
                                <p className="text-gray-400 mb-4">No architecture generated yet.</p>
                                <p className="text-sm text-gray-500">Run risk analysis first to unlock architecture generation.</p>
                            </div>
                        )}
                    </div>
                );
            }
            case 'engineering': {
                const engDisabled = !project.architecture_data;
                const eData = project.engineering_data;
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Engineering Breakdown</h3>
                                <p className="text-gray-400">Detailed WBS and implementation roadmap</p>
                            </div>
                            {renderGenerateButton('Engineering Plan', 'engineering', engDisabled, 'Requires Architecture Data')}
                        </div>

                        {eData ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <SectionCard title="Effort Metrics">
                                    <div className="flex items-center gap-4 mb-4">
                                         <div className="text-center p-3 bg-gray-700 rounded-lg min-w-[100px]">
                                            <div className="text-2xl font-bold text-cyan-400">{eData.total_tasks}</div>
                                            <div className="text-xs text-gray-400">Total Tasks</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-700 rounded-lg min-w-[100px]">
                                            <div className="text-xl font-bold text-yellow-400">
                                                {eData.adjusted_complexity_score}
                                            </div>
                                            <div className="text-xs text-gray-400">Complexity Score</div>
                                        </div>
                                    </div>
                                    <KeyValue label="Infra Tasks" value={eData.infra_tasks} />
                                    <KeyValue label="CI/CD Tasks" value={eData.cicd_tasks} />
                                    <KeyValue label="Security Tasks" value={eData.security_tasks} />
                                </SectionCard>

                                <SectionCard title="Recommended Team">
                                    <div className="space-y-2">
                                        {Object.entries(eData.recommended_team_profile || {}).map(([role, count]) => (
                                            <div key={role} className="flex justify-between items-center bg-gray-900/50 p-2 rounded">
                                                <span className="text-gray-300 capitalize">{role.replace(/_/g, ' ')}</span>
                                                <span className="font-bold text-cyan-400">{String(count)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </SectionCard>

                                <div className="lg:col-span-2">
                                    <SectionCard title="Work Breakdown Structure (High Level)">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-gray-400">
                                                <thead className="bg-gray-700 text-gray-200 uppercase font-bold">
                                                    <tr>
                                                        <th className="p-3">Task Name</th>
                                                        <th className="p-3">Domain</th>
                                                        <th className="p-3">Complexity</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-700">
                                                    {eData.tasks?.slice(0, 10).map((task: unknown, i: number) => {
                                                        const t =
                                                            typeof task === 'object' && task !== null
                                                                ? (task as Record<string, unknown>)
                                                                : {};
                                                        const name = typeof t.name === 'string' ? t.name : '';
                                                        const domain = typeof t.domain === 'string' ? t.domain : '';
                                                        const complexity =
                                                            typeof t.complexity === 'string' || typeof t.complexity === 'number'
                                                                ? String(t.complexity)
                                                                : '';

                                                        return (
                                                            <tr key={i} className="hover:bg-gray-700/50">
                                                                <td className="p-3 text-gray-200">{name}</td>
                                                                <td className="p-3">
                                                                    <span className="px-2 py-1 bg-gray-800 rounded text-xs border border-gray-600">
                                                                        {domain}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3">{complexity}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                            {eData.tasks?.length > 10 && (
                                                <p className="text-center text-xs text-gray-500 mt-2">Showing first 10 tasks...</p>
                                            )}
                                        </div>
                                    </SectionCard>
                                </div>
                            </div>
                        ) : (
                             <div className="text-center py-12 bg-gray-800 rounded border border-dashed border-gray-600">
                                <p className="text-gray-400 mb-4">No engineering plan generated yet.</p>
                                <p className="text-sm text-gray-500">Architecture data is required to generate the WBS.</p>
                            </div>
                        )}
                    </div>
                );
            }
            case 'risk_intel': {
                const riskIntelDisabled = !project.discovery_data || !project.architecture_data || !project.engineering_data;
                const riData = project.risk_intel_data;
                return (
                    <div>
                         <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Risk Intelligence</h3>
                                <p className="text-gray-400">Comprehensive risk assessment and mitigation</p>
                            </div>
                            {renderGenerateButton('Risk Intel', 'risk-intel', riskIntelDisabled, 'Requires Discovery, Architecture & Engineering Data')}
                        </div>

                        {riData ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <SectionCard title="Risk Scoring">
                                    <div className="flex items-center gap-4 mb-4">
                                         <div className="text-center p-3 bg-gray-700 rounded-lg min-w-[100px]">
                                            <div className={`text-2xl font-bold ${riData.overall_risk_level === 'High' ? 'text-red-500' : 'text-yellow-400'}`}>
                                                {riData.overall_risk_level}
                                            </div>
                                            <div className="text-xs text-gray-400">Risk Level</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-700 rounded-lg min-w-[100px]">
                                            <div className="text-xl font-bold text-cyan-400">
                                                x{riData.risk_effort_multiplier}
                                            </div>
                                            <div className="text-xs text-gray-400">Effort Multiplier</div>
                                        </div>
                                    </div>
                                    <KeyValue label="Project Risk Score" value={riData.overall_project_risk_score} />
                                    <KeyValue label="Contingency Reserve" value={`${riData.recommended_contingency_percentage}%`} />
                                </SectionCard>

                                <div className="lg:col-span-2">
                                    <SectionCard title="Risk Matrix">
                                         <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-gray-400">
                                                <thead className="bg-gray-700 text-gray-200 uppercase font-bold">
                                                    <tr>
                                                        <th className="p-3">Risk</th>
                                                        <th className="p-3">Category</th>
                                                        <th className="p-3">Prob.</th>
                                                        <th className="p-3">Impact</th>
                                                        <th className="p-3">Mitigation</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-700">
                                                    {riData.risk_matrix?.map((risk: unknown, i: number) => {
                                                        const r =
                                                            typeof risk === 'object' && risk !== null
                                                                ? (risk as Record<string, unknown>)
                                                                : {};

                                                        const description = typeof r.description === 'string' ? r.description : '';
                                                        const category = typeof r.category === 'string' ? r.category : '';
                                                        const probability =
                                                            typeof r.probability === 'string' || typeof r.probability === 'number'
                                                                ? String(r.probability)
                                                                : '';
                                                        const impact = typeof r.impact === 'string' || typeof r.impact === 'number' ? String(r.impact) : '';
                                                        const mitigation = typeof r.mitigation === 'string' ? r.mitigation : '';

                                                        return (
                                                            <tr key={i} className="hover:bg-gray-700/50">
                                                                <td className="p-3 text-gray-200 font-medium">{description}</td>
                                                                <td className="p-3">{category}</td>
                                                                <td className="p-3 text-center">{probability}</td>
                                                                <td className="p-3 text-center">{impact}</td>
                                                                <td className="p-3 text-xs italic">{mitigation}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </SectionCard>
                                </div>
                            </div>
                        ) : (
                             <div className="text-center py-12 bg-gray-800 rounded border border-dashed border-gray-600">
                                <p className="text-gray-400 mb-4">No risk intelligence generated yet.</p>
                                <p className="text-sm text-gray-500">Requires Engineering Breakdown to assess full risk profile.</p>
                            </div>
                        )}
                    </div>
                );
            }
            case 'estimation': {
                const estDisabled = !project.engineering_data || !project.risk_intel_data;
                const esData = project.estimation_data;
                return (
                    <div>
                         <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Resource & Estimation</h3>
                                <p className="text-gray-400">Time, cost, and team composition metrics</p>
                            </div>
                            {renderGenerateButton('Estimation', 'estimation', estDisabled, 'Requires Engineering & Risk Intel Data')}
                        </div>

                        {esData ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <SectionCard title="Total Effort">
                                    <div className="flex items-center gap-4 mb-4">
                                         <div className="text-center p-3 bg-gray-700 rounded-lg min-w-[100px]">
                                            <div className="text-3xl font-bold text-green-400">{esData.total_hours}</div>
                                            <div className="text-xs text-gray-400">Total Hours</div>
                                        </div>
                                    </div>
                                    <KeyValue label="Confidence Range" value={esData.confidence_range} />
                                    <KeyValue label="Risk Level" value={esData.risk_level} />
                                </SectionCard>

                                <SectionCard title="Effort Distribution">
                                    <div className="space-y-3">
                                        {Object.entries(esData.effort_distribution || {}).map(([key, val]) => (
                                            <div key={key}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="uppercase text-gray-400">{key}</span>
                                                    <span className="text-gray-200">{String(val)}h</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-cyan-500 h-2 rounded-full"
                                                        style={{ width: `${(Number(val) / esData.total_hours) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </SectionCard>

                                <SectionCard title="Recommended Team Structure">
                                    <div className="space-y-2">
                                        {Object.entries(esData.recommended_team || {}).map(([role, count]) => (
                                            <div key={role} className="flex justify-between items-center bg-gray-900/50 p-2 rounded">
                                                <span className="text-gray-300 capitalize">{role.replace(/_/g, ' ')}</span>
                                                <span className="font-bold text-cyan-400">{String(count)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </SectionCard>
                            </div>
                        ) : (
                             <div className="text-center py-12 bg-gray-800 rounded border border-dashed border-gray-600">
                                <p className="text-gray-400 mb-4">No estimation generated yet.</p>
                                <p className="text-sm text-gray-500">Requires Engineering Breakdown and Risk Intel.</p>
                            </div>
                        )}
                    </div>
                );
            }
            case 'documents': {
                 // Documents might not strictly require everything, but let's say it needs estimation at least
                const docDisabled = !project.estimation_data;
                const docData = project.documents_data;
                return (
                    <div>
                         <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Deliverables</h3>
                                <p className="text-gray-400">Final generated documentation and proposals</p>
                            </div>
                            {renderGenerateButton('Documents', 'documents', docDisabled, 'Requires Estimation Data')}
                        </div>

                        {docData ? (
                            <div className="grid grid-cols-1 gap-6">
                                {docData.documents?.map((doc: unknown, i: number) => {
                                    const d = typeof doc === 'object' && doc !== null ? (doc as Record<string, unknown>) : {};
                                    const type = typeof d.type === 'string' ? d.type : '';
                                    const audience = typeof d.audience === 'string' ? d.audience : '';
                                    const format = typeof d.format === 'string' ? d.format : '';
                                    const content = typeof d.content === 'string' ? d.content : '';
                                    const displayContent = normalizeDocumentContentForDisplay(content);

                                    return (
                                        <div key={i} className="bg-gray-800 p-6 rounded border border-gray-700">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-xl font-bold text-cyan-400 capitalize">{type.replace(/_/g, ' ')}</h4>
                                                <p className="text-sm text-gray-400">Audience: {audience} | Format: {format}</p>
                                            </div>
                                            <button 
                                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold transition-colors"
                                                onClick={() => {
                                                    const blob = new Blob([content], { type: 'text/markdown' });
                                                    const url = URL.createObjectURL(blob);
                                                    window.open(url, '_blank');
                                                }}
                                            >
                                                Download / View
                                            </button>
                                        </div>
                                        <div className="bg-gray-900 p-4 rounded h-64 overflow-y-auto font-mono text-sm text-gray-300 whitespace-pre-wrap" style={{ textAlign: 'left' }}>
                                            {displayContent}
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        ) : (
                             <div className="text-center py-12 bg-gray-800 rounded border border-dashed border-gray-600">
                                <p className="text-gray-400 mb-4">No documents generated yet.</p>
                                <p className="text-sm text-gray-500">Complete the estimation phase to generate final documents.</p>
                            </div>
                        )}
                    </div>
                );
            }
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-xl">Loading project...</div>
                </div>
            </MainLayout>
        );
    }

    if (!project) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-xl">Project not found</div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <section className="hero">
                <div className="hero-container">
                    <div className="flex items-center justify-between mb-6">
                        <button 
                            onClick={() => navigate('/projects')}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
                        >
                            &larr; Back to Projects
                        </button>
                        <h2 className="section-title" style={{ margin: 0 }}>{project.name}</h2>
                        <div className="w-24"></div> {/* Spacer for centering */}
                    </div>

                    {/* Phase Tabs */}
                    <div className="phase-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem', gap: '0.5rem' }}>
                        {phases.map((phase) => (
                            <button
                                key={phase.id}
                                onClick={() => handlePhaseChange(phase.id)}
                                style={{
                                    padding: '1rem 2rem',
                                    background: activePhase === phase.id ? 'var(--card-bg)' : 'transparent',
                                    border: 'none',
                                    borderBottom: activePhase === phase.id ? '3px solid var(--primary-cyan)' : '3px solid transparent',
                                    color: activePhase === phase.id ? 'var(--primary-cyan)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    fontWeight: activePhase === phase.id ? 'bold' : 'normal',
                                    fontSize: '1.1rem',
                                    transition: 'all 0.2s',
                                    flex: 1
                                }}
                            >
                                {phase.label}
                            </button>
                        ))}
                    </div>

                    {/* Stage Sub-tabs */}
                    <div className="project-tabs" style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', gap: '0.5rem', paddingBottom: '0.5rem' }}>
                        {tabs.filter(tab => tab.phase === activePhase).map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    background: activeTab === tab.id ? 'rgba(0, 255, 242, 0.1)' : 'transparent',
                                    border: activeTab === tab.id ? '1px solid var(--primary-cyan)' : '1px solid transparent',
                                    borderRadius: '20px',
                                    color: activeTab === tab.id ? 'var(--primary-cyan)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                    transition: 'all 0.2s',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="project-content" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '400px', textAlign: 'left' }}>
                        {renderTabContent()}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};
