import { expect as vitestExpect, vi as vitestVi } from 'vitest';
import '@testing-library/jest-dom/vitest';

declare global {
  var expect: typeof vitestExpect;
  var vi: typeof vitestVi;
}

globalThis.expect = vitestExpect;
globalThis.vi = vitestVi;
