from django.db import models


class Faculty(models.Model):
    """
    Faculty/Department model
    Represents academic departments like "Khoa Công nghệ thông tin", "Khoa Kinh tế"
    """
    code = models.CharField(
        max_length=20, 
        unique=True, 
        db_index=True,
        help_text="Mã khoa (vd: CNTT, KT, QT)"
    )
    name = models.CharField(
        max_length=200,
        help_text="Tên khoa"
    )
    description = models.TextField(
        blank=True, 
        null=True,
        help_text="Mô tả về khoa"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Khoa còn hoạt động không"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'faculties'
        verbose_name = 'Faculty'
        verbose_name_plural = 'Faculties'
        ordering = ['name']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Major(models.Model):
    """
    Major/Program model
    Represents study programs like "Kỹ thuật phần mềm", "Hệ thống thông tin"
    """
    faculty = models.ForeignKey(
        Faculty,
        on_delete=models.PROTECT,
        related_name='majors',
        help_text="Khoa chủ quản"
    )
    code = models.CharField(
        max_length=20, 
        unique=True, 
        db_index=True,
        help_text="Mã ngành (vd: KTPM, HTTT)"
    )
    name = models.CharField(
        max_length=200,
        help_text="Tên ngành"
    )
    description = models.TextField(
        blank=True, 
        null=True,
        help_text="Mô tả về ngành"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Ngành còn tuyển sinh không"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'majors'
        verbose_name = 'Major'
        verbose_name_plural = 'Majors'
        ordering = ['faculty', 'name']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Class(models.Model):
    """
    Class model
    Represents a specific class/cohort like "KTPM2021", "HTTT2022"
    """
    major = models.ForeignKey(
        Major,
        on_delete=models.PROTECT,
        related_name='classes',
        help_text="Ngành học"
    )
    code = models.CharField(
        max_length=20, 
        unique=True, 
        db_index=True,
        help_text="Mã lớp (vd: KTPM2021, HTTT2022A)"
    )
    name = models.CharField(
        max_length=200,
        help_text="Tên lớp"
    )
    academic_year = models.PositiveIntegerField(
        help_text="Năm học/khóa (vd: 2021, 2022)"
    )
    max_students = models.PositiveIntegerField(
        default=50,
        help_text="Số sinh viên tối đa"
    )
    description = models.TextField(
        blank=True, 
        null=True,
        help_text="Mô tả về lớp"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Lớp còn hoạt động không"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'classes'
        verbose_name = 'Class'
        verbose_name_plural = 'Classes'
        ordering = ['major', '-academic_year', 'name']

    def __str__(self):
        return f"{self.code} - {self.name}"
    
    @property
    def faculty(self):
        """Get faculty through major relationship"""
        return self.major.faculty
