const http = require('http');
const { URL } = require('url');
const url = new URL('http://localhost:5000/api/auth/register');

const postJson = (url, body, token) => new Promise((resolve, reject) => {
  const payload = JSON.stringify(body);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  if (token) options.headers.Authorization = `Bearer ${token}`;
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
      catch (err) { reject(err); }
    });
  });
  req.on('error', reject);
  req.write(payload);
  req.end();
});

(async () => {
  try {
    const email = `tmp-employer-${Date.now()}@example.com`;
    const register = await postJson(url, { name: 'Temp Employer', email, password: 'Temp1234', role: 'employer' });
    console.log('REGISTER', register);
    if (!register.body.token) return;
    const jobUrl = new URL('http://localhost:5000/api/jobs');
    const jobBody = {
      title: 'Temp API Job',
      company: 'TestCo',
      location: 'Remote',
      type: 'Full-time',
      salary: '100000',
      experience: 2,
      education: "Bachelor's",
      description: 'Testing job posting via API script.',
      skills: ['Node.js', 'React']
    };
    const postJob = await postJson(jobUrl, jobBody, register.body.token);
    console.log('POST JOB', postJob);
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
