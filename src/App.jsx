import { ThemeProvider } from './contexts/theme-context';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './styles.css';
import Layout from "./routes/layout";
import DashboardPage from "./routes/dashboard/page";
import HeroSection from './layouts/home/HeroSection';
import FeatureSection from './layouts/home/FeatureSection';
import Blog from './layouts/blog/Blog';
import Pricing from './layouts/home/Pricing';
import Product from './routes/dashboard/Product';
import Login from './routes/auth/Login';
import About from './layouts/home/About';
import Services from './layouts/home/Services';
import BlogDetail from './layouts/blog/BlogDetail';
import ViewProfile from './layouts/profile/ViewProfile';
import ChangeProfile from './layouts/profile/ChangeProfile';

export function HomeContent() {
  return (
    <>
      <HeroSection />
      <Services/>
      <FeatureSection />
      <Pricing />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // Layout chứa tất cả các trang
    children: [
      { index: true, element: <HomeContent /> }, // Trang chủ "/"
      { path: "login", element: <Login/> },
      { path: "blog", element: <Blog/> },
      { path: "blog/:id", element: <BlogDetail/> },
      { path: "about", element: <About/> },
      { path: "profile/", element: <ViewProfile/> },
      { path: "change-profile", element: <ChangeProfile/> },
      { path: "dashboard", element: <DashboardPage /> }, // Trang dashboard chính
      { path: "dashboard/products", element: <Product/> },
      { path: "dashboard/reports", element: <h1 className="title">Reports</h1> },
      { path: "dashboard/customers", element: <h1 className="title">Customers</h1> },
      { path: "dashboard/new-customer", element: <h1 className="title">New Customer</h1> },
      { path: "dashboard/verified-customers", element: <h1 className="title">Verified Customers</h1> },
      { path: "dashboard/products", element: <h1 className="title">Products</h1> },
      { path: "dashboard/inventory", element: <h1 className="title">Inventory</h1> },
      { path: "dashboard/settings", element: <h1 className="title">Settings</h1> },
    ],
  }
]);

function App() {
  return (
    <ThemeProvider storageKey="theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
