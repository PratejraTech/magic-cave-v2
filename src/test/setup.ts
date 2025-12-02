import { expect as vitestExpect, vi as vitestVi } from 'vitest';
import '@testing-library/jest-dom/vitest';

declare global {
  // eslint-disable-next-line no-var
  var expect: typeof vitestExpect;
  // eslint-disable-next-line no-var
  var vi: typeof vitestVi;
}

globalThis.expect = vitestExpect;
globalThis.vi = vitestVi;
