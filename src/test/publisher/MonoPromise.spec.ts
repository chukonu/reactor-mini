import { describe, test } from "bun:test";
import MonoPromise from "publisher/MonoPromise";
import AssertSubscriber from "./AssertSubscriber";

describe("MonoPromise", () => {
  test("should emit one value from a resolved promise", async () => {
    const p = Promise.resolve(42);
    const s = new AssertSubscriber();
    const m = new MonoPromise(p);

    m.subscribe(s);

    await Promise.resolve();
    s.assertValues(42).assertComplete().assertNoError();
  });

  test("should raise error from a rejected promise", (done) => {
    const p = Promise.reject(new Error());
    const s = new AssertSubscriber();
    const m = new MonoPromise(p);

    m.subscribe(s);

    setTimeout(() => {
      s.assertNoValues().assertNotComplete().assertError(Error);
      done();
    });
  });

  test("should not emit, throw or complete if immediately unsubscribed", async () => {
    const p = Promise.resolve(42);
    const s = new AssertSubscriber(0);
    const m = new MonoPromise(p);

    m.subscribe(s);
    s.cancel();

    await Promise.resolve();
    s.assertNoValues().assertNotComplete().assertNoError();
  });
});
