import { hcWithType } from "@go/server/client";
import { QueryClient } from "@tanstack/react-query";

import { createHonoQueryClient } from "./tanstack-rpc";

export const rpcClient = hcWithType(import.meta.env.VITE_BASE_URL);
export const queryClient = new QueryClient();

export const rpc = createHonoQueryClient(rpcClient, queryClient);
