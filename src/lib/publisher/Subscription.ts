interface Subscription {
  cancel(): void;
  request(n: number): void;
}

export default Subscription;
