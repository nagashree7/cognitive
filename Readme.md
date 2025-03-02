# Azure Cognitive Services Demo

This project demonstrates how to integrate **Azure Cognitive Services** (Speech, Translator, and Cognitive Search) into a React app using Azure Functions for backend APIs.

## Setup

1. Clone the repository.
2. Create an `.env` file at the root of the project and add your Azure API keys (Speech, Translator, and Cognitive Search) to the `.env` file.
3. Install dependencies: `npm install`
4. Run the app locally: `npm start`
5. Build the app: `npm run build`

## Deployment

The app is deployed to **Azure Static Web Apps** using GitHub Actions. Simply push to the `main` branch to trigger automatic deployment.

## Azure Functions

The backend APIs are implemented as **Azure Functions** to interact with Cognitive Services securely.

