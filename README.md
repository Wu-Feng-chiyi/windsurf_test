# 房地產平台

這是一個使用 React 和 Node.js 構建的全棧房地產平台。

## 功能特點

- 用戶認證系統（註冊/登入）
- JWT 基於 token 的認證
- MySQL 數據庫整合
- 響應式設計
- 輪播橫幅展示
- 高級搜索功能
- 用戶下拉菜單

## 技術棧

### 前端
- React.js
- React Router
- CSS Modules
- Axios（用於 API 請求）
- Font Awesome（圖標）

### 後端
- Node.js
- Express.js
- MySQL
- JWT（JSON Web Tokens）
- Bcrypt（密碼加密）
- CORS 配置

### 部署
- Nginx（反向代理和靜態文件服務）

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

在 frontend 目錄中創建 `.env` 文件：
```
REACT_APP_API_BASE_URL=http://your-domain/api
```

4. 創建數據庫：

```sql
CREATE DATABASE fullstack_db;
```

5. 配置 Nginx：

創建配置文件 `/etc/nginx/sites-available/fullstack-app`：
```nginx
server {
    listen 80;
    server_name your-domain;

    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
        expires 30d;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. 啟動服務：

前端開發模式：
```bash
cd frontend
npm start
```

前端生產構建：
```bash
cd frontend
npm run build
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

## 目錄結構

```
fullstack-app/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   │   ├── LoginModal.js
│       │   │   └── RegisterModal.js
│       │   └── layout/
│       │       ├── Header.js
│       │       ├── Banner.js
│       │       └── Header.css
│       ├── contexts/
│       │   └── AuthContext.js
│       ├── App.js
│       └── index.js
├── backend/
│   ├── routes/
│   │   └── auth.js
│   ├── models/
│   │   └── user.js
│   └── index.js
└── README.md
```

## 最新更新

- 添加了輪播橫幅組件
- 優化了用戶認證流程
- 改進了頁面布局和響應式設計
- 配置了 Nginx 反向代理
- 添加了 CORS 支持

## 開發注意事項

1. 確保 MySQL 服務正在運行
2. 檢查所有環境變量是否正確設置
3. 在生產環境中使用 HTTPS
4. 定期更新依賴包
5. 遵循 Git 工作流程進行開發

## 貢獻指南

1. Fork 該倉庫
2. 創建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 許可證

MIT License
