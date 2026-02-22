import { MainLayout } from '../layouts/MainLayout';
import { useTranslation } from 'react-i18next';
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Project } from '../types/project';

type Phase = 'reconnaissance' | 'hat_trick' | 'delivery';
type Tab = 'discovery' | 'risk' | 'architecture' | 'engineering' | 'risk_intel' | 'estimation' | 'documents';

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

    const fetchProject = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            console.log('Fetching project from:', `${apiBaseUrl}/projects/${id}`);
            const response = await fetch(`${apiBaseUrl}/projects/${id}`);
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
    };

    const generateStage = async (stageName: string, endpointSuffix: string) => {
        if (!project || !id) return;
        setIsGenerating(true);
        try {
            console.log(`Generating ${stageName} via:`, `${apiBaseUrl}/projects/${id}/stage/${endpointSuffix}`);
            const response = await fetch(`${apiBaseUrl}/projects/${id}/stage/${endpointSuffix}`, {
                method: 'POST',
            });
            if (response.ok) {
                const updatedProject = await response.json();
                setProject(updatedProject);
            } else {
                const errorData = await response.json();
                console.error(`Failed to generate ${stageName}:`, errorData);
                alert(`Failed to generate ${stageName}: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(`Error generating ${stageName}:`, error);
            alert(`Error generating ${stageName}`);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id, apiBaseUrl]);

    const renderTabContent = () => {
        if (!project) return null;

        const renderGenerateButton = (label: string, endpoint: string, disabled: boolean = false, disabledReason?: string) => (
            <div className="mb-4">
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
                    {isGenerating ? 'Processing...' : `Generate ${label}`}
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
        const KeyValue = ({ label, value }: { label: string, value: any }) => (
            <div className="mb-2 grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-gray-700 pb-2 last:border-0">
                <span className="text-gray-400 font-medium">{label}:</span>
                <span className="md:col-span-2 text-gray-100">{String(value)}</span>
            </div>
        );

        // Helper for list display
        const ListDisplay = ({ items }: { items: string[] }) => (
             <ul className="list-disc pl-5 text-gray-300 space-y-1">
                {items?.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
        );

        switch (activeTab) {
            case 'discovery':
                const dData = project.discovery_data;
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Structured Discovery</h3>
                                <p className="text-gray-400">Analysis of business context and requirements</p>
                            </div>
                            {renderGenerateButton('Discovery Data', 'discovery')}
                        </div>

                        <SectionCard title="Project Description">
                            <p className="text-gray-300 leading-relaxed">{project.description}</p>
                        </SectionCard>

                        {dData ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <SectionCard title="Business Context">
                                    <KeyValue label="Objective" value={dData.business?.objective} />
                                    <KeyValue label="Initiative Type" value={dData.business?.initiative_type} />
                                    <KeyValue label="Target Deadline" value={dData.business?.deadline} />
                                    <KeyValue label="Criticality" value={dData.business?.criticality} />
                                </SectionCard>

                                <SectionCard title="Analysis Metrics">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="text-center p-3 bg-gray-700 rounded-lg min-w-[100px]">
                                            <div className="text-2xl font-bold text-cyan-400">{dData.confidence_score}%</div>
                                            <div className="text-xs text-gray-400">Confidence</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-700 rounded-lg min-w-[100px]">
                                            <div className={`text-xl font-bold ${dData.estimation_risk === 'High' ? 'text-red-400' : 'text-green-400'}`}>
                                                {dData.estimation_risk}
                                            </div>
                                            <div className="text-xs text-gray-400">Risk Level</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="text-sm font-semibold text-gray-300">Inferred Signals:</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {dData.inferred_signals?.map((sig: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-gray-700 text-xs rounded text-cyan-200 border border-cyan-900">{sig}</span>
                                            ))}
                                        </div>
                                    </div>
                                </SectionCard>

                                <SectionCard title="Functional Scope">
                                    <div className="mb-4">
                                        <h5 className="text-sm font-semibold text-gray-300 mb-2">Build Items:</h5>
                                        <ListDisplay items={dData.functional_scope?.build_items} />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-semibold text-gray-300 mb-2">Integrations:</h5>
                                        <ListDisplay items={dData.functional_scope?.integrations} />
                                    </div>
                                </SectionCard>

                                <SectionCard title="Non-Functional Requirements">
                                    {Object.entries(dData.non_functional || {}).map(([key, val]) => (
                                        <div key={key} className="mb-3">
                                            <h5 className="text-sm font-semibold text-gray-300 capitalize mb-1">{key}:</h5>
                                            <p className="text-sm text-gray-400 bg-gray-900 p-2 rounded border border-gray-700">
                                                {JSON.stringify(val)}
                                            </p>
                                        </div>
                                    ))}
                                </SectionCard>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-800 rounded border border-dashed border-gray-600">
                                <p className="text-gray-400 mb-4">No discovery data generated yet.</p>
                                <p className="text-sm text-gray-500">Click the generate button above to analyze the project description.</p>
                            </div>
                        )}
                    </div>
                );
            case 'risk':
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
            case 'architecture':
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
            case 'engineering':
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
                                                    {eData.tasks?.slice(0, 10).map((task: any, i: number) => (
                                                        <tr key={i} className="hover:bg-gray-700/50">
                                                            <td className="p-3 text-gray-200">{task.name}</td>
                                                            <td className="p-3">
                                                                <span className="px-2 py-1 bg-gray-800 rounded text-xs border border-gray-600">
                                                                    {task.domain}
                                                                </span>
                                                            </td>
                                                            <td className="p-3">{task.complexity}</td>
                                                        </tr>
                                                    ))}
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
            case 'risk_intel':
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
                                                    {riData.risk_matrix?.map((risk: any, i: number) => (
                                                        <tr key={i} className="hover:bg-gray-700/50">
                                                            <td className="p-3 text-gray-200 font-medium">{risk.description}</td>
                                                            <td className="p-3">{risk.category}</td>
                                                            <td className="p-3 text-center">{risk.probability}</td>
                                                            <td className="p-3 text-center">{risk.impact}</td>
                                                            <td className="p-3 text-xs italic">{risk.mitigation}</td>
                                                        </tr>
                                                    ))}
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
            case 'estimation':
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
            case 'documents':
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
                                {docData.documents?.map((doc: any, i: number) => (
                                    <div key={i} className="bg-gray-800 p-6 rounded border border-gray-700">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-xl font-bold text-cyan-400 capitalize">{doc.type.replace(/_/g, ' ')}</h4>
                                                <p className="text-sm text-gray-400">Audience: {doc.audience} | Format: {doc.format}</p>
                                            </div>
                                            <button 
                                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold transition-colors"
                                                onClick={() => {
                                                    // Simple download/view simulation
                                                    const blob = new Blob([doc.content], { type: 'text/markdown' });
                                                    const url = URL.createObjectURL(blob);
                                                    window.open(url, '_blank');
                                                }}
                                            >
                                                Download / View
                                            </button>
                                        </div>
                                        <div className="bg-gray-900 p-4 rounded h-64 overflow-y-auto font-mono text-sm text-gray-300 whitespace-pre-wrap">
                                            {doc.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-12 bg-gray-800 rounded border border-dashed border-gray-600">
                                <p className="text-gray-400 mb-4">No documents generated yet.</p>
                                <p className="text-sm text-gray-500">Complete the estimation phase to generate final documents.</p>
                            </div>
                        )}
                    </div>
                );
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

                    <div className="project-content" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '400px' }}>
                        {renderTabContent()}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};
