import Disposer from "./Disposer";
import { Flux } from "./Flux";
import NullishValueError from "./NullishValueError";
import Subscriber from "./Subscriber";
import Subscription from "./Subscription";
import UnboundedSubscriber from "./UnboundedSubscriber";

class FluxArray<T> extends Flux<T> {
  constructor(private readonly array: T[]) {
    super();
  }

  subscribe(s?: Subscriber<T>): Disposer {
    if (s == null) {
      s = new UnboundedSubscriber();
    }
    const subscription = new FluxArray.ArraySubscription(s!, this.array);
    s!.onSubscribe(subscription);
    return () => subscription.cancel();
  }
}

namespace FluxArray {
  export class ArraySubscription<T> implements Subscription {
    private cancelled: boolean = false;
    private index: number = 0;

    constructor(
      private readonly subscriber: Subscriber<T>,
      private readonly array: T[]
    ) {}

    cancel() {
      this.cancelled = true;
    }

    request(n: number) {
      if (!n) {
        return;
      }
      for (
        let i = this.index;
        i < this.array.length && i < n;
        i++, this.index++
      ) {
        if (this.array[i] == null) {
          this.subscriber.onError(
            new NullishValueError(
              `The ${i}-th element in the array is either null or undefined.`
            )
          );
          return;
        }
        this.subscriber.onNext(this.array[i]);
        if (i + 1 == this.array.length) {
          this.subscriber.onComplete();
        }
        if (this.cancelled) {
          return;
        }
      }
    }
  }
}

export default FluxArray;
