# YelpClone Lab 2

A full-stack Yelp-style restaurant discovery and review platform built with **React + Vite**, **FastAPI**, **MongoDB**, **Kafka**, **Docker**, **Redux Toolkit**, and an **AI-powered restaurant assistant** using **Ollama**.

This project was developed for **DATA 236 Lab 2** and includes:
- containerized multi-service deployment with Docker Compose
- MongoDB-backed data storage
- Kafka-based event-driven review processing
- Redux Toolkit state management
- AI assistant for restaurant recommendations
- Apache JMeter performance testing
- Kubernetes/AWS deployment preparation

---

## Project Features

- User signup and login
- Token-based authentication
- Restaurant listing and search
- Restaurant details page
- Review creation and retrieval
- Restaurant ownership claim flow
- AI restaurant assistant page
- Redux-based state management
- Seed script for sample restaurants, users, and reviews
- Kafka topics for review events
- JMeter load testing

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Redux Toolkit
- React Redux

### Backend
- FastAPI
- PyMongo
- Kafka / Confluent Kafka client
- Uvicorn

### Database
- MongoDB

### AI
- Ollama
- Local LLM model integration

### DevOps / Deployment
- Docker
- Docker Compose
- Kubernetes manifests preparation
- AWS deployment preparation

### Testing
- Apache JMeter

---

## Project Structure

```text
.
├── backend/
│   ├── app/
│   ├── seed_data.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── jmeter/
├── k8s/                      
└── README.md