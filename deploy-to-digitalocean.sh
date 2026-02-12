#!/bin/bash
# DigitalOcean App Platform Deployment Script
# This script helps prepare and deploy your application to DigitalOcean

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}DigitalOcean App Platform Deployment Helper${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo -e "${YELLOW}⚠️  doctl CLI not found.${NC}"
    echo ""
    echo "Please install doctl to continue:"
    echo ""
    echo "  macOS:   brew install doctl"
    echo "  Linux:   Visit https://docs.digitalocean.com/reference/doctl/how-to/install/"
    echo ""
    read -p "Do you want to continue without doctl? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    DOCTL_AVAILABLE=false
else
    DOCTL_AVAILABLE=true
    echo -e "${GREEN}✓ doctl CLI found${NC}"
fi

# Function to validate GitHub repo format
validate_github_repo() {
    if [[ $1 =~ ^[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

echo ""
echo -e "${BLUE}Step 1: Choose Deployment Configuration${NC}"
echo "Which app.yaml version do you want to use?"
echo ""
echo "  1) app.yaml          - Uses MinIO for object storage (development)"
echo "  2) app.yaml.spaces   - Uses DigitalOcean Spaces (recommended for production)"
echo ""
read -p "Enter choice (1 or 2): " yaml_choice

case $yaml_choice in
    1)
        APP_YAML="app.yaml"
        echo -e "${GREEN}Selected: app.yaml (MinIO)${NC}"
        ;;
    2)
        APP_YAML="app.yaml.spaces"
        echo -e "${GREEN}Selected: app.yaml.spaces (Spaces)${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

# Check if file exists
if [ ! -f "$SCRIPT_DIR/$APP_YAML" ]; then
    echo -e "${RED}Error: $APP_YAML not found in $SCRIPT_DIR${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Configure GitHub Repository${NC}"
echo ""
read -p "Enter your GitHub repository (format: username/repo): " github_repo

while ! validate_github_repo "$github_repo"; do
    echo -e "${RED}Invalid format. Use: username/repository${NC}"
    read -p "Enter your GitHub repository: " github_repo
done

echo -e "${GREEN}✓ GitHub repository: $github_repo${NC}"

echo ""
echo -e "${BLUE}Step 3: Configure Branch${NC}"
echo ""
read -p "Enter branch to deploy (default: main): " branch
branch=${branch:-main}
echo -e "${GREEN}✓ Branch: $branch${NC}"

echo ""
echo -e "${BLUE}Step 4: Configure Region${NC}"
echo ""
echo "Available regions:"
echo "  1) nyc (New York)"
echo "  2) sfo (San Francisco)"
echo "  3) ams (Amsterdam)"
echo "  4) sgp (Singapore)"
echo "  5) fra (Frankfurt)"
echo ""
read -p "Enter region choice (1-5, default: 1): " region_choice
region_choice=${region_choice:-1}

case $region_choice in
    1) region="nyc" ;;
    2) region="sfo" ;;
    3) region="ams" ;;
    4) region="sgp" ;;
    5) region="fra" ;;
    *) region="nyc" ;;
esac

echo -e "${GREEN}✓ Region: $region${NC}"

echo ""
echo -e "${BLUE}Step 5: Generate Secrets${NC}"
echo ""
read -p "Generate a random JWT secret? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    JWT_SECRET=$(generate_secret)
    echo -e "${GREEN}✓ Generated JWT secret: ${JWT_SECRET}${NC}"
    echo -e "${YELLOW}⚠️  Save this secret securely!${NC}"
else
    read -p "Enter your JWT secret: " JWT_SECRET
fi

# Create customized app.yaml
CUSTOM_YAML="$SCRIPT_DIR/app.yaml.custom"
echo ""
echo -e "${BLUE}Step 6: Creating customized app.yaml...${NC}"

# Copy and modify app.yaml
cp "$SCRIPT_DIR/$APP_YAML" "$CUSTOM_YAML"

# Update repository
sed -i.bak "s|YOUR_GITHUB_USERNAME/YOUR_REPO_NAME|$github_repo|g" "$CUSTOM_YAML"
sed -i.bak "s|branch: main|branch: $branch|g" "$CUSTOM_YAML"
sed -i.bak "s|region: nyc|region: $region|g" "$CUSTOM_YAML"
sed -i.bak "s|CHANGE_THIS_JWT_SECRET_IN_PRODUCTION|$JWT_SECRET|g" "$CUSTOM_YAML"

# Clean up backup files
rm -f "$CUSTOM_YAML.bak"

echo -e "${GREEN}✓ Created customized configuration: app.yaml.custom${NC}"

echo ""
echo -e "${BLUE}Step 7: Additional Configuration${NC}"
echo ""
echo -e "${YELLOW}⚠️  Important: You still need to update these values in app.yaml.custom:${NC}"
echo ""
echo "  - Database passwords (POSTGRES_PWD)"
echo "  - InfluxDB credentials (INFLUXDB_PASSWORD, INFLUXDB_ADMIN_TOKEN)"
echo "  - Grafana admin password (GRAFANA_ADMIN_PASSWORD)"
echo "  - Object storage credentials (if using Spaces)"
echo "  - Email configuration (if enabling notifications)"
echo "  - SSO credentials (if enabling SSO)"
echo ""

if [ "$yaml_choice" == "2" ]; then
    echo -e "${YELLOW}⚠️  For DigitalOcean Spaces, you need to:${NC}"
    echo "  1. Create a Space in DigitalOcean console"
    echo "  2. Generate Spaces access keys"
    echo "  3. Update AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in app.yaml.custom"
    echo "  4. Update space name and region"
    echo ""
fi

read -p "Press Enter to continue when ready..."

echo ""
echo -e "${BLUE}Step 8: Review Configuration${NC}"
echo ""
echo "Configuration summary:"
echo "  Repository: $github_repo"
echo "  Branch: $branch"
echo "  Region: $region"
echo "  Config file: app.yaml.custom"
echo ""

if [ "$DOCTL_AVAILABLE" = true ]; then
    echo -e "${BLUE}Step 9: Deploy to DigitalOcean${NC}"
    echo ""
    read -p "Do you want to deploy now using doctl? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Check if authenticated
        if ! doctl auth list &> /dev/null; then
            echo -e "${YELLOW}You need to authenticate with DigitalOcean first.${NC}"
            echo ""
            read -p "Authenticate now? (Y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                doctl auth init
            else
                echo -e "${YELLOW}Skipping deployment. You can deploy later with:${NC}"
                echo "  doctl apps create --spec app.yaml.custom"
                exit 0
            fi
        fi
        
        echo ""
        echo -e "${GREEN}Deploying application...${NC}"
        
        # Create the app
        if doctl apps create --spec "$CUSTOM_YAML"; then
            echo ""
            echo -e "${GREEN}================================================${NC}"
            echo -e "${GREEN}✓ Deployment initiated successfully!${NC}"
            echo -e "${GREEN}================================================${NC}"
            echo ""
            echo "Your app is being deployed. You can monitor progress in:"
            echo "  - DigitalOcean Console: https://cloud.digitalocean.com/apps"
            echo "  - CLI: doctl apps list"
            echo ""
            echo "Deployment typically takes 10-15 minutes."
        else
            echo -e "${RED}Deployment failed. Check the error messages above.${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Skipping deployment.${NC}"
        echo ""
        echo "To deploy later, run:"
        echo "  doctl apps create --spec $CUSTOM_YAML"
    fi
else
    echo -e "${BLUE}Step 9: Manual Deployment${NC}"
    echo ""
    echo "To deploy manually:"
    echo ""
    echo "  1. Go to https://cloud.digitalocean.com/apps"
    echo "  2. Click 'Create App'"
    echo "  3. Choose 'Edit Your App Spec'"
    echo "  4. Copy the contents of: $CUSTOM_YAML"
    echo "  5. Paste and review"
    echo "  6. Click 'Create Resources'"
    echo ""
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Review and edit app.yaml.custom if needed"
echo "  2. Update remaining secret values"
echo "  3. Deploy using doctl or DigitalOcean console"
echo "  4. Configure custom domain (optional)"
echo "  5. Set up monitoring and alerts"
echo ""
echo "For detailed instructions, see: DIGITALOCEAN_DEPLOYMENT.md"
echo ""
