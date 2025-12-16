@echo off
echo ====================================
echo Nova Backend Setup Script
echo ====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ and try again
    pause
    exit /b 1
)

echo [1/7] Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/7] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/7] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [4/7] Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo .env file created. Please edit it with your database credentials.
    echo.
    echo IMPORTANT: You need to:
    echo 1. Create a PostgreSQL database named 'nova_db'
    echo 2. Update .env with your database password
    echo 3. Set a secure SECRET_KEY in .env
    echo.
    pause
)

echo [5/7] Running database migrations...
python manage.py makemigrations
python manage.py migrate
if errorlevel 1 (
    echo ERROR: Database migration failed
    echo Make sure PostgreSQL is running and .env is configured correctly
    pause
    exit /b 1
)

echo [6/7] Creating superuser...
echo Please create an admin account:
python manage.py createsuperuser

echo [7/7] Setup complete!
echo.
echo ====================================
echo Next steps:
echo ====================================
echo 1. Make sure FindBack_AI service is running on port 3300
echo 2. Run: python manage.py runserver
echo 3. Access API at: http://localhost:8000/api/
echo 4. Access Admin at: http://localhost:8000/admin/
echo.
echo To activate the virtual environment later, run:
echo   venv\Scripts\activate
echo.
pause
