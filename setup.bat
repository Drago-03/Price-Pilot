@echo off
SETLOCAL

echo Setting up Price Pilot...
echo.

REM Check if Python is installed
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Python is not installed! Please install Python 3.8 or later.
    exit /b 1
)

REM Check if Flutter is installed
flutter --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Flutter is not installed! Please install Flutter SDK.
    exit /b 1
)

REM Setup backend
echo Setting up backend...
cd backend
IF NOT EXIST venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
IF NOT EXIST .env (
    copy .env.example .env
    echo Please configure your .env file before running the application.
)
cd ..

REM Setup frontend
echo.
echo Setting up frontend...
cd frontend
flutter pub get
IF NOT EXIST .env (
    copy .env.example .env
    echo Please configure your frontend .env file before running the application.
)
cd ..

echo.
echo Setup complete! To run the application:
echo.
echo 1. Start the backend:
echo    cd backend
echo    venv\Scripts\activate
echo    uvicorn main:app --reload --host 0.0.0.0 --port 8000
echo.
echo 2. Start the frontend:
echo    cd frontend
echo    flutter run -d windows
echo.
echo Note: Make sure Redis is running before starting the backend.

ENDLOCAL 