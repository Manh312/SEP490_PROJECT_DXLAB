import { Calendar, ChartColumn, FileText, Home, NotepadText, Package, Settings, UserCheck, Users } from "lucide-react";

import ProfileImage from "../assets/profile-image.jpg";
import ProductImage from "../assets/product-image.jpg";
import { FaHome, FaMoneyBillWave, FaShieldAlt, FaWifi } from "react-icons/fa";

import images1 from '../assets/dxlab_images1.jpg';
import images3 from '../assets/dxlab_images3.png';


export const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "DXLAB Blog", href: "/blog" },
  { label: "Về DXLAB", href: "/about" },
];

export const services = [
  {
    text: 'CHỖ NGỒI CÁ NHÂN CỐ ĐỊNH',
    description: "Dành cho cá nhân",
    click: "Khám phá ngay"
  },
  {
    text: 'CHỖ NGỒI THEO NHÓM CỐ ĐỊNH',
    description: "Dành cho đội nhóm",
    click: "Khám phá ngay"
  }
];

export const slots = [
  { id: 1, name: "Slot 1" },
  { id: 2, name: "Slot 2" },
  { id: 3, name: "Slot 3" },
  { id: 4, name: "Slot 4" }
];


export const areas = [
  {
    "id": 1,
    "type": "personal",  // Thêm type cho khu vực cá nhân
    "name": "Khu vực cá nhân",
    "description": "Không gian yên tĩnh, lý tưởng cho cá nhân làm việc tập trung.",
    "image": images1,
    "features": ["Chỗ ngồi làm việc riêng", "Internet tốc độ cao", "Không gian yên tĩnh"]
  },
  {
    "id": 2,
    "type": "group",  // Thêm type cho khu vực nhóm
    "name": "Khu vực nhóm",
    "description": "Không gian linh hoạt, phù hợp cho nhóm làm việc chung.",
    "image": images3,
    "features": ["Bàn làm việc nhóm", "Khu vực riêng", "Không gian yên tĩnh"]
  }
];


export const features = [
  {
    icon: <FaMoneyBillWave className="text-orange-500 text-3xl" />,
    text: "THANH TOÁN THEO GÓI LINH ĐỘNG",
    description: "Lựa chọn thanh toán theo slot, 1 tháng hoặc kỳ học tùy theo kế hoạch của bạn."
  },
  {
    icon: <FaHome className="text-orange-500 text-3xl" />,
    text: "KHÔNG GIAN THOẢI MÁI, YÊN TĨNH",
    description: "Không gian sạch sẽ, rộng rãi, yên tĩnh giúp bạn có những khoảng thời gian làm việc tập trung và hiệu quả."
  },
  {
    icon: <FaShieldAlt className="text-orange-500 text-3xl" />,
    text: "ĐẢM BẢO AN TOÀN, AN NINH",
    description: "Đội ngũ chúng tôi luôn luôn đặt an toàn của khách hàng lên hàng đầu, đảm bảo không có sự cố xảy ra."
  },
  {
    icon: <FaWifi className="text-orange-500 text-3xl" />,
    text: "HỆ THỐNG MẠNG TỐC ĐỘ CAO",
    description: "Với hệ thống wifi tân tiến nhất hiện nay, ổn định đảm bảo chất lượng làm việc của bạn."
  },
];

export const checklistItems = [
  {
    title: "Code merge made easy",
    description:
      "Track the performance of your VR apps and gain insights into user behavior.",
  },
  {
    title: "Review code without worry",
    description:
      "Track the performance of your VR apps and gain insights into user behavior.",
  },
  {
    title: "AI Assistance to reduce time",
    description:
      "Track the performance of your VR apps and gain insights into user behavior.",
  },
  {
    title: "Share work in minutes",
    description:
      "Track the performance of your VR apps and gain insights into user behavior.",
  },
];

export const pricingOptions = [
  {
    title: "Slot",
    price: "$10",
    features: [
      "Thời gian linh hoạt",
      "Chỗ ngồi linh hoạt",
      "Internet tốc độ cao",
      "Không gian sạch sẽ",
    ],
  },
  {
    title: "Month",
    price: "$50",
    features: [
      "Giá cả hợp lý",
      "Internet tốc độ cao",
      "Không gian sạch sẽ",
      "Cơ sở vật chất hiện đại",
    ],
  },
  {
    title: "Semester",
    price: "$200",
    features: [
      "Tiện lợi",
      "Internet tốc độ cao",
      "Không gian sạch sẽ",
      "Giảm giá khi đăng ký gói",
    ],
  },
];

export const resourcesLinks = [
  { href: "#", text: "Getting Started" },
  { href: "#", text: "Documentation" },
  { href: "#", text: "Tutorials" },
  { href: "#", text: "API Reference" },
  { href: "#", text: "Community Forums" },
];

export const platformLinks = [
  { href: "#", text: "Features" },
  { href: "#", text: "Supported Devices" },
  { href: "#", text: "System Requirements" },
  { href: "#", text: "Downloads" },
  { href: "#", text: "Release Notes" },
];

export const communityLinks = [
  { href: "#", text: "Events" },
  { href: "#", text: "Meetups" },
  { href: "#", text: "Conferences" },
  { href: "#", text: "Hackathons" },
  { href: "#", text: "Jobs" },
];




//DAHSBOARD


export const navbarLinks = [
  {
    title: "Thống kê",
    children: [
      {
        label: "Thống kê",
        icon: Home,
        path: "/dashboard",
      },
      {
        label: "Danh sách khu vực",
        icon: ChartColumn,
        path: "/dashboard/area",
      },
      {
        label: "Danh sách thiết bị",
        icon: NotepadText,
        path: "/dashboard/facilities",
      },
    ]
  },
  {
    title: "Quản lý",
    children: [
      {
        label: "Danh sách tài khoản",
        icon: Users,
        path: "/dashboard/account",
      },
      {
        label: "Danh sách vé phạt",
        icon: UserCheck,
        path: "/dashboard/banned",
      },
      {
        label: "Danh sách blog",
        icon: Package,
        path: "/dashboard/blog",
      },
    ],
  },
];

export const staffLinks = [
  {
    title: "Quản lý Staff",
    children: [
      {
        label: "Lịch sử đặt chỗ",
        icon: Calendar,
        path: "/manage",
      },
      {
        label: "Quản lý blog",
        icon: FileText,
        path: "/manage/blog",
      },
      {
        label: "Cấu hình hệ thống",
        icon: Settings,
        path: "/manage/settings",
      },
    ],
  },
];

export const overviewData = [
  {
    name: "Jan",
    total: 1500,
  },
  {
    name: "Feb",
    total: 2000,
  },
  {
    name: "Mar",
    total: 1000,
  },
  {
    name: "Apr",
    total: 5000,
  },
  {
    name: "May",
    total: 2000,
  },
  {
    name: "Jun",
    total: 5900,
  },
  {
    name: "Jul",
    total: 2000,
  },
  {
    name: "Aug",
    total: 5500,
  },
  {
    name: "Sep",
    total: 2000,
  },
  {
    name: "Oct",
    total: 4000,
  },
  {
    name: "Nov",
    total: 1500,
  },
  {
    name: "Dec",
    total: 2500,
  },
];

export const recentSalesData = [
  {
    id: 1,
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    image: ProfileImage,
    total: 1500,
  },
  {
    id: 2,
    name: "James Smith",
    email: "james.smith@email.com",
    image: ProfileImage,
    total: 2000,
  },
  {
    id: 3,
    name: "Sophia Brown",
    email: "sophia.brown@email.com",
    image: ProfileImage,
    total: 4000,
  },
  {
    id: 4,
    name: "Noah Wilson",
    email: "noah.wilson@email.com",
    image: ProfileImage,
    total: 3000,
  },
  {
    id: 5,
    name: "Emma Jones",
    email: "emma.jones@email.com",
    image: ProfileImage,
    total: 2500,
  },
  {
    id: 6,
    name: "William Taylor",
    email: "william.taylor@email.com",
    image: ProfileImage,
    total: 4500,
  },
  {
    id: 7,
    name: "Isabella Johnson",
    email: "isabella.johnson@email.com",
    image: ProfileImage,
    total: 5300,
  },
];

export const topProducts = [
  {
    number: 1,
    name: "Wireless Headphones",
    image: ProductImage,
    description: "High-quality noise-canceling wireless headphones.",
    price: 99.99,
    status: "In Stock",
    rating: 4.5,
  },
  {
    number: 2,
    name: "Smartphone",
    image: ProductImage,
    description: "Latest 5G smartphone with excellent camera features.",
    price: 799.99,
    status: "In Stock",
    rating: 4.7,
  },
  {
    number: 3,
    name: "Gaming Laptop",
    image: ProductImage,
    description: "Powerful gaming laptop with high-end graphics.",
    price: 1299.99,
    status: "In Stock",
    rating: 4.8,
  },
  {
    number: 4,
    name: "Smartwatch",
    image: ProductImage,
    description: "Stylish smartwatch with fitness tracking features.",
    price: 199.99,
    status: "Out of Stock",
    rating: 4.4,
  },
  {
    number: 5,
    name: "Bluetooth Speaker",
    image: ProductImage,
    description: "Portable Bluetooth speaker with deep bass sound.",
    price: 59.99,
    status: "In Stock",
    rating: 4.3,
  },
  {
    number: 6,
    name: "4K Monitor",
    image: ProductImage,
    description: "Ultra HD 4K monitor with stunning color accuracy.",
    price: 399.99,
    status: "In Stock",
    rating: 4.6,
  },
  {
    number: 7,
    name: "Mechanical Keyboard",
    image: ProductImage,
    description: "Mechanical keyboard with customizable RGB lighting.",
    price: 89.99,
    status: "In Stock",
    rating: 4.7,
  },
  {
    number: 8,
    name: "Wireless Mouse",
    image: ProductImage,
    description: "Ergonomic wireless mouse with precision tracking.",
    price: 49.99,
    status: "In Stock",
    rating: 4.5,
  },
  {
    number: 9,
    name: "Action Camera",
    image: ProductImage,
    description: "Waterproof action camera with 4K video recording.",
    price: 249.99,
    status: "In Stock",
    rating: 4.8,
  },
  {
    number: 10,
    name: "External Hard Drive",
    image: ProductImage,
    description: "Portable 2TB external hard drive for data storage.",
    price: 79.99,
    status: "Out of Stock",
    rating: 4.5,
  },
];
export const users = [
  { id: 1, fullName: "Nguyễn Văn A", email: "a@gmail.com", status: "Active" },
  { id: 2, fullName: "Trần Thị B", email: "b@gmail.com", status: "Inactive" },
];
export const products = [
  { id: 1, name: "Sản phẩm A", quantity: 10, status: "Còn hàng" },
  { id: 2, name: "Sản phẩm B", quantity: 5, status: "Hết hàng" },
  { id: 3, name: "Sản phẩm A", quantity: 10, status: "Còn hàng" },
  { id: 4, name: "Sản phẩm B", quantity: 5, status: "Hết hàng" },
  { id: 5, name: "Sản phẩm A", quantity: 10, status: "Còn hàng" },
  { id: 6, name: "Sản phẩm B", quantity: 5, status: "Hết hàng" },
  
];

export const bookingData = [
  {
    id: 1,
    userId: "user_001",
    slotId: 1, // Liên kết với slots
    bookingId: "booking_123",
    bookingCreatedDate: "2024-02-20",
    price: 50,
    status: "Confirmed",
  },
  {
    id: 2,
    userId: "user_002",
    slotId: 2,
    bookingId: "booking_456",
    bookingCreatedDate: "2024-02-22",
    price: 75,
    status: "Pending",
  },
  {
    id: 3,
    userId: "user_003",
    slotId: 3,
    bookingId: "booking_789",
    bookingCreatedDate: "2024-02-24",
    price: 30,
    status: "Canceled",
  },
];

// Cập nhật bookingData để gán `slotName` dựa vào `slotId`
bookingData.forEach((booking) => {
  const slot = slots.find((s) => s.id === booking.slotId);
  booking.slotName = slot ? slot.name : "Unknown Slot";
});


export const bookingDetailData = [
  {
    bookingDetailId: "bd_001",
    bookingId: "booking_123",
    userId: "user_001",
    fullName: "Nguyễn Văn A",
    avatar: ProfileImage,
    phoneNumber: "0987-654-321",
    slotId: 1, // Liên kết với slots
    positionId: "pos_201",
    positionName: "VIP Seat",
    areaId: 1, // Liên kết với areas
    roomId: "room_401",
    roomName: "Library Room 2",
    checkinTime: "2024-02-20 09:00",
    checkoutTime: "2024-02-20 12:00",
    status: "Confirmed",
    price: 50,
  },
  {
    bookingDetailId: "bd_002",
    bookingId: "booking_456",
    userId: "user_002",
    fullName: "Trần Thị B",
    avatar: ProfileImage,
    phoneNumber: "0912-345-678",
    slotId: 2,
    positionId: "pos_202",
    positionName: "Regular Seat",
    areaId: 2,
    roomId: "room_402",
    roomName: "Library Room 3",
    checkinTime: "2024-02-22 14:00",
    checkoutTime: "2024-02-22 17:00",
    status: "Pending",
    price: 75,
  },
  {
    bookingDetailId: "bd_003",
    bookingId: "booking_789",
    userId: "user_003",
    fullName: "Lê Văn C",
    avatar: ProfileImage,
    phoneNumber: "0903-123-456",
    slotId: 3,
    positionId: "pos_203",
    positionName: "Window Seat",
    areaId: 1,
    roomId: "room_403",
    roomName: "Library Room 1",
    checkinTime: "2024-02-24 10:30",
    checkoutTime: "2024-02-24 13:30",
    status: "Canceled",
    price: 30,
  },
];

// Cập nhật bookingDetailData để gán `slotName` và `areaName` dựa vào `slotId` và `areaId`
bookingDetailData.forEach((detail) => {
  const slot = slots.find((s) => s.id === detail.slotId);
  detail.slotName = slot ? slot.name : "Unknown Slot";

  const area = areas.find((a) => a.id === detail.areaId);
  detail.areaName = area ? area.name : "Unknown Area";
});


export const blogData = [
  {
    id: "blog_001",
    title: "Cách làm việc hiệu quả trong không gian yên tĩnh",
    content: "Không gian yên tĩnh giúp tăng hiệu suất làm việc lên đến 40%.",
    image: ProfileImage,
    author: "Nguyễn Văn A",
    createdDate: "2024-02-10",
    status: "Published",
  },
  {
    id: "blog_002",
    title: "Lợi ích của việc đọc sách mỗi ngày",
    content: "Đọc sách giúp cải thiện tư duy, nâng cao vốn từ vựng và giảm stress.",
    image: ProfileImage,
    author: "Trần Thị B",
    createdDate: "2024-02-12",
    status: "Draft",
  },
  {
    id: "blog_003",
    title: "Tại sao nên đặt chỗ trước khi đến thư viện?",
    content: "Đặt chỗ trước giúp bạn có không gian học tập và tránh tình trạng hết chỗ.",
    image: ProfileImage,
    author: "Lê Văn C",
    createdDate: "2024-02-15",
    status: "Published",
  },
];
