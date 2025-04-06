"""
Virtual Outfit Try-On API - Flask backend for clothing and accessory virtual 
try-on.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import os
import sys

# Add backend directory to Python path for local imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import all ML models and functions
from ml_models.tshirt_tryon import (
    remove_white_background, 
    overlay_image, 
    simple_tshirt_tryon,
    process_tshirt_tryon,
    calculate_distance,
    get_coords,
    fit_color
)
from ml_models.earring_tryon import (
    simple_earring_tryon,
    remove_white_background as earring_remove_white_background,
    overlay_image as earring_overlay_image,
    process_earring_tryon
)

app = Flask(__name__)
CORS(app)

# Try to import MediaPipe (but continue if it fails)
try:
    import mediapipe as mp
    # Initialize MediaPipe with proper configuration
    mp_pose = mp.solutions.pose
    mp_face_mesh = mp.solutions.face_mesh
    # Configure with explicit model and input specifications to avoid warnings
    mediapipe_pose = mp_pose.Pose(
        static_image_mode=True, 
        model_complexity=1,
        enable_segmentation=False,
        min_detection_confidence=0.5
    )
    mediapipe_face_mesh = mp_face_mesh.FaceMesh(
        static_image_mode=True, 
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5
    )
    MEDIAPIPE_AVAILABLE = True
    print("MediaPipe successfully imported and initialized.")
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("MediaPipe not available. Using fallback detection methods.")
    mp_pose = None
    mp_face_mesh = None


# Function to use a simple approach if advanced detection fails
def fallback_detection(frame, item_type):
    height, width = frame.shape[:2]
    
    if item_type == 'tshirt' or item_type == 'dress':
        # Fallback for shirt: assume upper half of image
        return [width//4, height//8, width//2, height//2]
    elif item_type == 'earrings':
        # Fallback for earrings: assume face is in center upper third
        return [width//3, height//6, width//3, height//3]
    
    return None


@app.route('/api/try-on', methods=['POST'])
def try_on():
    try:
        data = request.json
        image_data = data['image'].split(',')[1]
        item_type = data['type'].lower()  # Normalize to lowercase
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        h, w = frame.shape[:2]
        
        if item_type == 'tshirt' or item_type == 'dress':
            # Use the item path based on type
            item_path = "503.png" if item_type == 'tshirt' else "504.png"
            
            # Try to use MediaPipe for better tracking if available
            if MEDIAPIPE_AVAILABLE and mediapipe_pose is not None:
                try:
                    # Convert to RGB as MediaPipe requires RGB input
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    
                    # Process with explicit image dimensions
                    pose_result = mediapipe_pose.process(frame_rgb)
                    
                    if pose_result.pose_landmarks:
                        # Use the landmarks to create a body box
                        landmarks = pose_result.pose_landmarks.landmark
                        
                        # Calculate body box from landmarks
                        # Get shoulder landmarks
                        l_shoulder = landmarks[11]  # LEFT_SHOULDER
                        r_shoulder = landmarks[12]  # RIGHT_SHOULDER
                        
                        # Get coordinates
                        lsx, lsy = int(l_shoulder.x * w), int(l_shoulder.y * h)
                        rsx, rsy = int(r_shoulder.x * w), int(r_shoulder.y * h)
                        
                        # Calculate body box
                        shoulder_width = abs(rsx - lsx)
                        center_x = (lsx + rsx) // 2
                        x = max(0, center_x - shoulder_width)
                        y = max(0, min(lsy, rsy) - int(shoulder_width * 0.2))
                        width = shoulder_width * 2
                        height = int(width * 1.5)
                        
                        body_box = [x, y, width, height]
                        frame = simple_tshirt_tryon(
                            frame, body_box, tshirt_image_path=item_path
                        )
                    else:
                        # Fall back to basic detection
                        body_box = fallback_detection(frame, item_type)
                        frame = simple_tshirt_tryon(
                            frame, body_box, tshirt_image_path=item_path
                        )
                except Exception as e:
                    print(f"Error in MediaPipe processing: {e}")
                    # Fall back to basic detection
                    body_box = fallback_detection(frame, item_type)
                    frame = simple_tshirt_tryon(
                        frame, body_box, tshirt_image_path=item_path
                    )
            else:
                # Use basic detection
                body_box = fallback_detection(frame, item_type)
                frame = simple_tshirt_tryon(
                    frame, body_box, tshirt_image_path=item_path
                )
        
        elif item_type == 'earrings':
            left_path = "left_ear.png"
            right_path = "right_ear.png"
            
            # Try to use MediaPipe for better tracking if available
            if MEDIAPIPE_AVAILABLE and mediapipe_face_mesh is not None:
                try:
                    # Convert to RGB as MediaPipe requires RGB input
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    
                    # Process with explicit image dimensions
                    face_result = mediapipe_face_mesh.process(frame_rgb)
                    
                    if face_result.multi_face_landmarks:
                        # Use landmarks to create face box
                        face_landmarks = (
                            face_result.multi_face_landmarks[0].landmark
                        )
                        
                        # Get face bounds
                        x_coords = [int(lm.x * w) for lm in face_landmarks]
                        y_coords = [int(lm.y * h) for lm in face_landmarks]
                        
                        x = min(x_coords)
                        y = min(y_coords)
                        width = max(x_coords) - x
                        height = max(y_coords) - y
                        
                        face_box = [x, y, width, height]
                        
                        # Find ear landmarks
                        left_ear = face_landmarks[234]
                        right_ear = face_landmarks[454]
                        
                        # Get earring positions
                        left_x = int(left_ear.x * w)
                        left_y = int(left_ear.y * h)
                        right_x = int(right_ear.x * w)
                        right_y = int(right_ear.y * h)
                        
                        # Create custom parameters for earrings
                        earring_width = width // 5
                        earring_height = height // 3
                        
                        # Manually apply earrings at the ear positions
                        frame_copy = frame.copy()
                        
                        # Load and prepare earring images
                        left_earring = cv2.imread(
                            left_path, cv2.IMREAD_UNCHANGED
                        )
                        right_earring = cv2.imread(
                            right_path, cv2.IMREAD_UNCHANGED
                        )
                        
                        left_earring = earring_remove_white_background(left_earring)
                        right_earring = earring_remove_white_background(right_earring)
                        
                        # Position earrings at ear locations
                        frame = earring_overlay_image(
                            frame_copy, 
                            left_earring, 
                            left_x - earring_width // 2, 
                            left_y, 
                            earring_width, 
                            earring_height
                        )
                        
                        frame = earring_overlay_image(
                            frame, 
                            right_earring, 
                            right_x - earring_width // 2, 
                            right_y, 
                            earring_width, 
                            earring_height
                        )
                    else:
                        # Fall back to basic detection
                        face_box = fallback_detection(frame, 'earrings')
                        frame = simple_earring_tryon(
                            frame, face_box,
                                                    left_earring_path=left_path, 
                            right_earring_path=right_path
                        )
                except Exception as e:
                    print(f"Error in MediaPipe processing: {e}")
                    # Fall back to basic detection
                    face_box = fallback_detection(frame, 'earrings')
                    frame = simple_earring_tryon(
                        frame, face_box,
                                                left_earring_path=left_path, 
                        right_earring_path=right_path
                    )
            else:
                # Use basic detection
                face_box = fallback_detection(frame, 'earrings')
                frame = simple_earring_tryon(
                    frame, face_box,
                    left_earring_path=left_path,
                    right_earring_path=right_path
                )
        
        # Convert the result back to base64
        _, buffer = cv2.imencode('.jpg', frame)
        result_image = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'success': True,
            'image': f'data:image/jpeg;base64,{result_image}'
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/try-on/tshirt', methods=['POST'])
def try_on_tshirt():
    """
    Dedicated endpoint for t-shirt try-on that demonstrates using all 
    tshirt_tryon.py functions
    """
    try:
        data = request.json
        image_data = data['image'].split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        h, w = frame.shape[:2]
        
        # Use the item path
        tshirt_image_path = "503.png"
        
        # Load the T-shirt image
        tshirt = cv2.imread(tshirt_image_path, cv2.IMREAD_UNCHANGED)
        if tshirt is None:
            print(f"T-shirt image not found at: {tshirt_image_path}")
            # Create a simple colored rectangle as placeholder
            tshirt = np.zeros((600, 500, 4), dtype=np.uint8)
            cv2.rectangle(tshirt, (100, 150), (400, 550), (30, 100, 255, 200), -1)
            cv2.rectangle(tshirt, (50, 150), (100, 300), (30, 100, 255, 200), -1)
            cv2.rectangle(tshirt, (400, 150), (450, 300), (30, 100, 255, 200), -1)
        
        # Demonstrate using remove_white_background
        tshirt = remove_white_background(tshirt)
        
        # Try to use MediaPipe for body detection if available
        if MEDIAPIPE_AVAILABLE and mediapipe_pose is not None:
            try:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pose_result = mediapipe_pose.process(frame_rgb)
                
                if pose_result.pose_landmarks:
                    landmarks = pose_result.pose_landmarks.landmark
                    
                    # Demonstrate using get_coords
                    l_sh = get_coords(landmarks, frame.shape, 11)  # LEFT_SHOULDER
                    r_sh = get_coords(landmarks, frame.shape, 12)  # RIGHT_SHOULDER
                    l_hip = get_coords(landmarks, frame.shape, 23)  # LEFT_HIP
                    r_hip = get_coords(landmarks, frame.shape, 24)  # RIGHT_HIP
                    
                    # Demonstrate using calculate_distance
                    shoulder_width = calculate_distance(l_sh, r_sh)
                    hip_width = calculate_distance(l_hip, r_hip)
                    
                    # Calculate torso measurements
                    center_x = (l_sh[0] + r_sh[0]) // 2
                    tshirt_width = int(shoulder_width * 2)
                    tshirt_height = int(tshirt_width * 1.4)
                    x = max(0, center_x - tshirt_width // 2)
                    y = max(0, min(l_sh[1], r_sh[1]) - int(tshirt_height * 0.2))
                    
                    # Demonstrate using overlay_image
                    result_frame = frame.copy()
                    result_frame = overlay_image(
                        result_frame, 
                        tshirt, 
                        x, 
                        y, 
                        tshirt_width, 
                        tshirt_height
                    )
                    
                    # Add measurements display (optional)
                    size = "M"  # Default size
                    expected_width = 42  # Example expected width in cm
                    
                    # Demonstrate using fit_color
                    color = fit_color(shoulder_width / 10, expected_width)
                    
                    # Draw measurement info
                    cv2.putText(
                        result_frame, 
                        f"Size: {size}", 
                        (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 
                        0.8, 
                        color, 
                        2
                    )
                    
                    # Return the enhanced frame
                    frame = result_frame
                else:
                    # Fall back to simple_tshirt_tryon if no landmarks
                    body_box = fallback_detection(frame, 'tshirt')
                    frame = simple_tshirt_tryon(
                        frame, body_box, tshirt_image_path=tshirt_image_path
                    )
            except Exception as e:
                print(f"Error in advanced T-shirt try-on: {e}")
                # Fall back to process_tshirt_tryon
                # Save frame temporarily
                temp_path = "temp_frame.jpg"
                cv2.imwrite(temp_path, frame)
                frame = process_tshirt_tryon(temp_path)
                # Clean up temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        else:
            # Use the full process_tshirt_tryon function as fallback
            # Save frame temporarily
            temp_path = "temp_frame.jpg"
            cv2.imwrite(temp_path, frame)
            frame = process_tshirt_tryon(temp_path)
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
        # Convert the result back to base64
        _, buffer = cv2.imencode('.jpg', frame)
        result_image = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'success': True,
            'image': f'data:image/jpeg;base64,{result_image}'
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/try-on/earrings', methods=['POST'])
def try_on_earrings():
    """
    Dedicated endpoint for earrings try-on that demonstrates using all 
    earring_tryon.py functions
    """
    try:
        data = request.json
        image_data = data['image'].split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        h, w = frame.shape[:2]
        
        left_path = "left_ear.png"
        right_path = "right_ear.png"
        
        # Try MediaPipe for face detection if available
        if MEDIAPIPE_AVAILABLE and mediapipe_face_mesh is not None:
            try:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                face_result = mediapipe_face_mesh.process(frame_rgb)
                
                if face_result.multi_face_landmarks:
                    face_landmarks = face_result.multi_face_landmarks[0].landmark
                    
                    # Find ear landmarks
                    left_ear = face_landmarks[234]
                    right_ear = face_landmarks[454]
                    
                    # Get earring positions
                    left_x = int(left_ear.x * w)
                    left_y = int(left_ear.y * h)
                    right_x = int(right_ear.x * w)
                    right_y = int(right_ear.y * h)
                    
                    # Create face box for possible additional processing
                    x_coords = [int(lm.x * w) for lm in face_landmarks]
                    y_coords = [int(lm.y * h) for lm in face_landmarks]
                    
                    x = min(x_coords)
                    y = min(y_coords)
                    width = max(x_coords) - x
                    height = max(y_coords) - y
                    
                    # Size earrings based on face dimensions
                    earring_width = width // 5
                    earring_height = height // 3
                    
                    # Load and prepare earring images
                    left_earring = cv2.imread(
                        left_path, cv2.IMREAD_UNCHANGED
                    )
                    right_earring = cv2.imread(
                        right_path, cv2.IMREAD_UNCHANGED
                    )
                    
                    # Demonstrate using remove_white_background from earring_tryon
                    left_earring = earring_remove_white_background(
                        left_earring
                    )
                    right_earring = earring_remove_white_background(
                        right_earring
                    )
                    
                    # Create a copy of the frame for overlay
                    result_frame = frame.copy()
                    
                    # Demonstrate using overlay_image from earring_tryon
                    result_frame = earring_overlay_image(
                        result_frame, 
                        left_earring, 
                        left_x - earring_width // 2, 
                        left_y, 
                        earring_width, 
                        earring_height
                    )
                    
                    result_frame = earring_overlay_image(
                        result_frame, 
                        right_earring, 
                        right_x - earring_width // 2, 
                        right_y, 
                        earring_width, 
                        earring_height
                    )
                    
                    # Return the enhanced frame
                    frame = result_frame
                else:
                    # Fall back to simple_earring_tryon
                    face_box = fallback_detection(frame, 'earrings')
                    frame = simple_earring_tryon(
                        frame, face_box,
                                            left_earring_path=left_path, 
                        right_earring_path=right_path
                    )
            except Exception as e:
                print(f"Error in advanced earring try-on: {e}")
                # Fall back to process_earring_tryon
                # Save frame temporarily
                temp_path = "temp_frame.jpg"
                cv2.imwrite(temp_path, frame)
                frame = process_earring_tryon(temp_path)
                # Clean up temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        else:
            # Use the full process_earring_tryon function as fallback
            # Save frame temporarily
            temp_path = "temp_frame.jpg"
            cv2.imwrite(temp_path, frame)
            frame = process_earring_tryon(temp_path)
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
        # Convert the result back to base64
        _, buffer = cv2.imencode('.jpg', frame)
        result_image = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'success': True,
            'image': f'data:image/jpeg;base64,{result_image}'
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    print("Starting Virtual Outfit Helper...")
    print("Starting Flask server on port 5000...")
    app.run(debug=True, port=5000)
