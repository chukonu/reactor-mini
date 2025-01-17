import Disposer from "./Disposer";
import { Mono } from "./Mono";
import Subscriber from "./Subscriber";
import Subscription from "./Subscription";
import UnboundedSubscriber from "./UnboundedSubscriber";

class MonoPromise<T> extends Mono<T> {
  constructor(private readonly promise: Promise<T>) {
    super();
  }

  override subscribe(s?: Subscriber<T>): Disposer {
    if (s == null) {
      s = new UnboundedSubscriber<T>();
    }
    const subscription = new MonoPromise.MonoPromiseSubscription(
      s,
      this.promise
    );
    s.onSubscribe(subscription);
    return () => {
      subscription.cancel();
    };
  }
}

namespace MonoPromise {
  export class MonoPromiseSubscription<T> implements Subscription {
    private cancelled: boolean = false;

    constructor(
      private readonly subscriber: Subscriber<T>,
      private readonly promise: Promise<T>
    ) {}

    cancel(): void {
      this.cancelled = true;
    }

    request(n: number): void {
      if (this.cancelled) {
        return;
      }

      this.promise
        .then((x) => {
          if (this.cancelled || x == null) {
            return;
          }
          this.subscriber.onNext(x);
          this.subscriber.onComplete();
        })
        .catch((e) => {
          if (this.cancelled) {
            return;
          }
          this.subscriber.onError(e);
        });
    }
  }
}

export default MonoPromise;
