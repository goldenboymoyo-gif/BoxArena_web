FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc curl \
    && rm -rf /var/lib/apt/lists/*

# Run as a non-root user
RUN addgroup --system pugnera && adduser --system --ingroup pugnera pugnera

WORKDIR /app
COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/production.txt

COPY . .
RUN chown -R pugnera:pugnera /app
USER pugnera

EXPOSE 8000
CMD ["gunicorn", "pugnera.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
