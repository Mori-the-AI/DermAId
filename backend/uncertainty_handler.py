"""
Monte Carlo Dropout Handler: Estimates prediction uncertainty.
"""
import torch
import torch.nn.functional as F
import numpy as np
from collections import Counter


class UncertaintyHandler:
    """Handles uncertainty estimation via MC Dropout."""
    
    def __init__(self, model_handler, n_samples=50):
        self.model_handler = model_handler
        self.model = model_handler.model
        self.device = model_handler.device
        self.n_samples = n_samples
    
    def _enable_dropout(self):
        """Enable dropout at inference time."""
        for module in self.model.modules():
            if isinstance(module, torch.nn.Dropout):
                module.train()
    
    def estimate(self, image_tensor):
        """
        Run MC Dropout inference.
        
        Args:
            image_tensor: (1, 3, 224, 224) tensor
        
        Returns:
            dict with uncertainty metrics
        """
        self._enable_dropout()
        
        image_tensor = image_tensor.to(self.device)
        all_probs = []
        all_preds = []
        
        with torch.no_grad():
            for _ in range(self.n_samples):
                logits = self.model(image_tensor)
                probs = F.softmax(logits, dim=1)
                pred = logits.argmax(dim=1).item()
                all_probs.append(probs.cpu().numpy()[0])
                all_preds.append(pred)
        
        all_probs = np.array(all_probs)
        
        # Statistics
        mean_probs = all_probs.mean(axis=0)
        std_probs = all_probs.std(axis=0)
        
        # Most common prediction
        pred_counts = Counter(all_preds)
        most_common_pred = pred_counts.most_common(1)[0][0]
        agreement = pred_counts[most_common_pred] / self.n_samples
        
        # Uncertainty metrics
        predictive_entropy = float(-np.sum(mean_probs * np.log(mean_probs + 1e-8)))
        expected_entropy = float(-np.mean(np.sum(all_probs * np.log(all_probs + 1e-8), axis=1)))
        mutual_information = predictive_entropy - expected_entropy
        
        # Uncertainty level
        if std_probs[most_common_pred] > 0.15 or agreement < 0.8:
            uncertainty_level = "high"
        elif std_probs[most_common_pred] > 0.08:
            uncertainty_level = "moderate"
        else:
            uncertainty_level = "low"
        
        # Per-class stats
        class_uncertainty = []
        for i in range(7):
            class_uncertainty.append({
                'class_id': i,
                'mean_probability': float(mean_probs[i]),
                'std_probability': float(std_probs[i])
            })
        
        return {
            'most_common_prediction': int(most_common_pred),
            'mean_confidence': float(mean_probs[most_common_pred]),
            'std_confidence': float(std_probs[most_common_pred]),
            'agreement_rate': float(agreement),
            'predictive_entropy': predictive_entropy,
            'mutual_information': mutual_information,
            'uncertainty_level': uncertainty_level,
            'class_uncertainty': class_uncertainty,
            'n_samples': self.n_samples
        }