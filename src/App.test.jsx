import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import App from './App';

it('renders the standalone game with easy mode, introduction and projects footer', () => {
  const html = renderToStaticMarkup(<App />);
  expect(html).toContain('Riconosci l&#x27;odore. Menta o Cumino?');
  expect(html).toMatch(/aria-pressed="true"[^>]*>Facile<\/button>/);
  expect(html).toContain('Inizia la sfida');
  expect(html).toContain('https://links-page-bennibeni.vercel.app/');
  expect(html).toContain('Giochi · Menta o Cumino');
  expect(html).not.toContain('· R46');
});
