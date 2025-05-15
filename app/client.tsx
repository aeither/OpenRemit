/// <reference types="vinxi/types/client" />
import { StartClient } from '@tanstack/start';
import { hydrateRoot } from 'react-dom/client';
import { createRouter } from './router';

const router = createRouter();

hydrateRoot(
  document, // Or document.getElementById('root') if that's your convention
  <StartClient router={router} />
);
