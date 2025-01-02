import Consumer from "./Consumer";
import Disposer from "./Disposer";
import { Flux } from "./Flux";
import FluxOperator from "./FluxOperator";
import Subscriber from "./Subscriber";
import Subscription from "./Subscription";

class FluxPeek<T> extends FluxOperator<T, T> {
  constructor(source: Flux<T>, private readonly onNextCall: Consumer<T>) {
    super(source);
  }

  subscribe(s?: Subscriber<T>): Disposer {
    new FluxPeekSubscription();
    return () => {};
  }
}

class FluxPeekSubscription implements Subscription {
  cancel(): void {
    throw new Error("Method not implemented.");
  }
  request(n: number): void {
    throw new Error("Method not implemented.");
  }
}

export default FluxPeek;
