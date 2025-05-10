const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

// ✅ Your Access Token (already filled in)
const AUTH_TOKEN ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ2ODYzNjA5LCJpYXQiOjE3NDY4NjMzMDksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjBhODI0ZTA0LTlkYzMtNGZlMy05Y2Y2LThkM2Q4ZWVkYjcxMSIsInN1YiI6Imt1c2hpcHJhYmhha2FyMTExQGdtYWlsLmNvbSJ9LCJlbWFpbCI6Imt1c2hpcHJhYmhha2FyMTExQGdtYWlsLmNvbSIsIm5hbWUiOiJrdXNoaSBwIiwicm9sbE5vIjoiNGFkMjJjczA0MiIsImFjY2Vzc0NvZGUiOiJVbnZDdXEiLCJjbGllbnRJRCI6IjBhODI0ZTA0LTlkYzMtNGZlMy05Y2Y2LThkM2Q4ZWVkYjcxMSIsImNsaWVudFNlY3JldCI6InJ3eXR5Z3ZmRHdQVkNXcG0ifQ.3i45jNQp-EL7f9fW9NLdnj6Ov8pLfo6oGx8uYeqLtHg';

// Window to store numbers
let numbersWindow = [];

// Mapping of IDs to API URLs
const apiUrls = {
    'p': 'http://20.244.56.144/evaluation-service/primes',
    'f': 'http://20.244.56.144/evaluation-service/fibo',
    'e': 'http://20.244.56.144/evaluation-service/even',
    'r': 'http://20.244.56.144/evaluation-service/rand'
};

app.get('/numbers/:numberid', async (req, res) => {
    const numberid = req.params.numberid;
    const apiUrl = apiUrls[numberid];

    if (!apiUrl) {
        return res.status(400).json({ error: 'Invalid number id. Use p, f, e, or r.' });
    }

    const windowPrevState = [...numbersWindow];
    let fetchedNumbers = [];

    try {
        const response = await axios.get(apiUrl, {
            timeout: 500,
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`
            }
        });

        fetchedNumbers = response.data.numbers || [];
    } catch (error) {
        console.error('Error fetching numbers:', error.message);
    }

    // Filter out duplicates and maintain window size
    fetchedNumbers.forEach(num => {
        if (!numbersWindow.includes(num)) {
            numbersWindow.push(num);
            if (numbersWindow.length > WINDOW_SIZE) {
                numbersWindow.shift(); // remove oldest if window exceeds size
            }
        }
    });

    // Calculate average
    let avg = 0;
    if (numbersWindow.length > 0) {
        const sum = numbersWindow.reduce((acc, curr) => acc + curr, 0);
        avg = sum / numbersWindow.length;
    }

    res.json({
        windowPrevState,
        windowCurrState: [...numbersWindow],
        numbers: fetchedNumbers,
        avg: parseFloat(avg.toFixed(2))
    });
});

app.listen(PORT, () => {
    console.log(`✅ Average Calculator microservice is running on port ${PORT}`);
});
