import sys
from PIL import Image, ImageDraw
import base64
from io import BytesIO

def main():
    print(f"Python version: {sys.version}")
    print(f"Running from: {__file__}")
    
    # Create a simple image
    img = Image.new('RGB', (100, 100), color='red')
    draw = ImageDraw.Draw(img)
    draw.text((10, 10), "Hello World!", fill='white')
    
    # Save the image
    img.save("test_image.jpg")
    print("Successfully created test_image.jpg")
    
    # Test base64 encoding
    buffer = BytesIO()
    img.save(buffer, format="JPEG")
    img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
    print(f"Base64 encoding successful. Length: {len(img_str)}")
    
    print("All tests passed successfully!")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc() 