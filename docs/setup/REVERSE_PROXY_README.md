# Reverse Proxy Setup for Grafana Integration

## 🎯 Architecture Overview

This setup uses Nginx as a reverse proxy to serve the React frontend, Grafana dashboards, and API under the same domain, solving Firefox's third-party cookie issues when embedding Grafana dashboards in iframes.

```
┌─────────────────────────────────────────────────┐
│                 Client Browser                  │
└─────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────┐
│                 Nginx Reverse Proxy             │
│                 (Port 8080)                     │
└─────────────────────────────────────────────────┘
                            │
    ┌───────────────────────────┴───────────────────────────┐
    │                                                   │
    ▼                                                   ▼
┌─────────────────────┐                           ┌─────────────────────┐
│  React Frontend      │                           │  Grafana           │
│  (Port 3000)         │                           │  (Port 3000)       │
└─────────────────────┘                           └─────────────────────┘
                            │
                            ▼
                    ┌─────────────────────┐
                    │  API Backend        │
                    │  (Port 8080)        │
                    └─────────────────────┘
```


## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Existing MMS setup with React frontend and Grafana
- Basic understanding of Nginx configuration

### Starting the Stack

```bash
# Start all services including the reverse proxy
docker-compose up -d

# The services will be available at:
# - React Frontend: http://localhost:8080
# - Grafana: http://localhost:8080/grafana
# - API: http://localhost:12001 (direct access)
# - Grafana Direct: http://localhost:3001 (alternative access)
```


## 📋 Configuration Details

### Nginx Configuration (`nginx.conf`)

The Nginx configuration handles:
- **Root path (`/`)**: Proxies to React frontend
- **Grafana path (`/grafana/`)**: Proxies to Grafana container
- **WebSocket support**: For Grafana Live features
- **Sub-path rewriting**: Ensures Grafana assets load correctly

Key features:
- `proxy_pass http://frontend:3000` - Routes frontend requests
- `proxy_pass http://grafana:3000/` - Routes Grafana requests
- `proxy_redirect` and `sub_filter` - Fix sub-path asset loading
- WebSocket headers for Grafana Live

### Grafana Configuration

Grafana is configured to work under the `/grafana/` sub-path with automatic provisioning:

```env
GF_SERVER_ROOT_URL=%(protocol)s://%(domain)s/grafana/
GF_SERVER_SERVE_FROM_SUB_PATH=true
GF_AUTH_ANONYMOUS_ENABLED=true
GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
```

This ensures:
- Grafana generates correct URLs for assets (JS/CSS)
- Cookies are set with the correct path
- All internal links work under the sub-path
- Automatic dashboard provisioning on startup
- Environment variables for secure credentials

## 🔧 Dashboard URL Configuration

### For Asset Dashboards

When configuring dashboard URLs for assets, use the `/grafana/` sub-path:

```
# Correct format for asset dashboard URLs:
http://localhost:8080/grafana/d/your-dashboard-id

# Example with new automatic dashboards:
http://localhost:8080/grafana/d/mms-asset-health/asset-health-and-reliability?orgId=1&var-asset=123
```

### For Location Dashboards

Same format applies to location dashboards:

```
# Correct format for location dashboard URLs:
http://localhost:8080/grafana/d/your-dashboard-id

# Example with new automatic dashboards:
http://localhost:8080/grafana/d/mms-location-performance/location-based-performance?orgId=1&var-location=456
```

### For Maintenance Overview

```
# Example for maintenance performance dashboard:
http://localhost:8080/grafana/d/mms-maintenance-overview/maintenance-performance-overview?orgId=1&var-location=all
```

### For Work Order Management

```
# Example for work order management dashboard:
http://localhost:8080/grafana/d/mms-work-order-management/work-order-management?orgId=1&var-status=all&var-priority=all
```

## 🧪 Testing and Troubleshooting

### Testing the Setup

1. **Access React frontend**: `http://localhost:8080`
2. **Access Grafana directly**: `http://localhost:8080/grafana`
3. **Test iframe embedding**: Configure a dashboard URL and verify it loads in the iframe
4. **Verify automatic dashboards**: Check that all 6 dashboards are available in Grafana


### Common Issues and Solutions

#### Issue: Grafana shows blank page in iframe
**Solution:**
- Ensure the dashboard URL uses `/grafana/` prefix
- Check browser console for 404 errors on assets
- Verify Grafana's `GF_SERVER_SERVE_FROM_SUB_PATH` is set to `true`

#### Issue: CSS/JS assets not loading
**Solution:**
- Check Nginx logs: `docker logs mms_proxy`
- Ensure `sub_filter` directives are working
- Verify no mixed content warnings in browser console

#### Issue: Firefox login loop
**Solution:**
- Ensure you're using the reverse proxy URL (`/grafana/`) not direct Grafana URL
- Clear Firefox cookies for the domain
- Check that anonymous access is enabled if needed

#### Issue: WebSocket connections failing
**Solution:**
- Verify WebSocket headers in Nginx config
- Check browser console for WebSocket errors
- Ensure Grafana Live is properly configured

### Debugging Commands

```bash
# Check Nginx configuration
docker exec -it mms_proxy nginx -t

# View Nginx logs
docker logs mms_proxy

# View Grafana logs
docker logs mms_grafana

# Access Grafana container for debugging
docker exec -it mms_grafana bash
```

## 🔒 Security Considerations

### Headers and Security
The Nginx configuration includes proper security headers:
- `X-Real-IP` and `X-Forwarded-For` for proper IP tracking
- `X-Forwarded-Proto` for HTTPS detection
- WebSocket upgrade headers for Grafana Live

### Authentication
- Grafana is configured with anonymous access enabled by default
- For production, consider disabling anonymous access and implementing proper authentication
- Use environment variables for sensitive credentials

## 📝 Environment Variables

### Grafana Configuration
```env
# Grafana credentials
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=adminpassword

# Anonymous access (for development)
GF_AUTH_ANONYMOUS_ENABLED=true
GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer

# Automatic provisioning (NEU ab Version 2.0)
GF_SERVER_ROOT_URL=%(protocol)s://%(domain)s/grafana/
GF_SERVER_SERVE_FROM_SUB_PATH=true
```

**NEU:** Datenquellen-Konfiguration für automatisches Provisioning:

```env
# PostgreSQL (automatisch)
POSTGRES_USER=rootUser
POSTGRES_PWD=mypassword

# InfluxDB (automatisch)  
INFLUXDB_ADMIN_TOKEN=my-super-secret-influxdb-token-change-me
```

Alle Variablen sind in der `.env`-Datei definiert und werden automatisch verwendet!

### Proxy Configuration
The proxy uses the following ports:
- **8080**: External HTTP port (reverse proxy)
- **3000**: Internal React frontend port
- **3000**: Internal Grafana port (different container)

## 🎨 Customization

### Changing Ports
To change the external proxy port:
1. Edit `docker-compose.yml` - change `"8080:80"` to your desired port
2. Update any frontend configuration that references the port
3. Restart the stack: `docker-compose down && docker-compose up -d`

### Adding HTTPS
For production, consider adding HTTPS:
1. Add SSL certificate configuration to Nginx
2. Update the Nginx config to listen on port 443
3. Add HTTP to HTTPS redirect
4. Update Grafana's `GF_SERVER_ROOT_URL` to use `https://`

## 📚 References

- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Grafana Sub-Path Configuration](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#serve-from-sub-path)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the debug logs
3. Ensure all containers are running: `docker ps`
4. Verify network connectivity: `docker network inspect mms_network`