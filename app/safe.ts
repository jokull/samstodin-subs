import { err, ok } from "neverthrow";
import { z } from "zod";

import { Result, ResultAsync } from "neverthrow";
import type { ZodError, ZodSchema } from "zod";

export type FetchError<E> = NetworkError | HttpError<E> | ParseError;

export interface NetworkError {
  type: "network";
  error: Error;
}

export interface HttpError<E = unknown> {
  type: "http";
  url: string;
  status: number;
  headers: Headers;
  json?: E;
}

export interface ParseError {
  type: "parse";
  error: Error;
}


export interface ZodParseError<T> {
  type: "zod";
  error: ZodError<T>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeZodParse<TSchema extends ZodSchema<any>>(
  schema: TSchema,
): (
  data: unknown,
) => Result<z.infer<TSchema>, ZodParseError<z.infer<TSchema>>> {
  return (data: unknown) => {
    const result = schema.safeParse(data);

    return result.success
      ? ok(result.data)
      : err({
          type: "zod",
          error: result.error,
        });
  };
}


export function safeFetch<T = unknown, E = unknown>(
  input: URL | string,
  init?: RequestInit,
  fetcher: typeof globalThis.fetch = globalThis.fetch,
): ResultAsync<T, FetchError<E>> {
  return ResultAsync.fromPromise(
    fetcher(input, init),
    (error): NetworkError => ({
      type: "network",
      error: error instanceof Error ? error : new Error(String(error)),
    }),
  ).andThen((response) => {
    if (!response.ok) {
      return ResultAsync.fromSafePromise(
        response.json().catch(() => undefined),
      ).andThen((json) => {
        const error: HttpError<E> = {
          type: "http" as const,
          url: input.toString(),
          status: response.status,
          headers: response.headers,
          json: json as E | undefined,
        };
        return err(error);
      });
    }
    return ResultAsync.fromPromise(
      response.json() as Promise<T>,
      (error): ParseError => ({
        type: "parse",
        error: error instanceof Error ? error : new Error(String(error)),
      }),
    );
  });
}


interface JSONParseError { message: string }
const toParseError = (): JSONParseError => ({ message: "Parse Error" })

export const safeJsonParse = Result.fromThrowable(JSON.parse, toParseError)
