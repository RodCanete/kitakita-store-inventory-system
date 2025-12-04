import React, { useState, useEffect } from 'react';
import '../App.css';

export default function Sales({ token }) {
  const [salesData, setSalesData] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    unitPrice: '',
    totalValue: '',
    buyingPrice: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch sales and products from backend
  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/sales', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSalesData(data.content);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.content);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDiscard = () => {
    setFormData({
      productId: '',
      quantity: '',
      unitPrice: '',
      totalValue: '',
      buyingPrice: '',
      notes: ''
    });
    setShowModal(false);
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    try {
      // Find the selected product to get its price
      const selectedProduct = products.find(p => p.productId === parseInt(formData.productId));
      const quantity = parseInt(formData.quantity);
      const unitPrice = selectedProduct ? selectedProduct.sellingPrice : 0;
      const totalValue = unitPrice * quantity;
      const buyingPrice = selectedProduct ? selectedProduct.buyingPrice : 0;

      const saleRequest = {
        productId: parseInt(formData.productId),
        quantity: quantity,
        unitPrice: unitPrice,
        totalValue: totalValue,
        buyingPrice: buyingPrice,
        notes: formData.notes
      };

      const response = await fetch('http://localhost:8080/api/sales', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleRequest)
      });

      if (response.ok) {
        await fetchSales(); // Refresh the sales list
        handleDiscard(); // Close modal and reset form
      } else {
        console.error('Failed to add sale');
      }
    } catch (error) {
      console.error('Error adding sale:', error);
    }
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
        {loading ? (
          <div>Loading sales...</div>
        ) : (
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
              {salesData.map((sale) => (
                <tr key={sale.saleId}>
                  <td>{sale.productName}</td>
                  <td>₱{parseFloat(sale.totalValue).toLocaleString()}</td>
                  <td>{sale.quantity}</td>
                  <td>{sale.saleCode}</td>
                  <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
                    name="productId"
                    className="form-input"
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.productName}
                      </option>
                    ))}
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

              <div className="form-field">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  className="form-input"
                  placeholder="Enter notes (optional)"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
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