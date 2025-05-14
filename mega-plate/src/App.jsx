import React from 'react';
import Login from './Pages/Login/Index';
import Cadastro from './Pages/Cadastro/Index';
import OrdemDeCompra from './Pages/OrdemDeCompra/Index';
import Estoque from './Pages/Estoque/Index';
import Setor from './Pages/Setor/Index';
import Verificacao from './Pages/Verificacao/Index';
import Transferencia from './Pages/Transferencia/Index';
import Redefinicao from './Pages/Redefinicao/Index';
import DashMaterial from './Pages/DashMaterial/AppMaterial'
import DashFornecedor from './Pages/DashFornecedor/App'
import Material from './Pages/CadastroMaterial/Material';
import DashEstoque from './Pages/DashEstoque/AppEstoque'



import {Route, BrowserRouter as Router, Routes} from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/Cadastro' element={<Cadastro />} />
        <Route path='/OrdemDeCompra' element={<OrdemDeCompra/>} />
        <Route path='/Estoque' element={<Estoque />} />
        <Route path='/Setor' element={<Setor />} />
        <Route path='/Verificacao' element={<Verificacao />} />
        <Route path='/Transferencia' element={<Transferencia />} />
        <Route path='/Redefinicao' element={<Redefinicao />} />
        <Route path='/Material' element={<DashMaterial />} />
        <Route path='/Fornecedor' element={<DashFornecedor />} />
        <Route path='/CadastroMaterial' element={<Material />} />
        <Route path='/DashEstoque' element={<DashEstoque />} />

      </Routes>
    </Router>
  );
}

export default App;