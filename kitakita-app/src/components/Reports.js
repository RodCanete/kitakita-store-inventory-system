import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ReportsApi } from '../api/client';
import '../App.css';

export default function Reports({ token }) {
  const [chartWidth, setChartWidth] = useState(800);
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const updateChartWidth = () => {
      const card = document.querySelector('.chart-card');
      if (card) {
        const width = Math.max(card.offsetWidth - 48, 600);
        setChartWidth(Math.min(width, 800));
      }
    };

    const timer = setTimeout(updateChartWidth, 100);
    window.addEventListener('resize', updateChartWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateChartWidth);
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    const loadReportsData = async () => {
      console.log('Fetching reports data with token:', token.substring(0, 10) + '...');
      setLoading(true);
      setError(null);
      try {
        const data = await ReportsApi.getReports(token);
        console.log('Received reports data:', data);
        if (isMounted) {
          setReportsData(data);
        }
      } catch (err) {
        console.error('Error fetching reports data:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReportsData();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '₱0';
    return `₱${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const salesOverview = reportsData?.salesOverview;
  const bestSellingCategories = reportsData?.bestSellingCategories || [];
  const bestSellingProducts = reportsData?.bestSellingProducts || [];
  const profitRevenueData = reportsData?.profitRevenueData || [];

  return (
    <div className="reports">
      <h1 className="page-title">Reports</h1>
      
      {loading && <div className="info-banner">Loading reports data…</div>}
      {error && <div className="form-error" role="alert">{error}</div>}

      {/* Top Section - Overview and Best Selling Category */}
      <div className="reports-top-section">
        {/* Overview Section */}
        <div className="overview-card">
          <h3 className="section-title">Overview</h3>
          <div className="overview-metrics">
            <div className="overview-metric">
              <div className="overview-metric-label">Total Profit</div>
              <div className="overview-metric-value">{salesOverview ? formatCurrency(salesOverview.totalProfit) : '₱0'}</div>
            </div>
            <div className="overview-metric">
              <div className="overview-metric-label">Revenue</div>
              <div className="overview-metric-value">{salesOverview ? formatCurrency(salesOverview.revenue) : '₱0'}</div>
            </div>
            <div className="overview-metric">
              <div className="overview-metric-label">Sales</div>
              <div className="overview-metric-value">{salesOverview ? formatCurrency(salesOverview.sales) : '₱0'}</div>
            </div>
            <div className="overview-metric">
              <div className="overview-metric-label">Net purchase value</div>
              <div className="overview-metric-value">{salesOverview ? formatCurrency(salesOverview.netPurchaseValue) : '₱0'}</div>
            </div>
            <div className="overview-metric">
              <div className="overview-metric-label">Net sales value</div>
              <div className="overview-metric-value">{salesOverview ? formatCurrency(salesOverview.netSalesValue) : '₱0'}</div>
            </div>
            <div className="overview-metric">
              <div className="overview-metric-label">MoM Profit</div>
              <div className="overview-metric-value">{salesOverview ? formatCurrency(salesOverview.momProfit) : '₱0'}</div>
            </div>
            <div className="overview-metric">
              <div className="overview-metric-label">YoY Profit</div>
              <div className="overview-metric-value">{salesOverview ? formatCurrency(salesOverview.yoyProfit) : '₱0'}</div>
            </div>
          </div>
        </div>

        {/* Best Selling Category */}
        <div className="best-selling-card">
          <div className="section-header">
            <h3 className="section-title">Best selling category</h3>
            <button className="link-button">See All</button>
          </div>
          <table className="reports-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Turn Over</th>
                <th>Increase By</th>
              </tr>
            </thead>
            <tbody>
              {bestSellingCategories.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.category}</td>
                  <td>{formatCurrency(item.turnOver)}</td>
                  <td className="increase-positive">+{item.increaseBy?.toFixed(1) || '0.0'}%</td>
                </tr>
              ))}
              {!bestSellingCategories.length && !loading && (
                <tr>
                  <td colSpan={3} className="muted">No category data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profit & Revenue Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <h3>Profit & Revenue</h3>
          
        </div>
        <div className="chart-wrapper">
          <LineChart width={chartWidth} height={350} data={profitRevenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#0b63e8" strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="profit" stroke="#f97316" strokeWidth={2} name="Profit" />
          </LineChart>
        </div>
      </div>

      {/* Best Selling Product */}
      <div className="best-selling-product-card">
        <div className="section-header">
          <h3 className="section-title">Best selling product</h3>
          <button className="link-button">See All</button>
        </div>
        <div className="table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Product ID</th>
                <th>Category</th>
                <th>Remaining Quantity</th>
                <th>Turn Over</th>
                <th>Increase By</th>
              </tr>
            </thead>
            <tbody>
              {bestSellingProducts.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.product}</td>
                  <td>{item.productId}</td>
                  <td>{item.category}</td>
                  <td>{item.remainingQuantity}</td>
                  <td>{formatCurrency(item.turnOver)}</td>
                  <td className="increase-positive">+{item.increaseBy?.toFixed(1) || '0.0'}%</td>
                </tr>
              ))}
              {!bestSellingProducts.length && !loading && (
                <tr>
                  <td colSpan={6} className="muted">No product data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}