export default function isActionOptimistic(action) {
  return action.meta && action.meta.optimistic;
}
