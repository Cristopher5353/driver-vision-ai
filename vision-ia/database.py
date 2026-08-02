import sqlite3
import json
from datetime import datetime

DB_NAME = "offline_events.db"

def init_db():
    """Inicializa la base de datos local y la tabla de eventos pendientes."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pending_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payload TEXT NOT NULL,
            created_at TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING'
        )
    ''')
    conn.commit()
    conn.close()

def save_event_locally(event_data: dict):
    """Guarda un evento en SQLite cuando falla la conexión con el servidor."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO pending_events (payload, created_at)
        VALUES (?, ?)
    ''', (json.dumps(event_data), datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()
    print("Evento guardado localmente en SQLite (Offline Queue).")

def get_pending_events():
    """Obtiene todos los eventos pendientes de envío."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id, payload FROM pending_events WHERE status = 'PENDING'")
    rows = cursor.fetchall()
    conn.close()
    return rows

def delete_event(event_id: int):
    """Elimina el evento una vez que fue enviado con éxito al backend."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM pending_events WHERE id = ?", (event_id,))
    conn.commit()
    conn.close()