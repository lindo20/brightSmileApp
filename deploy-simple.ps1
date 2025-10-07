# Simple Deployment Script for Dental Cavity Detection App

param(
    [Parameter(Mandatory=$false)]
    [string]$Platform = "netlify"
)

Write-Host "Simple Deployment for Dental Cavity Detection App" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check if build directory exists
if (-not (Test-Path "build")) {
    Write-Host "Build directory not found. Building the application..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed. Please check for errors." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Build directory found. Ready for deployment." -ForegroundColor Green

switch ($Platform.ToLower()) {
    "netlify" {
        Write-Host ""
        Write-Host "Netlify Deployment Instructions" -ForegroundColor Cyan
        Write-Host "===============================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Option 1: Drag and Drop (Easiest)" -ForegroundColor Yellow
        Write-Host "1. Go to https://app.netlify.com/" -ForegroundColor White
        Write-Host "2. Drag the 'build' folder to the deployment area" -ForegroundColor White
        Write-Host "3. Your site will be deployed instantly!" -ForegroundColor White
        Write-Host ""
        Write-Host "Option 2: Git Integration" -ForegroundColor Yellow
        Write-Host "1. Push your code to GitHub" -ForegroundColor White
        Write-Host "2. Connect your GitHub repo to Netlify" -ForegroundColor White
        Write-Host "3. Set build command: npm run build" -ForegroundColor White
        Write-Host "4. Set publish directory: build" -ForegroundColor White
        Write-Host ""
        Write-Host "Option 3: Netlify CLI" -ForegroundColor Yellow
        Write-Host "1. Install: npm install -g netlify-cli" -ForegroundColor White
        Write-Host "2. Login: netlify login" -ForegroundColor White
        Write-Host "3. Deploy: netlify deploy --prod --dir=build" -ForegroundColor White
    }
    
    "vercel" {
        Write-Host ""
        Write-Host "Vercel Deployment Instructions" -ForegroundColor Cyan
        Write-Host "==============================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Option 1: Vercel CLI" -ForegroundColor Yellow
        Write-Host "1. Install: npm install -g vercel" -ForegroundColor White
        Write-Host "2. Login: vercel login" -ForegroundColor White
        Write-Host "3. Deploy: vercel --prod" -ForegroundColor White
        Write-Host ""
        Write-Host "Option 2: Git Integration" -ForegroundColor Yellow
        Write-Host "1. Push your code to GitHub" -ForegroundColor White
        Write-Host "2. Import your project at https://vercel.com/new" -ForegroundColor White
        Write-Host "3. Vercel will auto-detect React and deploy" -ForegroundColor White
    }
    
    "firebase" {
        Write-Host ""
        Write-Host "Firebase Deployment Instructions" -ForegroundColor Cyan
        Write-Host "================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Install Firebase CLI: npm install -g firebase-tools" -ForegroundColor White
        Write-Host "2. Login: firebase login" -ForegroundColor White
        Write-Host "3. Initialize: firebase init hosting" -ForegroundColor White
        Write-Host "4. Deploy: firebase deploy" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Environment Variables Setup" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host "Don't forget to set these environment variables on your hosting platform:" -ForegroundColor Yellow
Write-Host ""

# Read and display environment variables
if (Test-Path ".env.production") {
    $envContent = Get-Content ".env.production"
    foreach ($line in $envContent) {
        if ($line -match "^REACT_APP_" -and $line -notmatch "^#") {
            Write-Host "  $line" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "Next Steps After Frontend Deployment:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "1. Deploy your AI model API (consider using Google Colab + ngrok for testing)" -ForegroundColor White
Write-Host "2. Update the API URLs in your hosting platform's environment variables" -ForegroundColor White
Write-Host "3. Test the complete application" -ForegroundColor White

Write-Host ""
Write-Host "Deployment preparation complete!" -ForegroundColor Green