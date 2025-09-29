# Contributing to Polypore

First off, thank you for considering contributing to Polypore! It's people like you that make Polypore such a great tool. 

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Style Guidelines](#style-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [maintainers@mycelium.ai].

## 🛠️ Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/polypore.git
   cd polypore
   ```

2. **Environment Setup**
   ```bash
   make setup     # Creates .env file from template
   ```

3. **Launch**
   ```bash
   make up
   ```

## 🔄 Development Process

1. **Create a Branch**
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-fix-name
   ```

2. **Make Your Changes**
   - Write clean, maintainable code
   - Follow the style guidelines
   - Add tests for new features
   - Update documentation as needed

3. **Verify Your Changes**
   ```bash
   make test           # Run all tests
   make lint           # Check code style
   make format         # Format code
   ```

## 🔍 Pull Request Process

1. **Before Submitting**
   - [ ] Update documentation
   - [ ] Add/update tests
   - [ ] Run full test suite
   - [ ] Format code
   - [ ] Update changelog if needed

2. **Submitting**
   - Fill in the pull request template
   - Link any relevant issues
   - Request review from maintainers

3. **After Submitting**
   - Respond to review comments
   - Make requested changes
   - Rebase if needed

## 📝 Style Guidelines

### Python (Backend)
- Use type hints
- Follow PEP 8
- Use docstrings for functions and classes
- Format with Ruff

Example:
```python
def clean(self, client_name: str, delete_all: bool) -> dict[str, Any]:
    """
    Deletes duplicate resources for a given client.

    :param str client_name: The name of the target client.
    :param bool delete_all: Determines the extent of deletion.
    :return dict[str, Any]: The status response
    """
```