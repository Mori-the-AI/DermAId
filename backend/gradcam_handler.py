"""
Grad-CAM++ Handler: Generates heatmaps for model explainability.
"""
import torch
import torch.nn.functional as F
import numpy as np


class GradCAMHandler:
    """Handles Grad-CAM++ heatmap generation."""
    
    def __init__(self, model_handler):
        self.model_handler = model_handler
        self.model = model_handler.model
        self.device = model_handler.device
        self.activations = None
        self.gradients = None
        self._register_hooks()
    
    def _register_hooks(self):
        """Register hooks on the last layer of DenseNet backbone."""
        def forward_hook(module, input, output):
            self.activations = output.detach()
        
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()
        
        target_layer = self.model.backbone.features[-1]
        target_layer.register_forward_hook(forward_hook)
        target_layer.register_full_backward_hook(backward_hook)
    
    def generate(self, image_tensor, target_class=None):
        """
        Generate Grad-CAM++ heatmap.
        
        Args:
            image_tensor: (1, 3, 224, 224) tensor
            target_class: Target class. If None, uses predicted class.
        
        Returns:
            dict with heatmap data and prediction info
        """
        image_tensor = image_tensor.to(self.device)
        image_tensor.requires_grad = True
        
        # Forward pass
        self.model.zero_grad()
        features, logits = self.model_handler.get_features(image_tensor)
        
        if target_class is None:
            target_class = logits.argmax(dim=1).item()
        
        # Confidence
        probs = F.softmax(logits, dim=1)
        confidence = float(probs[0, target_class].item())
        
        # Backward pass
        one_hot = torch.zeros_like(logits)
        one_hot[0, target_class] = 1
        logits.backward(gradient=one_hot, retain_graph=True)
        
        # Get gradients and activations
        gradients = self.gradients
        activations = self.activations
        
        # Grad-CAM++ weights
        grad = gradients[0]
        grad_power_2 = grad ** 2
        grad_power_3 = grad ** 3
        
        sum_grad = grad.sum(dim=(1, 2))
        sum_grad_power_2 = grad_power_2.sum(dim=(1, 2))
        
        alpha = sum_grad_power_2 / (2 * sum_grad_power_2 + sum_grad.sum() * grad_power_3.sum(dim=(1, 2)) + 1e-8)
        alpha = F.relu(alpha)
        
        weights = alpha.view(-1, 1, 1) * F.relu(grad)
        heatmap = (weights * activations[0]).sum(dim=0)
        heatmap = F.relu(heatmap)
        
        # Normalize
        heatmap = heatmap.cpu().detach().numpy()
        if heatmap.max() > 0:
            heatmap = heatmap / heatmap.max()
        
        # Convert to list for JSON response
        # We'll downsample to reduce payload size
        heatmap_small = heatmap[::2, ::2].tolist()
        
        return {
            'heatmap': heatmap_small,
            'heatmap_shape': list(heatmap.shape),
            'target_class': int(target_class),
            'confidence': confidence
        }