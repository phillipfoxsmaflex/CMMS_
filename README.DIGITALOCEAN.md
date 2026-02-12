# DigitalOcean App Platform Deployment Files

This directory contains everything you need to deploy your MMS application to DigitalOcean's App Platform.

## 📁 Files Overview

| File | Purpose |
|------|---------|
| **app.yaml** | Deployment config with MinIO (for development) |
| **app.yaml.spaces** | Deployment config with DigitalOcean Spaces (for production) |
| **deploy-to-digitalocean.sh** | Interactive deployment helper script |
| **DIGITALOCEAN_DEPLOYMENT.md** | Comprehensive deployment guide |
| **DEPLOYMENT_OPTIONS.md** | Comparison between MinIO and Spaces options |
| **README.DIGITALOCEAN.md** | This file - quick start guide |

## 🚀 Quick Start

### 1️⃣ Choose Your Deployment Type

**For Development/Testing:**
```bash
Use: app.yaml (with MinIO)
Cost: ~$42/month
Risk: Data may not persist
```

**For Production:**
```bash
Use: app.yaml.spaces (with DigitalOcean Spaces)
Cost: ~$85-100/month
Risk: Minimal, data persists reliably
```

Not sure which to choose? Read [DEPLOYMENT_OPTIONS.md](DEPLOYMENT_OPTIONS.md)

### 2️⃣ Run the Deployment Script

```bash
./deploy-to-digitalocean.sh
```

The script will:
- ✅ Guide you through configuration choices
- ✅ Update GitHub repository references
- ✅ Configure your region
- ✅ Generate secure secrets
- ✅ Create a customized app.yaml
- ✅ Deploy to DigitalOcean (optional)

### 3️⃣ Complete Setup

After deployment:
1. Wait 10-15 minutes for deployment to complete
2. Access your application at the provided URL
3. Configure custom domain (optional)
4. Set up monitoring and alerts
5. Update remaining environment variables

## 📖 Documentation

### Getting Started
1. **Start here**: [Quick Start](#quick-start) (above)
2. **Choose deployment**: [DEPLOYMENT_OPTIONS.md](DEPLOYMENT_OPTIONS.md)
3. **Full guide**: [DIGITALOCEAN_DEPLOYMENT.md](DIGITALOCEAN_DEPLOYMENT.md)

### Key Sections in Deployment Guide
- Prerequisites checklist
- Step-by-step deployment instructions
- Environment variable configuration
- DigitalOcean Spaces setup
- Troubleshooting common issues
- Cost estimation
- Post-deployment tasks

## ⚙️ Manual Deployment (Without Script)

If you prefer manual deployment:

1. **Edit app.yaml**:
   ```bash
   # Choose your version
   cp app.yaml.spaces app.yaml.custom
   # OR
   cp app.yaml app.yaml.custom
   
   # Edit with your details
   nano app.yaml.custom
   ```

2. **Update these values**:
   - GitHub repository: `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME`
   - Branch: typically `main`
   - Region: `nyc`, `sfo`, `ams`, `sgp`, or `fra`
   - All SECRET environment variables

3. **Deploy using doctl**:
   ```bash
   doctl apps create --spec app.yaml.custom
   ```

4. **Or deploy via DigitalOcean Console**:
   - Go to: https://cloud.digitalocean.com/apps
   - Create App → Edit Your App Spec
   - Paste contents of app.yaml.custom
   - Review and Create

## 🔑 Required Configuration

Before deploying, you MUST configure:

### Essential (All Deployments)
- ✅ GitHub repository reference
- ✅ JWT_SECRET_KEY (generate random 32+ char string)
- ✅ Database passwords
- ✅ InfluxDB credentials
- ✅ Grafana admin password

### For app.yaml.spaces (Production)
- ✅ Create DigitalOcean Space
- ✅ Generate Spaces access keys
- ✅ Update AWS_ACCESS_KEY_ID
- ✅ Update AWS_SECRET_ACCESS_KEY
- ✅ Update Space name and region

### Optional (As Needed)
- ⚪ Email configuration (SMTP)
- ⚪ SSO configuration (OAuth2)
- ⚪ FastSpring payment processing
- ⚪ Google Analytics
- ⚪ Custom branding

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│         DigitalOcean App Platform                   │
│                                                      │
│  ┌──────────────┐      ┌──────────────┐            │
│  │   Frontend   │◄─────┤      API     │            │
│  │  (React +    │      │ (Spring Boot)│            │
│  │   Nginx)     │      └──────┬───────┘            │
│  └──────────────┘             │                     │
│         │                     │                     │
│         │              ┌──────▼───────┐             │
│         │              │  PostgreSQL  │             │
│         │              │  (Managed)   │             │
│         │              └──────────────┘             │
│         │                                           │
│  ┌──────▼───────┐      ┌──────────────┐            │
│  │   Grafana    │◄─────┤   InfluxDB   │            │
│  │ (Dashboards) │      │ (Time-series)│            │
│  └──────────────┘      └──────────────┘            │
│                                                      │
└─────────────────────────────────────────────────────┘
           │                          │
           │                          │
    ┌──────▼──────┐          ┌────────▼─────────┐
    │   MinIO     │    OR    │ DigitalOcean     │
    │ (Container) │          │     Spaces       │
    │             │          │  (Recommended)   │
    └─────────────┘          └──────────────────┘
```

## 🔧 Customization

### Adjusting Resources

Edit instance sizes in app.yaml:
```yaml
instance_size_slug: basic-xxs  # Options:
# basic-xxs  - $5/mo  - 512 MB RAM
# basic-xs   - $10/mo - 1 GB RAM
# basic-s    - $20/mo - 2 GB RAM
# basic-m    - $40/mo - 4 GB RAM
```

### Scaling Services

Add auto-scaling:
```yaml
instance_count: 1
autoscaling:
  min_instance_count: 1
  max_instance_count: 3
  metrics:
    cpu:
      percent: 80
```

### Adding Services

Add new services to `services:` array in app.yaml.

## 🐛 Troubleshooting

### Common Issues

**Build Fails**
- Check Build Logs in DigitalOcean console
- Verify Dockerfile paths are correct
- Ensure all dependencies are in repository

**Service Won't Start**
- Check Runtime Logs
- Verify environment variables are set
- Check health check paths

**Database Connection Errors**
- Ensure database is running
- Verify connection string format
- Check credentials

**File Upload Fails**
- For MinIO: Check if container has storage quota
- For Spaces: Verify access keys and permissions
- Check CORS configuration

See [DIGITALOCEAN_DEPLOYMENT.md](DIGITALOCEAN_DEPLOYMENT.md) for detailed troubleshooting.

## 💰 Cost Breakdown

### Minimum (Development)
```
Frontend:     $5/mo   (basic-xxs)
API:         $10/mo   (basic-xs)
InfluxDB:    $10/mo   (basic-xs)
Grafana:      $5/mo   (basic-xxs)
MinIO:        $5/mo   (basic-xxs)
PostgreSQL:   $7/mo   (dev)
────────────────────────────────
Total:       $42/mo
```

### Production (Recommended)
```
Frontend:    $10/mo   (basic-xs)
API:         $20/mo   (basic-s)
InfluxDB:    $20/mo   (basic-s)
Grafana:     $10/mo   (basic-xs)
PostgreSQL:  $15/mo   (production)
Spaces:       $5/mo   (base + usage)
────────────────────────────────
Total:    $80-100/mo
```

## 📚 Additional Resources

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [App Spec Reference](https://docs.digitalocean.com/products/app-platform/reference/app-spec/)
- [doctl CLI Reference](https://docs.digitalocean.com/reference/doctl/)
- [DigitalOcean Spaces Guide](https://docs.digitalocean.com/products/spaces/)

## 🆘 Getting Help

1. Check [DIGITALOCEAN_DEPLOYMENT.md](DIGITALOCEAN_DEPLOYMENT.md) troubleshooting section
2. Review DigitalOcean App Platform logs
3. Check [DigitalOcean Community](https://www.digitalocean.com/community)
4. Contact DigitalOcean support (24/7 for paid accounts)

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All secrets updated with strong values
- [ ] GitHub repository is correct
- [ ] Branch is set correctly
- [ ] Region chosen (closest to users)
- [ ] Database set to production mode
- [ ] Using Spaces (not MinIO) for production
- [ ] Resource sizes appropriate for traffic
- [ ] Environment variables reviewed
- [ ] CORS configured if needed
- [ ] Custom domain ready (optional)
- [ ] Monitoring plan in place
- [ ] Backup strategy defined
- [ ] Team has access to console
- [ ] Budget approved

## 🎯 Next Steps

After successful deployment:

1. ✅ Verify all services are running
2. ✅ Test the application thoroughly
3. ✅ Configure custom domain
4. ✅ Set up SSL/HTTPS (automatic with App Platform)
5. ✅ Configure monitoring and alerts
6. ✅ Set up regular database backups
7. ✅ Document your deployment configuration
8. ✅ Train team on DigitalOcean console
9. ✅ Plan for scaling and updates
10. ✅ Monitor costs and optimize

---

## 🚀 Ready to Deploy?

```bash
./deploy-to-digitalocean.sh
```

Good luck with your deployment! 🎉

---

*For questions or issues, refer to the comprehensive guide in [DIGITALOCEAN_DEPLOYMENT.md](DIGITALOCEAN_DEPLOYMENT.md)*
