import React, { useState } from 'react';
import '../App.css';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

export default function ProductDetails({ product, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(product);
      onClose(); // Close the product details modal
    }
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
                  <div className="product-image-container">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={productData.name} className="product-image" />
                    ) : (
                      <div className="product-image-placeholder">
                        <div className="image-placeholder-icon">📦</div>
                        <p>No Image Available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="stock-information">
                <div className="stock-item">
                  <span className="stock-label">Opening Stock</span>
                  <span className="stock-value">{productData.openingStock}</span>
                </div>
                <div className="stock-item">
                  <span className="stock-label">Remaining Stock</span>
                  <span className="stock-value">{productData.remainingStock}</span>
                </div>
                <div className="stock-item">
                  <span className="stock-label">On the way</span>
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

