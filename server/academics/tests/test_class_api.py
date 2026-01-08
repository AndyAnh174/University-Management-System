"""
API Tests for Class CRUD endpoints.

Tests:
- Happy path: list, create, retrieve, update, delete
- Edge cases: duplicate code, invalid major_id, academic_year validation
- Permission: non-admin gets 403
- Filter: by major, by academic_year
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from users.models import User
from academics.models import Faculty, Major, Class


class ClassAPITestCase(TestCase):
    """Test cases for Class API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create users
        self.admin = User.objects.create_user(
            username='admin_test',
            email='admin@test.com',
            password='AdminPass123!',
            role='ADMIN'
        )
        self.student = User.objects.create_user(
            username='student_test',
            email='student@test.com',
            password='StudentPass123!',
            role='STUDENT'
        )
        
        # Create test data
        self.faculty = Faculty.objects.create(
            code='CNTT',
            name='Khoa Công nghệ thông tin'
        )
        self.major = Major.objects.create(
            faculty=self.faculty,
            code='KTPM',
            name='Kỹ thuật phần mềm'
        )
        self.major2 = Major.objects.create(
            faculty=self.faculty,
            code='HTTT',
            name='Hệ thống thông tin'
        )
        self.class_obj = Class.objects.create(
            major=self.major,
            code='KTPM2021',
            name='KTPM K21',
            academic_year=2021,
            max_students=50
        )
        
        self.list_url = reverse('class-list')
        self.detail_url = reverse('class-detail', kwargs={'pk': self.class_obj.pk})
        self.dropdown_url = reverse('class-dropdown')
        self.years_url = reverse('class-academic-years')
    
    def _auth_as_admin(self):
        self.client.force_authenticate(user=self.admin)
    
    def _auth_as_student(self):
        self.client.force_authenticate(user=self.student)
    
    # ==================== Happy Path Tests ====================
    
    def test_list_classes_as_admin(self):
        """Admin can list all classes"""
        self._auth_as_admin()
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['code'], 'KTPM2021')
        # Check nested major and faculty
        self.assertEqual(response.data['results'][0]['major']['code'], 'KTPM')
        self.assertEqual(response.data['results'][0]['faculty']['code'], 'CNTT')
    
    def test_create_class_as_admin(self):
        """Admin can create a new class"""
        self._auth_as_admin()
        data = {
            'code': 'KTPM2022',
            'name': 'KTPM K22',
            'major_id': self.major.pk,
            'academic_year': 2022,
            'max_students': 55
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['code'], 'KTPM2022')
        self.assertEqual(response.data['academic_year'], 2022)
        self.assertEqual(Class.objects.count(), 2)
    
    def test_retrieve_class_as_admin(self):
        """Admin can retrieve class detail"""
        self._auth_as_admin()
        response = self.client.get(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 'KTPM2021')
        self.assertEqual(response.data['academic_year'], 2021)
    
    def test_update_class_as_admin(self):
        """Admin can update class"""
        self._auth_as_admin()
        data = {'max_students': 60}
        response = self.client.patch(self.detail_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['max_students'], 60)
    
    def test_delete_class_as_admin(self):
        """Admin can delete class"""
        self._auth_as_admin()
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Class.objects.count(), 0)
    
    def test_academic_years_endpoint(self):
        """Can get list of available academic years"""
        self._auth_as_admin()
        
        # Create more classes with different years
        Class.objects.create(
            major=self.major,
            code='KTPM2022',
            name='KTPM K22',
            academic_year=2022
        )
        
        response = self.client.get(self.years_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(2021, response.data)
        self.assertIn(2022, response.data)
    
    # ==================== Filter Tests ====================
    
    def test_filter_by_major(self):
        """Can filter classes by major ID"""
        self._auth_as_admin()
        
        # Create class in different major
        Class.objects.create(
            major=self.major2,
            code='HTTT2021',
            name='HTTT K21',
            academic_year=2021
        )
        
        response = self.client.get(f"{self.list_url}?major={self.major.pk}")
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['code'], 'KTPM2021')
    
    def test_filter_by_academic_year(self):
        """Can filter classes by academic year"""
        self._auth_as_admin()
        
        Class.objects.create(
            major=self.major,
            code='KTPM2022',
            name='KTPM K22',
            academic_year=2022
        )
        
        response = self.client.get(f"{self.list_url}?academic_year=2021")
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['code'], 'KTPM2021')
    
    def test_filter_by_faculty(self):
        """Can filter classes by faculty ID"""
        self._auth_as_admin()
        
        response = self.client.get(f"{self.list_url}?major__faculty={self.faculty.pk}")
        self.assertEqual(len(response.data['results']), 1)
    
    def test_dropdown_filter_by_major_and_year(self):
        """Dropdown can filter by major and academic_year"""
        self._auth_as_admin()
        
        Class.objects.create(
            major=self.major,
            code='KTPM2022',
            name='KTPM K22',
            academic_year=2022
        )
        
        url = f"{self.dropdown_url}?major={self.major.pk}&academic_year=2021"
        response = self.client.get(url)
        
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['code'], 'KTPM2021')
    
    # ==================== Edge Case Tests ====================
    
    def test_create_duplicate_code_fails(self):
        """Cannot create class with duplicate code"""
        self._auth_as_admin()
        data = {
            'code': 'KTPM2021',  # Already exists
            'name': 'Another Class',
            'major_id': self.major.pk,
            'academic_year': 2021
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
    
    def test_create_with_invalid_major_fails(self):
        """Cannot create class with non-existent major"""
        self._auth_as_admin()
        data = {
            'code': 'NEW2021',
            'name': 'New Class',
            'major_id': 9999,
            'academic_year': 2021
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_with_inactive_major_fails(self):
        """Cannot create class with inactive major"""
        self._auth_as_admin()
        
        # Make major inactive
        inactive_major = Major.objects.create(
            faculty=self.faculty,
            code='INACTIVE',
            name='Inactive Major',
            is_active=False
        )
        
        data = {
            'code': 'NEW2021',
            'name': 'New Class',
            'major_id': inactive_major.pk,
            'academic_year': 2021
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_with_invalid_academic_year_fails(self):
        """Cannot create class with invalid academic year"""
        self._auth_as_admin()
        data = {
            'code': 'NEW',
            'name': 'New Class',
            'major_id': self.major.pk,
            'academic_year': 1999  # min_value=2000
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_with_invalid_max_students_fails(self):
        """Cannot create class with max_students > 500"""
        self._auth_as_admin()
        data = {
            'code': 'NEW',
            'name': 'New Class',
            'major_id': self.major.pk,
            'academic_year': 2021,
            'max_students': 999  # max_value=500
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    # ==================== Permission Tests ====================
    
    def test_list_as_non_admin_fails(self):
        """Non-admin cannot list classes"""
        self._auth_as_student()
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_as_non_admin_fails(self):
        """Non-admin cannot create class"""
        self._auth_as_student()
        data = {
            'code': 'NEW',
            'name': 'New',
            'major_id': self.major.pk,
            'academic_year': 2021
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_dropdown_as_non_admin_allowed(self):
        """Non-admin CAN access dropdown"""
        self._auth_as_student()
        response = self.client.get(self.dropdown_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_academic_years_as_non_admin_allowed(self):
        """Non-admin CAN access academic_years"""
        self._auth_as_student()
        response = self.client.get(self.years_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
