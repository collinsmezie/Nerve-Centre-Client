# Nerve Center Client

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)
![Status](https://img.shields.io/badge/status-In%20Development-yellow)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

---

## 🧠 Overview

The **Nerve Center Client** is a web-based **fleet and geofence management interface** built with **Next.js**. It connects to the **Nerve Center API**, enabling users to manage vehicles, geofences, and special zone configurations from a modern dashboard.

This app is ideal for use cases involving **logistics coordination, location enforcement, safety perimeter scheduling**, and **asset monitoring** in real-time or administrative workflows.

---

## 🚀 Key Features

- 🗺️ **Interactive Map Interface**  
  View and draw geofences using the **Google Maps API**, with full support for polygonal and circular zones.

- 🚐 **Fleet Management Interface**  
  Assign assets (e.g. vehicles, drivers) to geofence groups and track their geographic access.

- 🕒 **Timed Zone Visualization**  
  Easily identify and configure **special geofences** that are only active during certain hours of the day.

- 🔄 **Dynamic Zone Assignment**  
  Add/remove geofences to/from groups and special schedules via intuitive UI controls.

- 📡 **API-Driven Design**  
  All operations (geofences, groups, assignments) are powered by the **Nerve Center API**.

---

## 🧰 Tech Stack

- **Next.js** – React-based framework for fast, server-rendered UIs
- **TypeScript** – End-to-end static typing
- **Tailwind CSS** – Utility-first styling
- **Google Maps JavaScript API** – Map rendering and drawing tools
- **React Hook Form / Zod** – Form handling and validation
- **Axios** – HTTP client for communicating with the backend

---

## 📸 Screenshots

### 🗺️ Geofence Drawing Interface
![Geofence Drawing](/screenshots/geofence-draw.png)

Draw circular or polygonal geofences directly on the map using the Google Maps Drawing tools.

<!-- --- -->

<!-- ### 👥 Group Assignment View
![Group Assignment](public/screenshots/group-assign.png)

Assign geofences to groups and manage access boundaries for teams or vehicles. -->

<!-- --- -->

<!-- ### ⏱️ Special Timed Geofence Configuration
![Timed Geofence](public/screenshots/special-timed.png)

Configure geofences that are only active during defined hours of the day. -->

---

### 🚐 Fleet Overview Panel
![Fleet View](/screenshots/fleet-overview.png)

View and manage assigned vehicles, zones, and group interactions.

---

## ⚙️ Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/nerve-centre-client.git
cd nerve-centre-client

# Install dependencies
npm install

# Create a .env.local file
cp .env.example .env.local
# Set the following:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key

# Run the development server
npm run dev

# Visit the app
http://localhost:3000
