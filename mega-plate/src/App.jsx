import React from 'react';
import  Login  from './Pages/Login/Index';
import Cadastro from './Pages/Cadastro/Index';
import Estoque from './Pages/Estoque/Index';
import Setor from './Pages/Setor/Index';

import {Route, BrowserRouter as Router, Routes} from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/cadastro' element={<Cadastro />} />
        <Route path='/estoque' element={<Estoque />} />
        <Route path='/setor' element={<Setor />} />
      </Routes>
    </Router>
  );
}

export default App;