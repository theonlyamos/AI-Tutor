import requests
import sys
import time
import json
from datetime import datetime

class SynthesisTutorTester:
    def __init__(self, base_url="https://57b79505-0267-4dd3-995f-a062f94d5b04.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.student_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                return success, response.json() if response.content else {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test the API root endpoint"""
        success, _ = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success

    def test_create_student(self, name, grade, interests):
        """Create a student"""
        success, response = self.run_test(
            "Create Student",
            "POST",
            "students",
            200,
            data={"name": name, "grade": grade, "interests": interests}
        )
        if success and 'id' in response:
            self.student_id = response['id']
            print(f"Student created with ID: {self.student_id}")
            return True
        return False

    def test_get_student(self):
        """Get a student by ID"""
        if not self.student_id:
            print("❌ No student ID available for testing")
            return False
            
        success, _ = self.run_test(
            "Get Student",
            "GET",
            f"students/{self.student_id}",
            200
        )
        return success

    def test_process_video_frame(self, frame_data="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q=="):
        """Test processing a video frame"""
        if not self.student_id:
            print("❌ No student ID available for testing")
            return False
            
        success, response = self.run_test(
            "Process Video Frame",
            "POST",
            "process-video-frame",
            200,
            data={"student_id": self.student_id, "frame_data": frame_data}
        )
        return success, response

def main():
    # Setup
    tester = SynthesisTutorTester()
    test_timestamp = datetime.now().strftime('%H%M%S')
    
    # Run tests
    print("\n===== Testing Synthesis Tutor 2.0 API =====")
    
    # Test API root
    if not tester.test_api_root():
        print("❌ API root test failed, stopping tests")
        return 1
    
    # Test student creation
    if not tester.test_create_student(
        f"Test Student {test_timestamp}",
        "5",
        ["math", "science", "reading"]
    ):
        print("❌ Student creation failed, stopping tests")
        return 1
    
    # Test student retrieval
    if not tester.test_get_student():
        print("❌ Student retrieval failed")
        return 1
    
    # Test video frame processing
    success, response = tester.test_process_video_frame()
    if not success:
        print("❌ Video frame processing failed")
        return 1
    else:
        print(f"Video frame processing response: {json.dumps(response, indent=2)}")
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
