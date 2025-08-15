@echo off

:: 使用完整Python路径
set PYTHON_PATH="E:\Program Files\python\python.exe"

:: 检查是否安装了Python
%PYTHON_PATH% --version >nul 2>&1
if ERRORLEVEL 1 (
    echo 未找到Python。请确认安装路径是否正确。
    pause
    exit /b 1
)

:: 启动简单的HTTP服务器
echo 正在启动本地服务器...
%PYTHON_PATH% -m http.server 8000 --directory .

:: 如果服务器启动失败
if ERRORLEVEL 1 (
    echo 服务器启动失败。
    pause
    exit /b 1
)

pause
