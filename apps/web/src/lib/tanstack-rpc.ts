import type {
  QueryClient,
  QueryFunctionContext,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";
import type {
  ClientRequestOptions,
  ClientResponse,
  InferRequestType,
  InferResponseType
} from "hono/client";

// oxlint-disable typescript/no-explicit-any
// oxlint-disable typescript/no-empty-object-type
// oxlint-disable typescript/ban-types
import { useMutation, useQuery } from "@tanstack/react-query";

const HTTP_METHODS = new Set(["$get", "$post", "$put", "$patch", "$delete"]);

const HONO_INPUT_KEYS = new Set([
  "param",
  "query",
  "json",
  "form",
  "header",
  "cookie"
]);

type RpcEndpoint = (
  args: any,
  options?: ClientRequestOptions
) => Promise<ClientResponse<any>>;

type InferData<TEndpoint extends RpcEndpoint> = InferResponseType<
  TEndpoint,
  200
>;
type InferInput<TEndpoint extends RpcEndpoint> = InferRequestType<TEndpoint>;

type NeedsInput<TEndpoint extends RpcEndpoint> =
  {} extends InferInput<TEndpoint> ? false : true;

type HonoInput<TEndpoint extends RpcEndpoint> =
  NeedsInput<TEndpoint> extends true
    ? InferInput<TEndpoint>
    : InferInput<TEndpoint>;

type RpcQueryArgs<
  TEndpoint extends RpcEndpoint,
  TSelected = InferData<TEndpoint>
> = Omit<
  UseQueryOptions<InferData<TEndpoint>, ApiError, TSelected, QueryKey>,
  "queryKey" | "queryFn"
> &
  HonoInput<TEndpoint>;

type RpcMutationArgs<TEndpoint extends RpcEndpoint, TContext = unknown> = Omit<
  UseMutationOptions<
    InferData<TEndpoint>,
    ApiError,
    InferInput<TEndpoint>,
    TContext
  >,
  "mutationKey" | "mutationFn"
> & {
  invalidate?:
    | QueryKey[]
    | false
    | ((
        data: InferData<TEndpoint>,
        variables: InferInput<TEndpoint>
      ) => QueryKey[] | false);
};

type BuiltQueryOptions<
  TEndpoint extends RpcEndpoint,
  TSelected = InferData<TEndpoint>
> = Omit<
  UseQueryOptions<InferData<TEndpoint>, ApiError, TSelected, QueryKey>,
  "queryKey" | "queryFn"
> & {
  queryKey: QueryKey;
  queryFn: (
    context: QueryFunctionContext<QueryKey>
  ) => Promise<InferData<TEndpoint>>;
};

type BuiltMutationOptions<
  TEndpoint extends RpcEndpoint,
  TContext = unknown
> = Omit<
  UseMutationOptions<
    InferData<TEndpoint>,
    ApiError,
    InferInput<TEndpoint>,
    TContext
  >,
  "mutationKey" | "mutationFn"
> & {
  mutationKey: QueryKey;
  mutationFn: (
    variables: InferInput<TEndpoint>
  ) => Promise<InferData<TEndpoint>>;
};

export class ApiError<TBody = unknown> extends Error {
  readonly body: TBody;
  readonly status: number;

  constructor(status: number, body: TBody) {
    super(buildErrorMessage(status, body));
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  is(status: number) {
    return this.status === status;
  }
}

function buildErrorMessage(status: number, body: unknown): string {
  if (body && typeof body === "object") {
    const maybeMessage =
      (body as { message?: unknown; error?: unknown }).message ??
      (body as { error?: unknown }).error;
    if (typeof maybeMessage === "string" && maybeMessage.length > 0) {
      return `HTTP ${status}: ${maybeMessage}`;
    }
  }
  if (typeof body === "string" && body.length > 0) {
    return `HTTP ${status}: ${body.slice(0, 200)}`;
  }
  return `HTTP ${status}`;
}

export interface RpcQueryEndpoint<TEndpoint extends RpcEndpoint> {
  $infer: {
    data: InferData<TEndpoint>;
    input: InferInput<TEndpoint>;
    error: ApiError;
  };
  call: TEndpoint;
  getQueryKey(input?: InferInput<TEndpoint>): QueryKey;
  invalidate(input?: InferInput<TEndpoint>): Promise<void>;
  mutationOptions<TContext = unknown>(
    args?: RpcMutationArgs<TEndpoint, TContext>
  ): BuiltMutationOptions<TEndpoint, TContext>;
  queryOptions<TSelected = InferData<TEndpoint>>(
    args?: RpcQueryArgs<TEndpoint, TSelected>
  ): BuiltQueryOptions<TEndpoint, TSelected>;
  useMutation<TContext = unknown>(
    args?: RpcMutationArgs<TEndpoint, TContext>
  ): UseMutationResult<
    InferData<TEndpoint>,
    ApiError,
    InferInput<TEndpoint>,
    TContext
  >;
  useQuery<TSelected = InferData<TEndpoint>>(
    args?: RpcQueryArgs<TEndpoint, TSelected>
  ): UseQueryResult<TSelected, ApiError>;
}

export type HonoQueryClient<TClient> = {
  [TKey in keyof TClient]: TClient[TKey] extends RpcEndpoint
    ? RpcQueryEndpoint<TClient[TKey]>
    : TClient[TKey] extends object
      ? HonoQueryClient<TClient[TKey]>
      : TClient[TKey];
};

export function createHonoQueryClient<TClient extends object>(
  client: TClient,
  queryClient: QueryClient
): HonoQueryClient<TClient> {
  return createProxy(client, queryClient);
}

// ---------- internals ----------

function createProxy<TClient extends object>(
  target: TClient,
  queryClient: QueryClient,
  path: string[] = [],
  cache = new WeakMap<object, unknown>()
): HonoQueryClient<TClient> {
  return new Proxy(target, {
    get(currentTarget, prop, receiver) {
      const value = Reflect.get(currentTarget, prop, receiver);

      // 拦截 thenable 探测，避免被 await 当成 Promise。
      if (
        typeof prop !== "string" ||
        prop === "then" ||
        prop === "catch" ||
        prop === "finally"
      ) {
        return value;
      }

      if (HTTP_METHODS.has(prop)) {
        const cached = cache.get(value as object);
        if (cached) {
          return cached;
        }
        const ep = createEndpoint(
          value as RpcEndpoint,
          path,
          prop,
          queryClient
        );
        cache.set(value as object, ep);
        return ep;
      }

      if (value && (typeof value === "object" || typeof value === "function")) {
        const cached = cache.get(value as object);
        if (cached) {
          return cached;
        }
        const child = createProxy(
          value as object,
          queryClient,
          [...path, prop],
          cache
        );
        cache.set(value as object, child);
        return child;
      }

      return value;
    }
  }) as HonoQueryClient<TClient>;
}

function createEndpoint<TEndpoint extends RpcEndpoint>(
  endpoint: TEndpoint,
  basePath: string[],
  verb: string,
  queryClient: QueryClient
): RpcQueryEndpoint<TEndpoint> {
  const namespaceKey: QueryKey = basePath;
  const fullPath: string[] = [...basePath, verb];

  const rpcEndpoint: RpcQueryEndpoint<TEndpoint> = {
    $infer: undefined as unknown as RpcQueryEndpoint<TEndpoint>["$infer"],
    call: endpoint,
    getQueryKey(input) {
      return buildQueryKey(fullPath, input);
    },
    async invalidate(input) {
      await queryClient.invalidateQueries({
        queryKey: buildQueryKey(fullPath, input)
      });
    },
    mutationOptions<TContext = unknown>(
      args?: RpcMutationArgs<TEndpoint, TContext>
    ) {
      const { invalidate, onSuccess, ...rest } = args ?? {};

      const built: BuiltMutationOptions<TEndpoint, TContext> = {
        ...(rest as Omit<
          UseMutationOptions<
            InferData<TEndpoint>,
            ApiError,
            InferInput<TEndpoint>,
            TContext
          >,
          "mutationKey" | "mutationFn" | "onSuccess"
        >),
        mutationFn: (variables) => callEndpoint(endpoint, variables),
        mutationKey: buildQueryKey(fullPath),
        onSuccess: async (data, variables, onMutateResult, context) => {
          await onSuccess?.(data, variables, onMutateResult, context);

          if (invalidate === false || invalidate === undefined) {
            return;
          }

          const keys =
            typeof invalidate === "function"
              ? invalidate(data, variables)
              : invalidate;

          if (keys === false || !keys || keys.length === 0) {
            return;
          }

          await invalidateQueries(queryClient, keys);
        }
      };
      return built;
    },
    queryOptions<TSelected = InferData<TEndpoint>>(
      args?: RpcQueryArgs<TEndpoint, TSelected>
    ) {
      const { input, options } = splitArgs(args);

      const built: BuiltQueryOptions<TEndpoint, TSelected> = {
        ...(options as Omit<
          UseQueryOptions<InferData<TEndpoint>, ApiError, TSelected, QueryKey>,
          "queryKey" | "queryFn"
        >),
        queryFn: ({ signal }) => callEndpoint(endpoint, input, signal),
        queryKey: buildQueryKey(fullPath, input)
      };
      return built;
    },
    useMutation<TContext = unknown>(
      args?: RpcMutationArgs<TEndpoint, TContext>
    ) {
      return useMutation(rpcEndpoint.mutationOptions<TContext>(args));
    },
    useQuery<TSelected = InferData<TEndpoint>>(
      args?: RpcQueryArgs<TEndpoint, TSelected>
    ) {
      return useQuery(rpcEndpoint.queryOptions<TSelected>(args));
    }
  };

  return rpcEndpoint;
  // oxlint-disable-next-line no-unreachable
  void namespaceKey;
}

function splitArgs(args: Record<string, unknown> | undefined): {
  input: Record<string, unknown>;
  options: Record<string, unknown>;
} {
  const input: Record<string, unknown> = {};
  const options: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args ?? {})) {
    if (HONO_INPUT_KEYS.has(key)) {
      input[key] = value;
    } else {
      options[key] = value;
    }
  }

  return { input, options };
}

async function callEndpoint<TEndpoint extends RpcEndpoint>(
  endpoint: TEndpoint,
  input?: Record<string, unknown> | unknown,
  signal?: AbortSignal
): Promise<InferData<TEndpoint>> {
  const safeInput = (input ?? {}) as Parameters<TEndpoint>[0];
  const requestOptions: ClientRequestOptions | undefined = signal
    ? { init: { signal } }
    : undefined;

  const response = await endpoint(safeInput, requestOptions);
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as InferData<TEndpoint>;
}

async function readResponseBody(
  response: Response | ClientResponse<unknown>
): Promise<unknown> {
  if (
    "status" in response &&
    (response.status === 204 || response.status === 205)
  ) {
    return null;
  }

  const contentType = response.headers?.get?.("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await (response as Response).json();
    } catch {
      return null;
    }
  }

  if (
    contentType.startsWith("text/") ||
    contentType.includes("xml") ||
    contentType.includes("html") ||
    contentType === ""
  ) {
    const text = await (response as Response).text();
    if (!text) {
      return null;
    }
    if (!contentType) {
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
    return text;
  }

  return await (response as Response).blob();
}

function buildQueryKey(fullPath: string[], input?: unknown): QueryKey {
  const normalized =
    input && typeof input === "object" && Object.keys(input).length > 0
      ? input
      : {};
  return [...fullPath, normalized];
}

async function invalidateQueries(queryClient: QueryClient, keys: QueryKey[]) {
  await Promise.all(
    keys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
  );
}
