import { ThemeProvider } from './contexts/theme-context';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './styles.css';
import Layout from "./routes/layout";
import DashboardPage from "./routes/dashboard/page";
import HeroSection from './components/HeroSection';
import FeatureSection from './components/FeatureSection';
import Blog from './components/Blog';
import Pricing from './components/Pricing';
import Product from './routes/dashboard/Product';

export function HomeContent() {
  return (
    <>
      <HeroSection />
      <FeatureSection />
      <Blog />
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
      { path: "dashboard", element: <DashboardPage /> }, // Trang dashboard chính
      { path: "dashboard/products", element: <Product/> },
      { path: "dashboard/reports", element: <h1 className="title">Reports</h1> },
      { path: "dashboard/customers", element: <h1 className="title">Customers</h1> },
      { path: "dashboard/new-customer", element: <h1 className="title">New Customer</h1> },
      { path: "dashboard/verified-customers", element: <h1 className="title">Verified Customers</h1> },
      { path: "dashboard/products", element: <h1 className="title">Products</h1> },
      { path: "dashboard/inventory", element: <h1 className="title">Inventory</h1> },
      { path: "dashboard/settings", element: <h1 className="title">Settings</h1> }
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
