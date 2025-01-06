import ReplaySubscription from "./ReplaySubscription";

/**
 * Referencing `SizeBoundReplayBuffer` from Project Reactor
 */
class ReplayBuffer<T> {
  private readonly history: T[] = [];
  private done: boolean = false;
  private error?: unknown;

  constructor(private readonly capacity: number) {}

  isDone(): boolean {
    return this.done;
  }

  onComplete(): void {
    this.done = true;
  }

  onError(err: unknown): void {
    this.error = err;
    this.done = true;
  }

  add(value: T): void {
    this.history.push(value);

    if (this.capacity < this.history.length) {
      this.history.shift();
    }
  }

  replay(subscription: ReplaySubscription<T>): void {
    let n = this.history.length;
    let requested = subscription.requested();
    let startIndex = subscription.index();
    let i = startIndex;

    for (; i < startIndex + requested && i < n; i++) {
      subscription.subscriber().onNext(this.history[i]);
      subscription.produced(1);
    }

    if (n == i && this.done) {
      subscription.subscriber().onComplete();
    }
  }
}

export default ReplayBuffer;
