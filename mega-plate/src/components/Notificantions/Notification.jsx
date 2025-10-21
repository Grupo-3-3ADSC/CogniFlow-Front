import React, { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Notification() {
  const clientRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (clientRef.current) return; // evita múltiplas conexões

    const socket = new SockJS("http://localhost:8080/ws-notifications");
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("Conectado ao WebSocket!");
        client.subscribe("/topic/notificacoes", (message) => {
          try {
            const payload = JSON.parse(message.body);
            console.log("Notificação recebida:", payload);

            toast.info(
              <div>
                <div>{payload.message || "Nova notificação recebida!"}</div>
                <div
                  style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline", marginTop: "4px" }}
                  onClick={() => navigate("/HistoricoTransferencia")}
                >
                  Clique aqui para detalhes
                </div>
              </div>,
              {
                position: "top-right",
                autoClose: 5000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          } catch (e) {
            console.warn("Erro ao processar mensagem:", e, message.body);
          }
        });
      },
      onStompError: (frame) => {
        console.error("Erro STOMP:", frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.deactivate();
      }
    };
  }, [navigate]);

  return null;
}
