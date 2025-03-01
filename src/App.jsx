import { ThemeProvider } from "./contexts/theme-context";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles.css";
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
import BlogListOfStaff from './routes/blog-manage/BlogListOfStaff';
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
import RoomList from './routes/room/RoomList';
import SlotList from './routes/slot/SlotList';
import Banner from './layouts/home/Banner';
import ViewBookingHistory from './routes/students/ViewBookHistoried';
import BookHistoriedDetail from './routes/students/BookHistoriedDetail';
import Wallet from './routes/students/Wallet';
import BookingList from "./routes/staff-manage/booking_history/BookingList";
import BookingDetail from "./routes/staff-manage/booking_history/BookingDetail";
import BlogList from "./routes/staff-manage/blog-management/BlogList";
import ModifieBlog from "./routes/staff-manage/blog-management/ModifieBlog";
import ViewRoom from "./routes/students/ViewRoom";
import ProtectedRoute from "./routes/auth/ProtectedRouter";
import NotAuthenticate from "./layouts/home/NotAuthenticate";
import RoomDetail from "./routes/room/RoomDetail";
import UpdateRoom from "./routes/room/UpdateRoom";
import CreateRoom from "./routes/room/CreateRoom";
import AreaDetail from "./routes/students/AreaDetail";


export function HomeContent() {
  return (
    <>
      <Banner />
      <HeroSection />
      <Services />
      <FeatureSection />
      <Pricing />
    </>
  );
}


const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomeContent /> },
      { path: "login", element: <Login /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:id", element: <BlogDetail /> },
      { path: "about", element: <About /> },
      { path: "not-found", element: <NotFound /> },
      { path: "not-authenticate", element: <NotAuthenticate /> },

      { path: "profile", element: <ProtectedRoute><ViewProfile /></ProtectedRoute> },
      { path: "change-profile", element: <ProtectedRoute><ChangeProfile /></ProtectedRoute> },

      { path: "rooms", element: <ProtectedRoute><ViewRoom /></ProtectedRoute> },
      { path: "room/:id", element: <ProtectedRoute><ViewAreas /></ProtectedRoute> },
      { path: "area/:typeName", element: <ProtectedRoute><AreaDetail /></ProtectedRoute> },
      { path: "confirm-payment", element: <ProtectedRoute><Payment /></ProtectedRoute> },
      { path: "booked-seats", element: <ProtectedRoute><ViewBookedSeats /></ProtectedRoute> },
      { path: "booked-history", element: <ProtectedRoute><ViewBookingHistory /></ProtectedRoute> },
      { path: "booked-history/:id", element: <ProtectedRoute><BookHistoriedDetail /></ProtectedRoute> },
      { path: "wallet", element: <ProtectedRoute><Wallet /></ProtectedRoute> },

      {
        path: "dashboard",
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
      },
      {
        path: "dashboard/area",
        element: <ProtectedRoute><AreaList /></ProtectedRoute>,
      },
      {
        path: "dashboard/blog",
        element: <ProtectedRoute><BlogListOfStaff /></ProtectedRoute>,
      },
      {
        path: "dashboard/facilities",
        element: <ProtectedRoute><FacilitiesList /></ProtectedRoute>,
      },
      {
        path: "dashboard/facilities/:id",
        element: <ProtectedRoute><FacilitiesDetail /></ProtectedRoute>,
      },
      {
        path: "dashboard/facilities/create",
        element: <ProtectedRoute><CreateFacilities /></ProtectedRoute>,
      },
      {
        path: "dashboard/facilities/update/:id",
        element: <ProtectedRoute><UpdateFacilities /></ProtectedRoute>,
      },
      {
        path: "dashboard/facilities/delete/:id",

        element: <ProtectedRoute><DeleteFacilities /></ProtectedRoute>,
      },
      {
        path: "dashboard/room",
        element: <ProtectedRoute><RoomList /></ProtectedRoute>,
      },
      {
        path: "dashboard/room/:id",
        element: <ProtectedRoute><RoomDetail /></ProtectedRoute>,
      },
      {
        path: "/dashboard/room/update/:id" ,
        element: <ProtectedRoute><UpdateRoom /></ProtectedRoute>,
      },
      {
        path: "dashboard/room/create",
        element: <ProtectedRoute><CreateRoom /></ProtectedRoute>,
      },

      
      {
        path: "dashboard/slot",
        element: <ProtectedRoute><SlotList /></ProtectedRoute>,
      },
      {
        path: "dashboard/account",
        element: <ProtectedRoute><AccountList /></ProtectedRoute>,
      },
      {
        path: "dashboard/account/detail",
        element: <ProtectedRoute><AccountDetail /></ProtectedRoute>,
      },
      {
        path: "dashboard/account/create",
        element: <ProtectedRoute><CreateAccount /></ProtectedRoute>,
      },
      {
        path: "dashboard/account/update/:id",
        element: <ProtectedRoute><UpdateAccount /></ProtectedRoute>,
      },
      {
        path: "dashboard/account/delete/:id",
        element: <ProtectedRoute><DeleteAccount /></ProtectedRoute>,
      },
      {
        path: "dashboard/banned",
        element: <ProtectedRoute><BannedList /></ProtectedRoute>,
      },

      {
        path: "manage",
        element: <ProtectedRoute><BookingList /></ProtectedRoute>,
      },
      {
        path: "manage/booking-history/:id",
        element: <ProtectedRoute><BookingDetail /></ProtectedRoute>,
      },
      {
        path: "manage/blog",
        element: <ProtectedRoute><BlogList /></ProtectedRoute>,
      },
      {
        path: "manage/blog/:id",
        element: <ProtectedRoute><ModifieBlog /></ProtectedRoute>,
      },


      { path: "*", element: <NotFound /> },
    ],
  },
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
