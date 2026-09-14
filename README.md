# radioindex.org-rights

The rights and copyright provenance slice of the dataset behind **Radio Index** — historical registrations, renewals, public domain statutory terms, and archival provenance records.

## What is in here

Everything sits under `rights/` at the repo root:

```
rights/series/{id}.json
rights/broadcasts/{id}.json
```

## The sibling repos

The dataset is six repositories — one per slice, each holding its slice at its own repo root, plus the schema they are all written against.

| Repo | Path | Holds |
| :--- | :--- | :--- |
| [radioindex.org-catalog](https://github.com/thearchiveofamericanradio/radioindex.org-catalog) | `catalog/` | Identity, genres, artwork, credits, dates, people, documents, program runs |
| [radioindex.org-meta](https://github.com/thearchiveofamericanradio/radioindex.org-meta) | `meta/series/` | One meta document per program and per recording |
| [radioindex.org-stream](https://github.com/thearchiveofamericanradio/radioindex.org-stream) | `stream/series/` | Audio stream urls and byte sizes |
| [radioindex.org-subtitles](https://github.com/thearchiveofamericanradio/radioindex.org-subtitles) | `subtitles/series/` | Transcript tracks |
| [radioindex.org-rights](https://github.com/thearchiveofamericanradio/radioindex.org-rights) (this one) | `rights/` | Copyright, renewal, and provenance records |
| [radioindex.org-schema](https://github.com/thearchiveofamericanradio/radioindex.org-schema) | — | The specification every document declares itself against |

## Endpoint

Served at `https://rights.radioindex.org/rights/{type}/{id}.json`.
