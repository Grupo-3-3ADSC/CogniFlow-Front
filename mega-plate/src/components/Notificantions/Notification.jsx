import React, { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Notification() {
  const clientRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Previne múltiplas conexões
    if (clientRef.current) return;

    const socket = new SockJS("http://localhost:8080/ws-notifications");
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      debug: (str) => {
        // Descomenta a linha abaixo se quiser ver logs detalhados do STOMP
        // console.log(str);
      },
      reconnectDelay: 5000, // Reconecta automaticamente após 5s se cair
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log("Conectado ao WebSocket de notificações!");

        // Inscreve no tópico de notificações
        client.subscribe("/topic/notificacoes", (message) => {
          try {
            const payload = JSON.parse(message.body);
            console.log("Notificação recebida:", payload);
            console.log("Campos disponíveis:", Object.keys(payload));
            console.log("Valores:", payload);

            // Configuração de mensagens e rotas por tipo
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

            // Tenta extrair o tipo da mensagem recebida
            const tipoEvento = payload.entity || payload.tipoEvento || payload.tipo;
            
            // Se não tem tipo, tenta identificar pela mensagem
            let config;
            if (!tipoEvento && payload.message) {
              const mensagemLower = payload.message.toLowerCase();
              
              if (mensagemLower.includes("transferência") || mensagemLower.includes("transferencia")) {
                config = notificationConfig.transferencia;
              } else if (mensagemLower.includes("ordem") && mensagemLower.includes("compra")) {
                config = notificationConfig.ordem_compra;
              } else if (mensagemLower.includes("fornecedor")) {
                config = notificationConfig.cadastro_fornecedor;
              } else if (mensagemLower.includes("usuário") || mensagemLower.includes("usuario")) {
                config = notificationConfig.cadastro_usuario;
              } else if (mensagemLower.includes("estoque")) {
                config = notificationConfig.cadastro_estoque;
              } else {
                config = {
                  mensagem: payload.message || payload.mensagem || "Nova notificação recebida!",
                  rota: null
                };
              }
            } else {
              config = notificationConfig[tipoEvento] || {
                mensagem: payload.message || payload.mensagem || payload.mensagemToast || "Nova notificação recebida!",
                rota: payload.rota || null
              };
            }

            console.log("Tipo evento:", tipoEvento);
            console.log("Config selecionada:", config);

            // Handler de navegação com tratamento de erro
            const handleNavigation = () => {
              try {
                if (config.rota) {
                  navigate(config.rota);
                  toast.dismiss(); // Fecha todos os toasts ao navegar
                }
              } catch (error) {
                console.error("Erro ao navegar:", error);
                toast.error("Erro ao abrir a página solicitada");
              }
            };

            // Renderiza o toast com link clicável
            toast.info(
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "6px"
              }}>
                <div style={{ fontWeight: "500", fontSize: "0.95rem" }}>
                  {config.mensagem}
                </div>
                
                {config.rota && (
                  <span
                    onClick={handleNavigation}
                    style={{
                      color: "#007bff",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      textDecoration: "underline",
                      width: "fit-content"
                    }}
                  >
                    Clique aqui para mais detalhes
                  </span>
                )}
              </div>,
              {
                position: "top-right",
                autoClose: 6000,
                closeOnClick: false, // Não fecha ao clicar no toast (só no link)
                pauseOnHover: true,
                draggable: true,
                hideProgressBar: false,
                closeButton: false // Remove o botão X
              }
            );

          } catch (error) {
            console.error("Erro ao processar notificação:", error);
            toast.error("Erro ao processar notificação recebida");
          }
        });
      },

      onStompError: (frame) => {
        console.error("Erro STOMP:", frame);
        toast.error("Erro na conexão com o servidor de notificações", {
          position: "top-right",
          autoClose: 5000
        });
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

    // Cleanup ao desmontar o componente
    return () => {
      if (clientRef.current?.connected) {
        clientRef.current.deactivate();
        console.log("Desconectado do WebSocket");
      }
    };
  }, [navigate]);

  return null; // Componente invisível que apenas gerencia notificações
}