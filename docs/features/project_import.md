# Project Import Feature

## Overview
The "Import Project" feature allows users to create a new project by importing data from an external URL (freelancer platform) and/or providing a custom text description.

## Workflow
1.  **User Input:**
    *   **Project URL:** Link to a project on a freelancer platform (e.g., 99freelas, Workana).
    *   **Project Context / Description:** Free text for additional details, rules, or manual description.
2.  **Validation:**
    *   At least one of the two fields must be filled.
    *   If both are empty, a toast error is displayed.
3.  **Submission:**
    *   The data is sent to the backend `/projects/import` endpoint.
    *   The backend performs scraping (if URL provided) and uses AI to extract structured data.

## UI Components
*   **Modal:** Contains the two input fields.
*   **Tooltips:** Help icons with hover text explaining each field.
*   **Toast:** Error notification for validation failures.

## Key Files
*   `src/pages/Projects.tsx`: Main component handling the modal and submission logic.
