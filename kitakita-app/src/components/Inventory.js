import React, { useState } from 'react';
import '../App.css';
import ProductDetails from './ProductDetails';

const products = [
  { name: 'Lucky Me Pancit Canton', buyingPrice: 16, quantity: 43, unit: 'Packets', threshold: 12, expiryDate: '11/12/25', availability: 'In-stock' },
  { name: 'Chippy (small)', buyingPrice: 10, quantity: 22, unit: 'Packets', threshold: 12, expiryDate: '21/12/25', availability: 'Out of stock' },
  { name: 'Century Tuna (small can)', buyingPrice: 40, quantity: 36, unit: 'Packets', threshold: 9, expiryDate: '5/12/25', availability: 'In-stock' },
  { name: '555 Sardines', buyingPrice: 22, quantity: 14, unit: 'Packets', threshold: 6, expiryDate: '8/12/25', availability: 'Out of stock' },
  { name: 'Kopiko 3-in-1 sachet', buyingPrice: 9, quantity: 5, unit: 'Packets', threshold: 5, expiryDate: '9/1/25', availability: 'In-stock' },
  { name: 'Nescafé 3-in-1 sachet', buyingPrice: 11, quantity: 10, unit: 'Packets', threshold: 5, expiryDate: '9/1/25', availability: 'In-stock' },
  { name: 'Milo sachet', buyingPrice: 11, quantity: 23, unit: 'Packets', threshold: 7, expiryDate: '15/12/25', availability: 'Out of stock' },
  { name: 'Scotch Brite', buyingPrice: 20, quantity: 43, unit: 'Packets', threshold: 8, expiryDate: '6/6/25', availability: 'In-stock' },
  { name: 'Coca cola (1.5L)', buyingPrice: 90, quantity: 41, unit: 'Bottles', threshold: 10, expiryDate: '11/11/25', availability: 'Low stock' },
];

export default function Inventory() {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    productId: '',
    category: '',
    buyingPrice: '',
    quantity: '',
    unit: '',
    expiryDate: ''
  });

  const getAvailabilityClass = (availability) => {
    if (availability === 'Out of stock') return 'out-of-stock';
    if (availability === 'Low stock') return 'low-stock';
    return 'in-stock';
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
      productName: '',
      productId: '',
      category: '',
      buyingPrice: '',
      quantity: '',
      unit: '',
      expiryDate: ''
    });
    setShowModal(false);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Adding product:', formData);
    // Reset form and close modal
    handleDiscard();
  };

  return (
    <div className="inventory">
      <h1 className="page-title">Inventory</h1>

      {/* Overall Inventory */}
      <div className="overall-inventory">
        <div className="inventory-metric">
          <div className="inventory-metric-label blue">Categories</div>
          <div className="inventory-metric-value">14</div>
          <div className="inventory-metric-subtext">Last 7 days</div>
        </div>
        <div className="inventory-metric">
          <div className="inventory-metric-label orange">Total Products</div>
          <div className="inventory-metric-value">868</div>
          <div className="inventory-metric-subtext">Last 7 days</div>
          <div className="inventory-metric-secondary">₱25000</div>
          <div className="inventory-metric-secondary-label">Revenue</div>
        </div>
        <div className="inventory-metric">
          <div className="inventory-metric-label purple">Top Selling</div>
          <div className="inventory-metric-value">5</div>
          <div className="inventory-metric-subtext">Last 7 days</div>
          <div className="inventory-metric-secondary">₱2500</div>
          <div className="inventory-metric-secondary-label">Cost</div>
        </div>
        <div className="inventory-metric">
          <div className="inventory-metric-label red">Low Stocks</div>
          <div className="inventory-metric-value">12</div>
          <div className="inventory-metric-subtext">Ordered</div>
          <div className="inventory-metric-value-small">2</div>
          <div className="inventory-metric-secondary-label">Not in stock</div>
        </div>
      </div>

      {/* Products Section */}
      <div className="products-section">
        <div className="products-header">
          <h2>Products</h2>
          <div className="products-actions">
            <button className="btn-primary" onClick={() => setShowModal(true)}>Add Product</button>
            <button className="btn-secondary">Filters</button>
            <button className="btn-secondary">Download all</button>
          </div>
        </div>

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Products</th>
                <th>Buying Price</th>
                <th>Quantity</th>
                <th>Threshold Value</th>
                <th>Expiry Date</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr key={idx}>
                  <td 
                    className="product-name-clickable" 
                    onClick={() => setSelectedProduct(product)}
                    style={{ cursor: 'pointer', color: '#0b63e8' }}
                  >
                    {product.name}
                  </td>
                  <td>P{product.buyingPrice}</td>
                  <td>{product.quantity} {product.unit}</td>
                  <td>{product.threshold} {product.unit}</td>
                  <td>{product.expiryDate}</td>
                  <td>
                    <span className={`availability-badge ${getAvailabilityClass(product.availability)}`}>
                      {product.availability}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button className="pagination-btn">Previous</button>
          <span className="pagination-info">Page 1 of 10</span>
          <button className="pagination-btn">Next</button>
        </div>
      </div>

      {/* New Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">New Product</h2>
            
            {/* Image Upload Area */}
            <div className="image-upload-area">
              <div className="image-upload-icon">📷</div>
              <p className="image-upload-text">Drag image here or</p>
              <button className="image-upload-link">Browse image</button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleAddProduct} className="product-form">
              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    name="productName"
                    className="form-input"
                    placeholder="Enter product name"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Product ID</label>
                  <input
                    type="text"
                    name="productId"
                    className="form-input"
                    placeholder="Enter product ID"
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select product category</option>
                    <option value="Instant Food">Instant Food</option>
                    <option value="Alcohol">Alcohol</option>
                    <option value="Household">Household</option>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Buying Price</label>
                  <input
                    type="number"
                    name="buyingPrice"
                    className="form-input"
                    placeholder="Enter buying price"
                    value={formData.buyingPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-input"
                    placeholder="Enter product quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    name="unit"
                    className="form-input"
                    placeholder="Enter product unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  className="form-input"
                  placeholder="Enter expiry date"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button type="button" className="btn-discard" onClick={handleDiscard}>
                  Discard
                </button>
                <button type="submit" className="btn-primary">
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetails 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}


