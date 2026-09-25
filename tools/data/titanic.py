"""Titanic models: decision regions on two features (age, fare) for drawing, plus each
model's real validation accuracy on all features, from the titanic-ml-kaggle project.

Usage: python tools/data/titanic.py <titanic-ml-kaggle folder>
Needs scikit-learn and torch. xgboost/lightgbm are stubbed if missing (they aren't shown).
"""
import contextlib
import io
import os
import sys
import types
import warnings

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC

from _common import write

warnings.filterwarnings("ignore")
project = os.path.abspath(sys.argv[1])

# 1. Decision regions on age and fare, on a 40 x 30 grid ("1" = predicted to survive)
df = pd.read_csv(os.path.join(project, "data", "train.csv")).dropna(subset=["Age"])
X = np.c_[df.Age.values / 80, np.log1p(df.Fare.values) / np.log1p(520)]
y = df.Survived.values
GX, GY = 40, 30
gx, gy = np.meshgrid((np.arange(GX) + 0.5) / GX, (np.arange(GY) + 0.5) / GY)
G = np.c_[gx.ravel(), gy.ravel()]


def enc(pred):
    return "".join("1" if v else "0" for v in pred)


out = {}
lr = LogisticRegression().fit(X, y)
out["lr"] = [float(lr.intercept_[0]), *map(float, lr.coef_[0])]
out["lr_grid"] = enc(lr.predict(G))
out["knn"] = enc(KNeighborsClassifier(5).fit(X, y).predict(G))
f = SVC(C=1, gamma=4).fit(X, y).decision_function(G)
out["svm"] = "".join(("1" if v > 0 else "0") if abs(v) >= 1 else ("b" if v > 0 else "a") for v in f)
rf = RandomForestClassifier(100, max_depth=6, random_state=42).fit(X, y)
out["rf_trees"] = [enc(t.predict(G).astype(int)) for t in rf.estimators_[:3]]
out["rf"] = enc(rf.predict(G))
gb = GradientBoostingClassifier(n_estimators=100, max_depth=3, random_state=42).fit(X, y)
stages = list(gb.staged_predict(G))
out["gb"] = [enc(stages[i]) for i in (0, 4, 19, 99)]
nn = MLPClassifier((16, 16), max_iter=1, warm_start=True, random_state=1, learning_rate_init=0.02)
out["nn"] = []
for epoch in range(1, 301):
    nn.fit(X, y)
    if epoch in (2, 10, 40, 300):
        out["nn"].append(enc(nn.predict(G)))
idx = np.random.default_rng(3).choice(len(X), 140, replace=False)
out["pts"] = [[round(float(X[i, 0]), 3), round(float(X[i, 1]), 3), int(y[i])] for i in idx]

# 2. Real validation accuracy on all features, using the project's own training code
for m in ("xgboost", "lightgbm"):
    try:
        __import__(m)
    except ImportError:
        sys.modules[m] = types.ModuleType(m)
os.chdir(project)
sys.path.insert(0, project)
import main  # noqa: E402  (the project's main.py)

names = {"lr": "Logistic regression", "svm": "SVM", "gb": "Gradient boosting",
         "knn": "k-nearest neighbours", "nn": "Neural network", "rf": "Random forest"}
results = []
for key, name in names.items():
    with contextlib.redirect_stdout(io.StringIO()):
        acc = main.train_nn_model("nn") if key == "nn" else main.train_sklearn_model(key)
    results.append([name, round(acc * 100, 1), round((1 - acc) * 179)])
out["results"] = sorted(results, key=lambda r: -r[1])
write("titanic", out)
