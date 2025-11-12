terraform {
  required_version = ">= 1.3.0"

  backend "gcs" {
    # This bucket MUST be created manually with versioning
    # See README.md for gsutil commands
    bucket = "eatzy-terraform-state-lock-bucket"
    prefix = "eatzy-contracts/terraform.tfstate"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  type        = string
  description = "The GCP project ID."
}

variable "project_number" {
  type        = string
  description = "The GCP project number (for Cloud Build SA)."
}

variable "region" {
  type        = string
  description = "The GCP region."
  default     = "asia-south1" # Mumbai
}

# 1. Create the least-privilege role
module "cloud_build_sa_role" {
  source     = "./modules/iam"
  project_id = var.project_id
}

# 2. Patched: Bind the new custom role to the default Cloud Build SA
resource "google_project_iam_member" "cloud_build_sa_binding" {
  project = var.project_id
  role    = module.cloud_build_sa_role.role_id
  # Default Cloud Build SA format
  member  = "serviceAccount:${var.project_number}@cloudbuild.gserviceaccount.com"
}

# 3. Create the Secret Manager secret
resource "google_secret_manager_secret" "staging_test_token" {
  secret_id = "STAGING_TEST_TOKEN"
  replication {
    automatic = true
  }
}