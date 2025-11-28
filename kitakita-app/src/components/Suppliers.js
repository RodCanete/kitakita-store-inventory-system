import React, { useState, useEffect } from 'react';
import '../App.css';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    supplierName: '',
    contactNumber: '',
    email: '',
    address: ''
  });

  // Get token from localStorage (assuming it's stored there after login)
  const token = localStorage.getItem('kitakita_token');
  
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      // Add authorization header if token is available
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiBase}/api/suppliers`, {
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }
      const data = await response.json();
      setSuppliers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
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
      supplierName: '',
      contactNumber: '',
      email: '',
      address: ''
    });
    setSelectedSupplier(null);
    setShowModal(false);
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!token) {
      setError('You must be logged in to add suppliers');
      return;
    }
    
    try {
      const supplierData = {
        supplierName: formData.supplierName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        address: formData.address,
        isActive: true
      };
      
      const response = await fetch(`${apiBase}/api/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(supplierData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add supplier: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      const newSupplier = await response.json();
      console.log('Supplier added successfully:', newSupplier);
      
      // Refresh the supplier list
      await fetchSuppliers();
      
      // Reset form and close modal
      handleDiscard();
    } catch (error) {
      console.error('Error adding supplier:', error);
      setError(error.message);
    }
  };

  const handleEditSupplier = (supplier) => {
    setFormData({
      supplierName: supplier.supplierName,
      contactNumber: supplier.contactNumber,
      email: supplier.email,
      address: supplier.address
    });
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!token) {
      setError('You must be logged in to update suppliers');
      return;
    }
    
    try {
      const supplierData = {
        supplierName: formData.supplierName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        address: formData.address,
        isActive: selectedSupplier.isActive
      };
      
      const response = await fetch(`${apiBase}/api/suppliers/${selectedSupplier.supplierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(supplierData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update supplier: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      const updatedSupplier = await response.json();
      console.log('Supplier updated successfully:', updatedSupplier);
      
      // Refresh the supplier list
      await fetchSuppliers();
      
      // Reset form and close modal
      handleDiscard();
    } catch (error) {
      console.error('Error updating supplier:', error);
      setError(error.message);
    }
  };

  const getStatusClass = (status) => {
    if (status === true) return 'status-active';
    if (status === false) return 'status-inactive';
    return '';
  };

  return (
    <div className="suppliers">
      <div className="suppliers-header">
        <h1 className="page-title">Suppliers</h1>
        <div className="suppliers-actions">
          <button className="btn-primary" onClick={() => setShowModal(true)}>Add Supplier</button>
          <button className="btn-secondary">Filters</button>
          <button className="btn-secondary">Download all</button>
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
          Loading suppliers...
        </div>
      )}

      {/* Suppliers Table */}
      <div className="suppliers-table-container">
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.supplierId}>
                <td>{supplier.supplierName}</td>
                <td>{supplier.contactNumber}</td>
                <td>{supplier.email}</td>
                <td>{supplier.address}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(supplier.isActive)}`}>
                    {supplier.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-secondary btn-small"
                    onClick={() => handleEditSupplier(supplier)}
                  >
                    Edit
                  </button>
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

      {/* Add/Edit Supplier Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{selectedSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
            
            <form onSubmit={selectedSupplier ? handleUpdateSupplier : handleAddSupplier} className="supplier-form">
              <div className="form-field">
                <label className="form-label">Supplier Name</label>
                <input
                  type="text"
                  name="supplierName"
                  className="form-input"
                  placeholder="Enter supplier name"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    className="form-input"
                    placeholder="Enter contact number"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  className="form-input"
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button type="button" className="btn-discard" onClick={handleDiscard}>
                  Discard
                </button>
                <button type="submit" className="btn-primary">
                  {selectedSupplier ? 'Update Supplier' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}