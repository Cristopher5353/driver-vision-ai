import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ShieldAlert, Truck, Activity, Bell, CheckCircle2, Clock } from 'lucide-react';

export default function App() {
  const [events, setEvents] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // 1. Cargar historial inicial de MongoDB vía REST API
  const fetchHistoricalEvents = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/events/drowsiness');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error al conectar con la API REST:', error);
    }
  };

  // 2. Conectar al WebSocket de Spring Boot mediante STOMP / SockJS
  useEffect(() => {
    fetchHistoricalEvents();

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-fleet'),
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);

        stompClient.subscribe('/topic/alerts', (message) => {
          if (message.body) {
            const newEvent = JSON.parse(message.body);
            
            // Actualizar alerta destacada
            setLatestAlert(newEvent);
            
            // Insertar al inicio de la tabla sin recargar
            setEvents((prev) => [newEvent, ...prev]);
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('Error STOMP:', frame.headers['message']);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  // KPIs
  const totalAlerts = events.length;
  const criticalAlerts = events.filter((e) => e.status === 'CRITICAL').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* HEADER Y ESTADO WEBSOCKET */}
      <header className="flex justify-between items-center pb-6 border-b border-slate-800 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
            <Truck className="text-blue-500" size={32} />
            FleetSafety Monitor
          </h1>
          <p className="text-sm text-slate-400">Torre de Control de Fatiga en Tiempo Real</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Estado WebSocket:</span>
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
            isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            {isConnected ? 'EN VIVO' : 'DESCONECTADO'}
          </span>
        </div>
      </header>

      {/* BANNER DE ALERTA POPUP EN TIEMPO REAL */}
      {latestAlert && (
        <div className="mb-6 bg-rose-950/80 border-2 border-rose-500 rounded-xl p-4 shadow-lg shadow-rose-950/50 animate-bounce">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="p-3 bg-rose-500 text-white rounded-lg flex items-center justify-center">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="font-bold text-rose-200 text-lg">
                  🚨 ¡ALERTA CRÍTICA DE SOMNOLENCIA REGISTRADA!
                </h3>
                <p className="text-sm text-rose-300">
                  Vehículo: <strong className="text-white">{latestAlert.vehicleId}</strong> | Conductor: <strong className="text-white">{latestAlert.driverId}</strong>
                </p>
                <div className="flex gap-4 text-xs text-rose-200 mt-2">
                  <span>EAR Detectado: <strong>{latestAlert.earValue}</strong></span>
                  <span>Duración Ojos Cerrados: <strong>{latestAlert.durationSeconds}s</strong></span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setLatestAlert(null)}
              className="px-3 py-1 bg-rose-900/50 hover:bg-rose-800 text-rose-200 text-xs rounded-md border border-rose-700"
            >
              Cerrar Alerta
            </button>
          </div>
        </div>
      )}

      {/* PANEL DE MÉTRICAS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">Total Incidentes</p>
            <p className="text-2xl font-extrabold text-white mt-1">{totalAlerts}</p>
          </div>
          <Activity className="text-blue-400" size={28} />
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">Eventos Críticos</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{criticalAlerts}</p>
          </div>
          <Bell className="text-rose-400" size={28} />
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">Última Sincronización</p>
            <p className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 size={16} /> Base de incidentes
            </p>
          </div>
          <Clock className="text-emerald-400" size={28} />
        </div>
      </div>

      {/* TABLA DE INCIDENTES EN MONGO DB */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-200">Historial de Eventos de Fatiga</h2>
          <span className="text-xs text-slate-400">{events.length} registros cargados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-3">Estado</th>
                <th className="p-3">Vehículo</th>
                <th className="p-3">Conductor</th>
                <th className="p-3">Valor EAR</th>
                <th className="p-3">Ojos Cerrados</th>
                <th className="p-3">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {events.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    No hay incidentes registrados.
                  </td>
                </tr>
              ) : (
                events.map((evt, idx) => (
                  <tr key={evt.id || idx} className="hover:bg-slate-700/20 transition-colors">
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        evt.status === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-white">{evt.vehicleId}</td>
                    <td className="p-3">{evt.driverId}</td>
                    <td className="p-3 font-mono text-slate-400">{evt.earValue}</td>
                    <td className="p-3 font-mono text-amber-300">{evt.durationSeconds}s</td>
                    <td className="p-3 text-xs text-slate-400">
                      {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}