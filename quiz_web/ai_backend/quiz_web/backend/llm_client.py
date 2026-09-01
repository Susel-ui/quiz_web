from __future__ import annotations

"""Provider abstraction for structured LLM generation.

The prototype can be demonstrated with OpenAI or Anthropic, but the rest of the
backend should not care which vendor is active. Keeping SDK imports here avoids
provider-specific code leaking into quiz generation, API handlers, or tests.
"""

from abc import ABC, abstractmethod
import json
import os
import re
from typing import Optional, Type

from pydantic import BaseModel


def _model_validate(schema: Type[BaseModel], data):
    if hasattr(schema, "model_validate"):
        return schema.model_validate(data)
    return schema.parse_obj(data)


def _schema_json(schema: Type[BaseModel]) -> str:
    if hasattr(schema, "model_json_schema"):
        return json.dumps(schema.model_json_schema(), indent=2)
    return schema.schema_json(indent=2)


def _extract_json(text: str):
    stripped = text.strip()
    if stripped.startswith("```"):
        match = re.search(r"```(?:json)?\s*(.*?)```", stripped, flags=re.DOTALL | re.IGNORECASE)
        if match:
            stripped = match.group(1).strip()
    return json.loads(stripped)


class LLMProvider(ABC):
    @abstractmethod
    def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: Type[BaseModel],
        temperature: float = 0.4,
        max_tokens: int = 4096,
    ) -> BaseModel:
        """Returns a validated schema instance or raises on provider/schema failure."""


class OpenAIProvider(LLMProvider):
    def __init__(self, model: Optional[str] = None, api_key: Optional[str] = None):
        self.model = model or os.environ.get("OPENAI_MODEL") or "gpt-4o-mini"
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")

    def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: Type[BaseModel],
        temperature: float = 0.4,
        max_tokens: int = 4096,
    ) -> BaseModel:
        try:
            from openai import OpenAI
        except ImportError as exc:
            raise RuntimeError("OpenAI provider requires the openai package") from exc

        client = OpenAI(api_key=self.api_key)

        if hasattr(client, "beta") and hasattr(client.beta, "chat"):
            try:
                completion = client.beta.chat.completions.parse(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    response_format=schema,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                parsed = completion.choices[0].message.parsed
                if parsed is None:
                    raise RuntimeError("OpenAI returned no parsed structured payload")
                return parsed
            except Exception:
                # Fall through to JSON mode below; callers still receive a real
                # exception if the second path fails.
                pass

        completion = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
                {
                    "role": "user",
                    "content": "Return only valid JSON matching this schema:\n"
                    + _schema_json(schema),
                },
            ],
            response_format={"type": "json_object"},
            temperature=temperature,
            max_tokens=max_tokens,
        )
        content = completion.choices[0].message.content
        if not content:
            raise RuntimeError("OpenAI returned an empty response")
        return _model_validate(schema, _extract_json(content))


class AnthropicProvider(LLMProvider):
    def __init__(self, model: Optional[str] = None, api_key: Optional[str] = None):
        self.model = model or os.environ.get("ANTHROPIC_MODEL") or "claude-3-5-sonnet-latest"
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")

    def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: Type[BaseModel],
        temperature: float = 0.4,
        max_tokens: int = 4096,
    ) -> BaseModel:
        try:
            from anthropic import Anthropic
        except ImportError as exc:
            raise RuntimeError("Anthropic provider requires the anthropic package") from exc

        client = Anthropic(api_key=self.api_key)
        message = client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"{user_prompt}\n\nReturn only JSON matching this schema:\n"
                        f"{_schema_json(schema)}"
                    ),
                }
            ],
        )
        text_parts = [
            block.text for block in message.content if getattr(block, "type", None) == "text"
        ]
        if not text_parts:
            raise RuntimeError("Anthropic returned no text content")
        return _model_validate(schema, _extract_json("\n".join(text_parts)))


def get_llm_provider(
    name: str = None, model: str = None, api_key: str = None
) -> LLMProvider:
    provider_name = (name or os.environ.get("LLM_PROVIDER") or "openai").strip().lower()
    if provider_name in {"openai", "gpt"}:
        return OpenAIProvider(model=model, api_key=api_key)
    if provider_name in {"anthropic", "claude"}:
        return AnthropicProvider(model=model, api_key=api_key)
    raise ValueError(f"Unsupported LLM provider: {provider_name}")
