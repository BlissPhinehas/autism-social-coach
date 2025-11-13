import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('frontend index.html basic UI', () => {
  // Use project root to resolve path; avoids issues with vitest runtime __dirname
  const filePath = path.join(process.cwd(), 'src', 'frontend', 'index.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  it('contains a Start Session button', () => {
    expect(html).toContain('id="startSessionBtn"');
  });

  it('contains a sessionControls container', () => {
    expect(html).toContain('id="sessionControls"');
  });
});
