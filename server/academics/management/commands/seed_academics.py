from django.core.management.base import BaseCommand
from academics.models import Faculty, Major, Class


class Command(BaseCommand):
    help = 'Seed database with sample Faculty, Major, and Class data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding academics data...')
        
        # Create Faculties
        faculties_data = [
            {
                'code': 'CNTT',
                'name': 'Khoa Công nghệ thông tin',
                'description': 'Đào tạo chuyên ngành về công nghệ thông tin, kỹ thuật phần mềm, hệ thống thông tin',
            },
            {
                'code': 'KT',
                'name': 'Khoa Kinh tế',
                'description': 'Đào tạo các chuyên ngành về kinh tế, tài chính, kế toán',
            },
        ]
        
        faculties = {}
        for data in faculties_data:
            faculty, created = Faculty.objects.get_or_create(
                code=data['code'],
                defaults=data
            )
            faculties[data['code']] = faculty
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f"  Faculty {data['code']}: {status}")
        
        # Create Majors
        majors_data = [
            {
                'faculty_code': 'CNTT',
                'code': 'KTPM',
                'name': 'Kỹ thuật phần mềm',
                'description': 'Chuyên ngành về phát triển và quản lý phần mềm',
            },
            {
                'faculty_code': 'CNTT',
                'code': 'HTTT',
                'name': 'Hệ thống thông tin',
                'description': 'Chuyên ngành về phân tích và thiết kế hệ thống thông tin',
            },
            {
                'faculty_code': 'KT',
                'code': 'TCNH',
                'name': 'Tài chính ngân hàng',
                'description': 'Chuyên ngành về tài chính, ngân hàng và đầu tư',
            },
            {
                'faculty_code': 'KT',
                'code': 'KT_KT',
                'name': 'Kế toán',
                'description': 'Chuyên ngành về kế toán và kiểm toán',
            },
        ]
        
        majors = {}
        for data in majors_data:
            faculty = faculties[data.pop('faculty_code')]
            major, created = Major.objects.get_or_create(
                code=data['code'],
                defaults={**data, 'faculty': faculty}
            )
            majors[data['code']] = major
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f"  Major {data['code']}: {status}")
        
        # Create Classes
        classes_data = [
            {
                'major_code': 'KTPM',
                'code': 'KTPM2021',
                'name': 'Kỹ thuật phần mềm K21',
                'academic_year': 2021,
                'max_students': 50,
            },
            {
                'major_code': 'KTPM',
                'code': 'KTPM2022',
                'name': 'Kỹ thuật phần mềm K22',
                'academic_year': 2022,
                'max_students': 55,
            },
            {
                'major_code': 'HTTT',
                'code': 'HTTT2021',
                'name': 'Hệ thống thông tin K21',
                'academic_year': 2021,
                'max_students': 45,
            },
            {
                'major_code': 'TCNH',
                'code': 'TCNH2022',
                'name': 'Tài chính ngân hàng K22',
                'academic_year': 2022,
                'max_students': 60,
            },
        ]
        
        for data in classes_data:
            major = majors[data.pop('major_code')]
            class_obj, created = Class.objects.get_or_create(
                code=data['code'],
                defaults={**data, 'major': major}
            )
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f"  Class {data['code']}: {status}")
        
        self.stdout.write(self.style.SUCCESS('✅ Academics data seeded successfully!'))
