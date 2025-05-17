import requests
import sys
import uuid
from datetime import datetime

class SynthesisTutorAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.student_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
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
                if response.text:
                    try:
                        return success, response.json()
                    except:
                        return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.text:
                    print(f"Response: {response.text}")

            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test the API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success

    def test_create_student(self, name, grade, interests):
        """Test creating a student profile"""
        success, response = self.run_test(
            "Create Student",
            "POST",
            "students",
            200,
            data={"name": name, "grade": grade, "interests": interests}
        )
        if success and 'id' in response:
            self.student_id = response['id']
            print(f"Created student with ID: {self.student_id}")
            return True
        return False

    def test_get_student(self):
        """Test retrieving a student profile"""
        if not self.student_id:
            print("❌ No student ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Student",
            "GET",
            f"students/{self.student_id}",
            200
        )
        return success

    def test_send_message(self, content):
        """Test sending a message"""
        if not self.student_id:
            print("❌ No student ID available for testing")
            return False
            
        success, response = self.run_test(
            "Send Message",
            "POST",
            "messages",
            200,
            data={"student_id": self.student_id, "content": content, "role": "student"}
        )
        return success

    def test_get_messages(self):
        """Test retrieving messages for a student"""
        if not self.student_id:
            print("❌ No student ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Messages",
            "GET",
            f"messages/{self.student_id}",
            200
        )
        return success

    def test_chat_with_tutor(self, message):
        """Test the chat with tutor functionality"""
        if not self.student_id:
            print("❌ No student ID available for testing")
            return False
            
        success, response = self.run_test(
            "Chat with Tutor",
            "POST",
            "chat",
            200,
            data={"student_id": self.student_id, "message": message, "context": []}
        )
        if success:
            print(f"Tutor response: {response.get('response', 'No response')}")
        return success

    def test_get_modules(self):
        """Test retrieving learning modules"""
        success, response = self.run_test(
            "Get Modules",
            "GET",
            "modules",
            200
        )
        if success and isinstance(response, list):
            print(f"Retrieved {len(response)} modules")
            for module in response:
                print(f"  - {module.get('name')}: {module.get('subject')} (Difficulty: {module.get('difficulty')})")
        return success

    def test_update_progress(self, module_id, module_name, completed=True, score=100):
        """Test updating progress for a module"""
        if not self.student_id:
            print("❌ No student ID available for testing")
            return False
            
        success, response = self.run_test(
            "Update Progress",
            "POST",
            "progress",
            200,
            data={
                "student_id": self.student_id,
                "module_id": module_id,
                "module_name": module_name,
                "completed": completed,
                "score": score
            }
        )
        return success

    def test_get_progress(self):
        """Test retrieving progress for a student"""
        if not self.student_id:
            print("❌ No student ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Progress",
            "GET",
            f"progress/{self.student_id}",
            200
        )
        if success and isinstance(response, list):
            print(f"Retrieved progress for {len(response)} modules")
            for progress in response:
                print(f"  - {progress.get('module_name')}: Completed: {progress.get('completed')}, Score: {progress.get('score')}")
        return success

def main():
    # Get the backend URL from the frontend .env file
    backend_url = "https://57b79505-0267-4dd3-995f-a062f94d5b04.preview.emergentagent.com"
    
    # Setup
    tester = SynthesisTutorAPITester(backend_url)
    test_student_name = f"Test Student {uuid.uuid4().hex[:8]}"
    test_grade = "5"
    test_interests = ["Math", "Science", "Reading"]

    # Run tests
    print("\n===== TESTING SYNTHESIS TUTOR 2.0 API =====\n")
    
    # Test API root
    tester.test_api_root()
    
    # Test student creation and retrieval
    if not tester.test_create_student(test_student_name, test_grade, test_interests):
        print("❌ Student creation failed, stopping tests")
        return 1
    
    tester.test_get_student()
    
    # Test messaging
    tester.test_send_message("Hello, I'm a test message!")
    tester.test_get_messages()
    
    # Test chat with tutor
    tester.test_chat_with_tutor("What can you teach me about fractions?")
    
    # Test modules
    if not tester.test_get_modules():
        print("❌ Module retrieval failed, stopping tests")
        return 1
    
    # Get modules to use for progress testing
    modules_response = requests.get(f"{backend_url}/api/modules")
    if modules_response.status_code == 200:
        modules = modules_response.json()
        if modules and len(modules) > 0:
            test_module = modules[0]
            # Test progress tracking
            tester.test_update_progress(
                test_module['id'],
                test_module['name'],
                completed=True,
                score=85
            )
            tester.test_get_progress()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())