// server.js (in your project root or a separate backend folder)
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3001;

app.use(express.json());

app.post('/api/infer', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    const response = await axios.post(
      'https://serverless.roboflow.com/caries-novip-w2b0v/1',
      { image: { url: imageUrl } },
      {
        params: { api_key: "Qcew4U3hqVjLjWergC5l" }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Inference failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));