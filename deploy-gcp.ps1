# Google Cloud Platform Deployment Script for AI Model Backend
# This script deploys the Flask API server to Google Cloud Run

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [Parameter(Mandatory=$false)]
    [string]$ServiceName = "dental-cavity-api",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1"
)

Write-Host "☁️ Deploying AI Model Backend to Google Cloud Platform" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Check if gcloud CLI is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Google Cloud CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Download from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Google Cloud CLI is available" -ForegroundColor Green

# Set the project
Write-Host "🔧 Setting project: $ProjectId" -ForegroundColor Yellow
gcloud config set project $ProjectId
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to set project. Please check your project ID." -ForegroundColor Red
    exit 1
}

# Enable required APIs
Write-Host "🔌 Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Create app.yaml for App Engine (alternative deployment)
Write-Host "📝 Creating app.yaml for App Engine..." -ForegroundColor Yellow
@"
runtime: python39

env_variables:
  FLASK_ENV: production
  PYTHONPATH: /app

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

resources:
  cpu: 1
  memory_gb: 2
  disk_size_gb: 10

handlers:
- url: /.*
  script: auto
"@ | Out-File -FilePath "app.yaml" -Encoding UTF8

# Build and deploy to Cloud Run
Write-Host "🐳 Building and deploying to Cloud Run..." -ForegroundColor Yellow

# Create Dockerfile for Cloud Run if not exists
if (-not (Test-Path "Dockerfile.cloudrun")) {
    Write-Host "📝 Creating Cloud Run Dockerfile..." -ForegroundColor Yellow
    @"
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY api_server.py .
COPY models/ ./models/ 2>/dev/null || true

# Set environment variables
ENV FLASK_ENV=production
ENV PYTHONPATH=/app
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/v1/health || exit 1

# Run the application
CMD exec gunicorn --bind :$PORT --workers 2 --timeout 120 --max-requests 1000 api_server:app
"@ | Out-File -FilePath "Dockerfile.cloudrun" -Encoding UTF8
}

# Deploy to Cloud Run
gcloud run deploy $ServiceName `
    --source . `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --memory 2Gi `
    --cpu 1 `
    --timeout 300 `
    --max-instances 10 `
    --dockerfile Dockerfile.cloudrun

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully deployed to Google Cloud Run!" -ForegroundColor Green
    
    # Get service URL
    $serviceUrl = gcloud run services describe $ServiceName --region $Region --format "value(status.url)"
    
    Write-Host ""
    Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
    Write-Host "Service URL: $serviceUrl" -ForegroundColor Cyan
    Write-Host "API Health Check: $serviceUrl/api/v1/health" -ForegroundColor Cyan
    Write-Host "X-ray Health Check: $serviceUrl/api/v1/health-xray" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Update your React app's .env.production with: $serviceUrl" -ForegroundColor White
    Write-Host "2. Upload your trained models to Cloud Storage" -ForegroundColor White
    Write-Host "3. Configure the API to load models from Cloud Storage" -ForegroundColor White
    Write-Host "4. Test the API endpoints" -ForegroundColor White
    
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Check the logs with: gcloud run logs read --service $ServiceName --region $Region" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Alternative: Deploy to App Engine" -ForegroundColor Cyan
Write-Host "Run: gcloud app deploy app.yaml" -ForegroundColor White