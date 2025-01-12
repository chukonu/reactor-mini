import Subscriber from "publisher/Subscriber";
import Subscription from "publisher/Subscription";
import Type from "./Type";

class AssertSubscriber<T> implements Subscriber<T> {
  private values: T[] = [];
  private completeCount: number = 0;
  private errors: unknown[] = [];
  private subscription?: Subscription;

  constructor(private demand: number = Infinity) {}

  request(demand: number): void {
    if (this.subscription == null) {
      throw new Error("No subscription");
    }
    this.subscription!.request(demand);
  }

  cancel(): void {
    this.subscription?.cancel();
  }

  onSubscribe(s: Subscription): void {
    this.subscription = s;
    s.request(this.demand);
  }

  onNext(value: T): void {
    this.values.push(value);
  }

  onComplete(): void {
    this.completeCount++;
  }

  onError(err: unknown): void {
    this.errors.push(err);
  }

  assertComplete(): typeof this {
    this.assertNoError();
    if (this.completeCount == 0) {
      throw new Error("Never completed");
    }
    if (this.completeCount > 1) {
      throw new Error(`Completed more than once (${this.completeCount})`);
    }
    return this;
  }

  assertNotComplete(): typeof this {
    if (this.completeCount == 1) {
      throw new Error("Completed");
    }
    if (this.completeCount > 1) {
      throw new Error(`Completed more than once (${this.completeCount})`);
    }
    return this;
  }

  assertNoError(): typeof this {
    if (this.errors.length) {
      throw new Error(`Expected no errors but got ${this.errors.length}`);
    }
    return this;
  }

  assertError<T extends Error>(error: Type<T>): typeof this {
    if (!this.errors.length) {
      throw new Error("No error");
    }
    if (this.errors.length > 1) {
      throw new Error("More than one errors");
    }
    if (!(this.errors[0] instanceof error)) {
      throw new Error(
        `Expected error to be an instance of ${error.name} but got ${this.errors[0]}`
      );
    }
    return this;
  }

  assertNoValues(): typeof this {
    if (this.values.length) {
      throw new Error(`Expected no values but got ${this.values.length}`);
    }
    return this;
  }

  assertValues(...expectedValues: T[]): typeof this {
    const e = expectedValues[Symbol.iterator](),
      a = this.values[Symbol.iterator]();
    let i = 0;
    for (;;) {
      const ne = e.next(),
        na = a.next();
      if (!ne.done && !na.done) {
        if (ne.value !== na.value) {
          throw new Error(
            `The elements at index ${i} do not match. Expected ${ne.value}, got ${na.value}`
          );
        }
        i++;
      } else if (ne.done && !na.done) {
        throw new Error(
          `Actual sequence contains more elements (${this.values.length}) than expected (${expectedValues.length})`
        );
      } else if (!ne.done && na.done) {
        throw new Error(
          `Actual sequence contains fewer elements (${this.values.length}) than expected (${expectedValues.length})`
        );
      } else {
        break;
      }
    }
    return this;
  }
}

namespace AssertSubscriber {
  export function create<T>(demand: number = Infinity): AssertSubscriber<T> {
    return new AssertSubscriber(demand);
  }
}

export default AssertSubscriber;
