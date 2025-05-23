// App.jsx - Dashboard Material com NavBar integrada, filtros dinâmicos baseados no estoque e alertas clicáveis
import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'react-google-charts';
import { Search, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import '../DashMaterial/styleMaterial.css';
import NavBar from '../../components/NavBar'; // Importando a NavBar

function App() {
  const [userPhoto, setUserPhoto] = useState('./User.png');
  const fileInputRef = useRef(null);
  
  // Estados para os filtros baseados no AppEstoque
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedTransferType, setSelectedTransferType] = useState(''); // Novo filtro
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Estado para modal de detalhes do alerta
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para os dados dos gráficos
  const [pieData, setPieData] = useState([
    ['Tipo', 'Quantidade'],
    ['Interna', 50],
    ['Externa', 35],
  ]);
  
  const [barData, setBarData] = useState([
    ['Material', 'Estoque Atual', 'Estoque Mínimo'],
    ['SAE 1020', 550, 400],
    ['SAE 1045', 375, 300],
    ['HARDOX 450', 120, 150],
    ['SAE 1046', 200, 250],
    ['SAE 1048', 200, 180],
  ]);
  
  const [lineData, setLineData] = useState([
    ['Data', 'Entradas'],
    ['24/04', 200],
    ['25/04', 300],
    ['26/04', 120],
    ['27/04', 175],
    ['28/04', 250],
  ]);
  
  // Dados do estoque expandidos com tipo de transferência
  const stockData = [
    { material: 'SAE 1020', quantidade: 250, largura: '1.5m', espessura: '2mm', fornecedor: 'Fornecedor 1', data: '28/04/2025', hora: '08:30', tipoTransferencia: 'Interna' },
    { material: 'SAE 1045', quantidade: 175, largura: '2.0m', espessura: '3mm', fornecedor: 'Fornecedor 2', data: '27/04/2025', hora: '14:15', tipoTransferencia: 'Externa' },
    { material: 'HARDOX 450', quantidade: 120, largura: '1.8m', espessura: '4mm', fornecedor: 'Fornecedor 3', data: '26/04/2025', hora: '10:45', tipoTransferencia: 'Interna' },
    { material: 'SAE 1020', quantidade: 300, largura: '2.2m', espessura: '2.5mm', fornecedor: 'Fornecedor 4', data: '25/04/2025', hora: '16:20', tipoTransferencia: 'Externa' },
    { material: 'SAE 1045', quantidade: 200, largura: '1.9m', espessura: '2.8mm', fornecedor: 'Fornecedor 1', data: '24/04/2025', hora: '09:15', tipoTransferencia: 'Interna' },
    { material: 'HARDOX 450', quantidade: 150, largura: '2.1m', espessura: '3.5mm', fornecedor: 'Fornecedor 2', data: '23/04/2025', hora: '11:30', tipoTransferencia: 'Externa' },
    { material: 'SAE 1020', quantidade: 180, largura: '1.7m', espessura: '2.2mm', fornecedor: 'Fornecedor 3', data: '22/04/2025', hora: '13:45', tipoTransferencia: 'Interna' },
    { material: 'SAE 1045', quantidade: 220, largura: '2.3m', espessura: '3.1mm', fornecedor: 'Fornecedor 4', data: '21/04/2025', hora: '15:10', tipoTransferencia: 'Externa' },
  ];
  
  // Estado para produtos filtrados
  const [produtos, setProdutos] = useState(['SAE 1020', 'SAE 1045', 'HARDOX 450']);
  
  // Estado para alertas com detalhes expandidos
  const [alertas, setAlertas] = useState([
    { 
      id: 1, 
      texto: 'Estoque baixo - HARDOX 450', 
      prioridade: 'alta',
      detalhes: {
        material: 'HARDOX 450',
        estoqueAtual: 120,
        estoqueMinimo: 150,
        ultimaReposicao: '26/04/2025',
        fornecedor: 'Fornecedor 3',
        previsaoFalta: '3 dias',
        acaoRecomendada: 'Solicitar reposição urgente'
      }
    },
    { 
      id: 2, 
      texto: 'Nova entrada - SAE 1020', 
      prioridade: 'normal',
      detalhes: {
        material: 'SAE 1020',
        quantidade: 250,
        fornecedor: 'Fornecedor 1',
        dataEntrada: '28/04/2025',
        horaEntrada: '08:30',
        notaFiscal: 'NF-123456',
        localizacao: 'Setor A - Prateleira 15'
      }
    },
    { 
      id: 3, 
      texto: 'Meta de estoque atingida', 
      prioridade: 'baixa',
      detalhes: {
        material: 'SAE 1045',
        metaEstoque: 300,
        estoqueAtual: 375,
        percentualMeta: '125%',
        periodo: 'Abril/2025',
        responsavel: 'Equipe de Compras',
        proximaRevisao: '01/05/2025'
      }
    }
  ]);
  
  // Verificar se a imagem de fundo foi carregada corretamente
  useEffect(() => {
    const testImage = new Image();
    testImage.src = '/assets/background.png';
    
    testImage.onerror = () => {
      document.body.classList.add('no-bg-image');
      console.log('Imagem de fundo não encontrada. Verifique o caminho: /assets/background.png');
    };
  }, []);

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserPhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileClick = () => {
    fileInputRef.current.click();
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
  
  // Função para obter ícone do alerta
  const getAlertIcon = (prioridade) => {
    switch (prioridade) {
      case 'alta':
        return <AlertTriangle size={16} color="#FF4C4C" />;
      case 'normal':
        return <Info size={16} color="#4586AB" />;
      case 'baixa':
        return <CheckCircle size={16} color="#4CAF50" />;
      default:
        return <Info size={16} color="#4586AB" />;
    }
  };
  
  // Função para filtrar dados baseada nos filtros do estoque
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };
  
  const aplicarFiltros = () => {
    // Filtrar dados do estoque
    const filtered = stockData.filter(item => {
      const itemDate = parseDate(item.data);
      const startDateObj = startDate ? new Date(startDate) : null;
      const endDateObj = endDate ? new Date(endDate) : null;

      const materialMatch = !selectedMaterial || item.material === selectedMaterial;
      // Corrigindo o filtro de tipo de transferência - se vazio, mostra todos
      const transferTypeMatch = !selectedTransferType || item.tipoTransferencia === selectedTransferType;
      const dateInRange = (!startDateObj || itemDate >= startDateObj) &&
                          (!endDateObj || itemDate <= endDateObj);
      const searchMatch = !searchTerm ||
        item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tipoTransferencia.toLowerCase().includes(searchTerm.toLowerCase());

      return materialMatch && transferTypeMatch && dateInRange && searchMatch;
    });
    
    // Atualizar produtos baseado nos dados filtrados
    const uniqueMaterials = [...new Set(filtered.map(item => item.material))];
    setProdutos(uniqueMaterials);
    
    // Atualizar gráfico de pizza baseado nos dados filtrados (tipo de transferência)
    const transferTypeCounts = {};
    filtered.forEach(item => {
      transferTypeCounts[item.tipoTransferencia] = (transferTypeCounts[item.tipoTransferencia] || 0) + item.quantidade;
    });
    
    const newPieData = [['Tipo', 'Quantidade']];
    Object.entries(transferTypeCounts).forEach(([tipo, quantidade]) => {
      newPieData.push([tipo, quantidade]);
    });
    
    // Se não houver dados filtrados, mostrar dados padrão
    if (newPieData.length === 1) {
      newPieData.push(['Sem dados', 0]);
    }
    setPieData(newPieData);
    
    // Atualizar gráfico de barras
    const materialCounts = {};
    filtered.forEach(item => {
      materialCounts[item.material] = (materialCounts[item.material] || 0) + item.quantidade;
    });
    
    const newBarData = [['Material', 'Estoque Atual', 'Estoque Mínimo']];
    if (Object.keys(materialCounts).length > 0) {
      Object.entries(materialCounts).forEach(([material, quantidade]) => {
        const estoqueMinimo = material === 'HARDOX 450' ? 150 : 
                             material === 'SAE 1020' ? 400 : 
                             material === 'SAE 1045' ? 300 : 200;
        newBarData.push([material, quantidade, estoqueMinimo]);
      });
    } else {
      newBarData.push(['Sem dados', 0, 0]);
    }
    setBarData(newBarData);
    
    // Atualizar gráfico de linhas baseado nas datas filtradas
    const dateEntries = {};
    filtered.forEach(item => {
      const shortDate = item.data.substring(0, 5); // DD/MM
      dateEntries[shortDate] = (dateEntries[shortDate] || 0) + item.quantidade;
    });
    
    const newLineData = [['Data', 'Entradas']];
    if (Object.keys(dateEntries).length > 0) {
      Object.entries(dateEntries)
        .sort(([a], [b]) => {
          const [dayA, monthA] = a.split('/');
          const [dayB, monthB] = b.split('/');
          return new Date(2025, monthA - 1, dayA) - new Date(2025, monthB - 1, dayB);
        })
        .forEach(([date, quantidade]) => {
          newLineData.push([date, quantidade]);
        });
    } else {
      newLineData.push(['Sem dados', 0]);
    }
    setLineData(newLineData);
    
    // Atualizar alertas baseado nos dados filtrados
    let newAlertas = [];
    
    // Verificar estoques baixos
    Object.entries(materialCounts).forEach(([material, quantidade]) => {
      const estoqueMinimo = material === 'HARDOX 450' ? 150 : 
                           material === 'SAE 1020' ? 400 : 
                           material === 'SAE 1045' ? 300 : 200;
      
      if (quantidade < estoqueMinimo) {
        const materialInfo = filtered.find(item => item.material === material);
        newAlertas.push({
          id: `baixo_${material}`,
          texto: `Estoque baixo - ${material}`,
          prioridade: 'alta',
          detalhes: {
            material: material,
            estoqueAtual: quantidade,
            estoqueMinimo: estoqueMinimo,
            ultimaReposicao: materialInfo?.data || 'N/A',
            fornecedor: materialInfo?.fornecedor || 'N/A',
            tipoTransferencia: materialInfo?.tipoTransferencia || 'N/A',
            previsaoFalta: '3-5 dias',
            acaoRecomendada: 'Solicitar reposição urgente'
          }
        });
      }
    });
    
    // Alertas de novas entradas (últimas 24h)
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    
    filtered.forEach(item => {
      const itemDate = parseDate(item.data);
      if (itemDate >= ontem) {
        newAlertas.push({
          id: `entrada_${item.material}_${item.data}_${item.hora}`,
          texto: `Nova entrada - ${item.material} (${item.tipoTransferencia})`,
          prioridade: 'normal',
          detalhes: {
            material: item.material,
            quantidade: item.quantidade,
            fornecedor: item.fornecedor,
            dataEntrada: item.data,
            horaEntrada: item.hora,
            tipoTransferencia: item.tipoTransferencia,
            largura: item.largura,
            espessura: item.espessura,
            localizacao: 'Setor A - Prateleira ' + (Math.floor(Math.random() * 20) + 1)
          }
        });
      }
    });
    
    // Alertas de metas atingidas
    Object.entries(materialCounts).forEach(([material, quantidade]) => {
      const meta = material === 'SAE 1020' ? 500 : 
                   material === 'SAE 1045' ? 350 : 200;
      
      if (quantidade >= meta) {
        newAlertas.push({
          id: `meta_${material}`,
          texto: `Meta de estoque atingida - ${material}`,
          prioridade: 'baixa',
          detalhes: {
            material: material,
            metaEstoque: meta,
            estoqueAtual: quantidade,
            percentualMeta: Math.round((quantidade / meta) * 100) + '%',
            periodo: 'Abril/2025',
            responsavel: 'Equipe de Compras',
            proximaRevisao: '01/05/2025'
          }
        });
      }
    });
    
    // Alertas específicos por tipo de transferência
    const transferTypeStats = {};
    filtered.forEach(item => {
      if (!transferTypeStats[item.tipoTransferencia]) {
        transferTypeStats[item.tipoTransferencia] = { count: 0, total: 0 };
      }
      transferTypeStats[item.tipoTransferencia].count++;
      transferTypeStats[item.tipoTransferencia].total += item.quantidade;
    });
    
    Object.entries(transferTypeStats).forEach(([tipo, stats]) => {
      if (stats.count > 3) { // Se há muitas transferências do mesmo tipo
        newAlertas.push({
          id: `transfer_${tipo}`,
          texto: `Alto volume de transferências ${tipo.toLowerCase()}s`,
          prioridade: 'normal',
          detalhes: {
            tipoTransferencia: tipo,
            quantidadeTransferencias: stats.count,
            volumeTotal: stats.total,
            periodo: 'Últimos registros filtrados',
            observacao: `Detectado ${stats.count} transferências do tipo ${tipo}`,
            recomendacao: 'Verificar se o padrão está dentro do esperado'
          }
        });
      }
    });
    
    setAlertas(newAlertas.length > 0 ? newAlertas : [
      { 
        id: 'sem_dados', 
        texto: 'Nenhum alerta para os filtros selecionados', 
        prioridade: 'normal',
        detalhes: {
          message: 'Não há alertas baseados nos critérios de filtro atuais',
          sugestao: 'Tente ajustar os filtros para ver mais informações',
          filtrosAtivos: {
            material: selectedMaterial || 'Todos',
            tipoTransferencia: selectedTransferType || 'Todos',
            dataInicio: startDate || 'Não definida',
            dataFim: endDate || 'Não definida',
            pesquisa: searchTerm || 'Nenhuma'
          }
        }
      }
    ]);
  };
  
  // Aplicar filtros quando qualquer um deles mudar
  useEffect(() => {
    aplicarFiltros();
  }, [searchTerm, selectedMaterial, selectedTransferType, startDate, endDate]);

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
            <option id='select-Filtro-Material' value="" color='#FFFFFFF'>Todos Materiais</option>
            <option value="SAE 1020">SAE 1020</option>
            <option value="SAE 1045">SAE 1045</option>
            <option value="HARDOX 450">HARDOX 450</option>
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
              placeholder="Pesquisar material, fornecedor ou tipo..."
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
                }}>Materiais em Estoque</h4>
                  </div>
                  {produtos.length > 0 ? produtos.map((produto, index) => (
                    <div id="Produto" key={index}>{produto}</div>
                  )) : (
                    <div id="Produto">Nenhum material encontrado</div>
                  )}
                </div>
              </div>

              <div className="KpiMaterial">
                <div id="chart-aviso" className="chart">
                  <div
                    style={{
                      color: '#FF4C4C',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      textAlign: 'center',
                    }}
                  >
                    ↓ HARDOX 450 abaixo do mínimo
                  </div>
                </div>

                <div id="chart-aviso2" className="chart">
                  <div
                    style={{
                      color: '#4CAF50',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      textAlign: 'center',
                    }}
                  >
                    ↑ SAE 1045 acima da meta
                  </div>
                </div>

                <div id="chart-aviso3" className="chart">
                  <div
                    style={{
                      color: '#4586AB',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      textAlign: 'center',
                    }}
                  >
                    {selectedTransferType ? `Filtro: ${selectedTransferType}` : 'Todos os tipos'}
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
                  Tipo De Transferência
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
                      colors: ['#4586AB', '#7EB9D9', '#05314C', '#2E6B8A', '#1A4D6B'],
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
                  Estoque Atual vs. Estoque Mínimo
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
                      legend: 'none',
                      hAxis: { textStyle: { color: 'white' } },
                      vAxis: { textStyle: { color: 'white' } },
                      colors: ['#4586AB', '#FF4C4C'],
                      chartArea: { 
                        width: '80%', 
                        height: '65%' 
                      }
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
                  Entradas de Material
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
                      hAxis: { textStyle: { color: 'white' } },
                      vAxis: { textStyle: { color: 'white' } },
                      colors: ['#4586AB'],
                      chartArea: { 
                        width: '80%', 
                        height: '85%' 
                      }
                    }}
                    width="100%"
                    height="280px"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="alerts">
            <h3>Alertas do Sistema</h3>
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
                <fechar className="close-modal" onClick={closeModal}>
                  <X size={20} />
                </fechar>
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