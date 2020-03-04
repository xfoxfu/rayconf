import { PropertyTransformer, TransformError } from "./transformer";
import { KVProvider, EnvVarProvider } from "./provider";

/**
 * declaration of structure of configuration object
 */
export type ConfigDef = {
  [k: string]: PropertyTransformer<unknown> | ConfigDef;
};

export type ConfigObj = {
  [k: string]: string | boolean | number | bigint | ConfigObj;
};

/**
 * get config object type from type of definition object
 */
export type ConfigFromDef<T> = {
  [k in keyof T]: T[k] extends PropertyTransformer<infer V>
    ? V
    : ConfigFromDef<T[k]>;
};

/**
 * error collection
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
 * generate config object recursively
 * @param def definition on current layer
 * @param result object on current layer
 * @param prev all keys from upper layers
 * @param knownErrs known errors
 * @param kvProviders config data sources
 */
const _exploreAndSet = (
  def: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  result: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  prev: string[],
  knownErrs: ErrorCollection,
  kvProviders: KVProvider[],
): void => {
  // iterate current layer
  for (const [key, keyDef] of Object.entries(def)) {
    const keyArr = [...prev, key];
    // if it is a property
    if (keyDef instanceof PropertyTransformer) {
      try {
        // acquire value
        const envVal = _getValueFromProviders(kvProviders, keyArr);
        // transform into target type
        result[key] = keyDef.transform(envVal ?? undefined);
      } catch (err) {
        // if any error occurs, record it in the map
        knownErrs[keyArr.join(".")] = err;
      }
    } else if (typeof keyDef === "object") {
      // if a nested object, handle recursively
      if (typeof result[key] !== "object") {
        result[key] = {};
      }
      _exploreAndSet(keyDef, result[key], keyArr, knownErrs, kvProviders);
    } else {
      // neither means an error in declaration
      throw new TypeError(
        `Expected instance of PropertyTransformer, got ${typeof keyDef} at ${keyArr.join(
          ".",
        )}`,
      );
    }
  }
};

/**
 * read data according to definition and value providers
 * @param def definition of config object
 * @param providers value provider, ordered in the order of array, defaults to a single source from env var
 */
export const envconf = <T extends ConfigDef>(
  def: T,
  providers: KVProvider[] = [new EnvVarProvider()],
): ConfigFromDef<T> => {
  // result storage
  const result: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  const knownErrs: ErrorCollection = {};

  // handle object recursively
  _exploreAndSet(def, result, [], knownErrs, providers);

  // get all errors and output to the screen
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

  return result;
};

export default envconf;
