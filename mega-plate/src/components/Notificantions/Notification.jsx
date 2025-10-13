import React, { useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { toast } from "react-toastify";

export default function Notification() {
  useEffect(() => {
    // Cria a conexão SockJS
    const socket = new SockJS("http://localhost:8080/ws-notifications");
    const client = new Client({
      webSocketFactory: () => socket, // Usa SockJS ao invés de brokerURL
      connectHeaders: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      debug: (str) => console.log(str), // opcional, mostra logs
      onConnect: () => {
        console.log("✅ Conectado ao WebSocket!");

        client.subscribe("/topic/notificacoes", (message) => {
          try {
            const payload = JSON.parse(message.body);
            console.log("📩 Notificação recebida:", payload);

            toast.info(payload.message || "Nova notificação recebida!");
          } catch (e) {
            console.warn("⚠️ Erro ao processar mensagem:", e, message.body);
          }
        });
      },
      onStompError: (frame) => {
        console.error("❌ Erro STOMP:", frame);
      },
    });

    client.activate();

    return () => {
      if (client.connected) {
        client.deactivate();
      }
    };
  }, []);

  return null; // Não renderiza nada
}
