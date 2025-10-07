# Dental Cavity Detection App - Deployment Script
# This script automates the deployment process for both frontend and backend

param(
    [Parameter(Mandatory=$false)]
    [string]$Platform = "netlify",
    
    [Parameter(Mandatory=$false)]
    [switch]$BuildOnly = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false
)

Write-Host "🦷 Dental Cavity Detection App - Deployment Script" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js and npm are available" -ForegroundColor Green

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

# Build the application
if (-not $SkipBuild) {
    Write-Host "🔨 Building the application..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
}

if ($BuildOnly) {
    Write-Host "🎉 Build completed. Exiting as requested." -ForegroundColor Green
    exit 0
}

# Platform-specific deployment
switch ($Platform.ToLower()) {
    "netlify" {
        Write-Host "🚀 Deploying to Netlify..." -ForegroundColor Yellow
        
        # Check if Netlify CLI is installed
        if (-not (Get-Command netlify -ErrorAction SilentlyContinue)) {
            Write-Host "📦 Installing Netlify CLI..." -ForegroundColor Yellow
            npm install -g netlify-cli
        }
        
        Write-Host "🔑 Please run 'netlify login' if you haven't already" -ForegroundColor Cyan
        Write-Host "📁 Deploying build folder to Netlify..." -ForegroundColor Yellow
        netlify deploy --prod --dir=build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully deployed to Netlify!" -ForegroundColor Green
        } else {
            Write-Host "❌ Netlify deployment failed" -ForegroundColor Red
        }
    }
    
    "vercel" {
        Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
        
        # Check if Vercel CLI is installed
        if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
            Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }
        
        Write-Host "🔑 Please run 'vercel login' if you haven't already" -ForegroundColor Cyan
        Write-Host "📁 Deploying to Vercel..." -ForegroundColor Yellow
        vercel --prod
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully deployed to Vercel!" -ForegroundColor Green
        } else {
            Write-Host "❌ Vercel deployment failed" -ForegroundColor Red
        }
    }
    
    "firebase" {
        Write-Host "🚀 Deploying to Firebase..." -ForegroundColor Yellow
        
        # Check if Firebase CLI is installed
        if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
            Write-Host "📦 Installing Firebase CLI..." -ForegroundColor Yellow
            npm install -g firebase-tools
        }
        
        Write-Host "🔑 Please run 'firebase login' if you haven't already" -ForegroundColor Cyan
        Write-Host "📁 Deploying to Firebase..." -ForegroundColor Yellow
        firebase deploy
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully deployed to Firebase!" -ForegroundColor Green
        } else {
            Write-Host "❌ Firebase deployment failed" -ForegroundColor Red
        }
    }
    
    "docker" {
        Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
        
        # Check if Docker is installed
        if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
            Write-Host "❌ Docker is not installed. Please install Docker first." -ForegroundColor Red
            exit 1
        }
        
        $imageName = "dental-cavity-detection"
        $tag = "latest"
        
        Write-Host "🔨 Building Docker image: $imageName:$tag" -ForegroundColor Yellow
        docker build -t "$imageName:$tag" .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker image built successfully!" -ForegroundColor Green
            Write-Host "🚀 To run the container:" -ForegroundColor Cyan
            Write-Host "   docker run -p 80:80 $imageName:$tag" -ForegroundColor White
        } else {
            Write-Host "❌ Docker build failed" -ForegroundColor Red
        }
    }
    
    default {
        Write-Host "❌ Unknown platform: $Platform" -ForegroundColor Red
        Write-Host "Supported platforms: netlify, vercel, firebase, docker" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 Deployment process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure environment variables on your hosting platform" -ForegroundColor White
Write-Host "2. Deploy the AI model backend (see DEPLOYMENT_GUIDE.md)" -ForegroundColor White
Write-Host "3. Update API URLs in your environment configuration" -ForegroundColor White
Write-Host "4. Test the deployed application end-to-end" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow