import assert from "node:assert/strict";
import test from "node:test";
import { formPurgedWalkForwardFolds } from "../src/folds.mjs";

test("folds preserve chronological purge, validation-only selection, and deterministic output", () => {
  const coordinates = Array.from({ length: 40 }, (_, i) => new Date(Date.UTC(2026, 0, i + 1)).toISOString());
  const input = { coordinates, warmup: 20, horizon: 5, cadence: 5, trainingWindow: 15 };
  const result = formPurgedWalkForwardFolds(input);
  assert.deepEqual(result, formPurgedWalkForwardFolds(input));
  assert.equal(result.purge, 5);
  assert.equal(result.shuffled, false);
  assert.equal(result.effect, "fold-formation-only");
  assert.equal(result.validation.length, 1);
  assert.equal(result.holdout.length, 2);
  assert.deepEqual(result.folds.map(({ trainStart, trainEnd, prediction, outcome }) => [trainStart, trainEnd, prediction, outcome]), [[1, 15, 20, 25], [6, 20, 25, 30], [11, 25, 30, 35]]);
  assert.ok(Object.isFrozen(result) && Object.isFrozen(result.folds));
  assert.throws(() => formPurgedWalkForwardFolds({ ...input, coordinates: [...coordinates].reverse() }), /ordered-coordinates-required/u);
  assert.throws(() => formPurgedWalkForwardFolds({ ...input, horizon: 0 }), /horizon-invalid/u);
  assert.throws(() => formPurgedWalkForwardFolds({ ...input, validationFraction: 1 }), /validation-fraction-invalid/u);
});
