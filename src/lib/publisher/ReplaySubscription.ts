import Subscriber from "./Subscriber";
import Subscription from "./Subscription";

interface ReplaySubscription<T> extends Subscription {
  index(): number;
  isCancelled(): boolean;
  produced(n: number): void;
  requested(): number;
  subscriber(): Subscriber<T>;
}

export default ReplaySubscription;
