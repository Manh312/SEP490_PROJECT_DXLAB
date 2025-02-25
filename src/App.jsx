import { ThemeProvider } from './contexts/theme-context';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './styles.css';
import Layout from "./routes/layout";
import DashboardPage from "./routes/dashboard/page";
import HeroSection from './layouts/home/HeroSection';
import FeatureSection from './layouts/home/FeatureSection';
import Blog from './layouts/blog/Blog';
import Pricing from './layouts/home/Pricing';
import Login from './routes/auth/Login';
import About from './layouts/home/About';
import Services from './layouts/home/Services';
import BlogDetail from './layouts/blog/BlogDetail';
import ViewProfile from './layouts/profile/ViewProfile';
import ChangeProfile from './layouts/profile/ChangeProfile';
import AreaList from './routes/areas/AreaList';
import FacilitiesList from './routes/facilities/FacilitiesList';
import AccountList from './routes/account/AccountList';
import BannedList from './routes/dashboard/BannedList';
import CreateFacilities from './routes/facilities/CreateFacilities';
import FacilitiesDetail from './routes/facilities/FacilitiesDetail';
import UpdateFacilities from './routes/facilities/UpdateFacilities';
import DeleteFacilities from './routes/facilities/DeleteFacilities';
import AccountDetail from './routes/account/AccountDetail';
import CreateAccount from './routes/account/CreateAccount';
import UpdateAccount from './routes/account/UpdateAccount';
import DeleteAccount from './routes/account/DeleteAccount';
import NotFound from './layouts/home/NotFound';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ViewAreas from './routes/students/ViewAreas';
import Payment from './routes/students/Payment';
import ViewBookedSeats from './routes/students/ViewBookedSeats';
import BookingList from './routes/staff-manage/booking_history/BookingList';
import BookingDetail from './routes/staff-manage/booking_history/BookingDetail';
import BlogList from './routes/staff-manage/blog-management/BlogList';
import ModifieBlog from './routes/staff-manage/blog-management/ModifieBlog';
import CreateBolg from './routes/staff-manage/blog-management/CreateBolg';


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
      { path: "not-found", element: <NotFound/> },
      { path: "profile", element: <ViewProfile/> },
      { path: "change-profile", element: <ChangeProfile/> },

      { path: "areas", element: <ViewAreas/> },
      { path: "payment", element: <Payment/> },


      { path: "dashboard", element: <DashboardPage /> }, // Trang dashboard chính
      { path: "dashboard/area", element: <AreaList/> },
      { path: "booked-seats", element: <ViewBookedSeats/> },


      //Facilities Manage
      { path: "dashboard/facilities", element: <FacilitiesList/> },
      { path: "dashboard/facilities/:id", element: <FacilitiesDetail/> }, // Fix đường dẫn
      { path: "dashboard/facilities/create", element: <CreateFacilities/> },
      { path: "dashboard/facilities/update/:id", element: <UpdateFacilities/> }, // Fix đường dẫn
      { path: "dashboard/facilities/delete/:id", element: <DeleteFacilities/> }, // Fix đường dẫn


      //Account Manage
      { path: "dashboard/account", element: <AccountList/> },
      { path: "dashboard/account/detail", element: <AccountDetail/> },
      { path: "dashboard/account", element: <CreateAccount/> },
      { path: "dashboard/account", element: <UpdateAccount/> },
      { path: "dashboard/account", element: <DeleteAccount/> },


      { path: "dashboard/banned", element: <BannedList/> },

      //Staff Manage
      { path: "manage", element: <BookingList/>},
      { path: "manage/booking-history/:id", element: <BookingDetail/>},
      { path: "manage/blog", element: <BlogList/>},
      { path: "manage/blog/create", element: <CreateBolg/>},
      { path: "manage/blog/:id", element: <ModifieBlog/>},

    ],
  }
]);

function App() {
  return (
    <ThemeProvider storageKey="theme">
      <ToastContainer />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
