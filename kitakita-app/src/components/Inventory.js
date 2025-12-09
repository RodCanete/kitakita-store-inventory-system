import React, { useState, useEffect } from 'react';
import '../App.css';
import ProductDetails from './ProductDetails';
import { ProductsApi } from '../api/client';

const emptyForm = {
  productName: '',
  categoryId: '',
  supplierId: '',
  buyingPrice: '',
  sellingPrice: '',
  unit: '',
  quantity: '',
  thresholdValue: '',
  openingStock: '',
  onTheWay: '',
  expiryDate: '',
  imageUrl: ''
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '₱0.00';
  return `₱${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

export default function Inventory({ token }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formMode, setFormMode] = useState('create');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [references, setReferences] = useState({ categories: [], suppliers: [] });
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Add common units array for the dropdown
  const commonUnits = [
    { value: '', label: 'Select unit' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'mg', label: 'Milligrams (mg)' },
    { value: 'L', label: 'Liters (L)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'box', label: 'Boxes (box)' },
    { value: 'pack', label: 'Packs (pack)' },
    { value: 'bottle', label: 'Bottles (bottle)' },
    { value: 'can', label: 'Cans (can)' }
  ];
  const loadReferences = async () => {
    if (!token) return;
    try {
      const ref = await ProductsApi.references(token);
      setReferences(ref);
    } catch (err) {
      console.error('Failed to load reference data', err);
    }
  };

  const loadProducts = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ProductsApi.list({ search, page, size }, token);
      setProducts(data.content);
      setTotalPages(Math.max(data.totalPages, 1));
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferences();
  }, [token]);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, size, search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setFormMode('create');
    setEditingProductId(null);
  };

  const handleDiscard = () => {
    resetForm();
    setShowModal(false);
  };

  const openCreateModal = () => {
    resetForm();
    setFormMode('create');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setFormMode('edit');
    setFormData({
      productName: product.productName || '',
      categoryId: product.categoryId || '',
      supplierId: product.supplierId || '',
      buyingPrice: product.buyingPrice || '',
      sellingPrice: product.sellingPrice || '',
      unit: product.unit || '',
      quantity: product.quantity || '',
      thresholdValue: product.thresholdValue || '',
      openingStock: product.openingStock || '',
      onTheWay: product.onTheWay || '',
      expiryDate: product.expiryDate ? product.expiryDate : '',
      imageUrl: product.imageUrl || ''
    });
    setEditingProductId(product.productId);
    setSelectedProduct(null); // Ensure ProductDetails modal is closed
    setShowModal(true);
  };

  const toPayload = () => ({
    productName: formData.productName,
    categoryId: formData.categoryId ? Number(formData.categoryId) : null,
    supplierId: formData.supplierId ? Number(formData.supplierId) : null,
    buyingPrice: Number(formData.buyingPrice),
    sellingPrice: Number(formData.sellingPrice),
    unit: formData.unit,
    quantity: Number(formData.quantity),
    thresholdValue: Number(formData.thresholdValue),
    openingStock: Number(formData.openingStock),
    onTheWay: Number(formData.onTheWay),
    expiryDate: formData.expiryDate || null,
    imageUrl: formData.imageUrl || null,
    isActive: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const payload = toPayload();
      if (formMode === 'edit' && editingProductId) {
        await ProductsApi.update(editingProductId, payload, token);
      } else {
        await ProductsApi.create(payload, token);
      }
      await loadProducts();
      handleDiscard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!token) return;
    if (!window.confirm('Delete this product?')) return;
    setError(null);
    try {
      await ProductsApi.remove(productId, token);
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownloadPdf = async () => {
    if (!token) return;
    setDownloading(true);
    try {
      const blob = await ProductsApi.exportPdf({ search }, token);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kitakita-inventory.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  const getAvailabilityClass = (product) => {
    if (product.quantity <= product.thresholdValue) return 'low-stock';
    return 'in-stock';
  };

  return (
    <div className="inventory">
      <h1 className="page-title">Inventory</h1>
      {error && <div className="form-error" role="alert">{error}</div>}

      <div className="products-section">
        <div className="products-header">
          <h2>Products</h2>
          <div className="products-actions">
            <input
              type="search"
              className="search-input"
              placeholder="Search product or code"
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
            />
            <button className="btn-secondary" onClick={handleDownloadPdf} disabled={downloading}>
              {downloading ? 'Preparing PDF…' : 'Download PDF'}
            </button>
            <button className="btn-primary" onClick={openCreateModal}>Add Product</button>
          </div>

        </div>

        {loading ? (
          <div className="info-banner">Loading products…</div>
        ) : (
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Buying Price</th>
                  <th>Selling Price</th>
                  <th>Quantity</th>
                  <th>Threshold</th>
                  <th>Expiry Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.productId}>
                    <td
                      className="product-name-clickable"
                      onClick={() => setSelectedProduct(product)}
                      style={{ cursor: 'pointer', color: '#0b63e8' }}
                    >
                      {product.productName}
                    </td>
                    <td>{product.categoryName || '-'}</td>
                    <td>{formatCurrency(product.buyingPrice)}</td>
                    <td>{formatCurrency(product.sellingPrice)}</td>
                    <td>{product.quantity} {product.unit}</td>
                    <td>{product.thresholdValue} {product.unit}</td>
                    <td>{formatDate(product.expiryDate)}</td>
                    <td className="table-actions">
                      <div className="table-actions-wrapper">
                        <span className={`availability-badge ${getAvailabilityClass(product)}`}>
                          {product.quantity <= product.thresholdValue ? 'Low' : 'In stock'}
                        </span>
                        <div className="action-buttons">
                          <button 
                            className="action-btn-icon edit-btn-icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(null); // Close product details if open
                              openEditModal(product);
                            }}
                            title="Edit product"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11.333 2.00001C11.5084 1.82465 11.7163 1.68607 11.9447 1.59233C12.1731 1.49859 12.4173 1.45166 12.6637 1.45435C12.9101 1.45704 13.1533 1.50929 13.3788 1.60777C13.6043 1.70625 13.8075 1.84896 13.9762 2.02763C14.1449 2.2063 14.2757 2.40734 14.3615 2.62891C14.4473 2.85048 14.4863 3.08798 14.476 3.32568C14.4657 3.56338 14.4063 3.79648 14.301 4.01134C14.1957 4.2262 14.0466 4.41858 13.8613 4.57734L13.333 5.10568L10.8947 2.66734L11.333 2.00001ZM10 3.33334L12.6667 6.00001L5.33333 13.3333H2.66667V10.6667L10 3.33334Z" fill="currentColor"/>
                            </svg>
                          </button>
                          <button 
                            className="action-btn-icon delete-btn-icon" 
                            onClick={() => handleDelete(product.productId)}
                            title="Delete product"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5.5 5.5C5.77614 5.5 6 5.72386 6 6V12C6 12.2761 5.77614 12.5 5.5 12.5C5.22386 12.5 5 12.2761 5 12V6C5 5.72386 5.22386 5.5 5.5 5.5Z" fill="currentColor"/>
                              <path d="M8 5.5C8.27614 5.5 8.5 5.72386 8.5 6V12C8.5 12.2761 8.27614 12.5 8 12.5C7.72386 12.5 7.5 12.2761 7.5 12V6C7.5 5.72386 7.72386 5.5 8 5.5Z" fill="currentColor"/>
                              <path d="M11 6C11 5.72386 10.7761 5.5 10.5 5.5C10.2239 5.5 10 5.72386 10 6V12C10 12.2761 10.2239 12.5 10.5 12.5C10.7761 12.5 11 12.2761 11 12V6Z" fill="currentColor"/>
                              <path fillRule="evenodd" clipRule="evenodd" d="M10.5 2C11.0523 2 11.5 2.44772 11.5 3V3.5H13.5C13.7761 3.5 14 3.72386 14 4C14 4.27614 13.7761 4.5 13.5 4.5H13V12.5C13 13.6046 12.1046 14.5 11 14.5H5C3.89543 14.5 3 13.6046 3 12.5V4.5H2.5C2.22386 4.5 2 4.27614 2 4C2 3.72386 2.22386 3.5 2.5 3.5H4.5V3C4.5 2.44772 4.94772 2 5.5 2H10.5ZM5.5 3.5H10.5V3H5.5V3.5ZM4 4.5V12.5C4 12.7761 4.22386 13 4.5 13H11.5C11.7761 13 12 12.7761 12 12.5V4.5H4Z" fill="currentColor"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {!products.length && (
                  <tr>
                    <td colSpan={8} className="muted">No products found. Try a different search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {page + 1} of {totalPages} ({totalElements} items)
          </span>
          <button
            className="pagination-btn"
            onClick={() => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
            disabled={page + 1 >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{formMode === 'edit' ? 'Edit Product' : 'New Product'}</h2>

            <form onSubmit={handleSubmit} className="product-form">
              {/* Basic Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <span className="form-section-icon">📦</span>
                  Basic Information
                </h3>
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

                  {formMode === 'edit' && editingProductId && (
                    <div className="form-field">
                      <label className="form-label">Product Code</label>
                      <input
                        type="text"
                        className="form-input"
                        value={products.find(p => p.productId === editingProductId)?.productCode || 'Auto-generated'}
                        disabled
                      />
                    </div>
                  )}
                </div>

                <div className="form-row-2">
                  <div className="form-field">
                    <label className="form-label">Category</label>
                    <select
                      name="categoryId"
                      className="form-input"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select product category</option>
                      {references.categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Supplier</label>
                    <select
                      name="supplierId"
                      className="form-input"
                      value={formData.supplierId}
                      onChange={handleInputChange}
                    >
                      <option value="">Select supplier (optional)</option>
                      {references.suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>{supplier.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <span className="form-section-icon">💰</span>
                  Pricing Information
                </h3>
                <div className="form-row-2">
                  <div className="form-field">
                    <label className="form-label">Buying Price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="buyingPrice"
                      className="form-input"
                      value={formData.buyingPrice}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Selling Price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="sellingPrice"
                      className="form-input"
                      value={formData.sellingPrice}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Inventory Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <span className="form-section-icon">📊</span>
                  Inventory Information
                </h3>
                <div className="form-row-2">
                  <div className="form-field">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      className="form-input"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Threshold Value</label>
                    <input
                      type="number"
                      name="thresholdValue"
                      className="form-input"
                      value={formData.thresholdValue}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-field">
                    <label className="form-label">Opening Stock</label>
                    <input
                      type="number"
                      name="openingStock"
                      className="form-input"
                      value={formData.openingStock}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">On the Way</label>
                    <input
                      type="number"
                      name="onTheWay"
                      className="form-input"
                      value={formData.onTheWay}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-field">
                    <label className="form-label">Unit</label>
                    <select
                      name="unit"
                      className="form-input"
                      value={formData.unit}
                      onChange={handleInputChange}
                      required
                    >
                      {commonUnits.map((unitOption) => (
                        <option key={unitOption.value} value={unitOption.value}>
                          {unitOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      className="form-input"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <span className="form-section-icon">📷</span>
                  Media
                </h3>
                <div className="form-field">
                  <label className="form-label">Image URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    className="form-input"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="Enter image URL (optional)"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-discard" onClick={handleDiscard}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : formMode === 'edit' ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={openEditModal}
          token={token}
        />
      )}
    </div>
  );
}

