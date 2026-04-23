import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { prisma } from '../lib/prisma.js';
import { v7 as uuidv7 } from 'uuid';
import { Prisma } from '@prisma/client/extension';
import { getFiltersFromQuery } from './parsing_filter.js';

const app = express();
const port = 3000;

type ValidSortField = 'age' | 'created_at' | 'gender_probability';
type ValidOrder = 'asc' | 'desc';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('HNG DISPLAY NAME: Bams_114_Backend_Track');
});

//Task 0 --->

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
//Task 1 --->

//Task 2 --->
app.post('/api/profiles', async (req, res) => {
  const id = uuidv7();
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Name body parameter is required' });
    }

    if (typeof name !== 'string') {
      return res
        .status(422)
        .json({ status: 'error', message: 'Name must be a string' });
    }

    const genderize_response = await axios.get(`https://api.genderize.io`, {
      params: { name },
    });
    const { gender, count, probability } = genderize_response.data;

    if (gender == null || count == 0) {
      return res.status(502).json({
        status: '502',
        message: 'Genderize returned an invalid response',
      });
    }

    const sample_size = count;
    const gender_probability = probability;

    const agify_response = await axios.get(`https://api.agify.io/`, {
      params: { name },
    });
    const { age } = agify_response.data;
    if (age == null) {
      return res.status(502).json({
        status: '502',
        message: 'Agify returned an invalid response',
      });
    }

    const isChild = age <= 12;
    const isTeen = age > 12 && age <= 19;
    const isAdult = age > 19 && age <= 59;
    const isSenior = age > 59;

    const age_group = isChild
      ? 'child'
      : isTeen
        ? 'teen'
        : isAdult
          ? 'adult'
          : 'senior';

    const nationalize_response = await axios.get(
      `https://api.nationalize.io/`,
      {
        params: { name },
      },
    );

    if (
      nationalize_response.data.country == null ||
      nationalize_response.data.country.length === 0
    ) {
      return res.status(502).json({
        status: '502',
        message: 'Nationalize returned an invalid response',
      });
    }

    const { probability: country_probability, country_id } =
      nationalize_response.data.country[0];

    const existingProfile = await prisma.profile.findFirst({
      where: {
        name: {
          equals: name,
        },
      },
    });

    if (existingProfile) {
      return res.status(200).json({
        status: 'success',
        message: 'Profile already exists',
        data: existingProfile,
      });
    }

    const profile = await prisma.profile.create({
      data: {
        name,
        gender,
        gender_probability,
        age,
        age_group,
        country_id,
        country_name,
        country_probability,
      },
    });

    return res.status(201).json({ status: 'success', data: profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

app.get('/api/profiles/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Query parameter "q" is required' });
    }

    const filter = getFiltersFromQuery(q as string);

    return res.status(200).json({
      message: 'success',
      data: filter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

app.get('/api/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Profile not found' });
    }
    return res.status(200).json({ status: 'success', data: profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

app.get('/api/profiles', async (req, res) => {
  try {
    const {
      gender,
      country_id,
      age_group,
      min_age,
      max_age,
      min_gender_probablity,
      max_gender_probability,
      sort_by,
      order,
      page,
      limit,
    } = req.query;

    const page1 = Math.max(1, parseInt(page as string) || 1);
    const limit1 = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
    const skip = (page1 - 1) * limit1;

    if (
      !gender &&
      !country_id &&
      !age_group &&
      !min_age &&
      !max_age &&
      !min_gender_probablity &&
      !max_gender_probability &&
      !sort_by &&
      !order &&
      !page &&
      !limit
    ) {
      const profiles = await prisma.profile.findMany({
        skip,
        take: limit1,
      });

      const total = await prisma.profile.count();
      return res.status(200).json({
        status: 'success',
        page: page1,
        limit: limit1,
        total,
        data: profiles,
      });
    }

    const where: any = {};
    if (gender) where.gender = { equals: (gender as string).toLowerCase() };
    if (country_id) where.country_id = { equals: country_id };

    const validAgeGroups = ['child', 'teen', 'adult', 'senior'];
    if (age_group && validAgeGroups.includes(age_group as string))
      where.age_group = { equals: age_group };

    if (min_age || max_age) {
      where.age = {};
      if (min_age) where.age.gte = parseInt(min_age as string);
      if (max_age) where.age.lte = parseInt(max_age as string);
    }

    if (min_gender_probablity || max_gender_probability) {
      where.gender_probability = {};
      if (min_gender_probablity)
        where.gender_probability.gte = parseFloat(
          min_gender_probablity as string,
        );
      if (max_gender_probability)
        where.gender_probability.lte = parseFloat(
          max_gender_probability as string,
        );
    }

    const sortBy = sort_by as ValidSortField;
    const order1 = order as ValidOrder;

    // const orderBy: Prisma.ProfileOrderByWithRelationInput = {
    //   [sortBy]: order1,
    // };

    const profiles = await prisma.profile.findMany({
      skip,
      take: limit1,
      where,
      orderBy: {
        [sortBy as string]: order1,
      },
    });
    const total = await prisma.profile.count({ where });

    // const profiles = await prisma.profile.findMany({
    //   where: {
    //     OR: [
    //       { gender: { equals: gender as string } },
    //       { country_id: { equals: country_id as string } },
    //       { age_group: { equals: age_group as string } },
    //       { age: { gte: min_age, lte: max_age  } },
    //     ],
    //     AND: [
    //       { gender: { equals: gender as string } },
    //       { country_id: { equals: country_id as string } },
    //       { age_group: { equals: age_group as string } },
    //     ],
    //   },
    // });
    return res.status(200).json({
      status: 'success',
      page: page1,
      limit: limit1,
      total: total,
      data: profiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

app.delete('/api/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.profile.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});
//Task 2 --->

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
