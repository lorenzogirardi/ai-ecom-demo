# TFLint Configuration
# https://github.com/terraform-linters/tflint

# Required TFLint version
tflint {
  required_version = ">= 0.50"
}

# AWS Plugin
plugin "aws" {
  enabled = true
  version = "0.31.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

# Terraform Plugin (built-in rules)
plugin "terraform" {
  enabled = true
  preset  = "recommended"
}

# ============================================
# AWS Rules
# ============================================

# Naming conventions
rule "aws_resource_missing_tags" {
  enabled = true
  tags    = ["Environment", "Project", "ManagedBy"]
}

# Instance types validation
rule "aws_instance_invalid_type" {
  enabled = true
}

# Security group rules
rule "aws_security_group_invalid_protocol" {
  enabled = true
}

# ============================================
# Terraform Rules
# ============================================

# Enforce snake_case naming
rule "terraform_naming_convention" {
  enabled = true
  format  = "snake_case"
}

# Require descriptions for variables
rule "terraform_documented_variables" {
  enabled = true
}

# Require descriptions for outputs
rule "terraform_documented_outputs" {
  enabled = true
}

# Standard module structure
rule "terraform_standard_module_structure" {
  enabled = true
}

# Unused declarations
rule "terraform_unused_declarations" {
  enabled = true
}

# Required version constraint
rule "terraform_required_version" {
  enabled = true
}

# Required providers
rule "terraform_required_providers" {
  enabled = true
}

# ============================================
# Disabled Rules (for demo environment)
# ============================================

# Allow deprecated syntax (some modules may use older patterns)
rule "terraform_deprecated_interpolation" {
  enabled = false
}

# Comment format (relaxed for demo)
rule "terraform_comment_syntax" {
  enabled = false
}
