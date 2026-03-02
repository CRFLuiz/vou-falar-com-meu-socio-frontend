# AI Profile Enhancement

## Overview
The Profile Enhancement feature uses AI to assist users in completing their professional profile. It helps generate or improve the "Professional Title" and "Professional Description" fields based on the user's name and partial input.

## Workflow

1.  **Input**: The user enters their Name and optionally a draft Title or Description.
2.  **Trigger**: The user clicks the "Help with Required" button.
3.  **API Call**: The frontend sends a POST request to `/ai/profile/help-required` with the current form data.
4.  **AI Processing**: The backend AI agent analyzes the input and generates a professional title and description.
5.  **Update**: The frontend updates the form fields with the AI-generated content.
6.  **Revert**: The user can revert specific fields to their previous state if they prefer their original input.

## Implementation Details

-   **Component**: `src/pages/Profile.tsx`
-   **State Management**:
    -   `profileAiHelping`: Loading state for the AI request.
    -   `previousProfessionalTitle` & `previousProfessionalDescription`: Stores original values for the revert functionality.
-   **API Endpoint**: `POST /ai/profile/help-required`
    -   **Payload**: `{ name, professional_title, professional_description, language }`
    -   **Response**: `{ professional_title, professional_description }`
