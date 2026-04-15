#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

const CreateStructureSchema = z.object({
  base_path: z.string().describe("The absolute path where the structure should be created."),
  structure: z.string().describe("The tree-like structure string (e.g., 'src/\\n  main.ts')."),
  files_content: z.record(z.string(), z.string()).optional().describe("A map of relative file paths to their content."),
});

type CreateStructureArgs = z.infer<typeof CreateStructureSchema>;

const server = new Server(
  {
    name: "constract",
    version: "1.0.5",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

function parseAndCreate(basePath: string, structure: string, filesContent: Record<string, string> = {}) {
  const lines = structure.split(/\r?\n/);
  const stack: { depth: number; path: string }[] = [{ depth: -1, path: basePath }];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Detect indent level
    const match = line.match(/[a-zA-Z0-9_\+\-\.\[\]]/);
    if (!match || match.index === undefined) continue;

    const depth = match.index;
    let content = line.slice(depth).trim();

    // Strip comments
    if (content.includes(" #")) {
      content = content.split(" #")[0].trim();
    } else if (content.includes("  ")) {
      const parts = content.split(/\s{2,}/);
      if (parts.length > 1) {
        content = parts[0].trim();
      }
    }

    // Guess if it's a directory
    let isDir = content.endsWith("/") || (!content.includes(".") && !content.startsWith("+"));
    const commonExtensions = [".svelte", ".js", ".ts", ".css", ".html", ".json", ".md", ".py", ".jsx", ".tsx"];
    if (commonExtensions.some(ext => content.endsWith(ext))) {
      isDir = false;
    }

    const name = content.replace(/\/$/, "");
    if (!name) continue;

    // Pop stack to find correct parent
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    const parentPath = stack[stack.length - 1].path;
    const currentPath = path.join(parentPath, name);
    const relativePath = path.relative(basePath, currentPath);

    if (isDir) {
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath, { recursive: true });
      }
      stack.push({ depth, path: currentPath });
    } else {
      const dirName = path.dirname(currentPath);
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }
      
      const fileContent = filesContent[relativePath] || "";
      fs.writeFileSync(currentPath, fileContent);
    }
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_structure",
        description: "Creates a file and directory structure from a tree-like text input. Optionally populates files with content.",
        inputSchema: {
          type: "object",
          properties: {
            base_path: {
              type: "string",
              description: "The absolute path where the structure should be created."
            },
            structure: {
              type: "string",
              description: "The tree-like structure (e.g., 'src/\\n  main.ts\\n  utils/\\n    helper.ts')"
            },
            files_content: {
              type: "object",
              additionalProperties: {
                type: "string"
              },
              description: "Optional map of relative file paths to their content."
            }
          },
          required: ["base_path", "structure"]
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "create_structure") {
    const args = CreateStructureSchema.parse(request.params.arguments);
    try {
      parseAndCreate(args.base_path, args.structure, args.files_content);
      return {
        content: [
          {
            type: "text",
            text: `Successfully created structure at ${args.base_path}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error creating structure: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
