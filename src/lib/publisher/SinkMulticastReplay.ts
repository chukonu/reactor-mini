import Disposer from "./Disposer";
import { Flux } from "./Flux";
import ReplayBuffer from "./ReplayBuffer";
import ReplaySubscription from "./ReplaySubscription";
import Sink from "./Sink";
import { EmitResult } from "./Sinks";
import Subscriber from "./Subscriber";
import Subscription from "./Subscription";
import UnboundedSubscriber from "./UnboundedSubscriber";

/**
 * cf. `SinkManyReplayProcessor` in Project Reactor
 */
class SinkMulticastReplay<T> extends Flux<T> implements Sink<T>, Subscriber<T> {
  private readonly subscriptions: ReplaySubscription<T>[] = [];
  private upstream?: Subscription;

  constructor(private readonly _buffer: ReplayBuffer<T>) {
    super();
  }

  asFlux(): Flux<T> {
    return this;
  }

  buffer(): ReplayBuffer<T> {
    return this._buffer;
  }

  currentSubscriberCount(): number {
    return this.subscriptions.length;
  }

  remove(s: ReplaySubscription<T>): void {
    this.subscriptions.splice(this.subscriptions.indexOf(s), 1);
  }

  override subscribe(s?: Subscriber<T>): Disposer {
    if (s == null) {
      s = new UnboundedSubscriber();
    }

    const subscription = new SinkMulticastReplay.InnerSubscription<T>(
      0,
      s,
      this
    );
    this.subscriptions.push(subscription);

    s.onSubscribe(subscription);

    return () => {
      this.subscriptions.splice(this.subscriptions.indexOf(subscription), 1);

      this.upstream?.cancel();
    };
  }

  emitComplete(): EmitResult {
    if (this._buffer.isDone()) {
      return EmitResult.FAIL_TERMINATED;
    }
    this._buffer.onComplete();
    const oldSubs = this.subscriptions.splice(0);
    for (const s of oldSubs) {
      this._buffer.replay(s);
    }
    return EmitResult.OK;
  }

  emitError(err: unknown): EmitResult {
    if (this._buffer.isDone()) {
      return EmitResult.FAIL_TERMINATED;
    }
    this._buffer.onError(err);
    for (const s of this.subscriptions) {
      this._buffer.replay(s);
    }
    return EmitResult.OK;
  }

  emitNext(value: T): EmitResult {
    this._buffer.add(value);
    for (const s of this.subscriptions) {
      this._buffer.replay(s);
    }
    return EmitResult.OK;
  }

  onSubscribe(s: Subscription): void {
    this.upstream = s;
  }

  onNext(value: T): void {
    this.emitNext(value);
  }

  onError(err: unknown): void {
    this.emitError(err);
  }

  onComplete(): void {
    this.emitComplete();
  }
}

namespace SinkMulticastReplay {
  export function create<T>(replayCapacity?: number): SinkMulticastReplay<T> {
    return new SinkMulticastReplay(new ReplayBuffer(replayCapacity ?? 1));
  }

  export class InnerSubscription<T> implements ReplaySubscription<T> {
    private _index: number = 0;
    private readonly buffer: ReplayBuffer<T>;

    constructor(
      private _requested: number = Infinity,
      private readonly _subscriber: Subscriber<T>,
      private readonly host: SinkMulticastReplay<T>
    ) {
      this.buffer = host.buffer();
    }

    subscriber(): Subscriber<T> {
      return this._subscriber;
    }

    cancel(): void {
      if (this._requested >= 0) {
        this._requested = -1;
        this.host.remove(this);
      }
    }

    index(): number {
      return this._index;
    }

    isCancelled(): boolean {
      return this._requested < 0;
    }

    request(n: number): void {
      this._requested = n;
      this.buffer.replay(this);
    }

    requested(): number {
      return this._requested;
    }

    produced(n: number): void {
      this._requested -= n;
      this._index++;
    }
  }
}

export default SinkMulticastReplay;
