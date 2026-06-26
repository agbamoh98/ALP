# AI Service Prompts

Prompts are loaded from the root `/prompts/` directory at the project root.

The AI service reads prompt files at startup and caches them. When prompt files are updated, the service reloads them on the next request cycle.

See `/prompts/` in the repository root for all prompt files.
