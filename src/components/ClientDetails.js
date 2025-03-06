import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ClientDetails() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const clientResponse = await axios.get(`http://127.0.0.1:5000/api/clients/${id}/debt`);
        setClient(clientResponse.data);

        const transactionsResponse = await axios.get(`http://127.0.0.1:5000/api/transactions?client_id=${id}`);
        setTransactions(transactionsResponse.data);

        const invoicesResponse = await axios.get('http://127.0.0.1:5000/api/invoices');
        setInvoices(invoicesResponse.data.filter(invoice => invoice.client_id === parseInt(id)));

        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных клиента:', error);
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!client) {
    return <div className="alert alert-danger">Клиент не найден</div>;
  }

  return (
    <div className="client-details-container">
      <h2>Информация о клиенте</h2>

      <div className="client-info card mb-4">
        <div className="card-body">
          <h3 className="card-title">{client.client_name}</h3>
          <div className="client-debt">
            <p className="mb-0">
              <strong>Общий долг: </strong>
              <span className={client.total_debt < 0 ? 'text-danger' : 'text-success'}>
                {Math.abs(client.total_debt).toFixed(2)} Тенге
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <h3>Накладные клиента</h3>
          {invoices.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Дата</th>
                    <th>Сумма</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.id}>
                      <td>{invoice.id}</td>
                      <td>{invoice.date}</td>
                      <td>{invoice.total_amount.toFixed(2)} Тенге</td>
                      <td>
                        <Link to={`/invoices/${invoice.id}`} className="btn btn-info btn-sm">
                          Подробнее
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>У клиента нет накладных</p>
          )}

          <Link to="/create-invoice" className="btn btn-primary">
            Создать накладную для клиента
          </Link>
        </div>

        <div className="col-md-6">
          <h3>История транзакций</h3>
          {transactions.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Сумма</th>
                    <th>Описание</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{transaction.date}</td>
                      <td className={transaction.amount < 0 ? 'text-danger' : 'text-success'}>
                        {transaction.amount.toFixed(2)} Тенге
                      </td>
                      <td>{transaction.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>У клиента нет транзакций</p>
          )}
        </div>
      </div>

      <div className="mt-3">
        <Link to="/clients" className="btn btn-secondary">
          Назад к списку клиентов
        </Link>
      </div>
    </div>
  );
}

export default ClientDetails;
