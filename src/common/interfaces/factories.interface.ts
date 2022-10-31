export interface IFactories<T, R> {
  getInstance(t: T): R;
}
