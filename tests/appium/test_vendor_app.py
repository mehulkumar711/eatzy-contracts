import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy

# This is a placeholder test to be run in Firebase Test Lab (FTL)
# FTL will provide the app_path and capabilities

@pytest.fixture(scope="function")
def driver(app_path):
    options = UiAutomator2Options()
    options.app = app_path
    options.automation_name = "UiAutomator2"
    
    # FTL provides this URL
    driver = webdriver.Remote("http://localhost:4723", options=options)
    yield driver
    driver.quit()

def test_app_launches_successfully(driver):
    """
    P0 Smoke Test: Does the app even launch?
    """
    # Look for a known element on the login screen
    # Use accessibility_id for robust testing
    login_button = driver.find_element(by=AppiumBy.ACCESSIBILITY_ID, value="login-button")
    assert login_button.is_displayed()

def test_vendor_toggle_offline_state(driver):
    """
    P1 Test: Can the vendor see their 'Go Online' toggle?
    (Assumes app is already logged in for this test variant)
    """
    # 1. Login (omitted for brevity)
    
    # 2. Find the main toggle
    online_toggle = driver.find_element(by=AppiumBy.ACCESSIBILITY_ID, value="vendor-online-toggle")
    assert online_toggle.is_displayed()
    assert online_toggle.text == "Go Online"