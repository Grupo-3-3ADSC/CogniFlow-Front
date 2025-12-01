import React, { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

export default function Notification() {
  const location = useLocation();

  // Bloqueia WS apenas no login
  if (location.pathname === "/") {
    return null;
  }

  console.log("MONTANDO Notification.jsx");

  const clientRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Iniciando WebSocket...");


    if (clientRef.current?.connected) {
      console.log("Conexão já existe e está ativa");
      return;
    }


    if (clientRef.current) {
      console.log("Limpando conexão antiga...");
      try {
        clientRef.current.deactivate();
      } catch (e) {
        console.log("Erro ao desconectar antiga:", e);
      }
      clientRef.current = null;
    }

    const socket = new SockJS("http://localhost:8080/ws-notifications");
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      debug: (str) => {
        // console.log("[STOMP]", str); // Descomente para debug
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("Conectado ao WebSocket!");

        client.subscribe("/topic/notificacoes", (message) => {
          try {
            const payload = JSON.parse(message.body);
            console.log("Notificação recebida:", payload);

            window.dispatchEvent(new CustomEvent("nova-notificacao", {
              detail: payload
            }));

            // Configuração de rotas
            const notificationConfig = {
              transferencia: {
                mensagem: "Transferência realizada com sucesso!",
                rota: "/HistoricoTransferencia"
              },
              ordem_compra: {
                mensagem: "Nova ordem de compra realizada!",
                rota: "/HistoricoOrdemDeCompra"
              },
              cadastro_fornecedor: {
                mensagem: "Novo fornecedor cadastrado!",
                rota: "/ListagemFornecedor"
              },
              cadastro_usuario: {
                mensagem: "Novo usuário cadastrado!",
                rota: "/TabelaUsuarios"
              },
              cadastro_estoque: {
                mensagem: "Estoque atualizado com nova ordem de compra!",
                rota: "/DashEstoque"
              }
            };

            const tipoEvento = payload.entity || payload.tipoEvento || payload.tipo;

            // Usa a mensagem do backend ou fallback para config
            const config = notificationConfig[tipoEvento] || {
              mensagem: payload.mensagem || payload.message || "Nova notificação recebida!",
              rota: notificationConfig[tipoEvento]?.rota || null
            };

            // Sobrescreve com mensagem do backend se existir
            if (payload.mensagem) {
              config.mensagem = payload.mensagem;
            }

            console.log("Exibindo toast:", config.mensagem);

            // Handler de navegação
            const handleNavigation = () => {
              try {
                if (config.rota) {
                  navigate(config.rota);
                  toast.dismiss();
                }
              } catch (error) {
                console.error("Erro ao navegar:", error);
                toast.error("Erro ao abrir a página solicitada");
              }
            };

            // Exibe toast
            // toast.info(
            //   <div style={{
            //     display: "flex",
            //     flexDirection: "column",
            //     gap: "6px"
            //   }}>
            //     <div style={{ fontWeight: "500", fontSize: "0.95rem" }}>
            //       {config.mensagem}
            //     </div>

            //     {config.rota && (
            //       <span
            //         onClick={handleNavigation}
            //         style={{
            //           color: "#007bff",
            //           cursor: "pointer",
            //           fontSize: "0.9rem",
            //           textDecoration: "underline",
            //           width: "fit-content"
            //         }}
            //       >
            //         Clique aqui para mais detalhes
            //       </span>
            //     )}
            //   </div>,
            //   {
            //     position: "top-right",
            //     autoClose: 6000,
            //     closeOnClick: false,
            //     pauseOnHover: true,
            //     draggable: true,
            //     hideProgressBar: false,
            //     closeButton: false
            //   }
            // );

          } catch (error) {
            console.error("Erro ao processar notificação:", error);
            toast.error("Erro ao processar notificação");
          }
        });
      },

      onStompError: (frame) => {
        console.error("Erro STOMP:", frame);
        toast.error("Erro na conexão com o servidor de notificações");
      },

      onWebSocketClose: () => {
        console.warn("Conexão WebSocket fechada");
      },

      onWebSocketError: (error) => {
        console.error("Erro WebSocket:", error);
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.log("Limpando componente...");
      if (clientRef.current?.connected) {
        try {
          clientRef.current.deactivate();
          console.log("Desconectado do WebSocket");
        } catch (e) {
          console.error("Erro ao desconectar:", e);
        }
      }
      clientRef.current = null;
    };
  }, [navigate]);

  return null;
}