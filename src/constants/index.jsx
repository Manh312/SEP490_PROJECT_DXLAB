import { ChartColumn, Home, NotepadText, Package, UserCheck, Users , Grid} from "lucide-react";

import ProfileImage from "../assets/profile-image.jpg";
import ProductImage from "../assets/product-image.jpg";
import { FaHome, FaMoneyBillWave, FaShieldAlt, FaWifi } from "react-icons/fa";

import images1 from '../assets/dxlab_images1.jpg';
import images2 from '../assets/dxlab_images2.jpg';
import images3 from '../assets/dxlab_images3.png';


export const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "DXLAB Blog", href: "/blog" },
  { label: "Về DXLAB", href: "/about" },
];

export const banners = [
  { "image": images1 },
  { "image": images2 },
  { "image": images3 },
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

export const mockTransactions = [
  {
    id: "TX12345",
    room: "A101",
    date: "2025-02-25T10:00:00",
    amount: 500000,
    status: "Thành công"
  },
  {
    id: "TX67890",
    room: "B202",
    date: "2025-02-20T15:30:00",
    amount: 300000,
    status: "Thất bại"
  },
  {
    id: "TX11111",
    room: "A101",
    date: "2025-02-18T09:00:00",
    amount: 400000,
    status: "Thành công"
  },
  {
    id: "TX22222",
    room: "C303",
    date: "2025-02-15T14:00:00",
    amount: 200000,
    status: "Thành công"
  },
  {
    id: "TX33333",
    room: "B202",
    date: "2025-02-08T08:00:00",
    amount: 350000,
    status: "Thất bại"
  },
  {
    id: "TX62890",
    room: "B202",
    date: "2025-02-02T15:30:00",
    amount: 300000,
    status: "Thất bại"
  },
  {
    id: "TX69890",
    room: "B202",
    date: "2025-03-20T15:30:00",
    amount: 300000,
    status: "Thất bại"
  },
];

export const slots = [
  { id: 1, name: "Slot 1", time: "08:00 - 10:00", isAvailable: true, remainingSeats: 4 },
  { id: 2, name: "Slot 2", time: "10:00 - 12:00", isAvailable: false, remainingSeats: 0 },
  { id: 3, name: "Slot 3", time: "13:00 - 15:00", isAvailable: true, remainingSeats: 6 },
  { id: 4, name: "Slot 4", time: "15:00 - 17:00", isAvailable: true, remainingSeats: 2 }
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
        label: "Quản lý khu vực",
        icon: ChartColumn,
        path: "/dashboard/area",
      },
      {
        label: "Quản lý thiết bị",
        icon: NotepadText,
        path: "/dashboard/facilities",
      },
      {
        label: "Quản lý phòng ",
        icon: Home,
        path: "/dashboard/room",
      },
      {
        label: "Quản lý slot",
        icon: Grid,
        path: "/dashboard/slot",
      },
    ]
  },
  {
    title: "Quản lý",
    children: [
      {
        label: "Quản lý tài khoản",
        icon: Users,
        path: "/dashboard/account",
      },
      
      {
        label: "Quản lý blog",
        icon: Package,
        path: "/dashboard/blog",
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
