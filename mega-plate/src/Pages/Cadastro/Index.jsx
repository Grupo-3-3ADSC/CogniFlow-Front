import styles from "./cadastro.module.css";
import logo from "../../assets/logo-megaplate.png";
import { useEffect, useState } from "react";
import { api } from "../../provider/api.js";
import NavBar from "../../components/NavBar";
import { useNavigate } from "react-router-dom";
import { toastSuccess, toastError, toastWarning } from "../../components/toastify/ToastifyService.jsx";
import { jwtDecode } from "jwt-decode";

export function Cadastro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cargo: {
      id: 1,
      nome: "comum",
    },
    password: "",
  });

  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const cargo = parseInt(sessionStorage.getItem("cargoUsuario"), 10);
    if (!token) {
      navigate("/");
    } else if (cargo !== 2) {
      toastError("Você não tem permissão para acessar esta página.");
      navigate("/material");
    } else {
      const { exp } = jwtDecode(token);
      if (Date.now() >= exp * 1000) {
        sessionStorage.removeItem("authToken");
        navigate("/");
      } else {
        setAutenticacaoPassou(true);
      }
    }
  }, []);

  if (!autenticacaoPassou) return null;

  // Funções de validação
  function validarNome(nome) {
    if (typeof nome !== "string") return false;
    const nomeLimpo = nome.trim();
    return /^[a-zA-ZÀ-ÿ\s]+$/.test(nomeLimpo) && nomeLimpo.split(/\s+/).length >= 2;
  }

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{3,}$/;
    return regex.test(email.trim());
  }

  function validarSenha(senha) {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/.test(senha);
  }

  function validarCargo(cargo) {
    return cargo === 1 || cargo === 2;
  }

  // Função para cadastrar usuário
  const cadastrar = () => {
    if (!formData.nome || !formData.email || !formData.cargo.id || !formData.password) {
      toastError("Por favor, preencha todos os campos!");
      return;
    }

    if (!validarNome(formData.nome)) {
      toastError("Nome inválido. É necessário ter nome e sobrenome.");
      return;
    }

    if (!validarEmail(formData.email)) {
      toastError("E-mail inválido. Ex: email@exemplo.com");
      return;
    }

    if (!validarSenha(formData.password)) {
      toastError("Senha inválida. Deve ter pelo menos 6 caracteres, uma letra, um número e um caractere especial.");
      return;
    }

    if (!validarCargo(formData.cargo?.id)) {
      toastError("Cargo inválido.");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      toastError("Token de autenticação não encontrado. Faça login novamente.");
      navigate("/");
      return;
    }

    const userData = {
      nome: formData.nome.trim(),
      email: formData.email.trim(),
      cargo: {
        id: formData.cargo.id,
        nome: formData.cargo.id === 1 ? "comum" : "gestor",
      },
      password: formData.password.trim(),
    };

    const sqlPattern = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b/i;
    if (sqlPattern.test(userData.email) || sqlPattern.test(userData.nome) || sqlPattern.test(userData.password)) {
      toastError("Por favor não cadastrar com comandos especiais...");
      return;
    }

    if (
      /<script.*?>.*?<\/script>/gi.test(userData.email) ||
      /<script.*?>.*?<\/script>/gi.test(userData.nome) ||
      /<script.*?>.*?<\/script>/gi.test(userData.password)
    ) {
      toastError("Por favor não cadastrar com comandos especiais...");
      return;
    }

    const endpoint = formData.cargo.id === 2 ? "/usuarios/gestor" : "/usuarios";

    api
      .post(endpoint, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log("Resposta do servidor:", response.data);
        toastSuccess("Usuário cadastrado com sucesso!");
        setFormData({
          nome: "",
          email: "",
          password: "",
          cargo: { id: 1, nome: "comum" },
        });
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 400) {
            toastError(error.response.data.message || "Dados inválidos. Verifique as informações.");
          } else if (error.response.status === 401) {
            toastError("Sessão expirada, faça login novamente!");
            navigate("/login");
          } else {
            toastError(error.response.data?.message || "Erro ao cadastrar usuário. Tente novamente mais tarde.");
          }
        } else {
          toastError("Erro de conexão. Verifique sua internet e tente novamente.");
        }
      });
  };

  return (
    <>
      <NavBar />

      <div className={styles["tab-container"]}></div>
      <section className={styles.cadastro}>
        <div className={styles["bloco-fundo"]}>
          <div className={styles["tab-container-user"]}>
            <div className={styles.tabActiveUsuario}>Cadastro de Usuário</div>
          </div>
        </div>
        <aside className={styles["aside-cadastro"]}>
          <img src={logo} alt="MegaPlate logo" />
        </aside>
        <main className={styles["form-content"]}>
          <div className={styles["input-group"]}>
            <p id="textCadastro">
              Nome e Sobrenome
              <span style={{}}> </span>
              <span style={{ color: "red" }}>*</span>
            </p>
            <input
              placeholder="Marcos Antonio"
              type="text"
              value={formData.nome}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nome: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""),
                })
              }
            />
          </div>

          <div className={styles["input-group"]}>
            <p id="textCadastro">
              Email
              <span style={{}}> </span>
              <span style={{ color: "red" }}>*</span>
            </p>
            <input
              placeholder="exemplo@dominio.com"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className={styles["input-group"]}>
            <p>
              Cargo
              <span style={{}}> </span>
              <span style={{ color: "red" }}>*</span>
            </p>
            <select
              value={formData.cargo?.id || 1}
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                setFormData({
                  ...formData,
                  cargo: {
                    id: selectedId,
                    nome: selectedId === 1 ? "comum" : "gestor",
                  },
                });
              }}
            >
              <option value={1}>Usuário Comum</option>
              <option value={2}>Gestor</option>
            </select>
          </div>

          <div className={styles["input-group"]}>
            <p id="textCadastro">
              Senha
              <span style={{}}> </span>
              <span style={{ color: "red" }}>*</span>
            </p>
            <input
              placeholder="********"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button id="buttonCadastrar" className={styles.buttonCadastrar} onClick={cadastrar}>
            CADASTRAR
          </button>
        </main>
      </section>
    </>
  );
}

export default Cadastro;
