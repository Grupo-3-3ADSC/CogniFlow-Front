// ChartComponent.jsx - Enhanced with professional styling
import React from 'react';
import { Chart } from 'react-google-charts';

const ChartComponent = ({ type, data, title, chartId }) => {
  const chartTypes = {
    pie: "PieChart",
    bar: "ColumnChart",
    line: "LineChart"
  };

  // Shared options for all charts
  const baseOptions = {
    backgroundColor: 'transparent',
    chartArea: { 
      width: '85%', 
      height: '75%',
      left: '10%', // Give more space for labels
    },
    legend: { 
      textStyle: { 
        color: 'white',
        fontSize: 12,
        fontName: 'Poppins'
      },
      position: type === 'pie' ? 'right' : 'top',
      alignment: 'center'
    },
    titleTextStyle: { 
      color: 'white', 
      fontSize: 16, 
      fontName: 'Poppins',
      bold: true
    },
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out'
    },
    tooltip: { 
      showColorCode: true,
      textStyle: { 
        color: '#05314C',
        fontSize: 13,
        fontName: 'Poppins'
      }
    }
  };

  // Chart specific options
  const chartSpecificOptions = {
    pie: {
      colors: ['#4DB6AC', '#4FC3F7', '#7986CB', '#9575CD', '#4DD0E1'],
      pieHole: 0.4, // Creates a donut chart
      slices: {
        1: { offset: 0.03 }, // Slightly explode one slice for emphasis
      },
      pieSliceTextStyle: {
        color: 'white',
        fontSize: 12
      },
      pieSliceBorderColor: '#05314C',
      is3D: false
    },
    bar: {
      colors: ['#4DB6AC', '#7986CB'],
      bar: { groupWidth: '75%' },
      hAxis: { 
        textStyle: { color: 'white', fontSize: 11, fontName: 'Poppins' },
        gridlines: { color: 'transparent' },
        baselineColor: 'white',
      },
      vAxis: { 
        textStyle: { color: 'white', fontSize: 11, fontName: 'Poppins' },
        gridlines: { color: 'rgba(255, 255, 255, 0.1)' },
        minorGridlines: { color: 'transparent' },
        baselineColor: 'white',
        format: 'short' // Use short number format
      }
    },
    line: {
      colors: ['#4DB6AC'],
      lineWidth: 3,
      pointSize: 6,
      pointShape: 'circle',
      curveType: 'function', // Smooth line
      hAxis: { 
        textStyle: { color: 'white', fontSize: 11, fontName: 'Poppins' },
        gridlines: { color: 'transparent' },
        baselineColor: 'white'
      },
      vAxis: { 
        textStyle: { color: 'white', fontSize: 11, fontName: 'Poppins' },
        gridlines: { color: 'rgba(255, 255, 255, 0.1)' },
        minorGridlines: { color: 'transparent' },
        baselineColor: 'white',
        format: 'short'
      },
      // Add subtle gradient under line
      series: {
        0: {
          areaOpacity: 0.2,
          fillOpacity: 0.3
        }
      }
    }
  };

  // Combine base options with chart specific options
  const finalOptions = {
    ...baseOptions,
    ...chartSpecificOptions[type],
    title: title
  };

  return (
    <div id={chartId} className="chart chart-animated">
      <div className="chart-header">
        <h4>{title}</h4>
        <div className="chart-actions">
          <span className="chart-action">⟳</span>
          <span className="chart-action">···</span>
        </div>
      </div>
      <Chart
        chartType={chartTypes[type]}
        data={data}
        options={finalOptions}
        width="100%"
        height="90%"
        loader={<div className="chart-loader">Carregando gráfico...</div>}
      />
    </div>
  );
};

export default ChartComponent;