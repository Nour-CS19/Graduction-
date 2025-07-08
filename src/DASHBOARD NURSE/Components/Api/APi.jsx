const BASE_URL = 'https://physiocareapp.runasp.net/api/v1/NurseAppointment';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Response not OK:', response.status, errorText);
    throw new Error(errorText || 'API request failed');
  }

  if (response.status === 204 || response.status === 205) {
    return {};
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  } else {
    const rawText = await response.text();
    console.warn('Received non-JSON response:', rawText);
    return rawText;
  }
};

const get = async (endpoint) => {
  const url = `${BASE_URL}${endpoint}`;
  console.log('GET Request to:', url);
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return handleResponse(response);
};

const post = async (endpoint, data) => {
  const url = `${BASE_URL}${endpoint}`;
  console.log('POST Request to:', url, 'with data:', data);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

const del = async (endpoint, data) => {
  const url = `${BASE_URL}${endpoint}`;
  console.log('DELETE Request to:', url, 'with data:', data);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export default { get, post, del };
