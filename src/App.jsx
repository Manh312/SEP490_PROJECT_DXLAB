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

      { path: "rooms", element: <ViewRoom /> },
      { path: "areas", element: <ViewAreas /> },
      { path: "confirm-payment", element: <ProtectedRoute><Payment /></ProtectedRoute> },
      { path: "booked-seats", element: <ProtectedRoute><ViewBookedSeats /></ProtectedRoute> },
      { path: "booked-history", element: <ProtectedRoute><ViewBookingHistory /></ProtectedRoute> },
      { path: "booked-history/:id", element: <ProtectedRoute><BookHistoriedDetail /></ProtectedRoute> },
      { path: "wallet", element: <ProtectedRoute><Wallet /></ProtectedRoute> },

      {
        path: "dashboard", element: <ProtectedRoute><DashboardPage /></ProtectedRoute>, children: [
          { path: "area", element: <AreaList /> },
          { path: "blog", element: <BlogListOfStaff /> },
          { path: "facilities", element: <FacilitiesList /> },
          { path: "facilities/:id", element: <FacilitiesDetail /> },
          { path: "facilities/create", element: <CreateFacilities /> },
          { path: "facilities/update/:id", element: <UpdateFacilities /> },
          { path: "facilities/delete/:id", element: <DeleteFacilities /> },
          { path: "room", element: <RoomList /> },
          { path: "slot", element: <SlotList /> },
          { path: "account", element: <AccountList /> },
          { path: "account/detail", element: <AccountDetail /> },
          { path: "account/create", element: <CreateAccount /> },
          { path: "account/update/:id", element: <UpdateAccount /> },
          { path: "account/delete/:id", element: <DeleteAccount /> },
          { path: "banned", element: <BannedList /> },
        ]
      },

      {
        path: "manage", element: <ProtectedRoute element={<BookingList />} />, children: [
          { path: "booking-history/:id", element: <BookingDetail /> },
          { path: "blog-list", element: <BlogList /> },
          { path: "update-blog/:id", element: <ModifieBlog /> },
        ]
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
