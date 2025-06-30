variable "alert_email" {
  description = "Email address to receive IAM policy violation alerts"
  type        = string
  default     = ""
}

variable "slack_webhook_url" {
  description = "Slack Webhook URL for sending notifications"
  type        = string
  default     = ""
}

variable "owner" {
  description = "Owner or team responsible for the IAM Policy Monitor"
  type        = string
  default     = "terraform"
}
