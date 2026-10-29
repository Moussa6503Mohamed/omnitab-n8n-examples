# OmniTab n8n workflow examples

Free, reproducible workflow examples from [OmniTab](https://omnitab.tech), showing practical operational controls and explicit human oversight.

## Synthetic B2B request triage

**Status:** The original eight-node workflow was executed successfully in n8n. The final ten-node annotated export passes structural and local logic checks, but a fresh import of that exact export into n8n remains to be verified before Creator Hub submission.

| Property | Detail |
| --- | --- |
| JSON file | [Import the example](./workflows/synthetic-b2b-request-triage.json) |
| Trigger | Manual only |
| Inputs | Four fictional B2B requests |
| External services | None |
| Credentials, messaging, webhooks | None |
| Outputs | Human sales review, manual review, do not contact, investigation fallback |

### How to run

1. Create a new, inactive workflow in n8n.
2. Use *Import from File* and select `workflows/synthetic-b2b-request-triage.json`, or import the identical [public JSON](https://omnitab.tech/workflows/synthetic-b2b-request-triage.json).
3. Inspect the nodes. No external accounts or credentials are required.
4. Execute `Run Safe Sample` manually and inspect each output branch.

### Expected outcomes

| Example | Input condition | Route |
| --- | --- | --- |
| DEMO-001 | Contact permission true, valid email format, service given | Qualified, **human approval still required** |
| DEMO-002 | Missing email | Manual review |
| DEMO-003 | Permission to contact false | Do not contact |
| DEMO-004 | Missing service | Manual review |

Email-format checking is not mailbox validation. The example does not verify compliance, contact permission sources, duplicate records, CRM access, or lead qualification and does not message anyone.

### Standalone tests

Run with Node.js 20 or newer:

```bash
node scripts/verify-template.mjs
```

These tests confirm the embedded Code-node logic, connections and synthetic outputs. They **do not replace** a real clean import into n8n.

## License and disclosures

This sample is distributed under the [MIT License](LICENSE). All people and data are fictitious. No customer results, live engagement, official Creator Hub acceptance or savings claims are made.

[OmniTab demonstrations](https://omnitab.tech/demonstrations)
