import { PropertyTransformer, TransformError } from "./transformer";
import { KVProvider, EnvVarProvider } from "./provider";

/**
 * 配置对象的描述
 */
export type ConfigDef = {
  [k: string]: PropertyTransformer<unknown> | ConfigDef;
};

export type ConfigObj = {
  [k: string]: string | boolean | number | bigint | ConfigObj;
};

/**
 * 根据描述构造对应的配置对象的类型
 */
export type ConfigFromDef<T> = {
  [k in keyof T]: T[k] extends PropertyTransformer<infer V>
    ? V
    : ConfigFromDef<T[k]>;
};

/**
 * 错误集合
 */
type ErrorCollection = {
  [k: string]: TransformError | undefined;
};

const _getValueFromProviders = (
  kvProviders: KVProvider[],
  keys: string[],
): string | null => {
  for (const provider of kvProviders) {
    const result = provider.provide(keys);
    if (result !== null) {
      return result;
    }
  }
  return null;
};

/**
 * 递归生成配置对象
 * @param def 当前层的配置定义
 * @param result 当前层的配置对象
 * @param prev 上级的全部键
 * @param knownErrs 已知错误数组
 * @param kvProviders 配置数据来源
 */
const _exploreAndSet = (
  def: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  result: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  prev: string[],
  knownErrs: ErrorCollection,
  kvProviders: KVProvider[],
): void => {
  // 遍历当前层对象
  for (const [key, keyDef] of Object.entries(def)) {
    const keyArr = [...prev, key];
    // 如果是属性，则进行处理
    if (keyDef instanceof PropertyTransformer) {
      try {
        // 获得值
        const envVal = _getValueFromProviders(kvProviders, keyArr);
        // 变换为目标格式
        result[key] = keyDef.transform(envVal ?? undefined);
      } catch (err) {
        // 发生错误则纪录到数组中
        knownErrs[keyArr.join(".")] = err;
      }
    } else if (typeof keyDef === "object") {
      // 如果是嵌套对象，则递归处理
      if (typeof result[key] !== "object") {
        result[key] = {};
      }
      _exploreAndSet(keyDef, result[key], keyArr, knownErrs, kvProviders);
    } else {
      // 如果都不是，属于意料之外，是代码错误，直接抛出错误
      throw new TypeError(
        `Expected instance of PropertyTransformer, got ${typeof keyDef} at ${keyArr.join(
          ".",
        )}`,
      );
    }
  }
};

/**
 * 根据配置对象描述从环境变量中读取所需信息
 * @param def 配置对象描述
 * @param providers 配置数据提供者，按数组从前而后作为优先级
 */
export const envconf = <T extends ConfigDef>(
  def: T,
  providers: KVProvider[] = [new EnvVarProvider()],
): ConfigFromDef<T> => {
  // 声明结果存储变量
  const result: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  const knownErrs: ErrorCollection = {};

  // 递归处理嵌套内容
  _exploreAndSet(def, result, [], knownErrs, providers);

  // 处理过程中的错误，如有错误，输出提示并退出进程
  if (Object.keys(knownErrs).length > 0) {
    /* eslint-disable no-console */
    console.error("================================");
    console.error("Invalid configuration environment vars:");
    for (const [key, err] of Object.entries(knownErrs)) {
      console.error(`${key}: ${err?.uiMsg}`);
    }
    console.error("================================");
    /* eslint-enable no-console */
    process.exit(1);
  }

  // 返回结果
  return result;
};

export default envconf;
