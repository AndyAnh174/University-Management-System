# Backend API (Django 6.0)

Mã nguồn REST API cho hệ thống quản lý trường đại học.

## ⚙️ Cấu trúc

- **core/**: Project settings (base, local, production).
- **manage.py**: Entry point.

## 🚀 Hướng Cài đặt & Chạy (Local)

1.  **Vào thư mục server:**
    ```bash
    cd server
    ```
2.  **Kích hoạt Virtual Environment (nếu chưa có):**
    ```bash
    source ../venv/bin/activate  # Linux/Mac
    ..\venv\Scripts\activate     # Windows
    ```
3.  **Cài đặt dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Tạo file .env (nếu chưa có):**
    *   Tạo file `.env` tại `server/.env`.
    *   Nội dung: Copy từ `.env.example` và chỉnh `DB_HOST=127.0.0.1` nếu chạy local.
5.  **Chạy Migration:**
    ```bash
    python manage.py migrate
    ```
6.  **Chạy Server:**
    ```bash
    python manage.py runserver
    ```
    API sẽ chạy tại: `http://localhost:8000`
    Swagger UI: `http://localhost:8000/swagger/`

## 🛠 Tech Stack
- Django 6.0
- Django REST Framework 3.16
- DRF_YASG (Swagger)
- MinIO Storage Adapter

---
Lưu ý: Không commit file `.env` và thư mục `__pycache__` lên git.
