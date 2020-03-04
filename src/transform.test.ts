import test from "ava";
import {
  TransformError,
  str,
  email,
  uri,
  bool,
  num,
  port,
  json,
  optional,
} from "./transformer";

test("TransformError", t => {
  const error = new TransformError("message", {});
  t.is(error.name, "TransformError");
  t.is(error.uiMsg, "message\n(required) No description provided.");
});

test.todo("TransformError with description");
test.todo("str");
test.todo("email");
test.todo("uri");
test.todo("bool");
test.todo("num");
test.todo("port");
test.todo("json");
test.todo("optional");
