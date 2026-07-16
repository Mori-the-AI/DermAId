"""
DermAId API: Skin Lesion Classification with Explainability and Uncertainty.
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import torchvision.transforms as transforms
import torch
import io
import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model_handler import ModelHandler
from gradcam_handler import GradCAMHandler
from uncertainty_handler import UncertaintyHandler

# ==========================================
# Configuration
# ==========================================
MODEL_PATH = '../models/best_model.pth'
LABEL_MAPPING_PATH = '../models/label_mapping.json'
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# ==========================================
# Initialize Handlers
# ==========================================
print("Loading model...")
model_handler = ModelHandler(MODEL_PATH, LABEL_MAPPING_PATH, device=DEVICE)
gradcam_handler = GradCAMHandler(model_handler)
uncertainty_handler = UncertaintyHandler(model_handler, n_samples=50)
print("Model loaded successfully.")

# ==========================================
# Image Preprocessing
# ==========================================
inference_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# ==========================================
# FastAPI App
# ==========================================
app = FastAPI(
    title="DermAId API",
    description="Skin Lesion Classification with Grad-CAM++ Explainability and MC Dropout Uncertainty",
    version="1.0.0"
)

# CORS - Allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "DermAId API is running",
        "endpoints": {
            "predict": "/predict",
            "explain": "/explain",
            "uncertainty": "/uncertainty",
            "full_analysis": "/full-analysis"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "device": str(DEVICE)}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Classify a skin lesion image.
    Returns class probabilities and top prediction.
    """
    # Validate file

    
    # Read and preprocess
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    image_tensor = inference_transform(image).unsqueeze(0)
    
    # Predict
    result = model_handler.predict(image_tensor)
    
    return JSONResponse(result)


@app.post("/explain")
async def explain(file: UploadFile = File(...), target_class: int = None):
    """
    Generate Grad-CAM++ heatmap for model explainability.
    Optionally specify target_class, otherwise uses predicted class.
    """

    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    image_tensor = inference_transform(image).unsqueeze(0)
    
    # Generate heatmap
    result = gradcam_handler.generate(image_tensor, target_class)
    
    return JSONResponse(result)


@app.post("/uncertainty")
async def uncertainty(file: UploadFile = File(...)):
    """
    Estimate prediction uncertainty using Monte Carlo Dropout.
    """

    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    image_tensor = inference_transform(image).unsqueeze(0)
    
    # Estimate uncertainty
    result = uncertainty_handler.estimate(image_tensor)
    
    return JSONResponse(result)


@app.post("/full-analysis")
async def full_analysis(file: UploadFile = File(...)):
    """
    Complete analysis: prediction, Grad-CAM heatmap, and uncertainty.
    """

    
    # Read and preprocess
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    image_tensor = inference_transform(image).unsqueeze(0)
    
    # Run all analyses
    prediction = model_handler.predict(image_tensor)
    heatmap_result = gradcam_handler.generate(image_tensor)
    uncertainty_result = uncertainty_handler.estimate(image_tensor)
    
    return JSONResponse({
        'prediction': prediction,
        'explainability': heatmap_result,
        'uncertainty': uncertainty_result
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)