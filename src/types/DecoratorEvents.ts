import type { Enhet } from './Enhet';

export type EnhetChangedDetail = {
  enhet?: string | null | undefined;
  enhetObjekt?: Enhet | undefined;
};

export type FnrChangedDetail = {
  fnr?: string | null | undefined;
};

export type LinkClickDetail = {
  text: string;
  url: string;
};
