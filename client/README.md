# Client (Next.js 16 + Tailwind CSS)

Mã nguồn Frontend cho hệ thống quản lý trường đại học.

## ⚙️ Tech Stack
- **Framework:** Next.js 16.1.1 (App Router)
- **Styling:** Tailwind CSS v4
- **UI Library:** MagicUI / Shadcn UI
- **State Management:** (TBD - Context API / Zustand)
- **Icons:** Lucide React

## 🚀 Hướng Cài đặt & Chạy (Local)

1.  **Vào thư mục client:**
    ```bash
    cd client
    ```
2.  **Cài đặt dependencies:**
    ```bash
    pnpm install
    ```
3.  **Chạy Development Server:**
    ```bash
    pnpm dev
    ```
    Web sẽ chạy tại: `http://localhost:3000`

## 📂 Cấu trúc thư mục (Dự kiến)
- `app/`: App Router pages & layouts.
- `components/`: Reusable UI components.
- `lib/`: Utilities, helpers, API clients.
- `public/`: Static assets.

---
**Lưu ý:** Đảm bảo Server chạy ở `http://localhost:8000` để API hoạt động.
