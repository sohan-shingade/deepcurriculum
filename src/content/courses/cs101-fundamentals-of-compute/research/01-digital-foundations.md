# Digital Foundations -- Research Notes

> Compiled March 2026. All specifications sourced from manufacturer disclosures, IEEE standards documents, academic course materials, and semiconductor industry publications. Intended as reference material for lecture content writers.

---

## 1. Current Transistor Technology Nodes

### 1.1 TSMC 3nm Family (N3B / N3E / N3P / N3X) -- FinFET

TSMC's 3nm family remains on the FinFET architecture (not GAA). TSMC transitions to GAA only at the N2 node.

| Specification | N3B | N3E | N3P | N3X |
|---|---|---|---|---|
| Contacted gate pitch | 48 nm | 48 nm | 48 nm | 48 nm |
| Contacted poly pitch | ~48 nm | 48 nm | 48 nm | 48 nm |
| Minimum metal pitch (M1) | 23 nm | 23 nm | 23 nm | 23 nm |
| Fin pitch | -- | 26 nm | 26 nm | -- |
| SRAM cell area (HD) | 0.0199 um^2 | 0.021 um^2 | ~0.020 um^2 | -- |
| Logic density (est.) | ~291 MTr/mm^2 (theoretical) | ~250 MTr/mm^2 | ~260 MTr/mm^2 | -- |
| Transistor density (real chip mix) | ~200 MTr/mm^2 | ~200 MTr/mm^2 | ~224 MTr/mm^2 | -- |

**Performance vs N5:**
- N3B: +10-15% speed at iso-power, or -25-35% power at iso-speed, 1.7x logic density
- N3E: Improved manufacturability over N3B, similar PPA with relaxed design rules
- N3P: +4% density over N3E, +5% speed or -5-10% power improvement
- N3X: High-performance variant targeting max clock speeds (e.g., HPC/data center)

**Production timeline:**
- N3B: H2 2022 (risk), HVM 2023 (Apple A17 Pro first customer)
- N3E: HVM 2023-2024
- N3P: HVM 2024-2025
- N3X: HVM 2025

Sources:
- [TSMC N3 Family Variants Explained](https://cyberraiden.wordpress.com/2026/03/11/tsmc-n3-family-3nm-class-process-technologies-variants-explained-n3b-n3e-n3p-n3x-architecture-innovations-and-trade-offs/)
- [3nm process -- Wikipedia](https://en.wikipedia.org/wiki/3_nm_process)
- [TSMC Reveals 3nm Process Details -- TechInsights](https://www.techinsights.com/blog/tsmc-reveals-3nm-process-details)
- [IEDM 2022 -- TSMC 3nm -- SemiWiki](https://semiwiki.com/semiconductor-manufacturers/tsmc/322688-iedm-2022-tsmc-3nm/)

### 1.2 TSMC 2nm (N2) -- First TSMC GAA (Nanosheet)

N2 is TSMC's first commercial Gate-All-Around (GAA) nanosheet transistor process, marking the transition from FinFET.

| Specification | N2 | N2P (enhanced) |
|---|---|---|
| Transistor type | GAA nanosheet | GAA nanosheet + BSPDN |
| Contacted gate pitch | 48 nm | 48 nm |
| SRAM density | 38.1 Mb/mm^2 (HD bitcell 0.021 um^2) | -- |
| Logic density | ~350 MTr/mm^2 (est.) | ~370+ MTr/mm^2 (est.) |
| Chip density vs N3E | +15% (mixed designs) | +15-20% |

**Performance vs N3E:**
- +15% speed at iso-power
- -25-35% power reduction at iso-speed
- 1.15x chip density improvement

**Key innovations:**
- GAA nanosheet FETs: gate wraps fully around the channel for superior electrostatic control
- All-new MoL/BEOL/far-BEOL wiring with 20% lower resistance
- Barrier-free tungsten wiring at MoL reduces VG contact resistance by 55%
- EUV single-patterning on M1 (1P1E) cuts cell capacitance by ~10%
- N2P adds backside power delivery network (BSPDN)
- First fully functional CFET inverter demonstrated at 48nm gate pitch (IEDM 2024)

**Production timeline:**
- N2: Volume production began late 2025
- N2P: 2026 volume production
- N2X: High-performance variant, 2027+

Sources:
- [TSMC N2 Technology -- IEEE Spectrum](https://spectrum.ieee.org/tsmc-n2)
- [2nm process -- Wikipedia](https://en.wikipedia.org/wiki/2_nm_process)
- [TSMC 2nm IEDM 2024 details -- Tom's Hardware](https://www.tomshardware.com/tech-industry/tsmc-shares-deep-dive-details-about-its-cutting-edge-2nm-process-node-at-iedm-2024-35-percent-less-power-or-15-percent-more-performance)
- [TSMC begins 2nm volume production -- Tom's Hardware](https://www.tomshardware.com/tech-industry/semiconductors/tsmc-begins-quietly-volume-production-of-2nm-class-chips-first-gaa-transistor-for-tsmc-claims-up-to-15-percent-improvement-at-iso-power)
- [TSMC 38.1Mb/mm^2 SRAM in N2](https://research.tsmc.com/page/memory/4.html)

### 1.3 Intel 18A / 20A

Intel 20A was originally planned but cancelled as a cost-cutting measure. Intel 18A is the company's flagship advanced node.

| Specification | Intel 18A |
|---|---|
| Transistor type | RibbonFET (GAA) + PowerVia (BSPDN) |
| Transistor density | ~238 MTr/mm^2 |
| Density vs Intel 3 | 1.3x (PowerVia contributes 8-10% of this) |
| Performance vs Intel 3 | +15% performance/watt, or +25% speed |
| Power reduction | -36% at iso-performance |

**Key technologies:**
- **RibbonFET**: Intel's GAA implementation using four vertically stacked nanosheets fully surrounded by the gate. First productized combination of GAA + BSPDN in the industry.
- **PowerVia**: Backside power delivery network. Moves power wiring to the back of the wafer, freeing front-side metal layers for signal routing. Provides 8-10% density gain and significant IR-drop reduction.

**Production timeline:**
- Risk production tapeout: late 2024
- High-volume manufacturing (HVM): announced January 30, 2026
- Yields reaching industry-standard levels: expected 2027

Sources:
- [Intel 18A -- official page](https://www.intel.com/content/www/us/en/foundry/process/18a.html)
- [Intel details 18A -- Tom's Hardware](https://www.tomshardware.com/tech-industry/semiconductors/intel-details-18a-process-technology-boosts-performance-by-25-percent-or-lowers-power-consumption-by-36-percent)
- [Intel 18A Process Technology Wiki -- SemiWiki](https://semiwiki.com/wikis/industry-wikis/intel-18a-process-technology-wiki/)
- [Intel 18A HVM announcement](https://markets.financialcontent.com/stocks/article/tokenring-2026-2-5-intel-officially-launches-high-volume-manufacturing-for-18a-node-fulfilling-5-nodes-in-4-years-promise)

### 1.4 Samsung 3nm GAA (SF3E / SF3)

Samsung was the first foundry to ship GAA transistors at the 3nm node (June 2022), using its proprietary MBCFET (Multi-Bridge-Channel FET) architecture.

| Specification | SF3E (1st gen) | SF3 (2nd gen) |
|---|---|---|
| Transistor type | GAA MBCFET | GAA MBCFET |
| Gate pitch | ~45 nm | ~45 nm |
| Metal pitch | ~36 nm (from 5nm node) | -- |
| Transistor density | ~170 MTr/mm^2 | ~190 MTr/mm^2 |

**Performance vs Samsung 4nm (SF4):**
- SF3: +22% performance at iso-power
- SF3: -34% power at iso-speed
- SF3: 0.79x logic area reduction

**MBCFET vs FinFET:**
In GAA/MBCFET, the gate fully surrounds the channel using horizontal nanosheets instead of wrapping around a fin. This provides superior electrostatic control, reduced leakage, improved drive current, and better short-channel effect suppression.

Sources:
- [Samsung 3nm GAA newsroom](https://news.samsung.com/global/samsung-begins-chip-production-using-3nm-process-technology-with-gaa-architecture)
- [Samsung 3nm MBCFET deep dive](https://cyberraiden.wordpress.com/2026/03/12/samsungs-3nm-process-mbcfet-gate-all-around-transistors-architecture-variants-and-key-advantages-over-finfet/)
- [Samsung Logic Node page](https://semiconductor.samsung.com/foundry/process-technology/logic-node/)
- [Samsung 3nm GAAFET -- WikiChip Fuse](https://fuse.wikichip.org/news/6932/samsung-3nm-gaafet-enters-risk-production-discusses-next-gen-improvements/)

### 1.5 Competitive Summary Table (as of early 2026)

| Node | Foundry | Architecture | Density (MTr/mm^2) | Gate Pitch | Production |
|---|---|---|---|---|---|
| N3P | TSMC | FinFET | ~224 | 48 nm | HVM 2024-25 |
| N2 | TSMC | GAA nanosheet | ~350 (est.) | 48 nm | HVM late 2025 |
| 18A | Intel | RibbonFET + PowerVia | ~238 | -- | HVM 2026 |
| SF3 | Samsung | GAA MBCFET | ~190 | ~45 nm | HVM 2024 |
| SF2 | Samsung | GAA MBCFET (2nm) | ~231 | -- | 2025-26 |

---

## 2. MOSFET Operation Equations

### 2.1 Threshold Voltage

The threshold voltage $V_{th}$ with body effect is:

$$V_{th} = V_{th0} + \gamma \left( \sqrt{|2\phi_F + V_{SB}|} - \sqrt{|2\phi_F|} \right)$$

Where:
- $V_{th0}$: Zero-bias threshold voltage (typically 0.3-0.7 V for modern processes; lower for LVT cells, higher for HVT)
- $\gamma$: Body effect coefficient = $\frac{t_{ox}}{\varepsilon_{ox}} \sqrt{2 q \varepsilon_{Si} N_A}$ (typical range: 0.3-0.5 $V^{1/2}$)
- $\phi_F$: Fermi potential $\approx \frac{kT}{q} \ln\left(\frac{N_A}{n_i}\right)$ (approximately 0.3-0.4 V at room temperature; surface potential $2\phi_F \approx 0.6$ V)
- $V_{SB}$: Source-to-body (substrate) voltage
- $q$: Electron charge ($1.6 \times 10^{-19}$ C)
- $\varepsilon_{Si}$: Silicon permittivity ($\approx 1.04 \times 10^{-12}$ F/cm)
- $N_A$: Acceptor doping concentration (typical: $10^{15}$ to $10^{18}$ cm$^{-3}$)

**Physical meaning:** When $V_{SB} > 0$, the depletion region widens, requiring more gate charge to reach inversion. The threshold voltage increases. This is the "body effect" -- the substrate voltage modulates the channel.

### 2.2 Drain Current -- Linear (Triode) Region

When $V_{DS} < V_{GS} - V_{th}$ (channel not pinched off):

$$I_D = \mu_n C_{ox} \frac{W}{L} \left[ (V_{GS} - V_{th}) V_{DS} - \frac{V_{DS}^2}{2} \right]$$

For very small $V_{DS}$ (deep linear region), this simplifies to:

$$I_D \approx \mu_n C_{ox} \frac{W}{L} (V_{GS} - V_{th}) V_{DS}$$

The MOSFET behaves as a voltage-controlled resistor with on-resistance:

$$R_{on} = \frac{1}{\mu_n C_{ox} (W/L)(V_{GS} - V_{th})}$$

### 2.3 Drain Current -- Saturation Region

When $V_{DS} \geq V_{GS} - V_{th}$ (channel pinched off at drain):

$$I_D = \frac{1}{2} \mu_n C_{ox} \frac{W}{L} (V_{GS} - V_{th})^2 (1 + \lambda V_{DS})$$

Where:
- $\mu_n$: Electron mobility in channel (typical: 200-500 cm$^2$/V-s for NMOS; ~100-200 cm$^2$/V-s for PMOS, though $\mu_p$ is used)
- $C_{ox}$: Gate oxide capacitance per unit area = $\varepsilon_{ox}/t_{ox}$ (typical: $\sim 10^{-7}$ to $10^{-6}$ F/cm$^2$ depending on process)
- $W/L$: Channel width-to-length ratio (the primary transistor sizing knob)
- $\lambda$: Channel-length modulation parameter (typical: 0.01-0.1 V$^{-1}$; smaller $L$ gives larger $\lambda$)

**Example calculation with realistic values:**
- $\mu_n = 400$ cm$^2$/V-s, $C_{ox} = 1.7 \times 10^{-7}$ F/cm$^2$
- $W/L = 10$, $V_{GS} = 1.0$ V, $V_{th} = 0.4$ V, $\lambda = 0$
- $I_D = \frac{1}{2}(400)(1.7 \times 10^{-7})(10)(0.6)^2 = 122$ $\mu$A

The product $k_n = \mu_n C_{ox}$ is called the process transconductance parameter (typical: $\sim 50$-$200$ $\mu$A/V$^2$ for older nodes; higher for modern short-channel devices).

### 2.4 Modern Device Considerations

These "square-law" equations are the classical long-channel model. In modern devices at 7nm and below:
- **Velocity saturation** makes $I_D$ more linear than quadratic in $(V_{GS} - V_{th})$
- **Drain-Induced Barrier Lowering (DIBL)** reduces $V_{th}$ as $V_{DS}$ increases
- **Quantum-mechanical effects** (carrier confinement, tunneling) become significant
- **FinFET/GAA geometry** changes the effective $W$ and gate coupling
- **BSIM-CMG** and other compact models replace square-law for design work

Sources:
- [Threshold voltage -- Wikipedia](https://en.wikipedia.org/wiki/Threshold_voltage)
- [Body Effect -- U of Toronto](https://www.eecg.utoronto.ca/~johns/ece331/lecture_notes/07b_bodyEffect.pdf)
- [MOSFET Device Equations -- Georgia Tech](https://leachlegacy.ece.gatech.edu/ece3050/notes/mosfet/mosfet2Rev.pdf)
- [MOSFET -- Wikipedia](https://en.wikipedia.org/wiki/MOSFET)
- [Berkeley MOSFET Ch.7 -- Prof. Chenming Hu](https://www.chu.berkeley.edu/wp-content/uploads/2020/01/Chenming-Hu_ch7.pdf)

---

## 3. CMOS Power Equations

### 3.1 Dynamic Power

$$P_{dynamic} = \alpha C_L V_{DD}^2 f$$

Where:
- $\alpha$: Switching activity factor (probability a node transitions per clock cycle)
  - Clock signal: $\alpha = 1$ (transitions every cycle)
  - Typical combinational logic: $\alpha \approx 0.1$-$0.3$
  - Data bus (random data): $\alpha \approx 0.5$
- $C_L$: Load capacitance being charged/discharged (includes gate cap of fanout, wire cap, diffusion cap)
- $V_{DD}$: Supply voltage
  - 7nm: ~0.75 V
  - 5nm: ~0.70-0.75 V
  - 3nm: ~0.65-0.75 V
  - 2nm: ~0.60-0.70 V (projected)
- $f$: Clock frequency

**Example:** For a 3nm processor core at 4 GHz with $\alpha = 0.15$, $C_{total} = 10$ nF, $V_{DD} = 0.7$ V:
$$P_{dyn} = 0.15 \times 10 \times 10^{-9} \times (0.7)^2 \times 4 \times 10^9 = 2.94 \text{ W}$$

The switching activity has two components:
- **UDSA (Useful Data Switching Activity)**: transitions that perform computation
- **RSSA (Redundant/Spurious Switching Activity)**: glitches from unequal path delays; can account for 15-30% of dynamic power

**Key insight:** Dynamic power scales with $V_{DD}^2$, which is why voltage scaling has been the primary lever for power reduction. However, below ~0.5 V, performance degrades rapidly and variability dominates.

### 3.2 Short-Circuit (Crowbar) Power

$$P_{SC} = \alpha \cdot I_{SC} \cdot V_{DD} \cdot f$$

During signal transitions, both PMOS and NMOS can be momentarily on, creating a direct path from $V_{DD}$ to ground. This typically accounts for 5-15% of dynamic power and is minimized by keeping input rise/fall times shorter than output rise/fall times.

### 3.3 Static / Leakage Power

$$P_{leakage} = V_{DD} \cdot I_{leakage}$$

Leakage has multiple components:

**Subthreshold leakage** (dominant in most modern designs):
$$I_{sub} = I_0 \cdot e^{(V_{GS} - V_{th}) / (n \cdot V_T)} \cdot \left(1 - e^{-V_{DS}/V_T}\right)$$

Where $V_T = kT/q \approx 26$ mV at room temperature, and $n$ is the subthreshold swing coefficient (typically 1.0-1.5).

Subthreshold leakage increases exponentially as $V_{th}$ decreases. A 100 mV reduction in $V_{th}$ increases subthreshold leakage by roughly 10x.

**Gate oxide tunneling leakage:**
$$I_{gate} \propto \left(\frac{V_{ox}}{t_{ox}}\right)^2 \cdot e^{-B \cdot t_{ox} / V_{ox}}$$

At oxide thicknesses below 3 nm, gate leakage reaches the same order of magnitude as subthreshold leakage. Modern high-k dielectrics (HfO2) dramatically reduce this by allowing physically thicker oxides with the same capacitance.

**Junction (BTBT) leakage:**
Band-to-band tunneling at reverse-biased drain junctions. Significant at high doping concentrations and narrow bandgap.

### 3.4 Leakage as Fraction of Total Power at Advanced Nodes

Leakage has been a growing concern as transistors shrink:

| Node | Approximate leakage % of total power | Notes |
|---|---|---|
| 28nm (planar) | 30-40% | Peak of planar leakage crisis |
| 16/14nm (FinFET) | 15-25% | FinFET dramatically improved gate control |
| 7nm | 20-30% | Leakage crept back up with scaling |
| 5nm | 25-35% | FinFET gate control weakening at this scale |
| 3nm (FinFET) | 30-40% | FinFET nearing limits; Samsung moved to GAA here |
| 3nm (GAA) | 20-30% | GAA recovers control (Samsung SF3) |
| 2nm (GAA) | 20-30% | Further GAA improvements expected |

At 7nm and below, static leakage has become problematic again and the power/performance benefits have started to diminish for FinFET. The 3-sided gate control of FinFET weakens as fins get narrower, which is the primary driver for the transition to GAA at 3nm (Samsung) and 2nm (TSMC, Intel).

**Total chip power:**
$$P_{total} = P_{dynamic} + P_{short-circuit} + P_{leakage}$$
$$P_{total} = \alpha C_L V_{DD}^2 f + P_{SC} + V_{DD} \cdot (I_{sub} + I_{gate} + I_{BTBT})$$

Sources:
- [CMOS Power Calculation -- Cadence](https://resources.pcb.cadence.com/blog/2023-cmos-power-calculation)
- [Power Consumption in CMOS Circuits -- IntechOpen](https://www.intechopen.com/chapters/82415)
- [Power and Performance Optimization at 7/5/3nm -- SemiEngineering](https://semiengineering.com/power-and-performance-optimization-at-7-5-3nm/)
- [5nm vs. 3nm -- SemiEngineering](https://semiengineering.com/5nm-vs-3nm/)
- [Leakage in CMOS Circuits -- Springer](https://link.springer.com/chapter/10.1007/978-3-540-30205-6_5)
- [CMU Lecture -- CMOS Power Consumption](https://course.ece.cmu.edu/~ece322/LECTURES/Lecture13/Lecture13.03.pdf)
- [UC Davis EEC 216 -- Power Dissipation](https://www.ece.ucdavis.edu/~ramirtha/EEC216/W08/lecture1_updated.pdf)

---

## 4. Nand2Tetris Course Structure

**Course:** "From NAND to Tetris: Building a Modern Computer from First Principles"
**Authors:** Noam Nisan and Shimon Schocken
**Website:** [nand2tetris.org](https://www.nand2tetris.org/)
**Book:** *The Elements of Computing Systems* (MIT Press)

The course builds a complete general-purpose computer -- hardware and software -- starting from nothing but a NAND gate and a flip-flop.

### Part I: Hardware (Projects 1-5)

| Project | Title | What You Build | Key Concepts |
|---|---|---|---|
| 1 | Boolean Logic | 15 elementary logic gates (AND, OR, NOT, MUX, DMUX, multi-bit variants, multi-way variants) | Boolean algebra, disjunctive normal form, truth tables, proof that NAND is universal |
| 2 | Boolean Arithmetic | Half adder, full adder, multi-bit adder, ALU | Two's complement, binary addition, the Hack ALU (6 control bits, 18 functions) |
| 3 | Sequential Logic | 1-bit register, 16-bit register, RAM8, RAM64, RAM512, RAM4K, RAM16K, Program Counter | Flip-flops (DFF as primitive), clock, sequential vs. combinational, memory hierarchy |
| 4 | Machine Language | Write assembly programs for the Hack computer | Hack instruction set (A-instructions, C-instructions), symbolic references, I/O memory-mapping |
| 5 | Computer Architecture | CPU, Memory, full Hack Computer | Von Neumann architecture, fetch-decode-execute cycle, Harvard vs. von Neumann, instruction memory vs. data memory |

### Part I -> Part II Bridge

| Project | Title | What You Build | Key Concepts |
|---|---|---|---|
| 6 | Assembler | Hack assembler (translates .asm to .hack binary) | Symbol tables, two-pass assembly, parsing, code generation |

### Part II: Software (Projects 7-12)

| Project | Title | What You Build | Key Concepts |
|---|---|---|---|
| 7 | VM I: Stack Arithmetic | VM translator (arithmetic/logical commands) | Stack-based virtual machine, push/pop, stack arithmetic |
| 8 | VM II: Program Control | VM translator (branching, function calls) | Function call protocol, call stack frames, return addresses, recursion |
| 9 | High-Level Language | A program written in Jack | Jack language (Java-like OOP), classes, methods, constructors, standard library |
| 10 | Compiler I: Syntax Analysis | Jack tokenizer + parser | Lexical analysis, recursive descent parsing, parse trees, context-free grammars |
| 11 | Compiler II: Code Generation | Complete Jack compiler (generates VM code) | Symbol tables, code generation, expression evaluation, control flow translation |
| 12 | Operating System | Jack OS (8 classes) | Memory management (alloc/dealloc), I/O drivers (screen, keyboard), math library, string handling |

### The Abstraction Hierarchy

```
Tetris game (Jack)
    |
Jack Compiler (generates VM code)
    |
VM Translator (generates Hack assembly)
    |
Assembler (generates Hack binary)
    |
Hack Computer (CPU + Memory)
    |
ALU + Registers + RAM
    |
Logic Gates (AND, OR, MUX, ...)
    |
NAND gate (primitive)
```

Sources:
- [Nand2Tetris course projects](https://www.nand2tetris.org/course)
- [Nand2Tetris -- Coursera Part I](https://www.coursera.org/learn/build-a-computer)
- [Nand2Tetris -- Coursera Part II](https://www.coursera.org/learn/nand2tetris2)
- [Nand2Tetris -- ACM paper](https://cacm.acm.org/research/nand-to-tetris-building-a-modern-computer-system-from-first-principles/)

---

## 5. MIT 6.004 Computation Structures -- Topic Hierarchy

**Course:** MIT 6.004 Computation Structures
**Website:** [computationstructures.org](https://computationstructures.org/)
**OpenCourseWare:** [MIT OCW 6.004 Spring 2017](https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/)

### Course Topics (Spring 2017 Structure)

| Unit | Topic | Key Content |
|---|---|---|
| 1 | Basics of Information | Entropy, information content, encodings, Hamming distance, error detection and correction |
| 2 | The Digital Abstraction | Voltage-based encoding, noise margins, static discipline, combinational logic |
| 3 | CMOS Technology | MOSFETs as switches, CMOS gate design (complementary pull-up/pull-down), timing specifications (tpd, tcd, tsetup, thold) |
| 4 | Combinational Logic | Canonical forms (SOP, POS), Boolean minimization, synthesis, multiplexers, decoders, ROMs |
| 5 | Sequential Logic | Latches and flip-flops, registers, timing constraints (setup time, hold time), dynamic discipline |
| 6 | Finite State Machines | Moore and Mealy machines, state transition diagrams, synchronization, metastability |
| 7 | Performance Measures | Throughput and latency, pipelining (ideal speedup, hazards, stalls), pipeline registers |
| 8 | Design Tradeoffs | Power dissipation, speed-area tradeoffs, energy-delay product |
| 9 | von Neumann Architectures | Instruction set design, Beta ISA (32-bit RISC), assembly programming |
| 10 | Assembling Programs | Assembly language, symbol resolution, RISC instruction formats |
| 11 | Compiling Expressions | Stack frames, calling conventions, register allocation |
| 12 | Procedures and Stacks | Subroutine linkage, activation records, recursion support |
| 13 | Building the Beta | Unpipelined Beta datapath, control logic, ALU design |
| 14 | Pipelined Beta | 5-stage pipeline, data hazards, control hazards, forwarding/bypass, branch prediction |
| 15 | Memory Hierarchy | Locality, cache organization (direct-mapped, set-associative), write policies, cache performance |
| 16 | Virtual Memory | Page tables, TLB, address translation, demand paging, protection |
| 17 | I/O, Interrupts, DMA | Device interfaces, polling vs. interrupts, interrupt handlers, DMA |

### The 6.004 Abstraction Hierarchy

```
Operating Systems / Virtual Machines
    |
Memory Hierarchy (caches, virtual memory)
    |
Pipelined Processor (Beta)
    |
Instruction Set Architecture (RISC ISA)
    |
Finite State Machines
    |
Sequential Logic (latches, registers)
    |
Combinational Logic (gates, muxes, ALUs)
    |
CMOS Technology (MOSFETs)
    |
Digital Abstraction (voltage thresholds)
    |
Information Theory (bits, entropy)
```

### Lab Sequence

Students complete the gate-level design of a full RISC processor (the "Beta") during lab exercises, progressing from simple gates through a complete pipelined CPU.

Sources:
- [MIT OCW 6.004 Spring 2017](https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/)
- [Computation Structures website](https://computationstructures.org/)
- [6.004 Lecture Notes -- Spring 2009](https://ocw.mit.edu/courses/6-004-computation-structures-spring-2009/pages/lecture-notes/)
- [6.004 Calendar / Topics](https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/pages/calendar/)

---

## 6. IEEE 754 Floating Point Standard

### 6.1 Format Overview

The IEEE 754 standard (original 1985, revised 2008 and 2019) defines binary floating-point formats:

$$\text{value} = (-1)^{s} \times 2^{(E - \text{bias})} \times (1.M)$$

where $s$ is the sign bit, $E$ is the stored (biased) exponent, $M$ is the stored mantissa/significand, and the "1." is the implicit leading bit for normalized numbers.

### 6.2 Single Precision (binary32)

| Field | Bits | Range |
|---|---|---|
| Sign ($s$) | 1 (bit 31) | 0 or 1 |
| Exponent ($E$) | 8 (bits 30-23) | 0 to 255 |
| Mantissa ($M$) | 23 (bits 22-0) | -- |
| **Bias** | -- | **127** |

- True exponent: $e = E - 127$, range: $-126$ to $+127$ (E=0 and E=255 are reserved)
- Precision: 24 significant bits (23 stored + 1 implicit), $\approx$ 7.2 decimal digits
- Smallest normalized: $\pm 1.0 \times 2^{-126} \approx \pm 1.175 \times 10^{-38}$
- Largest normalized: $\pm (2 - 2^{-23}) \times 2^{127} \approx \pm 3.403 \times 10^{38}$
- Machine epsilon: $\varepsilon = 2^{-23} \approx 1.192 \times 10^{-7}$

### 6.3 Double Precision (binary64)

| Field | Bits | Range |
|---|---|---|
| Sign ($s$) | 1 (bit 63) | 0 or 1 |
| Exponent ($E$) | 11 (bits 62-52) | 0 to 2047 |
| Mantissa ($M$) | 52 (bits 51-0) | -- |
| **Bias** | -- | **1023** |

- True exponent: $e = E - 1023$, range: $-1022$ to $+1023$
- Precision: 53 significant bits (52 stored + 1 implicit), $\approx$ 15.9 decimal digits
- Smallest normalized: $\pm 2^{-1022} \approx \pm 2.225 \times 10^{-308}$
- Largest normalized: $\pm (2 - 2^{-52}) \times 2^{1023} \approx \pm 1.798 \times 10^{308}$
- Machine epsilon: $\varepsilon = 2^{-52} \approx 2.220 \times 10^{-16}$

### 6.4 Special Values

| Exponent $E$ | Mantissa $M$ | Value | Meaning |
|---|---|---|---|
| 0 | 0 | $\pm 0$ | Positive/negative zero (sign bit distinguishes) |
| 0 | $\neq 0$ | $\pm 0.M \times 2^{-126}$ | **Denormalized** (subnormal) number |
| 1-254 (single) / 1-2046 (double) | any | $\pm 1.M \times 2^{E-\text{bias}}$ | Normalized number |
| 255 (single) / 2047 (double) | 0 | $\pm \infty$ | Positive/negative infinity |
| 255 (single) / 2047 (double) | $\neq 0$ | NaN | Not a Number |

**Denormalized (subnormal) numbers:**
- The implicit leading bit is 0 instead of 1: value = $(-1)^s \times 0.M \times 2^{1 - \text{bias}}$
- Fill the "gap" between zero and the smallest normalized number
- Enable gradual underflow rather than abrupt flush-to-zero
- Smallest denorm (single): $2^{-149} \approx 1.401 \times 10^{-45}$
- Smallest denorm (double): $2^{-1074} \approx 4.941 \times 10^{-324}$

**NaN types:**
- **Quiet NaN (qNaN)**: propagates through arithmetic without signaling exceptions (leading mantissa bit = 1)
- **Signaling NaN (sNaN)**: raises an invalid operation exception when used (leading mantissa bit = 0)
- Operations producing NaN: $0/0$, $\infty - \infty$, $\infty \times 0$, $\sqrt{x}$ where $x < 0$, etc.

**Important identities:**
- $+0 = -0$ (they compare equal)
- $\text{NaN} \neq \text{NaN}$ (NaN is not equal to anything, including itself)
- $1/+0 = +\infty$, $1/-0 = -\infty$
- $\infty + \infty = \infty$, $\infty - \infty = \text{NaN}$

### 6.5 Rounding Modes

| Mode | Description | Example (round 2.5) |
|---|---|---|
| Round to nearest, ties to even (default) | Round to the nearest representable value; if exactly halfway, round to even (banker's rounding) | 2 |
| Round to nearest, ties away from zero | Round to the nearest representable value; if exactly halfway, round away from zero | 3 |
| Round toward $+\infty$ (ceiling) | Always round up | 3 |
| Round toward $-\infty$ (floor) | Always round down | 2 |
| Round toward zero (truncation) | Always round toward zero | 2 |

The default "round to nearest, ties to even" minimizes cumulative rounding bias in statistical computations.

### 6.6 Other IEEE 754-2008 Formats

| Format | Total bits | Exponent | Mantissa | Bias | Decimal digits |
|---|---|---|---|---|---|
| Half (binary16) | 16 | 5 | 10 | 15 | ~3.3 |
| Single (binary32) | 32 | 8 | 23 | 127 | ~7.2 |
| Double (binary64) | 64 | 11 | 52 | 1023 | ~15.9 |
| Quad (binary128) | 128 | 15 | 112 | 16383 | ~34.0 |
| bfloat16 | 16 | 8 | 7 | 127 | ~2.4 |

Note: bfloat16 is not part of IEEE 754 but is widely used in ML training. It uses the same exponent range as float32 (8 bits, bias 127) with drastically reduced precision (7 mantissa bits).

Sources:
- [IEEE 754 -- Wikipedia](https://en.wikipedia.org/wiki/IEEE_754)
- [IEEE Standard 754 Floating Point Numbers -- GeeksforGeeks](https://www.geeksforgeeks.org/computer-organization-architecture/ieee-standard-754-floating-point-numbers/)
- [IEEE 754 -- Steve Hollasch](https://steve.hollasch.net/cgindex/coding/ieeefloat.html)
- [Single-precision floating-point format -- Wikipedia](https://en.wikipedia.org/wiki/Single-precision_floating-point_format)
- [IEEE 754 -- Emory Math Center](https://mathcenter.oxford.emory.edu/site/cs170/ieee754/)
- [NVIDIA CUDA Floating Point](https://docs.nvidia.com/cuda/floating-point/index.html)
- [IEEE 754-2019 Standard PDF](https://www-users.cse.umn.edu/~vinals/tspot_files/phys4041/2020/IEEE%20Standard%20754-2019.pdf)

---

## 7. Carry-Lookahead Adder (CLA)

### 7.1 Motivation

A ripple-carry adder computes the carry for bit $i$ only after the carry from bit $i-1$ is known, resulting in $O(n)$ gate delay for an $n$-bit addition. The CLA computes all carry signals in parallel, achieving $O(\log n)$ delay.

### 7.2 Generate and Propagate Signals

For each bit position $i$, define:

$$G_i = A_i \cdot B_i \quad \text{(Generate: position } i \text{ generates a carry regardless of } C_{in}\text{)}$$

$$P_i = A_i \oplus B_i \quad \text{(Propagate: position } i \text{ propagates an incoming carry)}$$

The carry-out of position $i$ is:

$$C_{i+1} = G_i + P_i \cdot C_i$$

This is the fundamental recurrence. In a ripple-carry adder, it forms a chain. The CLA breaks this chain by expanding the recurrence.

### 7.3 CLA Equations (4-bit example)

Expanding the recurrence for a 4-bit block:

$$C_1 = G_0 + P_0 C_0$$

$$C_2 = G_1 + P_1 G_0 + P_1 P_0 C_0$$

$$C_3 = G_2 + P_2 G_1 + P_2 P_1 G_0 + P_2 P_1 P_0 C_0$$

$$C_4 = G_3 + P_3 G_2 + P_3 P_2 G_1 + P_3 P_2 P_1 G_0 + P_3 P_2 P_1 P_0 C_0$$

**Key observation:** Each $C_i$ depends only on $G_j$, $P_j$ for $j < i$, and $C_0$. All the $G_i$ and $P_i$ values are computed in 1 gate delay (from $A_i$, $B_i$). Then all carries can be computed in parallel in just 2 more gate delays (one AND level, one OR level).

The sum bits are then:

$$S_i = P_i \oplus C_i$$

### 7.4 Group Generate and Group Propagate

For hierarchical (multi-level) CLA, define group signals over a block of positions $[i:j]$:

$$G_{i:j} = G_j + P_j \cdot G_{j-1} + P_j P_{j-1} \cdot G_{j-2} + \cdots + P_j P_{j-1} \cdots P_{i+1} \cdot G_i$$

$$P_{i:j} = P_j \cdot P_{j-1} \cdots P_i$$

These compose associatively. For two adjacent groups $[i:k]$ and $[k+1:j]$:

$$G_{i:j} = G_{k+1:j} + P_{k+1:j} \cdot G_{i:k}$$

$$P_{i:j} = P_{k+1:j} \cdot P_{i:k}$$

This associativity enables a tree structure (prefix tree / parallel prefix adder).

### 7.5 Delay Analysis

| Adder Type | Carry Delay | Area | Structure |
|---|---|---|---|
| Ripple-carry | $O(n)$ | $O(n)$ | Linear chain |
| CLA (single level, 4-bit blocks) | $O(n/4)$ but still linear | $O(n)$ | Flat lookahead within blocks |
| CLA (hierarchical / tree) | $O(\log n)$ | $O(n \log n)$ | Prefix tree (Brent-Kung, Kogge-Stone, etc.) |

**Detailed gate delays (hierarchical CLA for $n$-bit addition):**
1. Compute all $G_i$, $P_i$: **1 gate delay** (AND/XOR)
2. Prefix tree to compute all carries: **$2 \log_2 n$ gate delays** (each level: one AND + one OR)
3. Compute sums $S_i = P_i \oplus C_i$: **1 gate delay** (XOR)

**Total: $2 \log_2 n + 2$ gate delays**

For a 64-bit adder: ripple-carry needs ~128 gate delays; Kogge-Stone prefix adder needs ~14 gate delays (roughly 9x faster).

### 7.6 Prefix Adder Variants

| Variant | Depth | Area | Fan-out | Notes |
|---|---|---|---|---|
| Kogge-Stone | $\log_2 n$ | $n \log_2 n$ | Uniform, low | Minimum depth, maximum area, wiring-intensive |
| Brent-Kung | $2\log_2 n - 1$ | $2n - 2$ | Higher | Minimum area, slightly deeper |
| Han-Carlson | $\log_2 n + 1$ | $\frac{n}{2}\log_2 n$ | Moderate | Hybrid compromise |
| Ladner-Fischer | $\log_2 n$ | varies | High | High fan-out variant of Kogge-Stone |

Sources:
- [Carry-lookahead adder -- Wikipedia](https://en.wikipedia.org/wiki/Carry-lookahead_adder)
- [Carry Look-Ahead Adder -- GeeksforGeeks](https://www.geeksforgeeks.org/digital-logic/carry-look-ahead-adder/)
- [USC EE 457 -- Fast Adders](https://ee.usc.edu/~redekopp/ee457/slides/EE457Unit2b_FastAdders.pdf)
- [Harvey Mudd CLA lecture](https://pages.hmc.edu/harris/class/hal/lect12.pdf)
- [Rice University CLA adder](https://www.clear.rice.edu/elec422/1996/supafly/adder.html)
- [Concordia CLA lecture](https://users.encs.concordia.ca/~asim/coen312/Lectures/CLA_adder.pdf)

---

## 8. Booth's Multiplication Algorithm

### 8.1 Standard Booth's Algorithm (Radix-2)

Booth's algorithm multiplies two signed integers in two's complement representation. It reduces the number of additions by encoding runs of 1s in the multiplier.

**Key insight:** A run of 1s in binary (e.g., `0111110`) can be replaced by a subtraction at the start and an addition at the end: $0111110_2 = 1000000_2 - 0000010_2$. This reduces the number of partial products.

**Algorithm:**
Given multiplicand $M$ and multiplier $Q$ (both $n$-bit signed):

1. Initialize: $A = 0$ ($n$ bits), $Q_{-1} = 0$ (extra bit), counter $= n$
2. Examine the two least significant bits $(Q_0, Q_{-1})$:
   - `00` or `11`: Do nothing (arithmetic shift right)
   - `01`: $A = A + M$ then arithmetic shift right
   - `10`: $A = A - M$ then arithmetic shift right
3. **Arithmetic shift right** the combined $(A, Q, Q_{-1})$ register by 1 bit (preserving the sign bit of $A$)
4. Decrement counter. If counter $> 0$, go to step 2.
5. Result is in the combined $(A, Q)$ register.

### 8.2 Worked Example: $5 \times (-3)$

$M = 5 = 0101_2$, $Q = -3 = 1101_2$ (4-bit two's complement)

| Step | A (4 bits) | Q (4 bits) | $Q_{-1}$ | Action |
|---|---|---|---|---|
| Init | 0000 | 1101 | 0 | -- |
| 1 | 0000 | 1101 | 0 | $Q_0 Q_{-1} = 10$: $A = A - M = 0000 - 0101 = 1011$ |
|  | 1101 | 1110 | 1 | ASR |
| 2 | 1101 | 1110 | 1 | $Q_0 Q_{-1} = 01$: $A = A + M = 1101 + 0101 = 0010$ |
|  | 0001 | 0111 | 0 | ASR |
| 3 | 0001 | 0111 | 0 | $Q_0 Q_{-1} = 10$: $A = A - M = 0001 - 0101 = 1100$ |
|  | 1110 | 0011 | 1 | ASR |
| 4 | 1110 | 0011 | 1 | $Q_0 Q_{-1} = 11$: No operation |
|  | 1111 | 0001 | 1 | ASR |

Result: $A \| Q = 1111\,0001_2 = -15_{10}$ (correct: $5 \times -3 = -15$)

### 8.3 Modified Booth's Algorithm (Radix-4)

The radix-4 (modified) Booth algorithm examines 3 bits at a time instead of 2, halving the number of partial products and thus the number of addition/subtraction steps.

**Bit grouping:** Group the multiplier into overlapping 3-bit windows, starting from the LSB with a padded 0:

For multiplier $Q = q_{n-1} q_{n-2} \ldots q_1 q_0$, examine triplets $(q_{2i+1}, q_{2i}, q_{2i-1})$ where $q_{-1} = 0$.

**Recoding table:**

| $q_{2i+1}$ | $q_{2i}$ | $q_{2i-1}$ | Action | Partial Product |
|---|---|---|---|---|
| 0 | 0 | 0 | $+0 \times M$ | 0 |
| 0 | 0 | 1 | $+1 \times M$ | $+M$ |
| 0 | 1 | 0 | $+1 \times M$ | $+M$ |
| 0 | 1 | 1 | $+2 \times M$ | $+2M$ (left shift) |
| 1 | 0 | 0 | $-2 \times M$ | $-2M$ |
| 1 | 0 | 1 | $-1 \times M$ | $-M$ |
| 1 | 1 | 0 | $-1 \times M$ | $-M$ |
| 1 | 1 | 1 | $-0 \times M$ | 0 |

**Advantages of radix-4:**
- Reduces $n$ partial products to $n/2$ (half the additions)
- Only requires $\{0, \pm M, \pm 2M\}$ which are trivial to compute ($2M$ is a left shift)
- Handles signed and unsigned operands uniformly (no special cases for negative numbers)
- Standard in hardware multiplier implementations (e.g., ARM, x86 ALUs)

**Why it matters in hardware:**
- A 64-bit multiplication with standard Booth needs 64 cycles; radix-4 needs only 32
- Combined with Wallace tree or Dadda tree for partial product reduction, radix-4 Booth enables single-cycle multipliers in modern CPUs
- The regularity of the encoding maps well to silicon layout

Sources:
- [Booth's multiplication algorithm -- Wikipedia](https://en.wikipedia.org/wiki/Booth%27s_multiplication_algorithm)
- [Booth's Algorithm -- GeeksforGeeks](https://www.geeksforgeeks.org/computer-organization-architecture/computer-organization-booths-algorithm/)
- [Implementation of Modified Booth Algorithm (Radix-4)](https://www.ripublication.com/aeee/006_pp%20%20%20%20683-690.pdf)
- [Booth Radix-4 Multiplier -- DigiKey](https://forum.digikey.com/t/booth-radix-4-multiplier-for-low-density-pld-applications-vhdl/13402)
- [Radix-4 Booth Multiplier -- IJERT](https://www.ijert.org/implementation-of-radix-4-32-bit-booth-multiplier-using-vhdl)

---

## 9. Logic Gate Switching Speeds

### 9.1 FO4 Delay (Fan-Out-of-4 Inverter Delay)

The FO4 delay is the standard technology-independent metric for gate speed: the propagation delay of an inverter driving four copies of itself. It captures the intrinsic speed of a technology node.

**Historical FO4 delay values by process node:**

| Process Node | FO4 Inverter Delay | Supply Voltage | Source/Notes |
|---|---|---|---|
| 600 nm | ~50 ps (base delay $\tau$) | 3.3 V | Older reference |
| 180 nm | ~30-40 ps | 1.8 V | -- |
| 130 nm | ~25-35 ps | 1.2 V | Measured: lowest ~35 ps at 0C/1.1V, highest ~65 ps at 120C/0.7V |
| 65 nm | ~15-20 ps | 1.0 V | -- |
| 45 nm | ~12-15 ps | 0.9 V | -- |
| 28 nm | ~9-12 ps | 0.9 V | -- |
| 16/14 nm (FinFET) | ~7-9 ps | 0.8 V | FinFET era |
| 7 nm | ~6-8 ps | 0.75 V | Measured FO4: 6.0-8.1 ps (from ASAP7 PDK) |
| 5 nm | ~5-7 ps | 0.70-0.75 V | Estimated from scaling trends |
| 3 nm | ~4-6 ps | 0.65-0.75 V | Estimated from scaling trends |

**Note:** Values for 5nm and 3nm are estimates based on ~15-20% improvement per generation. Exact values are proprietary to foundry PDKs.

### 9.2 Transistor Switching Frequency Limits

**Fastest semiconductor transistors:** Over 800 GHz $f_T$ (transit frequency), with switching in the low-picosecond range.

**Theoretical ballistic limit:** For a 1 nm channel with carrier velocity $v = 10^6$ m/s:
$$f_T \approx \frac{v}{2\pi L} = \frac{10^6}{2\pi \times 10^{-9}} \approx 160 \text{ THz}$$

This is ~200x faster than today's transistors, indicating significant room between current performance and physics limits (dominated by parasitic capacitance and resistance, not carrier velocity).

### 9.3 Practical Gate Delays in Modern Processors

Modern processors at 3-5nm operate at 4-6 GHz. A clock period of ~200 ps must accommodate:
- ~15-25 logic gate stages in the critical path (typical)
- Each gate: ~5-10 ps FO4 equivalent delay
- Plus wire delay (increasingly dominant at advanced nodes)

**Wire delay vs gate delay:** At 7nm and below, interconnect delay (RC of thin metal wires) can exceed gate delay. This is why BSPDN (backside power delivery, as in Intel 18A and TSMC N2P) is critical -- it frees front-side metal for signal routing, reducing wire length.

### 9.4 Record-Breaking Gate Speeds

- **Optical logic gates:** Researchers at the University of Arizona demonstrated optical switching at sub-picosecond speeds, opening paths to light-based computing.
- **Bi2O2Se transistors (2025):** A new GAAFET prototype using bismuth oxyselenide (Bi2O2Se) channels and bismuth selenite oxide (Bi2SeO5) gates achieved 40% faster switching and 10% less power than conventional silicon (research prototype, not production).
- **Graphene transistors:** Lab demonstrations at ~400+ GHz $f_T$, but poor on/off ratios prevent use in digital logic.

### 9.5 Fan-Out and Delay Relationship

Gate delay increases with fan-out (number of gates driven) due to increased capacitive load:

$$t_{pd} = t_{pd,0} + \frac{C_{load}}{C_{in,ref}} \cdot t_{pd,0} \cdot g$$

Where $g$ is the logical effort of the gate (1 for inverter, ~4/3 for NAND2, ~5/3 for NOR2).

**Logical effort values (normalized to inverter):**

| Gate | Logical Effort $g$ |
|---|---|
| Inverter | 1 |
| NAND2 | 4/3 |
| NAND3 | 5/3 |
| NOR2 | 5/3 |
| NOR3 | 7/3 |
| XOR2 | ~4 (depends on implementation) |

Sources:
- [FO4 -- Wikipedia](https://en.wikipedia.org/wiki/FO4)
- [FO4 Inverter Delay Metric -- UC Davis](https://www.ece.ucdavis.edu/~ramirtha/EEC216/W08/lecture1_updated.pdf)
- [Logical effort -- Wikipedia](https://en.wikipedia.org/wiki/Logical_effort)
- [ASAP7 7nm FinFET characterization](https://pages.hmc.edu/harris/research/asap7.pdf)
- [Logic gate speed record -- Physics World](https://physicsworld.com/a/logic-gate-breaks-speed-record/)
- [Optical switching -- U of Arizona](https://news.arizona.edu/news/optical-switching-record-speeds-opens-door-ultrafast-light-based-electronics-and-computers)
- [Bismuth transistor -- Hackaday](https://hackaday.com/2025/05/16/new-bismuth-transistor-runs-40-faster-and-uses-10-less-power/)
- [Transistor switching physics -- Halonex](https://sidequests.halonex.app/posts/how-does-a-transistor-switch-so-fast.html)

---

## Appendix: Quick Reference Equations

### MOSFET
- **Threshold with body effect:** $V_{th} = V_{th0} + \gamma(\sqrt{2\phi_F + V_{SB}} - \sqrt{2\phi_F})$
- **Linear region:** $I_D = \mu_n C_{ox} \frac{W}{L}\left[(V_{GS} - V_{th})V_{DS} - \frac{V_{DS}^2}{2}\right]$
- **Saturation region:** $I_D = \frac{1}{2}\mu_n C_{ox}\frac{W}{L}(V_{GS} - V_{th})^2(1 + \lambda V_{DS})$

### CMOS Power
- **Dynamic:** $P_{dyn} = \alpha C_L V_{DD}^2 f$
- **Leakage:** $P_{leak} = V_{DD} \cdot I_{leakage}$
- **Total:** $P_{total} = P_{dyn} + P_{SC} + P_{leak}$

### CLA
- **Generate:** $G_i = A_i \cdot B_i$
- **Propagate:** $P_i = A_i \oplus B_i$
- **Carry:** $C_{i+1} = G_i + P_i \cdot C_i$
- **Group compose:** $G_{i:j} = G_{k+1:j} + P_{k+1:j} \cdot G_{i:k}$

### IEEE 754
- **Value:** $(-1)^s \times 2^{E - \text{bias}} \times 1.M$
- **Single:** 1/8/23 bits, bias 127
- **Double:** 1/11/52 bits, bias 1023

### Booth Radix-4
- **Partial products:** $\{0, \pm M, \pm 2M\}$ from 3-bit windows
- **Iterations:** $n/2$ instead of $n$
