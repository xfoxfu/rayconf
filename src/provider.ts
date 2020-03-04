/* eslint-disable class-methods-use-this */

import { snakeArrToUnderscore } from "./utils";

export abstract class KVProvider {
  protected abstract _provide(keys: string[]): string | null;
  public provide(keys: string[]): string | null {
    return this._provide(keys);
  }
}

export class EnvVarProvider extends KVProvider {
  protected _provide(keys: string[]): string | null {
    return process.env[snakeArrToUnderscore(...keys)] ?? null;
  }
}

export class ConstProvider extends KVProvider {
  private readonly matchEnv?: string;
  private readonly values: NodeJS.ProcessEnv;

  private static _normalizeEnvName = (env: string): string => {
    if (env === "development") {
      return "dev";
    } else if (env === "production") {
      return "prod";
    }
    return env;
  };

  private static flatten = (
    obj: object,
    prefix = "",
    res: NodeJS.ProcessEnv = {},
  ): NodeJS.ProcessEnv =>
    Object.entries(obj).reduce((r, [key, val]) => {
      const k = `${prefix}${key}`;
      if (typeof val === "object") {
        ConstProvider.flatten(val, `${k}.`, r);
      } else {
        res[k] = val;
      }
      return r;
    }, res);

  /**
   * @param matchEnv 匹配的环境类型，
   *    其中 `development` 和 `dev` 等价，`production` 和 `prod` 等价
   * @param values 提供的默认属性值
   */
  constructor(
    matchEnv: string | undefined,
    values: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {
    super();
    if (matchEnv) this.matchEnv = ConstProvider._normalizeEnvName(matchEnv);
    this.values = ConstProvider.flatten(values);
  }

  /**
   * 判断当前环境是否匹配默认值要求的环境变量
   */
  canMatch(): boolean {
    if (!this.matchEnv) return true;
    return (
      ConstProvider._normalizeEnvName(process.env.NODE_ENV ?? "dev") ===
      ConstProvider._normalizeEnvName(this.matchEnv)
    );
  }

  protected _provide(keys: string[]): string | null {
    if (!this.canMatch()) {
      return null;
    }

    return this.values[keys.join(".")] ?? null;
  }
}
