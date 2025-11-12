output "role_id" {
  description = "The full ID of the created custom IAM role"
  value       = google_project_iam_custom_role.cloud_build_ci_role.id
}