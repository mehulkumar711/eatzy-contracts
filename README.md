# Eatzy-Contracts v1.6 (Bullet-Proof)

This repository is the single source of truth for all API, event, and database contracts for the Eatzy ecosystem. **All CI checks must pass before merging to `main`.**

This repo is managed by `release-please` for automated tagging and `renovate` for dependency updates.

## 🚨 ONE-TIME MANUAL SETUP 🚨

Before running any CI or Terraform, you **MUST** create the GCS state bucket:

```bash
# Set your Project ID
PROJECT_ID="your-gcp-project-id"
BUCKET_NAME="eatzy-terraform-state-lock-bucket"

# Create the bucket
gsutil mb -p $PROJECT_ID -l asia-south1 gs://$BUCKET_NAME

# Enable versioning for state rollback
gsutil versioning set on gs://$BUCKET_NAME

# Give Cloud Build SA (or your user) permissions to write state
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gsutil iam ch \
  serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com:objectAdmin \
  gs://$BUCKET_NAME