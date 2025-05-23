import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '5m',
  cloud: {
    // Project: Default project
    projectID: 3742062,
    // Test runs with the same name groups test runs together.
    name: 'Test (24/01/2025-19:45:07)'
  }
};

export default function() {
  http.get('http://127.0.0.1:5008/metrics/realtime');
  sleep(1);
}