import cv2
import numpy as np
import time
import os
from datetime import datetime
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Módulos de red y persistencia local
from database import init_db
from api_client import send_drowsiness_event, start_sync_worker
from datetime import datetime, timezone

# --- CONFIGURACIÓN DE AUDIO (WINDOWS) ---
try:
    import winsound
    def play_alarm_beep():
        winsound.Beep(2500, 300)
except ImportError:
    def play_alarm_beep():
        print('\a', end='', flush=True)

# --- INICIALIZAR BASE DE DATOS Y WORKER DE RED ---
init_db()
start_sync_worker()

# --- CARGAR EL MODELO DE MEDIAPIPE ---
MODEL_PATH = "face_landmarker.task"
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"No se encontró '{MODEL_PATH}'. Descárgalo en la misma carpeta.")

base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    output_face_blendshapes=False,
    output_facial_transformation_matrixes=False,
    num_faces=1
)
detector = vision.FaceLandmarker.create_from_options(options)

# --- ÍNDICES Y CÁLCULO DE EAR ---
LEFT_EYE = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33, 160, 158, 133, 153, 144]

def calculate_ear(landmarks, eye_indices, w, h):
    coords = [np.array([landmarks[idx].x * w, landmarks[idx].y * h]) for idx in eye_indices]
    v1 = np.linalg.norm(coords[1] - coords[5])
    v2 = np.linalg.norm(coords[2] - coords[4])
    h_dist = np.linalg.norm(coords[0] - coords[3])
    return 0.0 if h_dist == 0 else (v1 + v2) / (2.0 * h_dist)

# --- CONFIGURACIÓN DEL SISTEMA ---
EAR_THRESHOLD = 0.21
TIME_THRESHOLD = 1.5
VEHICLE_ID = "BUS-104"
DRIVER_ID = "DRIVER-882"

COUNTER_START_TIME = None
ALERT_TRIGGERED = False

cap = cv2.VideoCapture(0)

try:
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

        detection_result = detector.detect(mp_image)

        if detection_result.face_landmarks:
            landmarks = detection_result.face_landmarks[0]
            left_ear = calculate_ear(landmarks, LEFT_EYE, w, h)
            right_ear = calculate_ear(landmarks, RIGHT_EYE, w, h)
            avg_ear = (left_ear + right_ear) / 2.0

            cv2.putText(frame, f"EAR: {avg_ear:.2f}", (30, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            if avg_ear < EAR_THRESHOLD:
                if COUNTER_START_TIME is None:
                    COUNTER_START_TIME = time.time()
                else:
                    elapsed_time = time.time() - COUNTER_START_TIME
                    if elapsed_time >= TIME_THRESHOLD:
                        cv2.putText(frame, "¡ALERTA! CONDUCTOR DORMIDO", (30, 100),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 3)
                        play_alarm_beep()

                        # Disparar evento de red solo 1 vez por incidente
                        if not ALERT_TRIGGERED:
                            payload = {
                                "vehicleId": VEHICLE_ID,
                                "driverId": DRIVER_ID,
                                "earValue": round(avg_ear, 3),
                                "durationSeconds": round(elapsed_time, 2),
                               "timestamp": datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
                            }
                            send_drowsiness_event(payload)
                            ALERT_TRIGGERED = True
            else:
                COUNTER_START_TIME = None
                ALERT_TRIGGERED = False
        else:
            COUNTER_START_TIME = None
            ALERT_TRIGGERED = False

        cv2.imshow(f"Monitoring Unit - {VEHICLE_ID}", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

finally:
    cap.release()
    cv2.destroyAllWindows()