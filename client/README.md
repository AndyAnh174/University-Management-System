# Client (Next.js 16 + Tailwind CSS)

Mã nguồn Frontend cho hệ thống quản lý sinh viên - giảng viên.

## ⚙️ Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **Styling:** Tailwind CSS v4
- **UI Library:** MagicUI / Shadcn UI
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Language:** TypeScript

---

## 📂 Cấu Trúc Thư Mục (Feature-based)

```
client/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Route group - authentication
│   │   └── login/
│   ├── (dashboard)/           # Route group - main app với layout
│   │   ├── layout.tsx        # Dashboard layout (Sidebar + Header)
│   │   ├── dashboard/        # /dashboard
│   │   ├── students/         # /students
│   │   ├── teachers/         # /teachers
│   │   ├── courses/          # /courses
│   │   ├── schedules/        # /schedules
│   │   └── settings/         # /settings
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
│
├── components/                 # Shared UI Components
│   ├── layout/                # Layout components
│   │   ├── Sidebar.tsx       # Sidebar với navigation
│   │   ├── Header.tsx        # Top header với search, user menu
│   │   └── DashboardLayout.tsx
│   ├── ui/                    # Base UI (Shadcn components)
│   └── magicui/               # MagicUI animated components
│
├── features/                   # 🎯 Feature Modules (Core Architecture)
│   ├── auth/                  # Authentication feature
│   │   ├── api/              # Fetch functions (login, register)
│   │   ├── hooks/            # React hooks (useAuth)
│   │   ├── types/            # TypeScript interfaces
│   │   ├── components/       # UI (LoginForm, RegisterForm)
│   │   ├── utils/            # Token management, validation
│   │   └── index.ts          # Barrel export
│   │
│   ├── students/              # (Sẽ thêm) Student management
│   ├── teachers/              # (Sẽ thêm) Teacher management
│   ├── courses/               # (Sẽ thêm) Course management
│   └── index.ts               # Export all features
│
├── lib/                        # Shared Utilities (Global)
│   ├── api-client.ts          # Axios instance với interceptors
│   ├── constants.ts           # App constants, routes, roles
│   ├── utils.ts               # Utility functions (cn, etc.)
│   └── index.ts               # Barrel export
│
├── public/                     # Static Assets
│   └── [images, icons, etc.]
│
├── env.example                 # Environment variables template
├── components.json             # Shadcn UI config
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

---

## 🎯 Feature-based Structure

**Mỗi feature là một thư mục riêng** với cấu trúc cố định:

```
features/
└── [feature-name]/
    ├── api/           # Chứa các hàm fetch (CRUD operations)
    ├── hooks/         # Logic xử lý, state management
    ├── types/         # Định nghĩa schema, interfaces
    ├── components/    # Giao diện (Forms, Cards, Lists)
    ├── utils/         # Xử lý lỗi, validation, helpers
    └── index.ts       # Barrel export
```

### Ưu điểm:
- ✅ **Modular**: Dễ thêm/xóa features
- ✅ **Encapsulated**: Mỗi feature tự quản lý logic riêng
- ✅ **Scalable**: Dễ scale khi project lớn
- ✅ **Maintainable**: Dễ tìm code liên quan

### Cách sử dụng:

```typescript
// Import từ feature
import { useAuth, LoginForm, RegisterForm } from '@/features/auth';

// Hoặc import cụ thể
import { login, register } from '@/features/auth/api';
import type { User, AuthResponse } from '@/features/auth/types';
```

---

## 📁 Shared vs Feature-specific

| Loại | Vị trí | Mô tả |
|------|--------|-------|
| **Shared** | `/lib` | Dùng chung cho tất cả features (API client, constants) |
| **Shared** | `/components/ui` | Base UI components (Button, Input, Card) |
| **Feature** | `/features/[name]` | Logic riêng cho từng feature |

---

## 🚀 Hướng Cài Đặt & Chạy

### 1. Clone & Navigate

```bash
cd client
```

### 2. Copy Environment Variables

```bash
cp env.example .env.local
```

Chỉnh sửa `.env.local` theo môi trường.

### 3. Cài Đặt Dependencies

```bash
pnpm install
```

### 4. Chạy Development Server

```bash
pnpm dev
```

Web chạy tại: `http://localhost:3000`

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api` |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | App display name | `Student-Teacher Management` |

---

## 📝 Conventions

### Import Paths (Aliases)

```typescript
// ✅ Dùng alias
import { apiClient } from '@/lib/api-client';
import { useAuth, LoginForm } from '@/features/auth';
import { Button } from '@/components/ui/button';

// ❌ Tránh relative imports dài
import { Button } from '../../../components/ui/button';
```

### Thêm Feature Mới

1. Tạo folder trong `/features/[feature-name]/`
2. Tạo subfolder: `api/`, `hooks/`, `types/`, `components/`, `utils/`
3. Tạo `index.ts` để export
4. Update `/features/index.ts`

---

## 🔗 Related

- **Server (Django):** `../server/` - Backend API
- **API Docs:** `http://localhost:8000/api/docs` (khi server chạy)

---

**Lưu ý:** Đảm bảo Server chạy ở `http://localhost:8000` để API hoạt động.
