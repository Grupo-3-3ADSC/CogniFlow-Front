import React from 'react';

const KpiIndicator = ({ positive, text }) => {
  return (
    <div id={positive ? "chart-aviso2" : "chart-aviso"} className="chart">
      <div
        style={{
          color: positive ? '#4CAF50' : '#FF4C4C',
          fontWeight: 'bold',
          fontSize: '14px',
          textAlign: 'center',
        }}
      >
        {positive ? '↑' : '↓'} {text}
      </div>
    </div>
  );
};

export default KpiIndicator;