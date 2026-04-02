# Research Notes: GPU Architecture and CUDA Programming

> Research compiled for CS 101 lecture content. All specifications verified against official NVIDIA documentation, datasheets, and architecture whitepapers as of March 2026.

---

## 1. NVIDIA Data Center GPU Specifications (H100 / H200 / B100 / B200)

### NVIDIA H100 (Hopper, 2022)

| Specification | H100 SXM5 | H100 PCIe |
|---|---|---|
| GPU Die | GH100 | GH100 |
| Process Node | TSMC 4N (custom 4nm) | TSMC 4N |
| Transistor Count | 80 billion | 80 billion |
| Die Size | 814 mm² | 814 mm² |
| SMs (full die / enabled) | 144 / 132 | 144 / 114 |
| CUDA Cores (FP32) | 16,896 (128 per SM) | 14,592 (128 per SM) |
| Tensor Cores | 528 (4th gen) | 456 (4th gen) |
| FP64 Tensor Core | 60 TFLOPS | 48 TFLOPS |
| FP32 | 60 TFLOPS | 48 TFLOPS |
| TF32 Tensor Core | 989 TFLOPS | 756 TFLOPS |
| FP16/BF16 Tensor Core | 1,979 TFLOPS | 1,513 TFLOPS |
| FP8 Tensor Core | 3,958 TFLOPS | 3,026 TFLOPS |
| INT8 Tensor Core | 3,958 TOPS | 3,026 TOPS |
| Memory Type | HBM3 | HBM2e |
| Memory Size | 80 GB | 80 GB |
| Memory Bandwidth | 3,350 GB/s (3.35 TB/s) | 2,000 GB/s (2.0 TB/s) |
| L2 Cache | 50 MB | 50 MB |
| NVLink | 4.0 (900 GB/s, 18 links) | N/A |
| TDP | 700 W | 350 W |
| Compute Capability | 9.0 | 9.0 |

- Source: [NVIDIA H100 Datasheet](https://www.nvidia.com/en-us/data-center/h100/), [NVIDIA Hopper Architecture In-Depth](https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/)

### NVIDIA H200 (Hopper, 2024)

| Specification | H200 SXM |
|---|---|
| GPU Die | GH200 (same GH100 die) |
| Process Node | TSMC 4N |
| Transistor Count | 80 billion |
| SMs (enabled) | 132 |
| CUDA Cores (FP32) | 16,896 |
| Tensor Cores | 528 (4th gen, FP8 Transformer Engine) |
| FP8 Tensor Core | 3,958 TFLOPS |
| Memory Type | HBM3e |
| Memory Size | 141 GB |
| Memory Bandwidth | 4,800 GB/s (4.8 TB/s) |
| NVLink | 4.0 (900 GB/s) |
| TDP | 700 W |
| Compute Capability | 9.0 |

Key difference from H100: Same compute die, upgraded to HBM3e for 76% more memory (141 GB vs 80 GB) and 43% more bandwidth (4.8 TB/s vs 3.35 TB/s). Identical CUDA/Tensor Core counts.

- Source: [NVIDIA H200 Specs](https://www.runpod.io/articles/guides/nvidia-h200-gpu), [NVIDIA H100 vs H200](https://www.databasemart.com/blog/nvidia-h100-vs-nvidia-h200)

### NVIDIA B100 (Blackwell, 2024)

| Specification | B100 |
|---|---|
| GPU Die | GB100 (dual-die, NV-HBI interconnect) |
| Process Node | TSMC 4NP (custom) |
| Transistor Count | 208 billion (across both dies) |
| Tensor Cores | 5th gen (FP4, FP6, FP8 support) |
| FP4 Dense / Sparse | 7 PFLOPS / 14 PFLOPS |
| FP16/BF16 Dense / Sparse | 1.8 PFLOPS / 3.5 PFLOPS |
| TF32 Dense / Sparse | 0.9 PFLOPS / 1.8 PFLOPS |
| Memory Type | HBM3e |
| Memory Size | 192 GB |
| Memory Bandwidth | 8 TB/s |
| On-package Interconnect | 10 TB/s (chip-to-chip) |
| TDP | 700 W |

- Source: [NVIDIA Blackwell Architecture Overview](https://www.cudocompute.com/blog/nvidias-blackwell-architecture-breaking-down-the-b100-b200-and-gb200)

### NVIDIA B200 (Blackwell, 2024)

| Specification | B200 |
|---|---|
| GPU Die | GB202 (dual-die) |
| Process Node | TSMC 4NP (custom) |
| Transistor Count | 208 billion |
| Die Size | ~2x reticle limit (~1600 mm² total) |
| SMs (full / enabled) | 160 / 148 (74 per die) |
| CUDA Cores (FP32) | 20,480 (128 per SM) |
| Tensor Cores | 528 (5th gen) |
| FP4 Dense / Sparse | 9 PFLOPS / 18 PFLOPS |
| FP8 Dense / Sparse | 4.5 PFLOPS / 9 PFLOPS |
| FP16/BF16 Dense / Sparse | 2.25 PFLOPS / 4.5 PFLOPS |
| TF32 Dense / Sparse | 1.125 PFLOPS / 2.25 PFLOPS |
| FP64 | ~40 TFLOPS |
| Memory Type | HBM3e |
| Memory Size | 192 GB (8 stacks, 8192-bit bus) |
| Memory Bandwidth | 8 TB/s |
| NVLink | 5.0 (1.8 TB/s, 18 links) |
| On-package Interconnect | 10 TB/s (chip-to-chip) |
| TDP | 1000 W (liquid cooled) |
| Compute Capability | 10.0 |

Key advancement over H100: 2.2x faster Llama 2 70B fine-tuning, 2x faster GPT-3 175B pre-training. Tasks requiring 256 Hopper GPUs can run on 64 Blackwell GPUs.

- Source: [NVIDIA Blackwell Architecture Technical Overview](https://resources.nvidia.com/en-us-blackwell-architecture), [Blackwell Wikipedia](https://en.wikipedia.org/wiki/Blackwell_(microarchitecture)), [Exxact Blackwell vs Hopper](https://www.exxactcorp.com/blog/hpc/comparing-nvidia-tensor-core-gpus)

### Blackwell Ultra (B300/GB300, 2026)

NVIDIA's latest generation (shipping since January 2026):
- 288 GB HBM3e (50% more than B200's 192 GB), using 12-high HBM3e stacks
- Critical for serving large language models without tensor parallelism

- Source: [NVIDIA GPU Architecture Evolution](https://www.serversimply.com/blog/evolution-of-nvidia-data-center-gpus)

---

## 2. NVIDIA GPU Architecture Evolution

### Kepler (2012) -- Compute Capability 3.0/3.5

- **Key Innovations**: Dynamic Parallelism, Hyper-Q
- **Dynamic Parallelism**: GPU kernels can launch child kernels directly on the GPU without returning to the CPU. Eliminates CPU-GPU round-trip for recursive/adaptive algorithms.
- **Hyper-Q**: 32 simultaneous hardware-managed work queues (vs. 1 on Fermi). Allows multiple CPU cores to launch work on a single GPU concurrently.
- **SMX Design**: 192 single-precision CUDA cores per SMX, 64 double-precision (FP64) units, 32 SFUs, 32 load/store units
- **Flagship**: GK110 -- 7.1 billion transistors, 15 SMX units, 2880 CUDA cores total
- **Products**: Tesla K20/K40

- Source: [NVIDIA Kepler GK110 Architecture Whitepaper](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/tesla-product-literature/NVIDIA-Kepler-GK110-GK210-Architecture-Whitepaper.pdf)

### Maxwell (2014) -- Compute Capability 5.0/5.2

- **Key Innovations**: Improved energy efficiency (2x perf/watt over Kepler), Unified Memory improvements
- **Unified Memory**: Simplified programming by allowing CPU and GPU to share same virtual address space. Page migration engine handles data movement transparently.
- **SM redesign**: 128 CUDA cores per SM (down from 192), but more SMs per chip and better efficiency
- **Process**: 28nm (same as Kepler, but major microarchitecture improvements)

### Pascal (2016) -- Compute Capability 6.0/6.1

- **Key Innovations**: NVLink 1.0, HBM2 memory, Unified Memory with page faulting
- **NVLink 1.0**: 160 GB/s bidirectional GPU-to-GPU interconnect (5x PCIe 3.0)
- **HBM2**: First use of High Bandwidth Memory (732 GB/s on P100)
- **GP100 specs**: 60 SMs (56 enabled on P100), 64 FP32 CUDA cores per SM, 3840 total CUDA cores, 32 FP64 cores per SM
- **Process**: TSMC 16nm FinFET
- **Products**: Tesla P100 (data center), GTX 1080 (consumer)
- Note: No Tensor Cores yet -- Tensor Cores debut in Volta

- Source: [NVIDIA Pascal Architecture Whitepaper](https://images.nvidia.com/content/pdf/tesla/whitepaper/pascal-architecture-whitepaper.pdf), [Inside Pascal](https://developer.nvidia.com/blog/inside-pascal/)

### Volta (2017) -- Compute Capability 7.0

- **Key Innovations**: Tensor Cores (1st gen), Independent Thread Scheduling
- **Tensor Cores**: Each performs $4 \times 4$ FP16 matrix multiply-accumulate per clock ($D = A \times B + C$, where A/B are FP16, C/D are FP16 or FP32). 640 Tensor Cores total on GV100.
- **Independent Thread Scheduling**: Each thread has its own program counter and call stack. Warps can diverge and reconverge at sub-warp granularity. Major change from pre-Volta lockstep warp execution.
- **GV100 specs**: 80 SMs, 5120 CUDA cores (64 per SM), 640 Tensor Cores (8 per SM), 21.1 billion transistors, 815 mm² die
- **Process**: TSMC 12nm FFN
- **FP64**: 7.8 TFLOPS, FP32: 15.7 TFLOPS, FP16 Tensor: 125 TFLOPS
- **Products**: Tesla V100 (16/32 GB HBM2, 900 GB/s bandwidth)

- Source: [NVIDIA Volta Architecture Whitepaper](https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf)

### Turing (2018) -- Compute Capability 7.5

- **Key Innovations**: RT Cores (ray tracing), INT8/INT4 Tensor Core inference modes
- **RT Cores**: Hardware acceleration for BVH (Bounding Volume Hierarchy) traversal and ray-triangle intersection. First real-time ray tracing GPU.
- **Tensor Cores (2nd gen)**: Added INT8 (130 TOPS on T4), INT4 (260 TOPS), and binary 1-bit precision modes for inference
- **T4 specs**: 40 SMs, 2560 CUDA cores, 320 Tensor Cores, 40 RT Cores, 16 GB GDDR6, 320 GB/s, 75W TDP
- **Products**: Tesla T4 (inference), RTX 2080 Ti (consumer)

- Source: [NVIDIA Turing Architecture In-Depth](https://developer.nvidia.com/blog/nvidia-turing-architecture-in-depth/)

### Ampere (2020) -- Compute Capability 8.0

- **Key Innovations**: Fine-grained Structured Sparsity (2:4), TF32, 3rd gen Tensor Cores, Multi-Instance GPU (MIG)
- **2:4 Structured Sparsity**: For every 4 consecutive elements, at most 2 can be non-zero. Hardware automatically exploits this to double Tensor Core throughput. Training naturally produces sparse networks; pruning to 2:4 pattern maintains accuracy.
- **TF32 (TensorFloat-32)**: 19-bit format (8-bit exponent like FP32 + 10-bit mantissa like FP16). Delivers 10x speedup over V100 FP32, 20x with sparsity. Drop-in replacement -- no code changes needed.
- **3rd Gen Tensor Cores**: Support TF32, BF16, FP64, INT8, INT4, binary. Each performs 256 FP16/FP32 FMA ops per clock.
- **MIG**: Partitions single GPU into up to 7 independent instances, each with dedicated memory/compute
- **GA100 specs**: 108 SMs (128 enabled on die), 6912 FP32 CUDA cores (64 per SM), 432 Tensor Cores (4 per SM), 54.2 billion transistors, 826 mm²
- **Process**: TSMC 7nm
- **Memory**: 80 GB HBM2e, 2,039 GB/s bandwidth, 40 MB L2 cache
- **Products**: A100 (40/80 GB), A6000

- Source: [NVIDIA Ampere Architecture Whitepaper](https://images.nvidia.com/aem-dam/en-zz/Solutions/data-center/nvidia-ampere-architecture-whitepaper.pdf), [NVIDIA Ampere In-Depth](https://developer.nvidia.com/blog/nvidia-ampere-architecture-in-depth/)

### Hopper (2022) -- Compute Capability 9.0

- **Key Innovations**: Transformer Engine (FP8), Thread Block Clusters, DPX instructions, Confidential Computing
- **Transformer Engine**: Dynamically switches between FP8 and FP16 precision per layer during training. Uses per-tensor scaling factors to maintain accuracy. Automatic mixed precision without user intervention.
- **FP8**: Two formats -- E4M3 (4-bit exponent, 3-bit mantissa, for forward pass) and E5M2 (5-bit exponent, 2-bit mantissa, for backward pass). 2x throughput vs FP16.
- **Thread Block Clusters**: New hierarchy level mapping to GPC (Graphics Processing Cluster). Enables distributed shared memory across SMs within a cluster.
- **DPX instructions**: Hardware acceleration for dynamic programming algorithms (Smith-Waterman, Needleman-Wunsch for genomics)
- **4th Gen Tensor Cores**: FP8, FP16, BF16, TF32, FP64, INT8. 2x MMA rate over Ampere at same precision, 4x with FP8.

- Source: [NVIDIA Hopper Architecture In-Depth](https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/)

### Blackwell (2024) -- Compute Capability 10.0

- **Key Innovations**: Dual-die design (NV-HBI), 5th gen Tensor Cores (FP4), 2nd gen Transformer Engine, NVLink 5.0
- **Dual-die design**: Two reticle-limited dies connected by 10 TB/s NV-HBI (NVIDIA High Bandwidth Interface). Appears as single logical GPU to software. 208 billion transistors total.
- **5th Gen Tensor Cores**: FP4 and FP6 precision support. 2.5x AI training improvement per GPU over Hopper. FP4 delivers 2x throughput over FP8 for inference with minimal quality loss.
- **2nd Gen Transformer Engine**: Supports FP4 in addition to FP8. Dynamic precision switching at per-layer granularity.
- **NVLink Switch**: New chip connecting up to 576 GPUs in a single NVLink domain
- **Process**: TSMC 4NP (custom)

- Source: [NVIDIA Blackwell Architecture](https://www.nvidia.com/en-us/data-center/technologies/blackwell-architecture/), [Blackwell Wikipedia](https://en.wikipedia.org/wiki/Blackwell_(microarchitecture))

### Architecture Evolution Summary Table

| Architecture | Year | Process | CUDA/SM | Tensor Cores | Key Innovation |
|---|---|---|---|---|---|
| Kepler | 2012 | 28nm | 192 | -- | Dynamic Parallelism, Hyper-Q |
| Maxwell | 2014 | 28nm | 128 | -- | 2x perf/watt, Unified Memory |
| Pascal | 2016 | 16nm | 64 | -- | NVLink, HBM2 |
| Volta | 2017 | 12nm | 64 | 1st gen | Tensor Cores, independent thread scheduling |
| Turing | 2018 | 12nm | 64 | 2nd gen | RT Cores, INT8/INT4 inference |
| Ampere | 2020 | 7nm | 64 | 3rd gen | 2:4 Sparsity, TF32, MIG |
| Hopper | 2022 | 4nm | 128 | 4th gen | Transformer Engine, FP8, DPX |
| Blackwell | 2024 | 4nm | 128 | 5th gen | Dual-die, FP4, NVLink 5.0 |

---

## 3. CUDA Programming Model

### Grid / Block / Thread Hierarchy

CUDA organizes parallel computation in a three-level hierarchy:

```
Grid (1 per kernel launch)
  └── Block (a.k.a. Thread Block)
        └── Thread
```

Hopper (Compute Capability 9.0+) adds a fourth level:

```
Grid
  └── Cluster (optional, group of blocks on same GPC)
        └── Block
              └── Thread
```

#### Dimension Limits (Compute Capability 7.0+)

| Dimension | Thread Block | Grid |
|---|---|---|
| x | 1024 | $2^{31} - 1$ |
| y | 1024 | 65,535 |
| z | 64 | 65,535 |
| **Total** | **x * y * z <= 1024 threads** | -- |

Each block is assigned to exactly one SM and cannot migrate (except during preemption). Multiple blocks can run concurrently on one SM, limited by resource availability.

#### Built-in Variables

| Variable | Type | Description |
|---|---|---|
| `threadIdx` | `dim3` | Thread index within block (`.x`, `.y`, `.z`) |
| `blockIdx` | `dim3` | Block index within grid |
| `blockDim` | `dim3` | Block dimensions |
| `gridDim` | `dim3` | Grid dimensions |
| `warpSize` | `int` | Warp size (always 32) |

### Kernel Launch Syntax

```cuda
// Full syntax with all 4 execution configuration parameters:
myKernel<<<gridDim, blockDim, sharedMemBytes, stream>>>(arg1, arg2, ...);

// gridDim:        dim3 -- number of blocks in grid
// blockDim:       dim3 -- number of threads per block
// sharedMemBytes: size_t -- dynamic shared memory per block (default: 0)
// stream:         cudaStream_t -- CUDA stream for async execution (default: 0)
```

Example:
```cuda
dim3 grid(256, 1, 1);     // 256 blocks
dim3 block(256, 1, 1);    // 256 threads per block
size_t smem = 1024;       // 1 KB dynamic shared memory

myKernel<<<grid, block, smem, stream>>>(d_input, d_output, N);
```

### Memory Spaces

| Memory Space | Scope | Lifetime | Latency | Size (H100) |
|---|---|---|---|---|
| **Registers** | Per thread | Thread | ~1 cycle | 255 per thread, 64K per SM |
| **Local Memory** | Per thread | Thread | ~200-800 cycles (cached in L1/L2) | Up to stack limit |
| **Shared Memory** | Per block | Block | ~20-30 cycles | Up to 228 KB per SM (configurable) |
| **L1 Cache** | Per SM | -- | ~30 cycles | 256 KB per SM (shared with smem) |
| **L2 Cache** | Global (all SMs) | -- | ~200 cycles | 50 MB (H100) |
| **Global Memory** | Global (all threads) | Application | ~200-800 cycles | 80 GB HBM3 (H100) |
| **Constant Memory** | Global (read-only) | Application | ~1 cycle (cached) | 64 KB |
| **Texture Memory** | Global (read-only) | Application | Cached, spatial locality | Part of global mem |

Declaration syntax:
```cuda
__global__ void kernel() {
    int reg_var;                              // Register (automatic)
    __shared__ float smem[256];               // Shared memory
    // Global, constant, texture declared at file scope
}

__device__ float d_global_var;                // Global memory
__constant__ float d_const_var;               // Constant memory
```

### Synchronization Primitives

```cuda
__syncthreads();           // Barrier for all threads in a block
__syncwarp(mask);          // Synchronize threads within a warp (Volta+)
__threadfence();           // Memory fence (all threads in device)
__threadfence_block();     // Memory fence (all threads in block)
__threadfence_system();    // Memory fence (including host)
```

#### Atomic Operations

```cuda
atomicAdd(&addr, val);     // Atomic add (FP32, FP64, int32, int64)
atomicSub(&addr, val);     // Atomic subtract
atomicExch(&addr, val);    // Atomic exchange
atomicMin(&addr, val);     // Atomic minimum
atomicMax(&addr, val);     // Atomic maximum
atomicCAS(&addr, cmp, val); // Atomic compare-and-swap
atomicAnd(&addr, val);     // Atomic bitwise AND
atomicOr(&addr, val);      // Atomic bitwise OR
atomicXor(&addr, val);     // Atomic bitwise XOR
```

#### Cooperative Groups (CUDA 9+)

```cuda
#include <cooperative_groups.h>
namespace cg = cooperative_groups;

__global__ void kernel() {
    // Thread block group
    cg::thread_block block = cg::this_thread_block();
    block.sync();  // equivalent to __syncthreads()

    // Warp-sized tile
    cg::thread_block_tile<32> warp = cg::tiled_partition<32>(block);
    warp.sync();

    // Sub-warp tiles (must be power of 2, <= 32)
    cg::thread_block_tile<16> half_warp = cg::tiled_partition<16>(block);

    // Warp-level collective operations via tiles
    int sum = cg::reduce(warp, val, cg::plus<int>());
    int result = cg::inclusive_scan(warp, val, cg::plus<int>());
}
```

- Source: [CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/), [CUDA Programming Model Blog](https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/), [Cooperative Groups Blog](https://developer.nvidia.com/blog/cooperative-groups/)

---

## 4. Warp Execution and SIMT Model

### SIMT (Single Instruction, Multiple Threads)

NVIDIA GPUs execute warps of 32 parallel threads using the SIMT model. All threads in a warp execute the same instruction simultaneously, but each thread:
- Has its own registers and local memory
- Operates on its own data
- Can follow divergent control flow paths

**Warp size is always 32** (technically a machine-dependent constant, but 32 on all current NVIDIA architectures).

Thread-to-warp mapping:
$$\text{warp\_id} = \lfloor \text{threadIdx.x} / 32 \rfloor$$
$$\text{lane\_id} = \text{threadIdx.x} \mod 32$$

### Thread Divergence

When threads within a warp take different branches:

```cuda
if (threadIdx.x < 16) {
    // Path A -- only threads 0-15 execute
} else {
    // Path B -- only threads 16-31 execute
}
// Reconvergence point -- all threads active again
```

**Pre-Volta behavior**: Hardware serializes divergent paths. Threads not on the active path are masked off (disabled). Both paths execute sequentially within the warp, reducing effective parallelism by the number of divergent paths.

**Volta+ (Independent Thread Scheduling)**: Each thread maintains its own program counter and call stack. Diverged threads can make independent forward progress. Reconvergence is explicit (via `__syncwarp()` or Cooperative Groups). This enables patterns like producer-consumer within a warp.

### Active Mask

A 32-bit bitmask indicating which threads in a warp are currently active:
- Bit $i$ = 1 means lane $i$ is executing the current instruction
- Bit $i$ = 0 means lane $i$ is masked off (inactive)

Pre-Volta: Active mask managed implicitly by hardware.
Volta+: Active mask must be explicitly specified via `_sync` suffixed primitives.

### Warp-Level Primitives

All post-CUDA 9 warp primitives require a `mask` parameter specifying participating threads:

```cuda
// Shuffle: exchange data between lanes without shared memory
T __shfl_sync(unsigned mask, T var, int srcLane, int width=32);
T __shfl_up_sync(unsigned mask, T var, unsigned delta, int width=32);
T __shfl_down_sync(unsigned mask, T var, unsigned delta, int width=32);
T __shfl_xor_sync(unsigned mask, T var, int laneMask, int width=32);
```

- `__shfl_sync`: Read `var` from `srcLane` (broadcast)
- `__shfl_down_sync`: Read from lane `laneId + delta` (useful for reductions)
- `__shfl_up_sync`: Read from lane `laneId - delta` (useful for prefix sums)
- `__shfl_xor_sync`: Read from lane `laneId XOR laneMask` (butterfly reduction)

```cuda
// Vote/Ballot: collective boolean operations
unsigned __ballot_sync(unsigned mask, int predicate);
// Returns bitmask: bit i = 1 if thread i's predicate is non-zero

int __any_sync(unsigned mask, int predicate);
// Returns non-zero if ANY participating thread has non-zero predicate

int __all_sync(unsigned mask, int predicate);
// Returns non-zero if ALL participating threads have non-zero predicate

unsigned __activemask();
// Returns mask of currently active threads (no synchronization)
```

#### Warp Reduction Example (sum via shuffle)

```cuda
// Sum all values across a warp using __shfl_down_sync
__device__ float warpReduceSum(float val) {
    for (int offset = 16; offset > 0; offset >>= 1) {
        val += __shfl_down_sync(0xFFFFFFFF, val, offset);
    }
    return val;  // Only lane 0 has the correct result
}
```

This performs a butterfly reduction in $\log_2(32) = 5$ steps, entirely in registers (no shared memory needed).

- Source: [Using CUDA Warp-Level Primitives](https://developer.nvidia.com/blog/using-cuda-warp-level-primitives/), [Understanding Warps in CUDA](https://intro-to-cuda.readthedocs.io/en/latest/tutorial/warps.html)

---

## 5. Shared Memory Bank Conflicts

### Bank Structure

Shared memory is organized into **32 banks** (one per warp lane). Successive 32-bit (4-byte) words are assigned to successive banks:

$$\text{bank}(\text{address}) = \left\lfloor \frac{\text{address}}{4} \right\rfloor \mod 32$$

| Address (bytes) | Bank |
|---|---|
| 0-3 | Bank 0 |
| 4-7 | Bank 1 |
| 8-11 | Bank 2 |
| ... | ... |
| 124-127 | Bank 31 |
| 128-131 | Bank 0 (wraps) |

Each bank can serve one 32-bit word per clock cycle (compute capability 5.x+).

### How Conflicts Arise

A **bank conflict** occurs when two or more threads in the same warp access **different addresses** in the **same bank** in a single memory transaction. The hardware serializes these accesses, reducing effective bandwidth.

**N-way bank conflict**: N threads access N different addresses in the same bank. The access is serialized into N separate transactions.

#### Conflict-Free Access Pattern (stride 1):
```
Thread 0 -> Bank 0  (address 0)
Thread 1 -> Bank 1  (address 4)
Thread 2 -> Bank 2  (address 8)
...
Thread 31 -> Bank 31 (address 124)
```
Each thread hits a different bank: **zero conflicts**, served in one transaction.

#### 2-Way Bank Conflict (stride 2):
```
Thread 0  -> Bank 0  (address 0)
Thread 1  -> Bank 2  (address 8)
Thread 2  -> Bank 4  (address 16)
...
Thread 16 -> Bank 0  (address 128)   <-- conflicts with Thread 0!
Thread 17 -> Bank 2  (address 136)   <-- conflicts with Thread 1!
```

#### Worst Case: 32-Way Conflict (stride 32):
```
Thread 0  -> Bank 0  (address 0)
Thread 1  -> Bank 0  (address 128)   <-- same bank!
Thread 2  -> Bank 0  (address 256)   <-- same bank!
...                                  <-- ALL threads hit Bank 0
```
Completely serialized: 32x slowdown.

### Broadcast Mode (No Conflict)

When multiple threads read the **same address** in the same bank, it is served as a **broadcast** -- no conflict occurs. This is a special hardware optimization.

```
Thread 0  -> Bank 0  (address 0)
Thread 1  -> Bank 0  (address 0)    <-- same address = broadcast, no conflict
Thread 2  -> Bank 0  (address 0)    <-- broadcast
```

### Padding Technique

The most common technique to eliminate bank conflicts in matrix transpose or similar operations:

**Problem**: A 32x32 shared memory array has stride-32 access pattern on column reads:
```cuda
__shared__ float tile[32][32];
// Writing rows: conflict-free (stride 1)
// Reading columns: 32-way bank conflict (stride 32)
```

**Solution**: Add 1 padding element per row:
```cuda
__shared__ float tile[32][32 + 1];  // 33 elements per row
// Now column stride = 33, and 33 mod 32 = 1
// Column reads become stride-1 across banks: conflict-free!
```

Cost: ~3% extra shared memory usage. Benefit: eliminates all bank conflicts. Typical speedup: ~20% for matrix transpose kernels.

### Swizzling Technique

An alternative to padding. Rearranges the index mapping so that logically contiguous column accesses map to different banks:

```cuda
// Instead of: tile[row][col]
// Use: tile[row][col ^ row]  // XOR-based swizzling
```

Same performance as padding, but no wasted memory. Used extensively in CUTLASS and cuBLAS internally.

- Source: [Using Shared Memory in CUDA](https://developer.nvidia.com/blog/using-shared-memory-cuda-cc/), [CUDA Shared Memory Bank (Lei Mao)](https://leimao.github.io/blog/CUDA-Shared-Memory-Bank/), [Bank Conflicts Blog](https://ianbarber.blog/2025/03/29/bank-conflicts-in-shared-memory/)

---

## 6. Occupancy Calculation

### Definition

$$\text{Occupancy} = \frac{\text{Active Warps per SM}}{\text{Maximum Warps per SM}}$$

Occupancy measures how well a kernel utilizes the SM's warp scheduling capacity. Higher occupancy generally means better latency hiding (more warps available to schedule when one stalls on memory).

### Maximum Warps per SM (by Compute Capability)

| Compute Capability | Architecture | Max Threads/SM | Max Warps/SM | Max Blocks/SM |
|---|---|---|---|---|
| 7.0 | Volta | 2048 | 64 | 32 |
| 7.5 | Turing | 1024 | 32 | 16 |
| 8.0 | Ampere (A100) | 2048 | 64 | 32 |
| 8.6 | Ampere (A6000) | 1536 | 48 | 16 |
| 9.0 | Hopper (H100) | 2048 | 64 | 32 |
| 10.0 | Blackwell | 2048 | 64 | 32 |

### Limiting Factors

Three resources independently limit how many blocks can fit on an SM:

#### 1. Block Size Limit

$$\text{Blocks}_{\text{threads}} = \left\lfloor \frac{\text{Max Threads per SM}}{\text{Threads per Block}} \right\rfloor$$

Capped at Max Blocks per SM.

#### 2. Register Limit

Each SM has a 64K (65,536) 32-bit register file. Registers are allocated per warp in granules (rounded up to nearest 256 registers per block on compute capability 7.0+).

$$\text{Regs per Block} = \lceil \text{Regs per Thread} \times \text{Threads per Block} / 256 \rceil \times 256$$

$$\text{Blocks}_{\text{regs}} = \left\lfloor \frac{65536}{\text{Regs per Block}} \right\rfloor$$

#### 3. Shared Memory Limit

H100: up to 228 KB of shared memory per SM (configurable via `cudaFuncSetAttribute`).

$$\text{Blocks}_{\text{smem}} = \left\lfloor \frac{\text{SM Shared Memory}}{\text{Shared Memory per Block}} \right\rfloor$$

#### Final Calculation

$$\text{Active Blocks} = \min(\text{Blocks}_{\text{threads}},\ \text{Blocks}_{\text{regs}},\ \text{Blocks}_{\text{smem}},\ \text{Max Blocks per SM})$$

$$\text{Occupancy} = \frac{\text{Active Blocks} \times (\text{Threads per Block} / 32)}{\text{Max Warps per SM}}$$

### Example (H100, Compute Capability 9.0)

Kernel using 64 registers/thread, 256 threads/block, 16 KB shared memory/block:

1. **Thread limit**: $\lfloor 2048 / 256 \rfloor = 8$ blocks (capped at 32, so 8)
2. **Register limit**: $256 \times 64 = 16384$ regs/block. $\lfloor 65536 / 16384 \rfloor = 4$ blocks
3. **Shared memory limit**: $\lfloor 228 \text{KB} / 16 \text{KB} \rfloor = 14$ blocks
4. **Active blocks** = $\min(8, 4, 14, 32) = 4$
5. **Active warps** = $4 \times (256/32) = 32$
6. **Occupancy** = $32 / 64 = 50\%$

### Occupancy Guidelines

- **Target**: 50%+ occupancy is generally sufficient for good performance
- Higher occupancy is not always better (more shared memory per block can outweigh occupancy loss)
- Use CUDA Occupancy Calculator or `cudaOccupancyMaxPotentialBlockSize()` API
- Block sizes should be multiples of 32 (warp size) for efficient scheduling
- Common block sizes: 128, 256, 512 threads

- Source: [CUDA Occupancy Calculation (Lei Mao)](https://leimao.github.io/blog/CUDA-Occupancy-Calculation/), [CUDA Occupancy Calculator](https://xmartlabs.github.io/cuda-calculator/), [NVIDIA Hopper Tuning Guide](https://docs.nvidia.com/cuda/hopper-tuning-guide/index.html)

---

## 7. cuBLAS GEMM Performance

### H100 SXM5 Theoretical Peak TFLOPS

| Precision | Peak TFLOPS | With Sparsity |
|---|---|---|
| FP64 (Tensor Core) | 60 | -- |
| FP32 (CUDA Core) | 60 | -- |
| TF32 (Tensor Core) | 989 | ~1,979 |
| FP16/BF16 (Tensor Core) | 1,979 | ~3,958 |
| FP8 (Tensor Core) | 3,958 | ~7,916 |
| INT8 (Tensor Core) | 3,958 | ~7,916 |

### Achieved cuBLAS Performance

GEMM (General Matrix Multiplication) is the workhorse operation: $C = \alpha \cdot A \times B + \beta \cdot C$.

cuBLAS performance on large, square matrices (m=n=k >= 4096) on H100 SXM5:

| Precision | Achieved TFLOPS | % of Peak | Notes |
|---|---|---|---|
| FP64 | ~51 | ~85% | HPC workloads |
| FP32 (via TF32) | ~800-900 | ~80-90% of TF32 peak | Default for `cublasSgemm` on Ampere+ |
| TF32 | ~800-850 | ~85% | Used automatically for FP32 inputs |
| FP16 | ~1,500-1,700 | ~80-85% | Training standard |
| FP8 | ~3,200-3,500 | ~80-88% | Via Transformer Engine |
| INT8 | ~3,200-3,500 | ~80-88% | Quantized inference |

### Performance vs. Prior Generations

- H100 achieves 3x speedup over A100 for compute-bound FP16 GEMMs
- H100 achieves 4.8x speedup over A100 for FP8 GEMMs
- cuBLAS on H100 PCIe achieves ~215 TFLOPS for TF32 SGEMM; custom CUTLASS kernels reach ~280 TFLOPS

### Key Performance Factors

1. **Matrix size**: Performance scales with matrix dimensions. Small matrices (< 512) are memory-bandwidth-bound.
2. **Alignment**: Data alignment to 16-byte boundaries improves Tensor Core utilization.
3. **Batched GEMM**: `cublasGemmBatchedEx` and `cublasGemmGroupedBatchedEx` for many small matrices.
4. **Math mode**: `CUBLAS_MATH_DISALLOW_REDUCED_PRECISION_REDUCTION` for accuracy-sensitive workloads.

- Source: [cuBLAS 12.0 Features (NVIDIA Blog)](https://developer.nvidia.com/blog/new-cublas-12-0-features-and-matrix-multiplication-performance-on-nvidia-hopper-gpus/), [Optimising GEMM on H100](https://hamzaelshafie.bearblog.dev/worklog-optimising-gemm-on-nvidia-h100-for-cublas-like-performance-wip/), [H100 Datasheet](https://www.nvidia.com/en-us/data-center/h100/), [cuBLAS 12.9 Blog](https://developer.nvidia.com/blog/boosting-matrix-multiplication-speed-and-flexibility-with-nvidia-cublas-12-9/)

---

## 8. NVLink / NVSwitch Specifications

### NVLink Evolution

| Generation | Architecture | Per-Link BW (bidir.) | Links/GPU | Total BW/GPU | Year |
|---|---|---|---|---|---|
| NVLink 1.0 | Pascal (P100) | 40 GB/s | 4 | 160 GB/s | 2016 |
| NVLink 2.0 | Volta (V100) | 50 GB/s | 6 | 300 GB/s | 2017 |
| NVLink 3.0 | Ampere (A100) | 50 GB/s | 12 | 600 GB/s | 2020 |
| NVLink 4.0 | Hopper (H100) | 50 GB/s | 18 | 900 GB/s | 2022 |
| NVLink 5.0 | Blackwell (B200) | 100 GB/s | 18 | 1,800 GB/s | 2024 |

Note: "Bidirectional" means 25 GB/s in each direction for NVLink 1.0-4.0, 50 GB/s each direction for NVLink 5.0.

### NVLink 4.0 (Hopper) Details

- 18 NVLink sub-links per H100 GPU
- Each sub-link: 25 GB/s unidirectional (50 GB/s bidirectional)
- Total: $18 \times 50 = 900$ GB/s bidirectional per GPU
- Protocol: PAM4 signaling at 50 Gbps per lane
- In DGX H100: each GPU connects to 4 NVSwitch chips in a 5+4+4+5 grouping

### NVLink 5.0 (Blackwell) Details

- 18 NVLink connections per GPU
- Each link: 100 GB/s bidirectional (2x NVLink 4.0)
- Total: $18 \times 100 = 1,800$ GB/s (1.8 TB/s) bidirectional per GPU
- Each NVSwitch chip has 72 NVLink 5.0 ports
- Each GPU uses 9 NVLink connections to each of two NVSwitch chips

### NVSwitch Generations

| Generation | Architecture | Ports | Switching BW | Max GPUs (full mesh) |
|---|---|---|---|---|
| NVSwitch 1.0 | Volta | 18 | 900 GB/s | 8 (DGX-2) |
| NVSwitch 2.0 | Ampere | 36 | 1.8 TB/s | 8 (DGX A100) |
| NVSwitch 3.0 | Hopper | 64 | 3.2 TB/s | 8 (DGX H100) |
| NVLink Switch | Blackwell | 72 | 3.6 TB/s | 576 (NVLink domain) |

### DGX H100 Topology

- 8 x H100 GPUs
- 4 x NVSwitch 3.0 chips
- Each GPU connected to all 4 NVSwitches
- Full all-to-all bandwidth: any GPU can communicate with any other at 900 GB/s
- External connectivity via OSFP interfaces on NVSwitch for SuperPOD (256 GPUs)
- 8 x ConnectX-7 400 Gb/s InfiniBand NICs

### DGX B200 / GB200 NVL72

- 72 Blackwell GPUs in a single NVLink domain
- NVLink Switch chips enable full mesh connectivity
- Total bisection bandwidth: $72 \times 1.8 \text{ TB/s} / 2 = 64.8$ TB/s

- Source: [NVLink & NVSwitch (NVIDIA)](https://www.nvidia.com/en-us/data-center/nvlink/), [NVIDIA NVLink 5.0 (Hardware Nation)](https://hardwarenation.com/resources/blog/nvidia-nvlink-5-0-accelerating-multi-gpu-communication/), [NVIDIA Blackwell Architecture](https://www.nvidia.com/en-us/data-center/technologies/blackwell-architecture/), [NVLink Evolution (Fibermall)](https://www.fibermall.com/blog/nvidia-nvlink-and-nvswitch-evolution.htm)

---

## 9. Ring-AllReduce Algorithm

### Problem Statement

Given $N$ GPUs, each holding an array of $K$ values, compute the element-wise sum (or other reduction) and distribute the result to all GPUs.

$$\text{AllReduce}: \{x_0, x_1, \ldots, x_{N-1}\} \rightarrow \{S, S, \ldots, S\}$$

where $S = x_0 + x_1 + \cdots + x_{N-1}$ (element-wise).

### Algorithm (Two Phases)

Ring AllReduce decomposes into two sub-operations:

#### Phase 1: Scatter-Reduce ($N-1$ steps)

1. Partition each GPU's array into $N$ chunks of size $K/N$
2. Arrange GPUs in a logical ring: $\text{GPU}_0 \to \text{GPU}_1 \to \cdots \to \text{GPU}_{N-1} \to \text{GPU}_0$
3. In step $s$ ($s = 0, 1, \ldots, N-2$):
   - Each GPU $p$ sends chunk $(p - s) \mod N$ to GPU $(p+1) \mod N$
   - Each GPU $p$ receives a chunk from GPU $(p-1) \mod N$ and reduces (adds) it into its local chunk

After $N-1$ steps, each GPU holds one fully-reduced chunk (different chunk on each GPU).

#### Phase 2: AllGather ($N-1$ steps)

1. In step $s$ ($s = 0, 1, \ldots, N-2$):
   - Each GPU sends its most recently updated chunk to the next GPU in the ring
   - Each GPU receives a chunk and stores it (no reduction, just copy)

After $N-1$ steps, all GPUs hold the complete reduced array.

### Communication Volume

In each step of each phase, every GPU sends exactly $K/N$ values.

**Per GPU, per phase**: $(N-1) \times K/N$ values sent, $(N-1) \times K/N$ values received

**Total per GPU (both phases)**:

$$\text{Data sent} = 2 \cdot \frac{(N-1)}{N} \cdot K$$

$$\text{Data received} = 2 \cdot \frac{(N-1)}{N} \cdot K$$

### Bandwidth Optimality Proof

**Lower bound**: In any AllReduce algorithm, each GPU must:
- Send at least $(N-1)/N \cdot K$ data (since each of the other $N-1$ GPUs needs $K/N$ of this GPU's data, at minimum)
- Receive at least $(N-1)/N \cdot K$ data (to obtain $(N-1)$ partial results of size $K/N$ each)

This applies for both the reduce and broadcast phases, giving a total lower bound of $2(N-1)/N \cdot K$.

**Ring AllReduce matches this bound exactly**, hence it is **bandwidth-optimal**.

For large $N$: $2(N-1)/N \approx 2$, meaning each GPU transfers approximately $2K$ data regardless of the number of GPUs. The algorithm scales almost perfectly with the number of nodes.

### Time Complexity

$$T_{\text{ring}} = 2(N-1) \cdot \alpha + 2 \cdot \frac{N-1}{N} \cdot K \cdot \beta$$

where $\alpha$ is latency per step and $\beta$ is time per byte (inverse of bandwidth).

- The latency term $2(N-1) \cdot \alpha$ scales linearly with $N$ (not optimal for latency)
- The bandwidth term $2 \cdot \frac{N-1}{N} \cdot K \cdot \beta$ is nearly constant for large $N$ (optimal)

For large messages (where $K \cdot \beta \gg \alpha$), ring AllReduce is optimal. For small messages, tree-based algorithms with $O(\log N)$ latency may be preferred.

### Practical Example (4 GPUs)

```
Initial state:      GPU0=[a0,a1,a2,a3]  GPU1=[b0,b1,b2,b3]
                     GPU2=[c0,c1,c2,c3]  GPU3=[d0,d1,d2,d3]

--- Scatter-Reduce (3 steps) ---
Step 1: GPU0 sends chunk0 to GPU1, GPU1 sends chunk1 to GPU2, ...
Step 2: ...
Step 3: ...
After:   GPU0 has SUM[chunk3]    GPU1 has SUM[chunk0]
         GPU2 has SUM[chunk1]    GPU3 has SUM[chunk2]

--- AllGather (3 steps) ---
Step 1-3: Circulate the reduced chunks around the ring

Final:   All GPUs have [SUM[chunk0], SUM[chunk1], SUM[chunk2], SUM[chunk3]]
```

Total data per GPU: $2 \times \frac{3}{4} \times K = 1.5K$ (vs. $3K$ for naive all-to-all).

- Source: [Andrew Gibiansky: Bringing HPC to Deep Learning](https://andrew.gibiansky.com/blog/machine-learning/baidu-allreduce/), [Ring AllReduce Visual Intuition (Medium)](https://medium.com/data-science/visual-intuition-on-ring-allreduce-for-distributed-deep-learning-d1f34b4911da), [How All-Reduce Algorithms Work (APXML)](https://apxml.com/courses/optimization-techniques-ml/chapter-5-distributed-ml-optimization/all-reduce-algorithms), [Bandwidth Optimal All-reduce (FSU)](https://www.cs.fsu.edu/~xyuan/paper/09jpdc.pdf)

---

## 10. Multi-GPU Programming

### NCCL (NVIDIA Collective Communications Library)

NCCL (pronounced "nickel") provides optimized collective communication primitives for multi-GPU and multi-node training.

#### Supported Collectives

| Collective | Operation |
|---|---|
| `ncclAllReduce` | Reduce + broadcast to all GPUs |
| `ncclBroadcast` | Send from one GPU to all |
| `ncclReduce` | Reduce to one GPU |
| `ncclAllGather` | Gather arrays from all GPUs to all |
| `ncclReduceScatter` | Reduce, then scatter chunks |
| `ncclSend` / `ncclRecv` | Point-to-point send/receive |

#### Key Features

- **Single-kernel implementation**: Each collective runs as a single CUDA kernel, handling both communication and computation. Minimizes kernel launch overhead and synchronization.
- **Topology-aware**: Automatically detects NVLink, PCIe, InfiniBand topology and selects optimal algorithm (ring, tree, or hybrid).
- **Transport layers**: NVLink (intra-node), PCIe/shared memory (intra-node fallback), InfiniBand Verbs, TCP/IP sockets
- **Multi-threaded**: Compatible with any parallelization model -- single-thread (one GPU per thread), multi-threaded (one thread per GPU), or MPI + multi-threaded.

#### Usage Pattern

```cpp
#include <nccl.h>

// Initialize
ncclComm_t comms[nGPUs];
ncclCommInitAll(comms, nGPUs, devList);

// AllReduce
ncclGroupStart();
for (int i = 0; i < nGPUs; i++) {
    ncclAllReduce(sendbuff[i], recvbuff[i], count,
                  ncclFloat, ncclSum, comms[i], streams[i]);
}
ncclGroupEnd();

// Synchronize
for (int i = 0; i < nGPUs; i++) {
    cudaSetDevice(devList[i]);
    cudaStreamSynchronize(streams[i]);
}
```

### GPUDirect Technologies

#### GPUDirect Peer-to-Peer (P2P)

- Enables direct memory access between GPUs on the same PCIe root complex
- No staging through CPU system memory
- Requires both GPUs to be on same PCIe switch or have NVLink connectivity
- API: `cudaMemcpyPeer()`, `cudaMemcpyPeerAsync()`

```cpp
// Enable P2P access
cudaSetDevice(0);
cudaDeviceEnablePeerAccess(1, 0);  // GPU 0 can access GPU 1's memory

// Direct copy
cudaMemcpyPeer(dst_gpu1, 1, src_gpu0, 0, size);
```

#### GPUDirect RDMA (Remote Direct Memory Access)

- Enables network adapters (InfiniBand, Ethernet) to directly read/write GPU memory
- Bypasses CPU entirely: NIC reads from GPU memory, sends over network, NIC on remote node writes directly to remote GPU memory
- Path: GPU Memory <-> NIC <-> Network <-> NIC <-> GPU Memory
- Requires: NVIDIA Mellanox/ConnectX NICs, MOFED drivers, GPUDirect-capable GPU (Kepler+)
- Reduces latency and CPU overhead for distributed training

#### GPUDirect Storage

- Direct data path between GPU memory and NVMe/NFS storage
- Bypasses CPU bounce buffer for loading datasets
- Useful for training on datasets larger than system memory

### Peer-to-Peer Memory Access

```cpp
// Check P2P capability
int canAccess;
cudaDeviceCanAccessPeer(&canAccess, gpu0, gpu1);

// Enable access (bidirectional requires two calls)
cudaSetDevice(gpu0);
cudaDeviceEnablePeerAccess(gpu1, 0);
cudaSetDevice(gpu1);
cudaDeviceEnablePeerAccess(gpu0, 0);

// Kernel on GPU 0 can now dereference pointers to GPU 1's memory
// (will go over NVLink if available, PCIe otherwise)
```

### Unified Memory with Multi-GPU

```cpp
// Allocate managed memory (accessible from any GPU or CPU)
float *data;
cudaMallocManaged(&data, size);

// Set preferred location
cudaMemAdvise(data, size, cudaMemAdviseSetPreferredLocation, gpu0);

// Set access-from hint for another GPU
cudaMemAdvise(data, size, cudaMemAdviseSetAccessedBy, gpu1);

// The runtime handles page migration transparently
// Pages fault to the accessing processor on first access
```

**Multi-GPU Unified Memory limitations**:
- Page migration overhead can be significant for random access patterns
- Prefetch with `cudaMemPrefetchAsync()` to avoid page faults
- Best for access patterns with temporal/spatial locality
- On NVLink systems, remote access (without migration) may be faster than migration for infrequent access

### NCCL Communication Patterns for Distributed Training

| Training Strategy | Primary NCCL Operations |
|---|---|
| Data Parallelism | `AllReduce` (gradient synchronization) |
| Model Parallelism (Tensor) | `AllReduce`, `AllGather`, `ReduceScatter` |
| Pipeline Parallelism | `Send` / `Recv` (point-to-point) |
| Expert Parallelism (MoE) | `AllToAll` |
| ZeRO (DeepSpeed) | `ReduceScatter` + `AllGather` |

- Source: [NCCL Overview (NVIDIA)](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/overview.html), [NCCL GitHub](https://github.com/NVIDIA/nccl), [Fast Multi-GPU Collectives (NVIDIA Blog)](https://developer.nvidia.com/blog/fast-multi-gpu-collectives-nccl/), [Distributed GPU Communication (Medium)](https://medium.com/gpu-kernel-hacking-for-engineers/part-3-distributed-gpu-communication-with-rdma-nccl-and-gpudirect-975b81f4987f)

---

## Cross-Reference: Key Numbers for Lecture Use

Quick-reference table of the most commonly cited numbers:

| Fact | Value |
|---|---|
| Warp size | 32 threads |
| Shared memory banks | 32 banks, 4-byte stride |
| Max threads per block | 1024 |
| Max warps per SM (Hopper) | 64 |
| Max blocks per SM (Hopper) | 32 |
| Registers per SM | 65,536 (64K) |
| Max registers per thread | 255 |
| H100 CUDA cores | 16,896 (SXM) |
| H100 FP16 Tensor TFLOPS | 1,979 |
| H100 FP8 Tensor TFLOPS | 3,958 |
| H100 memory bandwidth | 3.35 TB/s (SXM) |
| H100 NVLink bandwidth | 900 GB/s |
| B200 CUDA cores | 20,480 |
| B200 NVLink bandwidth | 1.8 TB/s |
| Ring AllReduce data/GPU | $2(N-1)/N \cdot K$ |
| Target occupancy | 50%+ |
