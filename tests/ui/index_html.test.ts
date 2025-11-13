import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('frontend index.html basic UI', () => {
  const filePath = path.resolve(__dirname, '../../src/frontend/index.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  it('contains a Start Session button', () => {
    expect(html).toContain('id="startSessionBtn"');
  });

  it('contains a sessionControls container', () => {
    expect(html).toContain('id="sessionControls"');
  });
});
