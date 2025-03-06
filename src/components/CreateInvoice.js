import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateInvoice() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [invoice, setInvoice] = useState({
    client_id: '',
    supplier_id: '',
    materials: []
  });
  const [selectedMaterial, setSelectedMaterial] = useState({
    material_id: '',
    quantity: 1
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, suppliersRes, materialsRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/clients'),
          axios.get('http://127.0.0.1:5000/api/suppliers'),
          axios.get('http://127.0.0.1:5000/api/materials')
        ]);

        setClients(clientsRes.data);
        setSuppliers(suppliersRes.data);
        setMaterials(materialsRes.data);

        if (clientsRes.data.length > 0) {
          setInvoice(prev => ({ ...prev, client_id: clientsRes.data[0].id }));
        }

        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoice({
      ...invoice,
      [name]: value
    });
  };
  const handleMaterialChange = (e) => {
    const { name, value } = e.target;
    setSelectedMaterial({
      ...selectedMaterial,
      [name]: name === 'quantity' ? parseInt(value, 10) : value
    });
  };

  const addMaterial = () => {
    if (!selectedMaterial.material_id || selectedMaterial.quantity < 1) {
      alert('Выберите материал и укажите количество');
      return;
    }

    const alreadyAdded = invoice.materials.some(
      item => item.material_id === selectedMaterial.material_id
    );

    if (alreadyAdded) {
      const updatedMaterials = invoice.materials.map(item =>
        item.material_id === selectedMaterial.material_id
          ? { ...item, quantity: item.quantity + selectedMaterial.quantity }
          : item
      );
      setInvoice({ ...invoice, materials: updatedMaterials });
    } else {
      setInvoice({
        ...invoice,
        materials: [...invoice.materials, { ...selectedMaterial }]
      });
    }

    setSelectedMaterial({
      material_id: '',
      quantity: 1
    });
  };

  const removeMaterial = (materialId) => {
    setInvoice({
      ...invoice,
      materials: invoice.materials.filter(item => item.material_id !== materialId)
    });
  };

  const calculateTotal = () => {
    return invoice.materials.reduce((total, item) => {
      const material = materials.find(m => m.id === parseInt(item.material_id));
      return total + (material ? material.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!invoice.client_id) {
      alert('Выберите клиента');
      return;
    }

    if (invoice.materials.length === 0) {
      alert('Добавьте хотя бы один материал');
      return;
    }

    try {
      await axios.post('http://127.0.0.1:5000/api/invoices', invoice);
      navigate('/invoices');
    } catch (error) {
      console.error('Ошибка при создании накладной:', error);
      alert('Произошла ошибка при создании накладной');
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="alert alert-warning">
        Сначала необходимо добавить хотя бы одного клиента.
        <button
          className="btn btn-primary ml-3"
          onClick={() => navigate('/clients')}
        >
          Добавить клиента
        </button>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="alert alert-warning">
        Сначала необходимо добавить хотя бы один материал.
        <button
          className="btn btn-primary ml-3"
          onClick={() => navigate('/materials')}
        >
          Добавить материал
        </button>
      </div>
    );
  }

  return (
    <div className="create-invoice-container">
      <h2>Создание накладной</h2>

      <form onSubmit={handleSubmit} className="invoice-form">
        <div className="form-section">
          <h3>1. Клиент и поставщик</h3>

          <div className="form-group">
            <label>Клиент:</label>
            <select
              name="client_id"
              value={invoice.client_id}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">-- Выберите клиента --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} (наценка: {client.markup_percentage}%)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Поставщик (необязательно):</label>
            <select
              name="supplier_id"
              value={invoice.supplier_id}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="">-- Без поставщика --</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} (комиссия: {supplier.commission_percentage}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>2. Материалы</h3>

          <div className="add-material-form">
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Материал:</label>
                <select
                  name="material_id"
                  value={selectedMaterial.material_id}
                  onChange={handleMaterialChange}
                  className="form-control"
                >
                  <option value="">-- Выберите материал --</option>
                  {materials.map(material => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.price} Тенге)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group col-md-4">
                <label>Количество:</label>
                <input
                  type="number"
                  name="quantity"
                  value={selectedMaterial.quantity}
                  onChange={handleMaterialChange}
                  className="form-control"
                  min="1"
                />
              </div>

              <div className="form-group col-md-2 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addMaterial}
                >
                  Добавить
                </button>
              </div>
            </div>
          </div>

          {invoice.materials.length > 0 ? (
            <table className="table mt-3">
              <thead>
                <tr>
                  <th>Материал</th>
                  <th>Цена</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {invoice.materials.map(item => {
                  const material = materials.find(m => m.id === parseInt(item.material_id));
                  return material ? (
                    <tr key={item.material_id}>
                      <td>{material.name}</td>
                      <td>{material.price.toFixed(2)} Тенге</td>
                      <td>{item.quantity}</td>
                      <td>{(material.price * item.quantity).toFixed(2)} Тенге</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeMaterial(item.material_id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ) : null;
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="3">Итого:</th>
                  <th>{calculateTotal().toFixed(2)} Тенге</th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="alert alert-info mt-3">
              Добавьте материалы в накладную
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>3. Информация о долге</h3>

          {invoice.client_id && (
            <div className="debt-info">
              <p>
                <strong>Стоимость материалов:</strong> {calculateTotal().toFixed(2)} Тенге
              </p>

              {clients.find(c => c.id === parseInt(invoice.client_id)) && (
                <p>
                  <strong>Наценка ({clients.find(c => c.id === parseInt(invoice.client_id)).markup_percentage}%):</strong>
                  {(calculateTotal() * clients.find(c => c.id === parseInt(invoice.client_id)).markup_percentage / 100).toFixed(2)} Тенге
                </p>
              )}

              <p className="total-debt">
                <strong>Итоговый долг клиента:</strong>
                {(calculateTotal() + (calculateTotal() * (clients.find(c => c.id === parseInt(invoice.client_id))?.markup_percentage || 0) / 100)).toFixed(2)}Тенге
              </p>

              {invoice.supplier_id && suppliers.find(s => s.id === parseInt(invoice.supplier_id)) && (
                <div className="supplier-info">
                  <p>
                    <strong>Комиссия поставщика ({suppliers.find(s => s.id === parseInt(invoice.supplier_id)).commission_percentage}%):</strong>
                    {(calculateTotal() * suppliers.find(s => s.id === parseInt(invoice.supplier_id)).commission_percentage / 100).toFixed(2)} Тенге
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-success">
            Создать накладную
          </button>
          <button
            type="button"
            className="btn btn-secondary ml-2"
            onClick={() => navigate('/invoices')}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateInvoice;