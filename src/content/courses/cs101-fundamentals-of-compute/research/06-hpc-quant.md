# Research Notes: Supercomputers, HPC, and Quantitative Computing

> Research compiled March 2026. Sources cited inline and at end of each section.

---

## 1. TOP500 Current Top Supercomputers (November 2025)

### #1 — El Capitan

| Attribute | Value |
|-----------|-------|
| **Location** | Lawrence Livermore National Laboratory (LLNL), Livermore, CA, USA |
| **Architecture** | AMD EPYC "Genoa" 24-core (4th Gen) + AMD Instinct MI300A (CDNA3) |
| **Nodes** | 11,136 compute nodes (4x MI300A per node = 44,544 MI300A total) |
| **CPUs** | 43,808 AMD EPYC 24C "Genoa" at 1.8 GHz |
| **GPUs** | 43,808 AMD Instinct MI300A (CPU+GPU APU, 128 GB HBM3 each) |
| **Rmax (achieved)** | 1.742 EFlop/s (HPL), later improved to 1.809 EFlop/s |
| **Rpeak** | ~2.75 EFlop/s |
| **Interconnect** | HPE Slingshot-11, dragonfly topology, 200 Gbps/port |
| **Power** | ~30 MW |
| **Efficiency** | 58.89 GFlops/W |
| **Cooling** | 100% direct liquid cooling (fanless) |
| **System** | HPE Cray EX255a |

The MI300A is an APU (Accelerated Processing Unit) that integrates 24 Zen4 CPU cores and CDNA3 GPU compute dies onto a single package with 128 GB HBM3. This eliminates the PCIe bottleneck between CPU and GPU.

*Sources: [LLNL El Capitan](https://hpc.llnl.gov/hardware/compute-platforms/el-capitan), [TOP500 Nov 2025](https://top500.org/lists/top500/2025/11/), [AMD Blog](https://www.amd.com/en/blogs/2025/el-capitan-takes-exascale-computing-to-new-heights.html)*

### #2 — Frontier

| Attribute | Value |
|-----------|-------|
| **Location** | Oak Ridge National Laboratory (ORNL), Oak Ridge, TN, USA |
| **Architecture** | AMD EPYC 7A53 "Trento" 64-core + AMD Instinct MI250X (CDNA2) |
| **Nodes** | 9,408 (original); expanded to 9,856 nodes (77 cabinets) as of late 2025 |
| **GPUs per node** | 4x MI250X, each with 2 GCDs = 8 GCDs/node |
| **Total GPUs** | 37,888 MI250X (8,335,360 GPU cores) |
| **Rmax** | 1.353 EFlop/s |
| **Rpeak** | ~1.68 EFlop/s |
| **Interconnect** | HPE Slingshot-11, dragonfly topology |
| **Power** | ~21 MW |
| **System** | HPE Cray EX235a |

*See Section 2 for detailed Frontier architecture.*

*Sources: [Frontier Wikipedia](https://en.wikipedia.org/wiki/Frontier_(supercomputer)), [OLCF User Guide](https://docs.olcf.ornl.gov/systems/frontier_user_guide.html)*

### #3 — Aurora

| Attribute | Value |
|-----------|-------|
| **Location** | Argonne Leadership Computing Facility (ALCF), Argonne, IL, USA |
| **Architecture** | Intel Xeon Max (Sapphire Rapids w/ HBM) + Intel Data Center GPU Max (Ponte Vecchio) |
| **Nodes** | 10,624 Exascale Compute Blades |
| **CPUs per node** | 2x Intel Xeon Max 9470 (52 cores each) |
| **GPUs per node** | 6x Intel GPU Max 1550 (Ponte Vecchio) |
| **Total GPUs** | 63,744 Intel GPU Max |
| **Total CPUs** | 21,248 Xeon Max CPUs |
| **Rmax** | 1.012 EFlop/s |
| **Interconnect** | HPE Slingshot-11, dragonfly topology, 8 NICs per node, 300K+ fabric ports |
| **Power** | ~4 kW per blade (~42 MW system) |
| **System** | HPE Cray EX |

Aurora has the largest Slingshot-11 deployment in the world. Each blade achieves ~145 TF/s double-precision HPL.

*Sources: [Aurora arXiv paper](https://arxiv.org/abs/2509.08207), [ALCF Aurora](https://www.alcf.anl.gov/aurora)*

### #4 — JUPITER Booster

| Attribute | Value |
|-----------|-------|
| **Location** | Julich Supercomputing Centre (JSC), Julich, Germany (EuroHPC) |
| **Architecture** | NVIDIA GH200 Grace Hopper Superchips |
| **Nodes** | ~5,900 accelerator nodes (Booster) + 1,300 CPU-only nodes (Cluster) |
| **Accelerators** | ~24,000 NVIDIA GH200 Grace Hopper Superchips |
| **Cluster CPUs** | ParTec nodes with Rhea1 chips (80 Neoverse V1 "Zeus" cores each) |
| **Rmax** | 1.000 EFlop/s (first European exascale system) |
| **Interconnect** | NVIDIA InfiniBand NDR, DragonFly+ topology, NDR200 (1 link/node), 11,000+ 400 Gb/s global links |
| **Efficiency** | 60 GFlops/W (most energy-efficient in top 5) |
| **Budget** | 500M EUR total |
| **System** | Eviden BullSequana XH3000, direct liquid cooled |

*Sources: [JUPITER Tech Overview](https://www.fz-juelich.de/en/jsc/jupiter/tech), [HPCwire](https://www.hpcwire.com/2025/06/10/top500-jupiter-joins-the-list-at-number-four-but-top-three-hold-their-position/)*

### #5 — HPC6 (Eni)

HPC6 at Eni (Italy) rounds out the top 5. Notably, other major systems include:

**Fugaku** (RIKEN Center, Kobe, Japan):

| Attribute | Value |
|-----------|-------|
| **Architecture** | Fujitsu A64FX (ARM v8.2A), 48 cores @ 2.2 GHz |
| **Memory** | 32 GB HBM2 per CPU, 1 TB/s bandwidth |
| **Interconnect** | Tofu Interconnect D, 6D mesh/torus (24x23x24x2x3x2), 6.8 GB/s per link |
| **Rmax** | 442 PFlop/s |
| **Power** | 28 MW |
| **Nodes** | 158,976 |

First ARM-based system to top the TOP500 (June 2020).

**LUMI** (CSC, Kajaani, Finland):

| Attribute | Value |
|-----------|-------|
| **Architecture** | AMD EPYC "Trento" 64-core + AMD MI250X |
| **GPU nodes** | 2,978 (4x MI250X each = 11,912 GPUs) |
| **Rmax** | 379.7 PFlop/s |
| **Power** | ~8 MW |
| **Interconnect** | HPE Slingshot-11, 4x 200 Gbps NICs per node (800 Gbps injection) |
| **Efficiency** | 53.4 GFlops/W; 100% hydroelectric, waste heat used for district heating |
| **TOP500 Rank** | #9 (Nov 2025) |

*Sources: [Fugaku Wikipedia](https://en.wikipedia.org/wiki/Fugaku_(supercomputer)), [LUMI Wikipedia](https://en.wikipedia.org/wiki/LUMI), [TOP500](https://top500.org/lists/top500/2025/11/)*

---

## 2. Frontier (ORNL) — Detailed Architecture

### Node Architecture

Each Frontier compute node contains:
- **1x** AMD EPYC 7A53 "Optimized 3rd Gen EPYC" (Trento) CPU: 64 cores, 2 hardware threads per core
- **512 GB** DDR4 memory (CPU-attached)
- **4x** AMD Instinct MI250X GPUs
- Each MI250X has **2 Graphics Compute Dies (GCDs)** = 8 GCDs per node
- Each GCD has **64 GB HBM2e** = 512 GB total GPU memory per node
- Each GCD presents as a separate GPU to the programmer

### MI250X Architecture (CDNA2)

- 2 GCDs per package, connected via Infinity Fabric
- 110 Compute Units (CUs) per GCD (220 per MI250X)
- 14,080 stream processors per GCD
- Peak FP64: 47.9 TFLOPS per MI250X (matrix), 23.95 TFLOPS (vector)
- Peak FP32: 47.9 TFLOPS per MI250X
- 128 GB HBM2e total (64 GB per GCD)
- Memory bandwidth: 3.2 TB/s per MI250X (1.6 TB/s per GCD)

### Interconnect — HPE Slingshot-11

- **Topology**: Dragonfly with at most 3 hops between any two nodes
- **Switch**: HPE Slingshot 64-port switch, 12.8 Tbps aggregate bandwidth
- **NIC**: Cassini NIC, 200 Gbps per port
- **Features**: Fine-grained adaptive routing, hardware congestion control
- **Protocol**: HPC Ethernet extending to compute nodes; RoCEv2 (RDMA over Converged Ethernet)

### Storage — Orion File System

- Lustre-based parallel file system
- HPE ClusterStor E1000
- 700 PB capacity, 10+ TB/s aggregate bandwidth

### Power and Cooling

- **Total power**: ~21 MW (equivalent to ~15,000 homes)
- **Cooling**: Direct liquid cooling via HPE Cray EX cabinet design
- Predecessor Summit consumed 13 MW at 148 PFlop/s

*Sources: [OLCF Frontier User Guide](https://docs.olcf.ornl.gov/systems/frontier_user_guide.html), [OLCF Frontier](https://www.olcf.ornl.gov/frontier/), [AMD MI250X presentation](https://www.olcf.ornl.gov/wp-content/uploads/Public-AMD-Instinct-MI-250X-Frontier-8.23.23.pdf)*

---

## 3. Google TPU v4 / v5 Architecture

### Systolic Array Design — The Matrix Multiply Unit (MXU)

The core compute primitive of every TPU is the **Matrix Multiply Unit (MXU)**, a systolic array:

- **TPU v1-v5p**: 128 x 128 multiply-accumulators in a systolic array
- **TPU v6e, Trillium, Ironwood**: 256 x 256 multiply-accumulators
- Each MXU performs **16,384 multiply-accumulate ops per cycle** (128x128) or **65,536** (256x256)
- **Inputs**: bfloat16 (brain floating point, 1 sign + 8 exponent + 7 mantissa)
- **Accumulation**: FP32 (full precision accumulation prevents error drift)

Each TensorCore contains **4 MXUs**, plus a vector unit and scalar unit.

### bfloat16 Format

```
bfloat16: [1 sign][8 exponent][7 mantissa] = 16 bits
  - Same exponent range as FP32 (dynamic range preserved)
  - Reduced mantissa (7 vs 23 bits of FP32)
  - Truncation of FP32 is trivial (just drop low 16 bits)
```

### TPU v4 Specifications

| Attribute | Value |
|-----------|-------|
| **Process** | 7nm |
| **MXUs per chip** | 4 (in 2 TensorCores) |
| **HBM** | 32 GB HBM2e |
| **BF16 peak** | ~275 TFLOPS |
| **ICI links** | 6 links (3D torus: +/-X, +/-Y, +/-Z) |
| **ICI bandwidth** | 400 Gbps per direction per link |
| **Pod topology** | 4x4x4 cubes (64 chips), up to 64 cubes = 4,096 chips per pod |

### TPU v4 Pod and Optical Circuit Switching (OCS)

- Pods are built from 4x4x4 cubes of 64 chips in a **3D torus**
- Internal cube links: copper/PCB traces (electrical)
- External cube links: **96 optical links per cube** connected to OCS switches
- OCS switches: **Palomar OCS** (136x136, 128 usable ports + 8 spares)
- Each cube connects to **48 OCS switches**
- OCS dynamically reconfigures topology to improve utilization, availability, and performance
- **Twisted torus** configurations increase bisection bandwidth ~70% over non-twisted

### TPU v5e Specifications

| Attribute | Value |
|-----------|-------|
| **Target** | Cost-efficient inference and training for <200B parameter models |
| **MXUs per chip** | 4 (single TensorCore) |
| **HBM** | 16 GB |
| **BF16 peak** | 197 TFLOPS |
| **Int8 peak** | 393 TOPS |
| **Pod** | 256 chips (16x16 2D torus) |
| **Pod BF16** | ~50.5 PFLOPS |

### TPU v5p Specifications

| Attribute | Value |
|-----------|-------|
| **Target** | Large-scale training |
| **TensorCores per chip** | 2 (8 MXUs total) |
| **HBM** | 96 GB |
| **BF16 peak** | 459 TFLOPS per chip |
| **Pod** | 8,960 chips |
| **Pod BF16** | ~4.0 EFLOPS |

### How TPUs Differ from GPUs

| Feature | GPU (NVIDIA) | TPU (Google) |
|---------|-------------|-------------|
| **Core design** | CUDA cores (scalar) + Tensor Cores | Systolic array MXUs |
| **Programming** | CUDA/HIP | XLA/JAX |
| **Memory** | HBM per device | HBM per chip |
| **Interconnect** | NVLink + NVSwitch + IB | ICI (3D torus) + OCS |
| **Topology** | Fat-tree / rail-optimized | 3D torus with OCS |
| **Availability** | Multi-vendor | Google Cloud only |

*Sources: [Google Cloud TPU docs](https://docs.cloud.google.com/tpu/docs/system-architecture-tpu-vm), [TPU v4 arXiv paper](https://arxiv.org/abs/2304.01433), [JAX Scaling Book](https://jax-ml.github.io/scaling-book/tpus/)*

---

## 4. Cerebras Wafer-Scale Engine

### WSE-2 (CS-2 System)

| Attribute | Value |
|-----------|-------|
| **Process** | TSMC 7nm |
| **Die area** | 46,225 mm^2 (215 mm x 215 mm) — entire 300mm wafer |
| **Transistors** | 2.6 trillion |
| **AI cores** | 850,000 |
| **On-chip SRAM** | 40 GB (NO external DRAM — all on-die) |
| **Memory bandwidth** | 20 PB/s |
| **Fabric bandwidth** | 220 Pb/s |
| **FP16 peak** | 7,500 TFLOPS (7.5 PFLOPS) |
| **Power** | 15 kW |
| **Form factor** | 26 inches tall, 1/3 of standard rack |

### WSE-3 (CS-3 System)

| Attribute | Value |
|-----------|-------|
| **Process** | TSMC 5nm |
| **Die area** | 46,225 mm^2 (same wafer size) |
| **Transistors** | 4 trillion |
| **AI cores** | 900,000 |
| **On-chip SRAM** | 44 GB |
| **Memory bandwidth** | 21 PB/s (7,000x H100) |
| **FP16 peak** | 125 PFLOPS |
| **Power** | ~23 kW |
| **Form factor** | 15U rack unit |

### Why No DRAM?

The WSE places **all memory on-die as SRAM**. Key implications:

- **Latency**: SRAM access is ~1 ns vs DRAM at ~50-100 ns (50-100x faster)
- **Bandwidth**: 20-21 PB/s vs GPU HBM at ~3 TB/s (7,000x more bandwidth)
- **Trade-off**: Total capacity is limited (40-44 GB) vs HBM (80-192 GB per GPU)
- **No off-chip memory wall**: Eliminates the von Neumann bottleneck for models that fit

### MemoryX and SwarmX

To handle models larger than on-chip SRAM:

- **MemoryX**: External memory appliance attached via high-bandwidth links
  - CS-2 MemoryX: 1.5 TB and 12 TB SKUs
  - CS-3 MemoryX: 24 TB, 36 TB (enterprise), 120 TB, 1,200 TB (hyperscale)
  - Up to 1.5 PB per system
  - Stores model weights externally; streams them to WSE as needed
  - Decouples compute scaling from memory scaling

- **SwarmX**: Interconnect fabric linking multiple CS systems
  - Up to **2,048 CS-3 systems** can be linked
  - Theoretical aggregate: up to **0.25 zettaFLOPS** (quarter of a zettaflop)
  - Eliminates GPU cluster interconnect bottlenecks for memory-bandwidth-limited workloads

### Wafer-Scale Integration Advantages

1. **No package boundaries**: All 850K-900K cores communicate via on-die interconnect (no PCIe, no NVLink)
2. **Massive fabric bandwidth**: 220 Pb/s on-die vs ~900 GB/s NVLink per GPU
3. **Deterministic latency**: Neighbor-to-neighbor communication is single-cycle
4. **Power efficiency**: No I/O serialization/deserialization overhead

*Sources: [Cerebras WSE-2 Specs](https://www.tomshardware.com/news/cerebras-wafer-scale-engine-2-worlds-largest-chip-7nm-850000-cores), [Cerebras CS-3 Blog](https://www.cerebras.ai/blog/cerebras-cs3), [Cerebras Chip Page](https://www.cerebras.ai/chip), [AnandTech WSE-2 Reveal](https://www.anandtech.com/show/16626/cerebras-unveils-wafer-scale-engine-two-wse2-26-trillion-transistors-100-yield)*

---

## 5. Interconnect Topologies

### Fat Tree (Clos Network)

A **k-ary fat tree** (built from k-port switches) has:

- **k pods**, each with 2 layers of $k/2$ switches
- $(k/2)^2$ core switches (k-port each)
- Supports $k^3/4$ hosts total

**Bisection bandwidth formula**:

$$B_{bisection} = \frac{k^3}{4} \times \text{link\_bandwidth}$$

For a fat tree with $N$ hosts and link bandwidth $b$:

$$B_{bisection} = N \times b$$

(Full bisection bandwidth — any host can communicate with any other at full link rate.)

**Pros**: Full bisection bandwidth, predictable performance regardless of traffic pattern, well-understood.

**Cons**: Expensive (requires many switches at core layer), cost scales non-linearly with cluster size, high cable count.

**Cost**: For N endpoints, a 3-stage fat tree requires $5N/4$ switches (each with $k$ ports), giving $O(N^{5/3})$ cost scaling.

*Sources: [Al-Fares et al., SIGCOMM](http://ccr.sigcomm.org/online/files/p63-alfares.pdf), [Fat Tree Wikipedia](https://en.wikipedia.org/wiki/Fat_tree)*

### Dragonfly Topology

Dragonfly is a hierarchical topology defined by three parameters:
- $p$ = number of compute links per switch (to local hosts)
- $a$ = number of switches per group
- $h$ = number of global links per switch

**Balanced configuration**: $a = 2p = 2h$

**Structure**:
- Nodes within a group are fully connected (all-to-all local links)
- Groups are fully connected to each other (each pair has at least one global link)
- Total groups: $g = a \cdot h + 1$
- Total endpoints: $N = p \cdot a \cdot g$

**Routing**:
- **Minimal routing** (MIN): Source switch -> local link -> source group router -> global link -> destination group router -> local link -> destination switch. Maximum 3 hops (Local-Global-Local = LGL).
- **Non-minimal routing** (Valiant/UGAL): Route to a random intermediate group first, then to destination. Path: LGLLGL (5 hops). Doubles path length but load-balances global links.
- **Adaptive routing (UGAL)**: Dynamically choose minimal or non-minimal based on local queue depth.

**Bisection bandwidth**: For the same global cable count, dragonfly uses only **half** the global cables of a flattened butterfly.

**Used in**: HPE Slingshot (Frontier, Aurora, LUMI), JUPITER (DragonFly+ variant)

*Sources: [Kim et al., "Technology-Driven, Highly-Scalable Dragonfly Topology"](https://research.google.com/pubs/archive/34926.pdf), [IETF Dragonfly Routing](https://datatracker.ietf.org/meeting/117/materials/slides-117-rift-dragonfly-routing-00)*

### Torus (3D / 6D)

In a $k$-ary $n$-dimensional torus:
- Each node connects to $2n$ neighbors (2 per dimension: +/- direction)
- Total nodes: $k^n$
- Network diameter: $n \cdot \lfloor k/2 \rfloor$

**Bisection bandwidth** for a $k$-ary $n$-cube torus:

$$B_{bisection} = 2 \cdot k^{n-1} \times \text{link\_bandwidth}$$

**6D Torus (Tofu Interconnect)**:
- Used in Fugaku: 24x23x24x2x3x2 mesh/torus
- 6D topology abstracted by software as 3D torus
- 10 GB/s full-duplex links (5 GB/s per direction)
- 12x higher scalability than 3D torus
- Supports 100,000+ nodes

**3D Torus (TPU v4)**:
- 4x4x4 cubes, optical reconfiguration via OCS
- Twisted torus increases bisection bandwidth by ~70%

**Pros**: Low cost (no switches needed, direct connections), excellent for nearest-neighbor communication patterns (stencil codes, lattice QCD).

**Cons**: Low bisection bandwidth relative to fat tree, higher latency for non-local traffic, blocking for adversarial traffic patterns.

### Topology Comparison Summary

| Metric | Fat Tree | Dragonfly | Torus |
|--------|----------|-----------|-------|
| **Bisection BW** | Full (highest) | Medium | Low |
| **Hop count** | $O(\log N)$ | 3-5 | $O(n \cdot k)$ |
| **Cable cost** | Highest | Medium | Lowest |
| **Switch count** | Highest | Medium | Zero (direct) |
| **Best for** | All-to-all traffic | Mixed workloads | Nearest-neighbor |
| **Latency scaling** | Logarithmic | Near-constant | Linear with diameter |

*Sources: [HPCwire Network Topologies](https://www.hpcwire.com/2019/07/15/super-connecting-the-supercomputers-innovations-through-network-topologies/), [Introl GPU Cluster Topology Guide](https://introl.com/blog/gpu-cluster-network-topology-fat-tree-dragonfly-rail-optimized-2025)*

---

## 6. MPI Collective Operations — Algorithms

### MPI_Allreduce

All processes contribute a vector of length $n$; result (element-wise reduction) is distributed to all.

**Cost model**: $T = \alpha \cdot \text{steps} + \beta \cdot \text{data\_moved} + \gamma \cdot \text{compute}$

where $\alpha$ = latency per message, $\beta$ = inverse bandwidth (s/byte), $\gamma$ = compute time per element.

#### Algorithm 1: Recursive Doubling

- **Steps**: $\lceil \log_2 P \rceil$ (where $P$ = number of processes)
- **Per step**: Exchange full vector with partner at distance $2^k$
- **Cost**: $T = \log_2 P \cdot \alpha + \log_2 P \cdot n \cdot \beta$
- **Optimal for**: Short messages (latency-dominated)
- **Weakness**: Bandwidth term scales as $n \log P$ (wasteful for large $n$)

#### Algorithm 2: Ring Allreduce

- **Phase 1 (Reduce-Scatter)**: $P-1$ steps, each sending $n/P$ elements around a ring
- **Phase 2 (Allgather)**: $P-1$ steps, each sending $n/P$ elements around a ring
- **Cost**: $T = 2(P-1) \cdot \alpha + 2 \cdot \frac{P-1}{P} \cdot n \cdot \beta$
- **Optimal for**: Large messages (bandwidth-dominated)
- **Bandwidth term**: $\approx 2n\beta$ (independent of $P$!)
- **Weakness**: Latency scales linearly with $P$

#### Algorithm 3: Rabenseifner (Recursive Halving-Doubling)

Combines the best of both approaches:

- **Phase 1 (Reduce-Scatter via Recursive Halving)**: $\log_2 P$ steps, each halving the vector and sending to partner at distance $2^k$
- **Phase 2 (Allgather via Recursive Doubling)**: $\log_2 P$ steps, doubling data and sending to partner at distance $2^{k-1}, ..., 2^0$
- **Cost**: $T = 2 \log_2 P \cdot \alpha + 2 \cdot \frac{P-1}{P} \cdot n \cdot \beta$
- **Both**: Logarithmic latency AND near-optimal bandwidth
- **Used by**: MPICH for medium-to-large messages with power-of-two process counts

**OpenMPI default selection**:
- Data size < 10 KB: Recursive Doubling
- Data size >= 10 KB: Ring Allreduce

### MPI_Alltoall

Every process sends distinct data to every other process ("complete exchange" or "personalized all-to-all").

#### Bruck's Algorithm

- **Steps**: $\lceil \log_2 P \rceil$
- **Per step $k$**: Process $i$ sends to process $(i + 2^k) \mod P$
- **Data per step**: $\lceil P/2 \rceil$ blocks of size $m$ (message size per pair)
- **Total data moved**: $\frac{P}{2} \cdot \log_2 P \cdot m$
- **Latency-optimal**: Only $\log_2 P$ messages
- **Best for**: Small messages where latency dominates

#### Pairwise Exchange (for large messages)

- **Steps**: $P-1$
- **Per step $k$**: Process $i$ exchanges with process $(i \oplus k)$
- **Bandwidth-optimal**: Each process sends/receives exactly $(P-1) \cdot m$ bytes total

### MPI_Bcast

Root process sends a message to all $P$ processes.

#### Binomial Tree

- **Steps**: $\lceil \log_2 P \rceil$
- **Per step**: Root sends to increasing number of partners (1, then 2, then 4, ...)
- **Cost**: $T = \log_2 P \cdot (\alpha + n \cdot \beta)$
- **Latency-optimal**: Only $\log_2 P$ messages
- **Bandwidth-suboptimal**: Entire message sent at each step

#### Scatter + Allgather (for long messages)

- **Phase 1 (Scatter)**: Binomial tree scatter of $n/P$-sized chunks
- **Phase 2 (Allgather)**: Ring allgather to reconstruct full message
- **Cost**: $T = \log_2 P \cdot \alpha + \frac{P-1}{P} \cdot n \cdot \beta + (P-1) \cdot \alpha$
- **Bandwidth-optimal**: Each link carries only $n/P$ data at a time

### Regime Summary

| Message Size | Latency-optimal Algorithm | Bandwidth-optimal Algorithm |
|-------------|--------------------------|----------------------------|
| Small ($n \ll P$) | Recursive Doubling / Binomial | (latency dominates anyway) |
| Medium | Rabenseifner | Rabenseifner |
| Large ($n \gg P$) | (bandwidth dominates) | Ring / Scatter+Allgather |

*Sources: [Rabenseifner, ICCS 2004](https://fs.hlrs.de/projects/rabenseifner/publ/myreduce_iccs2004_2.pdf), [Thakur et al., IJHPCA](https://web.cels.anl.gov/~thakur/papers/ijhpca-coll.pdf), [OpenMPI Allreduce implementation](https://github.com/open-mpi/ompi/blob/main/ompi/mca/coll/base/coll_base_allreduce.c)*

---

## 7. Slingshot and InfiniBand NDR

### HPE Slingshot-11

| Attribute | Value |
|-----------|-------|
| **Port speed** | 200 Gbps per port |
| **Switch** | 64-port Slingshot switch, 25.6 Tbps aggregate |
| **NIC** | Cassini NIC (200 Gbps) |
| **Protocol** | HPC Ethernet (compatible with standard Ethernet) |
| **RDMA** | RoCEv2 (RDMA over Converged Ethernet v2) |
| **Routing** | Fine-grained adaptive routing with hardware congestion control |
| **Topology** | Dragonfly (configurable) |

**Key innovations**:
- **Adaptive routing in silicon**: Hardware-level per-packet routing decisions based on congestion signals
- **Congestion control**: Credit-based, prevents hot-spot formation without overprovisioning
- **Ethernet compatibility**: Standard IPv4/IPv6 software stack runs alongside HPC RDMA traffic
- **NIC-level HPC Ethernet**: Cassini NIC extends HPC protocol to endpoints (not just switch-to-switch)

**Next generation — Slingshot 400**:
- Switch ASIC: 51.2 Tbps
- Port speed: 400 Gbps per port
- Liquid-cooled switch design

### InfiniBand NDR

| Generation | Per-Lane | Lanes | Port Speed | Encoding |
|-----------|---------|-------|------------|----------|
| HDR | 50 Gbps | 4x | 200 Gbps | 64b/66b |
| NDR | 100 Gbps | 4x | 400 Gbps | 64b/66b |
| NDR200 | 100 Gbps | 2x | 200 Gbps | 64b/66b |

**NDR switches**: NVIDIA Quantum-2, 400 Gbps per port
**HDR switches**: NVIDIA Quantum, 200 Gbps per port, 130 ns port-to-port latency

| Attribute | Slingshot-11 | IB HDR | IB NDR |
|-----------|-------------|--------|--------|
| **Port speed** | 200 Gbps | 200 Gbps | 400 Gbps |
| **Switch BW** | 25.6 Tbps | 16 Tbps | 51.2 Tbps |
| **Latency** | ~1 us (port-to-port) | ~0.6 us | ~0.5 us |
| **RDMA** | RoCEv2 | IB Verbs (native) | IB Verbs (native) |
| **Routing** | Adaptive | Static + adaptive | Adaptive |
| **Connector** | QSFP56 | QSFP56 | OSFP (switch), QSFP112 (NIC) |
| **Topology** | Dragonfly | Fat tree / DragonFly+ | Fat tree / DragonFly+ |

### RDMA Concepts

**Remote Direct Memory Access (RDMA)**: Allows direct memory-to-memory data transfer between networked machines without involving the operating system kernel on either side.

Key operations:
- **RDMA Read**: Initiator reads from remote memory
- **RDMA Write**: Initiator writes to remote memory
- **RDMA Send/Receive**: Message-based operations
- **Atomic operations**: Compare-and-swap, fetch-and-add across network

Benefits:
- **Zero-copy**: Data moves directly between application buffers
- **Kernel bypass**: No OS involvement after connection setup
- **CPU offload**: NIC handles data transfer independently
- Latency: **3-5 microseconds** (InfiniBand) vs 20-80 us (standard Ethernet)

*Sources: [HPE Slingshot](https://buy.hpe.com/us/en/options/enterprise-networking-products/switches/hpe-slingshot/p/1012904596), [Slingshot Analysis Paper](http://ww.w.unixer.de/publications/img/sensi-slingshot.pdf), [NVIDIA NDR Architecture](https://applieddatasystems.com/wp-content/uploads/2020/11/br-ndr-architecture-brochure.pdf)*

---

## 8. AMD EPYC Chiplet Architecture

### Chiplet Design Philosophy

AMD EPYC pioneered the **chiplet** approach for server processors, breaking a monolithic die into smaller, modular dies:

- **CCD (Core Complex Die)**: Contains CPU cores and L3 cache
- **IOD (I/O Die)**: Central hub for memory controllers, PCIe, and inter-socket links

### EPYC Genoa (4th Gen, Zen 4) Chiplet Layout

| Component | Specification |
|-----------|--------------|
| **CCDs** | Up to 12 per socket |
| **Cores per CCD** | 8 (2 CCXs x 4 cores each) |
| **Max cores** | 96 per socket (12 x 8) |
| **Max threads** | 192 (SMT-2) |
| **L3 cache per CCD** | 32 MB (shared across 8 cores) |
| **L2 cache per core** | 1 MB |
| **Total L3** | Up to 384 MB |
| **CCD process** | TSMC 5nm |
| **IOD process** | TSMC 6nm |
| **Memory** | 12 channels DDR5 |
| **PCIe** | 128 lanes PCIe Gen5 |
| **CXL** | CXL 1.1+ support |

### Infinity Fabric Interconnect

- **Role**: Connects CCDs to IOD and IOD to IOD (multi-socket)
- **GMI (Global Memory Interconnect)**: Dedicated high-speed link per CCD to IOD
- **xGMI**: Cross-socket Infinity Fabric links
- **Bandwidth**: ~32 GB/s per GMI link (read), scales with frequency
- **NUMA**: Each CCD's GMI path to the IOD determines memory access latency

### NUMA (Non-Uniform Memory Access) Implications

```
CCD 0 ──GMI──┐                    ┌──GMI── CCD 6
CCD 1 ──GMI──┤                    ├──GMI── CCD 7
CCD 2 ──GMI──┤     ┌────────┐    ├──GMI── CCD 8
CCD 3 ──GMI──┼─────┤  IOD   ├────┼──GMI── CCD 9
CCD 4 ──GMI──┤     │(6nm)   │    ├──GMI── CCD 10
CCD 5 ──GMI──┘     └────────┘    └──GMI── CCD 11
                  │  │  │  │
             DDR5 ch 0-11 + PCIe
```

**NUMA configurations (NPS = NUMA nodes Per Socket)**:
- **NPS1**: Entire socket = 1 NUMA node (uniform but higher average latency)
- **NPS2**: Socket split into 2 NUMA nodes (6 CCDs + 6 channels each)
- **NPS4**: Socket split into 4 NUMA nodes (3 CCDs + 3 channels each)

Optimal NPS setting depends on workload memory access patterns.

### Chiplet Yield and Cost Advantages

Using AMD's defect density model:
- **4 smaller dies cost less than 60% of one large equivalent die**
- Yield $Y$ for a die of area $A$ with defect density $D$:

$$Y = \left(1 + \frac{A \cdot D}{\alpha}\right)^{-\alpha}$$

(negative binomial model, where $\alpha$ is clustering parameter)

- A small 8-core CCD at 5nm (~70 mm^2) has much higher yield than a hypothetical monolithic 96-core die (~700 mm^2)
- **Design flexibility**: CCDs and IOD can be on different process nodes, different design cadences
- **SKU flexibility**: Disable defective CCDs to create lower-core-count SKUs (zero waste)

### Evolution

| Gen | Codename | CCD Process | Cores/CCD | Max CCDs | Max Cores |
|-----|----------|-------------|-----------|----------|-----------|
| 1st | Naples (Zen 1) | 14nm GloFo | 8 | 4 | 32 |
| 2nd | Rome (Zen 2) | 7nm TSMC | 8 | 8 | 64 |
| 3rd | Milan (Zen 3) | 7nm TSMC | 8 | 8 | 64 |
| 4th | Genoa (Zen 4) | 5nm TSMC | 8 | 12 | 96 |
| 5th | Turin (Zen 5) | 3/4nm TSMC | 16 | 16 | 192+ |

*Sources: [Tom's Hardware EPYC Genoa Review](https://www.tomshardware.com/reviews/amd-4th-gen-epyc-genoa-9654-9554-and-9374f-review-96-cores-zen-4-and-5nm-disrupt-the-data-center), [AMD Chiplets at ISSCC](https://ieeexplore.ieee.org/document/9063103/), [AMD on Why Chiplets](https://www.nextplatform.com/2021/06/09/amd-on-why-chiplets-and-why-now/)*

---

## 9. Apple M-Series Unified Memory Architecture

### Unified Memory Design

Apple Silicon (M1-M4) uses a **Unified Memory Architecture (UMA)** where CPU, GPU, and Neural Engine share a single pool of high-bandwidth LPDDR memory with **zero-copy access**.

```
                ┌──────────────────────────────────────────┐
                │          Unified Memory (LPDDR5)          │
                │        (Shared Address Space)             │
                └─┬──────┬──────┬──────┬──────┬──────┬────┘
                  │      │      │      │      │      │
               CPU    GPU   Neural  Media   ISP   Fabric
              Cores  Cores  Engine  Engine
```

### Specifications by Chip

| Chip | Memory BW | Max Capacity | CPU Cores | GPU Cores | Neural Engine |
|------|-----------|-------------|-----------|-----------|---------------|
| **M3** | 100 GB/s | 24 GB | 8 | 10 | 16-core |
| **M3 Pro** | 150 GB/s | 36 GB | 12 | 18 | 16-core |
| **M3 Max** | 400 GB/s | 128 GB | 16 | 40 | 16-core |
| **M3 Ultra** | 800 GB/s | 192 GB | 32 | 80 | 32-core |
| **M4** | 120 GB/s | 32 GB | 10 | 10 | 16-core, 38 TOPS |
| **M4 Pro** | 273 GB/s | 48 GB | 14 | 20 | 16-core, 38 TOPS |
| **M4 Max** | 546 GB/s | 128 GB | 16 | 40 | 16-core, 38 TOPS |

M3 uses LPDDR5 at 6,400 MT/s. M3 Max has 32 memory controllers, each 16-bits wide.

M4 Neural Engine: **38 TOPS** (trillion operations per second), 3x faster than M1.

### Advantages of Unified Memory

1. **Zero-copy transfers**: CPU, GPU, and Neural Engine access the same physical memory. No PCIe DMA transfers needed. A tensor computed by the CPU is immediately available to the GPU.

2. **Reduced memory footprint**: No data duplication between CPU and GPU memory pools. On a discrete GPU system, a 10 GB model requires 10 GB system RAM + 10 GB VRAM. On Apple Silicon, it requires just 10 GB total.

3. **Large memory for ML**: M3 Max/Ultra supports up to 128-192 GB unified memory accessible by the GPU. This exceeds the VRAM of most consumer GPUs (NVIDIA RTX 4090 = 24 GB).

4. **Energy efficiency**: No PCIe or memory controller duplication. Single memory subsystem serves all compute units.

### Limitations

- **Bandwidth**: M4 Max at 546 GB/s is fast for consumer, but NVIDIA H100 has 3.35 TB/s HBM bandwidth (6x more)
- **Compute**: M4 Max GPU (~40 cores) is vastly outmatched by discrete GPUs for raw throughput
- **No CUDA**: Metal compute shaders only; limited ML framework support compared to CUDA ecosystem

*Sources: [Apple M4 Wikipedia](https://en.wikipedia.org/wiki/Apple_M4), [Apple M3 Newsroom](https://www.apple.com/newsroom/2023/10/apple-unveils-m3-m3-pro-and-m3-max-the-most-advanced-chips-for-a-personal-computer/), [Apple M4 Pro/Max Announcement](https://www.apple.com/newsroom/2024/10/apple-introduces-m4-pro-and-m4-max/)*

---

## 10. Monte Carlo Methods on GPU for Finance

### Black-Scholes Monte Carlo on GPU

The Black-Scholes model for a European call option price:

$$C = S_0 \cdot N(d_1) - K \cdot e^{-rT} \cdot N(d_2)$$

where:

$$d_1 = \frac{\ln(S_0/K) + (r + \sigma^2/2)T}{\sigma\sqrt{T}}, \quad d_2 = d_1 - \sigma\sqrt{T}$$

For **Monte Carlo pricing**, we simulate paths of the underlying:

$$S_T = S_0 \cdot \exp\left[\left(r - \frac{\sigma^2}{2}\right)T + \sigma\sqrt{T} \cdot Z\right]$$

where $Z \sim \mathcal{N}(0,1)$, then compute the discounted payoff average:

$$C \approx e^{-rT} \cdot \frac{1}{N} \sum_{i=1}^{N} \max(S_T^{(i)} - K, 0)$$

### GPU Parallelization

Monte Carlo is **embarrassingly parallel**: each path simulation is independent.

- Each GPU thread generates its own random $Z$ and simulates one path
- Reduction kernel computes the mean payoff
- GPU can launch **millions of threads** simultaneously

### Performance Numbers from Published Work

| Platform | Paths | Steps | Time | Speedup over CPU |
|----------|-------|-------|------|-------------------|
| NVIDIA V100 | 8.192M | 365 | 26.6 ms | ~100x |
| NVIDIA K80 | 1M | 252 | 160 ms | 45x vs CPU (7.3s) |
| NVIDIA GPU (general) | 10M+ | 252 | ~50 ms | 100-1000x |

GPU speedups of **100-1000x** over single-threaded CPU are typical for Monte Carlo option pricing, depending on model complexity and path count.

### cuRAND — GPU Random Number Generation

NVIDIA cuRAND provides device-side random number generation, eliminating CPU-to-GPU transfer of random numbers.

**Available generators**:

| Generator | Type | State Size | Period | Best For |
|-----------|------|-----------|--------|----------|
| **XORWOW** | Pseudorandom | Small | $2^{192}$ | General use, default |
| **Philox4x32-10** | Counter-based | Minimal (key only) | $2^{128}$ | Massively parallel (no state transfer) |
| **MRG32k3a** | Combined MRG | Medium | $2^{191}$ | High quality |
| **MTGP32** | Mersenne Twister | Large (~20 KB) | $2^{11213}-1$ | Statistical quality |
| **MT19937** | Mersenne Twister | Large (624 words) | $2^{19937}-1$ | Highest quality |
| **Sobol** | Quasi-random | N/A | N/A | Variance reduction |

**Philox** is preferred for GPU Monte Carlo because:
- Counter-based: no state to store/load from global memory
- Keys derived from thread ID: each thread independently produces unique sequence
- Excellent statistical quality for financial applications

### Variance Reduction Techniques

#### Antithetic Variates

For each random $Z_i$, also use $-Z_i$:

$$\hat{C} = e^{-rT} \cdot \frac{1}{2N} \sum_{i=1}^{N} \left[\max(S_T(Z_i) - K, 0) + \max(S_T(-Z_i) - K, 0)\right]$$

- Reduces variance by exploiting negative correlation between paired paths
- Essentially free: generating $-Z$ costs nothing
- Typical variance reduction: **30-50%**

#### Control Variates

Use a correlated variable with known expectation as control:

$$\hat{C}_{CV} = \hat{C} - \beta \cdot (\hat{X} - E[X])$$

where $X$ is the control variate (e.g., the geometric average price option with known closed-form solution).

- Optimal $\beta = \text{Cov}(C, X) / \text{Var}(X)$
- Variance reduction: **80-95%** for well-chosen controls

#### Stratified Sampling

Divide $[0,1]$ into $N$ strata, sample one point per stratum:
- Ensures coverage of the entire distribution
- Variance reduction: proportional to $1/N^2$ vs $1/N$ for crude Monte Carlo

*Sources: [NVIDIA GPU Gems 2, Ch. 45](https://developer.nvidia.com/gpugems/gpugems2/part-vi-simulation-and-numerical-algorithms/chapter-45-options-pricing-gpu), [NVIDIA Blog: Exotic Option Pricing](https://developer.nvidia.com/blog/accelerating-python-for-exotic-option-pricing/), [QuantStart Monte Carlo in CUDA](https://www.quantstart.com/articles/Monte-Carlo-Simulations-In-CUDA-Barrier-Option-Pricing/)*

---

## 11. Black-Scholes Hardware Implementation

### FPGA Implementations

FPGAs implement the Black-Scholes equation directly in hardware pipelines for deterministic, ultra-low-latency pricing.

#### Fixed-Point vs. Floating-Point Trade-offs

| Aspect | Fixed-Point | Floating-Point |
|--------|-------------|----------------|
| **Resource usage** | Lower (simpler logic) | Higher (IEEE 754 units) |
| **Latency** | Lower (fewer pipeline stages) | Higher |
| **Precision** | Application-dependent | IEEE 754 compliant |
| **Design effort** | Higher (manual scaling) | Lower (use vendor IP) |
| **Accuracy** | Sufficient for pricing (< 0.01% error) | Full precision |

#### Required Computational Blocks

A full Black-Scholes FPGA implementation requires:
- 3 dividers
- 1 square root
- 1 logarithm (ln)
- 22 multipliers
- 1 exponential (exp)
- IEEE double-precision floating-point adder, multiplier, and comparison units

#### Published Performance Numbers

| Metric | Value | Source |
|--------|-------|-------|
| **Throughput** | 180 million transactions/second | Intel Stratix V |
| **Initial latency** | 208 clock cycles | Intel FPGA IP |
| **Clock frequency** | 179 MHz | Altera Stratix V |
| **Logic elements** | 68,148 LEs | Stratix V implementation |
| **Memory bits** | 27,705 | On-chip RAM |
| **DSP blocks** | 261 | Multiplier/accumulator |
| **Network latency** | 1 us end-to-end (10 Gbps Ethernet) | HFT FPGA library |
| **Speedup vs CPU** | 5x to 5,400x | Various studies |

The wide speedup range (5-5400x) depends on:
- FPGA device generation
- CPU baseline (single core vs multi-core)
- Pricing model complexity
- Precision requirements
- Whether parallelism (multiple instances) is exploited

#### FPGA Advantages for HFT

1. **Deterministic latency**: Fixed pipeline depth = constant latency (no cache misses, no branch mispredictions)
2. **Parallelism**: Instantiate multiple Black-Scholes pipelines on one FPGA
3. **Integration**: Combine pricing engine with network I/O on same FPGA (NIC + compute)
4. **Power**: 10-50W vs 300W+ for GPU

*Sources: [ACCU: Black-Scholes in Hardware](https://accu.org/journals/overload/20/110/wang_1906/), [Intel FPGA Black-Scholes IP](https://www.intel.com/content/www/us/en/docs/programmable/683337/23-1/black-scholes-floating-point.html), [Velvetech FPGA in HFT](https://velvetech.com/blog/fpga-in-high-frequency-trading/)*

---

## 12. DPDK and Kernel Bypass

### Why Kernel Bypass?

The standard Linux kernel networking stack introduces latency at every layer:

```
Application                    Application
    │                              │
    ▼                              ▼
 Socket API                   DPDK / User-space NIC driver
    │                              │
    ▼                              ▼
 TCP/IP Stack                  (nothing — direct HW access)
    │                              │
    ▼                              ▼
 Device Driver                 NIC Hardware
    │                              │
    ▼                              ▼
 NIC Hardware                  Wire
    │
    ▼
  Wire

 KERNEL PATH (~10-50 us)      BYPASS PATH (~1-5 us)
```

The kernel path involves: system call overhead, context switches, interrupt handling, socket buffer copies, protocol processing, and scheduler preemption.

### DPDK (Data Plane Development Kit)

**Core components**:

1. **Poll Mode Drivers (PMDs)**: Continuously poll NIC receive queues in a busy loop. No interrupts. No context switches. No sleeping.

2. **Huge Pages**: Map NIC memory into application address space using 2 MB or 1 GB huge pages instead of 4 KB pages.
   - **TLB miss reduction**: 99% fewer TLB misses
   - Address translation: nanoseconds instead of microseconds
   - Pre-allocated at boot, pinned in physical memory

3. **Core Pinning**: Dedicate specific CPU cores to DPDK threads. These cores do nothing but poll and process packets.

4. **Memory Pools (mempools)**: Pre-allocated, lock-free buffer pools for zero-allocation packet processing.

5. **Ring Buffers**: Lock-free SPSC/MPMC ring queues for inter-core communication.

### Performance Characteristics

| Metric | Kernel Stack | DPDK |
|--------|-------------|------|
| **Latency** | 10-50 us | 1-5 us |
| **Throughput** | ~1 Mpps | 10-100+ Mpps |
| **Jitter** | 10-100 us | < 1 us |
| **CPU usage** | Low (interrupt-driven) | 100% on dedicated cores |
| **Line rate** | Difficult at 10 Gbps | Line-rate at 10-100 Gbps |

### Solarflare / Xilinx OpenOnload

**OpenOnload** is a user-space network stack for Solarflare (now AMD/Xilinx) NICs:

- Intercepts socket API calls via **LD_PRELOAD** library injection
- Implements TCP/IP stack in user space (no kernel involvement)
- Uses **ef_vi** library for low-level NIC access
- **Application-transparent**: No code changes needed (just set LD_PRELOAD)
- Achieves kernel bypass while maintaining standard socket API compatibility

**Advantages over DPDK**:
- Drop-in replacement (no application rewrite)
- Supports standard TCP/UDP sockets
- Easier deployment

**Disadvantages vs DPDK**:
- Vendor-locked to Solarflare/Xilinx NICs
- Slightly higher latency than raw DPDK
- Less control over packet processing pipeline

### Other Kernel Bypass Technologies

- **io_uring**: Linux async I/O, not full bypass but reduces syscall overhead
- **XDP (eXpress Data Path)**: eBPF programs at NIC driver level, partial bypass
- **RDMA (InfiniBand/RoCE)**: Full kernel bypass for RDMA operations
- **Netmap**: BSD/Linux kernel bypass framework

*Sources: [QuantVPS Kernel Bypass in HFT](https://www.quantvps.com/blog/kernel-bypass-in-hft), [Substack HFT Architecture](https://systemdr.substack.com/p/high-frequency-trading-architecture), [Cloudflare Kernel Bypass](https://blog.cloudflare.com/kernel-bypass/), [Databento Kernel Bypass Guide](https://databento.com/microstructure/kernel-bypass)*

---

## 13. CPU Isolation for Trading

### Linux Kernel Parameters

#### isolcpus

```bash
# Kernel command line
isolcpus=4-15    # Isolate cores 4-15 from scheduler
```

- Removes specified CPUs from the general scheduler's load balancing
- No kernel threads or user processes will be scheduled on isolated cores by default
- Application threads must be explicitly pinned to isolated cores via `taskset` or `sched_setaffinity()`

#### nohz_full (Tickless Kernel)

```bash
# Kernel command line
nohz_full=4-15
```

- Disables the periodic timer tick (usually 250 Hz or 1000 Hz) on specified cores
- Timer tick causes **4 us interruption every 1-4 ms** — unacceptable for low-latency
- Only works when a single runnable thread is on the core
- Requires `rcu_nocbs` on the same cores

#### rcu_nocbs (RCU Callback Offloading)

```bash
# Kernel command line
rcu_nocbs=4-15
```

- **RCU (Read-Copy-Update)**: Kernel synchronization mechanism that defers memory reclamation
- RCU callbacks introduce **unpredictable latency spikes** (10-100 us)
- `rcu_nocbs` offloads these callbacks to housekeeping CPUs
- Critical for eliminating jitter on isolated cores

#### irqaffinity

```bash
# Kernel command line
irqaffinity=0-3    # Direct all IRQs to cores 0-3 only
```

- By default, interrupts are distributed across all CPUs
- Each interrupt causes a context switch and cache pollution
- Direct all interrupts to housekeeping cores, away from trading cores
- `irqbalance` daemon respects `isolcpus` and `irqaffinity` settings

### Complete Isolation Recipe

```bash
# /etc/default/grub — GRUB_CMDLINE_LINUX
isolcpus=4-15 nohz_full=4-15 rcu_nocbs=4-15 irqaffinity=0-3 \
  nosoftlockup tsc=reliable clocksource=tsc \
  processor.max_cstate=0 intel_idle.max_cstate=0 idle=poll \
  transparent_hugepage=never
```

Key additions:
- `processor.max_cstate=0` / `intel_idle.max_cstate=0`: Disable CPU sleep states (C-states). Wake-up from C1 takes ~1 us; C6 takes ~100 us.
- `idle=poll`: CPU never enters idle state (busy-waits instead). Wastes power but eliminates wake-up latency.
- `tsc=reliable`: Trust the TSC (Time Stamp Counter) for timekeeping; avoid fallback to slower clocksources.
- `transparent_hugepage=never`: Disable THP to prevent compaction latency spikes.

### NUMA-Aware Memory Allocation

```c
// Pin thread to core 8 (NUMA node 1)
cpu_set_t cpuset;
CPU_ZERO(&cpuset);
CPU_SET(8, &cpuset);
sched_setaffinity(0, sizeof(cpuset), &cpuset);

// Allocate memory on NUMA node 1
void *buf = numa_alloc_onnode(size, 1);

// Or use mbind() for finer control
mbind(buf, size, MPOL_BIND, &nodemask, maxnode, 0);
```

- **Local memory access**: ~80 ns latency
- **Remote memory access** (cross-NUMA): ~140 ns latency (75% slower)
- Misaligned NUMA allocation can add **50-100 ns** per memory access
- Use `numactl --membind=N` for process-level NUMA binding

### Measured Latency Impact

| Configuration | Typical Jitter | Worst-case Latency |
|---------------|---------------|-------------------|
| Default kernel | 10-100 us | >1 ms |
| isolcpus only | 5-20 us | 100 us |
| isolcpus + nohz_full + rcu_nocbs | 1-5 us | 10 us |
| Full isolation + NUMA + core pinning | 100-500 ns | 1-5 us |
| With PREEMPT_RT kernel | 50-200 ns | 1 us |

These numbers are from real-world low-latency tuning guides and trading system benchmarks.

### Interrupt Coalescing — Why It Matters

NICs batch interrupts by default (interrupt coalescing):
- Without coalescing: 1 interrupt per packet = high CPU overhead at high packet rates
- With coalescing: Batch N packets per interrupt = lower CPU overhead but **added latency**
- **For trading**: Disable coalescing (`ethtool -C eth0 rx-usecs 0 rx-frames 1`) to minimize latency
- Alternative: Use DPDK poll-mode drivers to avoid interrupts entirely

*Sources: [Erik Rigtorp Low Latency Guide](https://rigtorp.se/low-latency-guide/), [Ubuntu Real-Time Kernel Tuning](https://ubuntu.com/blog/real-time-kernel-tuning), [SUSE CPU Isolation](https://www.suse.com/c/cpu-isolation-nohz_full-part-3/)*

---

## 14. Overclocking

### Voltage-Frequency (V-F) Curve Relationship

The fundamental relationship between voltage and frequency in CMOS:

$$f_{max} \propto \frac{(V_{dd} - V_{th})^2}{V_{dd}}$$

where $V_{dd}$ is supply voltage and $V_{th}$ is threshold voltage. Simplified: **higher voltage enables higher frequency** because faster transistor switching.

### Power Consumption Equations

**Dynamic power** (switching):

$$P_{dynamic} = \alpha \cdot C \cdot V_{dd}^2 \cdot f$$

where:
- $\alpha$ = switching activity factor (0 to 1)
- $C$ = total load capacitance
- $V_{dd}$ = supply voltage
- $f$ = clock frequency

**Static power** (leakage):

$$P_{static} \propto V_{dd} \cdot I_{leak}$$

where leakage current $I_{leak}$ increases exponentially with temperature.

**Total power**:

$$P_{total} = \alpha C V_{dd}^2 f + V_{dd} \cdot I_{leak}$$

**Key insight**: Because $V$ and $f$ are coupled (higher $f$ requires higher $V$), the effective scaling is approximately **cubic**:

$$P \propto V^2 \cdot f \propto V^3 \quad (\text{since } f \propto V)$$

A 10% frequency increase typically requires ~5% voltage increase, resulting in ~15-20% power increase.

### Thermal Design Power (TDP)

- TDP = maximum sustained power the cooling solution must dissipate
- Overclocked processors can exceed **2x their rated TDP**
- Example: Intel i9-14900K has 253W TDP but can draw 350W+ when overclocked

### Silicon Lottery

**No two chips are identical** due to manufacturing variation:

- Transistor threshold voltage ($V_{th}$) varies across the die and between dies
- Line width variation affects capacitance and resistance
- Defect density varies by wafer position

**Practical impact**:
- One i9-14900K may reach 5.8 GHz at 1.30V
- An identical SKU might require 1.35V for the same frequency
- Top 5% of chips ("golden samples") clock 5-10% higher at same voltage
- Bottom 10% may not reach advertised boost frequencies reliably

### Voltage Safety Limits

| Platform | Max Safe Daily Voltage | Notes |
|----------|----------------------|-------|
| Intel (14th Gen) | 1.40V | Degradation above 1.45V |
| AMD (Zen 4) | 1.35V | Use Curve Optimizer instead |
| DDR5 | 1.40V (from 1.10V default) | With adequate cooling |

### AMD Curve Optimizer

AMD's modern approach to overclocking:
- **PBO (Precision Boost Overdrive)**: Allows the CPU to boost beyond rated limits
- **Curve Optimizer**: Adjusts the V-F curve **per core** by applying voltage offsets
- Negative offset = lower voltage for same frequency = lower power + higher boost headroom
- Typical gain: 50-200 MHz additional boost frequency, 5-15% lower power

### Liquid Cooling for Trading Servers

Trading firms use custom liquid cooling not for overclocking headroom but for:

1. **Thermal consistency**: Stable temperatures prevent thermal throttling and frequency variation
2. **Acoustic requirements**: Data center noise regulations
3. **Density**: Liquid cooling enables higher rack density
4. **Typical frequency gains**: 100-300 MHz additional stable frequency
5. **Stability**: More consistent latency (no thermal-induced frequency fluctuation)

Common setups:
- Direct-to-chip liquid cooling (cold plates on CPU/GPU)
- Rear-door heat exchangers
- Immersion cooling (3M Novec fluid)

### Overclocking Risks

| Risk | Mechanism |
|------|-----------|
| **Electromigration** | Higher current density displaces metal atoms in interconnects |
| **Hot Carrier Injection** | Energetic carriers damage gate oxide |
| **NBTI/PBTI** | Threshold voltage shifts under sustained bias stress |
| **Thermal runaway** | Leakage increases with temperature, which increases temperature... |
| **Reduced lifespan** | All degradation mechanisms accelerate with voltage and temperature |

Rule of thumb: Every 10C temperature increase roughly **doubles** the degradation rate.

### Dennard Scaling (Historical Context)

Dennard scaling (1974) predicted that as transistors shrink:
- Voltage scales down proportionally to dimension
- Current scales down proportionally
- Power density remains constant

**Dennard scaling broke down around 2006** because:
- Voltage could not scale below ~0.7V (threshold voltage limit)
- Leakage current increases exponentially at small geometries
- Result: "power wall" limiting frequency scaling, driving the shift to multi-core

*Sources: [Dennard Scaling Wikipedia](https://en.wikipedia.org/wiki/Dennard_scaling), [ScienceDirect Dynamic Power](https://www.sciencedirect.com/topics/computer-science/dynamic-power-consumption), [Valley AI Overclocking Guide 2026](https://valleyai.net/computer/cpu-overclocking/), [AMD PBO Guide](https://hdopti.com/articles/amd-pbo-curve-optimizer-guide)*

---

## Appendix: Key Equations Reference

### Power and Performance

| Equation | Description |
|----------|-------------|
| $P_{dyn} = \alpha C V^2 f$ | Dynamic power consumption |
| $P_{static} = V \cdot I_{leak}$ | Static (leakage) power |
| $f_{max} \propto (V - V_{th})^2 / V$ | Max frequency vs voltage |
| $E = P \cdot t = \alpha C V^2$ per op | Energy per operation |

### Network Performance

| Equation | Description |
|----------|-------------|
| $B_{fat-tree} = (k^3/4) \cdot b$ | Fat tree bisection BW (k-port switches, link BW b) |
| $B_{torus} = 2k^{n-1} \cdot b$ | k-ary n-dim torus bisection BW |
| $a = 2p = 2h$ | Dragonfly balanced configuration |
| $N = p \cdot a \cdot g$ | Dragonfly total endpoints |

### MPI Cost Models

| Equation | Description |
|----------|-------------|
| $T_{rec\_dbl} = \log_2 P \cdot \alpha + \log_2 P \cdot n \cdot \beta$ | Recursive doubling allreduce |
| $T_{ring} = 2(P-1)\alpha + 2\frac{P-1}{P} n\beta$ | Ring allreduce |
| $T_{Rabenseifner} = 2\log_2 P \cdot \alpha + 2\frac{P-1}{P} n\beta$ | Rabenseifner allreduce |
| $T_{bcast\_binom} = \log_2 P (\alpha + n\beta)$ | Binomial tree broadcast |

### Financial Mathematics

| Equation | Description |
|----------|-------------|
| $C = S_0 N(d_1) - Ke^{-rT}N(d_2)$ | Black-Scholes call price |
| $S_T = S_0 \exp[(r-\sigma^2/2)T + \sigma\sqrt{T}Z]$ | GBM terminal price |
| $\hat{C} = e^{-rT}\frac{1}{N}\sum \max(S_T^{(i)}-K, 0)$ | MC estimator |

---

*Research compiled using web search results from TOP500.org, ORNL, LLNL, ALCF, Google Cloud documentation, Cerebras publications, NVIDIA documentation, IEEE Xplore, ACM Digital Library, and various HPC research papers. All specifications verified against primary sources where possible. Data current as of November 2025 TOP500 list and manufacturer publications through Q1 2026.*
