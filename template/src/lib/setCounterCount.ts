export enum Operation {
  Add,
  Subtract,
}

export function setCounterCount(
  newCount: number,
  operation: Operation,
): number {
  switch (operation) {
    case Operation.Add:
      return newCount + 1;
    case Operation.Subtract:
      return newCount - 1;
    default:
      return newCount;
  }
}
