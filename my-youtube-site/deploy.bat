@echo off
cd /d "C:\Users\oo\Desktop\subscribers website\my-youtube-site"

echo ✅ Starting deployment...

git status
git add .
git commit -m "Update frontend and backend - %date% %time%"
git pull --rebase origin main
git push origin main

echo.
echo ✅ Deployment triggered! Check Vercel dashboard for live update.
pause
