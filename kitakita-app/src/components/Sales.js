import React, { useState, useEffect } from 'react';
import '../App.css';

export default function Sales({ token }) {
  const [salesData, setSalesData] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editingSaleId, setEditingSaleId] = useState(null);
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // Clear errors for this field
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
      
      // Auto-calculate prices when product or quantity changes
      if (name === 'productId' || name === 'quantity') {
        const selectedProduct = products.find(p => p.productId === parseInt(updated.productId));
        if (selectedProduct) {
          const quantity = parseInt(updated.quantity) || 0;
          const unitPrice = selectedProduct.sellingPrice;
          const totalValue = unitPrice * quantity;
          const buyingPrice = selectedProduct.buyingPrice;
          
          updated.unitPrice = unitPrice.toString();
          updated.totalValue = totalValue.toString();
          updated.buyingPrice = buyingPrice.toString();
          
          // Validate quantity if product is selected
          if (updated.productId && updated.quantity) {
            const availableQuantity = selectedProduct.quantity;
            let maxAllowedQuantity = availableQuantity;
            
            // In edit mode, add back the current sale quantity to available stock
            if (formMode === 'edit' && editingSaleId) {
              const currentSale = salesData.find(s => s.saleId === editingSaleId);
              if (currentSale && currentSale.productId === selectedProduct.productId) {
                maxAllowedQuantity = availableQuantity + currentSale.quantity;
              }
            }
            
            if (quantity <= 0) {
              setFormErrors(prevErrors => ({
                ...prevErrors,
                quantity: 'Quantity must be greater than 0'
              }));
            } else if (quantity > maxAllowedQuantity) {
              setFormErrors(prevErrors => ({
                ...prevErrors,
                quantity: `Quantity cannot exceed available stock (${maxAllowedQuantity} ${selectedProduct.unit})`
              }));
            }
          }
          
          // If product changed, clear quantity if it's invalid for the new product
          if (name === 'productId' && updated.quantity) {
            const availableQuantity = selectedProduct.quantity;
            let maxAllowedQuantity = availableQuantity;
            
            if (formMode === 'edit' && editingSaleId) {
              const currentSale = salesData.find(s => s.saleId === editingSaleId);
              if (currentSale && currentSale.productId === selectedProduct.productId) {
                maxAllowedQuantity = availableQuantity + currentSale.quantity;
              }
            }
            
            const quantity = parseInt(updated.quantity) || 0;
            if (quantity > maxAllowedQuantity) {
              setFormErrors(prevErrors => ({
                ...prevErrors,
                quantity: `Quantity cannot exceed available stock (${maxAllowedQuantity} ${selectedProduct.unit})`
              }));
            }
          }
        }
      }
      
      return updated;
    });
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      unitPrice: '',
      totalValue: '',
      buyingPrice: '',
      notes: ''
    });
    setFormMode('create');
    setEditingSaleId(null);
    setError(null);
    setFormErrors({});
  };

  const handleDiscard = () => {
    resetForm();
    setShowModal(false);
  };

  const openCreateModal = async () => {
    resetForm();
    setFormMode('create');
    // Refresh products to get latest stock quantities
    await fetchProducts();
    setShowModal(true);
  };

  const openEditModal = (sale) => {
    setFormMode('edit');
    setFormData({
      productId: sale.productId.toString(),
      quantity: sale.quantity.toString(),
      unitPrice: sale.unitPrice.toString(),
      totalValue: sale.totalValue.toString(),
      buyingPrice: sale.buyingPrice.toString(),
      notes: sale.notes || ''
    });
    setEditingSaleId(sale.saleId);
    setError(null);
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.productId) {
      errors.productId = 'Please select a product';
    }
    
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    } else {
      const selectedProduct = products.find(p => p.productId === parseInt(formData.productId));
      if (selectedProduct) {
        const quantity = parseInt(formData.quantity);
        const availableQuantity = selectedProduct.quantity;
        let maxAllowedQuantity = availableQuantity;
        
        // In edit mode, add back the current sale quantity to available stock
        if (formMode === 'edit' && editingSaleId) {
          const currentSale = salesData.find(s => s.saleId === editingSaleId);
          if (currentSale && currentSale.productId === selectedProduct.productId) {
            maxAllowedQuantity = availableQuantity + currentSale.quantity;
          }
        }
        
        if (quantity > maxAllowedQuantity) {
          errors.quantity = `Quantity cannot exceed available stock (${maxAllowedQuantity} ${selectedProduct.unit})`;
        }
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setError('Please fix the errors in the form before submitting');
      return;
    }
    
    setSaving(true);
    setError(null);
    setFormErrors({});
    
    try {
      // Find the selected product to get its price
      const selectedProduct = products.find(p => p.productId === parseInt(formData.productId));
      const quantity = parseInt(formData.quantity);
      const unitPrice = selectedProduct ? selectedProduct.sellingPrice : parseFloat(formData.unitPrice);
      const totalValue = unitPrice * quantity;
      const buyingPrice = selectedProduct ? selectedProduct.buyingPrice : parseFloat(formData.buyingPrice);

      const saleRequest = {
        productId: parseInt(formData.productId),
        quantity: quantity,
        unitPrice: unitPrice,
        totalValue: totalValue,
        buyingPrice: buyingPrice,
        notes: formData.notes
      };

      const url = formMode === 'edit' && editingSaleId
        ? `http://localhost:8080/api/sales/${editingSaleId}`
        : 'http://localhost:8080/api/sales';
      
      const method = formMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
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
        const errorData = await response.json().catch(() => ({ message: 'Failed to save sale' }));
        setError(errorData.message || 'Failed to save sale');
      }
    } catch (error) {
      setError(error.message || 'Error saving sale');
      console.error('Error saving sale:', error);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirm = (sale) => {
    setSaleToDelete(sale);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setSaleToDelete(null);
  };

  const handleDelete = async () => {
    if (!token || !saleToDelete) return;
    
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8080/api/sales/${saleToDelete.saleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchSales(); // Refresh the sales list
        closeDeleteConfirm();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete sale' }));
        setError(errorData.message || 'Failed to delete sale');
      }
    } catch (error) {
      setError(error.message || 'Error deleting sale');
      console.error('Error deleting sale:', error);
    } finally {
      setDeleting(false);
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
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="sales-actions">
          <button className="btn-primary-icon" onClick={openCreateModal}>
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
                <th>Actions</th>
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
                  <td className="table-actions">
                    <div className="action-buttons">
                      <button 
                        className="action-btn-icon edit-btn-icon" 
                        onClick={() => openEditModal(sale)}
                        title="Edit sale"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.333 2.00001C11.5084 1.82465 11.7163 1.68607 11.9447 1.59233C12.1731 1.49859 12.4173 1.45166 12.6637 1.45435C12.9101 1.45704 13.1533 1.50929 13.3788 1.60777C13.6043 1.70625 13.8075 1.84896 13.9762 2.02763C14.1449 2.2063 14.2757 2.40734 14.3615 2.62891C14.4473 2.85048 14.4863 3.08798 14.476 3.32568C14.4657 3.56338 14.4063 3.79648 14.301 4.01134C14.1957 4.2262 14.0466 4.41858 13.8613 4.57734L13.333 5.10568L10.8947 2.66734L11.333 2.00001ZM10 3.33334L12.6667 6.00001L5.33333 13.3333H2.66667V10.6667L10 3.33334Z" fill="currentColor"/>
                        </svg>
                      </button>
                      <button 
                        className="action-btn-icon delete-btn-icon" 
                        onClick={() => openDeleteConfirm(sale)}
                        title="Delete sale"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.5 5.5C5.77614 5.5 6 5.72386 6 6V12C6 12.2761 5.77614 12.5 5.5 12.5C5.22386 12.5 5 12.2761 5 12V6C5 5.72386 5.22386 5.5 5.5 5.5Z" fill="currentColor"/>
                          <path d="M8 5.5C8.27614 5.5 8.5 5.72386 8.5 6V12C8.5 12.2761 8.27614 12.5 8 12.5C7.72386 12.5 7.5 12.2761 7.5 12V6C7.5 5.72386 7.72386 5.5 8 5.5Z" fill="currentColor"/>
                          <path d="M11 6C11 5.72386 10.7761 5.5 10.5 5.5C10.2239 5.5 10 5.72386 10 6V12C10 12.2761 10.2239 12.5 10.5 12.5C10.7761 12.5 11 12.2761 11 12V6Z" fill="currentColor"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M10.5 2C11.0523 2 11.5 2.44772 11.5 3V3.5H13.5C13.7761 3.5 14 3.72386 14 4C14 4.27614 13.7761 4.5 13.5 4.5H13V12.5C13 13.6046 12.1046 14.5 11 14.5H5C3.89543 14.5 3 13.6046 3 12.5V4.5H2.5C2.22386 4.5 2 4.27614 2 4C2 3.72386 2.22386 3.5 2.5 3.5H4.5V3C4.5 2.44772 4.94772 2 5.5 2H10.5ZM5.5 3.5H10.5V3H5.5V3.5ZM4 4.5V12.5C4 12.7761 4.22386 13 4.5 13H11.5C11.7761 13 12 12.7761 12 12.5V4.5H4Z" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">No sales found</td>
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

      {/* Add/Edit Sale Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleDiscard}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{formMode === 'edit' ? 'Edit Sale' : 'Add Sale'}</h2>
            
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Product <span className="required">*</span></label>
                  <select
                    name="productId"
                    className={`form-input ${formErrors.productId ? 'input-error' : ''}`}
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.productName} {product.quantity > 0 ? `(${product.quantity} ${product.unit} available)` : '(Out of stock)'}
                      </option>
                    ))}
                  </select>
                  {formErrors.productId && (
                    <div className="field-error">{formErrors.productId}</div>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">Quantity <span className="required">*</span></label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    className={`form-input ${formErrors.quantity ? 'input-error' : ''}`}
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.quantity && (
                    <div className="field-error">{formErrors.quantity}</div>
                  )}
                  {formData.productId && !formErrors.quantity && (() => {
                    const selectedProduct = products.find(p => p.productId === parseInt(formData.productId));
                    if (selectedProduct) {
                      let availableQuantity = selectedProduct.quantity;
                      if (formMode === 'edit' && editingSaleId) {
                        const currentSale = salesData.find(s => s.saleId === editingSaleId);
                        if (currentSale && currentSale.productId === selectedProduct.productId) {
                          availableQuantity = selectedProduct.quantity + currentSale.quantity;
                        }
                      }
                      return (
                        <div className="field-hint" style={{ marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                          Available: {availableQuantity} {selectedProduct.unit}
                        </div>
                      );
                    }
                    return null;
                  })()}
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
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : formMode === 'edit' ? 'Save Changes' : 'Add Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && saleToDelete && (
        <div className="modal-overlay" onClick={closeDeleteConfirm}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Sale</h3>
            <p>Are you sure you want to delete the sale for <strong>{saleToDelete.productName}</strong> (Sale ID: {saleToDelete.saleCode})? This action cannot be undone and will restore the product quantity.</p>
            <div className="confirm-actions">
              <button 
                type="button" 
                className="btn-discard" 
                onClick={closeDeleteConfirm}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-confirm-delete" 
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}