/**
 * Standard repository interface and query options.
 *
 * Defines the generic contract that all concrete repositories conform to.
 */

export interface QueryOptions {
  sort?: Record<string, 1 | -1 | "asc" | "desc">;
  limit?: number;
  skip?: number;
  projection?: Record<string, 0 | 1 | boolean>;
  populate?: Array<{ path: string; select?: string }>;
}

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findOne(filter: Record<string, any>): Promise<T | null>;
  findMany(filter?: Record<string, any>, options?: QueryOptions): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  updateById(id: string, data: Partial<T>): Promise<T | null>;
  updateOne(filter: Record<string, any>, data: Partial<T>): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
  deleteOne(filter: Record<string, any>): Promise<boolean>;
  deleteMany(filter: Record<string, any>): Promise<number>;
  count(filter?: Record<string, any>): Promise<number>;
}
