#!/bin/bash
set -e

echo "Warten auf Grafana Server..."
for i in {1..30}; do
  if curl -s "http://${GRAFANA_ENDPOINT}/api/health" | grep -q '"database":"ok"'; then
    echo "Grafana Server ist bereit"
    break
  fi
  sleep 2
  echo "Warte... ($i/30)"
done

echo "Warten auf InfluxDB..."
for i in {1..30}; do
  if curl -s "http://${INFLUXDB_ENDPOINT}:8086/health" | grep -q '"status":"pass"'; then
    echo "InfluxDB ist bereit"
    break
  fi
  sleep 2
  echo "Warte... ($i/30)"
done

echo "InfluxDB Datenquelle in Grafana erstellen..."
INFLUXDB_DATASOURCE='{
  "name": "InfluxDB",
  "type": "influxdb",
  "access": "proxy",
  "url": "http://'${INFLUXDB_ENDPOINT}':8086",
  "basicAuth": false,
  "isDefault": true,
  "jsonData": {
    "version": "Flux",
    "organization": "mms",
    "defaultBucket": "assets",
    "tlsSkipVerify": true
  },
  "secureJsonData": {
    "token": "'${INFLUXDB_TOKEN}'"
  }
}'

curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n ${GRAFANA_ADMIN_USER}:${GRAFANA_ADMIN_PASSWORD} | base64)" \
  -d "${INFLUXDB_DATASOURCE}" \
  "http://${GRAFANA_ENDPOINT}/api/datasources"

echo "PostgreSQL Datenquelle in Grafana erstellen..."
POSTGRES_DATASOURCE='{
  "name": "PostgreSQL",
  "type": "postgres",
  "url": "'${POSTGRES_HOST}':5432",
  "database": "mms",
  "user": "'${POSTGRES_USER}'",
  "secureJsonData": {
    "password": "'${POSTGRES_PASSWORD}'"
  },
  "jsonData": {
    "sslmode": "disable",
    "postgresVersion": 1200,
    "timescaledb": false
  }
}'

curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n ${GRAFANA_ADMIN_USER}:${GRAFANA_ADMIN_PASSWORD} | base64)" \
  -d "${POSTGRES_DATASOURCE}" \
  "http://${GRAFANA_ENDPOINT}/api/datasources"

echo "Grafana Setup abgeschlossen!"