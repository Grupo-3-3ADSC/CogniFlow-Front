// App.jsx - Dashboard Material com KPIs dinâmicas baseadas em dados reais da API
import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'react-google-charts';
import { Search, X, AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import '../DashMaterial/styleMaterial.css';
import NavBar from '../../components/NavBar';
import {api} from '../../provider/api';

function App() {
  const [userPhoto, setUserPhoto] = useState('./User.png');
  const fileInputRef = useRef(null);
  
  // Estados para os filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedTransferType, setSelectedTransferType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Estado para modal de detalhes do alerta
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para os dados da API
  const [estoqueData, setEstoqueData] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [kpis, setKpis] = useState({
    materiaisAbaixoMinimo: [],
    materiaisAcimaMaximo: [],
    materiaisOk: [],
    totalMateriais: 0,
    percentualCritico: 0
  });
  
  // Estados para os gráficos (atualizados dinamicamente)
  const [pieData, setPieData] = useState([
    ['Status', 'Quantidade'],
    ['Normal', 0],
    ['Crítico', 0],
    ['Excesso', 0]
  ]);
  
  const [barData, setBarData] = useState([
    ['Material', 'Estoque Atual', 'Estoque Mínimo', 'Estoque Máximo']
  ]);
  
  const [lineData, setLineData] = useState([
    ['Material', 'Diferença do Mínimo'],
  ]);
  
  const [alertas, setAlertas] = useState([]);

  // Função para buscar dados do estoque
  function getEstoque() {
    api.get("/estoque").then((resposta) => {
      const dados = resposta.data;
      console.log('Dados recebidos:', dados);
      
      setEstoqueData(dados);
      
      // Extrair tipos únicos de materiais
      const tiposUnicos = [...new Set(dados.map(item => item.tipoMaterial))];
      setMateriais(tiposUnicos);
      
      // Processar KPIs
      processarKPIs(dados);
      
      // Atualizar gráficos
      atualizarGraficos(dados);
      
      // Gerar alertas
      gerarAlertas(dados);
      
    }).catch((err) => {
      console.log("Erro ao buscar estoque:", err);
    });
  }

  // Função para processar KPIs baseadas nos dados reais
  function processarKPIs(dados) {
    const materiaisAbaixoMinimo = [];
    const materiaisAcimaMaximo = [];
    const materiaisOk = [];
    
    dados.forEach(item => {
      const estoqueAtual = item.quantidadeAtual || 0;
      const estoqueMinimo = item.quantidadeMinima || 0;
      const estoqueMaximo = item.quantidadeMaxima || 0;
      
      if (estoqueAtual < estoqueMinimo) {
        materiaisAbaixoMinimo.push({
          ...item,
          diferenca: estoqueMinimo - estoqueAtual,
          percentual: estoqueMinimo > 0 ? ((estoqueAtual / estoqueMinimo) * 100).toFixed(1) : 0
        });
      } else if (estoqueAtual > estoqueMaximo && estoqueMaximo > 0) {
        materiaisAcimaMaximo.push({
          ...item,
          diferenca: estoqueAtual - estoqueMaximo,
          percentual: estoqueMaximo > 0 ? ((estoqueAtual / estoqueMaximo) * 100).toFixed(1) : 0
        });
      } else {
        materiaisOk.push({
          ...item,
          percentualMinimo: estoqueMinimo > 0 ? ((estoqueAtual / estoqueMinimo) * 100).toFixed(1) : 0
        });
      }
    });
    
    const totalMateriais = dados.length;
    const percentualCritico = totalMateriais > 0 ? 
      ((materiaisAbaixoMinimo.length / totalMateriais) * 100).toFixed(1) : 0;
    
    setKpis({
      materiaisAbaixoMinimo,
      materiaisAcimaMaximo,
      materiaisOk,
      totalMateriais,
      percentualCritico
    });
  }

  // Função para atualizar gráficos com dados reais
  function atualizarGraficos(dados) {
    // Gráfico de Pizza - Status do Estoque
    const statusCounts = {
      'Normal': 0,
      'Crítico': 0,
      'Excesso': 0,
      'Sem Estoque': 0
    };
    
    dados.forEach(item => {
      const estoqueAtual = item.quantidadeAtual || 0;
      const estoqueMinimo = item.quantidadeMinima || 0;
      const estoqueMaximo = item.quantidadeMaxima || 0;
      
      if (estoqueAtual === 0) {
        statusCounts['Sem Estoque']++;
      } else if (estoqueAtual < estoqueMinimo) {
        statusCounts['Crítico']++;
      } else if (estoqueAtual > estoqueMaximo && estoqueMaximo > 0) {
        statusCounts['Excesso']++;
      } else {
        statusCounts['Normal']++;
      }
    });
    
    const newPieData = [['Status', 'Quantidade']];
    Object.entries(statusCounts).forEach(([status, count]) => {
      if (count > 0) {
        newPieData.push([status, count]);
      }
    });
    
    setPieData(newPieData);
    
    // Gráfico de Barras - Comparação de Estoques
    const newBarData = [['Material', 'Estoque Atual', 'Estoque Mínimo', 'Estoque Máximo']];
    dados.forEach(item => {
      newBarData.push([
        item.tipoMaterial.substring(0, 10) + (item.tipoMaterial.length > 10 ? '...' : ''),
        item.quantidadeAtual || 0,
        item.quantidadeMinima || 0,
        item.quantidadeMaxima || 0
      ]);
    });
    
    setBarData(newBarData);
    
    // Gráfico de Linha - Diferença do Mínimo
    const newLineData = [['Material', 'Diferença do Mínimo']];
    dados.forEach(item => {
      const diferenca = (item.quantidadeAtual || 0) - (item.quantidadeMinima || 0);
      newLineData.push([
        item.tipoMaterial.substring(0, 8) + (item.tipoMaterial.length > 8 ? '...' : ''),
        diferenca
      ]);
    });
    
    setLineData(newLineData);
  }

  // Função para gerar alertas baseados nos dados reais
  function gerarAlertas(dados) {
    const novosAlertas = [];
    
    dados.forEach(item => {
      const estoqueAtual = item.quantidadeAtual || 0;
      const estoqueMinimo = item.quantidadeMinima || 0;
      const estoqueMaximo = item.quantidadeMaxima || 0;
      
      // Alerta de estoque crítico
      if (estoqueAtual < estoqueMinimo) {
        const diferenca = estoqueMinimo - estoqueAtual;
        const percentual = estoqueMinimo > 0 ? ((estoqueAtual / estoqueMinimo) * 100).toFixed(1) : 0;
        
        novosAlertas.push({
          id: `critico_${item.id}`,
          texto: `Estoque CRÍTICO - ${item.tipoMaterial}`,
          prioridade: estoqueAtual === 0 ? 'alta' : 'normal',
          detalhes: {
            material: item.tipoMaterial,
            estoqueAtual: estoqueAtual,
            estoqueMinimo: estoqueMinimo,
            diferenca: diferenca,
            percentualMinimo: percentual + '%',
            status: estoqueAtual === 0 ? 'SEM ESTOQUE' : 'ABAIXO DO MÍNIMO',
            acaoRecomendada: estoqueAtual === 0 ? 'REPOSIÇÃO URGENTE' : 'Programar reposição'
          }
        });
      }
      
      // Alerta de estoque em excesso
      if (estoqueAtual > estoqueMaximo && estoqueMaximo > 0) {
        const diferenca = estoqueAtual - estoqueMaximo;
        const percentual = ((estoqueAtual / estoqueMaximo) * 100).toFixed(1);
        
        novosAlertas.push({
          id: `excesso_${item.id}`,
          texto: `Estoque em EXCESSO - ${item.tipoMaterial}`,
          prioridade: 'baixa',
          detalhes: {
            material: item.tipoMaterial,
            estoqueAtual: estoqueAtual,
            estoqueMaximo: estoqueMaximo,
            diferenca: diferenca,
            percentualMaximo: percentual + '%',
            status: 'ACIMA DO MÁXIMO',
            acaoRecomendada: 'Avaliar redistribuição ou promoção'
          }
        });
      }
      
      // Alerta de estoque normal mas próximo do mínimo
      if (estoqueAtual >= estoqueMinimo && estoqueAtual <= (estoqueMinimo * 1.2) && estoqueMinimo > 0) {
        novosAlertas.push({
          id: `atencao_${item.id}`,
          texto: `Atenção - ${item.tipoMaterial} próximo do mínimo`,
          prioridade: 'baixa',
          detalhes: {
            material: item.tipoMaterial,
            estoqueAtual: estoqueAtual,
            estoqueMinimo: estoqueMinimo,
            percentualMinimo: ((estoqueAtual / estoqueMinimo) * 100).toFixed(1) + '%',
            status: 'PRÓXIMO DO MÍNIMO',
            acaoRecomendada: 'Monitorar e preparar reposição'
          }
        });
      }
    });
    
    // Se não há alertas, criar um de status ok
    if (novosAlertas.length === 0) {
      novosAlertas.push({
        id: 'status_ok',
        texto: 'Todos os estoques estão dentro dos parâmetros',
        prioridade: 'baixa',
        detalhes: {
          status: 'SISTEMA OK',
          totalMateriais: dados.length,
          materiaisNormais: dados.filter(item => {
            const atual = item.quantidadeAtual || 0;
            const minimo = item.quantidadeMinima || 0;
            const maximo = item.quantidadeMaxima || 0;
            return atual >= minimo && (maximo === 0 || atual <= maximo);
          }).length,
          ultimaVerificacao: new Date().toLocaleString('pt-BR')
        }
      });
    }
    
    setAlertas(novosAlertas);
  }

  // Função para obter o componente KPI baseado no status
  const renderKPI = (tipo, dados, icone, cor) => {
    return (
      <div id="chart-aviso" className="chart" style={{ borderLeft: `4px solid ${cor}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {icone}
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: cor, fontWeight: 'bold', fontSize: '16px' }}>
              {dados.length}
            </div>
            <div style={{ color: 'white', fontSize: '12px' }}>
              {tipo}
            </div>
            {dados.length > 0 && (
              <div style={{ color: '#ccc', fontSize: '10px', marginTop: '4px' }}>
                {dados[0].tipoMaterial.substring(0, 12)}
                {dados.length > 1 && ` +${dados.length - 1}`}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Função para obter ícone do alerta
  const getAlertIcon = (prioridade) => {
    switch (prioridade) {
      case 'alta':
        return <AlertTriangle size={16} color="#FF4C4C" />;
      case 'normal':
        return <AlertCircle size={16} color="#FFA500" />;
      case 'baixa':
        return <CheckCircle size={16} color="#4CAF50" />;
      default:
        return <Info size={16} color="#4586AB" />;
    }
  };

  // Função para abrir modal de detalhes do alerta
  const handleAlertClick = (alerta) => {
    setSelectedAlert(alerta);
    setIsModalOpen(true);
  };
  
  // Função para fechar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAlert(null);
  };

  // Verificar se a imagem de fundo foi carregada corretamente
  useEffect(() => {
    const testImage = new Image();
    testImage.src = '/assets/background.png';
    
    testImage.onerror = () => {
      document.body.classList.add('no-bg-image');
      console.log('Imagem de fundo não encontrada. Verifique o caminho: /assets/background.png');
    };
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    getEstoque();
  }, []);

  // Aplicar filtros quando mudarem (mantendo a lógica de filtros)
  useEffect(() => {
    if (estoqueData.length > 0) {
      let dadosFiltrados = estoqueData;
      
      // Aplicar filtro de material
      if (selectedMaterial) {
        dadosFiltrados = dadosFiltrados.filter(item => item.tipoMaterial === selectedMaterial);
      }
      
      // Aplicar filtro de busca
      if (searchTerm) {
        dadosFiltrados = dadosFiltrados.filter(item => 
          item.tipoMaterial.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Reprocessar com dados filtrados
      processarKPIs(dadosFiltrados);
      atualizarGraficos(dadosFiltrados);
      gerarAlertas(dadosFiltrados);
    }
  }, [searchTerm, selectedMaterial, selectedTransferType, startDate, endDate, estoqueData]);

  return (
    <div className='IndexMaterial'>
      <div className="container">
        <NavBar />

        <div className="filter-header">
          <select
            id="select-Filtro-Material" 
            value={selectedMaterial} 
            onChange={(e) => setSelectedMaterial(e.target.value)}
          >
            <option value="">Todos Materiais</option>
            {materiais.map((material, index) => (
              <option key={index} value={material}>
                {material}
              </option>
            ))}
          </select>

          <select
            id='select-Filtro-Trans'
            value={selectedTransferType} 
            onChange={(e) => setSelectedTransferType(e.target.value)}
          >
            <option value="">Todos os tipos</option>
            <option value="Interna">Interna</option>
            <option value="Externa">Externa</option>
          </select>

          <div id='FiltroData'>
            <span id='textFiltro'><h5>Início:</h5></span>
            <input 
              className='inputEstoque'
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div id='FiltroData'>
            <span id='textFiltro'><h5>Fim:</h5></span>
            <input 
              className='inputEstoque'
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Pesquisar material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="containerDash">
          <div className="dashboardMaterial">
            <h2>Dashboard Material</h2>

            <div id="charts-superior-material">
              <div>
                <div id="chart-produtos" className="chart">
                  <div id="titulo">
                    <h4 style={{ 
                      width: '100%',
                      color: 'white', 
                      fontSize: '14px', 
                      fontWeight: '700',
                      textAlign: 'center', 
                      margin: '0 0 15px 0',
                      padding: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px',
                      borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      letterSpacing: '0.5px'
                    }}>Materiais em Estoque ({materiais.length})</h4>
                  </div>
                  {materiais.length > 0 ? materiais.map((material, index) => (
                    <div id="Produto" key={index} title={material}>
                      {material.length > 15 ? material.substring(0, 15) + '...' : material}
                    </div>
                  )) : (
                    <div id="Produto">Carregando materiais...</div>
                  )}
                </div>
              </div>

              <div className="KpiMaterial">
                {renderKPI(
                  'Críticos', 
                  kpis.materiaisAbaixoMinimo, 
                  <TrendingDown size={20} />, 
                  '#FF4C4C'
                )}

                {renderKPI(
                  'Excesso', 
                  kpis.materiaisAcimaMaximo, 
                  <TrendingUp size={20} />, 
                  '#FFA500'
                )}

                <div id="chart-aviso3" className="chart" style={{ borderLeft: '4px solid #4CAF50' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <CheckCircle size={20} color="#4CAF50" />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '16px' }}>
                        {kpis.materiaisOk.length}
                      </div>
                      <div style={{ color: 'white', fontSize: '12px' }}>
                        Normais
                      </div>
                      <div style={{ color: '#4CAF50', fontSize: '10px', marginTop: '4px' }}>
                        {kpis.percentualCritico}% críticos
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div id="pie_chart1" className="chart">
                <h1 style={{ 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '700',
                  textAlign: 'center', 
                  margin: '0 0 15px 0',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  letterSpacing: '0.5px'
                }}>
                  Status do Estoque
                </h1>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  padding: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <Chart
                    chartType="PieChart"
                    data={pieData}
                    options={{
                      backgroundColor: 'transparent',
                      chartArea: { 
                        width: '70%', 
                        height: '75%' 
                      },
                      pieHole: 0.4,
                      pieSliceText: 'percentage',
                      pieSliceTextStyle: {
                        color: 'white',
                        fontSize: 12,
                        bold: true
                      },
                      legend: { 
                        position: 'none'
                      },
                      colors: ['#4CAF50', '#FF4C4C', '#FFA500', '#9E9E9E'],
                      slices: {
                        1: { offset: 0.03 }
                      },
                      pieSliceBorderColor: '#05314C',
                      tooltip: {
                        showColorCode: true,
                        textStyle: { 
                          color: '#05314C',
                          fontSize: 13
                        }
                      },
                      animation: {
                        startup: true,
                        duration: 1000,
                        easing: 'out'
                      }
                    }}
                    width="100%"
                    height="90%"
                  />
                </div>
              </div>
            </div>

            <div id="charts-inferior">
              <div id="bar_chartMaterial" className="chart">
                <h1 style={{ 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '700',
                  textAlign: 'center', 
                  margin: '0 0 15px 0',
                  padding: '8px 0',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  letterSpacing: '0.5px'
                }}>
                  Comparação de Estoques
                </h1>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  padding: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <Chart
                    chartType="ColumnChart"
                    data={barData}
                    options={{
                      backgroundColor: 'transparent',
                      legend: { 
                        position: 'top',
                        textStyle: { color: 'white', fontSize: 12 },
                        alignment: 'center'
                      },
                      hAxis: { 
                        textStyle: { color: 'white', fontSize: 10 },
                        slantedText: true,
                        slantedTextAngle: 45
                      },
                      vAxis: { textStyle: { color: 'white' } },
                      colors: ['#4586AB', '#FF4C4C', '#FFA500'],
                      chartArea: { 
                        width: '80%', 
                        height: '65%' 
                      },
                      bar: { groupWidth: '75%' }
                    }}
                    width="100%"
                    height="280px"
                  />
                </div>
              </div>
              <div id="line_chart" className="chart">
                <h1 style={{ 
                  color: 'white', 
                  fontSize: '14px', 
                  fontWeight: '700',
                  textAlign: 'center', 
                  margin: '0 0 15px 0',
                  padding: '8px 0',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  letterSpacing: '0.5px'
                }}>
                  Diferença do Estoque Mínimo
                </h1>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  padding: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <Chart
                    chartType="LineChart"
                    data={lineData}
                    options={{
                      backgroundColor: 'transparent',
                      legend: 'none',
                      hAxis: { 
                        textStyle: { color: 'white', fontSize: 10 },
                        slantedText: true,
                        slantedTextAngle: 45
                      },
                      vAxis: { 
                        textStyle: { color: 'white' },
                        baseline: 0,
                        baselineColor: '#FF4C4C'
                      },
                      colors: ['#4586AB'],
                      chartArea: { 
                        width: '80%', 
                        height: '75%' 
                      },
                      pointSize: 5,
                      lineWidth: 2
                    }}
                    width="100%"
                    height="280px"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="alerts">
            <h3>Alertas do Sistema ({alertas.length})</h3>
            <ul id="alert-list">
              {alertas.map((alerta) => (
                <li 
                  key={alerta.id} 
                  className={`alert-${alerta.prioridade} alert-clickable`}
                  onClick={() => handleAlertClick(alerta)}
                >
                  <div className="alert-content">
                    {getAlertIcon(alerta.prioridade)}
                    <span className="alert-text">{alerta.texto}</span>
                    <span className="alert-hint">clique para detalhes</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Modal de detalhes do alerta */}
        {isModalOpen && selectedAlert && (
          <div className="alert-modal-overlay" onClick={closeModal}>
            <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
              <div className="alert-modal-header">
                <h3>Detalhes do Alerta</h3>
                <button className="close-modal" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>
              <div className="alert-modal-content">
                <div className="alert-title">
                  {getAlertIcon(selectedAlert.prioridade)}
                  <span>{selectedAlert.texto}</span>
                </div>
                <div className="alert-details">
                  {Object.entries(selectedAlert.detalhes).map(([key, value]) => (
                    <div key={key} className="detail-item">
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong>
                      <span>{typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="alert-modal-footer">
                <button className="btn-close" onClick={closeModal}>Fechar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;