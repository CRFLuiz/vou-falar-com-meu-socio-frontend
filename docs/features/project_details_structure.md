# Project Details Structure

## Overview
The Project Details page (`/project/:id`) has been restructured to improve user experience and logical flow. It now uses a 3-phase tab system instead of a flat list of 7 stages.

## Phases

### 1. Reconnaissance and Discovery
Focuses on initial understanding and risk assessment.
- **Structured Discovery**: Analysis of business context and requirements.
- **Completeness & Risk Scanner**: Evaluation of project maturity and potential blockers.

### 2. Hat-Trick
Core technical planning and design phase.
- **Architecture Generator**: System design and technology strategy.
- **Engineering Breakdown Engine**: Detailed WBS and implementation roadmap.
- **Risk Intelligence Module**: Comprehensive risk assessment and mitigation.

### 3. Delivery
Final estimation and documentation generation.
- **Estimation Engine**: Time, cost, and team composition metrics.
- **Document Composer**: Final generated documentation and proposals.

## Technical Implementation
- **Component**: `src/pages/ProjectDetails.tsx`
- **State Management**:
  - `activePhase`: Tracks the current main phase (reconnaissance, hat_trick, delivery).
  - `activeTab`: Tracks the currently selected sub-tab within the active phase.
- **Navigation**: Switching phases automatically selects the first tab of the new phase.
