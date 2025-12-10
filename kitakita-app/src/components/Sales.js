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
  const [showFilters, setShowFilters] = useState(false);
  const [productFilter, setProductFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [downloading, setDownloading] = useState(false);

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

  // Filter sales based on product and date
  const filteredSales = salesData.filter(sale => {
    const matchesProduct = productFilter === '' || 
      sale.productName.toLowerCase().includes(productFilter.toLowerCase());
    const matchesDate = dateFilter === '' || 
      new Date(sale.saleDate).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();
    return matchesProduct && matchesDate;
  });

  // Download sales as CSV
  const handleDownloadCsv = () => {
    setDownloading(true);
    try {
      const headers = ['Product', 'Sale Value', 'Quantity', 'Sale ID', 'Date'];
      const csvContent = [
        headers.join(','),
        ...filteredSales.map(sale => 
          [
            `"${sale.productName}"`,
            `"₱${parseFloat(sale.totalValue).toLocaleString()}"`,
            `"${sale.quantity}"`,
            `"${sale.saleCode}"`,
            `"${new Date(sale.saleDate).toLocaleDateString()}"`
          ].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kitakita-sales.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="sales">
      <div className="sales-header">
        <h1 className="page-title">Sales</h1>
        <div className="sales-actions">
          <button className="btn-primary-icon" onClick={() => setShowModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Sale
          </button>
          <button className="btn-filter" onClick={() => setShowFilters(!showFilters)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filters
          </button>
          <button className="btn-secondary-icon" onClick={handleDownloadCsv} disabled={downloading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {downloading ? 'Downloading...' : 'Download all'}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Product:</label>
            <input
              type="text"
              placeholder="Search by product name..."
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>Date:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-input"
            />
          </div>
          <button className="btn-clear-filters" onClick={() => {
            setProductFilter('');
            setDateFilter('');
          }}>
            Clear Filters
          </button>
        </div>
      )}

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
              {filteredSales.map((sale) => (
                <tr key={sale.saleId}>
                  <td>{sale.productName}</td>
                  <td>₱{parseFloat(sale.totalValue).toLocaleString()}</td>
                  <td>{sale.quantity}</td>
                  <td>{sale.saleCode}</td>
                  <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">No sales found</td>
                </tr>
              )}
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