"""
Model Handler: Loads the trained DermAId model and provides inference.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models
from torchvision.models import DenseNet121_Weights
import json
import os


class DermAIdModel(nn.Module):
    """Same architecture used during training."""
    
    def __init__(self, num_classes=7, dropout_rate=0.3):
        super(DermAIdModel, self).__init__()
        self.backbone = models.densenet121(weights=None)  # Weights loaded from checkpoint
        in_features = self.backbone.classifier.in_features
        self.classifier = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate),
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate),
            nn.Linear(256, num_classes)
        )
    
    def forward(self, x):
        features = self.backbone.features(x)
        features = F.adaptive_avg_pool2d(features, (1, 1))
        features = torch.flatten(features, 1)
        logits = self.classifier(features)
        return logits
    
    def get_features(self, x):
        """Return features before pooling (for Grad-CAM)."""
        features = self.backbone.features(x)
        pooled = F.adaptive_avg_pool2d(features, (1, 1))
        pooled = torch.flatten(pooled, 1)
        logits = self.classifier(pooled)
        return features, logits


class ModelHandler:
    """Handles model loading, preprocessing, and inference."""
    
    def __init__(self, model_path, label_mapping_path, device=None):
        self.device = device or torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load label mapping
        with open(label_mapping_path, 'r') as f:
            self.label_mapping = json.load(f)
        self.class_names = self.label_mapping['class_names']
        self.idx_to_label = self.label_mapping['idx_to_label']
        
        # Load model
        self.model = DermAIdModel(num_classes=7, dropout_rate=0.3)
        checkpoint = torch.load(model_path, map_location=self.device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model = self.model.to(self.device)
        self.model.eval()
        
        print(f"Model loaded on {self.device}. Best val acc: {checkpoint.get('val_acc', 'N/A')}")
    
    def predict(self, image_tensor):
        """
        Run single inference.
        
        Args:
            image_tensor: (1, 3, 224, 224) preprocessed tensor
        
        Returns:
            dict with class probabilities and prediction
        """
        with torch.no_grad():
            logits = self.model(image_tensor.to(self.device))
            probs = F.softmax(logits, dim=1)
            
        probs_np = probs.cpu().numpy()[0]
        pred_class = int(probs_np.argmax())
        confidence = float(probs_np.max())
        
        # Build response
        predictions = []
        for i in range(7):
            class_code = self.idx_to_label[str(i)]
            predictions.append({
                'class_id': i,
                'class_code': class_code,
                'class_name': self.class_names[class_code],
                'probability': float(probs_np[i])
            })
        
        predictions.sort(key=lambda x: x['probability'], reverse=True)
        
        return {
            'predicted_class_id': pred_class,
            'predicted_class_code': self.idx_to_label[str(pred_class)],
            'predicted_class_name': self.class_names[self.idx_to_label[str(pred_class)]],
            'confidence': confidence,
            'all_predictions': predictions
        }
    
    def get_features(self, image_tensor):
        """Return features for Grad-CAM."""
        return self.model.get_features(image_tensor.to(self.device))