@echo off
REM ==============================================================================
REM Generate Self-Signed TLS Certificates for Windows Command Prompt
REM Security Log Anomaly Detection System (NIIT University Capstone II)
REM ==============================================================================

set SCRIPT_DIR=%~dp0
set CERTS_DIR=%SCRIPT_DIR%certs

if not exist "%CERTS_DIR%" mkdir "%CERTS_DIR%"

echo === Generating Self-Signed SSL Certificate for SLADS (Windows) ===

openssl req -x509 -nodes -days 365 -newkey rsa:2048 ^
  -keyout "%CERTS_DIR%\selfsigned.key" ^
  -out "%CERTS_DIR%\selfsigned.crt" ^
  -subj "/C=IN/ST=Rajasthan/L=Neemrana/O=NIIT University/OU=Capstone II/CN=localhost"

echo.
echo Certificate generated successfully in: %CERTS_DIR%
echo   Certificate: %CERTS_DIR%\selfsigned.crt
echo   Private Key: %CERTS_DIR%\selfsigned.key
pause
