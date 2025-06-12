import React from 'react';
import Login from './Pages/Login/Index';
import Cadastro from './Pages/Cadastro/Index';
import OrdemDeCompra from './Pages/OrdemDeCompra/Index';


import Verificacao from './Pages/Verificacao/Index';
import Transferencia from './Pages/Transferencia/Index';
import Redefinicao from './Pages/Redefinicao/Index';
import DashMaterial from './Pages/DashMaterial/AppMaterial'
import DashFornecedor from './Pages/DashFornecedor/App'
import Perfil from './Pages/Perfil/Index';



import {Route, BrowserRouter as Router, Routes} from 'react-router-dom';
import CadastroFornecedor from './Pages/CadastroFornecedor/Fornecedor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/Cadastro' element={<Cadastro />} />
        <Route path='/OrdemDeCompra' element={<OrdemDeCompra/>} />
        <Route path='/Perfil' element={<Perfil/>} />
        
        <Route path='/Verificacao' element={<Verificacao />} />
        <Route path='/Transferencia' element={<Transferencia />} />
        <Route path='/Redefinicao' element={<Redefinicao />} />
        <Route path='/Material' element={<DashMaterial />} />
        <Route path='/CadastroFornecedor' element={<CadastroFornecedor />} />
        <Route path='/Fornecedor' element={<DashFornecedor />} />
        
      </Routes>
    </Router>
  );
}

export default App;