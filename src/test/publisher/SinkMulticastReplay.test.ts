import { describe, expect, test } from "bun:test";
import Sink from "publisher/Sink";
import SinkMulticastReplay from "publisher/SinkMulticastReplay";
import AssertSubscriber from "./AssertSubscriber";

describe("SinkMulticastReplay", () => {
  test("currentSubscriberCount", () => {
    const sink: Sink<number> = SinkMulticastReplay.create();

    expect(sink.currentSubscriberCount()).toBe(0);

    sink.asFlux().subscribe();

    expect(sink.currentSubscriberCount()).toBe(1);

    sink.asFlux().subscribe();

    expect(sink.currentSubscriberCount()).toBe(2);
  });

  test("subscriberRequestsAfterEmissionCompletes", () => {
    const sink: SinkMulticastReplay<number> = SinkMulticastReplay.create(16);
    const subscriber = AssertSubscriber.create(0);

    sink.subscribe(subscriber);

    sink.onNext(1);
    sink.onNext(2);
    sink.onNext(3);
    sink.onComplete();

    expect(sink.currentSubscriberCount()).toEqual(0);

    subscriber.assertNoValues();

    subscriber.request(1);

    subscriber.assertValues(1);

    subscriber.request(2);

    subscriber.assertValues(1, 2, 3).assertNoError().assertComplete();
  });
});
