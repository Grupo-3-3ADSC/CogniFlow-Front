import React from 'react';
import Login from './Pages/Login/Index';
import Cadastro from './Pages/Cadastro/Index';
import OrdemDeCompra from './Pages/OrdemDeCompra/Index';
import Verificacao from './Pages/Verificacao/Index';
import Links from './Pages/Links';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/links' element={<Links />} />
        <Route path='/cadastro' element={<Cadastro />} />
        <Route path='/ordemDeCompra' element={<OrdemDeCompra />} />
        <Route path='/Verificacao' element={<Verificacao />} />
      </Routes>
    </Router>
  );
}

export default App;