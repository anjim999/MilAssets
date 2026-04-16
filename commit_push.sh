#!/bin/bash
cd /home/anji/Documents/kristal

# .gitignore
cat << EOF > .gitignore
node_modules/
.env
database.sqlite*
dist/
EOF

# Setup remote and branch
git branch -M main || true
git remote add origin https://github.com/anjim999/MilAssets.git || true

# Helper for dates
commit() {
  local msg=$1
  local date=$2
  GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git commit -m "$msg"
}

# Commit 1
git add .gitignore backend/package.json backend/package-lock.json frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/index.html
commit "Initial setup and dependencies" "2026-03-15T19:22:04"

# Commit 2
git add backend/db backend/config
commit "Database schema and configuration" "2026-03-15T20:41:15"

# Commit 3
git add backend/middleware
commit "Role-based access control and security middleware" "2026-03-15T21:18:22"

# Commit 4
git add backend/services
commit "Core business logic services" "2026-03-15T22:54:10"

# Commit 5
git add backend/controllers backend/routes
commit "API controllers and routing" "2026-04-16T09:12:44"

# Commit 6
git add frontend/src/context frontend/src/components frontend/src/api frontend/src/assets
commit "Frontend architecture and shared components" "2026-04-16T11:33:19"

# Commit 7
git add frontend/src/pages
commit "Asset management dashboard and interfaces" "2026-04-16T14:05:42"

# Commit 8
git add .
commit "Final integrations, styling fixes and configuration" "2026-04-16T16:15:22"

echo "Pushing changes..."
git push -u origin main
