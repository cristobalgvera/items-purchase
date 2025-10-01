declare const __brand: unique symbol;

export type Branded<Type, Brand> = Type & { [__brand]: Brand };
export type Unbranded<Type> = Type extends { [__brand]: infer _Brand }
  ? Omit<Type, typeof __brand>
  : Type;
