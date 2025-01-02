import { describe, expect, test } from "bun:test";
import SinkMulticast from "publisher/SinkMulticast";
import { EmitResult } from "publisher/Sinks";
import AssertSubscriber from "./AssertSubscriber";

describe("SinkMulticast", () => {
  test("emitNextNoSubscribers", () => {
    const sink = new SinkMulticast<number>();
    expect(sink.emitNext(1)).toEqual(EmitResult.FAIL_ZERO_SUBSCRIBER);
  });

  test("emitNextMultipleSubscribers", () => {
    const sink = new SinkMulticast<number>();
    const s1 = new AssertSubscriber();
    const s2 = new AssertSubscriber();
    sink.subscribe(s1);
    sink.subscribe(s2);
    sink.emitNext(1);
    s1.assertNoError().assertNotComplete().assertValues(1);
    s2.assertNoError().assertNotComplete().assertValues(1);
  });
});
