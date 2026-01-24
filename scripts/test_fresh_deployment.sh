#!/bin/bash

echo "========================================"
echo "Fresh Deployment Test Script"
echo "========================================"
echo ""

# Step 1: Run cleanup
./cleanup.sh

echo "Cleanup completed. Starting fresh deployment..."
echo ""

# Step 2: Build and start containers
echo "Building and starting containers..."
docker-compose build --no-cache
docker-compose up -d

echo "Containers started. Waiting for services to initialize..."
echo ""

# Step 3: Wait for database to be ready
echo "Waiting for database to be ready..."
MAX_ATTEMPTS=60
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
echo "Database ready. Running pre-migration check..."
./pre_migration_check.sh

echo ""
echo "Monitoring backend startup..."
docker logs mms-backend --follow --tail 50 &

# Wait for backend to be healthy
BACKEND_READY=false
START_TIME=$(date +%s)
TIMEOUT=300  # 5 minutes timeout

while [ $(( $(date +%s) - START_TIME )) -lt $TIMEOUT ]; do
    if curl -s http://localhost:12001/actuator/health > /dev/null 2>&1; then
        BACKEND_READY=true
        break
    fi
    sleep 5
done

if [ "$BACKEND_READY" = true ]; then
    echo "✓ Backend is healthy and ready!"
    echo ""
    echo "Testing registration endpoint..."
    
    # Test registration
    REGISTRATION_TEST=$(curl -X POST http://localhost:12001/auth/signup \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User","phone":"1234567890"}' \
        -s -w "%{http_code}")
    
    if echo "$REGISTRATION_TEST" | grep -q "200"; then
        echo "✓ Registration endpoint working correctly"
        echo ""
        echo "========================================"
        echo "🎉 Fresh Deployment Test PASSED!"
        echo "========================================"
        exit 0
    else
        echo "❌ Registration endpoint failed"
        echo "Response: $REGISTRATION_TEST"
        exit 1
    fi
else
    echo "❌ Backend did not become healthy in time"
    exit 1
fi