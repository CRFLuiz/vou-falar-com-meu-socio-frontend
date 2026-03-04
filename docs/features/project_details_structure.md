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

## Structured Discovery Tab Layout

The **Structured Discovery** tab is designed to support an interactive flow where the user can review the project description, chat with the system before generation, and then review the generated output.

### 1) Project Description Panel (Top)
- Displays the project title ("Project Description") and the raw project description text.
- The panel is scrollable and capped to `30vh` to avoid dominating the page.
- The container uses a solid translucent background and a darker border to visually separate it from the page background.
- The project description is sanitized for display by removing any appended `Extracted Metadata` section (if present in the description payload).

### 2) Chat Panel (Middle, 40vh)
- Fixed-height container (`40vh`) with an internal message list and a message composer.
- Messages are visually distinct by role:
  - **System messages**: right-aligned with a dedicated background color.
  - **User messages**: left-aligned with a different background color.
- The first system message is hardcoded and asks whether to proceed with Structured Discovery generation or add more info.
- The composer includes an input plus a submit button on the right. Pressing `Enter` also sends.

### 3) Structured Discovery Output (Bottom)
- Renders immediately after the chat panel (no vertical gap).
- If `project.discovery_data` is missing, a warning text is shown indicating that nothing has been generated yet.
- If `project.discovery_data` exists, it is displayed below the chat. (Current UI renders the raw JSON.)

## Technical Implementation
- **Component**: `src/pages/ProjectDetails.tsx`
- **State Management**:
  - `activePhase`: Tracks the current main phase (reconnaissance, hat_trick, delivery).
  - `activeTab`: Tracks the currently selected sub-tab within the active phase.
- **Navigation**: Switching phases automatically selects the first tab of the new phase.

### Data Sources
- The Structured Discovery output is stored in `project.discovery_data`.
- The backend updates this field when the discovery stage is generated and returns the updated `Project` object to the frontend.
