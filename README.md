# Raahi Clothing - E-commerce Frontend 🛍️

A modern, high-performance e-commerce frontend built with **React.js** and **Tailwind CSS**. This application provides a seamless shopping experience for users and a powerful dashboard for administrators to manage products, orders, and inventory.

## 🚀 Features

### 👤 User Experience (Customer)
* **Authentication:** Secure Login/Signup with JWT integration and automatic token refresh mechanisms.
* **Product Browsing:** Infinite scroll pagination, category-based filtering (Men, Women, Kids), and "Sold Out" badges for out-of-stock items.
* **Smart Cart & Wishlist:** Implemented **Optimistic UI Updates** for instant feedback when adding/removing items from the cart or wishlist.
* **Checkout Flow:** Multi-step checkout process including Address Management (Add/Select addresses), Order Summary, and Stock Validation.
* **Variant Selection:** Dynamic selection for sizes and colors with real-time stock availability checks.
* **Responsive Design:** Fully mobile-responsive UI with sticky checkout buttons and mobile-optimized navigation.

### 🛠️ Admin Dashboard
* **Analytics:** Visual sales data using **Recharts** (Revenue, Orders, User stats) with time filters (Day/Week/Month).
* **Product Management:** Full CRUD operations for products, including multi-image uploads and variant management (Size/Color/Stock).
* **Order Management:** Track order status (Pending -> Delivered), view customer details, and **generate printable packing slips** directly from the browser.
* **Inventory Control:** Quick-update modals to manage stock levels for specific variants.

## 💻 Tech Stack

* **Core:** React.js (Vite), JavaScript (ES6+)
* **Styling:** Tailwind CSS, PostCSS
* **State Management:** React Context API (AuthContext, ShopContext)
* **Routing:** React Router DOM v6
* **HTTP Client:** Axios (with Interceptors for error handling)
* **Icons & Charts:** Lucide-React, Recharts
* **Tools:** ESLint, Git

## 📸 Screenshots

### Home Page
![Home Page](https://res.cloudinary.com/drrj8rl9n/image/upload/v1768710411/Screenshot_2026-01-18_095441_b15xfe.png)
### Products Page
![Produts Page](https://res.cloudinary.com/drrj8rl9n/image/upload/v1768710822/Screenshot_2026-01-18_095834_zcwa7j.png)
### User Page
![User Page](https://res.cloudinary.com/drrj8rl9n/image/upload/v1768710821/Screenshot_2026-01-18_095858_kr2o2i.png)
### Like Page
![Like Page](https://res.cloudinary.com/drrj8rl9n/image/upload/v1768710820/Screenshot_2026-01-18_095921_xajw2v.png)
### Cart Page
![Cart Page](https://res.cloudinary.com/drrj8rl9n/image/upload/v1768710821/Screenshot_2026-01-18_095939_kxkhg6.png)
### Place Order Page
![Place Order Page](https://res.cloudinary.com/drrj8rl9n/image/upload/v1768710821/Screenshot_2026-01-18_100026_cwxpzn.png)
### Order Page
![Order Page](https://res.cloudinary.com/drrj8rl9n/image/upload/v1768710833/Screenshot_2026-01-18_100055_efybtc.png)
### Delivery Status Page
![Delivery Status Page](https://res.cloudinary.com/drrj8rl9n/image/upload/v1768710822/Screenshot_2026-01-18_100110_et3zj0.png)
### Dashboard Page
![Dashboard Page](https://res.cloudinary.com/drrj8rl9n/image/upload/v1768710823/Screenshot_2026-01-18_100210_neeql8.png)
### Products managment Page
![Products managment Page](https://res.cloudinary.com/drrj8rl9n/image/upload/v1768710823/Screenshot_2026-01-18_100229_wl6cml.png)
### Order managment Page
![Order managment Page](https://res.cloudinary.com/drrj8rl9n/image/upload/v1768710823/Screenshot_2026-01-18_100240_e0swit.png)
### Pincode managment Page
![Pincode managment Page](https://res.cloudinary.com/drrj8rl9n/image/upload/v1768710823/Screenshot_2026-01-18_100256_bgf9sg.png)



## 🛠️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/raahi-frontend.git](https://github.com/yourusername/raahi-frontend.git)
    cd raahi-frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory and add your backend URL:
    ```env
    VITE_API_URL=http://localhost:5000
    ```

4.  **Run the Project**

    ```bash
    npm run dev
    ```

## 🤝 Contribution

Contributions are welcome! Feel free to submit a pull request.

## 📂 Project Structure

```text
src/
├── api/                # API configuration and service files (axios, baseUrl)
├── assets/             # Static assets (images, svg)
├── components/         # Reusable UI components
│   ├── auth/           # Login & Registration forms
│   ├── loader/         # Loading spinners/skeletons
│   ├── msg/            # Success/Error message components
│   └── Navbar.jsx, Footer.jsx, etc.
├── context/            # Global State (AuthContext, ShopContext)
├── page/               # Application Pages
│   ├── accountPages/   # User Dashboard, Orders, Settings
│   ├── Home.jsx, CartPage.jsx, ProductPage.jsx, etc.
├── App.jsx             # Main routing configuration
└── main.jsx            # Entry point