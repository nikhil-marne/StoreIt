# StoreIt 📦

<div align="center">
  
  # StoreIt 📦
  
  ### A Modern Cloud Storage Management Platform
  
  Built with Next.js 15 | Powered by Appwrite | Styled with Tailwind CSS
  
  [Report Bug](https://github.com/nikhil-marne/StoreIt/issues) • [Request Feature](https://github.com/nikhil-marne/StoreIt/issues)
</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About The Project

StoreIt is a feature-rich cloud storage management platform that enables users
to securely upload, organize, and share files. With an intuitive interface and
powerful features, StoreIt provides a seamless experience for managing your
digital assets.

### Why StoreIt?

- 🔒 **Secure Storage** - Your files are stored securely with Appwrite's robust
  backend
- 📊 **Storage Analytics** - Real-time insights into your storage usage by file
  type
- 🤝 **Easy Sharing** - Share files with others via email with granular
  permissions
- 🎨 **Beautiful UI** - Modern, responsive design that works on all devices
- ⚡ **Fast Performance** - Built with Next.js 15 for optimal speed and
  performance

---

## ✨ Features

### Core Features

- **📤 File Upload & Storage**

  - Support for multiple file types (Documents, Images, Videos, Audio)
  - Drag-and-drop interface
  - Bulk file uploads
  - File size validation

- **📁 File Management**

  - Organize files by type
  - Rename files
  - Delete files
  - Search functionality
  - Sort by date, name, or size

- **👥 File Sharing**

  - Share files with multiple users via email
  - Manage shared file permissions
  - Track who has access to your files

- **📊 Storage Analytics**

  - Visual storage breakdown by file type
  - Storage usage charts
  - Track storage consumption in real-time
  - 2GB storage limit per user

- **🕐 Recent Activity**

  - Quick access to recently uploaded files
  - File thumbnails and previews
  - Timestamp information

- **🔐 Authentication**
  - Secure user authentication via Appwrite
  - Protected routes
  - Session management

---

## 🛠️ Tech Stack

### Frontend

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Lucide React](https://lucide.dev/)** - Icon library

### Backend

- **[Appwrite](https://appwrite.io/)** - Backend-as-a-Service
  - Authentication
  - Database
  - Storage
  - Real-time capabilities

### Additional Tools

- **[React Hook Form](https://react-hook-form.com/)** - Form handling
- **[Zod](https://zod.dev/)** - Schema validation
- **ESLint** - Code linting
- **PostCSS** - CSS processing

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** or **pnpm**
- An **Appwrite** account ([Sign up here](https://cloud.appwrite.io/))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/nikhil-marne/StoreIt.git
   cd StoreIt
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Appwrite**

   a. Create a new project in your
   [Appwrite Console](https://cloud.appwrite.io/)

   b. Create a new Database and note the Database ID

   c. Create the following collections:

   - **users** collection with these attributes:
     - `fullName` (string)
     - `email` (string)
     - `avatar` (string)
     - `accountId` (string)
   - **files** collection with these attributes:
     - `type` (string)
     - `name` (string)
     - `url` (string)
     - `extension` (string)
     - `size` (number)
     - `owner` (string)
     - `accountId` (string)
     - `users` (array)
     - `bucketFileId` (string)

   d. Create a Storage Bucket and note the Bucket ID

   e. Set up appropriate permissions for collections and storage

4. **Configure environment variables**

   Create a `.env.local` file in the root directory and add the following:

   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT=your_project_id
   NEXT_PUBLIC_APPWRITE_DATABASE=your_database_id
   NEXT_PUBLIC_APPWRITE_USERS_COLLECTION=your_users_collection_id
   NEXT_PUBLIC_APPWRITE_FILES_COLLECTION=your_files_collection_id
   NEXT_PUBLIC_APPWRITE_BUCKET=your_bucket_id
   NEXT_APPWRITE_KEY=your_api_key
   ```

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
StoreIt/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── sign-in/         # Sign in page
│   │   └── sign-up/         # Sign up page
│   ├── (root)/              # Main application pages
│   │   ├── [type]/          # Dynamic file type pages
│   │   └── page.tsx         # Dashboard
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── ActionDropdown.tsx   # File actions menu
│   ├── Chart.tsx            # Storage usage chart
│   ├── FileUploader.tsx     # File upload component
│   ├── FormattedDateTime.tsx
│   ├── Header.tsx
│   ├── MobileNavigation.tsx
│   ├── OTPModal.tsx
│   ├── Search.tsx
│   ├── Sidebar.tsx
│   ├── Thumbnail.tsx
│   └── ...
├── constants/
│   └── index.ts             # App constants and config
├── hooks/
│   └── ...                  # Custom React hooks
├── lib/
│   ├── actions/
│   │   ├── file.action.ts   # File CRUD operations
│   │   └── user.action.ts   # User operations
│   ├── appwrite/
│   │   ├── config.ts        # Appwrite configuration
│   │   └── index.ts         # Appwrite client setup
│   └── utils.ts             # Utility functions
├── public/
│   └── assets/              # Static assets (icons, images)
├── types/
│   └── index.d.ts           # TypeScript type definitions
├── .env.local               # Environment variables (create this)
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 💡 Usage

### Uploading Files

1. Click the **"Upload"** button in the header
2. Select files from your device or drag and drop
3. Files will be automatically categorized by type
4. View uploaded files in the dashboard or respective type pages

### Managing Files

- **Rename**: Click the three-dot menu → Select "Rename"
- **Share**: Click the three-dot menu → Select "Share" → Enter email addresses
- **Delete**: Click the three-dot menu → Select "Delete" → Confirm

### Viewing Storage Analytics

- Dashboard displays storage breakdown by file type
- Visual chart shows percentage of storage used
- Click on any file type card to view files of that category

### Searching Files

- Use the search bar in the header
- Search works across all file names
- Results update in real-time

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to
learn, inspire, and create. Any contributions you make are **greatly
appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` file for more information.

---

## 📧 Contact

Nikhil Marne - [@nikhil-marne](https://github.com/nikhil-marne)

Project Link:
[https://github.com/nikhil-marne/StoreIt](https://github.com/nikhil-marne/StoreIt)

---

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Appwrite Documentation](https://appwrite.io/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

---

<div align="center">
  
  ### ⭐ If you find this project useful, please consider giving it a star!
  
  Made with ❤️ by [Nikhil Marne](https://github.com/nikhil-marne)
  
</div>
