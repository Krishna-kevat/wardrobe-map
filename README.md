# Wardrobe Map Admin Panel

The complete structure of the Wardrobe Map Admin Panel is split into two systems:

1. **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, multer.
2. **Frontend**: Angular 21+, RxJS, Standalone Components.

## First Time Configuration (If needed)

### Backend Requirements:
1. Ensure you have MongoDB running locally (`mongodb://localhost:27017/JDK_wardrobe`).
2. Make sure you have installed node dependencies. Open the **`backend` folder in CMD** and run `npm install`.

### Frontend Requirements:
1. In the **`f:\wardrobe-map` folder**, run `npm install` (use CMD if PowerShell gives script policy errors).

---

## 🚀 How to start the full application

### Step 1: Start the Backend Server
Open **Terminal 1** (`cmd.exe`) in the backend folder:
```bash
cd f:\wardrobe-map\backend
npm run dev
```
*You should see output indicating the server is running on Port 5000 and MongoDB is connected.*

### Step 2: Start the Angular Admin Frontend
Open **Terminal 2** (`cmd.exe`) in the main project folder:
```bash
cd f:\wardrobe-map
npm start
```

### Step 3: Access the Site
1. Open your browser and go to: **[http://localhost:4200](http://localhost:4200)** (which will redirect to `/login`).
2. **Admin Credentials:**
   - **Email:** `jdk123@gmail.com`
   - **Password:** `#jdk123#`

---

## 🐛 Resolved Bugs & Configs

1. **PowerShell Script Error (`TS7006`) during build:**
   - Fixed by explicitly typing incoming parameters as `(err: any)` and `(res: any)` in RxJS observables inside the services and components (`ProductsComponent`, `UsersComponent`, `OrdersComponent`, `DashboardComponent`, `AuthService`).
2. **Angular Injection Token Error:**
   - The injection token error (`AdminService`) was caused by components incorrectly resolving the generic DI container route. Fixed by making relative imports accurately point to `../../core/services/admin.service`.
   - Ensure the app is correctly initialized by loading `provideHttpClient()` directly in the `app.config.ts`.
3. **Implicit `any` restrictions:**
   - Solved by defining structural assignments to observables instead of relying on default compiler inferences.

You are now fully ready to use the Wardrobe Map Admin App!
