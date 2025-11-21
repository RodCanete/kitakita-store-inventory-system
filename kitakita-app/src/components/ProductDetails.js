import React, { useState } from 'react';
import '../App.css';

export default function ProductDetails({ product, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Map product data from inventory to product details format
  const productData = product ? {
    name: product.name,
    productId: product.productId || 456567,
    category: product.category || 'Instant food',
    expiryDate: product.expiryDate || '13/4/23',
    openingStock: product.openingStock || 40,
    remainingStock: product.quantity || 34,
    onTheWay: product.onTheWay || 15,
    supplierName: product.supplierName || 'Ronald Martin',
    contactNumber: product.contactNumber || '98789 86757'
  } : {
    name: 'Maggi',
    productId: 456567,
    category: 'Instant food',
    expiryDate: '13/4/23',
    openingStock: 40,
    remainingStock: 34,
    onTheWay: 15,
    supplierName: 'Ronald Martin',
    contactNumber: '98789 86757'
  };

  // Sample Purchases Data
  const purchasesData = [
    { id: 'PUR-001', date: '15/01/24', quantity: 50, unitPrice: 16, totalPrice: 800, supplier: 'Ronald Martin', status: 'Completed' },
    { id: 'PUR-002', date: '10/12/23', quantity: 30, unitPrice: 15, totalPrice: 450, supplier: 'Ronald Martin', status: 'Completed' },
    { id: 'PUR-003', date: '05/11/23', quantity: 40, unitPrice: 16, totalPrice: 640, supplier: 'Ronald Martin', status: 'Completed' },
    { id: 'PUR-004', date: '20/10/23', quantity: 25, unitPrice: 15, totalPrice: 375, supplier: 'Ronald Martin', status: 'Completed' },
    { id: 'PUR-005', date: '12/09/23', quantity: 35, unitPrice: 16, totalPrice: 560, supplier: 'Ronald Martin', status: 'Completed' },
  ];

  // Sample Adjustments Data
  const adjustmentsData = [
    { id: 'ADJ-001', date: '18/01/24', type: 'Addition', quantity: 5, reason: 'Stock correction', performedBy: 'Admin User' },
    { id: 'ADJ-002', date: '12/01/24', type: 'Removal', quantity: 3, reason: 'Damaged goods', performedBy: 'Admin User' },
    { id: 'ADJ-003', date: '05/01/24', type: 'Addition', quantity: 10, reason: 'Found in warehouse', performedBy: 'Warehouse Staff' },
    { id: 'ADJ-004', date: '28/12/23', type: 'Removal', quantity: 2, reason: 'Expired items', performedBy: 'Admin User' },
    { id: 'ADJ-005', date: '15/12/23', type: 'Correction', quantity: 0, reason: 'Inventory audit', performedBy: 'Admin User' },
  ];

  // Sample History Data
  const historyData = [
    { date: '18/01/24', time: '14:30', action: 'Stock Adjustment', description: 'Added 5 units - Stock correction', user: 'Admin User' },
    { date: '15/01/24', time: '10:15', action: 'Purchase', description: 'Purchased 50 units from Ronald Martin', user: 'Admin User' },
    { date: '12/01/24', time: '16:45', action: 'Stock Adjustment', description: 'Removed 3 units - Damaged goods', user: 'Admin User' },
    { date: '10/12/23', time: '09:20', action: 'Purchase', description: 'Purchased 30 units from Ronald Martin', user: 'Admin User' },
    { date: '05/12/23', time: '11:00', action: 'Sale', description: 'Sold 6 units - Sale ID: 7535', user: 'Sales Staff' },
    { date: '05/11/23', time: '13:30', action: 'Purchase', description: 'Purchased 40 units from Ronald Martin', user: 'Admin User' },
    { date: '20/10/23', time: '08:45', action: 'Purchase', description: 'Purchased 25 units from Ronald Martin', user: 'Admin User' },
    { date: '12/09/23', time: '15:20', action: 'Purchase', description: 'Purchased 35 units from Ronald Martin', user: 'Admin User' },
  ];

  return (
    <div className="product-details-overlay" onClick={onClose}>
      <div className="product-details-content" onClick={(e) => e.stopPropagation()}>
        {/* Product Header */}
        <div className="product-details-header">
          <h1 className="product-details-title">{productData.name}</h1>
          <div className="product-details-actions">
            <button className="btn-secondary">
              <span style={{ marginRight: '8px' }}>✏️</span>
              Edit
            </button>
            <button className="btn-secondary">Download</button>
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
              <div className="product-details-grid">
                {/* Primary Details */}
                <div className="product-details-section">
                  <h3 className="section-title">Primary Details</h3>
                  <div className="detail-item">
                    <span className="detail-label">Product name:</span>
                    <span className="detail-value">{productData.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Product ID:</span>
                    <span className="detail-value">{productData.productId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Product category:</span>
                    <span className="detail-value">{productData.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Expiry Date:</span>
                    <span className="detail-value">{productData.expiryDate}</span>
                  </div>
                </div>

                {/* Product Image */}
                <div className="product-image-section">
                  <div className="product-image-placeholder">
                    <div className="image-placeholder-icon">📦</div>
                    <p>Product Image</p>
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="stock-information">
                <div className="stock-item">
                  <span className="stock-label">Opening Stock:</span>
                  <span className="stock-value">{productData.openingStock}</span>
                </div>
                <div className="stock-item">
                  <span className="stock-label">Remaining Stock:</span>
                  <span className="stock-value">{productData.remainingStock}</span>
                </div>
                <div className="stock-item">
                  <span className="stock-label">On the way:</span>
                  <span className="stock-value">{productData.onTheWay}</span>
                </div>
              </div>

              {/* Supplier Details */}
              <div className="supplier-details-section">
                <h3 className="section-title">Supplier Details</h3>
                <div className="detail-item">
                  <span className="detail-label">Supplier name:</span>
                  <span className="detail-value">{productData.supplierName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact Number:</span>
                  <span className="detail-value">{productData.contactNumber}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="tab-content-section">
              <h3 className="section-title">Purchase History</h3>
              <div className="table-container">
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Purchase ID</th>
                      <th>Date</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total Price</th>
                      <th>Supplier</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchasesData.map((purchase, idx) => (
                      <tr key={idx}>
                        <td>{purchase.id}</td>
                        <td>{purchase.date}</td>
                        <td>{purchase.quantity}</td>
                        <td>₱{purchase.unitPrice}</td>
                        <td>₱{purchase.totalPrice}</td>
                        <td>{purchase.supplier}</td>
                        <td>
                          <span className="status-badge completed">{purchase.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'adjustments' && (
            <div className="tab-content-section">
              <h3 className="section-title">Stock Adjustments</h3>
              <div className="table-container">
                <table className="details-table">
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
                        <td>{adjustment.id}</td>
                        <td>{adjustment.date}</td>
                        <td>
                          <span className={`adjustment-type ${adjustment.type.toLowerCase()}`}>
                            {adjustment.type}
                          </span>
                        </td>
                        <td className={adjustment.type === 'Addition' ? 'positive' : adjustment.type === 'Removal' ? 'negative' : ''}>
                          {adjustment.type === 'Addition' ? '+' : adjustment.type === 'Removal' ? '-' : ''}{adjustment.quantity}
                        </td>
                        <td>{adjustment.reason}</td>
                        <td>{adjustment.performedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-content-section">
              <h3 className="section-title">Activity History</h3>
              <div className="history-timeline">
                {historyData.map((item, idx) => (
                  <div key={idx} className="history-item">
                    <div className="history-date-time">
                      <div className="history-date">{item.date}</div>
                      <div className="history-time">{item.time}</div>
                    </div>
                    <div className="history-content">
                      <div className="history-action">{item.action}</div>
                      <div className="history-description">{item.description}</div>
                      <div className="history-user">By: {item.user}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

