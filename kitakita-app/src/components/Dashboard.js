import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import '../App.css';

const salesData = [
  { month: 'Jan', Purchase: 15000, Sales: 20000 },
  { month: 'Feb', Purchase: 18000, Sales: 22000 },
  { month: 'Mar', Purchase: 22000, Sales: 28000 },
  { month: 'Apr', Purchase: 25000, Sales: 32000 },
  { month: 'May', Purchase: 28000, Sales: 38000 },
  { month: 'Jun', Purchase: 30000, Sales: 42000 },
];

const orderData = [
  { month: 'Jan', Ordered: 1200, Delivered: 1100 },
  { month: 'Feb', Ordered: 1500, Delivered: 1400 },
  { month: 'Mar', Ordered: 1800, Delivered: 1700 },
  { month: 'Apr', Ordered: 2200, Delivered: 2100 },
  { month: 'May', Ordered: 2500, Delivered: 2400 },
];

const topSellingStock = [
  { name: 'Surf Fabcon', soldQuantity: 30, remainingQuantity: 12, price: 75 },
  { name: 'Red Horse', soldQuantity: 21, remainingQuantity: 15, price: 55 },
  { name: 'Perla Bar White', soldQuantity: 19, remainingQuantity: 17, price: 55 },
];

const lowQuantityStock = [
  { name: 'Piattos', quantity: 10, unit: 'Packet' },
  { name: 'Moby (Caramel)', quantity: 15, unit: 'Packet' },
  { name: 'Moby (Chocolate)', quantity: 15, unit: 'Packet' },
];

export default function Dashboard() {
  const [chartWidth, setChartWidth] = useState(600);

  useEffect(() => {
    const updateChartWidth = () => {
      const card = document.querySelector('.chart-card');
      if (card) {
        // Get the actual available width minus padding (24px on each side = 48px total)
        const availableWidth = card.offsetWidth - 48;
        // Use the full available width, with a minimum of 300px
        const width = Math.max(availableWidth, 300);
        setChartWidth(width);
      }
    };

    // Use setTimeout to ensure DOM is ready
    const timer = setTimeout(updateChartWidth, 100);
    window.addEventListener('resize', updateChartWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateChartWidth);
    };
  }, []);

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      {/* Summary Cards - 2x2 Grid */}
      <div className="summary-cards-grid">
        {/* Sales Overview */}
        <div className="summary-card">
          <h3 className="summary-card-title">Sales Overview</h3>
          <div className="summary-metrics">
            <div className="summary-metric">
              <div className="summary-metric-icon blue">📊</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Sales</div>
                <div className="summary-metric-value">P 832</div>
              </div>
            </div>
            <div className="summary-metric">
              <div className="summary-metric-icon purple">📈</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Revenue</div>
                <div className="summary-metric-value">P 18,300</div>
              </div>
            </div>
            <div className="summary-metric">
              <div className="summary-metric-icon orange">📊</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Profit</div>
                <div className="summary-metric-value">P 868</div>
              </div>
            </div>
            <div className="summary-metric">
              <div className="summary-metric-icon green">🏠</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Cost</div>
                <div className="summary-metric-value">P 17,432</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="summary-card">
          <h3 className="summary-card-title">Inventory Summary</h3>
          <div className="summary-metrics">
            <div className="summary-metric">
              <div className="summary-metric-icon orange">📦</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Quantity in Hand</div>
                <div className="summary-metric-value">868</div>
              </div>
            </div>
            <div className="summary-metric">
              <div className="summary-metric-icon purple">📍</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">To be received</div>
                <div className="summary-metric-value">200</div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Overview */}
        <div className="summary-card">
          <h3 className="summary-card-title">Purchase Overview</h3>
          <div className="summary-metrics">
            <div className="summary-metric">
              <div className="summary-metric-icon blue">🛍️</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Purchase</div>
                <div className="summary-metric-value">82</div>
              </div>
            </div>
            <div className="summary-metric">
              <div className="summary-metric-icon green">🏠</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Cost</div>
                <div className="summary-metric-value">P 15,000</div>
              </div>
            </div>
            <div className="summary-metric">
              <div className="summary-metric-icon purple">❌</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Cancel</div>
                <div className="summary-metric-value">5</div>
              </div>
            </div>
            <div className="summary-metric">
              <div className="summary-metric-icon orange">↩️</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Return</div>
                <div className="summary-metric-value">P 17,432</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Summary */}
        <div className="summary-card">
          <h3 className="summary-card-title">Product Summary</h3>
          <div className="summary-metrics">
            <div className="summary-metric">
              <div className="summary-metric-icon blue">👥</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Number of Suppliers</div>
                <div className="summary-metric-value">31</div>
              </div>
            </div>
            <div className="summary-metric">
              <div className="summary-metric-icon purple">📋</div>
              <div className="summary-metric-content">
                <div className="summary-metric-label">Number of Categories</div>
                <div className="summary-metric-value">21</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Sales & Purchase</h3>
            <button className="chart-filter">Weekly</button>
          </div>
          <div className="chart-wrapper">
            <BarChart width={chartWidth} height={300} data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Purchase" fill="#0b63e8" />
              <Bar dataKey="Sales" fill="#10b981" />
            </BarChart>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Order Summary</h3>
          </div>
          <div className="chart-wrapper">
            <LineChart width={chartWidth} height={300} data={orderData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Ordered" stroke="#f97316" strokeWidth={2} />
              <Line type="monotone" dataKey="Delivered" stroke="#0b63e8" strokeWidth={2} />
            </LineChart>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="tables-row">
        <div className="table-card">
          <div className="table-header">
            <h3>Top Selling Stock</h3>
            <button className="link-button">See All</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Sold Quantity</th>
                <th>Remaining Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {topSellingStock.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.soldQuantity}</td>
                  <td>{item.remainingQuantity}</td>
                  <td>₱{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <div className="table-header">
            <h3>Low Quantity Stock</h3>
            <button className="link-button">See All</button>
          </div>
          <div className="low-stock-list">
            {lowQuantityStock.map((item, idx) => (
              <div key={idx} className="low-stock-item">
                <div className="low-stock-image">📦</div>
                <div className="low-stock-info">
                  <div className="low-stock-name">{item.name}</div>
                  <div className="low-stock-quantity">Remaining Quantity: {item.quantity} {item.unit}</div>
                </div>
                <span className="low-stock-badge">Low</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

