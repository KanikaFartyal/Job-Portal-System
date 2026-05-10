const fetch = require('node-fetch');
const url = 'http://localhost:5000/api';
const email = `temp-employer-${Date.now()}@example.com`;
(async () => {
  try {
    const registerRes = await fetch(`${url}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Temp Employer', email, password: 'Temp1234', role: 'employer' }),
      headers: { 'Content-Type': 'application/json' }
    });
    const regData = await registerRes.json();
    console.log('registerRes', registerRes.status, regData);
    if (!registerRes.ok) return;

    const token = regData.token;
    const jobRes = await fetch(`${url}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Temp Test Job', company: 'TestCo', location: 'Remote', type: 'Full-time', salary: '100000', experience: 2, education: "Bachelor's", description: 'Testing job posting.', skills: ['Node.js', 'React'] })
    });
    const jobData = await jobRes.json();
    console.log('jobRes', jobRes.status, jobData);
  } catch (err) {
    console.error('ERROR', err);
  }
})();
