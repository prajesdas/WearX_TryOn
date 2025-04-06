@echo off
echo Setting up Virtual Outfit Helper...
echo ===============================

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python.
    pause
    exit /b 1
)

REM Check if venv exists, create if it doesn't
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install required packages
echo Installing dependencies...
pip install flask==3.0.2
pip install flask-cors==4.0.0
pip install opencv-python
pip install numpy
pip install Pillow
pip install urllib3


echo Note: For better tracking precision, you can install mediapipe with:
echo pip install mediapipe
echo The app will work without it, using fallback algorithms.

REM Copy ML model files if needed
if not exist ml_models (
    echo Creating ml_models directory...
    mkdir ml_models
    echo Creating __init__.py for ml_models package...
    echo # ML Models Package > ml_models\__init__.py
    echo from .tshirt_tryon import remove_white_background, overlay_image, simple_tshirt_tryon, process_tshirt_tryon >> ml_models\__init__.py
    echo from .earring_tryon import simple_earring_tryon, process_earring_tryon >> ml_models\__init__.py
)

REM Create placeholder images if they don't exist
echo Creating placeholder images if needed...
if not exist 503.png (
    echo Creating T-shirt placeholder...
    python -c "from PIL import Image, ImageDraw; img = Image.new('RGBA', (500, 600), (0, 0, 0, 0)); draw = ImageDraw.Draw(img); draw.rectangle((100, 150, 400, 550), fill=(30, 100, 255, 200), outline=(0, 0, 0, 255)); draw.rectangle((50, 150, 100, 300), fill=(30, 100, 255, 200), outline=(0, 0, 0, 255)); draw.rectangle((400, 150, 450, 300), fill=(30, 100, 255, 200), outline=(0, 0, 0, 255)); draw.ellipse((200, 100, 300, 180), fill=(0, 0, 0, 0)); img.save('503.png'); print('Created 503.png')"
)

if not exist 504.png (
    echo Creating dress placeholder...
    python -c "from PIL import Image, ImageDraw; img = Image.new('RGBA', (500, 800), (0, 0, 0, 0)); draw = ImageDraw.Draw(img); draw.rectangle((150, 100, 350, 300), fill=(255, 100, 180, 200), outline=(0, 0, 0, 255)); draw.polygon([(150, 300), (350, 300), (400, 750), (100, 750)], fill=(255, 100, 180, 200), outline=(0, 0, 0, 255)); draw.ellipse((220, 70, 280, 130), fill=(0, 0, 0, 0)); img.save('504.png'); print('Created 504.png')"
)

if not exist left_ear.png (
    echo Creating earring placeholders...
    python -c "from PIL import Image, ImageDraw; gold = (255, 215, 0, 230); for side in ['left', 'right']: img = Image.new('RGBA', (100, 150), (0, 0, 0, 0)); draw = ImageDraw.Draw(img); draw.arc((40, 10, 60, 50), 0, 180, fill=(150, 150, 150, 255), width=3); draw.ellipse((30, 60, 70, 100), fill=gold, outline=(50, 50, 50, 255)); draw.line((50, 100, 50, 140), fill=(150, 150, 150, 255), width=2); draw.ellipse((40, 130, 60, 150), fill=gold, outline=(50, 50, 50, 255)); img.save(f'{side}_ear.png'); print(f'Created {side}_ear.png')"
)

REM Run the application
echo Starting the application...
python app.py

pause 