# Heroku Deployment Script for Dental Cavity Detection API
# This script deploys the Flask API server to Heroku

param(
    [Parameter(Mandatory=$true)]
    [string]$AppName
)

Write-Host "Deploying Dental Cavity Detection API to Heroku" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Check if Heroku CLI is installed
Write-Host "Checking Heroku CLI installation..." -ForegroundColor Yellow
try {
    heroku --version
    Write-Host "Heroku CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "Heroku CLI is not installed. Please install it from https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Red
    exit 1
}

# Check if user is logged in to Heroku
Write-Host "Checking Heroku authentication..." -ForegroundColor Yellow
heroku auth:whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please log in to Heroku first: heroku login" -ForegroundColor Red
    exit 1
}

# Create Heroku app
Write-Host "Creating Heroku app: $AppName" -ForegroundColor Yellow
heroku create $AppName
if ($LASTEXITCODE -ne 0) {
    Write-Host "App might already exist. Continuing..." -ForegroundColor Yellow
}

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow
heroku config:set FLASK_ENV=production --app $AppName
heroku config:set PORT=5000 --app $AppName

# Add Python buildpack
Write-Host "Adding Python buildpack..." -ForegroundColor Yellow
heroku buildpacks:set heroku/python --app $AppName

# Initialize git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for Heroku deployment"
}

# Add Heroku remote
Write-Host "Adding Heroku remote..." -ForegroundColor Yellow
heroku git:remote -a $AppName

# Deploy to Heroku
Write-Host "Deploying to Heroku..." -ForegroundColor Yellow
git add .
git commit -m "Deploy to Heroku" --allow-empty
git push heroku main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!" -ForegroundColor Green
    Write-Host "Your API is available at: https://$AppName.herokuapp.com" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Update your React app's .env.production with the new API URL" -ForegroundColor White
    Write-Host "2. Upload your trained models to the Heroku app" -ForegroundColor White
    Write-Host "3. Test the API endpoints" -ForegroundColor White
    
} else {
    Write-Host "Deployment failed" -ForegroundColor Red
    Write-Host "Check the logs with: heroku logs --tail --app $AppName" -ForegroundColor Yellow
}