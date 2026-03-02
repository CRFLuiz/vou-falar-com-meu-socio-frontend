# TypeScript Types Documentation

## Project Types
`src/types/project.ts`

This file defines the core data structures used throughout the application, particularly for project management and analysis.

### Core Interfaces

- **Project**: The main entity representing a user's project.
  - `id`: Unique identifier.
  - `name`: Project name.
  - `description`: Project description.
  - `status`: Current status.
  - `created_at`, `updated_at`: Timestamps.
  - `discovery_data`: Structured discovery information.
  - `risk_analysis_data`: Risk assessment results.

### Module-Specific Interfaces

- **DiscoveryData**: Structured discovery information.
  - `business`: Objectives, initiative type, deadlines.
  - `functional_scope`: Build items, integrations.
  - `non_functional`: Performance, availability, security requirements.
  - `confidence_score`: AI-generated confidence score.

- **RiskAnalysisData**: Risk assessment results.
  - `estimation_status`: 'ALLOWED' or 'BLOCKED'.
  - `risk_classification`: Classification string.
  - `completeness_score`: Score indicating data completeness.
  - `critical_gaps`: List of missing critical information.

- **ArchitectureData**: System architecture details.
  - `selected_pattern`: Architectural pattern.
  - `deployment_strategy`: Strategy for deployment.
  - `observability_stack`: Monitoring and logging stack.

- **EngineeringData**: Engineering breakdown and tasks.
  - `total_tasks`: Count of tasks.
  - `infra_tasks`, `cicd_tasks`, etc.: Categorized task counts.
  - `recommended_team_profile`: Suggested team composition.

- **RiskIntelData**: Advanced risk intelligence.
  - `risk_matrix`: Matrix of identified risks.
  - `overall_project_risk_score`: Aggregate risk score.

- **EstimationData**: Project estimation metrics.
  - `total_hours`: Total estimated hours.
  - `confidence_range`: Range of confidence for the estimate.
  - `effort_distribution`: Effort breakdown by category.

- **DocumentsData**: Generated documentation.
  - `documents`: List of document objects (id, type, format, content/url).
