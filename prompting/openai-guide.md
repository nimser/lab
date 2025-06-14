Guidelines
============
sources:
- [Joshua Vial](https://codewithjv.com/)'s "Build with LLMs" lecture.
- [General guide](https://platform.openai.com/docs/guides/text?api-mode=responses)
- [GPT-4.1 Guide](https://cookbook.openai.com/examples/gpt4-1_prompting_guide)
- [o-series Guide](https://platform.openai.com/docs/guides/reasoning-best-practices)

# For GPT-4.1
## Key strategies

**Be eplicit & specific** - GPT-4.1 follows instructions literally. State exactly what you want, including output format, style, and constraints.

**Sandwich Method** - Place critical instructions at both the beginning and end of long prompts to ensure they're not missed.

**Multiple Constraints** - Clearly enumerate what the model should and shouldn't do in numbered lists for clarity.

## Techniques

**Format Specification** - Precisely define output structures (JSON, tables, sections) with examples to ensure consistency.

**Few-shot Examples** - Provide 2-3 high-quality examples for complex or unusual formats. Structure as: instructions → examples → final task.

**Step-by-Step Reasoning** - For complex problems, explicitly request step-by-step thinking: "Think through this carefully, step by step."


# For o-series models (e.g. o4-mini)

## Key strategies

**Minimal Prompting** - Use simple, direct questions without excessive context or instructions. O-Series models perform worse with too many examples or detailed guidance.

**Zero-shot Preferred** - These models are optimized for zero-shot or at most one-shot prompting. Avoid multiple examples.

**Let it Reason** - Don't instruct how to solve the problem; just clearly state the problem itself. The model conducts internal reasoning naturally.


# Examples

```
+-------------------------------------------------------------------------------------------------------+
|               GPT-4.1 Prompt                   |               o-series Prompt                        |
|=======================================================================================================|
| Analyze this sales dataset to identify trends: | Analyze this sales dataset.                          |
| 1. First, summarize revenue patterns           | Identify trends, top performers, underperforming     |
| 2. Then, identify top 3 products               | segments, and suggest actions to improve sales.      |
| 3. Next, find underperforming segments         |                                                      |
| 4. Finally, recommend 3 specific actions       |                                                      |
|                                                |                                                      |
| Format with clear headings.                    |                                                      |
|-------------------------------------------------------------------------------------------------------|
| Create a React component that displays a       | Write a React component for a paginated data         |
| paginated data table with requirements:        | table with sorting, search, and responsive           |
| 1. Support for sorting columns                 | design using Tailwind CSS.                           |
| 2. Search functionality across all fields      |                                                      |
| 3. Responsive design for mobile and desktop    |                                                      |
| 4. Use only Tailwind CSS for styling           |                                                      |
| 5. Include error handling for API failures     |                                                      |
|-------------------------------------------------------------------------------------------------------|
| Write a blog post about renewable energy for a | Write a technical blog post about renewable          |
| technical audience. The post should:           | energy challenges, technologies, and future outlook. |
| - Be approximately 1200 words                  |                                                      |
| - Use a professional but accessible tone       |                                                      |
| - Include 3 sections: current challenges,      |                                                      |
| - promising technologies, and future outlook   |                                                      |
| - Cite recent developments since 2023          |                                                      |
| - Include a brief executive summary at the     |                                                      |
|   beginning                                    |                                                      |
+-------------------------------------------------------------------------------------------------------+
```













