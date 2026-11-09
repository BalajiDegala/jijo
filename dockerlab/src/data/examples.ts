export const DEFAULT_DOCKERFILE = `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
ENV FLASK_APP=app.py
EXPOSE 5000
CMD ["python", "app.py"]`;
export const DEFAULT_FILES: Record<string,string> = {
  'requirements.txt': 'flask==3.1.0\npsycopg2-binary==2.9.10',
  'app.py': 'from flask import Flask\n\napp = Flask(__name__)\n\n@app.route("/")\ndef hello():\n    return "Hello from DockerLab!"\n\napp.run(host="0.0.0.0", port=5000)\n',
  '.env': 'POSTGRES_USER=admin\nPOSTGRES_PASSWORD=password\nPOSTGRES_DB=college',
};
export const COMPOSE_EXAMPLES = [
  {name:'Flask + PostgreSQL', description:'A web app, a database, and persistent storage.',yaml:`services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      DB_HOST: database
    depends_on:
      database:
        condition: service_healthy
    networks:
      - app-network

  database:
    image: postgres:16
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
      POSTGRES_DB: college
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 5s
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge`},
  {name:'One Nginx service',description:'The smallest useful Compose project.',yaml:`services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"`},
  {name:'Flask + PostgreSQL + Redis',description:'Add a cache to the application network.',yaml:`services:
  web:
    image: dockerlab/flask
    ports: ["5000:5000"]
    depends_on: [database, cache]
    environment:
      DB_HOST: database
  database:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: password
    volumes: ["postgres_data:/var/lib/postgresql/data"]
  cache:
    image: redis:7-alpine
volumes:
  postgres_data:`},
  {name:'Reverse proxy topology',description:'Inspect one proxy and two backend services.',yaml:`services:
  proxy:
    image: nginx
    ports: ["8080:80"]
    depends_on: [api, worker]
    networks: [frontend]
  api:
    image: dockerlab/flask
    networks: [frontend]
  worker:
    image: dockerlab/flask
    networks: [frontend]
networks:
  frontend:`},
  {name:'Isolated networks',description:'Keep the database on an internal service network.',yaml:`services:
  proxy:
    image: nginx
    ports: ["8080:80"]
    networks: [frontend]
  web:
    image: dockerlab/flask
    networks: [frontend, backend]
  database:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: password
    networks: [backend]
    volumes: ["data:/var/lib/postgresql/data"]
networks:
  frontend:
  backend:
volumes:
  data:`},
];
