import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ClientsList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState({ name: '', markup_percentage: 0 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/clients');
      setClients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке клиентов:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({
      ...newClient,
      [name]: name === 'markup_percentage' ? parseFloat(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/api/clients', newClient);
      setNewClient({ name: '', markup_percentage: 0 });
      setShowForm(false);
      fetchClients();
    } catch (error) {
      console.error('Ошибка при добавлении клиента:', error);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="clients-container">
      <h2>Список клиентов</h2>

      <button
        className="btn btn-primary mb-3"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Отменить' : 'Добавить клиента'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="client-form mb-4">
          <div className="form-group">
            <label>Название компании:</label>
            <input
              type="text"
              name="name"
              value={newClient.name}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Процент наценки (%):</label>
            <input
              type="number"
              name="markup_percentage"
              value={newClient.markup_percentage}
              onChange={handleInputChange}
              className="form-control"
              min="0"
              step="0.1"
              required
            />
          </div>
          <button type="submit" className="btn btn-success">Сохранить</button>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Процент наценки (%)</th>
            <th>Долг (Тенге)</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td>{client.id}</td>
              <td>{client.name}</td>
              <td>{client.markup_percentage}</td>
              <td>{Math.abs(client.debt).toFixed(2)}</td>
              <td>
                <Link to={`/clients/${client.id}`} className="btn btn-info btn-sm">
                  Подробнее
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientsList;
