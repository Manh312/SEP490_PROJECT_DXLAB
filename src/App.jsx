import { ThemeProvider } from "./contexts/theme-context";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles.css";
import Layout from "./routes/layout";
import DashboardPage from "./routes/dashboard/page";
import HeroSection from './layouts/home/HeroSection';
import FeatureSection from './layouts/home/FeatureSection';
import Blog from './layouts/blog/Blog';
import Pricing from './layouts/home/Pricing';
import About from './layouts/home/About';
import Services from './layouts/home/Services';
import BlogDetail from './layouts/blog/BlogDetail';
import FacilitiesList from './routes/facilities/FacilitiesList';
import AccountList from './routes/account/AccountList';
import BlogListOfStaff from './routes/blog-manage/BlogListOfStaff';
import CreateFacilities from './routes/facilities/CreateFacilities';
import FacilitiesDetail from './routes/facilities/FacilitiesDetail';
import DeleteFacilities from './routes/facilities/DeleteFacilities';
import CreateAccount from './routes/account/CreateAccount';
import UpdateAccount from "./routes/account/UpdateAccount";
import DeleteAccount from './routes/account/DeleteAccount';
import NotFound from './layouts/home/NotFound';
import ViewAreas from './routes/students/ViewAreas';
import Payment from './routes/students/Payment';
import ViewBookedSeats from './routes/students/ViewBookedSeats';
import RoomList from './routes/room/RoomList';
import SlotList from './routes/slot/SlotList';
import Banner from './layouts/home/Banner';
import ViewBookingHistory from './routes/students/ViewBookHistoried';
import BookHistoriedDetail from './routes/students/BookHistoriedDetail';
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

import ReportList from "./routes/staff-manage/Report-management/ReportList";
import ReportDetail from "./routes/staff-manage/Report-management/ReportDetail";

import CreateSlot from "./routes/slot/CreateSlot";
import CreateBlog from "./routes/staff-manage/blog-management/CreateBlog";
import StorageListAccount from "./routes/account/StorageListAccount";
import AccountDetail from "./routes/account/AccountDetail";
import NotAuthorization from "./layouts/home/NotAuthorization";
import ManageBlogDetail from "./routes/staff-manage/blog-management/ManageBlogDetail";
import AreaTypeList from "./routes/areaType/AreaTypeList";
import AreaTypeDetail from "./routes/areaType/AreaTypeDetail";
import CreateAreaType from "./routes/areaType/CreateAreaType";
import UpdateAreaType from "./routes/areaType/UpdateAreaType";
import BlogListOfStaffDetail from "./routes/blog-manage/BlogListOfStaffDetail";
import AreaList from "./routes/areas/AreaList";
import CreateAreaCategory from "./routes/areas/CreateAreaCategory";
import UpdateAreaCategory from "./routes/areas/UpdateAreaCategory";
import AreaDetailAdmin from "./routes/areas/AreaDetailAdmin";
import CreateReport from "./routes/staff-manage/report-management/CreateReport";
import ManageReportList from "./routes/report/ManageReportList";
import ManageReportDetail from "./routes/report/ManageReportDetail";
import ManageFacilitiesInArea from "./routes/room/ManageFacilitiesInArea";
import UpdateSlot from "./routes/slot/UpdateSLot";




export function HomeContent() {
  return (
    <>
      <Banner />
      <div className="max-w-7xl mx-auto">
      <HeroSection />
      <Services /> 
      <FeatureSection />
      <Pricing />
      </div>
      
    </>
  );
}


const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomeContent /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:id", element: <BlogDetail /> },
      { path: "about", element: <About /> },
      { path: "not-found", element: <NotFound /> },
      { path: "not-authenticate", element: <NotAuthenticate /> },
      { path: "not-authorization", element: <NotAuthorization /> },


      { path: "rooms", element: <ProtectedRoute allowedRoles={["Student"]}><ViewRoom /></ProtectedRoute> },
      { path: "room/:id", element: <ProtectedRoute allowedRoles={["Student"]}><ViewAreas /></ProtectedRoute> },
      { path: "area/:id", element: <ProtectedRoute allowedRoles={["Student"]}><AreaDetail /></ProtectedRoute> },
      { path: "confirm-payment", element: <ProtectedRoute allowedRoles={["Student"]}><Payment /></ProtectedRoute> },
      { path: "booked-seats/:id", element: <ProtectedRoute allowedRoles={["Student"]}><ViewBookedSeats /></ProtectedRoute> },
      { path: "booked-history", element: <ProtectedRoute allowedRoles={["Student"]}><ViewBookingHistory /></ProtectedRoute> },
      { path: "booked-history/:id", element: <ProtectedRoute allowedRoles={["Student"]}><BookHistoriedDetail /></ProtectedRoute> },

      {
        path: "dashboard",
        element: <ProtectedRoute allowedRoles={["Admin"]}><DashboardPage /></ProtectedRoute>,
      },
      {
        path: "dashboard/area",
        element: <ProtectedRoute allowedRoles={["Admin"]}><AreaList /></ProtectedRoute>,
      },
      {
        path: "dashboard/area/:id",
        element: <ProtectedRoute allowedRoles={["Admin"]}><AreaDetailAdmin /></ProtectedRoute>,
      },
      {
        path: "dashboard/area/create",
        element: <ProtectedRoute allowedRoles={["Admin"]}><CreateAreaCategory /></ProtectedRoute>,
      },
      {
        path: "dashboard/area/update/:id",
        element: <ProtectedRoute allowedRoles={["Admin"]}><UpdateAreaCategory /></ProtectedRoute>,
      },
      {
        path: "dashboard/areaType",
        element: <ProtectedRoute allowedRoles={["Admin"]}><AreaTypeList /></ProtectedRoute>,
      },
      {
        path: "dashboard/areaType/:id",
        element: <ProtectedRoute allowedRoles={["Admin"]}><AreaTypeDetail /></ProtectedRoute>,
      },
      {
        path: "dashboard/areaType/create",
        element: <ProtectedRoute allowedRoles={["Admin"]}><CreateAreaType /></ProtectedRoute>,
      },
      {
        path: "dashboard/areaType/update/:id",
        element: <ProtectedRoute allowedRoles={["Admin"]}><UpdateAreaType /></ProtectedRoute>,
      },
      {
        path: "dashboard/blog",
        element: <ProtectedRoute allowedRoles={["Admin"]}><BlogListOfStaff /></ProtectedRoute>,
      },

      {
        path: "dashboard/blog/:id",
        element: <ProtectedRoute allowedRoles={["Admin"]}><BlogListOfStaffDetail /></ProtectedRoute>,
      },
      
      {
        path: "dashboard/facilities",
        element: <ProtectedRoute allowedRoles={["Admin"]}><FacilitiesList /></ProtectedRoute>,
      },
      {
        path: "dashboard/facilities/:id",
        element: <ProtectedRoute allowedRoles={["Admin"]}><FacilitiesDetail /></ProtectedRoute>,
      },
      {
        path: "dashboard/facilities/create",
        element: <ProtectedRoute allowedRoles={["Admin"]}><CreateFacilities /></ProtectedRoute>,
      },
      {
        path: "dashboard/facilities/delete/:id",

        element: <ProtectedRoute allowedRoles={["Admin"]}><DeleteFacilities /></ProtectedRoute>,
      },
      {
        path: "dashboard/room",
        element: <ProtectedRoute allowedRoles={["Admin"]}><RoomList /></ProtectedRoute>,
      },
      {
        path: "dashboard/room/:id",
        element: <ProtectedRoute allowedRoles={["Admin"]}><RoomDetail /></ProtectedRoute>,
      },
      {
        path: "/dashboard/room/update/:id",
        element: <ProtectedRoute allowedRoles={["Admin"]}><UpdateRoom /></ProtectedRoute>,
      },
      {
        path: "dashboard/room/create",
        element: <ProtectedRoute allowedRoles={["Admin"]}><CreateRoom /></ProtectedRoute>,
      },
      {
        path: "dashboard/room/update/:id/addFacilities/:areaId",
        element: <ProtectedRoute allowedRoles={["Admin"]}><ManageFacilitiesInArea /></ProtectedRoute>,
      },


      {
        path: "dashboard/slot",
        element: <ProtectedRoute allowedRoles={["Admin"]}><SlotList /></ProtectedRoute>,
      },
      {
        path: "dashboard/slot/create",
        element: <ProtectedRoute allowedRoles={["Admin"]}>< CreateSlot /></ProtectedRoute>,
      },
      {
        path: "dashboard/slot/update/:id",
        element: <ProtectedRoute allowedRoles={["Admin"]}>< UpdateSlot /></ProtectedRoute>,
      },
      {
        path: "dashboard/account",
        element: <ProtectedRoute allowedRoles={["Admin"]}><AccountList /></ProtectedRoute>,
      },
      {
        path: "dashboard/account/:id",
        element: <ProtectedRoute allowedRoles={["Admin"]}><AccountDetail /></ProtectedRoute>,
      },
      {
        path: "dashboard/account/create",
        element: <ProtectedRoute allowedRoles={["Admin"]}><CreateAccount /></ProtectedRoute>,
      },
      {
        path: "dashboard/account/update/:id",
        element: <ProtectedRoute allowedRoles={["Admin"]}><UpdateAccount /></ProtectedRoute>,
      },
      {
        path: "dashboard/account/delete/:id",
        element: <ProtectedRoute allowedRoles={["Admin"]}><DeleteAccount /></ProtectedRoute>,
      },
      {
        path: "dashboard/account/storage",
        element: <ProtectedRoute allowedRoles={["Admin"]}><StorageListAccount /></ProtectedRoute>,
      },
      {
        path: "dashboard/report",
        element: <ProtectedRoute allowedRoles={["Admin"]}><ManageReportList /></ProtectedRoute>,
      },
      {
        path: "dashboard/report/:id",
        element: <ProtectedRoute allowedRoles={["Admin"]}><ManageReportDetail /></ProtectedRoute>,
      },
      {
        path: "manage",
        element: <ProtectedRoute allowedRoles={["Staff"]}><BookingList /></ProtectedRoute>,
      },
      {
        path: "manage/booking-history/:id",
        element: <ProtectedRoute allowedRoles={["Staff"]}><BookingDetail /></ProtectedRoute>,
      },
      {
        path: "manage/reports",
        element: <ProtectedRoute allowedRoles={["Staff"]}><ReportList /></ProtectedRoute>,
      },
      {
        path: "manage/reports/:id",
        element: <ProtectedRoute allowedRoles={["Staff"]}><ReportDetail /></ProtectedRoute>,
      },
      {
        path: "manage/reports/:id/create",
        element: <ProtectedRoute allowedRoles={["Staff"]}><CreateReport /></ProtectedRoute>,
      },
      {
        path: "manage/blog",
        element: <ProtectedRoute allowedRoles={["Staff"]}><BlogList /></ProtectedRoute>,
      },
      {
        path: "manage/blog/:id",
        element: <ProtectedRoute allowedRoles={["Staff"]}><ManageBlogDetail /></ProtectedRoute>,
      },
      {
        path: "manage/blog/create",
        element: <ProtectedRoute allowedRoles={["Staff"]}><CreateBlog /></ProtectedRoute>,
      },
      {
        path: "manage/blog/update/:id",
        element: <ProtectedRoute allowedRoles={["Staff"]}><ModifieBlog /></ProtectedRoute>,
      },


      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider storageKey="theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
