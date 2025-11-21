import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import '../App.css';

const profitRevenueData = [
  { month: 'Sep', Revenue: 30000, Profit: 25000 },
  { month: 'Oct', Revenue: 35000, Profit: 28000 },
  { month: 'Nov', Revenue: 60000, Profit: 40000 },
  { month: 'Dec', Revenue: 50000, Profit: 35000 },
  { month: 'Jan', Revenue: 45000, Profit: 32000 },
  { month: 'Feb', Revenue: 55000, Profit: 38000 },
  { month: 'Mar', Revenue: 60000, Profit: 42000 },
];

const bestSellingCategories = [
  { category: 'Alcohol', turnOver: 26000, increaseBy: 3.2 },
  { category: 'Instant Food', turnOver: 22000, increaseBy: 2.0 },
  { category: 'Household', turnOver: 22000, increaseBy: 1.5 },
];

const bestSellingProducts = [
  { product: 'Tomato', productId: 23567, category: 'Vegetable', remainingQuantity: '225 kg', turnOver: 17000, increaseBy: 2.3 },
  { product: 'Red Horse', productId: 25831, category: 'Alcohol', remainingQuantity: '100 Bottles', turnOver: 12000, increaseBy: 1.3 },
  { product: 'Maggi', productId: 56841, category: 'Instant Food', remainingQuantity: '200 Packet', turnOver: 10000, increaseBy: 1.3 },
  { product: 'Surf', productId: 23567, category: 'Household', remainingQuantity: '125 Packet', turnOver: 9000, increaseBy: 1.0 },
];

export default function Reports() {
  const [chartWidth, setChartWidth] = useState(800);

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

  return (
    <div className="reports">
      <h1 className="page-title">Reports</h1>

      {/* Top Section - Overview and Best Selling Category */}
      <div className="reports-top-section">
        {/* Overview Section */}
        <div className="overview-card">
          <h3 className="section-title">Overview</h3>
          <div className="overview-metrics">
            <div className="overview-metric">
              <div className="overview-metric-label">Total Profit</div>
              <div className="overview-metric-value">₱21,190</div>
            </div>
            <div className="overview-metric">
              <div className="overview-metric-label">Revenue</div>
              <div className="overview-metric-value">₱18,300</div>
            </div>
            <div className="overview-metric">
              <div className="overview-metric-label">Sales</div>
              <div className="overview-metric-value">₱17,432</div>
            </div>
            <div className="overview-metric">
              <div className="overview-metric-label">Net purchase value</div>
              <div className="overview-metric-value">₱117,432</div>
            </div>
            <div className="overview-metric">
              <div className="overview-metric-label">Net sales value</div>
              <div className="overview-metric-value">₱80,432</div>
            </div>
            <div className="overview-metric">
              <div className="overview-metric-label">MoM Profit</div>
              <div className="overview-metric-value">₱30,432</div>
            </div>
            <div className="overview-metric">
              <div className="overview-metric-label">YoY Profit</div>
              <div className="overview-metric-value">₱110,432</div>
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
                  <td>₱{item.turnOver.toLocaleString()}</td>
                  <td className="increase-positive">+{item.increaseBy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profit & Revenue Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <h3>Profit & Revenue</h3>
          <button className="chart-filter">Weekly</button>
        </div>
        <div className="chart-wrapper">
          <LineChart width={chartWidth} height={350} data={profitRevenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Revenue" stroke="#0b63e8" strokeWidth={2} />
            <Line type="monotone" dataKey="Profit" stroke="#f97316" strokeWidth={2} />
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
                  <td>₱{item.turnOver.toLocaleString()}</td>
                  <td className="increase-positive">+{item.increaseBy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

