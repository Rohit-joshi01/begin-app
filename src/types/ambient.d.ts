/**
 * Ambient type declarations for standard Node.js global environments and built-in modules.
 */

interface ErrorConstructor {
  captureStackTrace(targetObject: object, constructorOpt?: Function): void;
}

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
    NODE_ENV?: string;
    PORT?: string;
    MONGO_URI?: string;
    JWT_SECRET?: string;
    OTP_SECRET?: string;
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_CALLBACK_URL?: string;
  }

  interface Process {
    env: ProcessEnv;
    argv: string[];
    on(event: string, listener: (...args: any[]) => void): this;
    exit(code?: number): never;
  }
}

declare const process: NodeJS.Process;

declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  debug?(...args: any[]): void;
};

declare class Buffer extends Uint8Array {
  static from(str: string, encoding?: string): Buffer;
  static from(arrayBuffer: ArrayBuffer | SharedArrayBuffer, byteOffset?: number, length?: number): Buffer;
  static from(array: any[]): Buffer;
  static isBuffer(obj: any): obj is Buffer;
  length: number;
}

declare module "node:buffer" {
  export { Buffer };
}

declare module "crypto" {
  export function createHmac(algorithm: string, key: string | Buffer): {
    update(data: string | Buffer): any;
    digest(encoding?: string): string;
  };
  export function randomInt(min: number, max?: number): number;
  export function timingSafeEqual(a: Uint8Array | Buffer, b: Uint8Array | Buffer): boolean;
}

declare module "node:crypto" {
  export * from "crypto";
}

declare function fetch(input: any, init?: any): Promise<any>;

declare class URLSearchParams {
  constructor(init?: any);
  append(name: string, value: string): void;
  toString(): string;
}

declare module "path" {
  export function resolve(...paths: string[]): string;
  export function extname(path: string): string;
  export function join(...paths: string[]): string;
  const _default: {
    resolve: typeof resolve;
    extname: typeof extname;
    join: typeof join;
  };
  export default _default;
}

declare module "node:path" {
  export * from "path";
  import path from "path";
  export default path;
}

declare module "fs" {
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: any): any;
  const _default: {
    existsSync: typeof existsSync;
    mkdirSync: typeof mkdirSync;
  };
  export default _default;
}

declare module "node:fs" {
  export * from "fs";
  import fs from "fs";
  export default fs;
}

declare module "resend" {
  export class Resend {
    constructor(apiKey: string);
    emails: {
      send(payload: any): Promise<{ data: any; error: any }>;
    };
  }
}

declare module "cookie-parser" {
  export default function cookieParser(...args: any[]): any;
}

declare module "multer" {
  export interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }

  export interface StorageEngine {
    _handleFile(req: any, file: any, cb: any): void;
    _removeFile(req: any, file: any, cb: any): void;
  }

  export function diskStorage(options: any): StorageEngine;

  export interface Instance {
    single(fieldName: string): any;
    array(fieldName: string, maxCount?: number): any;
    fields(fields: any[]): any;
    none(): any;
    any(): any;
  }

  export function diskStorage(options: any): StorageEngine;

  interface MulterFactory {
    (options?: any): Instance;
    diskStorage(options: any): StorageEngine;
  }

  const multer: MulterFactory;
  export default multer;
}

declare module "jsonwebtoken" {
  export function sign(payload: string | Buffer | object, secretOrPrivateKey: string | Buffer, options?: any): string;
  export function verify(token: string, secretOrPublicKey: string | Buffer, options?: any): any;
  export function decode(token: string, options?: any): any;
}

declare module "express" {
  export interface Request {
    [key: string]: any;
    body?: any;
    query?: any;
    params?: any;
    cookies?: any;
    user?: any;
    xhr?: boolean;
    headers?: any;
    path?: string;
  }

  export interface Response {
    [key: string]: any;
    status(code: number): this;
    json(body?: any): this;
    render(view: string, options?: object, callback?: (err: Error, html: string) => void): void;
    cookie(name: string, val: string, options?: any): this;
    clearCookie(name: string, options?: any): this;
    redirect(url: string): void;
    locals: Record<string, any>;
  }

  export type NextFunction = (err?: any) => void;

  export interface Router {
    [key: string]: any;
    get(path: string, ...handlers: any[]): this;
    post(path: string, ...handlers: any[]): this;
    put(path: string, ...handlers: any[]): this;
    delete(path: string, ...handlers: any[]): this;
    patch(path: string, ...handlers: any[]): this;
    use(...handlers: any[]): this;
  }

  export function Router(options?: any): Router;

  export interface Express {
    [key: string]: any;
    use(...handlers: any[]): this;
    set(setting: string, val: any): this;
    listen(port: number, callback?: () => void): any;
  }
  export type Application = Express;

  function express(): Express;
  namespace express {
    export function static(root: string, options?: any): any;
    export function json(options?: any): any;
    export function urlencoded(options?: any): any;
  }

  export default express;
}

declare module "node:assert" {
  export function ok(value: any, message?: string | Error): void;
  export function strictEqual(actual: any, expected: any, message?: string | Error): void;
  export function deepStrictEqual(actual: any, expected: any, message?: string | Error): void;
  export function notStrictEqual(actual: any, expected: any, message?: string | Error): void;
  export function rejects(asyncFn: (() => Promise<any>) | Promise<any>, error?: any, message?: string): Promise<void>;
  export function throws(block: () => any, error?: any, message?: string): void;
  const assert: {
    ok(value: any, message?: string | Error): void;
    strictEqual(actual: any, expected: any, message?: string | Error): void;
    deepStrictEqual(actual: any, expected: any, message?: string | Error): void;
    notStrictEqual(actual: any, expected: any, message?: string | Error): void;
    rejects(asyncFn: (() => Promise<any>) | Promise<any>, error?: any, message?: string): Promise<void>;
    throws(block: () => any, error?: any, message?: string): void;
  };
  export default assert;
}

declare module "assert" {
  export * from "node:assert";
  import assert from "node:assert";
  export default assert;
}

declare module "ejs" {
  export function render(template: string, data?: object, options?: object): string;
  export function renderFile(
    filename: string,
    data?: object,
    options?: object,
    callback?: (err: Error | null, str: string) => void
  ): void;
  const ejs: {
    render(template: string, data?: object, options?: object): string;
    renderFile(
      filename: string,
      data?: object,
      options?: object,
      callback?: (err: Error | null, str: string) => void
    ): void;
  };
  export default ejs;
}
