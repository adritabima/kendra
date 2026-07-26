@echo off
title Adrita Bima Kendra - Live Market Server
echo Starting the live market server...
echo Keep this window open while using the market page.
start "" /b py -3 python_market_api.py
timeout /t 2 /nobreak >nul
start "" http://localhost:5000/market.html
pause
