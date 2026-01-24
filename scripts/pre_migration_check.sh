#!/bin/bash

echo "========================================"
echo "Pre-Migration Database Check"
echo "========================================"
echo ""

# Function to check if a table exists in PostgreSQL
table_exists() {
    local table_name="safety_instruction"
    
    echo "Checking if table '$table_name' exists..."
    
    # Try to connect to the database and check for the table
    if docker exec mms_db bash -c "psql -U \$POSTGRES_USER -d mms -c \"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table_name');\"" | grep -q "t"; then
        echo "⚠ Table '$table_name' already exists!"
        return 0
    else
        echo "✓ Table '$table_name' does not exist - safe to run migrations"
        return 1
    fi
}

# Wait for database to be ready
echo "Waiting for database to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if docker exec mms_db pg_isready -U \$POSTGRES_USER -d mms; then
        echo "✓ Database is ready"
        break
    else
        echo "Waiting for database... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
        sleep 2
        ATTEMPT=$((ATTEMPT + 1))
    fi
done

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
    echo "❌ Database did not become ready in time"
    exit 1
fi
echo ""

# Check if the problematic table exists
if table_exists; then
    echo ""
    echo "⚠ WARNING: Database table already exists!"
    echo "This could cause migration conflicts."
    echo ""
    echo "Options:"
    echo "1. Continue anyway (may cause errors)"
    echo "2. Clean database and restart (recommended)"
    echo ""
    read -p "Enter choice (1/2): " choice
    
    case $choice in
        1)
            echo "Continuing with migrations..."
            exit 0
            ;;
        2)
            echo "Cleaning database and restarting containers..."
            docker stop mms-backend mms-frontend
            docker exec mms_db bash -c "psql -U \$POSTGRES_USER -d mms -c 'DROP TABLE IF EXISTS safety_instruction CASCADE;'"
            docker exec mms_db bash -c "psql -U \$POSTGRES_USER -d mms -c 'DELETE FROM databasechangelog WHERE id = \"2026_01_15_1736900000_create_safety_instruction_table\";'"
            docker start mms-backend mms-frontend
            exit 1  # Restart the migration process
            ;;
        *)
            echo "Invalid choice, continuing..."
            exit 0
            ;;
    esac
else
    echo "✓ Database is ready for migrations"
    exit 0
fi