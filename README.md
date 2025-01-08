# 房地產平台 (Real Estate Platform)

## 專案概述
這是一個現代化的房地產交易平台，提供安全、高效的用戶體驗。

## 技術棧
- 前端: React.js
- 後端: Node.js + Express
- 資料庫: MySQL
- 身份驗證: JWT, 雙因素驗證
- 安全性: bcrypt, express-validator

## 主要功能
- 用戶註冊與登入
- 安全的身份驗證系統
- 雙因素驗證
- 密碼重置機制
- 房地產物業瀏覽
- 用戶個人資料管理

## 安全特性
- 密碼複雜度驗證
- 速率限制防止暴力破解
- JWT Token驗證
- 雙因素驗證
- 安全的密碼重置流程

## 環境設置

### 先決條件
- Node.js (v14+)
- MySQL
- npm 或 yarn

### 安裝步驟
1. 克隆倉庫
```bash
git clone https://github.com/yourusername/real-estate-platform.git
```

2. 安裝後端依賴
```bash
cd backend
npm install
```

3. 安裝前端依賴
```bash
cd ../frontend
npm install
```

4. 設置環境變數
在 `backend/.env` 中配置:
```
DATABASE_URL=mysql://username:password@localhost:3306/realestate
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

5. 資料庫遷移
```bash
npm run migrate
```

6. 啟動開發伺服器
```bash
# 後端
cd backend
npm run dev

# 前端
cd ../frontend
npm start
```

## 部署
- 使用 PM2 管理 Node.js 進程
- 建議使用 Nginx 作為反向代理
- 使用 Let's Encrypt 提供 HTTPS

## 安全注意事項
- 定期更新依賴
- 使用環境變數管理敏感信息
- 啟用雙因素驗證
- 定期進行安全審計

## 貢獻指南
1. Fork 倉庫
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m '新增一些令人驚嘆的功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權
此專案採用 MIT 授權 - 詳見 LICENSE 文件

## 聯繫
- 專案維護者: [Your Name]
- 電子郵件: your.email@example.com
- 專案連結: https://github.com/yourusername/real-estate-platform
