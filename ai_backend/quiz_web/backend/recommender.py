from __future__ import annotations

"""Rank iGOT and NSSTA learning items against diagnosed competency gaps.

Recommendations must never be invented by an LLM. This module searches only
the known catalogs and annotates matches with transparent scores, while using a
provider abstraction so offline TF-IDF can be swapped for hosted embeddings.
"""

from abc import ABC, abstractmethod
import copy
import json
import os
from typing import Dict, List, Optional

import numpy as np
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .gap_analyzer import CompetencyGap


_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


class EmbeddingProvider(ABC):
    @abstractmethod
    def embed(self, texts: List[str]) -> np.ndarray:
        """Return one vector per input text."""


class TfidfEmbeddingProvider(EmbeddingProvider):
    """Offline lexical/statistical similarity using TF-IDF vectors.

    This is not true dense semantic embedding. It fits sklearn's
    TfidfVectorizer freshly on the combined gap plus catalog corpus every call
    so all vectors share one vocabulary space. That makes it more robust than
    substring matching while remaining zero-key, zero-network, and safe for a
    hackathon venue with unreliable Wi-Fi.
    """

    def embed(self, texts: List[str]) -> np.ndarray:
        if not texts:
            raise ValueError("texts must contain at least one item")
        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        matrix = vectorizer.fit_transform(texts)
        return matrix.toarray().astype(np.float32)


class OpenAIEmbeddingProvider(EmbeddingProvider):
    """Hosted OpenAI embedding provider for production-like experiments."""

    def __init__(self, model: str = "text-embedding-3-small", api_key: Optional[str] = None):
        self.model = model
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")

    def embed(self, texts: List[str]) -> np.ndarray:
        if not texts:
            raise ValueError("texts must contain at least one item")
        if not self.api_key:
            raise RuntimeError("OPENAI_API_KEY is required for OpenAI embeddings")

        response = requests.post(
            "https://api.openai.com/v1/embeddings",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json={"model": self.model, "input": texts},
            timeout=60,
        )
        response.raise_for_status()
        payload = response.json()
        data = sorted(payload.get("data", []), key=lambda item: item.get("index", 0))
        if len(data) != len(texts):
            raise RuntimeError("OpenAI embeddings response length did not match input length")
        return np.array([item["embedding"] for item in data], dtype=np.float32)


def get_embedding_provider(name: Optional[str] = None) -> EmbeddingProvider:
    provider_name = (name or os.environ.get("EMBEDDING_PROVIDER") or "tfidf").strip().lower()
    if provider_name in {"tfidf", "offline", "sklearn"}:
        return TfidfEmbeddingProvider()
    if provider_name in {"openai", "text-embedding-3-small"}:
        return OpenAIEmbeddingProvider()
    raise ValueError(f"Unsupported embedding provider: {provider_name}")


def _load_catalog(filename: str) -> List[dict]:
    path = os.path.join(_DATA_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Catalog file not found: {path}")
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_igot_catalog() -> List[dict]:
    return _load_catalog("igot_courses.json")


def load_nssta_catalog() -> List[dict]:
    return _load_catalog("nssta_tpac_programmes.json")


def _gap_text(gap: CompetencyGap) -> str:
    pieces = [
        gap.competency_name,
        gap.domain,
        gap.source,
        gap.status,
        gap.expected_level or "",
    ]
    if gap.quiz_percentage is not None:
        pieces.append(f"quiz score {gap.quiz_percentage}")
    return " ".join(piece for piece in pieces if piece)


def _item_text(item: dict) -> str:
    competencies = item.get("competencies") or []
    return " ".join(
        [
            str(item.get("title", "")),
            " ".join(str(competency) for competency in competencies),
            str(item.get("description", "")),
        ]
    )


def _combined_catalog_items(catalogs: Dict[str, List[dict]]) -> List[dict]:
    items: List[dict] = []
    for source, catalog_items in catalogs.items():
        for item in catalog_items:
            annotated = copy.deepcopy(item)
            annotated["catalog_source"] = source
            items.append(annotated)
    return items


def match_semantic(
    gaps: List[CompetencyGap],
    catalogs: Optional[Dict[str, List[dict]]] = None,
    provider: Optional[EmbeddingProvider] = None,
    top_n_per_gap: int = 2,
) -> Dict[str, List[dict]]:
    if top_n_per_gap <= 0:
        raise ValueError("top_n_per_gap must be greater than zero")
    if not gaps:
        return {}

    catalog_map = catalogs or {
        "igot": load_igot_catalog(),
        "nssta_tpac": load_nssta_catalog(),
    }
    items = _combined_catalog_items(catalog_map)
    if not items:
        return {gap.competency_name: [] for gap in gaps}

    embedding_provider = provider or get_embedding_provider()
    gap_texts = [_gap_text(gap) for gap in gaps]
    item_texts = [_item_text(item) for item in items]
    vectors = embedding_provider.embed([*gap_texts, *item_texts])
    gap_vectors = vectors[: len(gaps)]
    item_vectors = vectors[len(gaps) :]
    scores = cosine_similarity(gap_vectors, item_vectors)

    results: Dict[str, List[dict]] = {}
    for gap_index, gap in enumerate(gaps):
        ranked_indices = np.argsort(scores[gap_index])[::-1][:top_n_per_gap]
        matches: List[dict] = []
        for item_index in ranked_indices:
            item = copy.deepcopy(items[int(item_index)])
            item["match_score"] = round(float(scores[gap_index][item_index]), 4)
            matches.append(item)
        results[gap.competency_name] = matches
    return results
