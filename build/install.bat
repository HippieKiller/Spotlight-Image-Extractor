@echo off
if not exist "Spotlight-Image-Extractor.exe" call compile.bat
Spotlight-Image-Extractor.exe -install
TIMEOUT /T 3
