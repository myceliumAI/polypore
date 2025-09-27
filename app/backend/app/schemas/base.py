from typing import Any
from pydantic import BaseModel


class BaseSchema(BaseModel):
    """
    Base schema adding helpers to access examples defined via json_schema_extra.

    :return BaseSchema: Base for all response/request schemas
    """

    @classmethod
    def examples(cls) -> list[Any]:
        """
        Return all examples defined on the model.

        :return list[Any]: Examples array (possibly empty)
        """
        try:
            ex = cls.model_json_schema().get("examples")
            return ex if isinstance(ex, list) else []
        except Exception:
            return []

    @classmethod
    def example(cls) -> Any:
        """
        Return the first example defined on the model.

        :return Any: First example or None
        """
        ex = cls.examples()
        return ex[0] if ex else None
