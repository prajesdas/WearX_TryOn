import cv2
import numpy as np

# T-shirt size chart (in cm)
tshirt_sizes = {
    "S": {"shoulder": 38, "chest": 90, "length": 65},
    "M": {"shoulder": 42, "chest": 98, "length": 70},
    "L": {"shoulder": 46, "chest": 106, "length": 74},
    "XL": {"shoulder": 50, "chest": 114, "length": 78}
}


def remove_white_background(image):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
    lower_white = np.array([200, 200, 200, 0], dtype=np.uint8)
    upper_white = np.array([255, 255, 255, 255], dtype=np.uint8)
    mask = cv2.inRange(image, lower_white, upper_white)
    image[mask == 255] = [0, 0, 0, 0]
    return image


def overlay_image(background, overlay, x, y, width, height):
    overlay = cv2.resize(overlay, (width, height))
    for i in range(height):
        for j in range(width):
            if y + i >= background.shape[0] or x + j >= background.shape[1]:
                continue
            alpha = overlay[i, j, 3] / 255.0
            if alpha > 0:
                background[y + i, x + j] = ((1 - alpha) * background[y + i, x + j] + 
                                          alpha * overlay[i, j, :3])
    return background


def calculate_distance(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))


def get_coords(landmarks, shape, index):
    h, w = shape[:2]
    lm = landmarks[index]
    return int(lm.x * w), int(lm.y * h)


def fit_color(value, expected, tolerance=5):
    diff = abs(value - expected)
    if diff <= tolerance:
        return (0, 255, 0)  # green
    elif diff <= tolerance * 2:
        return (0, 255, 255)  # yellow
    else:
        return (0, 0, 255)  # red


def simple_tshirt_tryon(frame, body_box, tshirt_image_path="503.png"):
    """
    Apply a simple t-shirt try-on effect using a body bounding box
    
    Args:
        frame: Input image frame
        body_box: Bounding box of body [x, y, width, height]
        tshirt_image_path: Path to t-shirt image
    
    Returns:
        Frame with t-shirt overlaid
    """
    try:
        # Load the T-shirt image
        tshirt = cv2.imread(tshirt_image_path, cv2.IMREAD_UNCHANGED)
        if tshirt is None:
            print(f"T-shirt image not found at: {tshirt_image_path}")
            # Create a simple colored rectangle as placeholder
            tshirt = np.zeros((600, 500, 4), dtype=np.uint8)
            cv2.rectangle(tshirt, (100, 150), (400, 550), 
                         (30, 100, 255, 200), -1)
            cv2.rectangle(tshirt, (50, 150), (100, 300), 
                         (30, 100, 255, 200), -1)
            cv2.rectangle(tshirt, (400, 150), (450, 300), 
                         (30, 100, 255, 200), -1)
        
        # Remove white background
        tshirt = remove_white_background(tshirt)
        
        # Extract values from body_box
        x, y, w, h = body_box
        
        # Calculate shirt placement
        # Use the bounding box to determine the size and position of the shirt
        tshirt_width = max(w, 100)  # Minimum width to avoid too small shirts
        tshirt_height = int(tshirt_width * 1.4)
        
        # Position the shirt on the upper body
        shirt_x = max(0, x - tshirt_width//4)
        shirt_y = max(0, y - int(tshirt_height * 0.1))
        
        # Overlay the shirt onto the frame
        result_frame = frame.copy()
        result_frame = overlay_image(result_frame, tshirt, shirt_x, shirt_y, 
                                    tshirt_width, tshirt_height)
        
        return result_frame
        
    except Exception as e:
        print(f"Error in simple_tshirt_tryon: {e}")
        return frame  # Return original frame if error occurs


def process_tshirt_tryon(image_path, output_path=None, size="M"):
    """
    Process a single image for T-shirt try-on
    
    Args:
        image_path: Path to input image
        output_path: Path to save output image (optional)
        size: T-shirt size to use (S, M, L, XL)
    
    Returns:
        Processed image with T-shirt overlay
    """
    # Load image
    frame = cv2.imread(image_path)
    if frame is None:
        raise FileNotFoundError(f"Image not found at {image_path}")
    
    # Use simple positioning instead of detection
    height, width = frame.shape[:2]
    body_box = [width//4, height//8, width//2, height//2]
    
    # Apply T-shirt try-on
    result = simple_tshirt_tryon(frame, body_box)
    
    # Optionally save the result
    if output_path:
        cv2.imwrite(output_path, result)
    
    return result


def run_tshirt_tryon_webcam():
    """
    Run the interactive T-shirt try-on with webcam
    Warning: This should only be called directly, not on import
    """
    cap = cv2.VideoCapture(0)
    
    # Load the T-shirt image
    tshirt = cv2.imread("503.png")
    if tshirt is None:
        raise FileNotFoundError("T-shirt image not found!")
    tshirt = remove_white_background(tshirt)
    
    # Main Loop
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
    
        # Simple approach - no external detection models
        h, w = frame.shape[:2]
        body_box = [w//4, h//8, w//2, h//2]
        frame = simple_tshirt_tryon(frame, body_box)
    
        cv2.imshow("E-Trial Room", frame)
        if cv2.waitKey(1) & 0xFF in [ord('q'), 27]:
            break
    
    cap.release()
    cv2.destroyAllWindows()


# This code will only run if the script is executed directly
if __name__ == "__main__":
    run_tshirt_tryon_webcam()
