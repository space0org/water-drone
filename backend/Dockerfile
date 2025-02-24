FROM python:3.12-slim

WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy application code first
COPY . .

# Configure poetry to not create virtual environment (we're in a container)
RUN poetry config virtualenvs.create false

# Install dependencies without installing the root project
RUN poetry install --no-root --no-interaction --no-ansi

# Expose port
EXPOSE 8000

# Run the application
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
