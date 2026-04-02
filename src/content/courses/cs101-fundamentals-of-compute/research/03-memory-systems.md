# Research Notes: Memory Systems, Caches, and Storage

> Research compiled for CS 101: Fundamentals of Compute -- Week 3 lecture material.
> Last updated: 2026-03-31

---

## 1. DDR5 Specification

### 1.1 Channel Architecture

DDR5 introduces a fundamentally different channel architecture from DDR4. Each DDR5 DIMM contains **two independent 32-bit sub-channels**, each with its own command/address (CA) bus. This replaces the single 64-bit channel of DDR4.

- Non-ECC: 2 x 32 data bits = 64 total data lines
- ECC (RDIMM): 2 x 40 data bits = 80 total data lines (8 ECC bits per sub-channel)
- Burst length: BL16 (doubled from DDR4's BL8), delivering 64 bytes per burst per sub-channel
- Voltage: 1.1V nominal (down from DDR4's 1.2V)
- PMIC (Power Management IC): On-module voltage regulation, a first for DDR

Each sub-channel operates independently, enabling finer-grained memory access and improved efficiency for workloads with smaller access patterns.

**Source:** [JEDEC DDR5 Standard (JESD79-5)](https://www.jedec.org/standards-documents/docs/jesd79-5d); [Kingston DDR5 Overview](https://www.kingston.com/en/blog/pc-performance/ddr5-overview)

### 1.2 On-Die ECC

All DDR5 chips include **on-die error-correction code (ECC)**, regardless of whether the module is marketed as "ECC" or "non-ECC." This is a JEDEC-mandated feature.

- Operates at the chip level before data leaves the DRAM die
- Corrects single-bit errors within each chip internally
- Distinct from system-level ECC (which adds extra chips on the DIMM for host-side correction)
- Motivation: Higher density per die at advanced process nodes increases soft error rates; on-die ECC maintains acceptable reliability

**Source:** [Wikipedia: DDR5 SDRAM](https://en.wikipedia.org/wiki/DDR5_SDRAM)

### 1.3 Speed Grades and Bandwidth

JEDEC has defined DDR5 speed grades from DDR5-4800 through DDR5-8800. The bandwidth formula per module is:

$$BW = \frac{\text{Transfer Rate (MT/s)} \times \text{Bus Width (bits)}}{8}$$

For a single DDR5 module with 64-bit total bus (two 32-bit sub-channels):

| Speed Grade | Transfer Rate (MT/s) | Clock (MHz) | BW/module (GB/s) | Typical CL | Approx. Latency (ns) |
|-------------|---------------------|-------------|-------------------|------------|----------------------|
| DDR5-4800   | 4800                | 2400        | 38.4              | 40         | ~16.7                |
| DDR5-5200   | 5200                | 2600        | 41.6              | 38         | ~14.6                |
| DDR5-5600   | 5600                | 2800        | 44.8              | 36-38      | ~12.9-13.6           |
| DDR5-6000   | 6000                | 3000        | 48.0              | 36         | ~12.0                |
| DDR5-6400   | 6400                | 3200        | 51.2              | 32-38      | ~10.0-11.9           |
| DDR5-7200   | 7200                | 3600        | 57.6              | 34-36      | ~9.4-10.0            |
| DDR5-8000   | 8000                | 4000        | 64.0              | 38-40      | ~9.5-10.0            |
| DDR5-8400   | 8400                | 4200        | 67.2              | 40         | ~9.5                 |
| DDR5-8800   | 8800                | 4400        | 70.4              | 62 (JEDEC) | ~14.1                |

First-word latency in nanoseconds:

$$t_{CL} (\text{ns}) = \frac{CL}{\text{Clock (MHz)}} \times 1000$$

Note: Despite rising CL numbers at higher speeds, real-time latency (in nanoseconds) remains roughly comparable because faster clock cycles offset the higher cycle count.

### 1.4 Timing Parameters

The four primary timing parameters define DRAM access latency:

| Parameter | Full Name | Description |
|-----------|-----------|-------------|
| **CL** (tCAS) | CAS Latency | Cycles between column address strobe and data availability |
| **tRCD** | Row-to-Column Delay | Cycles to activate a row and access a column within it |
| **tRP** | Row Precharge Time | Cycles to close (precharge) an open row before opening a new one |
| **tRAS** | Row Active Time | Minimum cycles a row must remain open; generally $tRAS \geq tRCD + CL$ |

For DDR5-4800 JEDEC baseline: CL-tRCD-tRP-tRAS = **40-40-40-77**

Typical optimized DDR5-6400: CL-tRCD-tRP-tRAS = **32-38-38-76**

Additional sub-timings relevant to DDR5:
- **tRFC** (Refresh Cycle Time): ~295-350 ns (longer than DDR4 due to higher densities)
- **tRRD_S / tRRD_L**: Row-to-row delay (same/different bank group)
- **tFAW**: Four-Activate Window

**Source:** [AnandTech DDR5 Sub-timings](https://www.anandtech.com/show/16143/insights-into-ddr5-subtimings-and-latencies); [AnandTech DDR5-8800 Extension](https://www.anandtech.com/show/21363/jedec-extends-ddr5-specification-to-8800-mts-adds-anti-rowhammer-features)

---

## 2. HBM3 / HBM3E Specifications

### 2.1 Architecture Overview

High Bandwidth Memory (HBM) uses a 3D-stacked DRAM architecture connected to the processor via a silicon interposer, achieving massive bandwidth through a very wide bus rather than high per-pin speeds.

**Key architectural features:**
- Multiple DRAM dies stacked vertically on a logic base die
- Connected through **Through-Silicon Vias (TSVs)** -- vertical electrical connections that pass through the silicon substrate
- Microbumps bond each layer (pitch ~25-40 um)
- The entire stack sits on a **silicon interposer** (typically 65nm process) alongside the compute die (GPU/accelerator)
- Interposer routes >1,700 signal traces with sub-10um precision

### 2.2 HBM3 Specifications (JEDEC JESD238, January 2022)

| Parameter | Value |
|-----------|-------|
| Data rate per pin | 6.4 Gbps |
| Interface width | 1024 bits (16 channels x 64 bits) |
| Bandwidth per stack | **819 GB/s** |
| Stack height | 4-hi, 8-hi, 12-hi, 16-hi |
| Capacity per stack | Up to 64 GB (16-hi) |
| Channels | 16 independent channels (doubled from HBM2e's 8 x 128-bit) |
| Package thickness | ~720 um (cube height limit for bump-based interconnect) |

Bandwidth calculation:

$$BW = \frac{6.4 \text{ Gbps} \times 1024 \text{ bits}}{8 \text{ bits/byte}} = 819.2 \text{ GB/s}$$

### 2.3 HBM3E Specifications (JEDEC, May 2023)

| Parameter | Value |
|-----------|-------|
| Data rate per pin | Up to 9.8 Gbps |
| Interface width | 1024 bits |
| Bandwidth per stack | **Up to 1.18-1.23 TB/s** |
| Stack height | 8-hi (24 GB), 12-hi (36 GB) |
| Key innovation | All-around power TSVs (6x increase in TSV count), reduced peripheral area |

Bandwidth calculation for HBM3E at 9.8 Gbps:

$$BW = \frac{9.8 \text{ Gbps} \times 1024 \text{ bits}}{8} = 1254.4 \text{ GB/s (theoretical max)}$$

SK Hynix began mass production of 12-layer HBM3E in September 2024, with 16-layer HBM3E announced in November 2024.

### 2.4 Products Using HBM3/HBM3E

| Product | Memory Type | Capacity | Bandwidth (aggregate) | Stacks |
|---------|-------------|----------|-----------------------|--------|
| NVIDIA H100 SXM | HBM3 | 80 GB | 3.35 TB/s | 5 stacks |
| NVIDIA H200 | HBM3E | 141 GB | 4.8 TB/s | 6 stacks |
| AMD MI300X | HBM3 | 192 GB | 5.3 TB/s | 8 stacks |
| AMD MI350 (announced) | HBM3E | 288 GB | 8 TB/s | -- |
| NVIDIA B200 | HBM3E | 192 GB | 8 TB/s | 8 stacks |

### 2.5 HBM4 (JEDEC, April 2025)

For forward reference: HBM4 doubles the interface to 2048 bits, supports up to 8 Gbps per pin, achieving up to 2 TB/s per stack, with 4-hi to 16-hi configurations and 24 Gb or 32 Gb die densities.

**Sources:** [JEDEC HBM3 Standard](https://www.jedec.org/news/pressreleases/jedec-publishes-hbm3-update-high-bandwidth-memory-hbm-standard); [Wevolver HBM3 Engineering Guide](https://www.wevolver.com/article/what-is-high-bandwidth-memory-3-hbm3-complete-engineering-guide-2025); [Samsung HBM3E Tech Blog](https://semiconductor.samsung.com/news-events/tech-blog/leading-memory-innovation-with-hbm3e/); [Synopsys HBM3 Overview](https://www.synopsys.com/glossary/what-is-high-bandwitdth-memory-3.html); [WCCFTech HBM3 JEDEC](https://wccftech.com/jedec-publishes-hbm3-high-bandwidth-memory-standard-819-gbps-bandwidth-16-hi-stacks-64-gb-capacities/); [Micron HBM3E](https://www.micron.com/products/memory/hbm/hbm3e)

---

## 3. SRAM 6T Cell Operation

### 3.1 Circuit Structure

The standard 6-transistor (6T) SRAM cell consists of:

- **Two cross-coupled CMOS inverters** (4 transistors: 2 PMOS pull-up, 2 NMOS pull-down) forming a bistable latch
- **Two access transistors** (NMOS) gated by the word line (WL), connecting the latch to the bit lines (BL, BL_bar)

```
        VDD          VDD
         |            |
        [P1]         [P2]       (PMOS pull-up transistors)
         |            |
    Q ---+--- Q_bar --+--- Q    (cross-coupled storage nodes)
         |            |
        [N1]         [N2]       (NMOS pull-down transistors)
         |            |
        GND          GND

    BL --[A1]-- Q    Q_bar --[A2]-- BL_bar
              |                |
              WL (gate)        WL (gate)
              (Access NMOS)    (Access NMOS)
```

The output of each inverter feeds the input of the other, creating a positive feedback loop that holds the cell in one of two stable states (Q=0, Q_bar=1 or Q=1, Q_bar=0).

### 3.2 Read Operation

1. Both bit lines (BL, BL_bar) are **precharged to VDD**
2. Word line (WL) is asserted, turning on access transistors A1 and A2
3. The stored values create a small differential voltage on the bit lines:
   - If Q=1: BL stays high, BL_bar is pulled slightly low by N2
   - If Q=0: BL is pulled slightly low by N1, BL_bar stays high
4. A **sense amplifier** detects and amplifies this differential (typically ~100mV)

**Read disturb risk:** During read, if Q=0, the access transistor and pull-down transistor form a voltage divider that can momentarily raise Q. If this rise exceeds the switching threshold, data is corrupted. The **cell ratio** (pull-down W/L to access W/L) must be >1 (typically 1.5-2) to prevent this.

### 3.3 Write Operation

1. The desired value is driven onto BL; its complement onto BL_bar
2. WL is asserted, connecting the bit lines to the cell
3. The bit line drivers overpower the cell's internal feedback, flipping the state
4. The **pull-up ratio** (access W/L to pull-up W/L) must be >1 to ensure the access transistor can overpower the PMOS pull-up

### 3.4 Static Noise Margin (SNM)

SNM quantifies the cell's ability to retain data in the presence of noise. It is measured by:

1. Plot the voltage transfer curves (VTC) of both inverters on the same axes (with one mirrored)
2. The **largest square** that fits inside the resulting "butterfly curve" has side length = SNM

$$SNM = \max(\text{side of largest inscribed square in butterfly diagram})$$

Typical values:
- Read SNM: 150-250 mV (at recent nodes, e.g., 7nm)
- Hold SNM: 250-350 mV (higher because access transistors are off)
- Write SNM: Measured differently; must be low enough to allow writes

SNM degrades with voltage scaling and process variation at smaller nodes, which is a key design challenge.

### 3.5 Access Time and Area

**Access time at current nodes:**

| Technology Node | SRAM Access Time | Notes |
|----------------|-----------------|-------|
| 7nm | ~0.4-0.5 ns | Sub-nanosecond |
| 5nm | ~0.3-0.4 ns | Used in Apple M2, AMD Zen 4 L1 |
| 3nm | ~0.2-0.3 ns | Used in Apple M3, latest designs |
| General range | 0.5-2.5 ns | Depending on array size and node |

**Area per bit comparison:**

| Memory Type | Transistors/bit | Cell Area (7nm) | Cell Area (3nm) | Relative Area |
|-------------|----------------|-----------------|-----------------|---------------|
| SRAM (6T) | 6 | 0.027 um^2 | 0.0199 um^2 | ~100-150x DRAM |
| DRAM (1T1C) | 1T + 1C | ~0.003 um^2 | -- | 1x (baseline) |

SRAM is approximately 100-150x larger per bit than DRAM, which is why SRAM is used only for small, fast caches while DRAM serves as main memory.

**SRAM vs DRAM key trade-offs:**
- SRAM: No refresh needed (static), faster (sub-ns vs 10-70ns), higher power during access, much larger per bit
- DRAM: Requires periodic refresh (every 32-64ms), higher density, lower cost per bit, destructive read (must be rewritten)

**Sources:** [TU Wien SRAM Cell](https://www.iue.tuwien.ac.at/phd/entner/node34.html); [Wikipedia: Static Random-Access Memory](https://en.wikipedia.org/wiki/Static_random-access_memory); [ScienceDirect: 6T SRAM Design and Analysis](https://www.sciencedirect.com/science/article/abs/pii/S2214785320336865); [TSMC 45nm SOI SRAM](https://research.tsmc.com/page/transistor-structure/6.html)

---

## 4. Cache Hierarchy -- Current CPU Specifications

### 4.1 Intel Raptor Lake / Raptor Cove (13th/14th Gen, 2022-2023)

**P-Cores (Raptor Cove):**

| Cache Level | Size | Associativity | Latency (cycles) | Latency (ns, ~5.5 GHz) | Line Size |
|------------|------|---------------|-------------------|------------------------|-----------|
| L1I | 32 KB | 8-way | ~4 | ~0.7 | 64B |
| L1D | 48 KB | 12-way | ~5 | ~0.9 | 64B |
| L2 | 2 MB | 16-way | ~15 | ~2.7 | 64B |
| L3 (shared) | 36 MB | 12-way | ~42-46 | ~7.6-8.4 | 64B |

**E-Cores (Gracemont):**

| Cache Level | Size | Latency (cycles) |
|------------|------|-------------------|
| L1I | 64 KB | ~4 |
| L1D | 32 KB | ~4 |
| L2 (shared/4 E-cores) | 4 MB | ~20 |
| L3 (shared with P-cores) | 36 MB | ~42-46 |

**Source:** [Chips and Cheese: Raptor Lake L2 Caches](https://chipsandcheese.com/2022/08/23/a-preview-of-raptor-lakes-improved-l2-caches/); [AnandTech: i9-13900K Review](https://www.anandtech.com/show/17601/intel-core-i9-13900k-and-i5-13600k-review/5)

### 4.2 AMD Zen 4 (Ryzen 7000, 2022)

| Cache Level | Size | Associativity | Latency (cycles) | Latency (ns, ~5.5 GHz) | Notes |
|------------|------|---------------|-------------------|------------------------|-------|
| L1I | 32 KB | 8-way | ~4 | ~0.7 | Per core |
| L1D | 32 KB | 8-way | ~4 | ~0.7 | Per core |
| L2 | 1 MB | 8-way | ~14 | ~2.7 | Per core (doubled from Zen 3's 512 KB) |
| L3 | 32 MB | 16-way | ~50 | ~10 | Per CCD, shared among 8 cores |

**V-Cache variants (e.g., 7800X3D, 9800X3D):**

| Cache Level | Size | Latency (cycles) | Notes |
|------------|------|-------------------|-------|
| L3 (with V-Cache) | 96 MB (32 + 64 MB 3D stacked) | ~54 (+4 cycles vs non-V-Cache) | ~1.6 ns additional penalty |

V-Cache uses TSMC's SoIC 3D stacking to bond a 64 MB SRAM chiplet on top of each CCD (Core Complex Die). Despite the small latency penalty, the 3x L3 capacity provides substantial hit-rate improvements for data-intensive workloads.

**Source:** [Chips and Cheese: Zen 4 Memory Subsystem](https://chipsandcheese.com/p/amds-zen-4-part-2-memory-subsystem-and-conclusion); [Guru3D: Zen 4 Cache Details](https://www.guru3d.com/news-story/amd-zen-4-die-cache-sizeslatencies-and-transistor-counts-detailed.html); [Chips and Cheese: 7950X3D V-Cache](https://chipsandcheese.com/2023/04/23/amds-7950x3d-zen-4-gets-vcache/)

### 4.3 Apple M3 (2023)

Apple's M-series uses a different cache topology than x86 processors, with a **System Level Cache (SLC)** instead of a traditional L3.

**Performance (P) Cores:**

| Cache Level | Size | Latency (cycles) | Latency (ns, ~4.05 GHz) | Notes |
|------------|------|-------------------|-------------------------|-------|
| L1I | 192 KB | ~3 | ~0.7 | Unusually large for an L1I |
| L1D | 128 KB | ~3 | ~0.7 | Also large compared to x86 |
| L2 | 16 MB | ~11-15 | ~2.7-3.7 | Shared per P-core cluster |

**Efficiency (E) Cores:**

| Cache Level | Size | Notes |
|------------|------|-------|
| L1I | 128 KB | Per core |
| L1D | 64 KB | Per core |
| L2 | 4 MB | Shared per E-core cluster |

**System Level Cache (SLC):**

| Parameter | Value |
|-----------|-------|
| Size (M3) | 8 MB |
| Size (M3 Pro) | 16-24 MB |
| Size (M3 Max) | 48-64 MB |
| Type | Exclusive (non-inclusive) last-level cache |
| Shared by | All CPU clusters, GPU, Neural Engine, media engines |
| Latency | ~18-23 cycles from P-core (~5-6 ns) |

The SLC is an **exclusive** cache, meaning data in the SLC is not duplicated in L1/L2. This maximizes effective cache capacity.

**Source:** [7-cpu.com: Apple M1 Measurements](https://www.7-cpu.com/cpu/Apple_M1.html); [MacRumors: M3 L2 and SLC Sizes](https://forums.macrumors.com/threads/m3-pro-max-l2-and-slc-sizes.2410275/); [RealWorldTech: M3 Max Cache Tests](https://www.realworldtech.com/forum/?threadid=216522&curpostid=216550); [Eclectic Light: Apple Silicon Memory](https://eclecticlight.co/2024/03/06/apple-silicon-memory-and-internal-storage/)

### 4.4 Comparative Summary

| | Intel Raptor Lake (P) | AMD Zen 4 | Apple M3 (P) |
|---|---|---|---|
| L1I | 32 KB / ~4 cyc | 32 KB / ~4 cyc | 192 KB / ~3 cyc |
| L1D | 48 KB / ~5 cyc | 32 KB / ~4 cyc | 128 KB / ~3 cyc |
| L2 | 2 MB / ~15 cyc | 1 MB / ~14 cyc | 16 MB / ~12 cyc |
| L3/SLC | 36 MB / ~44 cyc | 32 MB / ~50 cyc (96 MB w/ V-Cache) | 8-64 MB / ~20 cyc |
| DRAM | ~60-80 ns | ~60-80 ns | ~90-110 ns (unified LPDDR5) |

---

## 5. RISC-V Sv39/Sv48 Page Table Format

### 5.1 Overview

RISC-V defines several virtual memory schemes in the Privileged Architecture specification. The most commonly implemented are:

| Scheme | VA Bits | Levels | Page Sizes | Use Case |
|--------|---------|--------|------------|----------|
| **Sv39** | 39 | 3 | 4 KB, 2 MB, 1 GB | Most common for RV64 |
| **Sv48** | 48 | 4 | 4 KB, 2 MB, 1 GB, 512 GB | Large address spaces |
| Sv57 | 57 | 5 | 4 KB, 2 MB, 1 GB, 512 GB, 256 TB | Very large VA spaces |

### 5.2 Sv39 Virtual Address Breakdown

A 39-bit virtual address is divided as follows:

```
63        39 38      30 29      21 20      12 11        0
+----------+-----------+-----------+-----------+-----------+
|  Must be |  VPN[2]   |  VPN[1]   |  VPN[0]   |  Offset   |
| sign-ext | (9 bits)  | (9 bits)  | (9 bits)  | (12 bits) |
+----------+-----------+-----------+-----------+-----------+
```

- Bits 63-39: Must equal bit 38 (sign extension for canonical addresses)
- VPN[2] (bits 38-30): Index into the root page table (Level 2)
- VPN[1] (bits 29-21): Index into the Level 1 page table
- VPN[0] (bits 20-12): Index into the Level 0 page table
- Offset (bits 11-0): Byte offset within the 4 KB page

Each page table contains $2^9 = 512$ entries of 8 bytes each, fitting exactly in one 4 KB page.

**Page sizes in Sv39:**
- **4 KB pages**: Full 3-level walk (VPN[2] -> VPN[1] -> VPN[0])
- **2 MB megapages**: 2-level walk (VPN[2] -> VPN[1]), VPN[0] and offset combined = 21-bit offset
- **1 GB gigapages**: 1-level walk (VPN[2] only), VPN[1]+VPN[0]+offset combined = 30-bit offset

Megapages and gigapages must be aligned to their size boundary.

### 5.3 Sv48 Virtual Address Breakdown

Sv48 adds one additional level:

```
63        48 47      39 38      30 29      21 20      12 11        0
+----------+-----------+-----------+-----------+-----------+-----------+
|  Must be |  VPN[3]   |  VPN[2]   |  VPN[1]   |  VPN[0]   |  Offset   |
| sign-ext | (9 bits)  | (9 bits)  | (9 bits)  | (9 bits)  | (12 bits) |
+----------+-----------+-----------+-----------+-----------+-----------+
```

**Page sizes in Sv48:**
- 4 KB pages (4 levels)
- 2 MB megapages (3 levels)
- 1 GB gigapages (2 levels)
- **512 GB terapages** (1 level) -- unique to Sv48+

### 5.4 Page Table Entry (PTE) Format

Each PTE is 64 bits with the following layout:

```
63    54 53              10 9   8 7 6 5 4 3 2 1 0
+-------+------------------+-----+-+-+-+-+-+-+-+-+
|Reserved|     PPN          | RSW |D|A|G|U|X|W|R|V|
| (10)   |    (44 bits)     | (2) | | | | | | | | |
+-------+------------------+-----+-+-+-+-+-+-+-+-+
```

**Bit field definitions:**

| Bits | Field | Description |
|------|-------|-------------|
| 63-54 | Reserved | Must be zero for forward compatibility. Bit 63 reserved for Svnapot extension; bits 62-61 for Svpbmt extension |
| 53-10 | PPN | Physical Page Number. Subdivided: PPN[2] (bits 53-28), PPN[1] (bits 27-19), PPN[0] (bits 18-10) |
| 9-8 | RSW | Reserved for Supervisor software; hardware ignores these bits |
| 7 | **D** (Dirty) | Set by hardware when a write occurs to this page |
| 6 | **A** (Accessed) | Set by hardware on any read or write to this page |
| 5 | **G** (Global) | Global mapping; not flushed on `sfence.vma` with non-zero ASID |
| 4 | **U** (User) | Accessible in User mode; if clear, only Supervisor can access |
| 3 | **X** (Execute) | Page is executable |
| 2 | **W** (Write) | Page is writable |
| 1 | **R** (Read) | Page is readable |
| 0 | **V** (Valid) | PTE is valid; if clear, all other bits are ignored |

**Leaf vs. non-leaf PTE determination:**
- If R=0, W=0, X=0: This is a **pointer to the next level** page table (non-leaf)
- If any of R, W, X is set: This is a **leaf PTE** (maps to a physical page)
- W=1, R=0 is reserved (illegal)

### 5.5 Translation Algorithm

```
1. Let a = satp.PPN * PAGESIZE  (root page table physical address)
2. Let i = LEVELS - 1            (start at highest level)
3. Let pte = load(a + va.vpn[i] * PTESIZE)
4. If pte.V == 0 or (pte.R == 0 and pte.W == 1): page fault
5. If pte.R == 1 or pte.X == 1: this is a leaf PTE, go to step 6
   Otherwise: a = pte.ppn * PAGESIZE, i = i - 1, go to step 3
6. Check permissions (U, R, W, X) against access type and mode
7. For superpage: check alignment (lower PPN bits must be zero)
8. Construct physical address from pte.ppn and va.offset
```

**Source:** [RISC-V Privileged Specification v1.12](https://five-embeddev.com/riscv-priv-isa-manual/Priv-v1.12/supervisor.html); [MIT 6.S081 Lecture: Virtual Memory](https://pdos.csail.mit.edu/6.828/2021/slides/6s081-lec-vm.pdf); [HMC RISC-V SoC Ch. 11: MMU](https://pages.hmc.edu/harris/class/e154/lect/RVSoC-ch11mmu.pdf); [Stephen Marz: RISC-V MMU](https://osblog.stephenmarz.com/ch3.2.html)

---

## 6. TLB Sizes and Miss Penalties

### 6.1 TLB Specifications by Architecture

**Intel Golden Cove / Raptor Cove (12th-14th Gen):**

| TLB Level | Type | Entries (4KB) | Entries (2MB/4MB) | Entries (1GB) | Associativity | Latency |
|-----------|------|---------------|-------------------|---------------|---------------|---------|
| L1 ITLB | Instruction | 256 | 32 | 8 | Fully assoc. | ~1 cycle |
| L1 DTLB | Data | 96 | 32 | 8 | Fully assoc. | ~1 cycle |
| L2 STLB | Unified | 2048 | 1024 | -- | 8-way | ~7-8 cycles |

Simultaneous page walkers: 4 (doubled from prior gen)

**AMD Zen 4 (Ryzen 7000):**

| TLB Level | Type | Entries (4KB) | Entries (2MB) | Entries (1GB) | Associativity | Latency |
|-----------|------|---------------|---------------|---------------|---------------|---------|
| L1 ITLB | Instruction | 64 | 64 | -- | Fully assoc. | ~1 cycle |
| L1 DTLB | Data | 72 | 72 | -- | Fully assoc. | ~1 cycle |
| L2 DTLB | Unified | 3072 | 1536 | -- | 8-way | ~7-8 cycles |

Hardware page table walkers: 6

**ARM Cortex-A78 (reference for mobile):**

| TLB Level | Type | Entries | Associativity |
|-----------|------|---------|---------------|
| L1 ITLB | Instruction | 48 | Fully assoc. |
| L1 DTLB | Data | 48 | Fully assoc. |
| L2 TLB | Unified | 1024 | 4-way |

### 6.2 TLB Coverage Calculations

For Zen 4 L1 DTLB with 72 entries at 4 KB pages:

$$\text{Coverage} = 72 \times 4\text{ KB} = 288\text{ KB}$$

For Zen 4 L2 DTLB with 3072 entries at 4 KB pages:

$$\text{Coverage} = 3072 \times 4\text{ KB} = 12\text{ MB}$$

With 2 MB huge pages in L1 DTLB (72 entries):

$$\text{Coverage} = 72 \times 2\text{ MB} = 144\text{ MB}$$

### 6.3 Miss Penalties

| Event | Typical Penalty | Notes |
|-------|----------------|-------|
| L1 TLB hit | 0 cycles (pipelined) | Fully overlapped with cache access |
| L1 TLB miss, L2 TLB hit | 7-10 cycles | Modest penalty, often hidden by OOO execution |
| L2 TLB miss (page walk, page in cache) | 15-30 cycles | Depends on page table depth and cache residency |
| L2 TLB miss (page walk, page table in DRAM) | 100-600+ cycles | Sv39: up to 3 DRAM accesses; Sv48: up to 4 |
| Page fault (page not in memory) | 10^6+ cycles | OS must fetch page from disk/SSD |

For a full Sv39 page walk where no page table entries are cached:

$$\text{Penalty} \approx 3 \times t_{DRAM} \approx 3 \times 80\text{ ns} = 240\text{ ns} \approx 1200\text{ cycles at 5 GHz}$$

Modern processors mitigate this with **Page Walk Caches (PWC)** that store intermediate page table entries, hardware prefetching of page table entries, and speculative page walks.

**Sources:** [Wikipedia: Translation Lookaside Buffer](https://en.wikipedia.org/wiki/Translation_lookaside_buffer); [AnandTech: Intel Golden Cove Deep Dive](https://www.anandtech.com/show/16881/a-deep-dive-into-intels-alder-lake-microarchitectures/3); [Chips and Cheese: Zen 4 Memory Subsystem](https://chipsandcheese.com/p/amds-zen-4-part-2-memory-subsystem-and-conclusion); [Intel Large Code Pages Blueprint](https://www.intel.com/content/dam/develop/external/us/en/documents/runtimeperformanceoptimizationblueprint-largecodepages-q1update.pdf)

---

## 7. SSD Architecture

### 7.1 NAND Flash Cell Structure

NAND flash stores data as charge trapped in a floating gate (planar NAND) or charge trap layer (3D NAND). The number of bits per cell determines the type:

| Type | Bits/Cell | Voltage Levels | P/E Cycles | Read Latency | Write Latency | Cost/GB |
|------|-----------|---------------|------------|-------------|--------------|---------|
| **SLC** | 1 | 2 | 50,000-100,000 | ~25 us | ~200 us | $$$$$ |
| **MLC** | 2 | 4 | 3,000-10,000 | ~50 us | ~600 us | $$$$ |
| **TLC** | 3 | 8 | 1,000-3,000 | ~75 us | ~1,500 us | $$$ |
| **QLC** | 4 | 16 | 100-1,000 | ~100 us | ~3,000 us | $$ |
| PLC | 5 | 32 | ~100 | ~150 us | ~5,000 us | $ (emerging) |

More voltage levels require tighter voltage margins, leading to higher error rates, slower access, and lower endurance. Each additional bit roughly halves endurance and increases read/write latency by 1.5-2x.

### 7.2 NAND Physical Organization

```
SSD Controller
  |
  +-- Channel 0 ---- Package 0 ---- Die 0 ---- Plane 0 ---- Block 0 ---- Page 0
  |                                                                        Page 1
  |                                                                        ...
  |                                                                        Page N (128-512 pages/block)
  |                                                       ---- Block 1
  |                                                       ---- ...
  |                                         ---- Plane 1
  |                            ---- Die 1
  |                  Package 1
  +-- Channel 1
  |
  +-- Channel 2..7 (typically 4-8 channels for consumer, 8-32 for enterprise)
```

| Unit | Typical Size | Operations |
|------|-------------|------------|
| **Page** | 4-16 KB | Smallest unit for read/write |
| **Block** | 4-16 MB (256-512 pages) | Smallest unit for erase |
| **Plane** | 1000+ blocks | Parallel operations within a die |
| **Die** | 2-4 planes | One I/O command at a time |
| **Package** | 1-16 dies | Multiple dies stacked (3D packaging) |
| **Channel** | 1-4 packages | Controller communicates over this bus |

Key constraint: Pages can only be written sequentially within a block, and a block must be fully erased before any page can be rewritten. This asymmetry drives the need for FTL, garbage collection, and wear leveling.

### 7.3 Flash Translation Layer (FTL)

The FTL maps **Logical Block Addresses (LBA)** from the host to **Physical Page Addresses (PPA)** on the NAND, abstracting the flash constraints.

**Mapping schemes:**

| Scheme | Granularity | Table Size | Performance | Use Case |
|--------|------------|------------|-------------|----------|
| **Page-level** | Per page | Large (e.g., 1 GB table for 1 TB SSD at 8B/entry, 4KB pages) | Fastest random writes | High-end enterprise |
| **Block-level** | Per block | Small | Poor random write (write amplification) | Simple devices |
| **Hybrid** | Combination | Moderate | Good balance | Most consumer SSDs |

Page-level mapping for a 1 TB SSD:

$$\text{Table entries} = \frac{1\text{ TB}}{4\text{ KB/page}} = 2^{28} \approx 268\text{ million entries}$$
$$\text{Table size} = 2^{28} \times 8\text{ B} = 2\text{ GB of DRAM}$$

This is why high-end SSDs carry 1-2 GB of DRAM for the mapping table.

### 7.4 Wear Leveling

- **Dynamic wear leveling:** Only redistributes writes among free blocks. Hot data migrates, but cold data stays in place.
- **Static wear leveling:** Periodically moves cold (infrequently written) data to worn blocks, freeing fresher blocks for writes. More complex but extends lifetime.

Goal: Ensure all blocks reach end-of-life at approximately the same time, maximizing total drive writes.

### 7.5 Garbage Collection (GC)

When free blocks are exhausted, the SSD must reclaim space:

1. Select a victim block containing a mix of valid and invalid pages
2. Copy all valid pages to a new block
3. Erase the victim block, returning it to the free pool

**Write amplification factor (WAF):**

$$WAF = \frac{\text{Actual NAND writes}}{\text{Host writes}}$$

Ideal WAF = 1.0; typical real-world WAF = 1.5-3.0 for consumer workloads. GC is the primary source of write amplification.

Over-provisioning (typically 7-28% of total NAND capacity) provides a buffer of free blocks to reduce GC frequency and write amplification.

### 7.6 NVMe Protocol

NVMe (Non-Volatile Memory Express) is the host-side protocol for communicating with SSDs over PCIe.

**Queue architecture:**

| Component | Description |
|-----------|-------------|
| **Admin Queue Pair** | 1 mandatory pair for device management |
| **I/O Queue Pairs** | Up to **65,535** (64K - 1) I/O queue pairs |
| **Queue Depth** | Each queue holds up to **65,536** (64K) entries |
| **Submission Queue (SQ)** | Circular buffer of 64-byte command structures; host writes, controller reads |
| **Completion Queue (CQ)** | Circular buffer of 16-byte completion entries; controller writes, host reads |
| **Doorbell Registers** | Host writes SQ tail doorbell to notify controller of new commands |
| **Phase Bit** | Toggles per CQ pass to distinguish new completions without extra signaling |

**Multiple SQs can map to a single CQ**, enabling flexible topology:
- Typical: 1 SQ + 1 CQ per CPU core (avoids locking)
- Or: Priority-based SQs (urgent vs. background) sharing a CQ

**Comparison with legacy protocols:**

| Feature | AHCI (SATA) | NVMe |
|---------|------------|------|
| Max queue depth | 32 | 65,536 per queue |
| Max queues | 1 | 65,535 I/O queues |
| CPU involvement | Requires context switch | Direct doorbell register write |
| Latency | ~6 us (protocol overhead) | ~2.8 us |
| IOPS (typical) | ~100K | ~1M+ |

**Sources:** [Western Digital: NVMe Queues Explained](https://blog.westerndigital.com/nvme-queues-explained/); [Oracle: NVMe Architecture Overview](https://blogs.oracle.com/linux/overview-of-nvme-architecture); [NVMe Whitepaper](https://nvmexpress.org/wp-content/uploads/2013/04/NVM_whitepaper.pdf); [Kingston: SLC/MLC/TLC/QLC](https://www.kingston.com/en/blog/pc-performance/difference-between-slc-mlc-tlc-3d-nand); [Code Capsule: SSD FTL](https://codecapsule.com/2014/02/12/coding-for-ssds-part-3-pages-blocks-and-the-flash-translation-layer/); [SSD Review: NAND Flash Guide](https://www.thessdreview.com/ssd-guides/learning-to-run-with-flash-2-0/understanding-slc-mlc-tlc-and-qlc-nand-flash-learning-to-run-with-flash-2-0/)

---

## 8. CXL (Compute Express Link)

### 8.1 Overview

CXL is an open industry-standard interconnect built on top of the PCIe physical layer. It provides **cache-coherent access to shared memory** between CPUs, accelerators, and memory expansion devices.

### 8.2 CXL 3.0 Specification (Released August 2, 2022)

| Feature | CXL 3.0 |
|---------|---------|
| Physical layer | PCIe 6.0 (PAM-4 signaling) |
| Data rate | 64 GT/s |
| Raw bandwidth (x16) | 256 GB/s (aggregate, bidirectional) |
| Topology | Multi-level switching; non-tree topologies (mesh, ring, spine/leaf) |
| Key additions | Memory sharing, back-invalidation, peer-to-peer transfers, fabric management |

### 8.3 CXL Sub-Protocols

CXL defines three sub-protocols that can be combined:

| Protocol | Function | Direction |
|----------|----------|-----------|
| **CXL.io** | Discovery, configuration, DMA, interrupts | Based on PCIe TLP |
| **CXL.cache** | Device caches host memory with coherency | Device -> Host memory |
| **CXL.mem** | Host accesses device-attached memory | Host -> Device memory |

### 8.4 Device Types

| Type | Protocols | Example | Description |
|------|-----------|---------|-------------|
| **Type 1** | CXL.io + CXL.cache | SmartNICs, crypto accelerators | Accelerator with no local memory; caches host memory coherently |
| **Type 2** | CXL.io + CXL.cache + CXL.mem | GPUs, FPGAs, AI accelerators | Accelerator with its own memory; both device and host can access each other's memory coherently |
| **Type 3** | CXL.io + CXL.mem | Memory expanders, persistent memory | Pure memory expansion; no device-side cache |

### 8.5 Memory Pooling and Sharing

**Memory Pooling (CXL 2.0+):**
- CXL-attached memory treated as a flexible resource
- A pool of Type 3 devices can be dynamically allocated to different servers
- Enables disaggregated memory architectures
- FM (Fabric Manager) software orchestrates allocation

**Memory Sharing (CXL 3.0):**
- Multiple hosts can **simultaneously access the same memory** with hardware-maintained coherency
- Enables shared-memory programming models across servers
- Uses **back-invalidation**: when a device modifies shared memory, it can invalidate stale copies in host caches
- Supports coherent peer-to-peer transfers within a virtual hierarchy

### 8.6 Cache Coherency Protocol

CXL 3.0 replaced the earlier "bias modes" (host-bias vs. device-bias) with **enhanced coherency semantics**:

- Type 2 and Type 3 devices can issue back-invalidations to host caches
- MESI-like coherency states maintained across the CXL link
- Coherency domain can span multiple devices and hosts in CXL 3.0 fabrics
- Lower overhead than software-managed coherency or PCIe BAR-based access

### 8.7 Use Cases

1. **Memory capacity expansion**: Add terabytes of memory beyond DIMM slot limits
2. **Memory bandwidth tiering**: Place less latency-sensitive data on CXL memory (~150-200 ns vs ~80 ns for local DDR5)
3. **Composable infrastructure**: Dynamically assign memory to workloads
4. **AI/ML training**: Pool memory across GPU nodes for larger model support
5. **Database acceleration**: Extend in-memory database capacity without server upgrades

**Sources:** [CXL Consortium: About CXL](https://computeexpresslink.org/about-cxl/); [CXL 3.0 White Paper](https://computeexpresslink.org/wp-content/uploads/2023/12/CXL_3.0_white-paper_FINAL.pdf); [Wikipedia: Compute Express Link](https://en.wikipedia.org/wiki/Compute_Express_Link); [ACM Computing Surveys: Introduction to CXL](https://dl.acm.org/doi/full/10.1145/3669900); [Servermall: CXL 3.0 Guide](https://servermall.com/blog/compute-express-link-cxl-3-0-all-you-need-to-know/); [Logic Fruit: CXL Device Types](https://www.logic-fruit.com/blog/cxl/compute-express-link-cxl-device-types/)

---

## 9. Roofline Model

### 9.1 Origin

The Roofline model was introduced by **Samuel Williams, Andrew Waterman, and David Patterson** in their 2009 paper:

> S. Williams, A. Waterman, and D. Patterson, "Roofline: An Insightful Visual Performance Model for Multicore Architectures," *Communications of the ACM*, vol. 52, no. 4, pp. 65-76, April 2009.

It provides a visual framework for understanding whether a computational kernel is **compute-bound** or **memory-bound**.

### 9.2 Key Definitions

**Arithmetic (Operational) Intensity** ($I$):

$$I = \frac{\text{FLOPs performed}}{\text{Bytes transferred to/from DRAM}}\ \ [\text{FLOP/Byte}]$$

This is a property of the **algorithm**, not the hardware.

**Peak Performance** ($\Pi_{peak}$): Maximum floating-point throughput of the processor (FLOP/s). Determined by:

$$\Pi_{peak} = \text{cores} \times \text{clock} \times \frac{\text{FLOPs}}{\text{cycle per core}}$$

**Peak Memory Bandwidth** ($\beta_{peak}$): Maximum rate of data transfer between processor and DRAM (Bytes/s). Measured via STREAM benchmark or similar.

### 9.3 The Roofline Bound

The attainable performance $P$ for a kernel with arithmetic intensity $I$ is bounded by:

$$P \leq \min\left(\Pi_{peak},\ I \times \beta_{peak}\right)$$

On a log-log plot of Performance (FLOP/s) vs. Arithmetic Intensity (FLOP/Byte):

```
log(FLOP/s)
    |
    |              ___________________________  <-- Compute ceiling (Pi_peak)
    |             /
    |            /
    |           /   <-- Memory bandwidth ceiling (slope = beta_peak)
    |          /
    |         /
    |        /
    |       /
    |      /
    +-----+----------------------------> log(FLOP/Byte)
          ^
          Ridge Point
```

### 9.4 Ridge Point

The **ridge point** is where the memory bandwidth line meets the compute ceiling:

$$I_{ridge} = \frac{\Pi_{peak}}{\beta_{peak}}\ \ [\text{FLOP/Byte}]$$

- Kernels with $I < I_{ridge}$ are **memory-bound** (limited by bandwidth)
- Kernels with $I > I_{ridge}$ are **compute-bound** (limited by FLOP throughput)

The ridge point characterizes the **machine balance** -- how many FLOPs the processor can perform for each byte it can fetch.

### 9.5 Worked Example: NVIDIA A100 GPU

**Hardware specifications (A100 SXM, FP64):**
- $\Pi_{peak}$ = 9.7 TFLOP/s (FP64)
- $\beta_{peak}$ = 2.0 TB/s (HBM2e bandwidth, measured ~1.6 TB/s achievable)

**Ridge point:**

$$I_{ridge} = \frac{9.7 \times 10^{12}}{2.0 \times 10^{12}} = 4.85\ \text{FLOP/Byte}$$

**Example kernels:**

| Kernel | Arithmetic Intensity | Bound | Attainable Performance |
|--------|---------------------|-------|----------------------|
| STREAM Copy | 0 (no FLOPs) | Memory | N/A (bandwidth benchmark) |
| SpMV (sparse matrix-vector) | ~0.25 FLOP/B | Memory | $0.25 \times 2.0\text{ TB/s} = 500\text{ GFLOP/s}$ |
| Dense BLAS (DGEMM) | ~20 FLOP/B | Compute | $\min(9.7\text{ TF}, 20 \times 2.0) = 9.7\text{ TFLOP/s}$ |
| FFT | ~1.5 FLOP/B | Memory | $1.5 \times 2.0 = 3.0\text{ TFLOP/s}$ |
| Stencil (7-point 3D) | ~1.0 FLOP/B | Memory | $1.0 \times 2.0 = 2.0\text{ TFLOP/s}$ |

### 9.6 Extended Roofline

The basic model can be extended with additional "ceilings" below the roofline:

**Bandwidth ceilings** (below the sloped roof):
- Without software prefetching
- Without unit-stride access
- With cache-unfriendly access patterns

**Compute ceilings** (below the flat roof):
- Without SIMD/vector instructions
- Without ILP (instruction-level parallelism)
- Without FMA (fused multiply-add)

These sub-ceilings help identify which optimizations would most benefit a given kernel.

### 9.7 Hierarchical Roofline

For more detailed analysis, separate rooflines can be constructed for each level of the memory hierarchy:

$$P \leq \min\left(\Pi_{peak},\ I_{L1} \times \beta_{L1},\ I_{L2} \times \beta_{L2},\ I_{L3} \times \beta_{L3},\ I_{DRAM} \times \beta_{DRAM}\right)$$

where $I_{Lk}$ is the arithmetic intensity measured with respect to data traffic at cache level $k$. This reveals whether a kernel is bottlenecked at a specific cache level.

**Sources:** [Williams, Waterman, Patterson, "Roofline: An Insightful Visual Performance Model for Multicore Architectures," Communications of the ACM, 2009](https://dl.acm.org/doi/abs/10.1145/1498765.1498785); [Berkeley Tech Report (full paper)](https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf); [NERSC Roofline Documentation](https://docs.nersc.gov/tools/performance/roofline/); [NVIDIA Nsight Compute Roofline](https://developer.nvidia.com/blog/accelerating-hpc-applications-with-nsight-compute-roofline-analysis/); [Modal GPU Glossary: Roofline Model](https://modal.com/gpu-glossary/perf/roofline-model)

---

## Cross-References and Summary

### Memory Hierarchy Latency Ladder (approximate, 2024-2025 processors)

| Level | Technology | Capacity | Latency | Bandwidth |
|-------|-----------|----------|---------|-----------|
| Registers | SRAM (flip-flops) | ~few KB | 0 cycles (0 ns) | -- |
| L1 Cache | SRAM 6T | 32-192 KB | 3-5 cycles (~0.7-1.0 ns) | ~1-4 TB/s |
| L2 Cache | SRAM 6T | 0.5-16 MB | 12-15 cycles (~2.5-3.0 ns) | ~0.5-1 TB/s |
| L3/SLC Cache | SRAM 6T | 8-96 MB | 40-54 cycles (~8-12 ns) | ~200-600 GB/s |
| Main Memory (DDR5) | DRAM 1T1C | 16-128 GB | 200-400 cycles (~60-100 ns) | 40-70 GB/s/module |
| Main Memory (HBM3E) | DRAM stacked | 24-192 GB | ~100-200 ns | 819-1200 GB/s/stack |
| SSD (NVMe) | NAND Flash | 0.5-8 TB | ~10-100 us | 5-14 GB/s |
| HDD | Magnetic | 1-24 TB | ~3-10 ms | 150-250 MB/s |
| CXL Memory | DRAM (remote) | 256 GB - TB | ~150-250 ns | Up to 256 GB/s (x16) |

This represents a span of roughly **10^7** in latency from L1 cache to HDD, which is why the memory hierarchy exists -- to bridge the gap between processor speed and storage capacity at acceptable cost.
