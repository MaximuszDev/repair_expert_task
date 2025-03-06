import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function InvoiceDetails() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const invoiceResponse = await axios.get(`http://127.0.0.1:5000/api/invoices/${id}`);
        setInvoice(invoiceResponse.data);

        const transactionsResponse = await axios.get(`http://127.0.0.1:5000/api/transactions`);
        setTransactions(transactionsResponse.data.filter(t => t.invoice_id === parseInt(id)));

        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных накладной:', error);
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!invoice) {
    return <div className="alert alert-danger">Накладная не найдена</div>;
  }

  return (
    <div className="invoice-details-container">
      <h2>Накладная №{invoice.id}</h2>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Дата:</strong> {invoice.date}</p>
              <p><strong>Клиент:</strong> {invoice.client_name}</p>
              {invoice.supplier_name && (
                <p><strong>Поставщик:</strong> {invoice.supplier_name}</p>
              )}
            </div>
            <div className="col-md-6">
              <p><strong>Общая сумма:</strong> {invoice.total_amount.toFixed(2)} Тенге</p>
            </div>
          </div>
        </div>
      </div>

      <h3>Материалы</h3>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Материал</th>
              <th>Цена</th>
              <th>Количество</th>
              <th>Общая стоимость</th>
            </tr>
          </thead>
          <tbody>
            {invoice.materials.map(material => (
              <tr key={material.id}>
                <td>{material.material_name}</td>
                <td>{material.price.toFixed(2)} Тенге</td>
                <td>{material.quantity}</td>
                <td>{material.total.toFixed(2)} Тенге</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan="3">Итого:</th>
              <th>{invoice.total_amount.toFixed(2)} Тенге</th>
            </tr>
          </tfoot>
        </table>
      </div>

      <h3>Связанные транзакции</h3>
      {transactions.length > 0 ? (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Описание</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>{transaction.description}</td>
                  <td className={transaction.amount < 0 ? 'text-danger' : 'text-success'}>
                    {transaction.amount.toFixed(2)}Тенге
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Нет связанных транзакций</p>
      )}

      <div className="mt-3">
        <Link to="/invoices" className="btn btn-secondary">
          Назад к списку накладных
        </Link>
        <Link to={`/clients/${invoice.client_id}`} className="btn btn-info ml-2">
          Перейти к клиенту
        </Link>
      </div>
    </div>
  );
}

export default InvoiceDetails;
