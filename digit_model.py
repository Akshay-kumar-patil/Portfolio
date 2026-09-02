from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
from scipy.ndimage import rotate, shift, zoom
from sklearn.datasets import load_digits
from sklearn.neural_network import MLPClassifier


MODEL_PATH = Path(__file__).resolve().parent / "models" / "mnist_style_mlp.joblib"
GRID_SIZE = 12


def _fit_to_canvas(image: np.ndarray, scale: float = 1.0) -> np.ndarray:
    """Place an 8x8 digit in the same 10x10-on-12x12 frame used by the browser."""
    digit = zoom(image / 16.0, 10 / 8, order=1)
    if scale != 1.0:
        digit = zoom(digit, scale, order=1)

    canvas = np.zeros((GRID_SIZE, GRID_SIZE), dtype=np.float32)
    height, width = digit.shape
    y0 = max(0, (GRID_SIZE - height) // 2)
    x0 = max(0, (GRID_SIZE - width) // 2)
    y1 = min(GRID_SIZE, y0 + height)
    x1 = min(GRID_SIZE, x0 + width)
    canvas[y0:y1, x0:x1] = digit[: y1 - y0, : x1 - x0]
    return np.clip(canvas, 0, 1)


def _training_data() -> tuple[np.ndarray, np.ndarray]:
    digits = load_digits()
    samples: list[np.ndarray] = []
    labels: list[int] = []

    # The browser normalises every drawing into a centred 10x10 shape. Training
    # on shifted, scaled, and rotated variations makes that input less sensitive
    # to where and how a visitor draws their digit.
    variants = ((0, 0, 0, 1.0), (-1, 0, -10, 1.0), (1, 0, 10, 1.0),
                (0, -1, -6, 0.9), (0, 1, 6, 1.1), (-1, 1, 0, 0.85),
                (1, -1, 0, 1.15))
    for image, label in zip(digits.images, digits.target):
        for dx, dy, angle, scale in variants:
            sample = _fit_to_canvas(image, scale)
            if angle:
                sample = rotate(sample, angle, reshape=False, order=1, mode="constant")
            if dx or dy:
                sample = shift(sample, (dy, dx), order=1, mode="constant")
            samples.append(np.clip(sample, 0, 1).reshape(-1))
            labels.append(int(label))

    return np.asarray(samples, dtype=np.float32), np.asarray(labels, dtype=np.int64)


def _train_model() -> MLPClassifier:
    features, labels = _training_data()
    model = MLPClassifier(
        hidden_layer_sizes=(96, 48),
        activation="relu",
        solver="adam",
        alpha=0.0003,
        batch_size=256,
        learning_rate_init=0.0015,
        early_stopping=True,
        validation_fraction=0.1,
        n_iter_no_change=18,
        max_iter=350,
        random_state=42,
    )
    model.fit(features, labels)
    MODEL_PATH.parent.mkdir(exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    return model


@lru_cache(maxsize=1)
def get_model() -> MLPClassifier:
    return joblib.load(MODEL_PATH) if MODEL_PATH.exists() else _train_model()


def model_parameters() -> dict[str, object]:
    model = get_model()
    return {
        "architecture": [144, 96, 48, 10],
        "activation": "ReLU",
        "output_activation": "Softmax",
        "weights": [weights.T.tolist() for weights in model.coefs_],
        "biases": [bias.tolist() for bias in model.intercepts_],
    }


def predict(pixels: object) -> dict[str, object]:
    values = np.asarray(pixels, dtype=np.float32).reshape(-1)
    if values.size != GRID_SIZE * GRID_SIZE or not np.isfinite(values).all():
        raise ValueError("Expected 144 finite normalized pixel values.")

    values = np.clip(values, 0, 1)
    model = get_model()
    layer_1 = np.maximum(0, values @ model.coefs_[0] + model.intercepts_[0])
    layer_2 = np.maximum(0, layer_1 @ model.coefs_[1] + model.intercepts_[1])
    logits = layer_2 @ model.coefs_[2] + model.intercepts_[2]
    logits -= logits.max()
    probabilities = np.exp(logits)
    probabilities /= probabilities.sum()

    return {
        "prediction": int(np.argmax(probabilities)),
        "probabilities": probabilities.tolist(),
        "activations": [layer_1.tolist(), layer_2.tolist()],
    }
