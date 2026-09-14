# Research Findings

Research during ideation used **ScholarXIV** to search academic and related literature, then followed the papers and reports that surfaced. This document records those findings. It does not invent interviews, experiments, or statistics beyond what the cited sources report.

The findings informed a **product hypothesis**. They do not prove that Voice-First Business Assistant is novel, complete, or already the right solution.

## Themes that emerged

### 1. Digital-skill and usability barriers among small-business owners

Across several surveys of African microenterprises, **skills, awareness, and product complexity** appear alongside cost as reasons digital tools are not used for business.

Research ICT Africa’s After Access work on African microenterprises reports that among microenterprise owners who have a mobile phone, only 36% owned a smartphone, and that even among those who can access the internet, at least half do not use that access for business activities. Combined, 41% of microenterprises in that write-up cited skills, lack of awareness of business benefit, or products that are too complicated (20% skills, 12% awareness, 10% complexity), with cost of a smartphone also prominent (33%). ([Research ICT Africa, 2024](https://researchictafrica.net/2024/02/02/back-to-basics-the-state-of-digital-technology-use-for-african-microenterprises/))

Country reports in the same After Access programme repeat the pattern:

- In Nigeria, over 80% of surveyed microenterprises owned a mobile phone, but only 13% used the internet for business. 37% said they lacked the skills to use the internet productively (complexity or proficiency). Over 90% reported no digital-skills training for themselves or employees. ([Research ICT Africa, 2024, Nigeria](https://researchictafrica.net/wp-content/uploads/2024/11/Digital-Technology-Adoption-by-Microenterprises-Nigeria-Report_Policy-Paper_AA_2408.pdf))
- In Ethiopia, about 95% of surveyed microenterprises did not have internet access; lack of knowledge and the need for training were major barriers alongside device cost. ([Research ICT Africa, 2024, Ethiopia](https://researchictafrica.net/wp-content/uploads/2024/12/Digital-technology-adoption-Ethiopia-microenterprises_Report_AA_2411.pdf))

An IFC summary of related survey work reports that less than 7% of African microenterprises used smartphones and computers for business, while 71% saw no need for them. Among non-users, 35% cited cost and 34% said they did not know how to use the technologies. The same summary notes that useful apps may not be designed for existing skill levels or local languages. ([IFC, 2023](https://www.ifc.org/en/insights-reports/2023/digital-technologies-in-africa))

**Reading for this project:** a tool that assumes form-filling, menu literacy, and a new admin workflow is likely to collide with the same barriers, even if the underlying accounting idea is sound.

### 2. Low adoption of sophisticated digital business tools among microenterprises

World Bank work on firm digitalization in Africa describes **incomplete digitalization**: access to a phone, computer, or internet is much more common than intensive use of digital tools for administration, planning, sales, and payments.

In *Digital Opportunities in African Businesses*, nationally representative evidence from Burkina Faso, Ethiopia, Ghana, Kenya, Malawi, and Senegal is reported as follows: 86% of firms with five or more workers have access to one or more digital enablers; 23% are digitally enabled but do not adopt digital technologies for productive tasks; 39% adopt them but not intensively; on average only 24% make intensive use of the most sophisticated digital technology they have adopted in a business function; and only 11% make intensive use of advanced digital technologies for general business functions such as enterprise resource planning. The bulk of firms continue to rely on manual methods. Additional data covering Ethiopia, Ghana, Kenya, Nigeria, South Africa, Tanzania, and Uganda indicate that the gap is wider among microbusinesses (fewer than five employees). (Cirera, Cruz, and Reyes Ortega, World Bank; overview figures as published in [Digital Opportunities in African Businesses](https://www.sipotra.it/wp-content/uploads/2024/05/DIGITAL-OPPORTUNITIES-in-African-Businesses.pdf))

**Reading for this project:** “there are already apps for this” does not mean microenterprises use those apps as the system of record.

### 3. Record keeping and the gap between information and insight

A separate literature describes **weak or informal record keeping**, and a further gap between having notes and using them for decisions.

Qualitative and survey studies of informal and micro traders document indigenous methods (notebooks, tallies, memory, social witnesses) rather than double-entry books, and associate missing records with weaker financial control. For example, work on petty traders in Kumasi describes indigenous and improvised practices rather than formal accounting systems (Agyei-Mensah and related SME record-keeping literature; see Amoako, Marfo, Gyabaah, and Gyamfi, “Are Accounting Gurus in Sync with Petty Traders’ Indigenous and Innovative Record-Keeping?”). Studies of informal-sector SMEs in South Africa report that a majority of surveyed entities do not practise financial record-keeping, and that inadequate records are a recognized operational weakness (see “The influence of demographic variables on financial record-keeping in small- and medium-sized enterprises in the South African informal sector”).

Microsoft Research Africa’s work on Kenyan SMBs adds a related point: even when digital tools exist, they often fail to match **ways of working** — mobile-first, time-constrained, and socially coupled. Awori et al. (2022) introduce **socio-tecture**: business and social relations are tightly coupled, and technology adoption is often social and collective rather than a solo software decision. ([Awori et al., 2022](https://doi.org/10.1145/3555584))

Dukawalla’s later field work (below) treats “raw business data → actionable insight” as an unsolved practical problem for the SMBs they studied, not as a solved product category.

**Reading for this project:** capture and insight are different problems. A log that is never queried still leaves the owner deciding from memory.

### 4. Voice and conversational interfaces for African small businesses

Existing research explores voice and conversational interfaces as a way to lower the cost of interacting with business data.

The most directly relevant work found is **Dukawalla**, a Microsoft Research Africa prototype: a mobile-first, voice-oriented assistant that records business data by speech, uses an LLM to turn unstructured speech into structured CSV “books,” and presents bite-sized visualizations. It was deployed with seven SMBs in Nairobi (qualitative two-week use after rapid ethnography). ([Ankrah, Nyairo, Muchai, Awori, Ochieng, Kariuki, and O’Neill, arXiv:2505.05170](https://arxiv.org/abs/2505.05170); [project page](https://www.microsoft.com/en-us/research/project/dukawalla/))

Findings from that deployment are mixed and useful:

- Owners hoped voice would be faster than typing.
- In use, voice recording competed with serving customers and was sometimes socially awkward.
- Noise, code-mixing (English / Swahili / local terms), and colloquial currency talk (“bob”, dropped “hundred”) caused speech-recognition and structuring errors.
- Turning free speech into predetermined sale columns was error-prone; LLMs lacked local language and business context.

The paper treats voice as **an opportunity that still has serious interaction, ASR, and structuring problems**, not as a finished answer.

Related HCI work cited in that paper (for example Følstad and Brandtzæg on chatbots as conversational partners, and mobile-business-app limitations around small screens and input error) supports investigating conversational interfaces. It does not establish that a voice-first operating assistant of this project’s design already works.

## Overlap with Dukawalla — stated explicitly

**Dukawalla demonstrates substantial overlap with “voice-based business assistance.”** A voice-first assistant that captures SMB activity and returns insights is not a novel category invented here.

This project is **not** claiming that “a voice business assistant” is new.

The investigation instead asks whether a **more structured architecture** can address a weakness visible in that prior work: unstructured speech was mapped into CSV columns by an LLM, and structuring errors followed. The hypothesis explored in later notes is:

- voice as the **interaction layer**;
- **validated business events** as the data layer;
- **persistent business state** as the source of truth;
- **deterministic calculations** for numbers;
- AI for interpretation and explanation, not as the ledger.

That is a design bet, not a research conclusion that this architecture has been shown to outperform Dukawalla or any other system.

## Limits of this research pass

- No original user interviews or field experiments were conducted for this hackathon ideation record.
- ScholarXIV was used as a search surface; citations above are to the underlying papers and reports, not to ScholarXIV as a publisher.
- Statistics come from the cited surveys and should not be treated as Ethiopia-only or as a census of all microbusinesses.
- Nothing in this file is evidence that the planned product will be adopted.
