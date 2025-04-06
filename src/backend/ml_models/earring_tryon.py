import cv2
import numpy as np

# Function to remove white background from images
def remove_white_background(image):
    if image is None:
        print("Error: Earring image not found!")
        return None
    
    if image.shape[-1] == 3:  # Convert BGR to BGRA
        image = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)

    # Create mask where white pixels are detected
    gray = cv2.cvtColor(image[:, :, :3], cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)  # White removal

    # Apply mask as alpha channel
    image[:, :, 3] = mask
    return image

# Function to overlay images with alpha blending
def overlay_image(background, overlay, x, y, width, height):
    if overlay is None or background is None:
        return background

    overlay = cv2.resize(overlay, (width, height))
    alpha_mask = overlay[:, :, 3] / 255.0
    alpha_inv = 1.0 - alpha_mask

    h, w, _ = background.shape
    x1, x2 = max(0, x), min(w, x + width)
    y1, y2 = max(0, y), min(h, y + height)

    if x1 >= x2 or y1 >= y2:
        return background

    overlay = overlay[: y2 - y1, : x2 - x1]
    alpha_mask = alpha_mask[: y2 - y1, : x2 - x1]
    alpha_inv = alpha_inv[: y2 - y1, : x2 - x1]

    alpha_mask = np.stack([alpha_mask] * 3, axis=-1)
    alpha_inv = np.stack([alpha_inv] * 3, axis=-1)

    background[y1:y2, x1:x2, :3] = (
        alpha_inv * background[y1:y2, x1:x2, :3] + alpha_mask * overlay[:, :, :3]
    ).astype(np.uint8)

    return background

def simple_earring_tryon(frame, face_box, left_earring_path="left_ear.png", right_earring_path="right_ear.png"):
    """
    Apply a simple earring try-on effect using a face bounding box
    
    Args:
        frame: Input image frame
        face_box: Bounding box of face [x, y, width, height]
        left_earring_path: Path to left earring image
        right_earring_path: Path to right earring image
    
    Returns:
        Frame with earrings overlaid
    """
    try:
        # Load earring images
        left_earring = cv2.imread(left_earring_path, cv2.IMREAD_UNCHANGED)
        right_earring = cv2.imread(right_earring_path, cv2.IMREAD_UNCHANGED)
        
        # Process earring images
        left_earring = remove_white_background(left_earring)
        right_earring = remove_white_background(right_earring)
        
        # Extract values from face_box
        x, y, w, h = face_box
        
        # Estimate ear positions based on face box
        # Left ear is typically at the left side of the face
        left_ear_x = max(0, x)
        left_ear_y = y + h // 3  # Approximately at eye level
        
        # Right ear is typically at the right side of the face
        right_ear_x = min(frame.shape[1], x + w)
        right_ear_y = y + h // 3
        
        # Size earrings based on face dimensions
        earring_width = w // 5
        earring_height = h // 3
        
        # Overlay earrings onto the frame
        result_frame = frame.copy()
        
        # Position earrings just below the ears
        left_pos_x = left_ear_x - earring_width // 2
        left_pos_y = left_ear_y
        
        right_pos_x = right_ear_x - earring_width // 2
        right_pos_y = right_ear_y
        
        # Apply earrings
        result_frame = overlay_image(result_frame, left_earring, left_pos_x, left_pos_y, earring_width, earring_height)
        result_frame = overlay_image(result_frame, right_earring, right_pos_x, right_pos_y, earring_width, earring_height)
        
        return result_frame
        
    except Exception as e:
        print(f"Error in simple_earring_tryon: {e}")
        return frame  # Return original frame if error occurs

def process_earring_tryon(image_path, output_path=None):
    """
    Process a single image for earring try-on
    
    Args:
        image_path: Path to input image
        output_path: Path to save output image (optional)
    
    Returns:
        Processed image with earrings overlay
    """
    # Load image
    frame = cv2.imread(image_path)
    if frame is None:
        raise FileNotFoundError(f"Image not found at {image_path}")
    
    # Use simple positioning instead of detection
    height, width = frame.shape[:2]
    face_box = [width//3, height//6, width//3, height//3]
    
    # Apply earring try-on
    result = simple_earring_tryon(frame, face_box)
    
    # Optionally save the result
    if output_path:
        cv2.imwrite(output_path, result)
    
    return result

def run_earring_tryon_interactive():
    """
    Run the interactive earring try-on
    Warning: This should only be called directly, not on import
    """
    try:
        # Open webcam
        cap = cv2.VideoCapture(0)
        
        # Load earring images
        left_earring = cv2.imread("left_ear.png", cv2.IMREAD_UNCHANGED)
        right_earring = cv2.imread("right_ear.png", cv2.IMREAD_UNCHANGED)
        
        # Process earring images
        left_earring = remove_white_background(left_earring)
        right_earring = remove_white_background(right_earring)
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            # Simple approach - no external detection
            h, w = frame.shape[:2]
            face_box = [w//3, h//6, w//3, h//3]
            
            # Apply earrings
            frame = simple_earring_tryon(frame, face_box)
            
            # Show result
            cv2.imshow("Earring Try-On", frame)
            if cv2.waitKey(1) & 0xFF in [ord('q'), 27]:  # Exit on 'q' or ESC
                break
                
        cap.release()
        cv2.destroyAllWindows()
        
    except Exception as e:
        print(f"Error in run_earring_tryon_interactive: {e}")

# This code will only run if the script is executed directly
if __name__ == "__main__":
    run_earring_tryon_interactive()
