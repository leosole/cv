# RAG Data Structure - Documentation

## Overview
The CV RAG system now uses intelligently chunked, metadata-rich data instead of naive paragraph splitting. This significantly improves retrieval quality and relevance.

- **Data Source**: `data/CHUNKS.json` - Pre-structured, semantic chunks
- **Chunking**: Intelligent division by logical units (roles, achievements, skills, education)
- **Metadata**: Rich context (type, company, skills, dates, impact, specializations)
- **Retrieval**: Top 5 most relevant chunks (increased from 3) formatted with type labels
- **Result**: Better context relevance and more accurate LLM responses

## Data Structure

### CHUNKS.json Format
```json
{
  "chunks": [
    {
      "id": "unique-identifier",
      "type": "employment|achievement|skills|education|research|background|contact|summary",
      "text": "Full semantic chunk with complete thought/concept",
      "metadata": {
        "category": "...",
        "company": "...",
        "skills": ["..."],
        "start_date": "YYYY-MM",
        "impact": "..."
        // Additional context-specific fields
      }
    }
  ]
}
```

### Chunk Types
- **contact**: Contact information
- **summary**: Professional summary
- **employment**: Job role description
- **achievement**: Specific accomplishment with impact
- **education**: Degree or academic program
- **research**: Research project or publication
- **background**: Career narrative or context
- **skills**: Skill category with proficiencies

## How It Works

### 1. Chunking Strategy
Each chunk is a self-contained semantic unit. For example:
- ❌ **Bad**: "Led the migration of the public..." (truncated mid-sentence)
- ✅ **Good**: "Portal Modernization: Led the migration [...] through server-side rendering and static generation."

### 2. Metadata Enrichment
Each chunk includes structured metadata that helps the retrieval system understand context:
- Skills used in a project
- Company and date range
- Impact metrics
- Project categories
- Technical domains

### 3. Retrieval & Formatting
When retrieving context for a query:
```
[ACHIEVEMENT]
Portal Modernization: Led the migration...

---

[SKILLS]
Frontend Frameworks: React, Next.js, Vite...
```

### 4. LLM Instructions
The chat handler now provides clear instructions about:
- Who Leo is (Full Stack Engineer)
- What kinds of questions to expect
- How to handle missing information
- The importance of accuracy and professionalism

## Benefits

✅ **Better Relevance**: Semantically meaningful chunks match queries more accurately
✅ **Rich Context**: Metadata enables smarter retrieval and disambiguation
✅ **Type Clarity**: LLM knows what type of information it's working with
✅ **Self-Contained Units**: No fragmented thoughts or split achievements
✅ **Scalability**: Easy to add new chunks while maintaining structure
✅ **Quality**: Follows established RAG best practices

## File Structure

```
data/
  ├── MASTER_DATA.md      (source of truth - unchanged)
  ├── SKILLS.md           (source of truth - unchanged)
  └── CHUNKS.json         (structured for RAG - NEW)

netlify/functions/
  └── chat.ts             (improved with metadata handling)

scripts/
  └── seed-pinecone.ts    (updated to ingest CHUNKS.json)
```

## Maintenance

### When to Update Chunks
1. Add new experience/projects → Add achievement chunks
2. Learn new skills → Add/update skill chunks
3. Update existing info → Modify corresponding chunk
4. Change contact info → Update contact chunk

### How to Regenerate Pinecone Index
```bash
npm run seed
```

This will:
1. Read CHUNKS.json
2. Generate embeddings for each chunk
3. Upload to Pinecone with metadata
4. Replace old index

## Testing Checklist

After updating chunks:
- [ ] `npm run seed` completes successfully
- [ ] Test chat with common questions ("What's Leo's background?")
- [ ] Test skill queries ("Does Leo know React?")
- [ ] Test project queries ("Tell me about the design system")
- [ ] Verify response accuracy and relevance
- [ ] Check that metadata is properly preserved

---

**Last Updated**: Current build
**Version**: 2.0 (Structured Chunking)
