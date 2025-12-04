import React from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import Login from './Pages/Login/Index';
import Cadastro from './Pages/Cadastro/Index';
import OrdemDeCompra from './Pages/OrdemDeCompra/Index';
import Perfil from './Pages/Perfil/Index';
import Verificacao from './Pages/Verificacao/Index';
import Transferencia from './Pages/Transferencia/Index';
import Redefinicao from './Pages/Redefinicao/Index';
import DashMaterial from './Pages/DashMaterial/AppMaterial';
import DashFornecedor from './Pages/DashFornecedor/App';
import DashEstoque from './Pages/DashEstoque/AppEstoque';
import CadastroFornecedor from './Pages/CadastroFornecedor/Fornecedor';
import { TabelaUsuarios } from './Pages/TabelaUsuarios/TabelaUsuarios';
import { Historicos } from './Pages/Historicos/Historicos';
import { HistoricoTransferencia } from './Pages/Historicos/HistoricoTransferencia';
import ListagemFornecedor from './Pages/ListagemFornecedor/ListagemFornecedor';
import Relatorios from './Pages/Relatorios/Index';
import RelatorioMaterial from './Pages/RelatorioMaterial/Index';
import RelatorioFornecedor from './Pages/RelatorioFornecedor/Index';
import Notification from './components/Notificantions/Notification';

function AppContent() {
  const location = useLocation();

  // Condicional: não exibe notificações no login e cadastro
  const showNotifications = !["/", "/Cadastro"].includes(location.pathname);

  return (
    <>
    
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/Cadastro' element={<Cadastro />} />
        <Route path='/OrdemDeCompra' element={<OrdemDeCompra />} />
        <Route path='/Perfil' element={<Perfil />} />
        <Route path='/Verificacao' element={<Verificacao />} />
        <Route path='/Transferencia' element={<Transferencia />} />
        <Route path="/Redefinicao/:email" element={<Redefinicao />} />
        <Route path='/Redefinicao' element={<Redefinicao />} />
        <Route path='/Material' element={<DashMaterial />} />
        <Route path='/CadastroFornecedor' element={<CadastroFornecedor />} />
        <Route path='/Fornecedor' element={<DashFornecedor />} />
        <Route path='/DashEstoque' element={<DashEstoque />} />
        <Route path='/TabelaUsuarios' element={<TabelaUsuarios />} />
        <Route path='/Relatorios' element={<Relatorios />} />
        <Route path='/RelatorioMaterial' element={<RelatorioMaterial />} />
        <Route path='/RelatorioFornecedor' element={<RelatorioFornecedor />} />
        <Route path='/HistoricoOrdemDeCompra' element={<Historicos />} />
        <Route path='/HistoricoTransferencia' element={<HistoricoTransferencia />} />
        <Route path='/ListagemFornecedor' element={<ListagemFornecedor />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <Notification /> {/* <-- FIXO, monta só uma vez */}
      
      <AppContent />
      <ToastContainer position="top-right"
        closeButton={false} />
    </Router>
  );
}


export default App;
