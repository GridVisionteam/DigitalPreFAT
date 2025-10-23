@echo off
echo Starting Pre-FAT Application Server...
echo.
echo After this starts, open your browser and go to: http://localhost:5501
echo.
echo Press Ctrl+C to stop the server
echo.
npx http-server -p 5501 -c-1
pause