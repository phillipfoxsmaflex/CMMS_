#!/bin/bash

echo "========================================"
echo "Complete System Cleanup Script"
echo "========================================"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run cleanup with confirmation
run_cleanup() {
    local name="$1"
    local command="$2"
    
    echo "Cleaning $name..."
    if eval "$command"; then
        echo "✓ $name cleanup completed"
    else
        echo "⚠ $name cleanup failed (may not be installed or already clean)"
    fi
    echo ""
}

# Stop all running containers
echo "Stopping all running Docker containers..."
docker stop $(docker ps -aq) 2>/dev/null || true
echo "✓ All containers stopped"
echo ""

# Remove all Docker containers, networks, images, and volumes
echo "Removing all Docker containers, networks, images, and volumes..."
docker system prune -a --volumes --force
echo "✓ Docker system prune completed"
echo ""

# Remove specific MMS volumes to ensure clean database state
echo "Removing MMS-specific volumes for clean database state..."
docker volume rm mms_postgres_data 2>/dev/null || true
docker volume rm mms_minio_data 2>/dev/null || true
docker volume rm mms_influxdb_data 2>/dev/null || true
docker volume rm mms_influxdb_config 2>/dev/null || true
docker volume rm mms_grafana_data 2>/dev/null || true
echo "✓ MMS-specific volumes removed"
echo ""

# Clean Docker build cache
echo "Cleaning Docker build cache..."
docker builder prune --all --force
echo "✓ Docker build cache cleaned"
echo ""

# Remove all Docker images
echo "Removing all Docker images..."
docker rmi -f $(docker images -aq) 2>/dev/null || true
echo "✓ All Docker images removed"
echo ""

# Clean Maven cache
echo "Cleaning Maven cache..."
if [ -d "$HOME/.m2/repository" ]; then
    rm -rf "$HOME/.m2/repository"
    echo "✓ Maven cache removed"
else
    echo "⚠ Maven cache not found"
fi
echo ""

# Clean npm cache
echo "Cleaning npm cache..."
if command_exists npm; then
    npm cache clean --force
    echo "✓ npm cache cleaned"
else
    echo "⚠ npm not found"
fi
echo ""

# Clean Yarn cache
echo "Cleaning Yarn cache..."
if command_exists yarn; then
    yarn cache clean
    echo "✓ Yarn cache cleaned"
else
    echo "⚠ Yarn not found"
fi
echo ""

# Clean Gradle cache
echo "Cleaning Gradle cache..."
if [ -d "$HOME/.gradle" ]; then
    rm -rf "$HOME/.gradle"
    echo "✓ Gradle cache removed"
else
    echo "⚠ Gradle cache not found"
fi
echo ""

# Clean Java temporary files
echo "Cleaning Java temporary files..."
find /tmp -name "hsperfdata_*" -delete 2>/dev/null || true
echo "✓ Java temporary files cleaned"
echo ""

# Clean system temporary files
echo "Cleaning system temporary files..."
rm -rf /tmp/*
echo "✓ System temporary files cleaned"
echo ""

# Clean project-specific build files
echo "Cleaning project build files..."
cd /root/mms
if [ -d "api/target" ]; then
    rm -rf api/target
    echo "✓ Maven target directory removed"
fi

if [ -d "frontend/node_modules" ]; then
    rm -rf frontend/node_modules
    echo "✓ Node modules removed"
fi

if [ -f "frontend/package-lock.json" ]; then
    rm -f frontend/package-lock.json
    echo "✓ Package lock file removed"
fi

if [ -d "frontend/dist" ]; then
    rm -rf frontend/dist
    echo "✓ Frontend build directory removed"
fi

if [ -d "frontend/.next" ]; then
    rm -rf frontend/.next
    echo "✓ Next.js build directory removed"
fi

echo "✓ Project build files cleaned"
echo ""

# Clean IDE caches
echo "Cleaning IDE caches..."
if [ -d "$HOME/.IntelliJIdea*" ]; then
    rm -rf "$HOME/.IntelliJIdea*"
    echo "✓ IntelliJ cache removed"
fi

if [ -d "$HOME/.vscode" ]; then
    rm -rf "$HOME/.vscode"
    echo "✓ VSCode cache removed"
fi

echo "✓ IDE caches cleaned"
echo ""

# Clean system caches
echo "Cleaning system caches..."
if command_exists sudo; then
    sudo purge 2>/dev/null || true  # macOS specific
    sudo rm -rf /var/tmp/*
    echo "✓ System caches cleaned"
else
    echo "⚠ Cannot clean system caches without sudo"
fi
echo ""

echo "========================================"
echo "System Cleanup Complete!"
echo "========================================"
echo ""
echo "All caches have been cleared:"
echo "✓ Docker containers, images, networks, volumes"
echo "✓ Docker build cache"
echo "✓ Maven cache (.m2/repository)"
echo "✓ npm cache"
echo "✓ Yarn cache"
echo "✓ Gradle cache"
echo "✓ Java temporary files"
echo "✓ System temporary files"
echo "✓ Project build files"
echo "✓ IDE caches"
echo "✓ System caches"
echo ""
echo "The system is now ready for a clean build."
echo "Run: docker-compose build --no-cache && docker-compose up -d"
echo ""