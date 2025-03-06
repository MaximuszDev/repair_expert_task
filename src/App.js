import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import ClientsList from './components/ClientsList';
import SuppliersList from './components/SuppliersList';
import MaterialsList from './components/MaterialsList';
import InvoicesList from './components/InvoicesList';
import CreateInvoice from './components/CreateInvoice';
import ClientDetails from './components/ClientDetails';
import InvoiceDetails from './components/InvoiceDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Система управления накладными</h1>
          <nav>
            <ul className="nav-links">
              <li><Link to="/">Главная</Link></li>
              <li><Link to="/clients">Клиенты</Link></li>
              <li><Link to="/suppliers">Поставщики</Link></li>
              <li><Link to="/materials">Материалы</Link></li>
              <li><Link to="/invoices">Накладные</Link></li>
              <li><Link to="/create-invoice">Создать накладную</Link></li>
            </ul>
          </nav>
        </header>

        <main className="App-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clients" element={<ClientsList />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/suppliers" element={<SuppliersList />} />
            <Route path="/materials" element={<MaterialsList />} />
            <Route path="/invoices" element={<InvoicesList />} />
            <Route path="/invoices/:id" element={<InvoiceDetails />} />
            <Route path="/create-invoice" element={<CreateInvoice />} />
          </Routes>
        </main>

        <footer className="App-footer">
          <p>&copy; 2025 Система управления накладными</p>
        </footer>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="home-container">
      <h2>Система управления накладными</h2>
      <p>Это простое приложение для управления накладными на материалы.</p>
      <p>Вы можете:</p>
      <ul>
        <li>Создавать накладные на материалы</li>
        <li>Управлять клиентами и поставщиками</li>
        <li>Отслеживать долги клиентов</li>
        <li>Просматривать историю транзакций</li>
      </ul>
      <div className="cta-buttons">
        <Link to="/clients" className="btn btn-primary">Управление клиентами</Link>
        <Link to="/create-invoice" className="btn btn-success">Создать накладную</Link>
      </div>
    </div>
  );
}

export default App;
