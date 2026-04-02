"use client";

import { Suspense, lazy, type ComponentType } from "react";

interface SimulationWrapperProps {
  id: string;
}

// Registry of all available simulations — lazy loaded
const SIMULATIONS: Record<string, () => Promise<{ default: ComponentType }>> = {
  "mosfet": () => import("./MOSFETSim"),
  "cmos-inverter": () => import("./CMOSInverterSim"),
  "logic-gates": () => import("./LogicGatesSim"),
  "half-adder": () => import("./HalfAdderSim"),
  "pipeline": () => import("./PipelineSim"),
  "cache": () => import("./CacheSim"),
  "branch-predictor": () => import("./BranchPredictorSim"),
  "float-ieee754": () => import("./IEEE754Sim"),
  "fsm": () => import("./FSMSim"),
  "memory-hierarchy": () => import("./MemoryHierarchySim"),
  "tomasulo": () => import("./TomasuloSim"),
  "gpu-warps": () => import("./GPUWarpsSim"),
  "cache-coherence": () => import("./CacheCoherenceSim"),
  "order-book": () => import("./OrderBookSim"),
  "virtual-memory": () => import("./VirtualMemorySim"),
};

// Cache lazy components so they're only created once
const lazyCache: Record<string, ComponentType> = {};

function getLazyComponent(id: string): ComponentType | null {
  if (lazyCache[id]) return lazyCache[id];
  const loader = SIMULATIONS[id];
  if (!loader) return null;
  const LazyComp = lazy(loader);
  lazyCache[id] = LazyComp;
  return LazyComp;
}

export default function SimulationWrapper({ id }: SimulationWrapperProps) {
  const Component = getLazyComponent(id);

  if (!Component) {
    return (
      <div className="my-8 bg-[#12121a] border border-[#2a2a3e] rounded-lg p-6 text-center">
        <p className="text-[#8888a0] text-sm font-mono">
          Simulation &quot;{id}&quot; not found
        </p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <Suspense
        fallback={
          <div className="bg-[#0e0e16] border border-[#2a2a3e] rounded-lg p-12 flex items-center justify-center">
            <div className="text-[#6c5ce7] text-sm font-mono animate-pulse">
              Loading simulation...
            </div>
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  );
}
