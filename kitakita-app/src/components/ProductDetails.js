import React, { useState, useEffect } from 'react';
import '../App.css';
import { ProductsApi, SuppliersApi } from '../api/client';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

export default function ProductDetails({ product, onClose, onEdit, token }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [purchasesData, setPurchasesData] = useState([]);
  const [suppliersData, setSuppliersData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [adjustmentsData, setAdjustmentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [purchaseFormData, setPurchaseFormData] = useState({
    productId: '',
    supplierId: '',
    quantity: '',
    unitCost: '',
    notes: ''
  });
  const [adjustmentFormData, setAdjustmentFormData] = useState({
    productId: '',
    adjustmentType: 'ADD',
    quantity: '',
    reason: ''
  });
  const [savingPurchase, setSavingPurchase] = useState(false);
  const [savingAdjustment, setSavingAdjustment] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [adjustmentError, setAdjustmentError] = useState(null);
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(product);
      onClose(); // Close the product details modal
    }
  };

  // Fetch suppliers when component mounts
  useEffect(() => {
    if (token) {
      fetchSuppliers();
    }
  }, [token]);

  const fetchSuppliers = async () => {
    try {
      const response = await SuppliersApi.list(token);
      setSuppliersData(response.content || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliersData([]); // Set to empty array on error
    }
  };

  // Fetch product history data when product changes
  useEffect(() => {
    if (product && token) {
      fetchProductHistory();
    }
  }, [product, token]);

  // Debug: Log product to see its structure
  useEffect(() => {
    if (product) {
      console.log('Product object:', product);
      console.log('Product suppliers:', product.suppliers);
      console.log('Product supplierName:', product.supplierName);
    }
  }, [product]);

  const fetchProductHistory = async () => {
    if (!product || !token) return;
    
    setLoading(true);
    try {
      console.log('Fetching product history for product ID:', product.productId);
      
      // Fetch purchases
      console.log('Calling ProductsApi.getPurchases with token:', token ? 'present' : 'missing');
      const purchasesResponse = await ProductsApi.getPurchases(product.productId, token);
      console.log('Purchases response:', purchasesResponse);
      setPurchasesData(purchasesResponse || []);
      
      // Fetch adjustments
      console.log('Calling ProductsApi.getAdjustments with token:', token ? 'present' : 'missing');
      const adjustmentsResponse = await ProductsApi.getAdjustments(product.productId, token);
      console.log('Adjustments response:', adjustmentsResponse);
      setAdjustmentsData(adjustmentsResponse || []);
      
      // For now, we'll generate history data from purchases
      // In a real application, this would come from a separate history tracking system
      const history = generateHistoryFromData(purchasesResponse || [], adjustmentsResponse || []);
      setHistoryData(history);
      
      console.log('Successfully fetched product history');
    } catch (error) {
      console.error('Error fetching product history:', error);
      console.error('Product ID:', product.productId);
      console.error('Token available:', !!token);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check if it's a specific error we can handle
      if (error.message) {
        console.error('Specific error message:', error.message);
      }
      
      // Instead of falling back to static data, we'll show an empty state
      console.log('Setting empty data due to error');
      setPurchasesData([]);
      setAdjustmentsData([]);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateHistoryFromData = (purchases, adjustments) => {
    const history = [];
    
    // Add purchase history entries
    purchases.forEach(purchase => {
      const dateTime = formatDateTime(purchase.purchaseDate);
      history.push({
        date: dateTime.date,
        time: dateTime.time,
        action: 'Purchase',
        description: `Purchased ${purchase.quantity} units from ${purchase.supplierName || 'supplier'}`,
        user: 'System'
      });
    });
    
    // Add adjustment history entries
    adjustments.forEach(adjustment => {
      const dateTime = formatDateTime(adjustment.adjustmentDate);
      const actionText = adjustment.adjustmentType === 'ADD' ? 'Added' : 
                        adjustment.adjustmentType === 'REMOVE' ? 'Removed' : 'Corrected';
      history.push({
        date: dateTime.date,
        time: dateTime.time,
        action: `Adjustment (${actionText})`,
        description: `${actionText} ${adjustment.quantity} units. Reason: ${adjustment.reason || 'N/A'}`,
        user: adjustment.performedBy || 'System'
      });
    });
    
    // Sort by date descending
    return history.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB - dateA;
    });
  };

  const getStaticPurchasesData = () => [];

  const getStaticAdjustmentsData = () => [];

  const getStaticHistoryData = () => [];

  const handlePurchaseInputChange = (e) => {
    const { name, value } = e.target;
    setPurchaseFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPurchase = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Opening purchase modal for product:', product.productId);
    // Switch to purchases tab when opening purchase modal
    setActiveTab('purchases');
    setPurchaseFormData({
      productId: product.productId,
      supplierId: '',
      quantity: '',
      unitCost: '',
      notes: ''
    });
    setShowPurchaseModal(true);
    console.log('Purchase modal state set to:', true);
  };

  const handleSavePurchase = async (e) => {
    e.preventDefault();
    if (!product || !token) return;
    
    setSavingPurchase(true);
    setPurchaseError(null);
    
    try {
      const purchaseData = {
        productId: product.productId,
        supplierId: purchaseFormData.supplierId || null,
        quantity: parseInt(purchaseFormData.quantity),
        unitCost: parseFloat(purchaseFormData.unitCost),
        notes: purchaseFormData.notes
      };
      
      const response = await ProductsApi.createPurchase(product.productId, purchaseData, token);
      
      // Add the new purchase to the list
      setPurchasesData(prev => [response, ...prev]);
      
      // Update the product quantity (add purchased quantity to current quantity)
      const purchaseQuantity = parseInt(purchaseFormData.quantity) || 0;
      const newQuantity = (product.quantity || 0) + purchaseQuantity;
      
      // Update the product with the new quantity
      const updatedProduct = {
        ...product,
        quantity: newQuantity
      };
      
      // Notify parent component about the product update if onEdit exists
      if (onEdit) {
        onEdit(updatedProduct);
      }
      
      // Regenerate history data
      const history = generateHistoryFromData([response, ...purchasesData], adjustmentsData);
      setHistoryData(history);
      
      // Refresh purchase data from database to ensure sync
      await fetchProductHistory();
      
      // Close the modal
      setShowPurchaseModal(false);
      // Stay on the purchases tab after saving so the user doesn’t jump back to inventory
      setActiveTab('purchases');
      
      // Reset form
      setPurchaseFormData({
        productId: product.productId,
        supplierId: '',
        quantity: '',
        unitCost: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating purchase:', error);
      setPurchaseError(error.message || 'Failed to create purchase');
    } finally {
      setSavingPurchase(false);
    }
  };

  const handleCancelPurchase = () => {
    setShowPurchaseModal(false);
    setPurchaseError(null);
    setPurchaseFormData({
      productId: product.productId,
      supplierId: '',
      quantity: '',
      unitCost: '',
      notes: ''
    });
  };

  const handleAdjustmentInputChange = (e) => {
    const { name, value } = e.target;
    setAdjustmentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAdjustment = () => {
    setAdjustmentFormData({
      productId: product.productId,
      adjustmentType: 'ADD',
      quantity: '',
      reason: ''
    });
    setShowAdjustmentModal(true);
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!product || !token) return;
    
    setSavingAdjustment(true);
    setAdjustmentError(null);
    
    try {
      const adjustmentData = {
        productId: product.productId,
        adjustmentType: adjustmentFormData.adjustmentType,
        quantity: parseInt(adjustmentFormData.quantity),
        reason: adjustmentFormData.reason
      };
      
      const response = await ProductsApi.createAdjustment(product.productId, adjustmentData, token);
      
      // Add the new adjustment to the list
      setAdjustmentsData(prev => [response, ...prev]);
      
      // Update the product quantity based on the adjustment type
      let newQuantity = product.quantity || 0;
      const adjustmentQuantity = parseInt(adjustmentFormData.quantity) || 0;
      
      switch (adjustmentFormData.adjustmentType) {
        case 'ADD':
          newQuantity += adjustmentQuantity;
          break;
        case 'REMOVE':
          newQuantity -= adjustmentQuantity;
          break;
        case 'CORRECTION':
          newQuantity = adjustmentQuantity;
          break;
        default:
          break;
      }
      
      // Update the product with the new quantity
      const updatedProduct = {
        ...product,
        quantity: newQuantity
      };
      
      // Notify parent component about the product update if onEdit exists
      if (onEdit) {
        onEdit(updatedProduct);
      }
      
      // Update the product state locally
      // Note: This won't persist beyond this component unless the parent updates its state
      
      // Regenerate history data
      const history = generateHistoryFromData(purchasesData, [response, ...adjustmentsData]);
      setHistoryData(history);
      
      // Re-fetch the history to ensure consistency
      fetchProductHistory();
      
      // Close the modal
      setShowAdjustmentModal(false);
      
      // Reset form
      setAdjustmentFormData({
        productId: product.productId,
        adjustmentType: 'ADD',
        quantity: '',
        reason: ''
      });
    } catch (error) {
      console.error('Error creating adjustment:', error);
      setAdjustmentError(error.message || 'Failed to create adjustment');
    } finally {
      setSavingAdjustment(false);
    }
  };

  const handleCancelAdjustment = () => {
    setShowAdjustmentModal(false);
    setAdjustmentError(null);
    setAdjustmentFormData({
      productId: product.productId,
      adjustmentType: 'ADD',
      quantity: '',
      reason: ''
    });
  };

  if (!product) {
    return null;
  }

  const productData = {
    name: product.productName,
    productId: product.productId,
    category: product.categoryName || 'Uncategorized',
    expiryDate: formatDate(product.expiryDate),
    openingStock: product.openingStock ?? 0,
    remainingStock: product.quantity ?? 0,
    onTheWay: product.onTheWay ?? 0,
    supplierName: product.supplierName || 'N/A',
    contactNumber: product.supplierContact || 'N/A'
  };

  // Calculate purchase statistics
  const calculatePurchaseStats = () => {
    if (!purchasesData || purchasesData.length === 0) {
      return {
        totalPurchases: 0,
        totalQuantity: 0,
        totalSpent: 0,
        averageCost: 0
      };
    }

    const totalPurchases = purchasesData.length;
    const totalQuantity = purchasesData.reduce((sum, purchase) => sum + (purchase.quantity || 0), 0);
    const totalSpent = purchasesData.reduce((sum, purchase) => sum + (purchase.totalCost || 0), 0);
    const averageCost = totalPurchases > 0 ? (totalSpent / totalPurchases) : 0;

    return {
      totalPurchases,
      totalQuantity,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      averageCost: parseFloat(averageCost.toFixed(2))
    };
  };

  const purchaseStats = calculatePurchaseStats();

  // Calculate adjustment statistics
  const calculateAdjustmentStats = () => {
    if (!adjustmentsData || adjustmentsData.length === 0) {
      return {
        totalAdjustments: 0,
        totalAdded: 0,
        totalRemoved: 0
      };
    }

    const totalAdjustments = adjustmentsData.length;
    const totalAdded = adjustmentsData
      .filter(adj => adj.adjustmentType === 'ADD')
      .reduce((sum, adj) => sum + (adj.quantity || 0), 0);
    const totalRemoved = adjustmentsData
      .filter(adj => adj.adjustmentType === 'REMOVE' || adj.adjustmentType === 'CORRECTION')
      .reduce((sum, adj) => sum + (adj.quantity || 0), 0);

    return {
      totalAdjustments,
      totalAdded,
      totalRemoved
    };
  };

  const adjustmentStats = calculateAdjustmentStats();

  return (
    <div className="product-details-fullscreen">
      <div className="product-details-container">
        {/* Back Button and Header */}
        <div className="product-details-back">
          <button className="btn-back" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Inventory
          </button>
        </div>

        {/* Product Header */}
        <div className="product-details-header">
          <h1 className="product-details-title">{productData.name}</h1>
          <div className="product-details-actions">
            <button className="btn-secondary-icon" onClick={handleEdit}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.333 2.00001C11.5084 1.82465 11.7163 1.68607 11.9447 1.59233C12.1731 1.49859 12.4173 1.45166 12.6637 1.45435C12.9101 1.45704 13.1533 1.50929 13.3788 1.60777C13.6043 1.70625 13.8075 1.84896 13.9762 2.02763C14.1449 2.2063 14.2757 2.40734 14.3615 2.62891C14.4473 2.85048 14.4863 3.08798 14.476 3.32568C14.4657 3.56338 14.4063 3.79648 14.301 4.01134C14.1957 4.2262 14.0466 4.41858 13.8613 4.57734L13.333 5.10568L10.8947 2.66734L11.333 2.00001ZM10 3.33334L12.6667 6.00001L5.33333 13.3333H2.66667V10.6667L10 3.33334Z" fill="currentColor"/>
              </svg>
              Edit
            </button>
            <button className="btn-secondary-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2C8.27614 2 8.5 2.22386 8.5 2.5V10.2929L11.1464 7.64645C11.3417 7.45118 11.6583 7.45118 11.8536 7.64645C12.0488 7.84171 12.0488 8.15829 11.8536 8.35355L8.35355 11.8536C8.15829 12.0488 7.84171 12.0488 7.64645 11.8536L4.14645 8.35355C3.95118 8.15829 3.95118 7.84171 4.14645 7.64645C4.34171 7.45118 4.65829 7.45118 4.85355 7.64645L7.5 10.2929V2.5C7.5 2.22386 7.72386 2 8 2Z" fill="currentColor"/>
                <path d="M2.5 13.5C2.22386 13.5 2 13.7239 2 14C2 14.2761 2.22386 14.5 2.5 14.5H13.5C13.7761 14.5 14 14.2761 14 14C14 13.7239 13.7761 13.5 13.5 13.5H2.5Z" fill="currentColor"/>
              </svg>
              Download
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="product-tabs">
          <button 
            className={`product-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`product-tab ${activeTab === 'purchases' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            Purchases
          </button>
          <button 
            className={`product-tab ${activeTab === 'adjustments' ? 'active' : ''}`}
            onClick={() => setActiveTab('adjustments')}
          >
            Adjustments
          </button>
          <button 
            className={`product-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="product-tab-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              {/* Product Header with Image and Name */}
              <div className="product-overview-header">
                <div className="product-image-left">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={productData.name} 
                      className="product-image-main"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="product-image-placeholder-main">
                            <div class="image-placeholder-icon">📦</div>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="product-image-placeholder-main">
                      <div className="image-placeholder-icon">📦</div>
                    </div>
                  )}
                </div>
                <div className="product-info-main">
                  <h2 className="product-name-main">{productData.name}</h2>
                  <div className="product-meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">Product ID</span>
                      <span className="meta-value">#{productData.productId}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Category</span>
                      <span className="meta-value">{productData.category}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Expiry Date</span>
                      <span className="meta-value">{productData.expiryDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Information - Enhanced */}
              <div className="stock-cards">
                <div className="stock-card">
                  <div className="stock-card-icon">📦</div>
                  <div className="stock-card-content">
                    <span className="stock-card-label">Opening Stock</span>
                    <span className="stock-card-value">{productData.openingStock}</span>
                  </div>
                </div>
                <div className="stock-card">
                  <div className="stock-card-icon">📊</div>
                  <div className="stock-card-content">
                    <span className="stock-card-label">Remaining Stock</span>
                    <span className="stock-card-value">{productData.remainingStock}</span>
                  </div>
                </div>
                <div className="stock-card">
                  <div className="stock-card-icon">🚚</div>
                  <div className="stock-card-content">
                    <span className="stock-card-label">On the Way</span>
                    <span className="stock-card-value">{productData.onTheWay}</span>
                  </div>
                </div>
              </div>

              {/* Supplier Details */}
              <div className="supplier-details-section">
                <h3 className="section-title">Supplier Details</h3>
                {product.suppliers && Array.isArray(product.suppliers) && product.suppliers.length > 0 ? (
                  product.suppliers.map((supplier, index) => (
                    <div key={supplier.supplierId || index} style={{ marginBottom: index < product.suppliers.length - 1 ? '16px' : '0', paddingBottom: index < product.suppliers.length - 1 ? '16px' : '0', borderBottom: index < product.suppliers.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      <div className="detail-item">
                        <span className="detail-label">Supplier name:</span>
                        <span className="detail-value">{supplier.supplierName || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Contact Number:</span>
                        <span className="detail-value">{supplier.contactNumber || 'Not specified'}</span>
                      </div>
                      {supplier.email && (
                        <div className="detail-item">
                          <span className="detail-label">Email:</span>
                          <span className="detail-value">{supplier.email}</span>
                        </div>
                      )}
                      {supplier.address && (
                        <div className="detail-item">
                          <span className="detail-label">Address:</span>
                          <span className="detail-value">{supplier.address}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : product.supplierName && product.supplierName !== 'N/A' ? (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">Supplier name:</span>
                      <span className="detail-value">{product.supplierName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Contact Number:</span>
                      <span className="detail-value">{product.supplierContact || 'Not specified'}</span>
                    </div>
                  </>
                ) : (
                  <div className="detail-item">
                    <span className="detail-value" style={{ color: '#94a3b8', fontStyle: 'italic' }}>No suppliers assigned to this product</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="tab-content-section">
              <div className="section-header-improved">
                <div className="section-header-left">
                  <h3 className="section-title-main">Purchase History</h3>
                  <span className="section-subtitle">{purchaseStats.totalPurchases} {purchaseStats.totalPurchases === 1 ? 'transaction' : 'transactions'}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn-secondary-icon" 
                    onClick={fetchProductHistory}
                    title="Refresh purchases"
                    style={{ padding: '10px 16px', fontSize: '14px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <polyline points="1 20 1 14 7 14"></polyline>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    Refresh
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={handleAddPurchase}
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add New Purchase
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading purchases...</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="enhanced-table">
                    <thead>
                      <tr>
                        <th>Purchase ID</th>
                        <th>Date</th>
                        <th>Supplier</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchasesData.map((purchase, idx) => (
                        <tr key={idx}>
                          <td className="purchase-id">{purchase.purchaseCode || `PUR-${purchase.purchaseId}`}</td>
                          <td>{formatDate(purchase.purchaseDate)}</td>
                          <td>{purchase.supplierName || 'N/A'}</td>
                          <td>{purchase.quantity}</td>
                          <td>₱{purchase.unitCost?.toFixed(2) || '0.00'}</td>
                          <td className="purchase-total">₱{purchase.totalCost?.toFixed(2) || '0.00'}</td>
                          <td>
                            <span className={`status-badge ${purchase.status?.toLowerCase() || 'pending'}`}>
                              {purchase.status?.toLowerCase() === 'completed' ? 'Completed' : 
                               purchase.status?.toLowerCase() === 'cancelled' ? 'Cancelled' : 
                               purchase.status?.toLowerCase() === 'processing' ? 'Processing' :
                               purchase.status?.toLowerCase() === 'shipped' ? 'Shipped' :
                               purchase.status?.toLowerCase() === 'delivered' ? 'Delivered' :
                               purchase.status?.toLowerCase() === 'returned' ? 'Returned' :
                               purchase.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {purchasesData.length === 0 && (
                        <tr>
                          <td colSpan="7" className="empty-state">
                            <div className="empty-icon">📦</div>
                            <p>No purchase history found</p>
                            <small>Add your first purchase to track inventory</small>
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {purchasesData.length > 0 && (
                      <tfoot>
                        <tr className="grand-total-row">
                          <td colSpan="3" className="grand-total-label">
                            <strong>Grand Total</strong>
                            <span className="total-items">({purchaseStats.totalPurchases} {purchaseStats.totalPurchases === 1 ? 'purchase' : 'purchases'})</span>
                          </td>
                          <td className="grand-total-qty">
                            <strong>{purchaseStats.totalQuantity}</strong>
                          </td>
                          <td></td>
                          <td className="grand-total-amount">
                            <strong>₱{purchaseStats.totalSpent.toFixed(2)}</strong>
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'adjustments' && (
            <div className="tab-content-section">
              <div className="section-header-improved">
                <div className="section-header-left">
                  <h3 className="section-title-main">Adjustment History</h3>
                  <span className="section-subtitle">{adjustmentStats.totalAdjustments} {adjustmentStats.totalAdjustments === 1 ? 'adjustment' : 'adjustments'}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn-secondary-icon" 
                    onClick={fetchProductHistory}
                    title="Refresh adjustments"
                    style={{ padding: '10px 16px', fontSize: '14px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <polyline points="1 20 1 14 7 14"></polyline>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    Refresh
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={handleAddAdjustment}
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add New Adjustment
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading adjustments...</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="enhanced-table">
                    <thead>
                      <tr>
                        <th>Adjustment ID</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Reason</th>
                        <th>Performed By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjustmentsData.map((adjustment, idx) => (
                        <tr key={idx}>
                          <td className="purchase-id">ADJ-{String(adjustment.adjustmentId).padStart(3, '0')}</td>
                          <td>{formatDate(adjustment.adjustmentDate)}</td>
                          <td>
                            <span className={`status-badge ${adjustment.adjustmentType?.toLowerCase() || 'info'}`}>
                              {adjustment.adjustmentType === 'ADD' ? 'Added' : 
                               adjustment.adjustmentType === 'REMOVE' ? 'Removed' : 
                               adjustment.adjustmentType === 'CORRECTION' ? 'Correction' :
                               adjustment.adjustmentType}
                            </span>
                          </td>
                          <td>{adjustment.quantity}</td>
                          <td>{adjustment.reason || 'N/A'}</td>
                          <td>{adjustment.performedBy || 'System'}</td>
                        </tr>
                      ))}
                      {adjustmentsData.length === 0 && (
                        <tr>
                          <td colSpan="6" className="empty-state">
                            <div className="empty-icon">📋</div>
                            <p>No adjustment history found</p>
                            <small>Add your first adjustment to modify inventory</small>
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {adjustmentsData.length > 0 && (
                      <tfoot>
                        <tr className="grand-total-row">
                          <td colSpan="3" className="grand-total-label">
                            <strong>Summary</strong>
                            <span className="total-items">({adjustmentStats.totalAdjustments} {adjustmentStats.totalAdjustments === 1 ? 'adjustment' : 'adjustments'})</span>
                          </td>
                          <td className="grand-total-qty">
                            <strong>+{adjustmentStats.totalAdded} / -{adjustmentStats.totalRemoved}</strong>
                          </td>
                          <td colSpan="2"></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-content-section">
              <div className="section-header-improved">
                <div className="section-header-left">
                  <h3 className="section-title-main">Activity History</h3>
                  <span className="section-subtitle">{historyData.length} {historyData.length === 1 ? 'activity' : 'activities'}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn-secondary-icon" 
                    onClick={fetchProductHistory}
                    title="Refresh history"
                    style={{ padding: '10px 16px', fontSize: '14px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <polyline points="1 20 1 14 7 14"></polyline>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading history...</p>
                </div>
              ) : historyData.length === 0 ? (
                <div className="empty-state-container">
                  <div className="empty-icon">📜</div>
                  <p>No activity history found</p>
                  <small>Activities will appear here when you make purchases or adjustments</small>
                </div>
              ) : (
                <div className="history-timeline-improved">
                  {historyData.map((item, idx) => (
                    <div key={idx} className="history-card">
                      <div className="history-card-indicator">
                        <div className={`history-dot ${item.action.includes('Purchase') ? 'purchase' : 'adjustment'}`}></div>
                        {idx < historyData.length - 1 && <div className="history-line"></div>}
                      </div>
                      <div className="history-card-content">
                        <div className="history-card-header">
                          <span className={`history-badge ${item.action.includes('Purchase') ? 'purchase' : 'adjustment'}`}>
                            {item.action.includes('Purchase') ? '🛒' : '📋'} {item.action}
                          </span>
                          <span className="history-card-time">{item.date} at {item.time}</span>
                        </div>
                        <div className="history-card-body">
                          <p className="history-card-description">{item.description}</p>
                        </div>
                        <div className="history-card-footer">
                          <span className="history-card-user">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            {item.user}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Purchase Modal */}
      {showPurchaseModal && (
        <div className="modal-overlay" onClick={handleCancelPurchase} style={{ zIndex: 2000 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="purchase-form-header">
              <h3>Add New Purchase</h3>
              <p>Fill in the details below to record a new purchase for this product</p>
            </div>
            
            {purchaseError && <div className="form-error" role="alert">{purchaseError}</div>}
            
            <form onSubmit={handleSavePurchase} className="purchase-form">
              <div className="form-group">
                <label className="form-group-label">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={product.productName}
                  disabled
                />
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-group-label">Supplier <span className="required">*</span></label>
                    <select
                      name="supplierId"
                      className="form-control"
                      value={purchaseFormData.supplierId}
                      onChange={handlePurchaseInputChange}
                      required
                    >
                      <option value="">Select supplier</option>
                      {suppliersData.map((supplier) => (
                        <option key={supplier.supplierId} value={supplier.supplierId}>
                          {supplier.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-group-label">Quantity <span className="required">*</span></label>
                    <input
                      type="number"
                      name="quantity"
                      className="form-control"
                      placeholder="Enter quantity"
                      value={purchaseFormData.quantity}
                      onChange={handlePurchaseInputChange}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-group-label">Unit Cost (₱) <span className="required">*</span></label>
                    <input
                      type="number"
                      name="unitCost"
                      className="form-control"
                      placeholder="Enter unit cost"
                      value={purchaseFormData.unitCost}
                      onChange={handlePurchaseInputChange}
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-group-label">Total Cost</label>
                    <input
                      type="text"
                      className="form-control"
                      value={`₱${(parseFloat(purchaseFormData.quantity || 0) * parseFloat(purchaseFormData.unitCost || 0)).toFixed(2)}`}
                      disabled
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-group-label">Notes</label>
                <textarea
                  name="notes"
                  className="form-control"
                  placeholder="Enter any notes about this purchase"
                  value={purchaseFormData.notes}
                  onChange={handlePurchaseInputChange}
                  rows="3"
                />
              </div>
              
              <div className="purchase-form-actions">
                <button type="button" className="btn-discard" onClick={handleCancelPurchase} disabled={savingPurchase}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingPurchase}>
                  {savingPurchase ? 'Saving...' : 'Add Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="modal-overlay" onClick={handleCancelAdjustment}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="purchase-form-header">
              <h3>Add New Adjustment</h3>
              <p>Fill in the details below to record a new adjustment for this product</p>
            </div>
            
            {adjustmentError && <div className="form-error" role="alert">{adjustmentError}</div>}
            
            <form onSubmit={handleSaveAdjustment} className="purchase-form">
              <div className="form-group">
                <label className="form-group-label">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={product.productName}
                  disabled
                />
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-group-label">Adjustment Type <span className="required">*</span></label>
                    <select
                      name="adjustmentType"
                      className="form-control"
                      value={adjustmentFormData.adjustmentType}
                      onChange={handleAdjustmentInputChange}
                      required
                    >
                      <option value="ADD">Add Stock</option>
                      <option value="REMOVE">Remove Stock</option>
                      <option value="CORRECTION">Correction</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-group-label">Quantity <span className="required">*</span></label>
                    <input
                      type="number"
                      name="quantity"
                      className="form-control"
                      placeholder="Enter quantity"
                      value={adjustmentFormData.quantity}
                      onChange={handleAdjustmentInputChange}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-group-label">Reason</label>
                <textarea
                  name="reason"
                  className="form-control"
                  placeholder="Enter reason for adjustment"
                  value={adjustmentFormData.reason}
                  onChange={handleAdjustmentInputChange}
                  rows="3"
                />
              </div>
              
              <div className="purchase-form-actions">
                <button type="button" className="btn-discard" onClick={handleCancelAdjustment} disabled={savingAdjustment}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingAdjustment}>
                  {savingAdjustment ? 'Saving...' : 'Add Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}