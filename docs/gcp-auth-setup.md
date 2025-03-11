# GCP Authentication Setup

## Prerequisites
- GCP project with owner permissions
- GitHub repository

## Setup Steps

1. Set environment variables for convenience
```bash
export PROJECT_ID="ai-tools-452306"
export POOL_NAME="github-pool"
export PROVIDER_NAME="github-provider"
export SERVICE_ACCOUNT_ID="iac-sa"
```

2. Create Workload Identity Pool
```bash
gcloud iam workload-identity-pools create "${POOL_NAME}" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

3. Create Workload Identity Provider with correct repository reference
```bash
gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_NAME}" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="${POOL_NAME}" \
  --display-name="GitHub provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-condition="attribute.repository=='teamitfi/ceevee'"
```

4. Get the Workload Identity Pool ID
```bash
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe "${POOL_NAME}" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --format="get(name)")
```

5. Create Service Account (if it doesn't exist)
```bash
gcloud iam service-accounts create "${SERVICE_ACCOUNT_ID}" \
  --project="${PROJECT_ID}" \
  --display-name="Infrastructure as Code Service Account"
```

6. Grant IAM roles to Service Account
```bash
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/editor"
```

7. Allow authentication from GitHub Actions
```bash
gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/teamitfi/ceevee"
```

8. Get the Workload Identity Provider resource name (for GitHub Actions)
```bash
gcloud iam workload-identity-pools providers describe "${PROVIDER_NAME}" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="${POOL_NAME}" \
  --format="value(name)"
```

## GitHub Secrets

Add these secrets to your GitHub repository:
- `WIF_PROVIDER`: The Workload Identity Provider resource name (output from step 8)
- `TERRAFORM_SA_EMAIL`: `${SERVICE_ACCOUNT_ID}@${PROJECT_ID}.iam.gserviceaccount.com`
