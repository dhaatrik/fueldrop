const { performance } = require('perf_hooks');

// Mock data
const generateVehicles = (count) => {
  const vehicles = [];
  for (let i = 0; i < count; i++) {
    vehicles.push({
      id: i,
      tankCapacity: Math.random() > 0.5 ? 50 : null,
      avgDailyKm: Math.random() > 0.5 ? 30 : null,
    });
  }
  return vehicles;
};

const vehicles = generateVehicles(100000);

// Baseline: Double filter
function doubleFilter() {
  let result = null;
  if (vehicles.filter(v => v.tankCapacity && v.avgDailyKm).length > 0) {
    result = vehicles.filter(v => v.tankCapacity && v.avgDailyKm).map(v => v.id);
  }
  return result;
}

// Optimized: Single filter
function singleFilter() {
  let result = null;
  const filtered = vehicles.filter(v => v.tankCapacity && v.avgDailyKm);
  if (filtered.length > 0) {
    result = filtered.map(v => v.id);
  }
  return result;
}

// Run benchmarks
const ITERATIONS = 100;

let startBaseline = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  doubleFilter();
}
let endBaseline = performance.now();
const baselineTime = endBaseline - startBaseline;

let startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  singleFilter();
}
let endOptimized = performance.now();
const optimizedTime = endOptimized - startOptimized;

console.log(`Baseline (Double Filter): ${baselineTime.toFixed(2)} ms`);
console.log(`Optimized (Single Filter): ${optimizedTime.toFixed(2)} ms`);
console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}%`);
