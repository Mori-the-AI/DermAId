"""
Quick test script for the DermAId API.
Run this after starting the server to verify everything works.
"""
import requests
import os

BASE_URL = "http://localhost:8000"

# Find a test image
data_dir = '../data'
test_image = None
for f in os.listdir(data_dir):
    if f.endswith('.jpg'):
        test_image = os.path.join(data_dir, f)
        break

if not test_image:
    print("No test image found!")
    exit()

print(f"Testing with: {test_image}")

# Test health endpoint
print("\n1. Testing /health...")
r = requests.get(f"{BASE_URL}/health")
print(f"   Response: {r.json()}")

# Test prediction
print("\n2. Testing /predict...")
with open(test_image, 'rb') as f:
    r = requests.post(f"{BASE_URL}/predict", files={'file': f})
if r.status_code == 200:
    data = r.json()
    print(f"   Predicted: {data['predicted_class_name']}")
    print(f"   Confidence: {data['confidence']:.2%}")
else:
    print(f"   Error: {r.status_code}")

# Test explain
print("\n3. Testing /explain...")
with open(test_image, 'rb') as f:
    r = requests.post(f"{BASE_URL}/explain", files={'file': f})
if r.status_code == 200:
    data = r.json()
    print(f"   Heatmap shape: {data['heatmap_shape']}")
    print(f"   Confidence: {data['confidence']:.2%}")
else:
    print(f"   Error: {r.status_code}")

# Test uncertainty
print("\n4. Testing /uncertainty...")
with open(test_image, 'rb') as f:
    r = requests.post(f"{BASE_URL}/uncertainty", files={'file': f})
if r.status_code == 200:
    data = r.json()
    print(f"   Uncertainty level: {data['uncertainty_level']}")
    print(f"   Agreement: {data['agreement_rate']:.1%}")
    print(f"   Mean confidence: {data['mean_confidence']:.3f} ± {data['std_confidence']:.3f}")
else:
    print(f"   Error: {r.status_code}")

# Test full analysis
print("\n5. Testing /full-analysis...")
with open(test_image, 'rb') as f:
    r = requests.post(f"{BASE_URL}/full-analysis", files={'file': f})
if r.status_code == 200:
    data = r.json()
    print(f"   Prediction: {data['prediction']['predicted_class_name']}")
    print(f"   Uncertainty: {data['uncertainty']['uncertainty_level']}")
    print("   ✓ Full analysis working!")
else:
    print(f"   Error: {r.status_code}")

print("\n✓ API tests complete!")