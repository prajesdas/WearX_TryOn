import cv2
import mediapipe as mp
import numpy as np

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

# Load T-shirt image
tshirt = cv2.imread("503.jpg", cv2.IMREAD_UNCHANGED)

def remove_white_background(image):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
    lower_white = np.array([200, 200, 200, 0], dtype=np.uint8)
    upper_white = np.array([255, 255, 255, 255], dtype=np.uint8)
    
    mask = cv2.inRange(image, lower_white, upper_white)
    image[mask == 255] = [0, 0, 0, 0]
    
    return image

tshirt = remove_white_background(tshirt)

def overlay_image(background, overlay, x, y, width, height):
    overlay = cv2.resize(overlay, (width, height))

    for i in range(height):
        for j in range(width):
            if y + i >= background.shape[0] or x + j >= background.shape[1]:
                continue

            alpha = overlay[i, j, 3] / 255.0
            if alpha > 0:
                background[y + i, x + j] = (1 - alpha) * background[y + i, x + j] + alpha * overlay[i, j, :3]

    return background

cap = cv2.VideoCapture(0)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = pose.process(frame_rgb)

    if result.pose_landmarks:
        landmarks = result.pose_landmarks.landmark
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]

        if left_shoulder and right_shoulder:
            x1, y1 = int(left_shoulder.x * frame.shape[1]), int(left_shoulder.y * frame.shape[0])
            x2, y2 = int(right_shoulder.x * frame.shape[1]), int(right_shoulder.y * frame.shape[0])

            center_x = (x1 + x2) // 2  
            width = abs(x2 - x1) * 2  
            height = int(width * 1.5)  

            # Move T-shirt up slightly for better neck alignment
            x = max(0, center_x - width // 2)
            y = max(0, y1 - int(height * 0.2))  # Move up by 20% of T-shirt height

            frame = overlay_image(frame, tshirt, x, y, width, height)

    cv2.imshow("Virtual Try-On", frame)

    if cv2.waitKey(1) & 0xFF in [ord("q"), 27]:  
        break

cap.release()
cv2.destroyAllWindows()
