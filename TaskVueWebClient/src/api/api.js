async function makeRequest(method, endpoint, data = {} = false) {
    const headers = {
        'Content-Type': 'application/json',
    };

    const fetchOptions = {
        method: method,
        headers: headers,
    };

    if (method !== 'GET') {
        fetchOptions.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, fetchOptions);

    if (response.status === 204) {
        return null; // Kein Inhalt
    }

    const jsonData = await response.json();
    if (!response.ok) {
        throw new Error(jsonData.message);
    }

    return jsonData;
}


export { makeRequest };
