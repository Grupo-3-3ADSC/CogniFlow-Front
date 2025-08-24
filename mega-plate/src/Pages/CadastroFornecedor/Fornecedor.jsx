import styles from './fornecedor.module.css';
import logo from '../../assets/logo-megaplate.png';
import { useState, useEffect, use } from 'react';
import NavBar from '../../components/NavBar';
import Swal from 'sweetalert2';
import { api } from '../../provider/api.js';
import { useNavigate } from 'react-router-dom';

export function CadastroFornecedor() {
  const navigate = useNavigate();
  const [progresso, setProgresso] = useState(1);
  const [formData, setFormData] = useState({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    cep: '',
    endereco: '',
    numero: '',
    telefone: '',
    email: '',
    responsavel: '',
    cargo: '',
    ie: ''
  });

  const cadastrarFornecedor = async () => {

    if (
      !formData.cnpj ||
      !formData.nomeFantasia ||
      !formData.razaoSocial ||
      !formData.cep ||
      !formData.endereco ||
      !formData.numero ||
      !formData.telefone ||
      !formData.email ||
      !formData.responsavel ||
      !formData.cargo ||
      !formData.ie
    ) {
      Swal.fire({
        title: "Preencha as informações",
        icon: "info",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const cepValido = await validarCEPExistente(formData.cep);
    if (!cepValido) {
      Swal.fire({
        title: "CEP inválido ou inexistente!",
        icon: "warning",
        confirmButtonColor: "#3085d6"
      });
      return;
    }

    const cnpjLimpo = formData.cnpj.replace(/\D/g, '');
    const cepLimpo = formData.cep.replace(/-/g, '');
    const telefoneSemMascara = formData.telefone.replace(/\D/g, '');


    if (!validarRazaoSocial(formData.razaoSocial)) {
      Swal.fire({ title: "Razão Social inválida", icon: "warning", confirmButtonColor: "#3085d6" });
      return;
    }
    if (!validarTelefone(formData.telefone)) {
      Swal.fire({ title: "Telefone inválido", icon: "warning", confirmButtonColor: "#3085d6" });
      return;
    }
    if (!validarNumero(formData.numero)) {
      Swal.fire({ title: "Número deve conter apenas dígitos", icon: "warning", confirmButtonColor: "#3085d6" });
      return;
    }
    if (!validarEmail(formData.email)) {
      Swal.fire({ title: "E-mail inválido", icon: "warning", confirmButtonColor: "#3085d6" });
      return;
    }
    if (!validarIe(formData.ie.replace(/\D/g, ''))) {
      Swal.fire({ title: "Inscrição Estadual inválida", icon: "warning", confirmButtonColor: "#3085d6" });
      return;
    }

    if (cnpjLimpo.length !== 14 || !validarCNPJ(cnpjLimpo)) {
      Swal.fire({ title: "CNPJ inválido", icon: "warning", confirmButtonColor: "#3085d6" });
      return;
    }

    if (todosDigitosIguais(cnpjLimpo)) {
      Swal.fire({ title: "CNPJ inválido (todos os dígitos iguais)", icon: "warning", confirmButtonColor: "#3085d6" });
      return;
    }
    if (todosDigitosIguais(telefoneSemMascara)) {
      Swal.fire({ title: "Telefone inválido (todos os dígitos iguais)", icon: "warning", confirmButtonColor: "#3085d6" });
      return;
    }

    const userData = {
      cnpj: cnpjLimpo.trim(),
      nomeFantasia: formData.nomeFantasia.trim(),
      razaoSocial: formData.razaoSocial.trim(),
      cep: cepLimpo.trim(),
      endereco: formData.endereco.trim(),
      numero: formData.numero.trim(),
      telefone: telefoneSemMascara.trim(),
      email: formData.email.trim(),
      responsavel: formData.responsavel.trim(),
      cargo: formData.cargo.trim(),
      ie: formData.ie.trim()
    };

    console.log(userData);
    api.post('/fornecedores', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      console.log('Resposta do servidor:', response.data);
      Swal.fire({
        title: "Fornecedor cadastrado com sucesso!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      setFormData({
        cnpj: '',
        nomeFantasia: '',
        razaoSocial: '',
        cep: '',
        endereco: '',
        numero: '',
        telefone: '',
        email: '',
        responsavel: '',
        cargo: '',
        ie: ''
      });
      setProgresso(1);
    }).catch((error) => {
      console.error('Erro ao cadastrar fornecedor:', error);
      Swal.fire({
        title: "Erro ao cadastrar fornecedor",
        text: "Erro: " + error.response.data.message || "Tente novamente mais tarde.",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    });
  };

  async function validarCEPExistente(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();
    return !data.erro;
  }

  useEffect(() => {
    const cepNumeros = formData.cep.replace(/\D/g, '');
    const cargo = parseInt(sessionStorage.getItem('cargoUsuario'), 10);
    if (cepNumeros.length === 8) {
      preencherEnderecoPorCEP(formData.cep);
    } else {

      setFormData((prev) => ({
        ...prev,
        endereco: ''
      }));
    } if (cargo !== 2) { // Verifica se o usuário não é gestor
      Swal.fire({
        title: "Acesso Negado",
        text: "Você não tem permissão para acessar esta página.",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      navigate('/material');
    }
  }, [formData.cep]);


  async function preencherEnderecoPorCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        Swal.fire({ title: "CEP não encontrado!", icon: "warning", confirmButtonColor: "#3085d6" });
        return;
      }

      const enderecoFormatado = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
      setFormData((prev) => ({
        ...prev,
        endereco: enderecoFormatado
      }));
    } catch (error) {
      Swal.fire({ title: "Erro ao buscar endereço", icon: "error", confirmButtonColor: "#3085d6" });
    }
  }


  function todosDigitosIguais(valor) {
    return /^(\d)\1+$/.test(valor);
  }

  function formatarCNPJ(valor) {
    return valor
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
      .slice(0, 18);
  }

  function formatarCEP(valor) {
    return valor
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  }

  function formatarIE(valor) {
    return valor.replace(/\D/g, '').slice(0, 12);
  }


  function formatarTelefone(valor) {
    const numeros = valor.replace(/\D/g, '');

    if (numeros.length <= 10) {
      return numeros
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 14);
    }

    return numeros
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  }


  function validarRazaoSocial(razao) {
    return typeof razao === 'string' && razao.trim().length >= 3;
  }

  function apenasNumeros(str) {
    return /^[0-9]+$/.test(str);
  }

  function validarCNPJ(cnpj) {
    return /^[0-9]{14}$/.test(cnpj);
  }

  function validarIe(ie) {
    // Permite "ISENTO" (em maiúsculas ou minúsculas)
    if (!ie) return false;
    if (ie.toUpperCase() === "ISENTO") return true;

    // Remove caracteres não numéricos
    const numeros = ie.replace(/\D/g, '');

    // IE geralmente tem entre 8 e 12 dígitos
    return /^[0-9]{8,12}$/.test(numeros);
  }


  function validarTelefone(telefone) {
    const apenasNumeros = telefone.replace(/\D/g, '');
    return apenasNumeros.length >= 10 && apenasNumeros.length <= 11;
  }


  function validarNumero(numero) {
    return apenasNumeros(numero);
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function avancar() {
    if (progresso === 1) {
      if (!formData.razaoSocial || !formData.nomeFantasia || !formData.cnpj) {
        Swal.fire({ title: "Campo obrigatórios não preenchidos!", icon: "warning", confirmButtonColor: "#3085d6" });
        return;
      }
      if (!validarCNPJ(formData.cnpj.replace(/\D/g, ''))) {
        Swal.fire({
          title: "CNPJ inválido",
          icon: "warning",
          confirmButtonColor: "#3085d6"
        });
        return;
      }
    }
    if (progresso === 2) {
      if (!formData.cep) {
        Swal.fire({ title: "CEP é obrigatório", icon: "warning", confirmButtonColor: "#3085d6" });
        return;
      }
      if (!formData.endereco) {
        Swal.fire({ title: "Endereço é obrigatório", icon: "warning", confirmButtonColor: "#3085d6" });
        return;
      }
      if (!formData.numero || !validarNumero(formData.numero)) {
        Swal.fire({ title: "Número deve conter apenas dígitos", icon: "warning", confirmButtonColor: "#3085d6" });
        return;
      }
    }
    setProgresso(progresso + 1);
  }

  function voltar() {
    if (progresso > 1) setProgresso(progresso - 1);
  }

  return (
    <>
      <NavBar />

      <div className={styles['tab-container']}></div>
      <section className={styles.material}>
        <div className={styles['bloco-fundo-material']}>
          <div className={styles['tab-container-user']}>
            <div className={styles.tabActiveMaterial}>CADASTRO DE FORNECEDOR</div>
          </div>
        </div>
        <aside className={styles['aside-material']}>
          <img src={logo} alt="MegaPlate logo" />
        </aside>
        <main className={styles['form-content-material']}>
          {progresso === 1 && (
            <>
              <div className={styles['input-group']}>
                <p>CNPJ
                  <span style={{}}> </span>
                  <span style={{ color: "red" }}>*</span>
                </p>
                <input
                  placeholder="Digite o CNPJ"
                  type="text"
                  inputMode='numeric'
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: formatarCNPJ(e.target.value) })}
                  maxLength={18}
                />
              </div>
              <div className={styles['input-group']}>
                <p>I.E (Opcional)
                  <span style={{}}> </span>
                </p>
                <input
                  placeholder="Digite o I.E (Inscrição Estadual)"
                  type="text"
                  inputMode='numeric'
                  value={formData.ie}
                  onChange={(e) => setFormData({ ...formData, ie: formatarIE (e.target.value) })}
                  maxLength={12}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Razão Social
                  <span style={{}}> </span>
                  <span style={{ color: "red" }}>*</span>
                </p>
                <input
                  placeholder="Digite a razão social"
                  type="text"
                  value={formData.razaoSocial}
                  onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '') })}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Nome fantasia
                  <span style={{}}> </span>
                  <span style={{ color: "red" }}>*</span>
                </p>
                <input
                  placeholder="Digite o Nome Fantasia"
                  type="text"
                  value={formData.nomeFantasia}
                  onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '') })}
                />
              </div>
            </>
          )}

          {progresso === 2 && (
            <>
              <div className={styles['input-group']}>
                <p>CEP
                  <span style={{}}> </span>
                  <span style={{ color: "red" }}>*</span>
                </p>
                <input
                  placeholder="Digite o CEP"
                  type="text"
                  inputMode='numeric'
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: formatarCEP(e.target.value) })}
                  maxLength={9}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Endereço</p>
                <input
                  placeholder="Digite o Endereço"
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '') })}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Número
                  <span style={{}}> </span>
                  <span style={{ color: "red" }}>*</span></p>
                <input
                  placeholder="Digite o Número"
                  type="text"
                  value={formData.numero}
                  inputMode='numeric'
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value.replace(/\D/g, '') })}
                />
              </div>
            </>
          )}

          {progresso === 3 && (
            <>
              <div className={styles['input-group']}>
                <p>Responsável <span style={{}}> </span>
                  <span style={{ color: "red" }}>*</span></p>
                <input
                  placeholder="Digite o nome do Responsável"
                  type="text"
                  inputMode='text'
                  value={formData.responsavel}
                  onChange={(e) =>
                    setFormData({ ...formData, responsavel: e.target.value })}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Cargo <span style={{}}> </span>
                  <span style={{ color: "red" }}>*</span></p>
                <input
                  placeholder="Digite o cargo do Responsável"
                  type="text"
                  inputMode='text'
                  value={formData.cargo}
                  onChange={(e) =>
                    setFormData({ ...formData, cargo: e.target.value })}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Telefone <span style={{}}> </span>
                  <span style={{ color: "red" }}>*</span></p>
                <input
                  placeholder="Digite o Telefone"
                  type="text"
                  inputMode='numeric'
                  maxLength={15}
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: formatarTelefone(e.target.value) })}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Email <span style={{}}> </span>
                  <span style={{ color: "red" }}>*</span></p>
                <input
                  placeholder="Digite o Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            {progresso > 1 && (
              <button onClick={voltar}>VOLTAR</button>
            )}
            {progresso < 3 && (
              <button onClick={avancar}>PRÓXIMO</button>
            )}
            {progresso === 3 && (
              <button id={styles['buttonCadastrar']} onClick={cadastrarFornecedor}>
                CADASTRAR
              </button>
            )}
          </div>
        </main>
      </section>
    </>
  );
}

export default CadastroFornecedor;