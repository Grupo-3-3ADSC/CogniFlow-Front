import React from 'react';
import  Login  from './Pages/Login/Index';
import Cadastro from './Pages/Cadastro/Index';
import {Route, BrowserRouter as Router, Routes} from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/cadastro' element={<Cadastro />} />
      </Routes>
    </Router>
  );
}

export default App;