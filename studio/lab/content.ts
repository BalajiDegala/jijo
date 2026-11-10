export interface Lab {
  name: string;
  image: string;
  host: number;
  listener: number;
  initialTarget?: number;
}

export const guided: Lab = { name: 'flask-web', image: 'jijo/flask-web:v1', host: 8080, listener: 5000 };
export const transfer: Lab = { name: 'weather-api', image: 'jijo/weather-api:v1', host: 9090, listener: 7000, initialTarget: 5000 };

export const milestones = ['Predict the response', 'Repair the connection', 'Explain the fix', 'Solve a new case'];
export const predictions = ['The app responds', 'The connection fails', 'The container exits'];
export const explanations = [
  'EXPOSE makes the app available on every host port.',
  'Publishing forwards a host port to the port where the app listens.',
  'Changing the host port changes the port Flask listens on.',
];

export function sources(lab: Lab) {
  return {
    'app.py': [
      'from flask import Flask', '', 'app = Flask(__name__)', '', '',
      '@app.get("/")', 'def index():', '    return "Hello from ' + lab.name + '!\\n"', '', '',
      'if __name__ == "__main__":', '    app.run(host="0.0.0.0", port=' + lab.listener + ')', '',
    ].join('\n'),
    'requirements.txt': 'Flask==3.1.2\n',
    Dockerfile: [
      'FROM python:3.12-slim', 'WORKDIR /app', 'COPY requirements.txt .',
      'RUN pip install --no-cache-dir -r requirements.txt', 'COPY app.py .',
      'EXPOSE ' + lab.listener, 'USER 10001', 'CMD ["python", "app.py"]', '',
    ].join('\n'),
  };
}
