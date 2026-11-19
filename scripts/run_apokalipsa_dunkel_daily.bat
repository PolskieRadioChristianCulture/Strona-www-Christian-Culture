@echo off
REM Apokalipsa — Jonatan Dunkel: codzienny montaz + premiera za 48 h (20:00) na 3 kanalach YouTube
cd /d C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc
node scripts\apokalipsa_dunkel_daily_pipeline.mjs >> C:\Users\czark\Christian_Culture_Projekty\apokalipsa_dunkel_assets\daily_pipeline.log 2>&1
