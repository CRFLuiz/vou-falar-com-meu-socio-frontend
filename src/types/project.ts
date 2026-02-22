export interface DiscoveryData {
  business: {
    objective: string;
    initiative_type: string;
    deadline: string;
    criticality: string;
    explicit: boolean;
  };
  functional_scope: {
    build_items: string[];
    integrations: string[];
    migration_required: boolean;
  };
  non_functional: {
    performance: any;
    availability: any;
    security: any;
    compliance: any;
  };
  as_is: any;
  constraints: any;
  inferred_signals: string[];
  missing_information: any[];
  confidence_score: number;
  estimation_risk: string;
}

export interface RiskAnalysisData {
  estimation_status: 'ALLOWED' | 'BLOCKED';
  risk_classification: string;
  completeness_score: number;
  uncertainty_level: string;
  critical_gaps: string[];
  ambiguities: string[];
  generated_questions: string[];
  risk_summary: string;
  confidence_to_proceed: number;
}

export interface ArchitectureData {
  selected_pattern: string;
  availability_strategy: any;
  deployment_strategy: string;
  environments: string[];
  observability_stack: any;
  security: any;
  disaster_recovery: any;
  overall_architecture_complexity: number;
  decision_log: string[];
}

export interface EngineeringData {
  total_tasks: number;
  infra_tasks: number;
  cicd_tasks: number;
  security_tasks: number;
  observability_tasks: number;
  dr_tasks: number;
  raw_complexity_score: number;
  adjusted_complexity_score: number;
  recommended_team_profile: any;
  tasks: any[];
}

export interface RiskIntelData {
  risk_matrix: any[];
  overall_project_risk_score: number;
  overall_risk_level: string;
  risk_effort_multiplier: number;
  recommended_contingency_percentage: number;
}

export interface EstimationData {
  total_hours: number;
  confidence_range: string;
  risk_level: string;
  effort_distribution: any;
  recommended_team: any;
}

export interface DocumentsData {
  documents: {
    id: string;
    type: string;
    format: string;
    content?: string;
    url?: string;
    audience?: string;
  }[];
}

export interface Project {
    id: number;
    name: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    discovery_data?: DiscoveryData;
    risk_analysis_data?: RiskAnalysisData;
    architecture_data?: ArchitectureData;
    engineering_data?: EngineeringData;
    risk_intel_data?: RiskIntelData;
    estimation_data?: EstimationData;
    documents_data?: DocumentsData;
    // Optional UI helper fields
    technologies?: string[];
    budget?: string;
    deadline?: string;
}
