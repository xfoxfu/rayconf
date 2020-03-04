import test from "ava";
import { snakeToUnderscore, snakeArrToUnderscore } from "./utils";

test("snakeToUnderscore", t => {
  // These test cases were copied from Json.NET.
  t.is(snakeToUnderscore("URLValue"), "URL_VALUE");
  t.is(snakeToUnderscore("URL"), "URL");
  t.is(snakeToUnderscore("ID"), "ID");
  t.is(snakeToUnderscore("I"), "I");
  t.is(snakeToUnderscore(""), "");
  t.is(snakeToUnderscore("Person"), "PERSON");
  t.is(snakeToUnderscore("iPhone"), "I_PHONE");
  t.is(snakeToUnderscore("IPhone"), "I_PHONE");
  t.is(snakeToUnderscore("I Phone"), "I_PHONE");
  t.is(snakeToUnderscore("I  Phone"), "I_PHONE");
  t.is(snakeToUnderscore(" IPhone"), "I_PHONE");
  t.is(snakeToUnderscore(" IPhone "), "I_PHONE");
  t.is(snakeToUnderscore("IsCIA"), "IS_CIA");
  t.is(snakeToUnderscore("VmQ"), "VM_Q");
  t.is(snakeToUnderscore("Xml2Json"), "XML2_JSON");
  t.is(snakeToUnderscore("SnAkEcAsE"), "SN_AK_EC_AS_E");
  t.is(snakeToUnderscore("SnA__kEcAsE"), "SN_A__K_EC_AS_E");
  t.is(snakeToUnderscore("SnA__ kEcAsE"), "SN_A__K_EC_AS_E");
  t.is(snakeToUnderscore("already_snake_case_ "), "ALREADY_SNAKE_CASE_");
  t.is(snakeToUnderscore("IsJSONProperty"), "IS_JSON_PROPERTY");
  t.is(snakeToUnderscore("SHOUTING_CASE"), "SHOUTING_CASE");
  t.is(
    snakeToUnderscore("9999-12-31T23:59:59.9999999Z"),
    "9999-12-31_T23:59:59.9999999_Z",
  );
  t.is(
    snakeToUnderscore("Hi!! This is text. Time to test."),
    "HI!!_THIS_IS_TEXT._TIME_TO_TEST.",
  );
});

test("snakeArrToUnderscore", t => {
  t.is(snakeArrToUnderscore("URL", "value"), "URL_VALUE");
});
