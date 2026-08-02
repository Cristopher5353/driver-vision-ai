import requests
import json
import threading
import time
from database import save_event_locally, get_pending_events, delete_event

# URL de la API REST en Spring Boot
BACKEND_URL = "http://localhost:8080/api/v1/events/drowsiness"

def send_drowsiness_event(event_data: dict):
    """Intenta enviar el evento por HTTP REST. Si falla, lo manda a SQLite."""
    def _send():
        try:
            response = requests.post(BACKEND_URL, json=event_data, timeout=3)
            if response.status_code in [200, 201]:
                print(f"Evento enviado con éxito a la API Backend ({response.status_code}).")
            else:
                print(f"El servidor respondió con error {response.status_code}. Guardando localmente...")
                save_event_locally(event_data)
        except requests.exceptions.RequestException as e:
            print(f"Sin conexión con el servidor ({e}). Guardando en SQLite...")
            save_event_locally(event_data)

    # Ejecutar en un hilo separado para que no pause los FPS de OpenCV
    threading.Thread(target=_send, daemon=True).start()

def sync_worker():
    """Hilo de fondo que intenta vaciar la cola de SQLite periódicamente."""
    while True:
        time.sleep(15)  # Intenta sincronizar cada 15 segundos
        pending = get_pending_events()
        if pending:
            print(f"Intentando sincronizar {len(pending)} eventos pendientes de SQLite...")
            for event_id, payload_str in pending:
                try:
                    payload = json.loads(payload_str)
                    response = requests.post(BACKEND_URL, json=payload, timeout=3)
                    if response.status_code in [200, 201]:
                        delete_event(event_id)
                        print(f"  └─ Evento ID {event_id} sincronizado y eliminado de SQLite.")
                except requests.exceptions.RequestException:
                    print("  └─ Continúa sin conexión. Se reintentará en el próximo ciclo.")
                    break

def start_sync_worker():
    """Inicia el worker de sincronización en segundo plano."""
    threading.Thread(target=sync_worker, daemon=True).start()