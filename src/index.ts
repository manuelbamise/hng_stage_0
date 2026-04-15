import express from 'express';
import axios from 'axios';
import cors from 'cors';
import db from './db/db_init';
import { v7 as uuidv7 } from 'uuid';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('HNG DISPLAY NAME: Bams_114_Backend_Track');
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

// app.post('/api/profiles', async (req, res) => {
//   const id = uuidv7();
//   console.log(id);
//   try {
//     const { name } = req.body;
//     if (!name) {
//       return res
//         .status(400)
//         .json({ status: 'error', message: 'Name body parameter is required' });
//     }

//     if (typeof name !== 'string') {
//       return res
//         .status(422)
//         .json({ status: 'error', message: 'Name must be a string' });
//     }

//     const genderize_response = await axios.get(`https://api.genderize.io`, {
//       params: { name },
//     });
//     const { gender, count, probability } = genderize_response.data;

//     if (gender == null || count == 0) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'No prediction available for the provided name',
//       });
//     }

//     const sample_size = count;
//     const gender_probability = probability;

//     const agify_response = await axios.get(`https://api.agify.io/`, {
//       params: { name },
//     });
//     const { age } = agify_response.data;

//     const isChild = age <= 12;
//     const isTeen = age > 12 && age <= 19;
//     const isAdult = age > 19 && age <= 59;
//     const isSenior = age > 59;

//     const age_group = isChild
//       ? 'child'
//       : isTeen
//         ? 'teen'
//         : isAdult
//           ? 'adult'
//           : 'senior';

//     const nationalize_response = await axios.get(
//       `https://api.nationalize.io/`,
//       {
//         params: { name },
//       },
//     );
//     const { probability: country_probability, country_id } =
//       nationalize_response.data.country[0];

//     console.log('starting db insert');
//     db.run(
//       `INSERT INTO profiles(id, name, gender, gender_probability, sample_size, age, age_group, country_id, country_probability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         id,
//         name,
//         gender,
//         gender_probability,
//         sample_size,
//         age,
//         age_group,
//         country_id,
//         country_probability,
//       ],
//       function (err) {
//         if (err) {
//           console.error(err);
//           res
//             .status(500)
//             .json({ status: 'error', message: 'Internal server error' });
//         }

//         db.get(`SELECT * FROM profiles WHERE id = ?`, [id], (err, row) => {
//           if (err) {
//             console.error(err);
//             res
//               .status(500)
//               .json({ status: 'error', message: 'Internal server error' });
//           }
//           console.log(row);
//           res.status(200).json({ status: 'success', data: row });
//         });
//       },
//     );
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: 'error', message: 'Internal server error' });
//   }
// });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
