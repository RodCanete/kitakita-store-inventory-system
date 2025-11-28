import React, { useState, useEffect } from 'react';
import '../App.css';
import ProductDetails from './ProductDetails';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    productCode: '',
    category: '',
    buyingPrice: '',
    quantity: '',
    unit: '',
    expiryDate: ''
  });

  // Get token from localStorage (assuming it's stored there after login)
  const token = localStorage.getItem('kitakita_token');

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Add authorization header if token is available
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiBase}/api/products`, {
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      // Transform backend data to match frontend structure
      const transformedProducts = data.map(product => ({
        id: product.productId,
        name: product.productName,
        productCode: product.productCode,
        buyingPrice: product.buyingPrice,
        quantity: product.quantity,
        unit: product.unit,
        threshold: product.thresholdValue,
        expiryDate: product.expiryDate,
        availability: product.isActive ? 'In-stock' : 'Out of stock'
      }));
      setProducts(transformedProducts);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

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
      productCode: '',
      category: '',
      buyingPrice: '',
      quantity: '',
      unit: '',
      expiryDate: ''
    });
    setShowModal(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!token) {
      setError('You must be logged in to add products');
      return;
    }
    
    try {
      // Transform form data to match backend Product entity
      const productData = {
        productName: formData.productName,
        productCode: formData.productCode,
        // Send just the category and supplier IDs, not objects
        categoryId: 1, // Default category ID
        supplierId: 1, // Default supplier ID
        buyingPrice: parseFloat(formData.buyingPrice),
        sellingPrice: parseFloat(formData.buyingPrice) * 1.2, // 20% markup
        unit: formData.unit,
        quantity: parseInt(formData.quantity),
        thresholdValue: 10, // Default threshold
        openingStock: parseInt(formData.quantity),
        onTheWay: 0,
        expiryDate: formData.expiryDate || null,
        isActive: true
      };
      
      const response = await fetch(`${apiBase}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add product: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      const newProduct = await response.json();
      console.log('Product added successfully:', newProduct);
      
      // Refresh the product list
      await fetchProducts();
      
      // Reset form and close modal
      handleDiscard();
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error.message);
    }
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

              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Product Code</label>
                  <input
                    type="text"
                    name="productCode"
                    className="form-input"
                    placeholder="Enter product code"
                    value={formData.productCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>

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
              </div>

              <div className="form-row-2">
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
              </div>

              <div className="form-row-2">
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

                <div className="form-field">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    className="form-input"
                    value={formData.expiryDate}
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


