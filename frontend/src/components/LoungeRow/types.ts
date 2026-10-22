import type { Lounge } from '../../types/lounge';

type LoungeRowProps = {
  lounge: Lounge;
  onBook: (lounge: Lounge) => void;
};

export type { LoungeRowProps };
