import React, { useState } from 'react';
import '../App.css';

const salesData = [
  { product: 'Maggi', saleValue: 4306, quantity: '43 Packets', saleId: 7535, date: '11/12/22' },
  { product: 'Bru', saleValue: 2557, quantity: '22 Packets', saleId: 5724, date: '21/12/22' },
  { product: 'Red Bull', saleValue: 4075, quantity: '36 Packets', saleId: 2775, date: '5/12/22' },
  { product: 'Bourn Vita', saleValue: 5052, quantity: '14 Packets', saleId: 2275, date: '8/12/22' },
  { product: 'Horlicks', saleValue: 5370, quantity: '5 Packets', saleId: 2427, date: '9/1/23' },
  { product: 'Harpic', saleValue: 6065, quantity: '10 Packets', saleId: 2578, date: '9/1/23' },
  { product: 'Ariel', saleValue: 4078, quantity: '23 Packets', saleId: 2757, date: '15/12/23' },
  { product: 'Scotch Brite', saleValue: 3559, quantity: '43 Packets', saleId: 3757, date: '6/6/23' },
  { product: 'Coca cola', saleValue: 2055, quantity: '41 Packets', saleId: 2474, date: '11/11/22' },
];

export default function Sales() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    quantity: '',
    saleValue: '',
    date: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDiscard = () => {
    setFormData({
      product: '',
      quantity: '',
      saleValue: '',
      date: ''
    });
    setShowModal(false);
  };

  const handleAddSale = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Adding sale:', formData);
    handleDiscard();
  };

  return (
    <div className="sales">
      <div className="sales-header">
        <h1 className="page-title">Sales</h1>
        <div className="sales-actions">
          <button className="btn-primary" onClick={() => setShowModal(true)}>Add Sale</button>
          <button className="btn-secondary">
            <span style={{ marginRight: '8px' }}>🔍</span>
            Filters
          </button>
          <button className="btn-secondary">Order History</button>
        </div>
      </div>

      <div className="sales-table-container">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Products</th>
              <th>Sale Value</th>
              <th>Quantity</th>
              <th>Sale ID</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((sale, idx) => (
              <tr key={idx}>
                <td>{sale.product}</td>
                <td>P{sale.saleValue.toLocaleString()}</td>
                <td>{sale.quantity}</td>
                <td>{sale.saleId}</td>
                <td>{sale.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="pagination-btn" disabled>Previous</button>
        <span className="pagination-info">Page 1 of 10</span>
        <button className="pagination-btn">Next</button>
      </div>

      {/* Add Sale Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Add Sale</h2>
            
            <form onSubmit={handleAddSale} className="product-form">
              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Product</label>
                  <select
                    name="product"
                    className="form-input"
                    value={formData.product}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select product</option>
                    <option value="Maggi">Maggi</option>
                    <option value="Bru">Bru</option>
                    <option value="Red Bull">Red Bull</option>
                    <option value="Bourn Vita">Bourn Vita</option>
                    <option value="Horlicks">Horlicks</option>
                    <option value="Harpic">Harpic</option>
                    <option value="Ariel">Ariel</option>
                    <option value="Scotch Brite">Scotch Brite</option>
                    <option value="Coca cola">Coca cola</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-input"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Sale Value</label>
                  <input
                    type="number"
                    name="saleValue"
                    className="form-input"
                    placeholder="Enter sale value"
                    value={formData.saleValue}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    name="date"
                    className="form-input"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button type="button" className="btn-discard" onClick={handleDiscard}>
                  Discard
                </button>
                <button type="submit" className="btn-primary">
                  Add Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

