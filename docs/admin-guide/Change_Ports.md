# 🔌 Portkonfiguration & Netzwerkeinstellungen - Administrationshandbuch

## 📋 Inhaltsverzeichnis

- [Einführung](#-einführung)
- [Standard-Portbelegung](#-standard-portbelegung)
- [Portkonfiguration](#-portkonfiguration)
- [Docker-Port-Mapping](#-docker-port-mapping)
- [Firewall-Konfiguration](#-firewall-konfiguration)
- [Reverse Proxy Einrichtung](#-reverse-proxy-einrichtung)
- [SSL/TLS Konfiguration](#-ssltls-konfiguration)
- [Netzwerkoptimierung](#-netzwerkoptimierung)
- [Fehlerbehebung](#-fehlerbehebung)

---

## 🎯 Einführung

Dieses Handbuch beschreibt die Konfiguration der Netzwerkports und Netzwerkeinstellungen für das MMS-System. Eine korrekte Portkonfiguration ist essenziell für die Systemverfügbarkeit und Sicherheit.

### Zielsetzung

- **Verfügbarkeit**: Optimale Portkonfiguration
- **Sicherheit**: Schutz vor unerlaubtem Zugriff
- **Performance**: Netzwerkoptimierung
- **Integration**: Anbindung an bestehende Infrastruktur
- **Skalierbarkeit**: Vorbereitung für Wachstum

### Netzwerkarchitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    MMS Netzwerkarchitektur                   │
├─────────────────────────────────────────────────────────────┤
│  Internet  │  Firewall  │  Reverse Proxy  │  MMS Services    │
├─────────────────────────────────────────────────────────────┤
│  HTTPS:443 → Firewall:443 → Proxy:443 → MMS:8080             │
│  HTTP:80   → Firewall:80  → Proxy:80  → MMS:8080             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Interne Dienste                          │
├─────────────────────────────────────────────────────────────┤
│  • API:12001        • Frontend:3000                         │
│  • PostgreSQL:5432  • Grafana:3001                          │
│  • MinIO:9000       • InfluxDB:8086                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔢 Standard-Portbelegung

### Externe Ports

| Dienst | Port | Protokoll | Beschreibung |
|--------|------|-----------|--------------|
| **Web-Oberfläche** | 80 | HTTP | Standard Webzugriff |
| **Web-Oberfläche** | 443 | HTTPS | Sichere Webzugriff |
| **API** | 12001 | HTTP/HTTPS | REST-API Schnittstelle |
| **Grafana** | 3001 | HTTP/HTTPS | Dashboard-Zugriff |

### Interne Ports

| Dienst | Port | Protokoll | Beschreibung |
|--------|------|-----------|--------------|
| **PostgreSQL** | 5432 | TCP | Datenbankverbindung |
| **MinIO** | 9000 | HTTP | Objektspeicher |
| **InfluxDB** | 8086 | HTTP | Zeitreihendatenbank |
| **Frontend** | 3000 | HTTP | React-Anwendung |
| **API** | 8080 | HTTP | Spring Boot API |

---

## 🔧 Portkonfiguration

### Ports in docker-compose.yml

1. **Navigation**: Projektverzeichnis

2. **docker-compose.yml bearbeiten**:
   ```bash
   nano docker-compose.yml
   ```

3. **Port-Mapping anpassen**:
   ```yaml
   services:
     api:
       ports:
         - "12001:8080"  # Host:Container
     
     frontend:
       ports:
         - "3000:3000"  # Host:Container
     
     grafana:
       ports:
         - "3001:3000"  # Host:Container
     
     postgres:
       ports:
         - "5432:5432"  # Host:Container
     
     minio:
       ports:
         - "9000:9000"  # Host:Container
     
     influxdb:
       ports:
         - "8086:8086"  # Host:Container
   ```

4. **System neu starten**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Ports in Umgebungsvariablen

1. **Navigation**: Projektverzeichnis

2. **.env bearbeiten**:
   ```bash
   nano .env
   ```

3. **Port-Konfiguration**:
   ```env
   # API Port
   API_PORT=12001
   
   # Frontend Port
   FRONTEND_PORT=3000
   
   # Grafana Port
   GRAFANA_PORT=3001
   
   # Datenbank Ports
   POSTGRES_PORT=5432
   INFLUXDB_PORT=8086
   MINIO_PORT=9000
   ```

---

## 🐳 Docker-Port-Mapping

### Port-Mapping verstehen

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Port-Mapping                       │
├─────────────────────────────────────────────────────────────┤
│  Host-Port:Container-Port                                    │
│  Beispiel: 12001:8080                                        │
│                                                             │
│  • Host-Port: Port auf dem Host-System (z.B. Server)        │
│  • Container-Port: Port im Docker-Container                 │
│  • Format: HOST_PORT:CONTAINER_PORT                          │
└─────────────────────────────────────────────────────────────┘
```

### Port-Konflikte vermeiden

1. **Ports prüfen**:
   ```bash
   # Alle verwendeten Ports anzeigen
   netstat -tuln
   
   # Spezifischen Port prüfen
   lsof -i :12001
   ```

2. **Port freigeben**:
   ```bash
   # Prozess identifizieren
   sudo lsof -i :12001
   
   # Prozess beenden
   sudo kill -9 <PID>
   ```

3. **Alternative Ports**:
   ```yaml
   # Beispiel: Alternative Ports
   api:
     ports:
       - "12002:8080"  # Alternativer Host-Port
   ```

---

## 🔥 Firewall-Konfiguration

### Firewall-Regeln (UFW)

1. **Firewall aktivieren**:
   ```bash
   sudo ufw enable
   ```

2. **Ports freigeben**:
   ```bash
   # Standard-Ports
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 12001/tcp
   sudo ufw allow 3001/tcp
   
   # SSH (falls benötigt)
   sudo ufw allow 22/tcp
   ```

3. **Spezifische IP-Adressen**:
   ```bash
   # Nur bestimmte IPs erlauben
   sudo ufw allow from 192.168.1.100 to any port 12001
   ```

4. **Firewall-Status prüfen**:
   ```bash
   sudo ufw status verbose
   ```

### Firewall-Regeln (iptables)

1. **Ports freigeben**:
   ```bash
   # HTTP
   sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
   
   # HTTPS
   sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
   
   # MMS API
   sudo iptables -A INPUT -p tcp --dport 12001 -j ACCEPT
   
   # Grafana
   sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
   ```

2. **Regeln speichern**:
   ```bash
   sudo iptables-save > /etc/iptables.rules
   ```

---

## 🔄 Reverse Proxy Einrichtung

### Nginx-Konfiguration

1. **Konfigurationsdatei erstellen**:
   ```bash
   sudo nano /etc/nginx/sites-available/mms.conf
   ```

2. **Konfiguration**:
   ```nginx
   server {
       listen 80;
       server_name mms.example.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       location /api/ {
           proxy_pass http://localhost:12001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       location /grafana/ {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Konfiguration aktivieren**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/mms.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Apache-Konfiguration

1. **Konfigurationsdatei erstellen**:
   ```bash
   sudo nano /etc/apache2/sites-available/mms.conf
   ```

2. **Konfiguration**:
   ```apache
   <VirtualHost *:80>
       ServerName mms.example.com
       
       ProxyPreserveHost On
       ProxyRequests Off
       
       ProxyPass / http://localhost:3000/
       ProxyPassReverse / http://localhost:3000/
       
       ProxyPass /api/ http://localhost:12001/
       ProxyPassReverse /api/ http://localhost:12001/
       
       ProxyPass /grafana/ http://localhost:3001/
       ProxyPassReverse /grafana/ http://localhost:3001/
   </VirtualHost>
   ```

3. **Module aktivieren**:
   ```bash
   sudo a2enmod proxy
   sudo a2enmod proxy_http
   sudo a2ensite mms.conf
   sudo systemctl restart apache2
   ```

---

## 🔒 SSL/TLS Konfiguration

### SSL-Zertifikate mit Let's Encrypt

1. **Certbot installieren**:
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Zertifikat anfordern**:
   ```bash
   sudo certbot --nginx -d mms.example.com
   ```

3. **Automatische Verlängerung**:
   ```bash
   sudo certbot renew --dry-run
   ```

### Manuelle SSL-Konfiguration

1. **Zertifikate erstellen**:
   ```bash
   sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout /etc/ssl/private/mms.key \
     -out /etc/ssl/certs/mms.crt
   ```

2. **Nginx SSL-Konfiguration**:
   ```nginx
   server {
       listen 443 ssl;
       server_name mms.example.com;
       
       ssl_certificate /etc/ssl/certs/mms.crt;
       ssl_certificate_key /etc/ssl/private/mms.key;
       
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       
       location / {
           proxy_pass http://localhost:3000;
           # ... weitere Proxy-Einstellungen
       }
   }
   ```

---

## 🚀 Netzwerkoptimierung

### Performance-Optimierung

1. **Keepalive aktivieren**:
   ```nginx
   keepalive_timeout 75s;
   keepalive_requests 100;
   ```

2. **Caching aktivieren**:
   ```nginx
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=mms_cache:10m inactive=60m;
   
   server {
       location / {
           proxy_cache mms_cache;
           proxy_cache_key "$scheme$request_method$host$request_uri";
           proxy_cache_valid 200 301 302 10m;
           proxy_cache_valid 404 1m;
       }
   }
   ```

3. **Kompression aktivieren**:
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   gzip_min_length 1000;
   gzip_comp_level 6;
   ```

### Lastverteilung

1. **Load Balancer Konfiguration**:
   ```nginx
   upstream mms_backend {
       server localhost:3000;
       server localhost:3001 backup;
   }
   
   server {
       location / {
           proxy_pass http://mms_backend;
       }
   }
   ```

2. **Health Checks**:
   ```nginx
   location /health {
       proxy_pass http://localhost:12001/health;
       proxy_set_header Host $host;
   }
   ```

---

## 🔧 Fehlerbehebung

### Häufige Probleme

#### Port bereits belegt

**Ursache**: Andere Anwendung nutzt den Port

**Lösung**:
1. Port prüfen: `netstat -tuln | grep 12001`
2. Prozess identifizieren: `lsof -i :12001`
3. Prozess beenden: `kill -9 <PID>`
4. Alternativen Port wählen

#### Verbindung abgelehnt

**Ursache**: Firewall, falsche Portkonfiguration

**Lösung**:
1. Firewall prüfen: `sudo ufw status`
2. Port-Mapping prüfen: `docker ps`
3. Container-Logs prüfen: `docker logs mms-api-1`
4. Netzwerkverbindung testen: `telnet localhost 12001`

#### Zeitüberschreitung

**Ursache**: Netzwerkprobleme, Überlastung

**Lösung**:
1. Netzwerkverbindung prüfen: `ping localhost`
2. Systemlast prüfen: `top`
3. Proxy-Einstellungen prüfen
4. Timeout erhöhen: `proxy_read_timeout 300;`

#### SSL-Fehler

**Ursache**: Ungültiges Zertifikat, falsche Konfiguration

**Lösung**:
1. Zertifikat prüfen: `openssl x509 -in /etc/ssl/certs/mms.crt -text -noout`
2. Zertifikat erneuern: `sudo certbot renew`
3. Nginx-Konfiguration prüfen
4. Browser-Cache leeren

### Support kontaktieren

1. **Navigation**: **Hilfe** → **Support**

2. **Support-Ticket erstellen**:
   - Problem beschreiben
   - Port-Konfiguration anhängen
   - Firewall-Logs bereithalten
   - Netzwerkdiagnose angeben

3. **Priorität festlegen**:
   - Niedrig: Port-Konfiguration
   - Mittel: Verbindungsprobleme
   - Hoch: Systemausfall
   - Kritisch: Sicherheitsvorfall

---

**Vielen Dank für die Nutzung dieses Administrationshandbuchs!** 🎉

Für weitere Fragen oder Unterstützung wenden Sie sich bitte an unser Support-Team.

<div align="center">
  <p>Mit ❤️ vom MMS-Team erstellt</p>
  <p>⭐ Bewerten Sie dieses Handbuch, wenn es Ihnen geholfen hat!</p>
</div>