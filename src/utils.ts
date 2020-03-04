/**
 * 将 SnakeCase 的属性名转变为 UNDERSCORE_CASE
 * @param name 需要转换的属性名
 */
export const snakeToUnderscore = (name: string): string => {
  enum SnakeCaseState {
    Start,
    Lower,
    Upper,
    NewWord,
  }

  let sb = "";
  let state = SnakeCaseState.Start;
  for (let i = 0; i < name.length; i += 1) {
    //             {
    if (name[i] === " ") {
      if (state !== SnakeCaseState.Start) {
        state = SnakeCaseState.NewWord;
      }
    } else if (name[i] === name[i].toUpperCase()) {
      switch (state) {
        case SnakeCaseState.Upper: {
          const hasNext = i + 1 < name.length;
          if (i > 0 && hasNext) {
            const nextChar = name[i + 1];
            if (!(nextChar === nextChar.toUpperCase()) && nextChar !== "_") {
              sb += "_";
            }
          }
          break;
        }
        case SnakeCaseState.Lower:
        case SnakeCaseState.NewWord:
          sb += "_";
          break;
        default:
          break;
      }
      sb += name[i].toUpperCase();
      state = SnakeCaseState.Upper;
    } else if (name[i] === "_") {
      sb += "_";
      state = SnakeCaseState.Start;
    } else {
      if (state === SnakeCaseState.NewWord) {
        sb += "_";
      }
      sb += name[i].toUpperCase();
      state = SnakeCaseState.Lower;
    }
  }
  return sb;
};

export const snakeArrToUnderscore = (...names: string[]): string =>
  names.map(snakeToUnderscore).join("_");
