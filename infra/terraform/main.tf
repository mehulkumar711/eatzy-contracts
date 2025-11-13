terraform {
  required_version = ">= 1.3.0"

  # CHANGED: Using local storage instead of Google Cloud Storage
  # This bypasses the billing requirement.
  backend "local" {
    path = "terraform.tfstate"
  }
}

# We keep the provider definition, but we won't create resources yet.
provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  type        = string
  description = "The GCP project ID."
  default     = "eatzy-local-dev" 
}

variable "project_number" {
  type        = string
  description = "The GCP project number."
  default     = "000000000000"
}

variable "region" {
  type        = string
  description = "The GCP region."
  default     = "asia-south1"
}

# COMMENTED OUT: Cloud resources that require a paid account
# module "cloud_build_sa_role" {
#   source     = "./modules/iam"
#   project_id = var.project_id
# }

# resource "google_project_iam_member" "cloud_build_sa_binding" {
#   project = var.project_id
#   role    = module.cloud_build_sa_role.role_id
#   member  = "serviceAccount:${var.project_number}@cloudbuild.gserviceaccount.com"
# }

# resource "google_secret_manager_secret" "staging_test_token" {
#   secret_id = "STAGING_TEST_TOKEN"
#   replication {
#     automatic = true
#   }
# }