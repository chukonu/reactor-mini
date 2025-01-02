import Subscription from "./Subscription";

interface Subscriber<T> {
  onComplete(): void;
  onError(err: unknown): void;
  onNext(value: T): void;
  onSubscribe(s: Subscription): void;
}

export default Subscriber;
