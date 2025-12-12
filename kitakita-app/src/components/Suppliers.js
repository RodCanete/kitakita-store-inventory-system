import React, { useState, useEffect } from 'react';
import '../App.css';

export default function Suppliers({ token }) {
  const [suppliersData, setSuppliersData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Fetch suppliers from backend
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/suppliers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Map the API response to match the existing UI structure
        const mappedSuppliers = data.content.map(supplier => ({
          id: supplier.supplierId,
          name: supplier.supplierName,
          contact: supplier.contactNumber,
          email: supplier.email,
          address: supplier.address,
          products: 0, // This would need to be calculated from products API
          status: supplier.isActive ? 'Active' : 'Inactive'
        }));
        setSuppliersData(mappedSuppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
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
      name: '',
      contact: '',
      email: '',
      address: ''
    });
    setSelectedSupplier(null);
    setShowModal(false);
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      const supplierRequest = {
        supplierName: formData.name,
        contactNumber: formData.contact,
        email: formData.email,
        address: formData.address,
        isActive: true
      };

      const response = await fetch('http://localhost:8080/api/suppliers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
          },
        body: JSON.stringify(supplierRequest)
      });

      if (response.ok) {
        await fetchSuppliers(); // Refresh the list
        handleDiscard(); // Close modal and reset form
      } else {
        console.error('Failed to add supplier');
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
    }
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

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    try {
      const supplierRequest = {
        supplierName: formData.name,
        contactNumber: formData.contact,
        email: formData.email,
        address: formData.address,
        isActive: true
      };

      const response = await fetch(`http://localhost:8080/api/suppliers/${selectedSupplier.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplierRequest)
      });

      if (response.ok) {
        await fetchSuppliers(); // Refresh the list
        handleDiscard(); // Close modal and reset form
      } else {
        console.error('Failed to update supplier');
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'Active') return 'status-active';
    if (status === 'Inactive') return 'status-inactive';
    return '';
  };

  // Filter suppliers based on search and status
  const filteredSuppliers = suppliersData.filter(supplier => {
    const matchesSearch = searchFilter === '' || 
      supplier.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      supplier.contact.includes(searchFilter);
    const matchesStatus = statusFilter === '' || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Download suppliers as CSV
  const handleDownloadCsv = () => {
    setDownloading(true);
    try {
      const headers = ['Supplier Name', 'Contact', 'Email', 'Address', 'Status'];
      const csvContent = [
        headers.join(','),
        ...filteredSuppliers.map(supplier => 
          [
            `"${supplier.name}"`,
            `"${supplier.contact}"`,
            `"${supplier.email}"`,
            `"${supplier.address || 'N/A'}"`,
            `"${supplier.status}"`
          ].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kitakita-suppliers.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="suppliers">
      <div className="suppliers-header">
        <div className="suppliers-actions">
          <button className="btn-primary-icon" onClick={() => setShowModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Supplier
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
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by name, email, or contact..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button className="btn-clear-filters" onClick={() => {
            setSearchFilter('');
            setStatusFilter('');
          }}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Suppliers Table */}
      <div className="suppliers-table-container">
        {loading ? (
          <div>Loading suppliers...</div>
        ) : (
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
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.contact}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.address || 'N/A'}</td>
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
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">No suppliers found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
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