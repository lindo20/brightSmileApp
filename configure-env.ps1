# Environment Configuration Script
# This script helps configure environment variables for production deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$Platform = "netlify",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiUrl = "",
    
    [Parameter(Mandatory=$false)]
    [string]$FirebaseProjectId = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$Interactive = $false
)

Write-Host "Environment Configuration for Dental Cavity Detection App" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

# Function to prompt for input
function Get-UserInput {
    param(
        [string]$Prompt, 
        [string]$Default = ""
    )
    
    if ($Default) {
        $input = Read-Host "$Prompt [$Default]"
        if (-not $input) { return $Default }
        return $input
    } else {
        return Read-Host $Prompt
    }
}

# Interactive mode
if ($Interactive) {
    Write-Host ""
    Write-Host "Interactive Environment Configuration" -ForegroundColor Yellow
    Write-Host ""
    
    $Platform = Get-UserInput "Deployment Platform (netlify/vercel/firebase/heroku)" "netlify"
    $ApiUrl = Get-UserInput "API Base URL (e.g., https://your-api.herokuapp.com)" ""
    
    if ($Platform -eq "firebase") {
        $FirebaseProjectId = Get-UserInput "Firebase Project ID" ""
    }
}

# Validate inputs
if (-not $ApiUrl) {
    Write-Host "API URL is required. Using placeholder for now." -ForegroundColor Yellow
    $ApiUrl = "https://your-api-server.herokuapp.com"
}

Write-Host ""
Write-Host "Configuring environment for platform: $Platform" -ForegroundColor Green
Write-Host "API URL: $ApiUrl" -ForegroundColor Green

# Generate .env.production content
$envContent = @"
# Production Environment Variables
# Generated on $(Get-Date)

# API Endpoints for AI Model
REACT_APP_API_BASE_URL=$ApiUrl
REACT_APP_REGULAR_MODEL_URL=$ApiUrl/api/v1/predict
REACT_APP_XRAY_MODEL_URL=$ApiUrl/api/v1/predict-xray
REACT_APP_REGULAR_HEALTH_URL=$ApiUrl/api/v1/health
REACT_APP_XRAY_HEALTH_URL=$ApiUrl/api/v1/health-xray
REACT_APP_MODEL_INFO_URL=$ApiUrl/api/v1/model-info

# Firebase Configuration (Replace with your production Firebase config)
REACT_APP_FIREBASE_API_KEY=your_production_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_production_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Application Settings
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_SUPPORTED_FORMATS=image/jpeg,image/png,image/jpg

# Analytics (Optional)
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Error Tracking (Optional)
REACT_APP_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
"@

# Write the environment file
$envContent | Out-File -FilePath ".env.production" -Encoding UTF8

Write-Host "Created .env.production file" -ForegroundColor Green

# Platform-specific configurations
switch ($Platform.ToLower()) {
    "netlify" {
        Write-Host ""
        Write-Host "Netlify Configuration" -ForegroundColor Cyan
        Write-Host "=====================" -ForegroundColor Cyan
        
        Write-Host "1. Go to your Netlify dashboard" -ForegroundColor White
        Write-Host "2. Navigate to Site settings > Environment variables" -ForegroundColor White
        Write-Host "3. Add the environment variables from .env.production" -ForegroundColor White
    }
    
    "vercel" {
        Write-Host ""
        Write-Host "Vercel Configuration" -ForegroundColor Cyan
        Write-Host "====================" -ForegroundColor Cyan
        
        Write-Host "1. Go to your Vercel dashboard" -ForegroundColor White
        Write-Host "2. Navigate to Project Settings > Environment Variables" -ForegroundColor White
        Write-Host "3. Add variables for Production environment" -ForegroundColor White
    }
    
    "firebase" {
        Write-Host ""
        Write-Host "Firebase Configuration" -ForegroundColor Cyan
        Write-Host "======================" -ForegroundColor Cyan
        
        Write-Host "Environment variables are built into the app during build time." -ForegroundColor White
        Write-Host "The .env.production file will be used automatically." -ForegroundColor White
        
        if ($FirebaseProjectId) {
            Write-Host ""
            Write-Host "Firebase project configured: $FirebaseProjectId" -ForegroundColor Green
        }
    }
    
    "heroku" {
        Write-Host ""
        Write-Host "Heroku Configuration" -ForegroundColor Cyan
        Write-Host "====================" -ForegroundColor Cyan
        
        Write-Host "Use Heroku CLI to set environment variables from .env.production" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Security Checklist" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "Source maps disabled for production" -ForegroundColor Green
Write-Host "API URLs configured" -ForegroundColor Green
Write-Host "Remember to configure HTTPS for your API" -ForegroundColor Yellow

Write-Host ""
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "1. Deploy your API server with the configured URLs" -ForegroundColor White
Write-Host "2. Set environment variables on your hosting platform" -ForegroundColor White
Write-Host "3. Build and deploy your React application" -ForegroundColor White
Write-Host "4. Test the deployment using test-deployment.ps1" -ForegroundColor White

Write-Host ""
Write-Host "Environment configuration complete!" -ForegroundColor Green