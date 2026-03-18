Project Name: HNP LIVE AUCTION

Goal:
Build a modern, fully responsive React frontend using Ant Design (Antigravity UI) with a premium dark theme (purple + black with purple rays effect). The application should deliver a highly interactive, visually rich auction experience with smooth animations, 3D effects, authentication control, and scalable architecture for future mobile app integration.

🔐 Authentication & Access Control (NEW - IMPORTANT)

Implement user authentication (frontend logic + protected routes):

Users must log in to access core features

If NOT logged in:

Restrict access to:

Product Listing

Bidding Page

Wishlist

My Orders

Group Bidding

Show:

“🔒 Please login to view auctions” message

Blurred/locked product preview (optional premium UI effect)

After login:

Redirect to homepage or last visited page

Add:

Session handling (localStorage/token placeholder)

Logout functionality

Auth-based navbar (Login → Profile/Logout)

🎯 Core UI Theme & Design System

Theme: Dark Purple + Black Gradient

Effects:

Purple rays/glow accents

Glassmorphism (optional)

Soft shadows + depth

Font:

Open Sans Medium (500) across entire website

Design Style:

Blend of modern + subtle vintage luxury

Fully responsive:

Mobile, tablet, desktop

🧭 Global Layout
Header / Navbar

Centered Logo: “HNP LIVE AUCTION”

Navigation Links:

Home

Login / Profile

Product Listing

Bidding

Wishlist

My Orders

Group Bidding

Features:

Sticky navbar

Smooth hover underline animation

Icons for each menu item

🏠 1️⃣ Homepage

Hero section with:

Animated purple rays background

Tagline (e.g., “Bid Smart. Win Big.”)

Featured auctions carousel

Categories section with icons (grid layout)

CTA buttons with animations

Smooth scroll transitions

🔑 2️⃣ Login Page

Ant Design Form:

Email / Username

Password

Features:

Validation (required + format)

Error messages

Animated login button

UI:

Centered card with glow effect

Dark purple gradient background

🛍️ 3️⃣ Product Listing Page

Grid layout (responsive)

Product Card includes:

Image

Name

Price

“View Auction” button

Filters:

Price Range slider

Category dropdown

Categories:

High-Tech Gadgets

Collectibles

Luxury & Fashion

Experiences

Mystery Boxes

Art & Memorabilia

NEW (More Items & Icons):

Add visually rich icons + products for:

🏎️ Paddock Passes (F1/Motorsport)

🏏 Cricket Tickets

👜 Fashion Bags

👗 Dresses

💍 Accessories

🎧 Electronics

🎮 Gaming Gear

⌚ Luxury Watches

🖼️ Vintage Art

Effects:

3D hover tilt effect

Card glow on hover

Smooth button animation

🔥 4️⃣ Bidding Page (MAIN FEATURE)

Product Details:

Large image (3D hover/tilt)

Description

Current highest bid

Countdown timer

Features:

“Place Bid” input + button

Validation (numeric + non-empty)

Bid History (latest first)

Loading spinner for async actions

Real-Time:

WebSocket placeholder for live bids

“Live Updates” UI indicator

💖 5️⃣ Wishlist Page

Grid/List of saved items

Each item:

Image

Price

Remove button

Animations:

Smooth remove transition

Hover effects

📦 6️⃣ My Orders Page

Display won auctions

Each item:

Image

Price

Status:

Pending

Completed

Clean card layout

Responsive UI

👥 7️⃣ Group Bidding Page

Features:

Create Group button

Invite link generator

Members list

Contribution progress bar

“Place Group Bid” button

UI:

3D product display

Interactive progress animations

✨ 8️⃣ UI/UX Enhancements

Center-aligned logo across all pages

Micro-interactions:

Button click animations

Hover transitions

Smooth page transitions

Skeleton loaders / spinners

Notification system (Ant Design)

Consistent spacing and layout

⚙️ 9️⃣ Technical Requirements

React (Functional Components + Hooks)

Ant Design (UI components)

Routing:

React Router with Protected Routes

State management (basic or Context API)

Code structure scalable for:

Backend integration

Mobile app (React Native)

🚀 🔟 Final Output Expectations

Fully responsive UI

Clean, modular component structure

Professional, hackathon-ready design

Strong visual appeal + interactivity

Authentication-based content access

Smooth animations + 3D effects