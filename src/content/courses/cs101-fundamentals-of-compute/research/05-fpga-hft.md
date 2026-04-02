# FPGA Architecture & High-Frequency Trading -- Research Notes

> Compiled: 2026-03-31
> Purpose: Reference material for CS 101 FPGA/HFT lecture content

---

## 1. FPGA Specifications: AMD/Xilinx Versal and Intel Agilex

### 1.1 AMD/Xilinx Versal Family

The Versal Adaptive SoC is built on TSMC 7nm and represents AMD's heterogeneous architecture combining programmable logic (PL), dedicated AI compute, DSP engines, and multiple processor cores.

#### Versal AI Core Series -- VC1902 (Flagship AI Inference Device)

| Resource                  | VC1902 Specification         |
|---------------------------|------------------------------|
| System Logic Cells        | ~1.9M                        |
| LUTs                      | 899,840                      |
| DSP Engines               | 1,968                        |
| Block RAM                 | 34 Mb                        |
| Distributed RAM           | 27 Mb                        |
| UltraRAM                  | 130 Mb                       |
| Total On-Die Memory       | 855 Mb                       |
| AI Engine Tiles           | 400 (50x8 array)             |
| AI Engine Data Memory     | 100 Mb                       |
| Transistors               | 37 billion                   |
| I/O Pins                  | 785                          |
| SerDes Lanes              | 44                           |
| Process Node              | TSMC 7nm                     |
| Processors                | 2x Arm Cortex-A72 + 2x Arm Cortex-R5F |

Each AI Engine tile contains a high-performance VLIW vector processor with 512-bit fixed-point and floating-point execution units, 32KB local data memory, and a 32-bit scalar processor.

Sources:
- [IEEE Hot Chips 31 -- Xilinx Versal AI Core VC1902](https://www.old.hotchips.org/hc31/HC31_2.5_Xilinx_Versal_Hotchips31_Final_v2.pdf)
- [AMD Versal AI Core Series](https://www.amd.com/en/products/adaptive-socs-and-fpgas/versal/ai-core-series.html)
- [Versal Architecture and Product Data Sheet (DS950)](https://www.mouser.com/datasheet/2/903/ds950_versal_overview-2634331.pdf)

#### Versal Premium Series -- VP1902 (Largest Versal Device)

| Resource                  | VP1902 Specification         |
|---------------------------|------------------------------|
| System Logic Cells        | 18.5M (18,504K)             |
| LUTs                      | 8,460,288                    |
| DSP Engines               | 6,864                        |
| Block RAM                 | 239 Mb                       |
| UltraRAM                  | 619 Mb                       |
| SelectIO Resources        | 2,328 (up to 3.2 Gbps each) |
| High-Speed Transceivers   | Up to 160 total              |
| -- 112 Gbps PAM-4 GTMs    | Up to 32                     |
| -- 32.75 Gbps GTYPs       | Up to 128                    |
| PCIe                      | 16x PCIe Gen5 x4            |
| Ethernet MAC (100G)       | Up to 12                     |
| Ethernet MAC (600G)       | Up to 4                      |
| Processors                | 2x Arm Cortex-A72 + 2x Arm Cortex-R5F |
| Architecture              | 2x2 SLR with programmable NoC |

The VP1902 is 2x the capacity of the previous-generation Virtex UltraScale+ VU19P.

Sources:
- [AMD Versal Premium VP1902 Product Page](https://www.amd.com/en/products/adaptive-socs-and-fpgas/versal/premium-series/vp1902.html)
- [VP1902 Product Brief (PDF)](https://www.xilinx.com/content/dam/xilinx/publications/product-briefs/2118851-versal-premium-vp1902-product-brief.pdf)
- [CNX Software -- AMD Versal Premium VP1902](https://www.cnx-software.com/2023/06/28/amd-versal-premium-vp1902-fpga-soc-provides-18-5m-logic-cells-for-soc-emulation-and-prototyping/)

#### Versal Gen 2 AI Edge Series (2025)

| Resource                  | Gen 2 Specification          |
|---------------------------|------------------------------|
| LUTs                      | Up to 543,104                |
| DSP Engines               | Up to 2,064                  |
| Distributed RAM           | Up to 16.6 Mb               |
| Block RAM                 | Up to 47.2 Mb               |
| UltraRAM                  | Up to 33.2 Mb               |
| AI Engine-ML V2 Tiles     | Up to 144                    |
| AI Engine Data Memory     | Up to 72 Mb                  |
| AI Engine Shared Memory   | Up to 288 Mb                 |
| AI Compute                | Up to 184 TOPS              |
| Scalar Compute            | Up to 200K DMIPS             |
| Application Processors    | Up to 8x Arm Cortex-A78AE   |
| Real-Time Processors      | Up to 10x Arm Cortex-R52    |

Sources:
- [EEJournal -- AMD Versal Gen 2 AI Edge SoC FPGAs](https://www.eejournal.com/article/amd-rocks-with-new-versal-gen-2-ai-edge-soc-fpgas/)
- [AMD Versal AI Edge Series Gen 2](https://www.amd.com/en/products/adaptive-socs-and-fpgas/versal/gen2/ai-edge-series.html)

### 1.2 Intel (Altera) Agilex Family

#### Agilex 7 F-Series (Largest Device -- AGF027)

| Resource                  | AGF027 Specification         |
|---------------------------|------------------------------|
| Logic Elements (LE)       | 2,692,760                    |
| Adaptive Logic Modules    | 912,800                      |
| ALM Registers             | 3,651,200                    |
| Embedded Memory (M20K)    | 287 Mb                       |
| DSP Blocks                | 8,528                        |
| Fabric & I/O PLLs         | 28                           |
| Process Node              | Intel 10nm SuperFin          |
| DSP Compute               | Up to 40 TFLOPS (FP16)      |
| BFLOAT16                  | Hardened support             |

Sources:
- [Intel Agilex 7 FPGA F-Series 027 Specifications](https://www.intel.com/content/www/us/en/products/sku/223273/intel-agilex-7-fpga-fseries-027-r24c/specifications.html)
- [Intel Agilex 7 Device Data Sheet](https://www.intel.com/content/www/us/en/docs/programmable/683301/current/intel-agilex-7-fpgas-and-socs-device.html)
- [Agilex 7 F-Series Product Table (PDF)](https://cdrdv2-public.intel.com/690880/agilex-7-fpgas-and-socs-f-series-product-table.pdf)

#### Agilex 7 I-Series (Network/HFT Focused)

| Resource                     | Specification                |
|------------------------------|------------------------------|
| Logic Elements Range         | 392K to 2.7M                |
| M20K Memory Range            | 38 to 259 Mb                |
| 112 Gbps PAM4 Transceivers  | 8                            |
| 58 Gbps PAM4 Transceivers   | 48                           |
| 56 Gbps NRZ Transceivers    | 8                            |
| 32 Gbps NRZ Transceivers    | 64                           |
| Hardened Ethernet MAC+FEC    | 2x 10/25/50/100/200/400G    |
| PCIe                         | Gen 5                       |
| Memory                       | DDR5, HBM3, Optane          |
| CPU Coherency                | CXL / Xeon cache-coherent   |

Sources:
- [Intel Agilex I-Series for High Bandwidth](https://wcm-ciqa.intel.com/content/www/us/en/products/programmable/fpga/agilex/i-series.html)
- [Inside Intel Agilex FPGAs -- EEJournal](https://www.eejournal.com/article/inside-intel-agilex-fpgas/)
- [Intel Agilex FPGA Product Brief](https://www.intel.com/content/www/us/en/products/docs/programmable/agilex-fpga-product-brief.html)

#### Agilex 7 M-Series (HBM)

The M-Series adds in-package HBM2e memory, up to 72 high-speed transceivers (8 at 116 Gbps PAM4), targeting memory-bandwidth-bound workloads.

Source: [EEJournal -- Intel Agilex M-Series with HBM](https://www.eejournal.com/article/intel-announces-worlds-fastest-fpgas-with-in-package-hbm-the-intel-agilex-m-series-fpgas/)

#### Agilex 9 RF-Series

Built on Intel 10nm SuperFin. Integrates 64 Gbps AD/DA converters directly on die. Includes quad-core Arm processors, transceiver rates up to 58 Gbps. Designed for direct RF-sampling radar and communications applications.

Source: [Altera Agilex 9 SoC FPGA RF-Series](https://www.altera.com/products/fpga/agilex/9/rf-series)

---

## 2. FPGA vs ASIC vs CPU Comparison

### 2.1 Quantitative Comparison Table

| Metric                    | CPU                         | FPGA                        | ASIC                        |
|---------------------------|-----------------------------|-----------------------------|-----------------------------|
| Clock Frequency           | 3-5 GHz                    | 100-500 MHz                 | 500 MHz - 2+ GHz           |
| Latency (relative)        | 1x (baseline)              | 10-100x lower than CPU      | 20-80% lower than FPGA     |
| Throughput (relative)     | 1x                         | 10-100x for parallel tasks  | 2-10x higher than FPGA     |
| Power Efficiency          | ~1 GOPS/W                  | ~7-10 GOPS/W (typical)      | ~50-400 GOPS/W             |
| NRE Cost                  | $0 (use COTS)              | $0 (reconfigurable)         | $50M-$500M (node dependent)|
| Unit Cost (volume)        | $100-$1000                 | $5-$5,000+                  | <$1-$100 at high volume    |
| Time to Market            | Days-weeks (software)       | Weeks-months (HDL/HLS)      | 1-3 years                  |
| Flexibility               | Highest (any software)      | High (reconfigurable)       | None (fixed function)      |
| Volume Breakeven vs FPGA  | N/A                         | Baseline                    | ~400K units                 |

### 2.2 ASIC NRE Cost by Process Node

| Process Node | Average Design Cost     | Mask Set Cost     | Tapeout Cost      |
|-------------|-------------------------|-------------------|-------------------|
| 28nm        | ~$40M                   | ~$2-3M            | ~$5M              |
| 7nm         | $217M-$249M             | >$10M             | ~$30M             |
| 5nm         | $416M-$449M             | ~$20-30M          | $40-50M           |
| 3nm         | ~$600M+                 | ~$40M             | ~$50M+            |
| 2nm         | ~$725M+ (estimated)     | N/A               | N/A               |

Note: Some chip startups have produced 7nm designs for $50M-$75M total (simpler designs with less verification).

Sources:
- [Digilent -- Six Reasons to Consider FPGAs](https://digilent.com/blog/six-reasons-you-should-consider-fpgas-over-asics-or-cpu-gpus/)
- [Kuon & Rose -- Measuring the Gap between FPGAs and ASICs (UofT)](https://www.eecg.toronto.edu/~jayar/pubs/kuon/kuonfpga06.pdf)
- [SemiEngineering -- What Will That Chip Cost?](https://semiengineering.com/what-will-that-chip-cost/)
- [AnySilicon -- ASIC NRE Explained](https://anysilicon.com/asic-nre-explained/)
- [ASIC vs FPGA -- Logic Fruit](https://www.logic-fruit.com/blog/fpga/fpga-vs-asic-design/)

### 2.3 Concrete Performance Examples

**FIR Filter (DSP workload):**
- FPGA is 27x faster than CPU, 2x faster than GPU (IEEE JSSE 2025)
- Source: [MDPI -- FPGA, GPU, CPU FIR Filter Performance](https://www.mdpi.com/2079-9268/15/3/40)

**AI/ML Inference (GOPS/W examples):**
- FPGA FTRANS transformer accelerator: 170 GOPS at 6.8 GOPS/W
- FPGA ViA (Vision Transformer): 309.6 GOPS at 7.9 GOPS/W
- Comparable ASIC designs: 50-400 GOPS/W range
- Source: [arXiv -- Hardware Acceleration of LLMs Survey](https://arxiv.org/html/2409.03384v1)

### 2.4 When to Choose What

| Scenario                            | Best Choice | Rationale                                     |
|-------------------------------------|-------------|-----------------------------------------------|
| Prototype / algorithm exploration   | CPU/GPU     | Fastest iteration, rich software ecosystem     |
| Low-latency, medium-volume (<100K)  | FPGA        | No NRE, reconfigurable, deterministic latency  |
| High-volume consumer product (>1M)  | ASIC        | Lowest unit cost, best power efficiency        |
| HFT / ultra-low-latency networking  | FPGA        | Reconfigurability for protocol changes          |
| Cryptocurrency mining               | ASIC        | Fixed algorithm, massive volume, power matters |
| 5G baseband processing              | ASIC        | Volume + power constraints                     |
| Defense / aerospace                 | FPGA        | Low volume, field-upgradable, radiation-hard   |

---

## 3. Verilog Synthesis Patterns

### 3.1 Synthesizable Construct-to-Hardware Mapping

| Verilog Construct                        | Hardware Mapping                        | Notes                                       |
|-----------------------------------------|-----------------------------------------|---------------------------------------------|
| `always @(posedge clk)` with `<=`       | Flip-flops / registers                  | Non-blocking assignment required for sequential |
| `always @(*)` or `always_comb`          | Combinational logic gates               | Blocking assignment (`=`) required           |
| `assign wire = expr;`                   | Continuous combinational logic           | Direct wire connection through gates         |
| `case` / `casez` / `casex`             | Multiplexers (priority or parallel)      | Full case avoids latches                    |
| `if-else` chains                        | Priority-encoded mux / priority logic    | Deeper chains = longer critical path         |
| `for` loops (constant bounds)           | Unrolled replicated hardware            | Each iteration becomes parallel hardware     |
| `generate` blocks                       | Parameterized replicated modules        | Structural elaboration at compile time       |
| `?:` ternary                            | 2:1 multiplexer                         | Simple conditional select                   |
| `&, |, ^` operators                     | AND, OR, XOR gates                      | Direct gate mapping                         |
| `+, -, *` arithmetic                    | Adders, subtractors, multipliers         | `*` may map to DSP blocks                   |
| `<<, >>` constant shift                 | Wiring (zero cost)                      | Just reroutes bits, no logic                |
| `<<, >>` variable shift                 | Barrel shifter (mux tree)               | Actual logic required                       |
| Incomplete `if` without `else`          | Latch (usually unintended)              | Synthesis warning -- always provide `else`   |
| `always @(posedge clk)` with `if(rst)`  | Flip-flop with synchronous reset        | Reset value becomes power-on state          |

### 3.2 Non-Synthesizable Constructs

These constructs are valid in simulation/testbench code only:

| Construct                    | Purpose in Simulation                     |
|-----------------------------|-------------------------------------------|
| `initial` block             | Testbench stimulus initialization          |
| `#10` delay statements      | Timing control for waveform generation     |
| `$display`, `$write`        | Console output for debugging               |
| `$monitor`                  | Continuous signal monitoring               |
| `$readmemh`, `$readmemb`   | Memory initialization from files           |
| `$finish`, `$stop`          | Simulation control                         |
| `fork...join`               | Parallel thread execution                  |
| `wait(signal)`              | Level-sensitive blocking                   |
| `force` / `release`        | Signal override                            |
| `deassign`                  | Remove procedural assignment               |
| Infinite loops without `@`  | Non-terminating simulation constructs      |
| Real-number variables       | Floating point (no direct HW equivalent)   |

Exception: `initial` blocks ARE synthesizable on some FPGAs (Xilinx, Intel) for register initialization / BRAM content loading. This is an FPGA-specific feature, not available for ASIC synthesis.

### 3.3 SystemVerilog Synthesis Enhancements

| SystemVerilog Construct      | Benefit over Verilog                     |
|-----------------------------|------------------------------------------|
| `always_comb`               | Automatic complete sensitivity list       |
| `always_ff @(posedge clk)` | Explicit intent: sequential only          |
| `always_latch`              | Explicit intent: latch (rare, intentional)|
| `logic` type                | Replaces both `reg` and `wire`           |
| `enum`                      | Named states for FSMs                    |
| `struct` / `union`          | Grouped signal bundles                   |
| `interface`                 | Modular port connections                 |

Sources:
- [ChipVerify -- Verilog Synthesis](https://www.chipverify.com/verilog/verilog-synthesis)
- [ASIC World -- Verilog Synthesis Tutorial](https://www.asic-world.com/verilog/synthesis2.html)
- [ChipVerify -- SystemVerilog always_comb, always_ff](https://www.chipverify.com/systemverilog/systemverilog-always)
- [Springer -- Non-synthesizable Verilog Constructs (Ch. 15)](https://link.springer.com/chapter/10.1007/978-981-16-3199-3_15)

---

## 4. High-Level Synthesis (HLS) -- Vitis HLS Pragmas

### 4.1 Key Pragmas Reference

#### `#pragma HLS pipeline`

```c
#pragma HLS pipeline II=<int> rewind off
```

- Initiates function or loop pipelining -- starts next iteration before current completes
- `II` (Initiation Interval): number of clock cycles before accepting new input. II=1 means new input every cycle
- Creates pipeline registers between stages
- Trade-off: more registers and control logic for higher throughput
- Most impactful single optimization in HLS

Source: [AMD UG1399 -- pragma HLS pipeline](https://docs.amd.com/r/en-US/ug1399-vitis-hls/pragma-HLS-pipeline)

#### `#pragma HLS unroll`

```c
#pragma HLS unroll factor=<int>
```

- Replicates loop body hardware to execute iterations in parallel
- `factor=N`: create N copies (partial unroll). Omit for full unroll
- Full unroll of loop with N iterations creates N copies of hardware
- Trade-off: massive area increase for proportional throughput gain
- Works synergistically with pipeline (unroll inner loop, pipeline outer)

Source: [AMD UG1399 -- pragma HLS unroll](https://docs.amd.com/r/en-US/ug1399-vitis-hls/pragma-HLS-unroll)

#### `#pragma HLS array_partition`

```c
#pragma HLS array_partition variable=<name> type=<block|cyclic|complete> factor=<int> dim=<int>
```

- Splits arrays into smaller arrays or individual elements
- `complete`: each element becomes its own register (full parallel access)
- `cyclic`: interleaves elements across banks (factor=N creates N banks)
- `block`: contiguous chunks in each bank
- Enables multiple simultaneous read/write accesses
- Without partitioning, BRAM limits to 2 reads/cycle (dual-port)
- Trade-off: uses registers/LUTs instead of BRAM -- much more area

#### `#pragma HLS dataflow`

```c
#pragma HLS dataflow
```

- Enables task-level pipelining between sequential functions
- Functions execute concurrently on different data sets
- Automatic FIFO/PIPO channels inserted between producer-consumer pairs
- Enables overlap: function B starts on data set N while function A processes data set N+1
- Requirements: single-producer single-consumer data flow, no feedback

Source: [AMD UG1399 -- pragma HLS dataflow](https://docs.amd.com/r/en-US/ug1399-vitis-hls/pragma-HLS-dataflow)

#### `#pragma HLS interface`

```c
#pragma HLS interface mode=<ap_ctrl_hs|ap_ctrl_chain|ap_ctrl_none|s_axilite|m_axi|axis|ap_memory|ap_none> port=<name>
```

- Specifies how function arguments map to hardware ports
- `m_axi`: AXI4 master for DRAM access (burst-capable)
- `axis`: AXI4-Stream for streaming data (common in HFT pipelines)
- `s_axilite`: AXI4-Lite slave for control registers
- `ap_memory`: local BRAM interface
- Burst mode limitation: max 256 words per AXI transaction

Source: [AMD UG1399 -- pragma HLS interface](https://docs.amd.com/r/en-US/ug1399-vitis-hls/pragma-HLS-interface)

### 4.2 Typical HLS Results for Common Operations

| Operation              | HLS Latency (cycles) | II  | LUT%  | BRAM% | Notes                          |
|-----------------------|----------------------|-----|-------|-------|--------------------------------|
| Matrix multiply 32x32 | ~32K                 | 1   | 15-25%| 10-20%| With array_partition            |
| FIR filter (16 taps)  | 16                   | 1   | 5-10% | <5%   | Fully pipelined                |
| FFT 1024-pt           | ~10K                 | 1   | 20-30%| 15-25%| Radix-2 butterfly              |
| Sorting (bitonic, 256)| ~2K                  | N/A | 30-40%| 10%   | Compare-swap network           |
| AES-128 encrypt       | 11-44                | 1   | 10-20%| <5%   | Pipelined or iterative          |

### 4.3 HLS Limitations -- When to Drop to RTL

| Limitation                                    | Why RTL is Needed                              |
|-----------------------------------------------|------------------------------------------------|
| Clock domain crossing                         | HLS generates single-clock designs             |
| Asynchronous resets                           | HLS only supports synchronous reset            |
| Tri-state / bidirectional I/O                 | Not expressible in HLS C++                     |
| Custom SerDes / PHY integration               | Requires vendor IP instantiation               |
| Cycle-accurate protocol state machines         | HLS scheduling may add unwanted latency        |
| Multi-cycle paths / false path constraints     | Cannot express timing exceptions in HLS        |
| Sub-function interface control                 | Only `register` option available on sub-functions |
| Last 10% of latency optimization              | RTL gives cycle-exact control                  |
| Vendor hard IP instantiation (PCIe, Ethernet) | Must be wired in RTL or Vivado block design    |

In the HFT context: the network stack, protocol parsers, and order book are often hand-coded RTL for deterministic cycle-by-cycle behavior, while trading strategy logic may use HLS for faster development iteration.

Sources:
- [AMD Vitis HLS User Guide UG1399](https://www.xilinx.com/support/documents/sw_manuals/xilinx2022_2/ug1399-vitis-hls.pdf)
- [Xilinx/Vitis-Tutorials -- HLS DeepWiki](https://deepwiki.com/Xilinx/Vitis-Tutorials/2.2-vitis-hls-(high-level-synthesis))
- [Xilinx HLS Design Flow Labs](https://xilinx.github.io/xup_high_level_synthesis_design_flow/Lab2.html)

---

## 5. FPGA in HFT -- Key Papers and Results

### 5.1 "A Low-Latency Library in FPGA Hardware for High-Frequency Trading (HFT)" -- Lockwood (IEEE HOTI 2012)

**Citation:** J. W. Lockwood and A. Gupte, "A Low-Latency Library in FPGA Hardware for High-Frequency Trading (HFT)," IEEE 20th Annual Symposium on High-Performance Interconnects (HOTI), 2012.

**Key Results:**
- End-to-end latency: 1 microsecond fixed at 10 Gb/s Ethernet line rate
- Up to 2 orders of magnitude lower latency than comparable software implementations
- Library provides reusable IP for networking, I/O, memory interfaces, and financial protocol parsers
- Demonstrated the viability of FPGA acceleration as a "hybrid" architecture for HFT

Sources:
- [IEEE Xplore](https://ieeexplore.ieee.org/document/6299067/)
- [Semantic Scholar](https://www.semanticscholar.org/paper/A-Low-Latency-Library-in-FPGA-Hardware-for-Trading-Lockwood-Gupte/54e790e76e8c4b393f5e28df2a3d9f72392c27fe)
- [ACM DL](https://dl.acm.org/doi/10.1109/HOTI.2012.15)

### 5.2 "Build Fast, Trade Fast: FPGA-Based HFT Using High-Level Synthesis" -- Boutros et al.

**Citation:** A. Boutros et al., "Build fast, trade fast: FPGA-based high-frequency trading using high-level synthesis," IEEE FPT 2017.

**Key Results:**
- Average round-trip latency: 270ns (42 clock cycles at 156.2 MHz)
- Best case: 36 cycles; Worst case: 62 cycles
- Platform: Xilinx Kintex UltraScale XCKU115 on Alpha Data 8K5 board
- All system blocks implemented in Vivado HLS 2016.3 using C++
- Resource utilization: <8% logic, ~22% BRAM, 0% DSP
- 10G Ethernet line rate
- Complete system: network stack + FAST protocol parser + order book + trading strategy + order gateway
- Demonstrated HLS as viable for HFT (vs. hand-coded RTL), with most FPGA resources left available for complex strategies

Sources:
- [IEEE Xplore](https://ieeexplore.ieee.org/document/8279781/)
- [ResearchGate](https://www.researchgate.net/publication/322943748_Build_fast_trade_fast_FPGA-based_high-frequency_trading_using_high-level_synthesis)
- [GitHub -- ECE1373 HFT on FPGA](https://github.com/mustafabbas/ECE1373_2016_hft_on_fpga)

### 5.3 "An FPGA-Based High-Frequency Trading System for 10 Gigabit Ethernet with a Latency of 433 ns"

**Key Results:**
- 433ns latency from market packet analysis to order packet triggering
- 25ns physical transceiver latency
- 10 Gb/s Ethernet throughput

Source: [IEEE Xplore](https://ieeexplore.ieee.org/document/9768065/)

### 5.4 "Low Latency Book Handling in FPGA for High Frequency Trading"

**Key Results:**
- Average latency: 253 nanoseconds for order book operations
- Supports 119,275 instruments simultaneously
- Uses only 144 Mbit QDR SRAM
- Cuckoo hashing for fast symbol lookup with high memory utilization

Source: [IEEE Xplore](https://ieeexplore.ieee.org/document/6868785/)

### 5.5 "FPGA for High-Frequency Trading: Reducing Latency in Financial Systems" (IEEE 2024)

**Key Results:**
- Average latency of 480 nanoseconds using FPGA hardware acceleration
- Significant improvement over CPU and GPU-based implementations

Source: [IEEE Xplore](https://ieeexplore.ieee.org/document/10841781/)

### 5.6 Additional Notable Papers

**"Speed vs. Efficiency: HFT Algorithms on FPGA Using Zynq SoC"** (2024):
- Optimized MACD architecture: 2.84 microsecond latency
- RSI architecture: 3.22 microsecond latency
- Platform: Xilinx Zynq SoC (ARM + FPGA hybrid)
- Source: [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S1110016824003119)

**"A FAST Hardware Decoder Optimized for Template Features"** (2023):
- Average latency: 0.72 microseconds
- Throughput: 1.4M FAST messages per second
- Real messages with average 85-byte size
- Source: [Springer](https://link.springer.com/article/10.1007/s11265-023-01850-2)

**"Building Low-Latency Order Books with Hybrid Binary-Linear Search on FPGAs"** (IEEE 2023):
- Hybrid data structure: linear for top-of-book, binary search for deeper levels
- Exploits observation that most activity occurs at top of bid/ask
- Source: [IEEE Xplore](https://ieeexplore.ieee.org/document/10296447/)

**"HLS Based Ultra-low Latency FAST Protocol Decoder"** (ACM 2021):
- Parallel FAST decoding compresses processing delay to <200ns
- Source: [ACM DL](https://dl.acm.org/doi/pdf/10.1145/3487075.3487150)

**"Exploring Reconfigurable Platforms for Order Book Update"** (Imperial College, FPL 2017):
- Fixed tick data structure mapped to hardware
- Customized cache storing top 5 price levels to reduce latency
- Hardware-friendly order book update algorithm
- Source: [Imperial College London (PDF)](https://www.doc.ic.ac.uk/~wl/papers/17/fpl17ch.pdf)

---

## 6. FAST/FIX Protocol

### 6.1 FIX Protocol Basics

FIX (Financial Information eXchange) is the standard messaging protocol for electronic trading. A FIX message consists of:

```
8=FIX.4.4|9=176|35=D|49=SENDER|56=TARGET|34=2|52=20240115-10:30:00|
11=ORDER123|21=1|55=AAPL|54=1|60=20240115-10:30:00|38=100|40=2|44=150.50|
10=128|
```

- **Tag=Value pairs** separated by SOH (0x01) delimiter
- **Header**: BeginString (8), BodyLength (9), MsgType (35)
- **Body**: Order-specific fields
- **Trailer**: Checksum (10)
- **MsgType 35=D**: New Order Single; 35=8: Execution Report; 35=0: Heartbeat

Human-readable but verbose and high-bandwidth.

### 6.2 FAST Protocol (FIX Adapted for STreaming)

FAST is a binary compression algorithm for market data feeds. Developed by the FIX Trading Community to reduce bandwidth and latency.

**Core Design Principles:**
1. **Template-based implicit tagging**: Field identity derived from position, not tags
2. **Stop bit encoding**: 7 data bits per byte, 8th bit signals end of field
3. **Presence Map (PMap)**: Bitmap indicating which optional fields are present
4. **Operator-based delta compression**: Only send what changed

#### Stop Bit Encoding Detail

```
Byte format: [S][D6][D5][D4][D3][D2][D1][D0]
  S = 0: more bytes follow
  S = 1: this is the last byte of the field

Example: encoding value 942 (0x3AE)
  Binary: 0000 0011 1010 1110
  Split into 7-bit groups: 0000111 0101110
  Byte 1: 0|0000111 = 0x07  (S=0, more follows)
  Byte 2: 1|0101110 = 0xAE  (S=1, last byte)
  Wire bytes: 0x07 0xAE
```

#### Field Operators

| Operator    | Behavior                                                | Wire Bytes When Applied |
|-------------|--------------------------------------------------------|------------------------|
| No Operator | Value always transmitted in full                       | Full value             |
| Constant    | Value never transmitted; hardcoded in template          | Zero (0 bytes)         |
| Copy        | If PMap bit=0, reuse previous value                    | Zero when unchanged    |
| Default     | If PMap bit=0, use template default; if 1, read value  | Zero when default      |
| Delta       | Transmit difference from previous value                | Typically 1-2 bytes    |
| Increment   | If PMap bit=0, previous+1 (e.g., sequence numbers)     | Zero when sequential   |
| Tail        | Append/replace suffix of previous string value         | Only changed suffix    |

#### Nullable Fields

- Unsigned int NULL: value 0 with stop bit
- Signed int NULL: value 0 with stop bit
- String NULL: single byte 0x80
- All optional fields can be NULL

#### FAST Template Structure (XML)

```xml
<template name="MDIncRefresh" id="97" xmlns="http://www.fixprotocol.org/ns/fast/td/1.1">
  <string name="ApplVerID" id="1128"><constant value="9"/></string>
  <string name="MessageType" id="35"><constant value="X"/></string>
  <uInt32 name="MsgSeqNum" id="34"><increment/></uInt32>
  <uInt64 name="SendingTime" id="52"/>
  <sequence name="MDEntries">
    <length name="NoMDEntries" id="268"/>
    <uInt32 name="MDUpdateAction" id="279"/>
    <decimal name="MDEntryPx" id="270"><delta/></decimal>
    <int32 name="MDEntrySize" id="271"/>
    <uInt32 name="SecurityID" id="48"><copy/></uInt32>
  </sequence>
</template>
```

#### Primitive Data Types

| Type           | Encoding                         | Nullable Representation |
|----------------|----------------------------------|------------------------|
| uInt32         | Stop-bit encoded, 7 bits/byte   | 0x80                   |
| int32          | Stop-bit encoded, sign-extended  | 0x80                   |
| uInt64         | Stop-bit encoded, up to 10 bytes| 0x80                   |
| int64          | Stop-bit encoded, sign-extended  | 0x80                   |
| Decimal        | Exponent (int32) + Mantissa (int64) | Null exponent       |
| ASCII String   | Stop-bit encoded characters      | 0x80                   |
| Unicode String | Length prefix + raw bytes         | Zero length            |
| Byte Vector    | Length prefix + raw bytes         | Zero length            |

### 6.3 Hardware FAST Decoding

**Decoding pipeline in FPGA:**

1. **Receive Ethernet frame** -- strip L2/L3/L4 headers
2. **Extract PMap** -- variable-length stop-bit field at message start
3. **Template lookup** -- identify template ID from first field
4. **Sequential field decode** -- process each field per template definition:
   - Check PMap bit for presence
   - Apply operator (copy/delta/increment)
   - Stop-bit decode if present
5. **Output decoded fields** to order book builder

**Challenge:** FAST's variable-length encoding makes parallel decoding difficult. The next field's start position depends on the current field's length. Research solutions include speculative parallel decoding (process all possible start offsets, select correct one post-hoc).

**Performance achievements:**
- Sequential FPGA decoder: ~720ns per message (1.4M msg/sec)
- Parallel speculative decoder: <200ns per message
- Software baseline: typically 2-10 microseconds per message

Sources:
- [FIX Trading Community -- FAST Online](https://www.fixtrading.org/standards/fast-online/)
- [JetTek FIX -- FAST Tutorial](https://jettekfix.com/education/fix-fast-tutorial/)
- [Columbia University -- FIX/FAST Hardware Decoding](https://www.cs.columbia.edu/~sedwards/classes/2013/4840/reports/FIX-FAST.pdf)
- [OnixS -- FAST Template Reference](https://ref.onixs.biz/net-core-fix-engine-guide/articles/fast-template.html)
- [MOEX -- FAST Protocol Specification v1.29.3 (2026)](https://ftp.moex.com/pub/FAST/Spectra/prod/docs/spectra_fastgate_en.pdf)

---

## 7. Order Book Data Structures in Hardware

### 7.1 Software vs Hardware Order Book Architectures

**Software (typical):**
- `std::map<Price, Level>` -- O(log N) insert/delete/lookup (red-black tree)
- Hash map for symbol lookup, tree for price levels
- Latency: 1-10 microseconds per operation

**Hardware approaches:**

#### Array-Based (Fixed Tick) Order Book

```
Concept: Price range divided into fixed-size ticks
  Index = (Price - BasePrice) / TickSize
  Direct array addressing: O(1) read/write

Example for AAPL (tick size = $0.01, range $100-$200):
  Array size = 10,000 entries
  Each entry: {quantity, order_count, timestamp}
  Bid top search: scan downward from last known top
  Ask top search: scan upward from last known top
```

- **Advantage:** O(1) insert/update by price, constant-time access
- **Disadvantage:** Memory proportional to price range, not active levels
- **Best for:** Instruments with small tick ranges (equities, futures)

#### CAM-Based (Content-Addressable Memory) Lookup

- CAM performs parallel search across all entries simultaneously
- Input: security ID / symbol -> Output: order book pointer
- O(1) lookup regardless of number of instruments
- FPGA TCAMs typically handle 1K-64K entries
- Used for symbol-to-book mapping, not price-level storage

#### Hybrid Binary-Linear Search (IEEE 2023)

- Linear data structure for top N levels (most active)
- Binary search for deeper book levels
- Exploits the empirical fact that >90% of activity occurs at top 5 bid/ask levels
- Custom cache stores top 5 levels for minimal latency access

### 7.2 Maintaining Sorted Bid/Ask in Hardware

**Price-Time Priority (FIFO at each price level):**

```
Bid Side (sorted descending):     Ask Side (sorted ascending):
  [0] Price=150.50 Qty=500         [0] Price=150.51 Qty=200
  [1] Price=150.49 Qty=300         [1] Price=150.52 Qty=150
  [2] Price=150.48 Qty=800         [2] Price=150.53 Qty=400
  ...                               ...
```

**Hardware insertion (maintaining sort):**

For a new bid at $150.49:
1. Compare new price against all levels in parallel (comparator array)
2. Shift entries below insertion point down by one (barrel shifter)
3. Insert new entry at correct position
4. All operations in 1-2 clock cycles using combinational logic

**Performance achieved:**
- 132-288 nanoseconds per order book operation (depending on book depth)
- 1.2-1.5 million messages per second at 10 Gb/s
- 90-157x faster than CPU-based solutions
- 253ns average across 119,275 instruments (Lockwood cuckoo-hash approach)

### 7.3 Market-by-Order (MBO) vs Market-by-Price (MBP)

| Aspect        | MBO                                | MBP                                |
|---------------|------------------------------------|------------------------------------|
| Data          | Individual orders with unique IDs  | Aggregated quantity per price level |
| Storage       | Hash map: OrderID -> {price, qty}  | Array: Price -> {agg_qty, count}   |
| Update        | Add/Modify/Delete by OrderID       | Update aggregate at price level    |
| Latency       | 2-step: find order, update level   | 1-step: direct price indexing      |
| Accuracy      | Full reconstruction possible       | Approximate queue position         |
| Use           | Nasdaq ITCH, CME MDP3              | Many exchanges                     |

Sources:
- [IEEE Xplore -- Low Latency Book Handling in FPGA](https://ieeexplore.ieee.org/document/6868785/)
- [IEEE Xplore -- Hybrid Binary-Linear Search Order Books on FPGAs](https://ieeexplore.ieee.org/document/10296447/)
- [Imperial College -- Reconfigurable Platforms for Order Book Update](https://www.doc.ic.ac.uk/~wl/papers/17/fpl17ch.pdf)
- [Columbia University -- HFT Book Builder (2024)](https://www.cs.columbia.edu/~sedwards/classes/2024/4840-spring/designs/HFT-Book-Builder.pdf)
- [AMD/Xilinx -- Order Book IP](https://www.xilinx.com/products/intellectual-property/1-1k1lg1b.html)

---

## 8. IMC Trading -- FPGA Perspective

### 8.1 IMC's FPGA Philosophy

IMC Trading is one of the world's largest market-making firms, and they maintain **one of the largest dedicated FPGA engineering setups in the trading industry**. Key points from their published articles:

**Build vs. Buy:**
- IMC builds FPGA trading infrastructure in-house rather than purchasing off-the-shelf solutions
- Hardware engineers work "in lockstep with software engineers and traders, carefully dissecting trading algorithms into the pieces that are best suited for hardware versus software"
- The decision of what runs on FPGA vs CPU is deliberate and ongoing

**The Core Trade-off:**
- "A software developer can write code in a software language and know within seconds whether it works, and so deploy it quickly. However, the code will have to go through several abstraction layers and generic hardware components."
- "As an FPGA engineer, it may take two to three hours of compilation time before you know whether your adjustment will result in the outcome you want. However, you can increase performance at the cost of more engineering time."
- FPGAs: slow to develop, fast to execute
- Software: fast to develop, slow (relatively) to execute

**Why FPGAs (not ASICs):**
- FPGAs occupy a "middle ground" -- significantly faster than CPUs while remaining more flexible than ASICs
- Trading strategies change frequently; ASIC inflexibility is unacceptable
- "CPUs are burdened by surplus hardware that would otherwise slow you down"
- FPGAs contain "thousands, sometimes even millions, of core logic blocks (CLBs)" that can be "configured and combined to process any task"

**History and Scale:**
- IMC began working with FPGA-based trading systems "more than a decade ago" (pre-2014)
- Continuously exploring and developing the technology
- Systems handle critical market-making functions: pricing instruments and reacting to market changes with fair bids and offers

### 8.2 Industry-Wide Build vs Buy Landscape

| Approach    | Firms                              | Pro                              | Con                              |
|------------|-------------------------------------|----------------------------------|----------------------------------|
| Build      | IMC, Citadel, Jump, Two Sigma       | Maximum customization, edge      | $5M+ and 3+ years to deploy     |
| Buy        | Many mid-tier firms                 | Fast deployment, lower upfront   | Same tech as competitors         |
| Hybrid     | Some prop shops                     | Custom strategy on vendor stack  | Integration complexity           |

Commercial FPGA trading platforms include:
- **Exegy Nexus**: <2.0us tick-to-trade, <350ns raw triggers, launching Q4 2025
- **Magmio**: nanosecond-level, supports Cisco Nexus and AMD Alveo cards
- **Algo-Logic**: sub-microsecond tick-to-trade SDK
- **Enyx (nxAccess)**: turnkey FPGA market access
- **MBOChip**: FPGA order book technology

Sources:
- [IMC Trading -- How are FPGAs used in trading?](https://www.imc.com/us/articles/how-are-fpgas-used-in-trading)
- [IMC Trading -- Combining Hardware and Software](https://www.imc.com/ap/articles/combining-both-hardware-and-software-at-imc)
- [IMC Trading -- Hardware Engineering](https://www.imc.com/us/what-we-do/technology/hardware-engineering)
- [Exegy -- Ultra-Low Latency Infrastructure](https://www.exegy.com/ultra-low-latency-infrastructure/)
- [Magmio -- FPGA Trading System](https://www.magmio.com/product)

---

## 9. Colocation Infrastructure

### 9.1 Major Exchange Data Center Locations

| Exchange Group | Data Center Location          | Notable Details                       |
|---------------|-------------------------------|---------------------------------------|
| NYSE/ICE      | Mahwah, NJ (USLC)           | ~400,000 sq ft, opened 2010          |
| Nasdaq        | Carteret, NJ                  | Primary matching engine location      |
| CME Group     | Aurora, IL                    | 49 miles SW of downtown Chicago       |
| CBOE          | Secaucus, NJ                  | EDGX, BZX, BYX matching engines      |
| TMX (Canada)  | Markham, ON                   | Toronto Stock Exchange                |

### 9.2 Cross-Connect and Cable Equalization

**NYSE Mahwah (ICE US Liquidity Center -- USLC):**

- All Liquidity Center Network (LCN) connections are **normalized** to ensure equal fiber length regardless of customer cabinet location within the colocation halls
- All customer-to-customer Local Cross-Connect (LCX) connections are normalized
- Connections tested via **Optical Backscatter Reflectometry (OBR)** during delivery
- "A foot of cable equates to one nanosecond's difference"
- LCN provides the lowest latency path to NYSE Group trading systems and proprietary market data
- Harmonized cabling (equal cable lengths) between ICE network equipment and each customer cabinet

**CBOE Latency Equalization:**
- CBOE implements explicit latency equalization across all co-located participants

Sources:
- [ICE Global Network & Colocation Mahwah Technical Specs (2026)](https://www.theice.com/publicdocs/IGN_Colocation_Mahwah_Technical_Specs.pdf)
- [NYSE Colocation Technical Specs (2024)](https://www.nyse.com/publicdocs/IGN_Colocation_Mahwah_Technical_Specs.pdf)
- [CBOE Latency Equalization (PDF)](https://cdn.cboe.com/resources/membership/Cboe_LE.pdf)
- [Strategy and Rest -- Equalizing Distance to Obliterate Time in HFT](https://www.strategy.rest/?p=1305)

### 9.3 Long-Haul Connectivity: Microwave vs Fiber

**Chicago (Aurora, IL) to New Jersey (Mahwah/Secaucus/Carteret):**

| Medium      | One-Way Latency | Round-Trip       | Speed Factor        | Notes                          |
|-------------|----------------|------------------|---------------------|--------------------------------|
| Fiber optic | ~6.5ms         | ~13.0ms          | ~204 km/ms in glass | Refraction index ~1.47         |
| Microwave   | ~3.9-4.0ms     | ~7.8-8.2ms       | ~299 km/ms in air   | Near speed of light in vacuum  |
| Theoretical | ~3.86ms        | ~7.72ms          | Speed of light      | Straight-line distance ~1156km |

**Latency per mile:**
- Microwave: ~5.4 microseconds/mile (through air, near c)
- Fiber: ~8.01 microseconds/mile (due to refractive index ~1.47)

### 9.4 Microwave / Laser Link Providers

**McKay Brothers (founded ~2012):**
- Aurora to Secaucus NY2: 7.83ms round trip
- Aurora to Secaucus NY4: 7.84ms round trip
- Aurora to Carteret: 7.82ms round trip
- Aurora to CTS NJ3 (Piscataway): 7.98ms round trip
- New Jersey to Toronto (Markham): <1.754ms one-way
- Also operates London LD4 to Stockholm STO01 route
- Subsidiary: **Quincy Data** -- market data distribution service

**Other notable providers:**
- **Spread Networks**: Built dedicated Chicago-NY fiber in 2010, achieved 13.1ms -> 12.98ms RTT
- **Jump Trading**: Built own microwave tower network
- **Anova Technologies**: Microwave and millimeter-wave links

### 9.5 Colocation Costs

| Item                                   | Approximate Cost                 |
|---------------------------------------|----------------------------------|
| NYSE Mahwah: 8-rack unit (partial cab) | ~$2,500/month                    |
| NYSE Mahwah: 1 kW power add-on        | ~$1,500/month                    |
| Full cabinet at major exchange         | $5,000-$20,000+/month            |
| Cross-connect (fiber pair)             | $200-$500/month                  |
| Proximity hosting near CME Aurora      | From $89/month (third-party)     |
| McKay Brothers microwave link          | Estimated $10,000-$50,000+/month |
| Building in-house FPGA trading infra   | $5M+ and 3+ years of engineering |

Sources:
- [McKay Brothers Media](https://mckay-brothers.com/media)
- [McKay Brothers -- Lowest Latency NJ to Toronto](https://www.mckay-brothers.com/mckay-brothers-now-lowest-latency-between-new-jersey-and-toronto/)
- [Spread Networks -- Wikipedia](https://en.wikipedia.org/wiki/Spread_Networks)
- [Nasdaq-CME Microwave FAQ (PDF)](https://www.nasdaqtrader.com/content/productsservices/trading/colo/nasdaqcmemicrowavefaqs.pdf)
- [Databento -- Where is the CME Matching Engine?](https://databento.com/blog/cme-colocation)
- [NetSource -- Chicago Financial Hosting](https://www.netsource.com/web-hosting/chicago-financial-hosting/)

---

## 10. Current Tick-to-Trade Latency Numbers

### 10.1 Definition

**Tick-to-trade latency** = time from last bit (EOF) of inbound market data message to last bit (EOF) of outbound order message, measured at the wire using binary protocols (ITCH, OUCH, SBE, FIX Binary).

Important caveat: Industry measurements typically exclude strategy computation time, so reported numbers can be misleading for strategies with complex alpha signals.

Source: [Databento -- What is tick-to-trade latency?](https://databento.com/microstructure/tick-to-trade)

### 10.2 Achievable Latency by Technology

| Technology                          | Tick-to-Trade Latency    | Notes                                   |
|-------------------------------------|--------------------------|------------------------------------------|
| Software (optimized C++ on Linux)   | ~2 microseconds          | With kernel bypass (OpenOnload/DPDK)     |
| Software (unoptimized)              | 10-50 microseconds       | Standard network stack                   |
| FPGA (commercial turnkey)           | <2.0 microseconds        | Exegy Nexus UBBO-triggered trades        |
| FPGA (commercial raw signal)        | <350 nanoseconds         | Exegy Nexus raw triggers                 |
| FPGA (academic, Boutros et al.)     | 270 nanoseconds avg      | HLS-based, Kintex UltraScale             |
| FPGA (academic, 10G system)         | 433 nanoseconds          | Custom RTL                               |
| FPGA (industry best-in-class)       | Single-digit nanoseconds | As of 2024, per Databento                |
| CPU (PYNQ educational)              | <450 nanoseconds         | Simplified strategy                      |

### 10.3 Per-Stage Latency Budget (FPGA Pipeline)

Based on published architectures and the Shailesh Nair analysis (Xilinx Virtex UltraScale+):

| Pipeline Stage               | Typical Latency | Description                                    |
|------------------------------|----------------|------------------------------------------------|
| NIC/PHY Receive              | ~10 ns         | Ethernet ingress, SerDes deserialization        |
| Kernel Bypass                | ~15 ns         | Direct FPGA access, skip OS network stack       |
| Protocol Parsing (ITCH)      | 20-25 ns       | Decode market data message type and fields      |
| Order Book Update            | 30-40 ns       | Insert/modify/delete at price level             |
| Signal Generation / Strategy | ~45 ns         | Statistical arbitrage, spread calculation       |
| Risk Management              | ~20 ns         | Position limits, credit checks (runs in parallel)|
| Order Gateway / Formatting   | ~50 ns         | Construct exchange-specific order message        |
| NIC/PHY Transmit             | ~100 ns        | Ethernet egress, SerDes serialization            |
| **Total Pipeline**           | **150-300 ns** | End-to-end, depending on strategy complexity    |

**Key architectural techniques:**
- **Pipeline parallelism**: Different packets process through stages simultaneously; new output every clock cycle despite multi-cycle stages
- **Speculative execution**: All message-type decoders run in parallel; correct result selected post-hoc, eliminating conditional branching latency
- **Parallel risk checks**: Risk validation runs concurrently with order formatting, not sequentially

### 10.4 NASDAQ ITCH Feed Processing Benchmark

(Xilinx Virtex UltraScale+ platform):
- Input: 8.5M messages/second peak, 3.4 Gbps throughput
- Parsing latency: 20-25ns per message
- Order book update: 30-40ns per message
- Pipeline latency: 100-150ns
- Throughput achieved: 8.3M messages/sec processed
- Resource utilization: 35% LUTs, 25% BRAMs

Source: [Medium -- FPGA Acceleration in HFT](https://medium.com/@shailamie/fpga-acceleration-in-hft-architecture-and-implementation-68adab59f7af)

### 10.5 Protocols Used in Ultra-Low-Latency Trading

| Protocol    | Direction       | Format         | Typical Use                        |
|-------------|----------------|----------------|-------------------------------------|
| ITCH        | Market -> Firm  | Binary         | Nasdaq TotalView full depth-of-book |
| OUCH        | Firm -> Market  | Binary         | Nasdaq order entry                  |
| FIX/FAST    | Market -> Firm  | Compressed     | CME, international market data      |
| SBE         | Both            | Binary         | CME iLink, London Stock Exchange    |
| FIX (text)  | Both            | Tag=Value text | Slower, used for non-latency-sensitive |
| BOE         | Firm -> Market  | Binary         | CBOE order entry                    |

### 10.6 What the Fastest Firms Achieve

As of 2024-2025:
- Top-tier proprietary trading firms (Citadel Securities, Jump Trading, IMC, Virtu) achieve **sub-100 nanosecond** tick-to-trade for simple strategies
- The race has shifted from microseconds to nanoseconds since ~2015
- At sub-500ns latency, firms can access order-queue placement signals on certain exchanges, providing a measurable alpha advantage
- Moving from software to FPGA delivers ~500ns improvement -- a "massive leap in trading terms"
- Building competitive in-house FPGA infrastructure requires $5M+ and 3+ years of engineering investment (single-region deployment)

### 10.7 Measurement Tools and Hardware

| Tool / Product     | Purpose                                              |
|-------------------|------------------------------------------------------|
| Corvil             | Network analytics and latency measurement            |
| FMADIO             | Full-line-rate packet capture (100G)                 |
| Endace             | Hardware-timestamped packet capture                  |
| Napatech           | SmartNIC with timestamping                           |
| Arista 7130        | Switch with FPGA for in-line processing              |
| Solarflare/Xilinx  | XtremeScale NICs with kernel bypass (OpenOnload)     |
| AMD Alveo UL3524   | FPGA accelerator card for trading                    |
| Cisco Nexus SmartNIC| V9P, V5P, K3P series with FPGA                      |

Sources:
- [Databento -- Tick-to-Trade](https://databento.com/microstructure/tick-to-trade)
- [Exegy -- Ultra-Low Latency Infrastructure](https://www.exegy.com/ultra-low-latency-infrastructure/)
- [Algo-Logic -- FPGA Tick-To-Trade](https://www.algo-logic.com/fpga-tick-to-trade)
- [Design Gateway -- Ultra-Low-Latency FPGA Trading with ITCH & OUCH](https://dgway.com/blog_E/2025/12/18/ultra-low-latency-fpga-trading-with-nasdaq-developed-itch-ouch/)
- [Supermicro/Algo-Logic -- T2T Solution Brief (PDF)](https://www.supermicro.com/solutions/Solution_Brief_Algo-Logic_T2T.pdf)

---

## Summary of Key Numbers for Course Content

| Metric                                | Value                         | Source                        |
|---------------------------------------|-------------------------------|-------------------------------|
| Versal VC1902 LUTs                    | 899,840                       | AMD Datasheet                 |
| Versal VC1902 AI Engine Tiles         | 400                           | AMD/Hot Chips 31              |
| Versal VP1902 LUTs                    | 8,460,288                     | AMD Product Brief             |
| Agilex 7 F-Series max LEs            | 2,692,760                     | Intel Specs                   |
| Agilex 7 max embedded memory          | 287 Mb (M20K)                 | Intel Specs                   |
| ASIC 7nm design cost                  | $217-249M average             | IBS / SemiEngineering         |
| ASIC 5nm tapeout cost                 | $40-50M                       | Industry estimates            |
| ASIC vs FPGA breakeven volume         | ~400K units                   | AnySilicon                    |
| Lockwood HOTI 2012 latency            | 1 microsecond @ 10G           | IEEE HOTI 2012                |
| Boutros HLS tick-to-trade             | 270ns average (42 cycles)     | IEEE FPT 2017                 |
| Best published FPGA T2T               | 433ns                         | IEEE 2022                     |
| FPGA order book latency               | 253ns (119K instruments)      | IEEE 2014                     |
| FAST decoder (sequential FPGA)        | 720ns, 1.4M msg/sec           | Springer 2023                 |
| FAST decoder (parallel FPGA)          | <200ns                        | ACM 2021                      |
| Microwave Chicago-NJ RTT              | ~7.8-8.2ms                    | McKay Brothers                |
| Fiber Chicago-NJ RTT                  | ~13.0ms                       | Spread Networks               |
| Theoretical straight-line RTT         | ~7.72ms                       | Speed of light                |
| NYSE Mahwah colo cost                 | ~$2,500/month (8-rack unit)   | Industry data                 |
| Software T2T (kernel bypass)          | ~2 microseconds               | Databento                     |
| FPGA T2T (industry best)              | Single-digit nanoseconds      | Databento 2024                |
| 1 foot of cable                       | 1 nanosecond latency          | NYSE/ICE                      |
