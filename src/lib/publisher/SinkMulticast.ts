import Disposer from "./Disposer";
import { Flux } from "./Flux";
import Sink from "./Sink";
import { EmitResult } from "./Sinks";
import Subscriber from "./Subscriber";
import Subscription from "./Subscription";
import UnboundedSubscriber from "./UnboundedSubscriber";

class SinkMulticast<T> extends Flux<T> implements Sink<T> {
  private readonly subscriptions: InnerSubscription<T>[] = [];

  asFlux(): Flux<T> {
    return this;
  }

  subscribe(s?: Subscriber<T>): Disposer {
    if (s == null) {
      s = new UnboundedSubscriber();
    }

    const ss = new InnerSubscription(s!);
    this.subscriptions.push(ss);

    return () => {
      this.subscriptions.splice(
        this.subscriptions.findIndex((x) => x === ss),
        1
      );
    };
  }

  emitNext(value: T): EmitResult {
    if (!this.subscriptions.length) {
      return EmitResult.FAIL_ZERO_SUBSCRIBER;
    }
    for (const s of this.subscriptions) {
      if (s.isCancelled()) {
        continue;
      }
      s.emitNext(value);
    }
    return EmitResult.OK;
  }

  emitComplete(): void {}

  emitError(err: unknown): void {}
}

class InnerSubscription<T> implements Subscription {
  private cancelled: boolean = false;

  constructor(private readonly subscriber: Subscriber<T>) {}

  request(n: number): void {}

  cancel(): void {
    this.cancelled = true;
  }

  isCancelled(): boolean {
    return this.cancelled;
  }

  emitNext(value: T): void {
    this.subscriber.onNext(value);
  }

  emitComplete(): void {
    this.subscriber.onComplete();
  }

  emitError(err: unknown): void {
    this.subscriber.onError(err);
  }
}

export default SinkMulticast;
