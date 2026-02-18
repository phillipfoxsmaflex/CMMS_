# CMMS Deployment Guide für DigitalOcean Kubernetes (DOKS)

Dieses Dokument beschreibt den kompletten Deployment-Prozess für die CMMS-Anwendung auf DigitalOcean Kubernetes.

## Voraussetzungen

1. **DigitalOcean Konto** mit aktiviertem Kubernetes
2. **DOKS Cluster** (empfohlen: 4 vCPUs, 8GB RAM für Produktion)
3. **DigitalOcean Container Registry** (DOCR) für Docker-Images
4. **Domain** mit DNS-Einträgen für:
   - `app.mms.example.com` (Frontend)
   - `api.mms.example.com` (Backend API)
   - `grafana.mms.example.com` (Grafana Dashboard)
   - `minio.mms.example.com` (MinIO Object Storage)

## Schritt 1: Docker-Images bauen und pushen

### API Image bauen:
```bash
cd api
docker build -t registry.digitalocean.com/YOUR_REGISTRY/cmms-api:latest .
docker push registry.digitalocean.com/YOUR_REGISTRY/cmms-api:latest
```

### Frontend Image bauen:
```bash
cd frontend
docker build -t registry.digitalocean.com/YOUR_REGISTRY/cmms-frontend:latest .
docker push registry.digitalocean.com/YOUR_REGISTRY/cmms-frontend:latest
```

## Schritt 2: Kubernetes Cluster vorbereiten

### kubectl konfigurieren:
```bash
doctl kubernetes cluster kubeconfig save YOUR_CLUSTER_NAME
doctl auth init
```

### Namespace erstellen:
```bash
kubectl create namespace cmms
kubectl config set-context --current --namespace=cmms
```

## Schritt 3: Secrets erstellen

Erstellen Sie die Secrets mit Ihren tatsächlichen Werten (Base64-kodiert):

```bash
# Beispiel für PostgreSQL Secrets
kubectl create secret generic db-secrets \
  --from-literal=postgres-user=$(echo -n "your_db_user" | base64) \
  --from-literal=postgres-password=$(echo -n "your_db_password" | base64)

# Wiederholen Sie dies für alle anderen Secrets in secrets.yaml
```

Oder verwenden Sie die vorbereitete secrets.yaml Datei (nachdem Sie die Base64-Werte ersetzt haben):
```bash
kubectl apply -f secrets.yaml
```

## Schritt 4: Persistente Volumes erstellen

DigitalOcean Kubernetes verwendet dynamische Volume-Provisionierung mit der StorageClass `do-block-storage`:

```bash
kubectl apply -f postgres-deployment.yaml
kubectl apply -f minio-deployment.yaml
kubectl apply -f influxdb-deployment.yaml
kubectl apply -f grafana-deployment.yaml
```

## Schritt 5: Anwendungskomponenten deployen

### Datenbanken und Storage:
```bash
kubectl apply -f postgres-deployment.yaml
kubectl apply -f minio-deployment.yaml
kubectl apply -f influxdb-deployment.yaml
```

### Grafana:
```bash
kubectl apply -f grafana-configmap.yaml
kubectl apply -f grafana-deployment.yaml
```

### API und Frontend:
```bash
kubectl apply -f api-deployment.yaml
kubectl apply -f frontend-deployment.yaml
```

## Schritt 6: Ingress und Load Balancer konfigurieren

### Cert-Manager für TLS-Zertifikate installieren:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml

# ClusterIssuer für Let's Encrypt erstellen:
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: your-email@example.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Ingress deployen:
```bash
kubectl apply -f ingress.yaml
```

## Schritt 7: Deployment überprüfen

### Pods und Services überprüfen:
```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

### Logs anzeigen:
```bash
kubectl logs -f deployment/api
kubectl logs -f deployment/frontend
```

## Schritt 8: DNS konfigurieren

Richten Sie in Ihrem DNS-Provider (z.B. DigitalOcean DNS) folgende Einträge ein:

```
A-Record: app.mms.example.com -> LOAD_BALANCER_IP
A-Record: api.mms.example.com -> LOAD_BALANCER_IP
A-Record: grafana.mms.example.com -> LOAD_BALANCER_IP
A-Record: minio.mms.example.com -> LOAD_BALANCER_IP
```

Die Load Balancer IP erhalten Sie mit:
```bash
kubectl get services -n ingress-nginx
```

## Schritt 9: Skalierung und Wartung

### Skalierung:
```bash
# API auf 3 Replikate skalieren
kubectl scale deployment api --replicas=3

# Frontend auf 3 Replikate skalieren
kubectl scale deployment frontend --replicas=3
```

### Updates:
```bash
# Neue Version deployen
kubectl set image deployment/api api=registry.digitalocean.com/YOUR_REGISTRY/cmms-api:v2.0.0
kubectl set image deployment/frontend frontend=registry.digitalocean.com/YOUR_REGISTRY/cmms-frontend:v2.0.0
```

## Monitoring und Logging

### DigitalOcean Monitoring aktivieren:
1. Gehen Sie zum DigitalOcean Kubernetes Dashboard
2. Aktivieren Sie das Monitoring für Ihren Cluster
3. Konfigurieren Sie Alerts für CPU, Memory und Pod-Neustarts

### Logging:
```bash
# Logs der letzten Stunde anzeigen
kubectl logs --since=1h deployment/api

# Logs mit Filter
kubectl logs deployment/api | grep "ERROR"
```

## Backup und Recovery

### Datenbank-Backup:
```bash
# PostgreSQL Backup
kubectl exec -it postgres-pod -- pg_dump -U your_db_user -d mms > backup.sql

# MinIO Daten exportieren
kubectl cp minio-pod:/data/backup ./minio-backup/
```

### Wiederherstellung:
```bash
# PostgreSQL Wiederherstellung
cat backup.sql | kubectl exec -i postgres-pod -- psql -U your_db_user -d mms
```

## Fehlerbehebung

### Häufige Probleme:

1. **Pods starten nicht**:
   ```bash
   kubectl describe pod POD_NAME
   kubectl logs POD_NAME
   ```

2. **Datenbankverbindung fehlgeschlagen**:
   - Überprüfen Sie die Secret-Werte
   - Stellen Sie sicher, dass der PostgreSQL-Service läuft
   - Testen Sie die Verbindung:
     ```bash
     kubectl exec -it api-pod -- curl http://postgres:5432
     ```

3. **Ingress funktioniert nicht**:
   - Überprüfen Sie die Ingress-Controller-Logs
   - Stellen Sie sicher, dass die DNS-Einträge korrekt sind
   - Testen Sie mit curl:
     ```bash
     curl -v http://app.mms.example.com
     ```

## Kostenoptimierung

### Ressourcenanpassung:
```bash
# Ressourcenlimits anpassen
kubectl edit deployment api
kubectl edit deployment frontend
```

### Autoscale konfigurieren:
```bash
kubectl autoscale deployment api --cpu-percent=70 --min=2 --max=5
kubectl autoscale deployment frontend --cpu-percent=70 --min=2 --max=5
```

## Sicherheitsempfehlungen

1. **Network Policies**: Implementieren Sie Network Policies für bessere Isolation
2. **Pod Security Policies**: Aktivieren Sie PSPs für erhöhte Sicherheit
3. **Image Scanning**: Verwenden Sie DigitalOcean Container Registry Scanning
4. **Regelmäßige Updates**: Halten Sie alle Images und Kubernetes-Versionen aktuell

## Deployment Checkliste

- [ ] Docker-Images gebaut und gepusht
- [ ] Kubernetes Cluster konfiguriert
- [ ] Namespace erstellt
- [ ] Secrets konfiguriert
- [ ] Persistente Volumes erstellt
- [ ] Datenbanken und Storage deployt
- [ ] API und Frontend deployt
- [ ] Ingress und TLS konfiguriert
- [ ] DNS-Einträge erstellt
- [ ] Monitoring aktiviert
- [ ] Backup-Strategie implementiert

## Nächste Schritte

1. Testen Sie die Anwendung unter `https://app.mms.example.com`
2. Konfigurieren Sie Monitoring und Alerts
3. Richten Sie regelmäßige Backups ein
4. Implementieren Sie CI/CD für automatisierte Deployments