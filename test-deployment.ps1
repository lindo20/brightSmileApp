# Deployment Testing Script
# This script tests the deployed application end-to-end

param(
    [Parameter(Mandatory=$true)]
    [string]$FrontendUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$ApiUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$TestImagePath = ""
)

Write-Host "🧪 Testing Deployed Dental Cavity Detection Application" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

$testResults = @()

# Function to test API endpoint
function Test-ApiEndpoint {
    param($Url, $Description)
    
    Write-Host "🔍 Testing: $Description" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 30
        Write-Host "✅ $Description - PASSED" -ForegroundColor Green
        return @{ Test = $Description; Status = "PASSED"; Response = $response }
    }
    catch {
        Write-Host "❌ $Description - FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return @{ Test = $Description; Status = "FAILED"; Error = $_.Exception.Message }
    }
}

# Function to test frontend
function Test-Frontend {
    param($Url)
    
    Write-Host "🌐 Testing Frontend Application" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend - PASSED" -ForegroundColor Green
            return @{ Test = "Frontend Accessibility"; Status = "PASSED"; StatusCode = $response.StatusCode }
        } else {
            Write-Host "❌ Frontend - FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
            return @{ Test = "Frontend Accessibility"; Status = "FAILED"; StatusCode = $response.StatusCode }
        }
    }
    catch {
        Write-Host "❌ Frontend - FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return @{ Test = "Frontend Accessibility"; Status = "FAILED"; Error = $_.Exception.Message }
    }
}

# Function to test image upload
function Test-ImageUpload {
    param($ApiUrl, $ImagePath, $Endpoint)
    
    if (-not $ImagePath -or -not (Test-Path $ImagePath)) {
        Write-Host "⚠️  Skipping image upload test - no test image provided" -ForegroundColor Yellow
        return @{ Test = "Image Upload ($Endpoint)"; Status = "SKIPPED"; Reason = "No test image" }
    }
    
    Write-Host "📸 Testing Image Upload: $Endpoint" -ForegroundColor Yellow
    
    try {
        $boundary = [System.Guid]::NewGuid().ToString()
        $fileBytes = [System.IO.File]::ReadAllBytes($ImagePath)
        $fileName = [System.IO.Path]::GetFileName($ImagePath)
        
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"image`"; filename=`"$fileName`"",
            "Content-Type: image/jpeg",
            "",
            [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes),
            "--$boundary--"
        )
        
        $body = $bodyLines -join "`r`n"
        $headers = @{ "Content-Type" = "multipart/form-data; boundary=$boundary" }
        
        $response = Invoke-RestMethod -Uri "$ApiUrl$Endpoint" -Method POST -Body $body -Headers $headers -TimeoutSec 60
        Write-Host "✅ Image Upload ($Endpoint) - PASSED" -ForegroundColor Green
        return @{ Test = "Image Upload ($Endpoint)"; Status = "PASSED"; Response = $response }
    }
    catch {
        Write-Host "❌ Image Upload ($Endpoint) - FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return @{ Test = "Image Upload ($Endpoint)"; Status = "FAILED"; Error = $_.Exception.Message }
    }
}

# Start testing
Write-Host ""
Write-Host "🚀 Starting Deployment Tests..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Frontend Accessibility
$testResults += Test-Frontend -Url $FrontendUrl

Write-Host ""

# Test 2: API Health Checks
$testResults += Test-ApiEndpoint -Url "$ApiUrl/api/v1/health" -Description "Regular Model Health Check"
$testResults += Test-ApiEndpoint -Url "$ApiUrl/api/v1/health-xray" -Description "X-ray Model Health Check"

Write-Host ""

# Test 3: Model Info Endpoints
$testResults += Test-ApiEndpoint -Url "$ApiUrl/api/v1/model-info?type=regular" -Description "Regular Model Info"
$testResults += Test-ApiEndpoint -Url "$ApiUrl/api/v1/model-info?type=xray" -Description "X-ray Model Info"

Write-Host ""

# Test 4: Image Upload Tests (if test image provided)
if ($TestImagePath) {
    $testResults += Test-ImageUpload -ApiUrl $ApiUrl -ImagePath $TestImagePath -Endpoint "/api/v1/predict"
    $testResults += Test-ImageUpload -ApiUrl $ApiUrl -ImagePath $TestImagePath -Endpoint "/api/v1/predict-xray"
}

Write-Host ""

# Test 5: CORS Headers
Write-Host "🔒 Testing CORS Configuration" -ForegroundColor Yellow
try {
    $headers = @{ "Origin" = $FrontendUrl }
    $response = Invoke-WebRequest -Uri "$ApiUrl/api/v1/health" -Method OPTIONS -Headers $headers -TimeoutSec 30
    
    if ($response.Headers["Access-Control-Allow-Origin"]) {
        Write-Host "✅ CORS Configuration - PASSED" -ForegroundColor Green
        $testResults += @{ Test = "CORS Configuration"; Status = "PASSED" }
    } else {
        Write-Host "❌ CORS Configuration - FAILED" -ForegroundColor Red
        $testResults += @{ Test = "CORS Configuration"; Status = "FAILED"; Error = "No CORS headers found" }
    }
}
catch {
    Write-Host "❌ CORS Configuration - FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{ Test = "CORS Configuration"; Status = "FAILED"; Error = $_.Exception.Message }
}

Write-Host ""

# Test Summary
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

$passedTests = ($testResults | Where-Object { $_.Status -eq "PASSED" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "FAILED" }).Count
$skippedTests = ($testResults | Where-Object { $_.Status -eq "SKIPPED" }).Count
$totalTests = $testResults.Count

Write-Host ""
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Skipped: $skippedTests" -ForegroundColor Yellow
Write-Host ""

# Detailed Results
foreach ($result in $testResults) {
    $status = switch ($result.Status) {
        "PASSED" { "✅" }
        "FAILED" { "❌" }
        "SKIPPED" { "⚠️ " }
    }
    Write-Host "$status $($result.Test): $($result.Status)" -ForegroundColor White
    
    if ($result.Error) {
        Write-Host "   Error: $($result.Error)" -ForegroundColor Red
    }
}

Write-Host ""

# Overall Result
if ($failedTests -eq 0) {
    Write-Host "🎉 All tests passed! Your deployment is working correctly." -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Please check the errors above and fix the issues." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "💡 Tips for troubleshooting:" -ForegroundColor Cyan
Write-Host "1. Check if all environment variables are set correctly" -ForegroundColor White
Write-Host "2. Verify that the AI models are uploaded and accessible" -ForegroundColor White
Write-Host "3. Check the API server logs for detailed error messages" -ForegroundColor White
Write-Host "4. Ensure CORS is properly configured for your frontend domain" -ForegroundColor White