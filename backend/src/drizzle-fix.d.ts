import type { PgSelectBase, PgColumn, SQL, ValueOrArray } from 'drizzle-orm/pg-core';

declare module 'drizzle-orm/pg-core/query-builders/select' {
  interface PgSelectBase<TSelection, TDynamic, TState, TExecution, TDistinct extends string, TModifiers, TExtra> {
    having(having: ((aliases: TSelection) => SQL | undefined) | SQL | undefined): PgSelectBase<TSelection, TDynamic, 'having', TExecution, TDistinct, TModifiers, TExtra>;
    orderBy(builder: (aliases: TSelection) => ValueOrArray<PgColumn | SQL | SQL.Aliased>): PgSelectBase<TSelection, TDynamic, 'orderBy', TExecution, TDistinct, TModifiers, TExtra>;
    limit(limit: number): PgSelectBase<TSelection, TDynamic, 'limit', TExecution, TDistinct, TModifiers, TExtra>;
    offset(offset: number): PgSelectBase<TSelection, TDynamic, 'offset', TExecution, TDistinct, TModifiers, TExtra>;
    where(where: ((aliases: TSelection) => SQL | undefined) | SQL | undefined): PgSelectBase<TSelection, TDynamic, 'where', TExecution, TDistinct, TModifiers, TExtra>;
    groupBy(builder: (aliases: TSelection) => ValueOrArray<PgColumn | SQL | SQL.Aliased>): PgSelectBase<TSelection, TDynamic, 'groupBy', TExecution, TDistinct, TModifiers, TExtra>;
  }
}
