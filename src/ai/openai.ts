import {genkit} from 'genkit';
import {openai} from 'openai';

export const oai = genkit({
  plugins: [openai()],
  model: 'openai/gpt-4-turbo-preview',
});
