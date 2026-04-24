# GitHub Push Script for Smart CV Manager
Write-Host "🚀 Starting Git Push Process..." -ForegroundColor Cyan

# Check if .git exists
if (!(Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Add all files
Write-Host "➕ Adding files..." -ForegroundColor Yellow
git add .

# Commit changes
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Upload/Update project: $timestamp"

# Check if remote exists, if not add it
$remote = git remote get-url origin 2>$null
if ($null -eq $remote) {
    Write-Host "🔗 Adding remote origin..." -ForegroundColor Yellow
    git remote add origin https://github.com/tawfiq154/-Gestionnaire-Intelligent-de-CV-et-Lettres-de-Motivation-avec-IA-main.git
}

# Push to main
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Green
git branch -M main
git push -u origin main

Write-Host "✅ Done! Project is on GitHub." -ForegroundColor Green
Pause
