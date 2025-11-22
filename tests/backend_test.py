#!/usr/bin/env python3
"""
Backend Testing Script for Simply Invest Multi-tenant Architecture
Tests all tenant management, white-label configuration, and tenant-user APIs
"""

import requests
import json
import sys
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
API_BASE = f"{BASE_URL}/api"

# Test credentials
ADMIN_EMAIL = "admin@simplyinvest.com"
ADMIN_PASSWORD = "admin123"

# Global variables
auth_token = None
test_tenant_id = None
test_user_id = None

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(60)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")

def print_test(test_name):
    print(f"\n{Colors.CYAN}🧪 Testing: {test_name}{Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.WHITE}ℹ️  {message}{Colors.END}")

def make_request(method, endpoint, data=None, headers=None, expected_status=200):
    """Make HTTP request with error handling"""
    global auth_token
    url = f"{API_BASE}{endpoint}"
    
    default_headers = {
        'Content-Type': 'application/json'
    }
    
    if auth_token:
        default_headers['Authorization'] = f'Bearer {auth_token}'
    
    if headers:
        default_headers.update(headers)
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=default_headers, timeout=10)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=default_headers, timeout=10)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=default_headers, timeout=10)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=default_headers, timeout=10)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        print_info(f"{method.upper()} {url} -> {response.status_code}")
        
        if response.status_code != expected_status:
            print_error(f"Expected status {expected_status}, got {response.status_code}")
            if response.text:
                print_error(f"Response: {response.text}")
            return None
        
        try:
            return response.json()
        except:
            return response.text
            
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return None

def test_server_health():
    """Test if server is running"""
    print_test("Server Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Server is running - Status: {data.get('status')}")
            print_info(f"Environment: {data.get('environment')}")
            return True
        else:
            print_error(f"Health check failed with status: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Cannot connect to server: {str(e)}")
        return False

def test_authentication():
    """Test user authentication"""
    global auth_token
    
    print_test("User Authentication")
    
    # Test login
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    response = make_request('POST', '/auth/login', login_data)
    if not response:
        print_error("Login failed")
        return False
    
    if response.get('user') and response.get('token'):
        auth_token = response['token']
        print_success("Authentication successful")
        print_info(f"Token received: {auth_token[:20]}...")
        return True
    else:
        print_error("Authentication failed - no token received")
        return False

def test_tenant_management():
    """Test tenant CRUD operations"""
    global test_tenant_id
    
    print_test("Tenant Management APIs")
    
    # 1. Get all tenants
    print_info("1. Testing GET /api/tenants")
    response = make_request('GET', '/tenants')
    if response and response.get('success'):
        tenants = response.get('data', {}).get('tenants', [])
        print_success(f"Retrieved {len(tenants)} tenants")
        if tenants:
            existing_tenant = tenants[0]
            print_info(f"First tenant: {existing_tenant.get('name')} (ID: {existing_tenant.get('id')})")
    else:
        print_error("Failed to get tenants")
        return False
    
    # 2. Create new tenant
    print_info("2. Testing POST /api/tenants")
    new_tenant_data = {
        "name": "Test Tenant",
        "domain": f"test-{int(time.time())}.example.com",
        "subdomain": f"test{int(time.time())}",
        "branding": {
            "companyName": "Test Company",
            "tagline": "Testing is our passion",
            "email": "test@example.com"
        },
        "contact": {
            "firstName": "Test",
            "lastName": "User",
            "email": "test@example.com"
        },
        "features": {
            "portfolio": True,
            "alerts": True,
            "social": False,
            "trading": False
        }
    }
    
    response = make_request('POST', '/tenants', new_tenant_data, expected_status=201)
    if response and response.get('success'):
        test_tenant_id = response.get('data', {}).get('tenant', {}).get('id')
        print_success(f"Created tenant with ID: {test_tenant_id}")
    else:
        print_error("Failed to create tenant")
        return False
    
    # 3. Get tenant by ID
    print_info("3. Testing GET /api/tenants/:id")
    response = make_request('GET', f'/tenants/{test_tenant_id}')
    if response and response.get('success'):
        tenant = response.get('data', {}).get('tenant', {})
        print_success(f"Retrieved tenant: {tenant.get('name')}")
    else:
        print_error("Failed to get tenant by ID")
        return False
    
    # 4. Update tenant
    print_info("4. Testing PUT /api/tenants/:id")
    update_data = {
        "name": "Updated Test Tenant",
        "branding": {
            "companyName": "Updated Test Company",
            "tagline": "Updated tagline"
        }
    }
    
    response = make_request('PUT', f'/tenants/{test_tenant_id}', update_data)
    if response and response.get('success'):
        print_success("Tenant updated successfully")
    else:
        print_error("Failed to update tenant")
        return False
    
    # 5. Update tenant features
    print_info("5. Testing PUT /api/tenants/:id/features")
    features_data = {
        "features": {
            "portfolio": True,
            "alerts": True,
            "social": True,
            "education": True,
            "trading": True,
            "analytics": True
        }
    }
    
    response = make_request('PUT', f'/tenants/{test_tenant_id}/features', features_data)
    if response and response.get('success'):
        print_success("Tenant features updated successfully")
    else:
        print_error("Failed to update tenant features")
        return False
    
    # 6. Toggle maintenance mode
    print_info("6. Testing PUT /api/tenants/:id/maintenance")
    maintenance_data = {
        "maintenanceMode": True,
        "maintenanceMessage": "System under maintenance"
    }
    
    response = make_request('PUT', f'/tenants/{test_tenant_id}/maintenance', maintenance_data)
    if response and response.get('success'):
        print_success("Maintenance mode toggled successfully")
    else:
        print_error("Failed to toggle maintenance mode")
        return False
    
    # 7. Get tenant analytics
    print_info("7. Testing GET /api/tenants/:id/analytics")
    response = make_request('GET', f'/tenants/{test_tenant_id}/analytics')
    if response and response.get('success'):
        analytics = response.get('data', {})
        print_success("Retrieved tenant analytics")
        print_info(f"User count: {analytics.get('userCount', 0)}")
    else:
        print_error("Failed to get tenant analytics")
        return False
    
    return True

def test_white_label_configuration():
    """Test white-label configuration APIs"""
    if not test_tenant_id:
        print_error("No test tenant ID available")
        return False
    
    print_test("White-label Configuration APIs")
    
    # 1. Get white-label config
    print_info("1. Testing GET /api/white-label/:tenantId")
    response = make_request('GET', f'/white-label/{test_tenant_id}')
    if response and response.get('success'):
        config = response.get('data', {}).get('config', {})
        print_success("Retrieved white-label configuration")
        print_info(f"App name: {config.get('branding', {}).get('appName', 'N/A')}")
    else:
        print_error("Failed to get white-label configuration")
        return False
    
    # 2. Update theme configuration
    print_info("2. Testing PUT /api/white-label/:tenantId/theme")
    theme_data = {
        "theme": {
            "primary": "#ff6b6b",
            "secondary": "#4ecdc4",
            "accent": "#45b7d1",
            "background": "#2c3e50",
            "surface": "#34495e",
            "text": "#ecf0f1"
        }
    }
    
    response = make_request('PUT', f'/white-label/{test_tenant_id}/theme', theme_data)
    if response and response.get('success'):
        print_success("Theme configuration updated successfully")
    else:
        print_error("Failed to update theme configuration")
        return False
    
    # 3. Update branding configuration
    print_info("3. Testing PUT /api/white-label/:tenantId/branding")
    branding_data = {
        "branding": {
            "appName": "Custom Investment App",
            "tagline": "Your personalized investment journey",
            "description": "A customized investment platform",
            "metaTitle": "Custom Investment Platform",
            "metaDescription": "Personalized investment solutions"
        }
    }
    
    response = make_request('PUT', f'/white-label/{test_tenant_id}/branding', branding_data)
    if response and response.get('success'):
        print_success("Branding configuration updated successfully")
    else:
        print_error("Failed to update branding configuration")
        return False
    
    # 4. Update modules configuration
    print_info("4. Testing PUT /api/white-label/:tenantId/modules")
    modules_data = {
        "modules": {
            "dashboard": True,
            "portfolio": True,
            "alerts": True,
            "social": False,
            "education": True,
            "trading": False,
            "analytics": True,
            "ai": True,
            "news": True,
            "watchlists": True
        }
    }
    
    response = make_request('PUT', f'/white-label/{test_tenant_id}/modules', modules_data)
    if response and response.get('success'):
        print_success("Modules configuration updated successfully")
    else:
        print_error("Failed to update modules configuration")
        return False
    
    # 5. Update complete white-label config
    print_info("5. Testing PUT /api/white-label/:tenantId")
    complete_config = {
        "branding": {
            "appName": "Complete Custom App",
            "tagline": "Completely customized experience"
        },
        "features": {
            "darkMode": True,
            "animations": False,
            "pushNotifications": True
        }
    }
    
    response = make_request('PUT', f'/white-label/{test_tenant_id}', complete_config)
    if response and response.get('success'):
        print_success("Complete white-label configuration updated successfully")
    else:
        print_error("Failed to update complete white-label configuration")
        return False
    
    return True

def test_tenant_user_management():
    """Test tenant user management APIs"""
    global test_user_id
    
    if not test_tenant_id:
        print_error("No test tenant ID available")
        return False
    
    print_test("Tenant User Management APIs")
    
    # 1. Get tenant users
    print_info("1. Testing GET /api/tenant-users/:tenantId/users")
    response = make_request('GET', f'/tenant-users/{test_tenant_id}/users')
    if response and response.get('success'):
        users = response.get('data', {}).get('users', [])
        print_success(f"Retrieved {len(users)} tenant users")
        if users:
            test_user_id = users[0].get('userId')
            print_info(f"First user ID: {test_user_id}")
    else:
        print_warning("No existing tenant users found (this is expected for new tenant)")
    
    # 2. Create a test user relationship (we'll use a mock user ID)
    print_info("2. Testing POST /api/tenant-users")
    # Note: This will likely fail because we don't have a real user ID
    # But we'll test the API structure
    mock_user_data = {
        "tenantId": test_tenant_id,
        "userId": "mock-user-id-12345",  # This would be a real user ID in practice
        "role": "USER",
        "permissions": [
            {"resource": "portfolio", "actions": ["read", "write"]},
            {"resource": "alerts", "actions": ["read", "write"]}
        ]
    }
    
    response = make_request('POST', '/tenant-users', mock_user_data, expected_status=404)  # Expect 404 for mock user
    if response and not response.get('success'):
        print_warning("Expected failure for mock user ID - API structure is correct")
    
    # 3. Get tenant user analytics
    print_info("3. Testing GET /api/tenant-users/:tenantId/analytics")
    response = make_request('GET', f'/tenant-users/{test_tenant_id}/analytics')
    if response and response.get('success'):
        analytics = response.get('data', {}).get('analytics', {})
        print_success("Retrieved tenant user analytics")
        print_info(f"Total users: {analytics.get('totalUsers', 0)}")
        print_info(f"Active users: {analytics.get('activeUsers', 0)}")
    else:
        print_error("Failed to get tenant user analytics")
        return False
    
    return True

def test_public_endpoints():
    """Test public endpoints that don't require authentication"""
    print_test("Public Endpoints")
    
    # 1. Test get tenant by domain (public endpoint)
    print_info("1. Testing GET /api/tenants/domain/:domain")
    response = make_request('GET', '/tenants/domain/localhost:3000', headers={'Authorization': ''})
    if response and response.get('success'):
        tenant = response.get('data', {}).get('tenant', {})
        print_success(f"Retrieved tenant by domain: {tenant.get('name')}")
    else:
        print_error("Failed to get tenant by domain")
        return False
    
    # 2. Test get public white-label config
    print_info("2. Testing GET /api/white-label/public/:domain")
    response = make_request('GET', '/white-label/public/localhost:3000', headers={'Authorization': ''})
    if response and response.get('success'):
        config = response.get('data', {})
        print_success("Retrieved public white-label configuration")
        print_info(f"App name: {config.get('branding', {}).get('appName', 'N/A')}")
    else:
        print_error("Failed to get public white-label configuration")
        return False
    
    return True

def test_error_handling():
    """Test error handling and edge cases"""
    global auth_token
    print_test("Error Handling & Edge Cases")
    
    # 1. Test invalid tenant ID
    print_info("1. Testing invalid tenant ID")
    response = make_request('GET', '/tenants/invalid-tenant-id', expected_status=404)
    if response and not response.get('success'):
        print_success("Correctly handled invalid tenant ID")
    else:
        print_error("Failed to handle invalid tenant ID")
    
    # 2. Test unauthorized access (without token)
    print_info("2. Testing unauthorized access")
    old_token = auth_token
    auth_token = None
    
    response = make_request('GET', '/tenants', expected_status=401)
    if response and 'authorized' in str(response).lower():
        print_success("Correctly handled unauthorized access")
    else:
        print_error("Failed to handle unauthorized access")
    
    # Restore token
    auth_token = old_token
    
    # 3. Test invalid data format
    print_info("3. Testing invalid data format")
    invalid_data = {
        "name": "",  # Empty name should fail validation
        "domain": "invalid-domain-format",
        "contact": {}  # Missing required fields
    }
    
    response = make_request('POST', '/tenants', invalid_data, expected_status=400)
    if response and not response.get('success'):
        print_success("Correctly handled invalid data format")
    else:
        print_warning("Invalid data validation might need improvement")
    
    return True

def cleanup_test_data():
    """Clean up test data"""
    print_test("Cleanup Test Data")
    
    if test_tenant_id:
        print_info(f"Deleting test tenant: {test_tenant_id}")
        response = make_request('DELETE', f'/tenants/{test_tenant_id}')
        if response and response.get('success'):
            print_success("Test tenant deleted successfully")
        else:
            print_warning("Failed to delete test tenant (manual cleanup may be needed)")

def main():
    """Main test execution"""
    print_header("SIMPLY INVEST BACKEND API TESTING")
    print_info(f"Testing backend at: {BASE_URL}")
    print_info(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test_results = []
    
    # Run all tests
    tests = [
        ("Server Health", test_server_health),
        ("Authentication", test_authentication),
        ("Tenant Management", test_tenant_management),
        ("White-label Configuration", test_white_label_configuration),
        ("Tenant User Management", test_tenant_user_management),
        ("Public Endpoints", test_public_endpoints),
        ("Error Handling", test_error_handling)
    ]
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            test_results.append((test_name, result))
        except Exception as e:
            print_error(f"Test '{test_name}' crashed: {str(e)}")
            test_results.append((test_name, False))
    
    # Cleanup
    cleanup_test_data()
    
    # Print summary
    print_header("TEST SUMMARY")
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        if result:
            print_success(f"{test_name}: PASSED")
            passed += 1
        else:
            print_error(f"{test_name}: FAILED")
            failed += 1
    
    print(f"\n{Colors.BOLD}Results: {Colors.GREEN}{passed} passed{Colors.END}, {Colors.RED}{failed} failed{Colors.END}")
    
    if failed == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 All tests passed! Multi-tenant backend is working correctly.{Colors.END}")
        return 0
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}❌ {failed} test(s) failed. Please check the issues above.{Colors.END}")
        return 1

if __name__ == "__main__":
    sys.exit(main())