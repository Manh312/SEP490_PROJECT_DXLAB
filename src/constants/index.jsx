import {
  ChartColumn,
  Home,
  NotepadText,
  Package,
  Users,
  Grid,
  Calendar,
  FileText,
  Settings,
} from "lucide-react";

import ProfileImage from "../assets/profile-image.jpg";
import ProductImage from "../assets/product-image.jpg";
import { FaHome, FaMoneyBillWave, FaShieldAlt, FaWifi } from "react-icons/fa";

import images1 from "../assets/dxlab_images1.jpg";
import images2 from "../assets/dxlab_images2.jpg";
import images3 from "../assets/dxlab_images3.png";

export const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "DXLAB Blog", href: "/blog" },
  { label: "Về DXLAB", href: "/about" },
];

export const banners = [
  { image: images1 },
  { image: images2 },
  { image: images3 },
];

export const services = [
  {
    text: "CHỖ NGỒI CÁ NHÂN CỐ ĐỊNH",
    description: "Dành cho cá nhân",
    click: "Khám phá ngay",
  },
  {
    text: "CHỖ NGỒI THEO NHÓM CỐ ĐỊNH",
    description: "Dành cho đội nhóm",
    click: "Khám phá ngay",
  },
];

export const blogPosts = [
  {
    id: "1",
    title: "Không gian làm việc hiện đại tại DXLAB",
    date: "20/02/2025",
    image: images1,
    content: `DXLAB mang đến không gian làm việc linh hoạt, sáng tạo, phù hợp cho cá nhân và nhóm. 
    Hãy khám phá sự tiện nghi mà chúng tôi cung cấp.

    Với thiết kế hiện đại, DXLAB tạo ra môi trường làm việc chuyên nghiệp, giúp bạn tối ưu năng suất và 
    sáng tạo. Chúng tôi cung cấp đầy đủ tiện nghi như Wi-Fi tốc độ cao, khu vực tiếp khách, phòng họp, và 
    không gian thư giãn. Không chỉ là nơi làm việc, DXLAB còn là cộng đồng dành cho những người đam mê 
    khởi nghiệp, nơi bạn có thể kết nối và học hỏi từ những chuyên gia trong ngành.

    Ngoài ra, DXLAB còn tổ chức nhiều sự kiện, hội thảo và workshop giúp bạn mở rộng kiến thức, kết nối 
    với các nhà đầu tư, doanh nhân và chuyên gia hàng đầu. Đừng bỏ lỡ cơ hội trải nghiệm không gian làm việc 
    tuyệt vời này tại DXLAB!`
  },
  {
    id: "2",
    title: "Lợi ích của co-working space đối với freelancer",
    date: "18/02/2025",
    image: images2,
    content: `Freelancer có thể tận hưởng môi trường làm việc chuyên nghiệp, kết nối với cộng đồng và 
    tăng năng suất khi làm việc tại DXLAB.

    Co-working space không chỉ đơn thuần là một nơi để làm việc mà còn mang lại nhiều lợi ích đáng kể 
    cho freelancer. Một trong những ưu điểm lớn nhất là bạn có thể làm việc trong một môi trường chuyên nghiệp 
    với đầy đủ tiện nghi, giúp giảm thiểu sự xao nhãng so với làm việc tại nhà. 

    Bên cạnh đó, co-working space giúp freelancer có cơ hội gặp gỡ và mở rộng mối quan hệ với những người 
    có cùng chí hướng. Việc kết nối với cộng đồng không chỉ tạo ra cơ hội hợp tác mà còn giúp bạn học hỏi từ 
    những chuyên gia trong lĩnh vực của mình.

    Ngoài ra, không gian làm việc chung như DXLAB còn tổ chức nhiều sự kiện, hội thảo và chương trình đào tạo, 
    giúp bạn nâng cao kỹ năng và cập nhật xu hướng mới nhất trong ngành. Nếu bạn đang tìm kiếm một nơi làm việc 
    chuyên nghiệp, linh hoạt và sáng tạo, co-working space chính là lựa chọn hoàn hảo cho bạn!`,
    images: images3,
    contents: `Freelancer có thể tận hưởng môi trường làm việc chuyên nghiệp, kết nối với cộng đồng và 
    tăng năng suất khi làm việc tại DXLAB.

    Co-working space không chỉ đơn thuần là một nơi để làm việc mà còn mang lại nhiều lợi ích đáng kể 
    cho freelancer. Một trong những ưu điểm lớn nhất là bạn có thể làm việc trong một môi trường chuyên nghiệp 
    với đầy đủ tiện nghi, giúp giảm thiểu sự xao nhãng so với làm việc tại nhà. 

    Bên cạnh đó, co-working space giúp freelancer có cơ hội gặp gỡ và mở rộng mối quan hệ với những người 
    có cùng chí hướng. Việc kết nối với cộng đồng không chỉ tạo ra cơ hội hợp tác mà còn giúp bạn học hỏi từ 
    những chuyên gia trong lĩnh vực của mình.

    Ngoài ra, không gian làm việc chung như DXLAB còn tổ chức nhiều sự kiện, hội thảo và chương trình đào tạo, 
    giúp bạn nâng cao kỹ năng và cập nhật xu hướng mới nhất trong ngành. Nếu bạn đang tìm kiếm một nơi làm việc 
    chuyên nghiệp, linh hoạt và sáng tạo, co-working space chính là lựa chọn hoàn hảo cho bạn!`,
  },
  {
    id: "3",
    title: "Không gian làm việc hiện đại tại DXLAB",
    date: "20/02/2025",
    image: images1,
    content: `DXLAB mang đến không gian làm việc linh hoạt, sáng tạo, phù hợp cho cá nhân và nhóm. 
    Hãy khám phá sự tiện nghi mà chúng tôi cung cấp.

    Với thiết kế hiện đại, DXLAB tạo ra môi trường làm việc chuyên nghiệp, giúp bạn tối ưu năng suất và 
    sáng tạo. Chúng tôi cung cấp đầy đủ tiện nghi như Wi-Fi tốc độ cao, khu vực tiếp khách, phòng họp, và 
    không gian thư giãn. Không chỉ là nơi làm việc, DXLAB còn là cộng đồng dành cho những người đam mê 
    khởi nghiệp, nơi bạn có thể kết nối và học hỏi từ những chuyên gia trong ngành.

    Ngoài ra, DXLAB còn tổ chức nhiều sự kiện, hội thảo và workshop giúp bạn mở rộng kiến thức, kết nối 
    với các nhà đầu tư, doanh nhân và chuyên gia hàng đầu. Đừng bỏ lỡ cơ hội trải nghiệm không gian làm việc 
    tuyệt vời này tại DXLAB!`
  },
];


export const about = [
  {
    title: "CHỖ NGỒI CÁ NHÂN CỐ ĐỊNH",
    image: images1,
    description: "Dịch vụ chỗ ngồi cá nhân cố định tại DXLAB cung cấp không gian làm việc riêng biệt với bàn làm việc hiện đại, ghế ergonomic giúp giảm đau lưng, cùng hệ thống internet tốc độ cao. Không gian này lý tưởng cho những ai cần một nơi làm việc yên tĩnh, tập trung mà vẫn được kết nối với cộng đồng sáng tạo. Ngoài ra, bạn còn có thể sử dụng các tiện ích chung như phòng họp, khu vực thư giãn và quầy bar mini."
  },
  {
    title: "CHỖ NGỒI THEO NHÓM",
    image: images2,
    description: "Dịch vụ chỗ ngồi theo nhóm tại DXLAB mang đến môi trường hợp tác lý tưởng cho các nhóm làm việc, sinh viên, startup. Không gian được trang bị bàn làm việc rộng rãi, bảng trắng, thiết bị trình chiếu, giúp các nhóm có thể trao đổi ý tưởng một cách hiệu quả. Ngoài ra, khu vực này còn có không gian chung để kết nối với các nhóm khác, tạo cơ hội học hỏi và phát triển dự án một cách linh hoạt và chuyên nghiệp."
  },
];

export const rooms = [
  {
    id: 1,
    name: "Phòng 318",
    description: "Phòng DXLAB thuộc dãy toàn Delta tại trường đại học FPT.",
    images: images1,
  },
  {
    id: 2,
    name: "Phòng 319",
    description: "Phòng DXLAB thuộc dãy toàn Delta tại trường đại học FPT.",
    images: images1,
  },
  {
    id: 3,
    name: "Phòng 320",
    description: "Phòng DXLAB thuộc dãy toàn Delta tại trường đại học FPT.",
    images: images1,
  },
];

export const mockTransactions = [
  {
    id: "TX12345",
    room: "A101",
    date: "2025-02-25T10:00:00",
    amount: 500000,
    status: "Thành công",
  },
  {
    id: "TX67890",
    room: "B202",
    date: "2025-02-20T15:30:00",
    amount: 300000,
    status: "Thất bại",
  },
  {
    id: "TX11111",
    room: "A101",
    date: "2025-02-18T09:00:00",
    amount: 400000,
    status: "Thành công",
  },
  {
    id: "TX22222",
    room: "C303",
    date: "2025-02-15T14:00:00",
    amount: 200000,
    status: "Thành công",
  },
  {
    id: "TX33333",
    room: "B202",
    date: "2025-02-08T08:00:00",
    amount: 350000,
    status: "Thất bại",
  },
  {
    id: "TX62890",
    room: "B202",
    date: "2025-02-02T15:30:00",
    amount: 300000,
    status: "Thất bại",
  },
  {
    id: "TX69890",
    room: "B202",
    date: "2025-03-20T15:30:00",
    amount: 300000,
    status: "Thất bại",
  },
];

export const slots = [
  {
    id: 1,
    name: "Slot 1",
    time: "08:00 - 10:00",
    isAvailable: true,
    remainingSeats: 4,
  },
  {
    id: 2,
    name: "Slot 2",
    time: "10:00 - 12:00",
    isAvailable: false,
    remainingSeats: 0,
  },
  {
    id: 3,
    name: "Slot 3",
    time: "13:00 - 15:00",
    isAvailable: true,
    remainingSeats: 6,
  },
  {
    id: 4,
    name: "Slot 4",
    time: "15:00 - 17:00",
    isAvailable: true,
    remainingSeats: 2,
  },
];

export const areas = [
  {
    id: 1,
    type: "personal", 
    name: "Khu vực cá nhân",
    description:
      "Không gian yên tĩnh, lý tưởng cho cá nhân làm việc tập trung. Được thiết kế dành riêng cho những người cần sự riêng tư và tập trung cao độ. Bạn có thể tận hưởng không gian thoáng đãng, ánh sáng tự nhiên và trang bị đầy đủ tiện ích để làm việc hiệu quả.",
    image: images1,
    features: [
      "Chỗ ngồi làm việc riêng với bàn và ghế tiện nghi",
      "Internet tốc độ cao, hỗ trợ làm việc trực tuyến mượt mà",
      "Không gian yên tĩnh, giảm thiểu tiếng ồn tối đa",
      "Ổ cắm điện thuận tiện, hỗ trợ sạc thiết bị cá nhân",
      "Khu vực thư giãn đi kèm, giúp tái tạo năng lượng sau giờ làm việc",
    ],
  },
  {
    id: 2,
    type: "group", 
    name: "Khu vực nhóm",
    description: 
      "Không gian linh hoạt, phù hợp cho nhóm làm việc chung. Được thiết kế nhằm đáp ứng nhu cầu trao đổi, làm việc nhóm một cách hiệu quả. Bạn có thể tổ chức các cuộc họp, thảo luận nhóm hoặc làm việc cùng đồng đội mà không bị giới hạn về không gian.",
    image: images3,
    features: [
      "Bàn làm việc nhóm rộng rãi, hỗ trợ nhiều người cùng làm việc",
      "Khu vực riêng biệt, đảm bảo sự thoải mái và linh hoạt",
      "Trang bị bảng trắng hoặc màn hình trình chiếu phục vụ thảo luận",
      "Hệ thống âm thanh chất lượng, phục vụ các buổi họp nhóm",
      "Không gian mở với thiết kế hiện đại, giúp tăng cường sáng tạo",
    ],
  },
];


export const features = [
  {
    icon: <FaMoneyBillWave className="text-orange-500 text-3xl" />,
    text: "THANH TOÁN THEO GÓI LINH ĐỘNG",
    description:
      "Lựa chọn thanh toán theo slot, 1 tháng hoặc kỳ học tùy theo kế hoạch của bạn.",
  },
  {
    icon: <FaHome className="text-orange-500 text-3xl" />,
    text: "KHÔNG GIAN THOẢI MÁI, YÊN TĨNH",
    description:
      "Không gian sạch sẽ, rộng rãi, yên tĩnh giúp bạn có những khoảng thời gian làm việc tập trung và hiệu quả.",
  },
  {
    icon: <FaShieldAlt className="text-orange-500 text-3xl" />,
    text: "ĐẢM BẢO AN TOÀN, AN NINH",
    description:
      "Đội ngũ chúng tôi luôn luôn đặt an toàn của khách hàng lên hàng đầu, đảm bảo không có sự cố xảy ra.",
  },
  {
    icon: <FaWifi className="text-orange-500 text-3xl" />,
    text: "HỆ THỐNG MẠNG TỐC ĐỘ CAO",
    description:
      "Với hệ thống wifi tân tiến nhất hiện nay, ổn định đảm bảo chất lượng làm việc của bạn.",
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
    ],
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
    name: "Tháng 1",
    total: 1500,
  },
  {
    name: "Tháng 2",
    total: 2000,
  },
  {
    name: "Tháng 3",
    total: 1000,
  },
  {
    name: "Tháng 4",
    total: 5000,
  },
  {
    name: "Tháng 5",
    total: 2000,
  },
  {
    name: "Tháng 6",
    total: 5900,
  },
  {
    name: "Tháng 7",
    total: 2000,
  },
  {
    name: "Tháng 8",
    total: 5500,
  },
  {
    name: "Tháng 9",
    total: 2000,
  },
  {
    name: "Tháng 10",
    total: 4000,
  },
  {
    name: "Tháng 11",
    total: 1500,
  },
  {
    name: "Tháng 12",
    total: 2500,
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