import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { DashboardApi } from '../api/client';
import '../App.css';

// Color palette for categories
const CATEGORY_COLORS = [
  '#0b63e8', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Green
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#84cc16', // Lime
  '#f97316', // Deep Orange
];

const formatNumber = (value) => {
  if (value === undefined || value === null) return '-';
  return value.toLocaleString();
};

const formatCurrency = (value) => {
  if (!value && value !== 0) return '₱0';
  return `₱${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function Dashboard({ token }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    const loadSummary = async () => {
      console.log('Fetching dashboard data with token:', token.substring(0, 10) + '...');
      setLoading(true);
      setError(null);
      try {
        const data = await DashboardApi.summary(token);
        console.log('Received dashboard data:', data);
        if (isMounted) {
          setSummary(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSummary();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const summaryCards = summary?.summaryCards;
  const inventoryByCategory = summary?.inventoryByCategory ?? [];
  const stockMovement = summary?.stockMovement ?? [];
  const topSellingStock = summary?.topSellingStock ?? [];
  const lowQuantityStock = summary?.lowQuantityStock ?? [];

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      {loading && <div className="info-banner">Loading latest inventory insights…</div>}
      {error && <div className="form-error" role="alert">{error}</div>}

      <div className="summary-cards-grid">
        <div className="summary-card">
          <h3 className="summary-card-title">Inventory Overview</h3>
          <div className="summary-metrics">
            <div className="summary-metric">
              <div className="summary-metric-icon blue">📦</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Total Products</div>
                <div className="summary-metric-value">{formatNumber(summaryCards?.totalProducts)}</div>
              </div>
            </div>
            <div className="summary-metric">
              <div className="summary-metric-icon purple">💰</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Inventory Value</div>
                <div className="summary-metric-value">{formatCurrency(summaryCards?.inventoryValue)}</div>
              </div>
            </div>
            <div className="summary-metric">
              <div className="summary-metric-icon orange">🚨</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Low Stock Items</div>
                <div className="summary-metric-value">{formatNumber(summaryCards?.lowStockCount)}</div>
              </div>
            </div>
            <div className="summary-metric">
              <div className="summary-metric-icon green">🚚</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">On The Way</div>
                <div className="summary-metric-value">{formatNumber(summaryCards?.onTheWay)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h3 className="summary-card-title">Suppliers & Categories</h3>
          <div className="summary-metrics">
            <div className="summary-metric">
              <div className="summary-metric-icon blue">👥</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Suppliers</div>
                <div className="summary-metric-value">{formatNumber(summaryCards?.totalSuppliers)}</div>
              </div>
            </div>
            <div className="summary-metric">
              <div className="summary-metric-icon purple">📂</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Categories</div>
                <div className="summary-metric-value">{formatNumber(summaryCards?.totalCategories)}</div>
              </div>
            </div>
            <div className="summary-metric">
              <div className="summary-metric-icon orange">📦</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Total Quantity</div>
                <div className="summary-metric-value">{formatNumber(summaryCards?.totalQuantity)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Inventory by Category</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={inventoryByCategory}
                barSize={inventoryByCategory.length <= 4 ? 60 : inventoryByCategory.length <= 6 ? 45 : 30}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Quantity" radius={[8, 8, 0, 0]}>
                  {inventoryByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Stock Movement</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockMovement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#0b63e8" strokeWidth={2} name="Quantity" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="tables-row">
        <div className="table-card">
          <div className="table-header">
            <h3>Top Stock Positions</h3>
            <span className="muted">{topSellingStock.length} items</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Threshold</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {topSellingStock.map((item) => (
                <tr key={item.productId}>
                  <td>{item.name}</td>
                  <td>{formatNumber(item.quantity)}</td>
                  <td>{formatNumber(item.thresholdValue)}</td>
                  <td>{item.unit || '-'}</td>
                </tr>
              ))}
              {!topSellingStock.length && (
                <tr>
                  <td colSpan={4} className="muted">No product data available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <div className="table-header">
            <h3>Low Quantity Stock</h3>
            <span className="muted">{lowQuantityStock.length} alerts</span>
          </div>
          <div className="low-stock-list">
            {lowQuantityStock.map((item) => (
              <div key={item.productId} className="low-stock-item">
                <div className="low-stock-image">📦</div>
                <div className="low-stock-info">
                  <div className="low-stock-name">{item.name}</div>
                  <div className="low-stock-quantity">
                    Remaining: {formatNumber(item.quantity)} {item.unit || ''}
                  </div>
                </div>
                <span className="low-stock-badge">Low</span>
              </div>
            ))}
            {!lowQuantityStock.length && (
              <div className="muted">All products are above their threshold levels.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}