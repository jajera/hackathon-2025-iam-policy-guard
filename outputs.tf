
output "test_commands" {
  value = <<-EOT

    #################### 🧪 TESTING COMMANDS ####################

    🟢 [1] START TEST
    aws codebuild start-build \
      --project-name "${module.iam_policy_guard.name_prefix}-iam-policy-monitor-tests" \
      --query "build.id" \
      --output text

    🟢 [2] OPEN DASHBOARD
    https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${module.iam_policy_guard.name_prefix}-dashboard

    🟢 [3] CHECK TEST STATUS
    aws codebuild batch-get-builds \
      --ids $(aws codebuild list-builds-for-project \
        --project-name "${module.iam_policy_guard.name_prefix}-iam-policy-monitor-tests" \
        --query 'ids[0]' \
        --output text)

    🟢 [4] VIEW TEST LOGS
    aws logs get-log-events \
      --log-group-name "/aws/codebuild/${module.iam_policy_guard.name_prefix}-iam-policy-monitor-tests" \
      --log-stream-name "$(aws logs describe-log-streams \
        --log-group-name "/aws/codebuild/${module.iam_policy_guard.name_prefix}-iam-policy-monitor-tests" \
        --order-by LastEventTime \
        --descending \
        --query 'logStreams[0].logStreamName' \
        --output text)"

    EOT
}
