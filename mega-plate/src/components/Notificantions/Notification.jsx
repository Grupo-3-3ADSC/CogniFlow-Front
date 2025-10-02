import React, { useEffect } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export default function Notificacoes() {
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws-notifications");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      console.log("Conectado ao WebSocket");

      stompClient.subscribe("/topic/notificacoes", (msg) => {
        console.log("Notificação recebida:", msg.body);
        alert("Nova notificação: " + msg.body);
      });
    });
  }, []);

  return <h1>Notificações em tempo real</h1>;
}
