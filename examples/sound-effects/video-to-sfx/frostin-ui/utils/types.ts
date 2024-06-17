export type Loose<T> = T | (string & {});
export type Strictify<T extends string> = T extends `${infer _}` ? T : never;
