import { ICard } from './Card';
import Nobility from './Nobility';
export default interface User {
  name: string | null,
  id: string | null,
  cards?: any,
  gems?: any,
  nobility?: Nobility,
  ownScore?: number,
  tscards?: ICard[],
};