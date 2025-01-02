import Consumer from "./Consumer";
import Subscriber from "./Subscriber";
import Subscription from "./Subscription";

class UnboundedSubscriber<T> implements Subscriber<T> {
  constructor(
    private readonly onNextCallback?: Consumer<T>,
    private readonly onCompleteCallback?: () => void,
    private readonly onErrorCallback?: (err: unknown) => void
  ) {}

  onSubscribe(s: Subscription): void {
    s.request(Infinity);
  }

  onNext(value: T): void {
    this.onNextCallback?.(value);
  }

  onComplete(): void {
    this.onCompleteCallback?.();
  }

  onError(err: unknown): void {
    this.onErrorCallback?.(err);
  }
}

export default UnboundedSubscriber;
