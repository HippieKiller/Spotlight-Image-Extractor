@echo off
setlocal
  set "src=..\src\Spotlight-Image-Extractor.js"
  set "dst=Spotlight-Image-Extractor.exe"

  if not exist %src% (
    echo Error! Cannot locate source at %src%
    goto :EndMeNow
  )
  if exist %dst% del %dst% >nul

  :: Check for version of JScript.NET compiler usually installed as default on Windows 10/11
  set "jsc=%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\jsc.exe"

  :: Else, if not found, then search for any other .NET versions installed
  if not exist "%jsc%" for /r "%SystemRoot%\Microsoft.NET\Framework\" %%# in ("*jsc.exe") do set "jsc=%%#"

  :: Compile the code to exe
  echo Compiling...
  echo.
  if exist "%jsc%" (
    "%jsc%" /print- /out:%dst% %src%
  ) else (
    echo Error could not find JScript.NET compiler on this PC!
    goto :EndMeNow
  )
  :: Check that the JScript code was compiled successfully
  if not exist %dst% (
    echo Error could not compile %src%!
    goto :EndMeNow
  )

:EndMeNow
  :: Pause to show output for 3 seconds
rem  TIMEOUT /T 3
endlocal & exit /b 0