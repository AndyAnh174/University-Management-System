# 🎓 University Management System (Lite Version)

Hệ thống quản lý trường đại học cơ bản, bao gồm quản lý Sinh viên, Giáo viên, Lớp học và Tài liệu học tập. Dự án được phát triển theo mô hình Agile/Cycles.

## 🛠 Tech Stack

- **Backend:** Django 6.0 (Python) + Django REST Framework
- **Frontend:** Next.js 16 (App Router) + Tailwind CSS
- **Database:** MySQL 8.0
- **Storage:** MinIO (S3 Compatible Self-hosted)
- **Infrastructure:** Docker Compose

## 🚀 Tính năng chính

1. **Authentication:** Đăng nhập, Phân quyền (Admin, Teacher, Student).
2. **Management:**
    - Admin: Quản lý Ngành, Chuyên ngành, Lớp học.
    - Admin: Import User từ Excel.
3. **Teacher Portal:** Quản lý lớp được phân công, Upload tài liệu bài giảng.
4. **Student Portal:** Xem thông tin lớp, Tải tài liệu về học (Download Securely).

## 📂 Cấu trúc dự án

```
Student-TeacherManagement/
├── backend/            # Django Source Code (Sắp init)
├── frontend/           # Next.js Source Code (Sắp init)
├── docs/               # Tài liệu dự án (Roadmap, Feature specs)
├── docker-compose.yml  # Config chạy DB & MinIO
├── .env                # Biến môi trường
└── README.md           # Hướng dẫn sử dụng
```

## 🔧 Hướng dẫn cài đặt & Chạy (Localhost)

### 1. Prerequisite
- Docker Desktop & Docker Compose
- Python 3.12+ (Optional nếu chạy local không qua docker)
- Node.js 20+ (Optional nếu chạy local không qua docker)

### 2. Khởi động Infrastructure (DB & MinIO)
Hệ thống sử dụng Docker để chạy Database và MinIO Object Storage.

```bash
# Copy file môi trường (Nếu chưa có)
# cp .env.example .env

# Start services
docker-compose up -d
```

- **MySQL** sẽ chạy tại `localhost:3306` (User/Pass trong `.env`).
- **MinIO Console** (Quản lý file) tại `http://localhost:9001` (User/Pass trong `.env`).
- **MinIO API** tại `http://localhost:9000`.

### 3. Setup Backend (Updating...)
*(Đang cập nhật trong Cycle 1)*

### 4. Setup Frontend (Updating...)
*(Đang cập nhật trong Cycle 1)*

## 📅 Roadmap
Xem chi tiết kế hoạch phát triển tại [docs/project_roadmap.md](./docs/project_roadmap.md).

---
**Author:** Quang Tai
**Last Updated:** 07/01/2026
