@echo off
setlocal
  if not exist "..\src\Spotlight-Image-Extractor.js" (
    echo Error! Cannot locate source at "..\src\Spotlight-Image-Extractor.js"
    goto :EndMeNow
  )
  if exist "Spotlight-Image-Extractor.exe" del "Spotlight-Image-Extractor.exe" >nul

  :: Check for version of JScript.NET compiler usually installed as default on Windows 10/11
  set "jsc=%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\jsc.exe"

  :: Else, if not found, then search for any other .NET versions installed
  if not exist "%jsc%" for /r "%SystemRoot%\Microsoft.NET\Framework\" %%# in ("*jsc.exe") do set "jsc=%%#"

  :: Compile the code to exe
  echo Compiling...
  echo.
  if exist "%jsc%" (
    "%jsc%" /print- /out:"Spotlight-Image-Extractor.exe" "..\src\Spotlight-Image-Extractor.js"
  ) else (
    echo Error could not find JScript.NET compiler on this PC!
    goto :EndMeNow
  )
  :: Check that the JScript code was compiled successfully
  if not exist "Spotlight-Image-Extractor.exe" (
    echo Error could not compile "..\src\Spotlight-Image-Extractor.js"!
    goto :EndMeNow
  )

:EndMeNow
  :: Pause to show output for 3 seconds
  TIMEOUT /T 3
endlocal & exit /b 0
