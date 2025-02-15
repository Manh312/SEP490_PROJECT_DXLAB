import { BotMessageSquare } from "lucide-react";
import { BatteryCharging } from "lucide-react";
import { Fingerprint } from "lucide-react";
import { ShieldHalf } from "lucide-react";
import { PlugZap } from "lucide-react";
import { GlobeLock } from "lucide-react";

import user1 from "../assets/profile-pictures/user1.jpg";
import user2 from "../assets/profile-pictures/user2.jpg";
import user3 from "../assets/profile-pictures/user3.jpg";
import user4 from "../assets/profile-pictures/user4.jpg";
import user5 from "../assets/profile-pictures/user5.jpg";
import user6 from "../assets/profile-pictures/user6.jpg";

import { ChartColumn, Home, NotepadText, Package, PackagePlus, Settings, ShoppingBag, UserCheck, UserPlus, Users } from "lucide-react";

import ProfileImage from "../assets/profile-image.jpg";
import ProductImage from "../assets/product-image.jpg";


export const navItems = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/aboutus" },
];

export const testimonials = [
  {
    user: "John Doe",
    company: "Stellar Solutions",
    image: user1,
    text: "I am extremely satisfied with the services provided. The team was responsive, professional, and delivered results beyond my expectations.",
  },
  {
    user: "Jane Smith",
    company: "Blue Horizon Technologies",
    image: user2,
    text: "I couldn't be happier with the outcome of our project. The team's creativity and problem-solving skills were instrumental in bringing our vision to life",
  },
  {
    user: "David Johnson",
    company: "Quantum Innovations",
    image: user3,
    text: "Working with this company was a pleasure. Their attention to detail and commitment to excellence are commendable. I would highly recommend them to anyone looking for top-notch service.",
  },
  {
    user: "Ronee Brown",
    company: "Fusion Dynamics",
    image: user4,
    text: "Working with the team at XYZ Company was a game-changer for our project. Their attention to detail and innovative solutions helped us achieve our goals faster than we thought possible. We are grateful for their expertise and professionalism!",
  },
  {
    user: "Michael Wilson",
    company: "Visionary Creations",
    image: user5,
    text: "I am amazed by the level of professionalism and dedication shown by the team. They were able to exceed our expectations and deliver outstanding results.",
  },
  {
    user: "Emily Davis",
    company: "Synergy Systems",
    image: user6,
    text: "The team went above and beyond to ensure our project was a success. Their expertise and dedication are unmatched. I look forward to working with them again in the future.",
  },
];

export const features = [
  {
    icon: <BotMessageSquare />,
    text: "Drag-and-Drop Interface",
    description:
      "Easily design and arrange your VR environments with a user-friendly drag-and-drop interface.",
  },
  {
    icon: <Fingerprint />,
    text: "Multi-Platform Compatibility",
    description:
      "Build VR applications that run seamlessly across multiple platforms, including mobile, desktop, and VR headsets.",
  },
  {
    icon: <ShieldHalf />,
    text: "Built-in Templates",
    description:
      "Jumpstart your VR projects with a variety of built-in templates for different types of applications and environments.",
  },
  {
    icon: <BatteryCharging />,
    text: "Real-Time Preview",
    description:
      "Preview your VR application in real-time as you make changes, allowing for quick iterations and adjustments.",
  },
  {
    icon: <PlugZap />,
    text: "Collaboration Tools",
    description:
      "Work together with your team in real-time on VR projects, enabling seamless collaboration and idea sharing.",
  },
  {
    icon: <GlobeLock />,
    text: "Analytics Dashboard",
    description:
      "Gain valuable insights into user interactions and behavior within your VR applications with an integrated analytics dashboard.",
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
    title: "Free",
    price: "$0",
    features: [
      "Private board sharing",
      "5 Gb Storage",
      "Web Analytics",
      "Private Mode",
    ],
  },
  {
    title: "Pro",
    price: "$10",
    features: [
      "Private board sharing",
      "10 Gb Storage",
      "Web Analytics (Advance)",
      "Private Mode",
    ],
  },
  {
    title: "Enterprise",
    price: "$200",
    features: [
      "Private board sharing",
      "Unlimited Storage",
      "High Performance Network",
      "Private Mode",
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
      title: "Dashboard",
      links: [
          {
              label: "Dashboard",
              icon: Home,
              path: "/dashboard",
          },
          {
              label: "Analytics",
              icon: ChartColumn,
              path: "/dashboard/products",
          },
          {
              label: "Reports",
              icon: NotepadText,
              path: "/reports",
          },
      ],
  },
  {
      title: "Customers",
      links: [
          {
              label: "Customers",
              icon: Users,
              path: "/customers",
          },
          {
              label: "New customer",
              icon: UserPlus,
              path: "/new-customer",
          },
          {
              label: "Verified customers",
              icon: UserCheck,
              path: "/verified-customers",
          },
      ],
  },
  {
      title: "Products",
      links: [
          {
              label: "Products",
              icon: Package,
              path: "/products",
          },
          {
              label: "New product",
              icon: PackagePlus,
              path: "/new-product",
          },
          {
              label: "Inventory",
              icon: ShoppingBag,
              path: "/inventory",
          },
      ],
  },
  {
      title: "Settings",
      links: [
          {
              label: "Settings",
              icon: Settings,
              path: "/settings",
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