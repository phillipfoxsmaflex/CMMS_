#!/bin/bash

set -e

echo "========================================"
echo "MMS Asset Monitoring Initialization"
echo "========================================"
echo ""

# Wait for InfluxDB to be ready
echo "Waiting for InfluxDB to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if curl -s http://localhost:8086/health | grep -q '"status":"pass"'; then
    echo "✓ InfluxDB is ready!"
    break
  fi
  attempt=$((attempt + 1))
  echo "  Attempt $attempt/$max_attempts..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "✗ InfluxDB failed to start within the expected time"
  exit 1
fi

# Wait for Grafana to be ready
echo ""
echo "Waiting for Grafana to be ready..."
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if curl -s http://localhost:3001/api/health | grep -q '"database":"ok"'; then
    echo "✓ Grafana is ready!"
    break
  fi
  attempt=$((attempt + 1))
  echo "  Attempt $attempt/$max_attempts..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "✗ Grafana failed to start within the expected time"
  exit 1
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Services are running:"
echo "  - InfluxDB UI: http://localhost:8086"
echo "  - Grafana UI:  http://localhost:3001"
echo "  - MMS Backend: http://localhost:12001"
echo "  - MMS Frontend: http://localhost:12000"
echo ""
echo "Default credentials are set in your .env file."
echo "Please change them for production use!"
echo ""
