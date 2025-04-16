import React from 'react';
import Login from './Pages/Login/Index';
import Cadastro from './Pages/Cadastro/Index';
import OrdemDeCompra from './Pages/OrdemDeCompra/Index';
import Verificacao from './Pages/Verificacao/Index';
import Transferencia from './Pages/Transferencia/Index';
import Redefinicao from './Pages/Redefinicao/Index';
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
        <Route path='/Transferencia' element={<Transferencia />} />
        <Route path='/Redefinicao' element={<Redefinicao />} />
      </Routes>
    </Router>
  );
}

export default App;