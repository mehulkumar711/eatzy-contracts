variable "project_id" {
  type = string
}

# Defines the custom, least-privilege role
resource "google_project_iam_custom_role" "cloud_build_ci_role" {
  project = var.project_id
  role_id = "cloudBuildCIRoleV1" # v1 suffix for future changes
  title   = "Cloud Build CI Role (Eatzy Contracts)"
  permissions = [
    # To pull base images
    "artifactregistry.repositories.read",
    "artifactregistry.files.read",
    "storage.buckets.get",
    "storage.objects.list",
    "storage.objects.get",

    # To push SBOM artifacts
    "storage.objects.create",

    # For Secret Manager (TEST_TOKEN)
    "secretmanager.versions.access",
    
    # For logging
    "logging.logEntries.create",

    # For SLSA/cosign (if signing images)
    "artifactregistry.repositories.write"
  ]
}

output "role_id" {
  value = google_project_iam_custom_role.cloud_build_ci_role.id
}