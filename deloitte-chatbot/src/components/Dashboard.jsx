import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch employee data from backend
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/employees');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEmployeeData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEmployeeSelect = async (employee) => {
    setSelectedEmployee(employee);
    
    try {
      const response = await fetch(`http://localhost:5000/api/insights/${employee.id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const handleStartChat = (employeeId) => {
    // In a real app, this would initialize a chat with the specific employee
    navigate('/chat', { state: { employeeId } });
  };

  const filteredEmployees = employeeData.filter(employee => {
    if (filter === 'all') return true;
    if (filter === 'critical') return employee.riskScore > 0.7;
    if (filter === 'moderate') return employee.riskScore > 0.4 && employee.riskScore <= 0.7;
    if (filter === 'good') return employee.riskScore <= 0.4;
    return true;
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="logo">
          <img src="/deloitte-logo.png" alt="Deloitte Logo" />
          <h1>People Experience Dashboard</h1>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
      
      <div className="dashboard-content">
        <div className="sidebar">
          <div className="filter-controls">
            <h3>Filter Employees</h3>
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'active' : ''} 
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={filter === 'critical' ? 'active' : ''} 
                onClick={() => setFilter('critical')}
              >
                Critical
              </button>
              <button 
                className={filter === 'moderate' ? 'active' : ''} 
                onClick={() => setFilter('moderate')}
              >
                Moderate
              </button>
              <button 
                className={filter === 'good' ? 'active' : ''} 
                onClick={() => setFilter('good')}
              >
                Good
              </button>
            </div>
          </div>
          
          <div className="employee-list">
            <h3>Employees Needing Attention</h3>
            {isLoading ? (
              <div className="loading">Loading employee data...</div>
            ) : (
              filteredEmployees.length > 0 ? (
                filteredEmployees.map(employee => (
                  <div 
                    key={employee.id}
                    className={`employee-card ${selectedEmployee?.id === employee.id ? 'selected' : ''}`}
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <div className="employee-info">
                      <h4>{employee.name}</h4>
                      <p>{employee.department}</p>
                    </div>
                    <div className={`risk-indicator risk-${employee.riskScore > 0.7 ? 'high' : employee.riskScore > 0.4 ? 'medium' : 'low'}`}>
                      {employee.riskScore > 0.7 ? 'High' : employee.riskScore > 0.4 ? 'Medium' : 'Low'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No employees match the selected filter.</div>
              )
            )}
          </div>
        </div>
        
        <div className="main-content">
          {selectedEmployee ? (
            <div className="employee-details">
              <div className="employee-header">
                <div>
                  <h2>{selectedEmployee.name}</h2>
                  <p>{selectedEmployee.department} | {selectedEmployee.position}</p>
                </div>
                <button 
                  className="chat-btn"
                  onClick={() => handleStartChat(selectedEmployee.id)}
                >
                  Start Conversation
                </button>
              </div>
              
              <div className="metrics-grid">
                <div className="metric-card">
                  <h3>Vibe Score</h3>
                  <div className={`metric-value ${selectedEmployee.vibeScore < 3 ? 'negative' : 'positive'}`}>
                    {selectedEmployee.vibeScore}/6
                  </div>
                  <p>Last 30 days trend: {selectedEmployee.vibeTrend > 0 ? 'Improving' : 'Declining'}</p>
                </div>
                
                <div className="metric-card">
                  <h3>Work Hours</h3>
                  <div className={`metric-value ${selectedEmployee.avgWorkHours > 9 ? 'negative' : 'positive'}`}>
                    {selectedEmployee.avgWorkHours} hrs/day
                  </div>
                  <p>Meetings: {selectedEmployee.meetingsPerDay}/day</p>
                </div>
                
                <div className="metric-card">
                  <h3>Leave Balance</h3>
                  <div className={`metric-value ${selectedEmployee.leaveUtilization < 10 ? 'negative' : 'positive'}`}>
                    {selectedEmployee.leaveUtilization} days used
                  </div>
                  <p>Last leave: {selectedEmployee.daysSinceLastLeave} days ago</p>
                </div>
                
                <div className="metric-card">
                  <h3>Performance</h3>
                  <div className={`metric-value ${selectedEmployee.performanceRating < 2 ? 'negative' : 'positive'}`}>
                    {selectedEmployee.performanceRating}/4
                  </div>
                  <p>Promotion: {selectedEmployee.promotionConsideration ? 'Under consideration' : 'Not considered'}</p>
                </div>
              </div>
              
              {insights && (
                <div className="insights-section">
                  <h3>AI Insights</h3>
                  <div className="insights-content">
                    {insights.issues.map((issue, index) => (
                      <div key={index} className="insight-card">
                        <h4>{issue.title}</h4>
                        <p>{issue.description}</p>
                        <div className="related-factors">
                          <h5>Related Factors:</h5>
                          <ul>
                            {issue.relatedFactors.map((factor, idx) => (
                              <li key={idx}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="recommended-questions">
                          <h5>Recommended Questions:</h5>
                          <ul>
                            {issue.recommendedQuestions.map((question, idx) => (
                              <li key={idx}>{question}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="conversation-history">
                <h3>Recent Conversations</h3>
                {selectedEmployee.conversations && selectedEmployee.conversations.length > 0 ? (
                  <div className="conversation-list">
                    {selectedEmployee.conversations.map((convo, index) => (
                      <div key={index} className="conversation-card">
                        <div className="conversation-header">
                          <span className="conversation-date">{new Date(convo.date).toLocaleDateString()}</span>
                          <span className={`sentiment ${convo.sentiment}`}>{convo.sentiment}</span>
                        </div>
                        <p className="conversation-summary">{convo.summary}</p>
                        <div className="key-points">
                          <h5>Key Points:</h5>
                          <ul>
                            {convo.keyPoints.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No conversation history available.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <h2>Select an employee to view details</h2>
              <p>Employee details, insights, and conversation history will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
