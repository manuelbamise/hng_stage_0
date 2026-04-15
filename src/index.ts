import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/classify', async (req, res) => {
  try {
    const name = req.query.name as string | undefined;
    if (!name) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Name query parameter is required' });
    }

    if (typeof name !== 'string') {
      return res
        .status(422)
        .json({ status: 'error', message: 'Name must be a string' });
    }

    const raw_response = await axios.get(`https://api.genderize.io`, {
      params: { name },
    });
    const { gender, name: apiName, count, probability } = raw_response.data;

    if (gender == null || count == 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No prediction available for the provided name',
      });
    }

    const sample_size = count;

    const is_confident: boolean = probability >= 0.7 && sample_size >= 100;

    const processed_at: string = new Date().toISOString();

    res.json({
      status: 'success',
      data: {
        name: apiName,

        gender,
        probability,

        sample_size,
        is_confident,
        processed_at,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
