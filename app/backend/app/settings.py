"""
Application settings configuration using pydantic-settings.
"""
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Environment variables are automatically loaded from .env file and system environment.
    """
    
    # Database configuration
    database_url: str = Field(
        default="sqlite:///./data/polypore.db",
        description="Database connection URL"
    )
    
    # CORS configuration
    backend_cors_origins: str = Field(
        default="*",
        description="Comma-separated list of allowed CORS origins"
    )
    
    @field_validator("backend_cors_origins")
    @classmethod
    def parse_cors_origins(cls, v: str) -> List[str]:
        """
        Parse comma-separated CORS origins string into a list.
        
        :param str v: Comma-separated string of origins
        :return List[str]: List of origins
        """
        if not v or v.strip() == "":
            return ["*"]
        return [origin.strip() for origin in v.split(",") if origin.strip()]
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
