// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { drizzle } from "drizzle-orm/neon-http";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

import { getConfig } from "./config.js";
import * as authSchema from "../models/auth.js";
import * as billingSchema from "../models/billing.js";
import * as accountPoolSchema from "../models/account-pool.js";
import type { ContextEnv } from "../types/hono.js";

let dbCache: ReturnType<typeof drizzle> | null = null;

export const getDb = (c?: Context<ContextEnv>): ReturnType<typeof drizzle> => {
  if (!dbCache) {
    const cfg = getConfig(c);

    // 如果启用了 auth，使用 auth 数据库
    // 否则使用环境变量中的数据库 URL 或默认值
    let databaseUrl = process.env.DATABASE_URL;

    if (cfg.auth.enabled && cfg.auth.database_url) {
      databaseUrl = cfg.auth.database_url;
    }

    if (!databaseUrl) {
      throw new HTTPException(500, {
        message: "Database URL not configured. Set DATABASE_URL environment variable or enable auth with database_url in config.",
      });
    }

    dbCache = drizzle(databaseUrl, {
      schema: {
        ...authSchema,
        ...billingSchema,
        ...accountPoolSchema,
      },
    });
  }
  return dbCache;
};

// 导出 schema 类型供使用
export { accountPoolSchema };
