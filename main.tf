# Generate a random suffix for uniqueness
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

locals {
  name = "iam-policy-guard-${random_string.suffix.result}"
  tags = {
    Environment = "development"
    Project     = "terraform-aws-iam-policy-guard"
    Owner       = "terraform"
    Example     = "iam-policy-guard"
  }
}

module "cloudtrail" {
  source = "tfstack/cloudtrail/aws"

  name = local.name

  # Enable CloudTrail and create the required S3 bucket
  create_s3_bucket = true

  # Force destroy for testing - allows easy cleanup
  s3_bucket_force_destroy = true

  # Minimal S3 lifecycle: expire logs quickly to stay under free tier (5GB/month)
  s3_bucket_lifecycle_configuration = [
    {
      id     = "free-tier-expire-fast"
      status = "Enabled"
      filter = {
        prefix = "" # Or use "AWSLogs/" depending on your CloudTrail config
      }
      expiration = {
        days = 7
      }
    }
  ]

  # Disable optional features that incur cost
  create_cloudwatch_log_group = false
  create_kms_key              = false
  create_sns_topic            = false

  tags = local.tags
}

# Full-featured deployment with production-ready features
module "iam_policy_guard" {
  source = "jajera/iam-policy-guard/aws"

  # Core configuration
  name_prefix       = local.name
  sns_alert_email   = var.alert_email
  slack_webhook_url = var.slack_webhook_url

  # Production features enabled
  enable_remediation          = true
  enable_slack_alerts         = true
  enable_sns_alerts           = true
  enable_priority_alerts      = true
  enable_cloudwatch_dashboard = true
  enable_athena_table         = true

  # Enable AI-powered risk analysis
  enable_bedrock_analysis = true
  bedrock_model_id        = "anthropic.claude-3-sonnet-20240229-v1:0"

  # Lambda configuration optimized for production
  lambda_memory          = 256 # Complete functions
  remediator_memory_size = 512 # More memory for complex operations

  # Production logging retention
  log_retention_days   = 30
  force_destroy_logs   = true # Only for demo - set to false in production
  force_destroy_s3     = true # Only for demo - set to false in production
  force_destroy_athena = true # Only for demo - set to false in production

  # Use local configuration files from this example
  custom_remediator_config_file = "${path.module}/templates/remediator-config.json"

  severity_colors = {
    CRITICAL = "#FF0000"
    HIGH     = "#FF0000"
    MEDIUM   = "#FFA500"
    LOW      = "#FFFF00"
    SUCCESS  = "#2EB67D"
  }

  # Debug mode
  debug_mode = true

  # Testing
  create_tests = true

  common_tags = {
    Environment = "development"
    Purpose     = "iam-policy-guard"
    Owner       = var.owner
  }
}
