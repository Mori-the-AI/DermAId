# DermAId — Explainable AI for Skin Lesion Diagnosis

**Research Prototype — Not for Clinical Use**

DermAId is a full-stack AI system for skin lesion classification that combines deep learning with explainability and uncertainty quantification. It classifies dermoscopic images into 7 diagnostic categories and shows *why* it made each prediction using Grad-CAM++ heatmaps, while quantifying prediction confidence using Monte Carlo Dropout.

Built as a final-year software engineering project demonstrating the full pipeline from model training to production-ready web and mobile applications.

---

## Features

- **7-Class Skin Lesion Classification** — Melanoma, Basal Cell Carcinoma, Benign Keratosis, Dermatofibroma, Melanocytic Nevus, Actinic Keratosis, Vascular Lesion
- **Grad-CAM++ Explainability** — Visual heatmaps showing which image regions influenced the diagnosis
- **Monte Carlo Dropout Uncertainty** — Quantifies prediction confidence with 50-sample inference
- **Risk-Aware UI** — Highlights HIGH RISK / ELEVATED RISK / LOW RISK based on malignancy probability
- **Differential Diagnosis** — Full probability breakdown across all 7 classes
- **Web Dashboard** — React + Tailwind CSS with dark medical theme
- **Mobile App** — React Native with native camera capture for point-of-care use
- **REST API** — FastAPI backend serving prediction, explainability, and uncertainty endpoints
- **Limitations & Bias Disclosure** — Built-in documentation of known limitations, demographic bias, and regulatory context

---

## Architecture

```
dermaid/
├── data/                          # HAM10000 dataset (10,015 images)
├── models/                        # Trained model checkpoints & label mappings
├── notebooks/
│   ├── 01_exploratory_data_analysis.ipynb
│   ├── 02_preprocessing_pipeline.ipynb
│   ├── 03_model_training.ipynb
│   └── 04_gradcam_explainability.ipynb
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── model_handler.py           # Model loading & inference
│   ├── gradcam_handler.py         # Grad-CAM++ heatmap generation
│   ├── uncertainty_handler.py     # MC Dropout uncertainty estimation
│   └── requirements.txt
├── frontend/                      # React web application
│   └── src/
│       ├── App.js
│       ├── services/api.js
│       └── components/
│           ├── PredictionCard.jsx
│           ├── HeatmapViewer.jsx
│           ├── UncertaintyPanel.jsx
│           └── LimitationsPanel.jsx
├── mobile/                        # React Native mobile application
│   ├── App.js
│   └── src/
│       ├── services/api.js
│       └── components/
│           ├── PredictionCard.jsx
│           ├── HeatmapViewer.jsx
│           ├── UncertaintyPanel.jsx
│           └── LimitationsPanel.jsx
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| **Model** | PyTorch, DenseNet-121 (pretrained on ImageNet) |
| **Explainability** | Grad-CAM++ (custom implementation) |
| **Uncertainty** | Monte Carlo Dropout (50 stochastic forward passes) |
| **Backend API** | FastAPI, Uvicorn |
| **Web Frontend** | React, Tailwind CSS, Recharts, Lucide Icons |
| **Mobile App** | React Native, Expo, Expo Camera |
| **Dataset** | HAM10000 (ISIC Archive) |

---

## Model Performance

| Metric | Value |
|:---|:---|
| **Test Accuracy** | 82.5% |
| **Number of Classes** | 7 |
| **Training Samples** | 7,235 |
| **Validation Samples** | 1,277 |
| **Test Samples** | 1,503 |
| **Architecture** | DenseNet-121 with custom classification head |
| **Training Strategy** | Two-phase: head training → full fine-tuning |
| **Class Imbalance Handling** | WeightedRandomSampler + class-weighted loss |

**Per-Class F1 Scores:**

| Class | F1 Score |
|:---|:---|
| Melanocytic Nevus | ~0.88 |
| Melanoma | ~0.75 |
| Basal Cell Carcinoma | ~0.80 |
| Benign Keratosis | ~0.78 |
| Actinic Keratosis | ~0.72 |
| Vascular Lesion | ~0.70 |
| Dermatofibroma | ~0.65 |

> ⚠️ Melanoma recall of ~75% means approximately 1 in 4 melanomas may be misclassified. This false-negative rate is unacceptable for clinical use.

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- PyTorch with CUDA (recommended) or CPU
- Expo Go app (for mobile testing)

### 1. Clone and Setup Backend

```bash
git clone https://github.com/Mori-the-AI/DermAId
cd dermaid

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Download Dataset

Download the HAM10000 dataset from [Kaggle](https://www.kaggle.com/kmader/skin-cancer-mnist-ham10000) and place all images and `HAM10000_metadata.csv` in the `data/` folder.

### 3. Train the Model

Run the Jupyter notebooks in order:
1. `notebooks/01_exploratory_data_analysis.ipynb`
2. `notebooks/02_preprocessing_pipeline.ipynb`
3. `notebooks/03_model_training.ipynb`
4. `notebooks/04_gradcam_explainability.ipynb`

Or use the pre-trained model in `models/best_model.pth`.

### 4. Start Backend API

```bash
cd backend
python main.py
```

API runs at `http://localhost:8000`.

### 5. Start Web Frontend

```bash
cd frontend
npm install
npm start
```

Web app runs at `http://localhost:3000`.

### 6. Start Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go. Update the API IP address in `mobile/src/services/api.js` to your laptop's local IP.

---

## API Endpoints

| Endpoint | Method | Description |
|:---|:---|:---|
| `/health` | GET | Server health check |
| `/predict` | POST | Classify image, return probabilities (deterministic) |
| `/explain` | POST | Generate Grad-CAM++ heatmap |
| `/uncertainty` | POST | Estimate prediction uncertainty via MC Dropout |
| `/full-analysis` | POST | Combined prediction + explainability + uncertainty |

---

## Known Limitations

This is a **student research prototype**. It has not undergone clinical validation and must not be used for medical diagnosis.

- **Demographic Bias:** Trained primarily on light skin tones (European/Australian populations). Performance on darker skin types (Fitzpatrick V-VI) is unvalidated.
- **Limited Training Data:** Only 10,015 images. Rare classes (Dermatofibroma: 115, Vascular: 142) have insufficient samples.
- **No Clinical Trials:** No FDA clearance, CE marking, or regulatory approval of any kind.
- **No Paediatric Validation:** Dataset contains primarily adults. Performance on patients under 18 is unknown.
- **Melanoma Recall:** ~75% — unacceptably high false-negative rate for clinical deployment.
- **Image Quality Sensitivity:** Expects dermoscopic-quality images. Smartphone photos may produce unreliable results.

---

## Future Work

- Validate on diverse skin tone datasets (e.g., Diverse Dermatology Images)
- Improve melanoma recall through targeted data augmentation
- Add clinical report generation via LLM integration
- Deploy as a PWA for offline capability
- Pursue regulatory pathway (FDA SaMD, CE marking) for clinical use
- Multi-modal input: combine dermoscopic + clinical metadata

---

## License

This project is submitted as academic coursework. The HAM10000 dataset is publicly available from the ISIC Archive under CC BY-NC 4.0.

---

## Acknowledgements

- **Dataset:** Tschandl et al., "The HAM10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions", Scientific Data, 2018.
- **Grad-CAM++:** Chattopadhyay et al., "Grad-CAM++: Generalized Gradient-Based Visual Explanations for Deep Convolutional Networks", WACV 2018.
- **MC Dropout:** Gal & Ghahramani, "Dropout as a Bayesian Approximation: Representing Model Uncertainty in Deep Learning", ICML 2016.

---

*Built by Oladipo Eyitayo — Final Year Software Engineering Major, Bowen University, 2026*
