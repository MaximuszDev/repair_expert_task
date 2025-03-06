import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SuppliersList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSupplier, setNewSupplier] = useState({ name: '', commission_percentage: 0 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/suppliers');
      setSuppliers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке поставщиков:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSupplier({
      ...newSupplier,
      [name]: name === 'commission_percentage' ? parseFloat(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/suppliers', newSupplier);
      setNewSupplier({ name: '', commission_percentage: 0 });
      setShowForm(false);
      fetchSuppliers();
    } catch (error) {
      console.error('Ошибка при добавлении поставщика:', error);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="suppliers-container">
      <h2>Список поставщиков</h2>

      <button
        className="btn btn-primary mb-3"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Отменить' : 'Добавить поставщика'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="supplier-form mb-4">
          <div className="form-group">
            <label>Название компании:</label>
            <input
              type="text"
              name="name"
              value={newSupplier.name}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Процент комиссии (%):</label>
            <input
              type="number"
              name="commission_percentage"
              value={newSupplier.commission_percentage}
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
            <th>Процент комиссии (%)</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(supplier => (
            <tr key={supplier.id}>
              <td>{supplier.id}</td>
              <td>{supplier.name}</td>
              <td>{supplier.commission_percentage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SuppliersList;