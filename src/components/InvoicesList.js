import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function InvoicesList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/invoices');
      setInvoices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке накладных:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="invoices-container">
      <h2>Список накладных</h2>

      <Link to="/create-invoice" className="btn btn-success mb-3">
        Создать накладную
      </Link>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Дата</th>
            <th>Клиент</th>
            <th>Поставщик</th>
            <th>Сумма (Тенге)</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(invoice => (
            <tr key={invoice.id}>
              <td>{invoice.id}</td>
              <td>{invoice.date}</td>
              <td>{invoice.client_name}</td>
              <td>{invoice.supplier_name || '-'}</td>
              <td>{invoice.total_amount.toFixed(2)}</td>
              <td>
                <Link to={`/invoices/${invoice.id}`} className="btn btn-info btn-sm">
                  Подробнее
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {invoices.length === 0 && (
        <div className="alert alert-info">
          Накладных пока нет. Создайте первую накладную.
        </div>
      )}
    </div>
  );
}

export default InvoicesList;