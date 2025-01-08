import React, { useState, useEffect } from 'react';
import './App.css';

// 使用相對路徑，這樣會通過當前域名訪問
const API_BASE_URL = '/api';

function App() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  // 獲取所有用戶
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
      setError('');
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('獲取用戶列表失敗: ' + error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingId 
        ? `${API_BASE_URL}/users/${editingId}`
        : `${API_BASE_URL}/users`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      console.log('Sending request to:', url);
      console.log('Request data:', formData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Response data:', result);

      setFormData({ name: '', email: '' });
      setEditingId(null);
      fetchUsers();
      setError('');
    } catch (error) {
      console.error('Error saving user:', error);
      setError('保存用戶失敗: ' + error.message);
    }
  };

  // 處理刪除
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      fetchUsers();
      setError('');
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('刪除用戶失敗: ' + error.message);
    }
  };

  // 處理編輯
  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email });
    setEditingId(user.id);
    setError('');
  };

  return (
    <div className="App">
      <h1>用戶管理系統</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* 表單 */}
      <form onSubmit={handleSubmit} style={{ margin: '20px' }}>
        <input
          type="text"
          placeholder="姓名"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ margin: '0 10px' }}
          required
        />
        <input
          type="email"
          placeholder="電子郵件"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{ margin: '0 10px' }}
          required
        />
        <button type="submit">
          {editingId ? '更新' : '新增'}
        </button>
      </form>

      {/* 用戶列表 */}
      <div style={{ margin: '20px' }}>
        <h2>用戶列表</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>姓名</th>
              <th>電子郵件</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <button onClick={() => handleEdit(user)} style={{ margin: '0 5px' }}>
                    編輯
                  </button>
                  <button onClick={() => handleDelete(user.id)} style={{ margin: '0 5px' }}>
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
