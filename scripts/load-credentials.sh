# Create a secure config file
cat << EOF > ~/.ssh/ceevee/db-config.env
export CEEVEE_DB_HOST=$(aws cloudformation describe-stacks --stack-name CeeveeDbStack --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' --output text)
export CEEVEE_DB_CREDS=$(aws secretsmanager get-secret-value --secret-id ceevee/database/credentials --query 'SecretString' --output text)
export CEEVEE_BASTION_DNS=$(aws cloudformation describe-stacks --stack-name CeeveeNetworkStack --query 'Stacks[0].Outputs[?OutputKey==`BastionHostPublicDNS`].OutputValue' --output text)
EOF

# Set secure permissions
chmod 600 ~/.ssh/ceevee/db-config.env

# Load when needed
source ~/.ssh/ceevee/db-config.env