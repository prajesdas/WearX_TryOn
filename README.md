# WEARX

### A Virtual Try-On System with Realistic Cloth Draping

---

## Overview

WEARX is a **virtual try-on system** that combines **3D body modeling**, **realistic cloth draping**, and **deep learning** to create a fast, interactive, and visually accurate try-on experience. The system is designed for e-commerce and AR applications, offering a seamless and engaging user experience.

---

## Features

* **3D Body Modeling** using SMPL for realistic human representation
* **Advanced Cloth Draping** for natural garment fitting
* **Deep Learning Integration** for enhanced cloth behavior and realism
* **High-Performance Pipeline** for interactive virtual try-on
* **E-Commerce & AR Ready** system for real-world applications

---

## Technologies Used

* Python
* PyTorch / TensorFlow
* OpenCV
* Blender / Marvelous Designer (Optional for advanced simulations)
* SMPL Model
* Git + GitHub

---

## Project Structure

```
WEARX_TRYON/
├── data/                # Data storage (raw, processed)
├── models/              # Pre-trained and custom models
├── src/                 # Source code
│   ├── preprocessing/   # Data preparation modules
│   ├── draping/         # Cloth simulation & fitting logic
│   └── rendering/       # Visualization and output rendering
├── outputs/             # Generated outputs
├── requirements.txt     # Dependencies
└── README.md            # Project documentation
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/prajesdas/WearX_TryOn.git
cd WearX_TryOn
```

### 2. Set Up Environment

```bash
python -m venv venv
source venv/bin/activate  # For Linux/Mac
venv\Scripts\activate     # For Windows
pip install -r requirements.txt
```

### 3. Run the Pipeline

```bash
python src/main.py --input_image path/to/image.jpg
```

---

## Sample Output

*(Add images or GIFs of try-on results here)*

---

## Future Roadmap

* Integration with Augmented Reality (AR) platforms
* Support for additional clothing types and accessories
* GAN-based texture and drape refinement
* Custom cloth parameter editor for advanced customization
* Dataset expansion with high-quality annotated pairs

---

## Meet the Team

<img width="1000" height="850" alt="Team-Details" src="https://github.com/user-attachments/assets/00aefc63-9ddb-487a-8546-5887f438a94e" />

---

## Contributing

Contributions are welcome!
Please open an issue to discuss new features or improvements before submitting a pull request.

---

