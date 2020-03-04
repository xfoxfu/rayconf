/* eslint-disable class-methods-use-this */
import isFQDN from "validator/lib/isFQDN";
import isIP from "validator/lib/isIP";

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/; // intentionally non-exhaustive

export class TransformError extends Error {
  public readonly uiMsg: string;
  constructor(message: string, option: Options<unknown>) {
    super(message);
    this.name = "TransformError";
    this.uiMsg = `${message}\n`;
    this.uiMsg += `(required) ${option.desc}`;
  }
}

interface Options<T> {
  /**
   * optional array of possible values
   */
  choices?: T[];
  /**
   * optional description
   */
  desc?: string;
  /**
   * optional example value (in string)
   */
  example?: string;
}

export abstract class PropertyTransformer<T> {
  public readonly options: Options<T>;

  constructor(options: Partial<Options<T>>) {
    this.options = {
      ...options,
    };
  }

  protected abstract _transform(value: string): T;

  public transform(value: string | undefined): T {
    if (value === undefined) {
      this.throwError("Property is required.");
    }
    const result = this._transform(value);
    if (
      this.options.choices &&
      this.options.choices.includes(result) === false
    ) {
      this.throwError(`Value ${result} is not in choices enum.`);
    }
    return result;
  }

  protected throwError(message: string): never {
    throw new TransformError(message, this.options);
  }
}

class StringTransformer extends PropertyTransformer<string> {
  protected _transform(value: string): string {
    return value;
  }
}

class EmailTransformer extends PropertyTransformer<string> {
  protected _transform(value: string): string {
    if (EMAIL_REGEX.test(value)) return value;
    this.throwError(`Invalid email address: "${value}"`);
  }
}

class UriTransformer extends PropertyTransformer<string> {
  protected _transform(value: string): string {
    // eslint-disable-next-line @typescript-eslint/camelcase
    if (!isFQDN(value, { require_tld: false }) && !isIP(value)) {
      this.throwError(`Invalid host (domain or ip): "${value}"`);
    }
    return value;
  }
}

class BooleanTransformer extends PropertyTransformer<boolean> {
  protected _transform(value: string): boolean {
    if (
      ["true", "false", "yes", "no", "t", "f", "1", "0"].includes(
        value?.toLowerCase() ?? "",
      )
    ) {
      if (["true", "yes", "t", "1"].includes(value?.toLowerCase() ?? "")) {
        return true;
      }
      return false;
    }
    this.throwError("Invalid property value.");
  }
}

class NumberTransformer extends PropertyTransformer<number> {
  protected _transform(value: string): number {
    const coerced = +value;
    if (Number.isNaN(coerced))
      this.throwError(`Invalid number input: "${value}"`);
    return coerced;
  }
}

class PortTransformer extends PropertyTransformer<number> {
  protected _transform(value: string): number {
    const coerced = +value;
    if (Number.isNaN(coerced))
      this.throwError(`Invalid number input: "${value}"`);
    if (coerced < 0 || coerced > 65535 || !Number.isInteger(coerced)) {
      this.throwError(`Port ${coerced} out of range.`);
    }
    return coerced;
  }
}

class JsonTransformer<T> extends PropertyTransformer<T> {
  protected _transform(value: string): T {
    try {
      return JSON.parse(value);
    } catch (err) {
      this.throwError(`Invalid JSON value '${value}' since ${err?.message}`);
    }
  }
}

class OptionalTransformer<T> extends PropertyTransformer<T | null> {
  private readonly transformer: PropertyTransformer<T>;

  constructor(transformer: PropertyTransformer<T>) {
    super(transformer.options);
    this.transformer = transformer;
  }

  public _transform(): T {
    throw new TypeError("Cannot call internal method directly.");
  }

  public transform(value: string | undefined): T | null {
    if (value === undefined) return null;
    return this.transformer.transform(value);
  }
}

type TransformerCreator<T> = (
  opt?: Partial<Options<T>>,
) => PropertyTransformer<T>;

export const str: TransformerCreator<string> = (opt = {}) =>
  new StringTransformer(opt);
export const email: TransformerCreator<string> = (opt = {}) =>
  new EmailTransformer(opt);
export const uri: TransformerCreator<string> = (opt = {}) =>
  new UriTransformer(opt);
export const bool: TransformerCreator<boolean> = (opt = {}) =>
  new BooleanTransformer(opt);
export const num: TransformerCreator<number> = (opt = {}) =>
  new NumberTransformer(opt);
export const port: TransformerCreator<number> = (opt = {}) =>
  new PortTransformer(opt);
export const json = <T>(
  opt: Partial<Options<T>> = {},
): PropertyTransformer<T> => new JsonTransformer<T>(opt);
export const optional = <T>(
  trans: PropertyTransformer<T>,
): PropertyTransformer<T | null> => new OptionalTransformer(trans);
