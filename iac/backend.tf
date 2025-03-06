terraform {
  backend "gcs" {
    bucket = "ceevee-terraform-state"
    prefix = "terraform/state/dev"
  }
}
