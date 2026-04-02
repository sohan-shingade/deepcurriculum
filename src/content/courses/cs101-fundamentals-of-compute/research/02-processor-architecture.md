# Research Notes: Processor Architecture and Pipelining

> Compiled: 2026-03-31
> Purpose: Reference material for CS 101 lecture content on processor microarchitecture, pipelining, out-of-order execution, and branch prediction.

---

## 1. RISC-V RV32I Instruction Set Architecture

### 1.1 Instruction Formats

All RV32I instructions are fixed 32 bits wide and must be aligned on a four-byte boundary. There are six instruction formats. The opcode field (bits [6:0]) is always in the same position across all formats.

**Source:** [RISC-V ISA Spec, Chapter 2 — RV32I Base Integer Instruction Set, Version 2.1](https://docs.riscv.org/reference/isa/unpriv/rv32.html)

#### R-type (Register-Register)

```
 31        25  24    20  19    15  14  12  11     7  6      0
 ┌──────────┬─────────┬─────────┬───────┬─────────┬─────────┐
 │  funct7  │   rs2   │   rs1   │funct3 │   rd    │ opcode  │
 │  [31:25] │ [24:20] │ [19:15] │[14:12]│ [11:7]  │  [6:0]  │
 └──────────┴─────────┴─────────┴───────┴─────────┴─────────┘
     7 bits    5 bits    5 bits   3 bits   5 bits    7 bits
```

Used for: arithmetic/logic operations between two registers (ADD, SUB, AND, OR, XOR, SLL, SRL, SRA, SLT, SLTU).

#### I-type (Immediate)

```
 31                 20  19    15  14  12  11     7  6      0
 ┌─────────────────────┬───────┬───────┬─────────┬─────────┐
 │     imm[11:0]       │  rs1  │funct3 │   rd    │ opcode  │
 │      [31:20]        │[19:15]│[14:12]│ [11:7]  │  [6:0]  │
 └─────────────────────┴───────┴───────┴─────────┴─────────┘
         12 bits         5 bits  3 bits   5 bits    7 bits
```

Used for: immediate arithmetic (ADDI, XORI, ORI, ANDI, SLTI, SLTIU), loads (LB, LH, LW, LBU, LHU), JALR, shift-immediates (SLLI, SRLI, SRAI — shamt in imm[4:0], funct7-equivalent in imm[11:5]).

#### S-type (Store)

```
 31        25  24    20  19    15  14  12  11     7  6      0
 ┌──────────┬─────────┬─────────┬───────┬─────────┬─────────┐
 │ imm[11:5]│   rs2   │   rs1   │funct3 │imm[4:0] │ opcode  │
 │  [31:25] │ [24:20] │ [19:15] │[14:12]│ [11:7]  │  [6:0]  │
 └──────────┴─────────┴─────────┴───────┴─────────┴─────────┘
     7 bits    5 bits    5 bits   3 bits   5 bits    7 bits
```

Used for: stores (SB, SH, SW). Immediate is split across two fields for consistency of rs1/rs2 positioning.

#### B-type (Branch)

```
 31    30      25  24    20  19    15  14  12  11    8   7    6      0
 ┌───┬──────────┬─────────┬─────────┬───────┬───────┬────┬──────────┐
 │[12]│ imm[10:5]│   rs2   │   rs1   │funct3 │[4:1]  │[11]│  opcode  │
 └───┴──────────┴─────────┴─────────┴───────┴───────┴────┴──────────┘
  1b     6 bits    5 bits    5 bits   3 bits  4 bits  1b    7 bits
```

Used for: conditional branches (BEQ, BNE, BLT, BGE, BLTU, BGEU). Immediate encodes a signed offset in multiples of 2 bytes.

#### U-type (Upper Immediate)

```
 31                                   12  11     7  6      0
 ┌───────────────────────────────────────┬─────────┬─────────┐
 │            imm[31:12]                 │   rd    │ opcode  │
 │             [31:12]                   │ [11:7]  │  [6:0]  │
 └───────────────────────────────────────┴─────────┴─────────┘
                 20 bits                   5 bits    7 bits
```

Used for: LUI (load upper immediate), AUIPC (add upper immediate to PC).

#### J-type (Jump)

```
 31    30          21  20  19          12  11     7  6      0
 ┌───┬──────────────┬───┬──────────────┬─────────┬─────────┐
 │[20]│  imm[10:1]   │[11]│  imm[19:12]  │   rd    │ opcode  │
 └───┴──────────────┴───┴──────────────┴─────────┴─────────┘
  1b     10 bits      1b     8 bits       5 bits    7 bits
```

Used for: JAL (jump and link). Immediate encodes a signed offset in multiples of 2 bytes, providing a +/- 1 MiB range.

### 1.2 Complete RV32I Base Instruction Listing

There are 40 unique instructions in the RV32I base integer instruction set (47 if you count the 6 CSR instructions from Zicsr and FENCE.I from Zifencei, which are commonly included).

**Sources:**
- [RISC-V ISA Reference Card (SFU)](https://www.cs.sfu.ca/~ashriram/Courses/CS295/assets/notebooks/RISCV/RISCV_CARD.pdf)
- [RV32I Instructions Reference](https://msyksphinz-self.github.io/riscv-isadoc/html/rvi.html)
- [Harris & Harris DDCA Appendix B](https://pages.hmc.edu/harris/ddca/ddcarv/DDCArv_AppB_Harris.pdf)

#### R-type Instructions (opcode = 0110011)

| Instruction | funct7    | funct3 | Operation                  |
|-------------|-----------|--------|----------------------------|
| ADD         | 0000000   | 000    | rd = rs1 + rs2             |
| SUB         | 0100000   | 000    | rd = rs1 - rs2             |
| SLL         | 0000000   | 001    | rd = rs1 << rs2[4:0]       |
| SLT         | 0000000   | 010    | rd = (rs1 < rs2) ? 1 : 0 (signed) |
| SLTU        | 0000000   | 011    | rd = (rs1 < rs2) ? 1 : 0 (unsigned) |
| XOR         | 0000000   | 100    | rd = rs1 ^ rs2             |
| SRL         | 0000000   | 101    | rd = rs1 >> rs2[4:0] (logical) |
| SRA         | 0100000   | 101    | rd = rs1 >> rs2[4:0] (arithmetic) |
| OR          | 0000000   | 110    | rd = rs1 \| rs2            |
| AND         | 0000000   | 111    | rd = rs1 & rs2             |

#### I-type Arithmetic Instructions (opcode = 0010011)

| Instruction | imm[11:5] | funct3 | Operation                  |
|-------------|-----------|--------|----------------------------|
| ADDI        | -         | 000    | rd = rs1 + imm             |
| SLTI        | -         | 010    | rd = (rs1 < imm) ? 1 : 0 (signed) |
| SLTIU       | -         | 011    | rd = (rs1 < imm) ? 1 : 0 (unsigned) |
| XORI        | -         | 100    | rd = rs1 ^ imm             |
| ORI         | -         | 110    | rd = rs1 \| imm            |
| ANDI        | -         | 111    | rd = rs1 & imm             |
| SLLI        | 0000000   | 001    | rd = rs1 << shamt          |
| SRLI        | 0000000   | 101    | rd = rs1 >> shamt (logical) |
| SRAI        | 0100000   | 101    | rd = rs1 >> shamt (arithmetic) |

#### Load Instructions (opcode = 0000011)

| Instruction | funct3 | Operation                          |
|-------------|--------|------------------------------------|
| LB          | 000    | rd = sign-extend(mem[rs1+imm][7:0])  |
| LH          | 001    | rd = sign-extend(mem[rs1+imm][15:0]) |
| LW          | 010    | rd = mem[rs1+imm][31:0]              |
| LBU         | 100    | rd = zero-extend(mem[rs1+imm][7:0])  |
| LHU         | 101    | rd = zero-extend(mem[rs1+imm][15:0]) |

#### Store Instructions (opcode = 0100011)

| Instruction | funct3 | Operation                          |
|-------------|--------|-------------------------------------|
| SB          | 000    | mem[rs1+imm][7:0] = rs2[7:0]        |
| SH          | 001    | mem[rs1+imm][15:0] = rs2[15:0]      |
| SW          | 010    | mem[rs1+imm][31:0] = rs2[31:0]      |

#### Branch Instructions (opcode = 1100011)

| Instruction | funct3 | Condition                        |
|-------------|--------|----------------------------------|
| BEQ         | 000    | Branch if rs1 == rs2             |
| BNE         | 001    | Branch if rs1 != rs2             |
| BLT         | 100    | Branch if rs1 < rs2 (signed)     |
| BGE         | 101    | Branch if rs1 >= rs2 (signed)    |
| BLTU        | 110    | Branch if rs1 < rs2 (unsigned)   |
| BGEU        | 111    | Branch if rs1 >= rs2 (unsigned)  |

#### Upper Immediate Instructions

| Instruction | opcode    | Operation                           |
|-------------|-----------|--------------------------------------|
| LUI         | 0110111   | rd = imm << 12                       |
| AUIPC       | 0010111   | rd = PC + (imm << 12)                |

#### Jump Instructions

| Instruction | opcode    | Format | Operation                       |
|-------------|-----------|--------|---------------------------------|
| JAL         | 1101111   | J-type | rd = PC+4; PC = PC + imm       |
| JALR        | 1100111   | I-type | rd = PC+4; PC = (rs1+imm) & ~1 |

#### System / Environment Instructions

| Instruction | opcode    | funct3 | imm[11:0]  | Operation              |
|-------------|-----------|--------|------------|------------------------|
| FENCE       | 0001111   | 000    | -          | Memory ordering fence  |
| ECALL       | 1110011   | 000    | 000000000000 | System call trap     |
| EBREAK      | 1110011   | 000    | 000000000001 | Debugger breakpoint  |

#### CSR Instructions (Zicsr extension, opcode = 1110011)

| Instruction | funct3 | Operation                              |
|-------------|--------|----------------------------------------|
| CSRRW       | 001    | Atomic read/write CSR                  |
| CSRRS       | 010    | Atomic read and set bits in CSR        |
| CSRRC       | 011    | Atomic read and clear bits in CSR      |
| CSRRWI      | 101    | Same as CSRRW with zero-extended uimm  |
| CSRRSI      | 110    | Same as CSRRS with zero-extended uimm  |
| CSRRCI      | 111    | Same as CSRRC with zero-extended uimm  |

### 1.3 Design Principles

Key design choices in RV32I:
- **Fixed register positions:** rs1, rs2, and rd are always in the same bit positions across all formats, simplifying decode hardware.
- **Sign-extended immediates:** All immediates are sign-extended from the most-significant bit (always bit 31).
- **Minimalism:** Only 40 base instructions. A simple implementation can reduce this to ~38 by treating ECALL/EBREAK as a single SYSTEM trap and FENCE as a NOP.

---

## 2. RISC-V Calling Convention and ABI

**Sources:**
- [RISC-V Calling Convention Chapter (riscv.org)](https://riscv.org/wp-content/uploads/2024/12/riscv-calling.pdf)
- [RISC-V Registers (WikiChip)](https://en.wikichip.org/wiki/risc-v/registers)
- [RISC-V psABI Spec (GitHub)](https://github.com/riscv-non-isa/riscv-elf-psabi-doc/blob/master/riscv-cc.adoc)

### 2.1 Register Mapping (x0-x31)

| Register | ABI Name | Usage                      | Saver   |
|----------|----------|----------------------------|---------|
| x0       | zero     | Hardwired zero             | -       |
| x1       | ra       | Return address             | Caller  |
| x2       | sp       | Stack pointer              | Callee  |
| x3       | gp       | Global pointer             | -       |
| x4       | tp       | Thread pointer             | -       |
| x5       | t0       | Temporary / alt link reg   | Caller  |
| x6       | t1       | Temporary                  | Caller  |
| x7       | t2       | Temporary                  | Caller  |
| x8       | s0 / fp  | Saved register / frame ptr | Callee  |
| x9       | s1       | Saved register             | Callee  |
| x10      | a0       | Function arg / return val  | Caller  |
| x11      | a1       | Function arg / return val  | Caller  |
| x12      | a2       | Function argument          | Caller  |
| x13      | a3       | Function argument          | Caller  |
| x14      | a4       | Function argument          | Caller  |
| x15      | a5       | Function argument          | Caller  |
| x16      | a6       | Function argument          | Caller  |
| x17      | a7       | Function argument          | Caller  |
| x18      | s2       | Saved register             | Callee  |
| x19      | s3       | Saved register             | Callee  |
| x20      | s4       | Saved register             | Callee  |
| x21      | s5       | Saved register             | Callee  |
| x22      | s6       | Saved register             | Callee  |
| x23      | s7       | Saved register             | Callee  |
| x24      | s8       | Saved register             | Callee  |
| x25      | s9       | Saved register             | Callee  |
| x26      | s10      | Saved register             | Callee  |
| x27      | s11      | Saved register             | Callee  |
| x28      | t3       | Temporary                  | Caller  |
| x29      | t4       | Temporary                  | Caller  |
| x30      | t5       | Temporary                  | Caller  |
| x31      | t6       | Temporary                  | Caller  |

### 2.2 Argument Passing

- Up to 8 integer arguments passed in **a0-a7** (x10-x17).
- Up to 8 floating-point arguments passed in **fa0-fa7** (f10-f17) when the F/D extension is present.
- Return values in **a0** (and **a1** for 64-bit values on RV32).
- Arguments that do not fit in registers are passed on the stack.
- Structs and large types are passed by reference if they exceed 2 x XLEN.

### 2.3 Caller vs. Callee-Saved Registers

| Category      | Registers                             |
|---------------|---------------------------------------|
| Caller-saved  | ra, t0-t6, a0-a7 (7 temps + 8 args)  |
| Callee-saved  | sp, s0-s11 (1 stack ptr + 12 saved)   |
| Fixed          | zero, gp, tp                          |

### 2.4 Stack Frame Layout

- Stack grows **downward** (toward lower addresses).
- Stack pointer (`sp`) must be **16-byte aligned** at all times.
- Frame pointer (`s0`/`fp`) is **optional** but if present, points to the base of the current frame.

```
High address
┌──────────────────────┐
│   Caller's frame     │
├──────────────────────┤ <-- old sp (before call)
│   Return address     │  (ra saved here if needed)
│   Old frame pointer  │  (s0 saved here if using fp)
│   Saved registers    │  (s1-s11 as needed)
│   Local variables    │
│   Outgoing args      │  (arguments 9+ for callee)
├──────────────────────┤ <-- sp (16-byte aligned)
│   Callee's frame     │
Low address
```

Typical function prologue:
```asm
addi sp, sp, -32      # Allocate 32 bytes on stack
sw   ra, 28(sp)       # Save return address
sw   s0, 24(sp)       # Save frame pointer
addi s0, sp, 32       # Set frame pointer
```

---

## 3. CMU 18-447: Introduction to Computer Architecture (Onur Mutlu)

**Sources:**
- [CMU 18-447 Course Page (Spring 2015)](http://www.archive.ece.cmu.edu/~ece447/s15/)
- [Onur Mutlu Lecture Videos and Materials](https://people.inf.ethz.ch/omutlu/lecture-videos.html)
- [Course Syllabus (Spring 2015 PDF)](https://course.ece.cmu.edu/~ece447/s15/lib/exe/fetch.php?media=syllabus-18-447-mutlu-s15.pdf)

### 3.1 Course Overview

CMU 18-447 is an undergraduate/introductory-graduate course in computer architecture taught by Professor Onur Mutlu (now also at ETH Zurich). The course covers the design, analysis, and implementation of computer systems from the ISA level to the microarchitecture level.

### 3.2 Key Topics Covered

1. **Fundamentals:** ISA design principles, MIPS/ARM-like processor design, performance evaluation
2. **Pipelining:** Classic 5-stage pipeline, data hazards and forwarding, control hazards, pipeline stalls
3. **Branch Prediction:** Static prediction, dynamic prediction (BHT, 2-bit counters), correlating predictors, tournament predictors, BTB, RAS
4. **Out-of-Order Execution:** Tomasulo's algorithm, reservation stations, register renaming, reorder buffer for precise exceptions
5. **Superscalar Execution:** Multi-issue pipelines, instruction-level parallelism
6. **Memory Hierarchy:** Caches (direct-mapped, set-associative), virtual memory, TLBs
7. **SIMD and Data-Level Parallelism:** Vector processing, GPU architecture
8. **Multicore and Thread-Level Parallelism:** Cache coherence, synchronization
9. **Performance Analysis:** Amdahl's Law, iron law of performance

### 3.3 What Makes This Course Distinctive

- **Bottom-up design emphasis:** Students design a complete pipelined processor in Verilog through the lab component, going from RTL to working hardware simulation.
- **Research-oriented perspective:** Mutlu weaves in current research problems (memory latency, energy efficiency, processing-in-memory) alongside classical material.
- **Interactive pedagogy:** Lectures feature planned discussion prompts where students reason about design tradeoffs verbally.
- **ETH Zurich continuation:** Mutlu now teaches "Computer Architecture" (Fall) and "Digital Design & Computer Architecture" (Spring) at ETH Zurich with updated material covering modern research directions including processing-using-memory and processing-near-memory architectures.
- **Freely available:** Full lecture videos, slides, labs, and problem sets are publicly available online for both CMU and ETH versions.

---

## 4. Tomasulo's Algorithm

### 4.1 Historical Context

**Original Paper:** R. M. Tomasulo, "An Efficient Algorithm for Exploiting Multiple Arithmetic Units," *IBM Journal of Research and Development*, Vol. 11, No. 1, pp. 25-33, January 1967.

- [IEEE Xplore](https://ieeexplore.ieee.org/document/5392028/)
- [ACM Digital Library](https://dl.acm.org/doi/10.1147/rd.111.0025)
- [Full text (UVA)](https://www.cs.virginia.edu/~evans/greatworks/tomasulo.pdf)

First implemented in the **IBM System/360 Model 91** floating-point unit. The Model 91 had a pipelined floating-point adder and a pipelined floating-point multiplier/divider, and Tomasulo's algorithm coordinated scheduling across both.

### 4.2 Key Innovations

1. **Register renaming via tags:** Eliminates WAW (write-after-write) and WAR (write-after-read) hazards without stalling, unlike the earlier scoreboard approach (CDC 6600).
2. **Reservation stations:** Distributed scheduling — each functional unit has its own set of reservation stations that buffer instructions and their operands.
3. **Common Data Bus (CDB):** A broadcast bus that delivers computed results to all reservation stations and the register file simultaneously, enabling data forwarding.

### 4.3 Data Structures

#### Reservation Station Fields

| Field | Description |
|-------|-------------|
| **Op** | The operation to perform (e.g., ADD, MUL, DIV) |
| **Vj** | Value of source operand 1 (when available) |
| **Vk** | Value of source operand 2 (when available) |
| **Qj** | Tag of reservation station producing Vj (0 if Vj is ready) |
| **Qk** | Tag of reservation station producing Vk (0 if Qk is ready) |
| **A** | Address field for loads/stores (effective address or immediate) |
| **Busy** | Indicates whether this reservation station is occupied |

#### Register Status Table

| Field | Description |
|-------|-------------|
| **Qi** | For each architectural register: the tag of the reservation station that will produce the register's next value. If blank/0, the register file holds the current value. |

### 4.4 Three Stages of Operation

#### Stage 1: Issue (In-Order)

1. Fetch next instruction from the instruction queue (in program order).
2. Check if a reservation station of the correct type is free.
   - If **no free RS**: structural hazard -- stall (do not issue).
   - If **free RS**: issue the instruction to the reservation station.
3. Read available operands from the register file into Vj/Vk.
4. For any operand not yet available (Qi in the register status is non-zero), record the producing RS tag into Qj or Qk instead.
5. **Register renaming occurs here:** Update the register status table so that the destination register now points to this reservation station's tag.

#### Stage 2: Execute (Out-of-Order)

1. A reservation station monitors the CDB, watching for broadcasts that match its Qj or Qk tags.
2. When a matching result appears on the CDB, the reservation station captures the value into Vj or Vk and clears the corresponding Q field.
3. When **both** Qj == 0 and Qk == 0 (both operands ready) **and** the functional unit is free, execution begins.
4. For loads/stores: first compute the effective address, then access memory.
5. Execution takes a variable number of cycles depending on the operation (e.g., ADD = 2 cycles, MUL = 10 cycles, DIV = 40 cycles on the Model 91).

#### Stage 3: Write Result (Out-of-Order)

1. When execution completes, the result is placed on the **Common Data Bus (CDB)**.
2. The CDB broadcasts the result tag and value to:
   - All reservation stations (they snoop for matching Qj/Qk tags)
   - The register file (if the register status still points to this tag)
3. The reservation station is freed (Busy = 0).

### 4.5 Handling Hazards

| Hazard | Resolution |
|--------|------------|
| **RAW** (Read After Write) | Operand forwarding via CDB snooping; RS waits until operand is broadcast |
| **WAR** (Write After Read) | Eliminated by register renaming — source operands are captured at issue time |
| **WAW** (Write After Write) | Eliminated by register renaming — only the last writer's tag appears in the register status |

### 4.6 Limitations of Original Tomasulo

- **No precise exceptions:** Results are written out of order, so the machine state may not correspond to any sequential point. Modern implementations add a **Reorder Buffer (ROB)** to commit results in program order.
- **Single CDB bottleneck:** Only one result can be broadcast per cycle on the CDB. Modern designs use multiple broadcast buses.
- **No speculative execution:** The original algorithm does not predict branches. Modern OoO processors add speculation + ROB.

---

## 5. Modern Branch Predictor Accuracy

### 5.1 TAGE Predictor (TAgged GEometric History Length)

**Inventor:** Andre Seznec (INRIA/IRISA)

**Key Papers:**
- A. Seznec, "A case for (partially) TAgged GEometric history length branch prediction," *Journal of Instruction-Level Parallelism*, Vol. 8, 2006. [PDF](https://jilp.org/vol8/v8paper1.pdf)
- A. Seznec, "A New Case for the TAGE Branch Predictor," *MICRO 2011*. [PDF](https://www.cs.cmu.edu/~18742/papers/Seznec2011.pdf)
- A. Seznec, "A 256 Kbits L-TAGE Branch Predictor," [PDF](https://www.irisa.fr/caps/people/seznec/L-TAGE.pdf)
- A. Seznec, "TAGE-SC-L Branch Predictors," *CBP 2014*. [PDF](https://jilp.org/cbp2014/paper/AndreSeznec.pdf)

#### Architecture

TAGE consists of:

1. **Base predictor $T_0$:** A simple tagless bimodal predictor indexed by PC, providing a default prediction.
2. **Tagged components $T_1, T_2, \ldots, T_n$:** Multiple partially-tagged predictor tables, each indexed using a hash of the PC combined with global branch history of a specific length.
3. **Geometric history lengths:** The history lengths used to index each component form a geometric series: $L(i) = \alpha^{i-1} \cdot L(1)$, typically ranging from ~5 to ~640+ branches.

#### Prediction Mechanism

- All components are looked up in parallel.
- The prediction comes from the **longest-matching** component (the table indexed with the longest history that has a tag match).
- If no tagged component matches, the base predictor $T_0$ provides the prediction.
- This is analogous to **PPM** (Prediction by Partial Matching) in data compression.

#### Why TAGE Works So Well

- **Tagging** allows the predictor to use very long history lengths without excessive aliasing — entries are associated with specific branch+history contexts.
- **Geometric history series** captures correlations at multiple time scales — short loops, medium-range patterns, and long-range behaviors.
- History lengths up to ~640 branches are practical because tagging prevents destructive aliasing.

#### Competition Results

- TAGE won **CBP-2** (2nd Championship Branch Prediction) and **CBP-3**, significantly outperforming all competitors at equivalent storage budgets.
- The enhanced **TAGE-SC-L** variant (TAGE with Statistical Corrector and Loop predictor) won **CBP-4** (2014) and **CBP-5** (2016).

### 5.2 Perceptron Branch Predictor

**Inventor:** Daniel A. Jimenez (UT Austin, later Rutgers / Texas A&M)

**Key Papers:**
- D. A. Jimenez and C. Lin, "Dynamic Branch Prediction with Perceptrons," *HPCA 2001*. [PDF](https://www.cs.utexas.edu/~lin/papers/hpca01.pdf)
- D. A. Jimenez, "Neural Methods for Dynamic Branch Prediction," *ACM TOCS*, 2002. [PDF](https://www.cs.utexas.edu/~lin/papers/tocs02.pdf)
- D. A. Jimenez, "Fast Path-Based Neural Branch Prediction," *MICRO 2003*. [PDF](https://www.cecs.uci.edu/~papers/micro03/pdf/jimenez-FastPath.pdf)

#### Design

Each branch is associated with a **perceptron** (single-layer neural network) — a vector of integer weights $w_0, w_1, \ldots, w_n$:

$$y = w_0 + \sum_{i=1}^{n} w_i \cdot x_i$$

where $x_i \in \{-1, +1\}$ is the outcome of the $i$-th most recent branch (taken = +1, not taken = -1), and $w_0$ is a bias weight.

- **Predict taken** if $y \geq 0$, **not taken** if $y < 0$.
- **Training:** On a misprediction or when $|y| \leq \theta$ (the training threshold), update weights: $w_i = w_i + t \cdot x_i$ where $t$ is the actual outcome (+1 or -1).

#### Key Advantage

Hardware resources scale **linearly** with history length $n$ (just $n+1$ weights per entry), compared to **exponentially** ($2^n$ entries) for table-based predictors like gshare. This allows perceptron predictors to use much longer histories (up to 62+ branches in Jimenez's original work).

#### Accuracy Results (4 KB hardware budget, SPEC 2000)

| Predictor | Misprediction Rate | Improvement |
|-----------|-------------------|-------------|
| gshare | 6.2% | baseline |
| Perceptron (global) | 4.6% | 26% reduction vs gshare |
| McFarling hybrid (Alpha 21264 style) | 5.4% | baseline |
| Perceptron (global/local) | 4.6% | 14% reduction vs hybrid |

### 5.3 Real-World Accuracy Numbers

**Source:** [Branch Prediction Is Not A Solved Problem (2019)](https://arxiv.org/pdf/1906.08170)

| Metric | Typical Range | Notes |
|--------|---------------|-------|
| SPEC 2000 bimodal (large) | ~93.5% correct | Saturates around this level |
| gshare (4 KB) | ~93.8% correct | ~6.2% misprediction rate |
| Perceptron (4 KB) | ~95.4% correct | ~4.6% misprediction rate |
| TAGE-SC-L (64 KB) | ~97-98% correct | Depends on workload |
| Modern server workloads | Variable | 3.6-20% cycles wasted from misprediction (avg ~9.2%) |
| Intel Xeon E5440 average MPKI | ~6.50 | Mispredictions per kilo-instruction |
| State-of-art enhanced predictors | MPKI ~3.4 | TAGE-SC-L with hard-to-predict subsystems |

### 5.4 Championship Branch Prediction (CBP)

**Source:** [CBP Homepage (JILP)](https://jilp.org/cbp/), [CBP-2016](https://jilp.org/cbp2016/), [CBP-2025 at ISCA](https://www.sigarch.org/call-contributions/championship-branch-prediction-cbp2025-isca-2025/)

| Competition | Year | Notable Results |
|-------------|------|-----------------|
| CBP-1 | 2004 | Established standardized evaluation framework |
| CBP-2 | 2006 | TAGE wins, outperforms all prior designs |
| CBP-3 | 2011 | TAGE variants dominate |
| CBP-4 | 2014 | TAGE-SC-L (TAGE + Statistical Corrector + Loop predictor) wins |
| CBP-5 | 2016 | 440+ traces from Samsung (mobile + server). TAGE-SC-L variants dominate. |
| CBP-6 | 2025 | Upcoming, held at ISCA 2025 in Tokyo |

---

## 6. Intel Alder Lake / Raptor Lake Pipeline Details

### 6.1 Golden Cove Microarchitecture (12th Gen Alder Lake P-cores, 2021)

**Sources:**
- [WikiChip Fuse: Intel Details Golden Cove](https://fuse.wikichip.org/news/6111/intel-details-golden-cove-next-generation-big-core-for-client-and-server-socs/)
- [AnandTech: Golden Cove Deep Dive](https://www.anandtech.com/show/16881/a-deep-dive-into-intels-alder-lake-microarchitectures/3)
- [Chips and Cheese: Popping the Hood on Golden Cove](https://chipsandcheese.com/p/popping-the-hood-on-golden-cove)
- [Golden Cove Wikipedia](https://en.wikipedia.org/wiki/Golden_Cove)

#### Frontend

| Parameter | Golden Cove | Previous (Sunny Cove) |
|-----------|------------|----------------------|
| Fetch width | 32 bytes/cycle | 16 bytes/cycle |
| Decoders | 6 (6-wide decode) | 4 (+ 1 simple) |
| Micro-op cache (DSB) | 4K entries | ~2.25K entries |
| Micro-op cache delivery | 8 uops/cycle | 6 uops/cycle |
| L1 BTB | ~6K entries | ~5K entries |
| L2 BTB | ~12K entries | ~5K entries |
| Branch mispredict penalty | 17 cycles (best case) | 16 cycles |

#### Execution Engine

| Parameter | Golden Cove | Previous (Sunny Cove) |
|-----------|------------|----------------------|
| Allocate width | 6-wide | 5-wide |
| Execution ports | 12 | 10 |
| Integer ALU pipes | 5 | 4 |
| Integer LEA units | 5 (single-cycle) | - |
| ROB (Reorder Buffer) | 512 entries | 352 entries |
| ALU scheduler | 97 entries | 80 entries |
| Load queue | 192 entries | 128 entries |
| Store queue | 114 entries | 72 entries |
| Vector/FP register file | 332 entries | 224 entries |
| Integer register file | Not disclosed | Not disclosed |

#### Raptor Cove (13th Gen Raptor Lake, 2022)

Raptor Cove is essentially Golden Cove with:
- Larger **2 MB L2 cache** (up from 1.25 MB)
- Higher maximum clock speeds
- Same pipeline widths, ROB size, and execution units as Golden Cove

#### Pipeline Depth

Intel does not publicly disclose exact pipeline stage counts, but the 17-cycle minimum branch mispredict penalty implies a pipeline depth of approximately **17-20 stages** from fetch through execute.

### 6.2 Cache Hierarchy

| Level | Golden Cove | Notes |
|-------|------------|-------|
| L1I | 32 KB, 8-way | Instruction cache |
| L1D | 48 KB, 12-way | Data cache, 5-cycle latency |
| L2 | 1.25 MB (Alder Lake) / 2 MB (Raptor Lake) | Unified, inclusive |
| L3 | Shared ring bus, up to 30 MB | Shared across P-cores + E-cores |

---

## 7. AMD Zen 4 / Zen 5 Pipeline Details

### 7.1 Zen 4 (Ryzen 7000, EPYC 9004, 2022)

**Sources:**
- [AnandTech: Zen 4 Execution Pipeline](https://www.anandtech.com/show/17585/amd-zen-4-ryzen-9-7950x-and-ryzen-5-7600x-review-retaking-the-high-end/8)
- [Chips and Cheese: AMD's Zen 4 Part 1](https://chipsandcheese.com/p/amds-zen-4-part-1-frontend-and-execution-engine)
- [WikiChip: Zen 4](https://en.wikichip.org/wiki/amd/microarchitectures/zen_4)

#### Frontend

| Parameter | Zen 4 | Zen 3 |
|-----------|-------|-------|
| Fetch width | 32 bytes/cycle | 32 bytes/cycle |
| Decode width | 4-wide | 4-wide |
| Op cache (micro-op cache) | 6.75K entries | 4K entries |
| Op cache delivery | 9 uops/cycle | 8 uops/cycle |
| L1 BTB | 1,536 entries | 1,024 entries |
| L2 BTB | 7,168 entries | 6,500 entries |
| Taken branches/cycle | 2 | 1 |

#### Execution Engine

| Parameter | Zen 4 | Zen 3 |
|-----------|-------|-------|
| Dispatch width | 6-wide | 6-wide |
| Integer rename width | 6-wide | 6-wide |
| Integer execution ports | 4 ALU + 3 AGU | 4 ALU + 3 AGU |
| FP execution ports | 4 pipes (2 FMUL, 2 FADD) | 4 pipes |
| Integer scheduler | 4 x 24 = 96 entries | 4 x 24 = 96 entries |
| FP scheduler | 2 x 32 = 64 entries | 2 x 32 = 64 entries |
| ROB (Retire Queue) | 320 entries | 256 entries |
| Load queue | 88 entries | 72 entries |
| Store queue | 64 entries | 48 entries |
| Integer register file | 224 registers | ~192 registers |
| FP register file | 192 registers | ~160 registers |

### 7.2 Zen 5 (Ryzen 9000, EPYC 9005, 2024)

**Sources:**
- [Chips and Cheese: Discussing AMD's Zen 5 at Hot Chips 2024](https://chipsandcheese.com/p/discussing-amds-zen-5-at-hot-chips-2024)
- [WikiChip: Zen 5](https://en.wikichip.org/wiki/amd/microarchitectures/zen_5)
- [Tom's Hardware: Zen 5 Microarchitecture](https://www.tomshardware.com/pc-components/cpus/amd-deep-dives-zen-5-ryzen-9000-and-strix-point-cpu-rdna-35-gpu-and-xdna-2-architectures/4)
- [HWCooling: AMD confirms Zen 5 details](https://www.hwcooling.net/en/amd-confirms-zen-5-details-6-alus-full-performance-avx-512en/)

#### Frontend

| Parameter | Zen 5 | Zen 4 |
|-----------|-------|-------|
| Decoders | 2 x 4-wide (8 total) | 1 x 4-wide |
| Op cache | 6K entries | 6.75K entries |
| Op cache delivery | up to 12 uops/cycle (6x2) | 9 uops/cycle |
| L1 BTB | 16K entries | 1,536 entries |
| L2 BTB | 8K entries | 7,168 entries |
| Taken branches/cycle | 2 taken + 2 ahead | 2 taken |
| Branch predictor | 2-Ahead TAGE | Standard TAGE |

#### Execution Engine

| Parameter | Zen 5 | Zen 4 |
|-----------|-------|-------|
| Dispatch width | 8-wide | 6-wide |
| Integer rename width | 8-wide | 6-wide |
| FP rename width | 6-wide | 6-wide |
| Integer ALU ports | 6 | 4 |
| AGU ports | 4 | 3 |
| Total integer execution ports | 16 | 10 |
| Loads/cycle | 2 x 512-bit | 3 x 256-bit |
| Stores/cycle | 1 x 512-bit | 2 x 256-bit |
| ROB (Retire Queue) | 448 entries | 320 entries |
| Execution window | 40% larger than Zen 4 | baseline |
| Integer register file | 240 entries (64-bit) | 224 entries |
| FP register file | 384 entries (512-bit) | 192 entries |
| AVX-512 | Native 512-bit datapath | 256-bit (double-pumped) |

#### Zen 5's 2-Ahead Branch Predictor

A distinctive feature of Zen 5 is its **2-ahead branch predictor** — an idea dating to the 1990s, now realized:

- Traditional predictors predict one branch per cycle, and if the branch is taken, the next cycle must fetch from the new target.
- Zen 5 predicts **two taken branches** per cycle across a non-contiguous block. The first prediction feeds into a second prediction in the same cycle.
- This effectively doubles fetch throughput for branch-heavy code, reducing the taken-branch bandwidth penalty.

**Source:** [Chips and Cheese: Zen 5's 2-Ahead Branch Predictor Unit](https://chipsandcheese.com/p/zen-5s-2-ahead-branch-predictor-unit-how-30-year-old-idea-allows-for-new-tricks)

### 7.3 AMD vs. Intel Comparison (2024 generation)

| Parameter | AMD Zen 5 | Intel Golden Cove |
|-----------|-----------|-------------------|
| Decode width | 8-wide (2x4) | 6-wide |
| ROB | 448 | 512 |
| Integer ALUs | 6 | 5 |
| Load queue | ~88 (est.) | 192 |
| Store queue | ~64 (est.) | 114 |
| Micro-op cache | 6K | 4K |
| Execution ports | 16 | 12 |
| L1 BTB | 16K | ~6K |
| L2 BTB | 8K | ~12K |

---

## 8. Amdahl's Law and Gustafson's Law

### 8.1 Amdahl's Law

**Source:** Gene Amdahl, "Validity of the single processor approach to achieving large scale computing capabilities," *AFIPS Spring Joint Computer Conference*, 1967.

- [Wikipedia: Amdahl's Law](https://en.wikipedia.org/wiki/Amdahl%27s_law)

#### Statement

The speedup $S$ of a program using $n$ parallel processors is limited by the fraction of the program that must execute sequentially.

#### Derivation

Let:
- $T$ = total execution time on 1 processor
- $p$ = fraction of execution time that is parallelizable ($0 \leq p \leq 1$)
- $(1-p)$ = fraction that is inherently sequential
- $n$ = number of processors

Sequential time: $(1-p) \cdot T$ (unchanged regardless of $n$)

Parallel time: $\frac{p \cdot T}{n}$ (divided among $n$ processors)

Total time with $n$ processors:

$$T(n) = (1-p) \cdot T + \frac{p \cdot T}{n}$$

Speedup:

$$S(n) = \frac{T}{T(n)} = \frac{T}{(1-p) \cdot T + \frac{p \cdot T}{n}} = \frac{1}{(1-p) + \frac{p}{n}}$$

#### Maximum Speedup (as $n \to \infty$)

$$S_{\max} = \lim_{n \to \infty} \frac{1}{(1-p) + \frac{p}{n}} = \frac{1}{1-p}$$

#### Example Calculations

| Sequential Fraction $(1-p)$ | Parallelizable $p$ | $n=4$ | $n=16$ | $n=64$ | $n=\infty$ |
|------|------|-------|--------|---------|-------------|
| 5%   | 95%  | 3.48x | 10.67x | 14.25x  | 20.0x       |
| 10%  | 90%  | 3.08x | 6.40x  | 8.77x   | 10.0x       |
| 25%  | 75%  | 2.29x | 3.37x  | 3.82x   | 4.0x        |
| 50%  | 50%  | 1.60x | 1.88x  | 1.97x   | 2.0x        |

**Key insight:** Even with 95% parallelizable code, the maximum speedup is capped at 20x regardless of how many processors you add. The serial bottleneck dominates.

### 8.2 Gustafson's Law (Gustafson-Barsis Law)

**Source:** John Gustafson, "Reevaluating Amdahl's Law," *Communications of the ACM*, Vol. 31, No. 5, pp. 532-533, May 1988.

- [Wikipedia: Gustafson's Law](https://en.wikipedia.org/wiki/Gustafson%27s_law)

#### Key Insight

Amdahl's Law assumes a **fixed problem size** (strong scaling). Gustafson's Law assumes the problem size **grows with the number of processors** (weak scaling) — that is, given more processors, users tend to solve larger problems rather than solving the same problem faster.

#### Formula

$$S(n) = n - (n-1) \cdot s$$

where:
- $n$ = number of processors
- $s$ = fraction of execution time that is sequential (measured on the parallel system)

Equivalently: $S(n) = (1-s) \cdot n + s$

This is a **linear** function of $n$, so speedup scales much more optimistically than Amdahl's Law predicts.

#### Example

If 10% of runtime is sequential ($s = 0.1$) on 16 processors:
- **Gustafson:** $S = 16 - 15 \times 0.1 = 14.5\times$
- **Amdahl:** $S = \frac{1}{0.1 + 0.9/16} = 6.4\times$

The difference arises because Gustafson assumes the parallel work scales up with more processors (the 10% serial part stays the same absolute time while the parallel part grows).

### 8.3 Reconciliation

The two laws are **not contradictory** — they answer different questions:

| | Amdahl's Law | Gustafson's Law |
|---|---|---|
| **Question** | "How much faster with $n$ processors on the *same* problem?" | "How much *more work* with $n$ processors in the *same time*?" |
| **Scaling model** | Strong scaling (fixed problem) | Weak scaling (growing problem) |
| **Perspective** | Pessimistic | Optimistic |
| **Best for** | Latency-bound, fixed-size tasks | Throughput-bound, scalable workloads |

### 8.4 Practical Implications

1. **Processor design:** Amdahl's Law motivates fast single-thread performance — the serial fraction matters enormously.
2. **GPU computing:** Gustafson's Law explains why GPUs are effective — users scale problem sizes (larger batches, more data) to match available parallelism.
3. **Critical path analysis:** In pipeline design, the longest pipeline stage limits throughput (analogous to the serial fraction).

---

## 9. Branch Target Buffer (BTB) and Return Address Stack (RAS)

### 9.1 Branch Target Buffer (BTB)

**Sources:**
- [Imperial College: Branch Target Prediction](https://www.doc.ic.ac.uk/~phjk/AdvancedCompArchitecture/Lectures/pdfs/Ch03-part2-BranchTargetPrediction.pdf)
- [ScienceDirect: Branch Target Buffer overview](https://www.sciencedirect.com/topics/computer-science/branch-target-buffer)

#### Purpose

The BTB stores the **target address** of recently executed branch instructions. When the processor fetches an instruction, it simultaneously looks up the BTB to determine:
1. Whether this address is a branch
2. If so, where it will jump to

This allows the processor to redirect fetch **before the instruction is even decoded**, eliminating bubble cycles.

#### Structure

```
┌────────────────────────────────────────────────────┐
│  BTB Entry                                         │
├──────────┬──────────┬──────────┬───────────────────┤
│   Tag    │  Target  │  Type    │ Valid / LRU bits   │
│  (PC)    │ Address  │ (B/J/C/R)│                    │
└──────────┴──────────┴──────────┴───────────────────┘
```

- **Tag:** Upper bits of the branch instruction's PC (for lookup).
- **Target address:** Where the branch jumps to.
- **Type field:** Encodes the kind of branch — conditional, unconditional jump, call, or return.
- **Associativity:** Typically 4-way set-associative.

#### Operation

1. **Fetch stage:** Index into BTB using the fetch PC.
2. **Hit:** If tag matches and entry is valid, use stored target as the next fetch address (combined with direction prediction from the branch predictor).
3. **Miss:** Continue fetching sequentially; update BTB when the branch resolves.

#### Multi-Level BTB in Modern Processors

Modern CPUs use hierarchical BTB structures:

| Processor | L1 BTB | L2 BTB | Notes |
|-----------|--------|--------|-------|
| Intel Golden Cove | ~6K entries | ~12K entries | ML-based capacity management |
| AMD Zen 4 | 1,536 entries | 7,168 entries | 2 branches/cycle |
| AMD Zen 5 | 16K entries | 8K entries | L2 as victim cache |

**Intel two-level BTB design:** The L1 BTB is conceptually part of the instruction cache, tracking two branches per 64-byte cache line (~1024 conceptual entries). The L2 BTB provides a much larger backing store.

**AMD BTB design (Zen 4):** Each L1 BTB entry can store up to **two branch targets** if the first branch is conditional and both branches reside within the same aligned 64-byte cache line.

### 9.2 Return Address Stack (RAS)

#### Purpose

The RAS is a small hardware stack that predicts the target of **return instructions** (RET). Since returns always go to the address of the instruction after the corresponding call, a stack structure naturally matches the call/return pattern.

#### Operation

1. **On CALL:** Push the return address (PC + instruction_length) onto the RAS.
2. **On RET:** Pop the top of the RAS and use it as the predicted target.
3. This provides near-perfect return prediction for programs with typical call depths.

#### Sizes in Modern Processors

| Processor | RAS Depth | Notes |
|-----------|-----------|-------|
| Intel (various) | 16-32 entries | Varies by microarchitecture |
| AMD Zen family | 32 entries | Per hardware thread |
| Typical academic designs | 8-16 entries | Sufficient for most code |

#### Accuracy

RAS is extremely accurate (>99%) for typical programs because call/return pairs are inherently stack-structured. Mispredictions occur primarily with:
- **Stack overflow:** Call depth exceeds RAS capacity (rare in practice).
- **Mismatched call/return:** Longjmp, exceptions, coroutine switches, or deliberate stack manipulation.
- **Speculative corruption:** Speculative calls/returns can corrupt the RAS; modern designs use **checkpointing** to restore the RAS on misspeculation.

### 9.3 Interaction Between BTB, RAS, and Branch Direction Predictor

```
                    ┌─────────────────┐
    Fetch PC ──────►│     BTB         │──── Target address
                    │  (Is it a       │     (for jumps, calls)
                    │   branch? Type?)│
                    └────────┬────────┘
                             │ Type = ?
                    ┌────────┼────────┐
                    │        │        │
                    ▼        ▼        ▼
              Conditional  Call    Return
                    │        │        │
                    ▼        │        ▼
          ┌─────────────┐   │  ┌──────────┐
          │  Direction  │   │  │   RAS    │
          │  Predictor  │   │  │  (Pop)   │
          │(TAGE/Percep)│   │  └────┬─────┘
          └──────┬──────┘   │       │
                 │          │       │
                 ▼          ▼       ▼
          Taken/Not?    Push RAS   Use RAS target
          If taken:     + use BTB  as next fetch PC
          use BTB       target
          target
```

**Pipeline integration:**
- **BTB, RAS, and direction predictor all operate in the fetch stage**, providing a prediction in the same cycle or the cycle after fetch.
- **Calls** use the BTB for the target prediction AND push the return address onto the RAS.
- **Returns** use the RAS (not the BTB) for their target prediction.
- **Conditional branches** use the BTB for the target and the direction predictor (TAGE, perceptron, etc.) for taken/not-taken.
- **Unconditional jumps** use the BTB for the target (always taken).

### 9.4 Security Implications

The BTB and RAS have been implicated in speculative execution attacks:
- **Spectre v2 (Branch Target Injection):** Attacker poisons BTB entries to redirect speculative execution to attacker-controlled gadgets.
- **ret2spec:** Attacker manipulates the RAS to speculatively redirect returns.
- **Mitigations:** Retpolines, IBRS, STIBP, and microcode updates that flush or partition the BTB/RAS across security boundaries.

**Source:** [ret2spec: Speculative Execution Using Return Stack Buffers](https://arxiv.org/pdf/1807.10364)

---

## Appendix: Summary Comparison Table — Modern CPU Microarchitectures

| Feature | Intel Golden Cove (2021) | Intel Raptor Cove (2022) | AMD Zen 4 (2022) | AMD Zen 5 (2024) |
|---------|-------------------------|-------------------------|-------------------|-------------------|
| Decode width | 6-wide | 6-wide | 4-wide | 2x4-wide (8) |
| Micro-op cache | 4K entries | 4K entries | 6.75K entries | 6K entries |
| Allocate/Dispatch | 6-wide | 6-wide | 6-wide | 8-wide |
| ROB | 512 | 512 | 320 | 448 |
| Integer ALUs | 5 | 5 | 4 | 6 |
| Execution ports | 12 | 12 | 10 (int) + 6 (FP) | 16 (int) |
| Load queue | 192 | 192 | 88 | ~88 (est.) |
| Store queue | 114 | 114 | 64 | ~64 (est.) |
| L1 BTB | ~6K | ~6K | 1,536 | 16K |
| L2 BTB | ~12K | ~12K | 7,168 | 8K |
| L2 cache | 1.25 MB | 2 MB | 1 MB | 1 MB |
| Branch mispredict penalty | 17 cycles | 17 cycles | ~13 cycles | ~13 cycles |
| AVX-512 | Supported (disabled in Alder Lake desktop) | Supported (disabled) | Double-pumped 256-bit | Native 512-bit |
