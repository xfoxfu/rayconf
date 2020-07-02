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
test("str", t => {
  t.is(str({}).transform("123"), "123");
  t.throws(() => str({ choices: ["foo", "bar"] }).transform("foobar"));
  t.is(str({ choices: ["foo", "bar"] }).transform("foo"), "foo");
});
test.todo("email");
test.todo("uri");
test.todo("bool");
test.todo("num");
test.todo("port");
test.todo("json");
test.todo("optional");
