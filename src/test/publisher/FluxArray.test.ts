import { describe, expect, test } from "bun:test";
import FluxArray from "publisher/FluxArray";
import NullishValueError from "publisher/NullishValueError";
import AssertSubscriber from "./AssertSubscriber";

describe("FluxArray", () => {
  test("normal", () => {
    const s = new AssertSubscriber();
    const f = new FluxArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    f.subscribe(s);
    s.assertComplete().assertValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
  });

  test("normalBackpressured", () => {
    const s = new AssertSubscriber(0);
    const f = new FluxArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    f.subscribe(s);

    s.assertNoValues().assertNoError().assertNotComplete();

    s.request(5);

    s.assertNoError().assertValues(1, 2, 3, 4, 5).assertNotComplete();

    s.request(10);

    s.assertNoError()
      .assertValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
      .assertComplete();
  });

  test("normalBackpressuredExact", () => {
    const s = new AssertSubscriber(10);
    const f = new FluxArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    f.subscribe(s);

    s.assertNoError()
      .assertValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
      .assertComplete();

    s.request(10);

    s.assertNoError()
      .assertValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
      .assertComplete();
  });

  test("arrayContainsNull", () => {
    const s = new AssertSubscriber();
    const f = new FluxArray([1, 2, 3, 4, 5, null, 7, 8, 9, 10]);
    f.subscribe(s);

    s.assertError(NullishValueError)
      .assertValues(1, 2, 3, 4, 5)
      .assertNotComplete();
  });

  test("arrayContainsUndefined", () => {
    const s = new AssertSubscriber();
    const f = new FluxArray([1, 2, 3, 4, 5, undefined, 7, 8, 9, 10]);
    f.subscribe(s);

    s.assertError(NullishValueError)
      .assertValues(1, 2, 3, 4, 5)
      .assertNotComplete();
  });
});
