// App.jsx - Dashboard Material com NavBar integrada
import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'react-google-charts';
import '../DashMaterial/styleMaterial.css';
import NavBar from '../../components/NavBar'; // Importando a NavBar

function App() {
  const [userPhoto, setUserPhoto] = useState('./User.png');
  const fileInputRef = useRef(null);
  
  // Verificar se a imagem de fundo foi carregada corretamente
  useEffect(() => {
    const testImage = new Image();
    testImage.src = '/assets/background.png'; // Mesmo caminho usado no CSS
    
    testImage.onerror = () => {
      // Se a imagem não carregar, adiciona classe para estilo alternativo
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

  // Sample data for charts
  const pieData = [
    ['Material', 'Quantidade'],
    ['Material A', 45],
    ['Material B', 30],
    ['Material C', 25],
  ];

  const barData = [
    ['Mês', 'Produção', 'Meta'],
    ['Jan', 1000, 1200],
    ['Fev', 1170, 1200],
    ['Mar', 1250, 1200],
    ['Abr', 1330, 1200],
    ['Mai', 1200, 1200],
    ['Jun', 1100, 1200],
  ];

  const lineData = [
    ['Dia', 'Consumo'],
    ['01', 100],
    ['05', 120],
    ['10', 130],
    ['15', 90],
    ['20', 110],
    ['25', 135],
    ['30', 125],
  ];

  return (
    <div className='IndexMaterial'>
      <div className="container">
        {/* Substituir o header existente pela NavBar */}
        <NavBar />

        <div id="filtro">
          <div className="filter-header">
            <select id="select-Filtro">
              <option value="">Selecione 1</option>
              <option value="opcao1">Opção 1</option>
              <option value="opcao2">Opção 2</option>
              <option value="opcao3">Opção 3</option>
            </select>
            <select id="select-Filtro">
              <option value="">Selecione 2</option>
              <option value="opcaoA">Opção A</option>
              <option value="opcaoB">Opção B</option>
              <option value="opcaoC">Opção C</option>
            </select>
            <select id="select-Filtro">
              <option value="">Selecione 3</option>
              <option value="tipoX">Tipo X</option>
              <option value="tipoY">Tipo Y</option>
              <option value="tipoZ">Tipo Z</option>
            </select>
            <input type="date" id="dateInput" />
            <input type="date" id="dateInput" />
          </div>
        </div>

        <div className="containerDash">
          <div className="dashboardMaterial">
            <h2>Dashboard Material</h2>

            <div id="charts-superior-material">
              <div>
                <div id="chart-produtos" className="chart">
                  <div id="titulo">
                    <h4>Materiais</h4>
                  </div>
                  <div id="Produto">Produto1</div>
                  <div id="Produto">Produto2</div>
                  <div id="Produto">Produto3</div>
                </div>
              </div>

              <div className="KpiMaterial">
                {/* KPI Negativa */}
                <div id="chart-aviso" className="chart">
                  <div
                    style={{
                      color: '#FF4C4C',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      textAlign: 'center',
                    }}
                  >
                    ↓ Produção caiu 15% esta semana
                  </div>
                </div>

                {/* KPI Positiva */}
                <div id="chart-aviso2" className="chart">
                  <div
                    style={{
                      color: '#4CAF50',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      textAlign: 'center',
                    }}
                  >
                    ↑ Estoque aumentou 20% comparado à semana anterior
                  </div>
                </div>
              </div>

              <div id="pie_chart1" className="chart">
                <Chart
                  chartType="PieChart"
                  data={pieData}
                  options={{
                    title: 'Mais vendidos',
                    backgroundColor: 'transparent',
                    legend: { textStyle: { color: 'white' } },
                    titleTextStyle: { color: 'white' },
                    colors: ['#4586AB', '#7EB9D9', '#05314C'],
                  }}
                  width="100%"
                  height="100%"
                />
              </div>
            </div>

            <div id="charts-inferior">
              <div id="bar_chartMaterial" className="chart">
                <Chart
                  chartType="ColumnChart"
                  data={barData}
                  options={{
                    title: 'Estoque por setor',
                    backgroundColor: 'transparent',
                    legend: { textStyle: { color: 'white' } },
                    titleTextStyle: { color: 'white' },
                    hAxis: { textStyle: { color: 'white' } },
                    vAxis: { textStyle: { color: 'white' } },
                    colors: ['#4586AB', '#05314C'],
                  }}
                  width="100%"
                  height="100%"
                />
              </div>
              <div id="line_chart" className="chart">
                <Chart
                  chartType="LineChart"
                  data={lineData}
                  options={{
                    title: 'Media por mês',
                    backgroundColor: 'transparent',
                    legend: { textStyle: { color: 'white' } },
                    titleTextStyle: { color: 'white' },
                    hAxis: { textStyle: { color: 'white' } },
                    vAxis: { textStyle: { color: 'white' } },
                    colors: ['#4586AB'],
                  }}
                  width="100%"
                  height="100%"
                />
              </div>
            </div>
          </div>

          <div className="alerts">
            <h3>Alertas</h3>
            <ul id="alert-list">
              <li>Alerta 1: Verificar dados</li>
              <li id='alert2'>Alerta 2: Sistema atualizado</li>
              <li id='alert3'>Alerta 3: Erro detectado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;