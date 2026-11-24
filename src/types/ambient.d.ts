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

  interface Express {
    [key: string]: any;
    use(...handlers: any[]): this;
    set(setting: string, val: any): this;
    listen(port: number, callback?: () => void): any;
  }

  function express(): Express;
  namespace express {
    export function static(root: string, options?: any): any;
    export function json(options?: any): any;
    export function urlencoded(options?: any): any;
  }

  export default express;
}
