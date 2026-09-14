# Existing Approaches

This comparison looks at how microbusiness activity is captured and used today, based on the research gathered in [02-research-findings.md](./02-research-findings.md). It is not a market report and does not rank vendors.

Each approach can work for some operators. The notes below record what the literature and related field work say it **enables**, and which **limitations** were identified — without claiming that any one approach is universally failing.

## Manual / paper records

**What it enables**

Paper, notebooks, wall marks, tallies, and memory are immediately available. They require no device, no airtime, and no new workflow. Studies of informal traders document indigenous record-keeping that is purpose-driven: who owes whom, what was sold, what must be restocked.

**Limitations identified**

Records are often incomplete, delayed, or discarded once the immediate need passes. Reconstructing history, cash position, or receivables then depends on the owner’s memory and on documents that do not query easily. Several SME/informal-sector studies treat weak record keeping as a barrier to financial control and later formal processes (loans, tax, performance review). Paper also does not by itself produce analysis; the owner still has to interpret the notebook.

This project did not independently measure how many businesses keep paper books.

## Conventional mobile business applications

**What it enables**

Smartphone apps can structure sales, stock, expenses, and reports. They can become a digital ledger when they are actually used as the system of record.

**Limitations identified**

Adoption of sophisticated digital business tools among microenterprises is low relative to phone access (World Bank incomplete-digitalization evidence; IFC and Research ICT Africa surveys). Reported barriers include cost, digital skills, product complexity, local-language fit, and “no perceived need.” Awori et al. (2022) add that Kenyan SMB tool choice is often social and that work is mobile-first and time-constrained; tools that ignore that context are a poor fit even when they exist.

Dukawalla’s motivation statement is consistent with this: many tools are not designed for SMB ways of working. That is a research claim about fit, not a proof that every business app fails.

## SMS / USSD

**What it enables**

SMS and USSD work on basic phones, need little or no mobile data, and are already familiar from airtime and mobile money. They are strong at short, structured transactions and confirmations.

**Limitations identified**

These channels are constrained by session length, tiny screens of text, menu depth, and timeouts. They are a poor fit for open-ended activity capture (“sold spinach on credit to Amina”) or for exploring business state. Mobile-money and USSD systems also tend to record **payments**, not inventory movements, receivables, or mixed cash/credit sales. Reporting that mobile money “lacks the manageability and reconciliation tools most businesses need” appears in industry commentary on MSME digital payments; this project treats that as a plausible limitation of payment rails as business ledgers, not as a measured finding from our own fieldwork.

## Conversational interfaces (text)

**What it enables**

Chat can reduce form-filling: the owner describes an event in language, and a system can ask follow-up questions. HCI literature on chatbots as reflection partners (for example Følstad and Brandtzæg, 2017, as cited in the Dukawalla paper) is one reason conversational capture is worth considering.

**Limitations identified**

Text still assumes literacy, typing, and attention on a screen during service. Conversational systems that let an LLM both interpret language **and** invent totals risk mixing language understanding with the ledger. Existing chatbot research is mostly not about microenterprise books of record.

## Voice interfaces

**What it enables**

Voice can be faster than typing when the owner’s hands and eyes are busy, and it matches spoken business language. Dukawalla showed that SMBs in Nairobi were interested in this idea and that speech can be turned into structured rows and simple visualizations.

**Limitations identified**

The same study showed that voice is not automatically usable:

- Recording during customer service can be socially disruptive.
- Some users found speaking records at work uncomfortable.
- Noise and code-mixing break monolingual ASR.
- Colloquial amounts and units confuse LLM structuring into fixed columns.
- Voice prompts are freer than text prompts, so scaffolding for consistent events is hard.

Voice is therefore a **hypothesis worth investigating**, with documented failure modes, not a proven replacement for paper, apps, or USSD.

## Summary for ideation

| Approach | Strength in this problem area | Recurring limitation in the sources |
| --- | --- | --- |
| Paper / memory | Always available, no training | Incomplete history; hard to analyze |
| Mobile business apps | Structured digital records | Skills, cost, complexity, low intensive use |
| SMS / USSD | Basic phones, familiar, offline-ish | Narrow, payment-centric, not a full ledger |
| Conversational text | Lower form-filling cost | Typing, literacy, screen attention |
| Voice | Hands-busy capture; spoken language | Social, ASR, and structuring failures |

No row in this table is “the winner.” The next note states the hypothesis the team chose to test in product form.
