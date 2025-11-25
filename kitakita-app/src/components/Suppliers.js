import React, { useState } from 'react';
import '../App.css';

const suppliersData = [
  { id: 1, name: 'ABC Food Distributors', contact: '09123456789', email: 'abc@example.com', address: '123 Main St, City', products: 25, status: 'Active' },
  { id: 2, name: 'XYZ Beverage Co.', contact: '09987654321', email: 'xyz@example.com', address: '456 Market St, City', products: 18, status: 'Active' },
  { id: 3, name: 'Global Snacks Ltd.', contact: '09555555555', email: 'global@example.com', address: '789 Business Ave, City', products: 32, status: 'Inactive' },
  { id: 4, name: 'Fresh Produce Inc.', contact: '09111111111', email: 'fresh@example.com', address: '321 Farm Road, City', products: 15, status: 'Active' },
  { id: 5, name: 'Dairy Delights Co.', contact: '09222222222', email: 'dairy@example.com', address: '654 Dairy Lane, City', products: 12, status: 'Active' },
];

export default function Suppliers() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDiscard = () => {
    setFormData({
      name: '',
      contact: '',
      email: '',
      address: ''
    });
    setSelectedSupplier(null);
    setShowModal(false);
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Adding supplier:', formData);
    // Reset form and close modal
    handleDiscard();
  };

  const handleEditSupplier = (supplier) => {
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      address: supplier.address
    });
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const handleUpdateSupplier = (e) => {
    e.preventDefault();
    // Here you would typically send the updated data to your backend
    console.log('Updating supplier:', selectedSupplier.id, formData);
    // Reset form and close modal
    handleDiscard();
  };

  const getStatusClass = (status) => {
    if (status === 'Active') return 'status-active';
    if (status === 'Inactive') return 'status-inactive';
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

      {/* Suppliers Table */}
      <div className="suppliers-table-container">
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Address</th>
              <th>Products</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliersData.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.name}</td>
                <td>{supplier.contact}</td>
                <td>{supplier.email}</td>
                <td>{supplier.address}</td>
                <td>{supplier.products}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(supplier.status)}`}>
                    {supplier.status}
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
                  name="name"
                  className="form-input"
                  placeholder="Enter supplier name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="text"
                    name="contact"
                    className="form-input"
                    placeholder="Enter contact number"
                    value={formData.contact}
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