# 全棧用戶管理系統

一個使用 React、Node.js、Express 和 MySQL 構建的全棧用戶管理系統。

## 功能特點

- 用戶管理（CRUD 操作）
- 響應式設計
- 錯誤處理和用戶反饋
- RESTful API
- MySQL 數據存儲

## 技術棧

### 前端
- React.js
- CSS3
- Fetch API

### 後端
- Node.js
- Express.js
- MySQL2
- CORS

### 數據庫
- MySQL

### 代理服務器
- Nginx

## 安裝說明

1. 克隆倉庫：
```bash
git clone [repository-url]
cd fullstack-app
```

2. 安裝後端依賴：
```bash
cd backend
npm install
```

3. 安裝前端依賴：
```bash
cd ../frontend
npm install
```

4. 配置環境變量：
   - 在 backend 目錄中創建 .env 文件
   - 添加以下配置：
```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=fullstack_db
PORT=5000
```

5. 創建數據庫：
```sql
CREATE DATABASE fullstack_db;
USE fullstack_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);
```

## 運行應用

1. 啟動後端服務：
```bash
cd backend
npm start
```

2. 啟動前端服務：
```bash
cd frontend
npm start
```

3. 訪問應用：
   打開瀏覽器訪問 http://localhost:3000

## API 文檔

### 端點

- `POST /api/users` - 創建新用戶
- `GET /api/users` - 獲取所有用戶
- `GET /api/users/:id` - 獲取特定用戶
- `PUT /api/users/:id` - 更新用戶信息
- `DELETE /api/users/:id` - 刪除用戶

## 部署

1. 構建前端：
```bash
cd frontend
npm run build
```

2. 配置 Nginx：
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

## 貢獻

歡迎提交 Pull Requests 來改進這個項目。

## 許可證

MIT
