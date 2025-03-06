import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MaterialsList() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMaterial, setNewMaterial] = useState({ name: '', price: 0 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/materials');
      setMaterials(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке материалов:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial({
      ...newMaterial,
      [name]: name === 'price' ? parseFloat(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/api/materials', newMaterial);
      setNewMaterial({ name: '', price: 0 });
      setShowForm(false);
      fetchMaterials();
    } catch (error) {
      console.error('Ошибка при добавлении материала:', error);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="materials-container">
      <h2>Список материалов</h2>

      <button
        className="btn btn-primary mb-3"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Отменить' : 'Добавить материал'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="material-form mb-4">
          <div className="form-group">
            <label>Название материала:</label>
            <input
              type="text"
              name="name"
              value={newMaterial.name}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Цена (Тенге):</label>
            <input
              type="number"
              name="price"
              value={newMaterial.price}
              onChange={handleInputChange}
              className="form-control"
              min="0"
              step="0.01"
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
            <th>Цена (Тенге)</th>
          </tr>
        </thead>
        <tbody>
          {materials.map(material => (
            <tr key={material.id}>
              <td>{material.id}</td>
              <td>{material.name}</td>
              <td>{material.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MaterialsList;