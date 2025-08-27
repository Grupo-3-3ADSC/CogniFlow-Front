import styles from './fornecedor.module.css';
import logo from '../../assets/logo-megaplate.png';
import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import { api } from '../../provider/api.js';
import { useNavigate } from 'react-router-dom';
import { toastSuccess, toastError, toastWarning, toastInfo } from "../../components/toastify/ToastifyService.jsx";

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
    cargo: ''
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
      !formData.cargo
    ) {
      toastInfo("Preencha as informações.");
      return;
    }

    const cepValido = await validarCEPExistente(formData.cep);
    if (!cepValido) {
      toastWarning("CEP inválido ou inexistente!");
      return;
    }

    const cnpjLimpo = formData.cnpj.replace(/\D/g, '');
    const cepLimpo = formData.cep.replace(/-/g, '');
    const telefoneSemMascara = formData.telefone.replace(/\D/g, '');

    if (!validarRazaoSocial(formData.razaoSocial)) {
      toastWarning("Razão Social inválida.");
      return;
    }
    if (!validarTelefone(formData.telefone)) {
      toastWarning("Telefone inválido.");
      return;
    }
    if (!validarNumero(formData.numero)) {
      toastWarning("Número deve conter apenas dígitos.");
      return;
    }
    if (!validarEmail(formData.email)) {
      toastWarning("E-mail inválido.");
      return;
    }

    if (cnpjLimpo.length !== 14 || !validarCNPJ(cnpjLimpo)) {
      toastWarning("CNPJ inválido.");
      return;
    }

    if (todosDigitosIguais(cnpjLimpo)) {
      toastWarning("CNPJ inválido (todos os dígitos iguais).");
      return;
    }
    if (todosDigitosIguais(telefoneSemMascara)) {
      toastWarning("Telefone inválido (todos os dígitos iguais).");
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
      cargo: formData.cargo.trim()
    };

    api.post('/fornecedores', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      console.log('Resposta do servidor:', response.data);
      toastSuccess("Fornecedor cadastrado com sucesso!");
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
        cargo: ''
      });
      setProgresso(1);
    }).catch((error) => {
      console.error('Erro ao cadastrar fornecedor:', error);
      toastError(error.response?.data?.message || "Erro ao cadastrar fornecedor. Tente novamente mais tarde.");
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
    }

    if (cargo !== 2) {
      toastError("Acesso Negado: Você não tem permissão para acessar esta página.");
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
        toastWarning("CEP não encontrado!");
        return;
      }

      const enderecoFormatado = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
      setFormData((prev) => ({
        ...prev,
        endereco: enderecoFormatado
      }));
    } catch (error) {
      toastError("Erro ao buscar endereço.");
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
        toastWarning("Por favor, preencha todos os campos!");
        return;
      }
      if (!validarCNPJ(formData.cnpj.replace(/\D/g, ''))) {
        toastWarning("CNPJ inválido.");
        return;
      }
    }
    if (progresso === 2) {
      if (!formData.cep) {
        toastWarning("CEP é obrigatório.");
        return;
      }
      if (!formData.endereco) {
        toastWarning("Endereço é obrigatório.");
        return;
      }
      if (!formData.numero || !validarNumero(formData.numero)) {
        toastWarning("Número deve conter apenas dígitos.");
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
            <div className={styles.tabActiveMaterial}>Cadastro de Fornecedor</div>
          </div>
        </div>
        <aside className={styles['aside-material']}>
          <img src={logo} alt="MegaPlate logo" />
        </aside>
        <main className={styles['form-content-material']}>
          {/* ... mantém os inputs iguais */}
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
