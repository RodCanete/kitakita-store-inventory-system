import React, { useState, useEffect } from 'react';
import '../App.css';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    quantity: '',
    unitPrice: ''
  });

  // Get token from localStorage (assuming it's stored there after login)
  const token = localStorage.getItem('kitakita_token');
  
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      console.log('Fetching sales with token:', token);
      
      // Add authorization header if token is available
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Making request to:', `${apiBase}/api/sales`);
      console.log('Headers:', headers);
      
      const response = await fetch(`${apiBase}/api/sales`, {
        headers: headers
      });
      
      console.log('Sales response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sales fetch error response:', errorText);
        throw new Error(`Failed to fetch sales: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Sales data received:', data);
      setSales(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProducts = async () => {
    try {
      console.log('Fetching products with token:', token);
      
      // Add authorization header if token is available
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Making request to:', `${apiBase}/api/products`);
      console.log('Headers:', headers);
      
      const response = await fetch(`${apiBase}/api/products`, {
        headers: headers
      });
      
      console.log('Products response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Products fetch error response:', errorText);
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Products data received:', data);
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If product is selected, automatically set the unit price
    if (name === 'product' && value) {
      const selectedProduct = products.find(p => p.productId === parseInt(value));
      if (selectedProduct) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          unitPrice: selectedProduct.sellingPrice || selectedProduct.buyingPrice || 0
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDiscard = () => {
    setFormData({
      product: '',
      quantity: '',
      unitPrice: ''
    });
    setShowModal(false);
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!token) {
      setError('You must be logged in to add sales');
      return;
    }
    
    try {
      // Validate form data
      if (!formData.product || !formData.quantity) {
        throw new Error('Please fill in all required fields');
      }
      
      // Log the form data for debugging
      console.log('Form data before sale creation:', formData);
      
      // Find the selected product
      const selectedProduct = products.find(p => p.productId === parseInt(formData.product));
      console.log('Selected product:', selectedProduct);
      
      if (!selectedProduct) {
        throw new Error('Selected product not found');
      }
      
      const quantity = parseInt(formData.quantity);
      const unitPrice = parseFloat(formData.unitPrice || selectedProduct.sellingPrice || selectedProduct.buyingPrice || 0);
      const totalValue = quantity * unitPrice;
      
      // Get buying price from the selected product
      const buyingPrice = selectedProduct ? parseFloat(selectedProduct.buyingPrice) : 0;
      
      const saleData = {
        saleCode: `SALE-${Date.now()}`, // Generate a unique sale code
        productId: parseInt(formData.product), // Send productId directly instead of nested object
        quantity: quantity,
        unitPrice: unitPrice,
        totalValue: totalValue,
        buyingPrice: buyingPrice,
        notes: ''
      };
      
      // Log the sale data being sent
      console.log('Sending sale data:', saleData);
      
      const response = await fetch(`${apiBase}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saleData)
      });
      
      console.log('Sale response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sale error response:', errorText);
        throw new Error(`Failed to add sale: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      const newSale = await response.json();
      console.log('Sale added successfully:', newSale);
      
      // Refresh the sales list
      await fetchSales();
      
      // Refresh the products list to show updated inventory quantities
      await fetchProducts();
      
      // Reset form and close modal
      handleDiscard();
    } catch (error) {
      console.error('Error adding sale:', error);
      setError(error.message);
    }
  };

  // Get the selected product for display purposes
  const selectedProduct = products.find(p => p.productId === parseInt(formData.product));

  return (
    <div className="sales">
      <div className="sales-header">
        <h1 className="page-title">Sales</h1>
        <div className="sales-actions">
          <button className="btn-primary" onClick={() => setShowModal(true)}>Add Sale</button>
          <button className="btn-secondary" onClick={fetchSales}>
            <span style={{ marginRight: '8px' }}>🔄</span>
            Refresh
          </button>
          <button className="btn-secondary">
            <span style={{ marginRight: '8px' }}>🔍</span>
            Filters
          </button>
          <button className="btn-secondary">Order History</button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="loading-message">
          Loading sales...
        </div>
      )}

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
            {sales.map((sale, idx) => (
              <tr key={idx}>
                <td>{sale.product?.productName || 'N/A'}</td>
                <td>₱{sale.totalValue?.toFixed(2) || '0.00'}</td>
                <td>{sale.quantity} {sale.product?.unit || ''}</td>
                <td>{sale.saleId || 'N/A'}</td>
                <td>{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'N/A'}</td>
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
                  {products.map(product => (
                    <option key={product.productId} value={product.productId}>
                      {product.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
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

                <div className="form-field">
                  <label className="form-label">Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    name="unitPrice"
                    className="form-input"
                    placeholder="Unit price"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    required
                  />
                  {selectedProduct && (
                    <div className="form-helper-text">
                      Default price: ₱{selectedProduct.sellingPrice || selectedProduct.buyingPrice || 0}
                    </div>
                  )}
                </div>
              </div>

              {selectedProduct && (
                <div className="form-field">
                  <label className="form-label">Total Value</label>
                  <input
                    type="text"
                    className="form-input"
                    value={`₱${(parseFloat(formData.quantity || 0) * parseFloat(formData.unitPrice || 0)).toFixed(2)}`}
                    readOnly
                  />
                </div>
              )}

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