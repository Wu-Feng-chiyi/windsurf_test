# 房地產平台

這是一個使用 React 和 Node.js 構建的全棧房地產平台。

## 功能特點

- 用戶認證系統（註冊/登入）
- JWT 基於 token 的認證
- MySQL 數據庫整合
- 響應式設計

## 技術棧

### 前端
- React.js
- React Router
- CSS Modules
- Axios（用於 API 請求）

### 後端
- Node.js
- Express.js
- MySQL
- JWT（JSON Web Tokens）
- Bcrypt（密碼加密）

## 安裝指南

1. 克隆倉庫：
```bash
git clone [repository-url]
cd fullstack-app
```

2. 安裝依賴：

前端：
```bash
cd frontend
npm install
```

後端：
```bash
cd backend
npm install
```

3. 設置環境變量：

在 backend 目錄中創建 `.env` 文件：
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=fullstack_db
JWT_SECRET=your-secret-key
PORT=5000
```

4. 創建數據庫：

```sql
CREATE DATABASE fullstack_db;
```

5. 啟動服務：

前端：
```bash
cd frontend
npm start
```

後端：
```bash
cd backend
npm run dev
```

## API 端點

### 認證 API

- POST `/api/auth/register` - 用戶註冊
  - 請求體：
    ```json
    {
      "name": "用戶名",
      "email": "email@example.com",
      "password": "密碼",
      "phone": "手機號碼"
    }
    ```

- POST `/api/auth/login` - 用戶登入
  - 請求體：
    ```json
    {
      "email": "email@example.com",
      "password": "密碼"
    }
    ```

- GET `/api/auth/me` - 獲取當前用戶信息
  - 需要認證 token

## 項目結構

```
fullstack-app/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginModal.js
│   │   │   │   ├── RegisterModal.js
│   │   │   │   └── Auth.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── index.js
│   └── package.json
└── README.md
```

## 安全性考慮

- 密碼使用 bcrypt 加密儲存
- 使用 JWT 進行安全認證
- 實施 CORS 保護
- 環境變量保護敏感信息

## 開發注意事項

1. 確保 MySQL 服務正在運行
2. 檢查環境變量配置
3. 前端開發服務運行在 3000 端口
4. 後端 API 服務運行在 5000 端口

## 貢獻指南

1. Fork 該倉庫
2. 創建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打開一個 Pull Request

## 許可證

MIT License
