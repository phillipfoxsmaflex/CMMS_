#!/bin/bash
set -e

echo "Warten auf MinIO Server..."
for i in {1..30}; do
  if curl -s "http://${MINIO_ENDPOINT}:9000/minio/health/live" | grep -q "live"; then
    echo "MinIO Server ist bereit"
    break
  fi
  sleep 2
  echo "Warte... ($i/30)"
done

echo "MinIO Client konfigurieren..."
mc alias set mms "http://${MINIO_ENDPOINT}:9000" "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}"

echo "Bucket erstellen: ${MINIO_BUCKET}"
mc mb "mms/${MINIO_BUCKET}" --ignore-existing

echo "Bucket Policy setzen..."
mc anonymous set public "mms/${MINIO_BUCKET}"

echo "MinIO Setup abgeschlossen!"