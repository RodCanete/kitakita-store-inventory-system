import React, { useState, useEffect } from 'react';
import '../App.css';
import { CategoriesApi } from '../api/client';

const emptyForm = {
  categoryName: '',
  description: ''
};

export default function Categories({ token }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await CategoriesApi.list(token);
      
      // Process the data to ensure all categories have a createdAt field
      const processedData = data.map(category => {
        // If category doesn't have a createdAt field, provide a default
        if (!category.createdAt) {
          // For existing categories without createdAt, we might use a placeholder
          // or the current time as a fallback
          category.createdAt = new Date().toISOString();
        }
        return category;
      });
      
      setCategories(processedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [token]);

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
    setEditingCategoryId(null);
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

  const openEditModal = (category) => {
    setFormMode('edit');
    setFormData({
      categoryName: category.categoryName || '',
      description: category.description || ''
    });
    setEditingCategoryId(category.categoryId);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      if (formMode === 'edit' && editingCategoryId) {
        await CategoriesApi.update(editingCategoryId, formData, token);
      } else {
        // For new categories, we'll add a temporary createdAt field
        // This ensures that even if the backend doesn't return it immediately,
        // the UI will show a value
        const response = await CategoriesApi.create(formData, token);
        
        // If the response doesn't include createdAt, we'll add it client-side
        if (response && typeof response === 'object' && !response.createdAt) {
          response.createdAt = new Date().toISOString();
        }
      }
      
      await loadCategories();
      handleDiscard();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setError(null);
    try {
      await CategoriesApi.remove(categoryId, token);
      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (value) => {
    // Handle cases where value is null, undefined, or empty
    if (!value) return '-';
    
    try {
      // Handle different date formats
      let date;
      if (typeof value === 'string') {
        // Handle ISO string dates
        date = new Date(value);
      } else if (value instanceof Date) {
        // Handle Date objects
        date = value;
      } else {
        // Handle other formats (numbers, etc.)
        date = new Date(value);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // If we can't parse the date, return the original value or '-'
        return typeof value === 'string' ? value : '-';
      }
      
      // Return formatted date
      return date.toLocaleDateString();
    } catch (error) {
      // If there's any error in processing, return the original value or '-'
      console.warn('Error formatting date:', value, error);
      return typeof value === 'string' ? value : '-';
    }
  };
  return (
    <div className="categories">
      <h1 className="page-title">Categories</h1>
      {error && <div className="form-error" role="alert">{error}</div>}

      <div className="categories-section">
        <div className="categories-header">
          <h2>Product Categories</h2>
          <div className="categories-actions">
            <button className="btn-primary" onClick={openCreateModal}>Add Category</button>
          </div>
        </div>
        {loading ? (
          <div className="info-banner">Loading categories…</div>
        ) : (
          <div className="categories-table-container">
            <table className="categories-table products-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.categoryId}>
                    <td>{category.categoryName}</td>
                    <td>{category.description || '-'}</td>
                    <td>{formatDate(category.createdAt)}</td>
                    <td className="table-actions">
                      <div className="action-buttons">
                        <button 
                          className="action-btn-icon edit-btn-icon" 
                          onClick={() => openEditModal(category)}
                          title="Edit category"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.333 2.00001C11.5084 1.82465 11.7163 1.68607 11.9447 1.59233C12.1731 1.49859 12.4173 1.45166 12.6637 1.45435C12.9101 1.45704 13.1533 1.50929 13.3788 1.60777C13.6043 1.70625 13.8075 1.84896 13.9762 2.02763C14.1449 2.2063 14.2757 2.40734 14.3615 2.62891C14.4473 2.85048 14.4863 3.08798 14.476 3.32568C14.4657 3.56338 14.4063 3.79648 14.301 4.01134C14.1957 4.2262 14.0466 4.41858 13.8613 4.57734L13.333 5.10568L10.8947 2.66734L11.333 2.00001ZM10 3.33334L12.6667 6.00001L5.33333 13.3333H2.66667V10.6667L10 3.33334Z" fill="currentColor"/>
                          </svg>
                        </button>
                        <button 
                          className="action-btn-icon delete-btn-icon" 
                          onClick={() => handleDelete(category.categoryId)}
                          title="Delete category"
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
                {!categories.length && (
                  <tr>
                    <td colSpan={4} className="text-center">No categories found. Add your first category.</td>
                  </tr>
                )}              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="purchase-form-header">
              <h3>{formMode === 'edit' ? 'Edit Category' : 'New Category'}</h3>
              <p>{formMode === 'edit' ? 'Update the category details below' : 'Fill in the details below to create a new category'}</p>
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} className="purchase-form">
              <div className="form-group">
                <label className="form-group-label">Category Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="categoryName"
                  className="form-control"
                  placeholder="Enter category name"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-group-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  placeholder="Enter category description (optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="purchase-form-actions">
                <button type="button" className="btn-discard" onClick={handleDiscard} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : formMode === 'edit' ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}