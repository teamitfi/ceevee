#!/bin/bash

# Set variables
SSH_DIR="$HOME/.ssh/ceevee"
KEY_FILE="$SSH_DIR/ceevee-bastion-key.pem"
STACK_NAME="CeeveeNetworkStack"
SECRET_ID="ceevee/bastion/ssh-key"

# Create SSH directory if it doesn't exist
mkdir -p "$SSH_DIR"

# Get the key from Secrets Manager and save it
echo "Retrieving SSH key from Secrets Manager..."
aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ID" \
  --query 'SecretString' \
  --output text > "$KEY_FILE"

# Set correct permissions
chmod 400 "$KEY_FILE"

# Get bastion DNS
echo "Getting bastion host DNS..."
BASTION_DNS=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs[?OutputKey==`BastionHostPublicDNS`].OutputValue' \
  --output text)

# Create SSH config entry
echo "Configuring SSH..."
if ! grep -q "Host ceevee-bastion" ~/.ssh/config 2>/dev/null; then
  cat << EOF >> ~/.ssh/config

# Ceevee Bastion Host
Host ceevee-bastion
    HostName ${BASTION_DNS}
    User ec2-user
    IdentityFile ${KEY_FILE}
    StrictHostKeyChecking accept-new

EOF
else
  echo "SSH config entry already exists"
fi

echo "Setup complete! You can now connect using: ssh ceevee-bastion"