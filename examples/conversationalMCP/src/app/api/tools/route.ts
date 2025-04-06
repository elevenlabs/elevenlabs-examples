import { NextRequest, NextResponse } from 'next/server';
import dotenv from "dotenv";
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

interface ServerConfig {
  command: string;
  args: string[];
  env: Record<string, string>;
}

class MCPClient {
  private mcp: Client;
  private transport: StdioClientTransport | null = null;
  public tools: Tool[] = [];

  constructor() {
    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
  }

  async connectToServer(command: string, args: string[], env: Record<string, string>) {
    try {
      this.transport = new StdioClientTransport({
        command,
        args,
        env,
      });
      this.mcp.connect(this.transport);
      
      const toolsResult = await this.mcp.listTools();
      this.tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        };
      });
      console.log(
        "Connected to server with tools:",
        this.tools.map(({ name }) => name)
      );
      return this.tools;
    } catch (e) {
      console.log("Failed to connect to MCP server: ", e);
      throw e;
    }
  }

  async processQuery(toolName: string, toolArgs: any) {
    const result = await this.mcp.callTool({
      name: toolName,
      arguments: toolArgs,
    });
    return result.content;
  }
}

const mcp = {
  "mcpServers": {
    "ElevenLabs": {
      "command": "/Users/angelogiacco/.nvm/versions/node/v20.18.1/bin/node",
      "args": [
        "/Users/angelogiacco/.nvm/versions/node/v20.18.1/bin/npx", 
        "-y", 
        "@angelogiacco/elevenlabs-mcp-server"
      ],
      "env": {
        "ELEVENLABS_API_KEY": process.env.ELEVENLABS_API_KEY || "",
        "PATH": process.env.PATH || ""
      }
    }
  }
}

const mcpClients: Record<string, MCPClient> = {};

export async function GET(request: NextRequest) {
  try {
    const mcpClient = new MCPClient();
    await mcpClient.connectToServer(mcp.mcpServers.ElevenLabs.command, mcp.mcpServers.ElevenLabs.args, mcp.mcpServers.ElevenLabs.env);
    return NextResponse.json({ tools: mcpClient.tools });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a server configuration request
    if (body.action === 'configure') {
      const { mcpServers } = body.config;
      
      if (!mcpServers || typeof mcpServers !== 'object') {
        return NextResponse.json(
          { error: "Invalid MCP configuration: 'mcpServers' object is required" },
          { status: 400 }
        );
      }
      
      const toolsByServer: Record<string, Tool[]> = {};
      
      for (const [serverName, serverConfig] of Object.entries(mcpServers) as [string, ServerConfig][]) {
        try {
          // Validate server config
          if (!serverConfig.command) {
            return NextResponse.json(
              { error: `Server ${serverName} is missing command` },
              { status: 400 }
            );
          }
          if (!Array.isArray(serverConfig.args)) {
            return NextResponse.json(
              { error: `Server ${serverName} args must be an array` },
              { status: 400 }
            );
          }
          
          // Create client for this server
          mcpClients[serverName] = new MCPClient();
          const tools = await mcpClients[serverName].connectToServer(
            serverConfig.command,
            serverConfig.args,
            serverConfig.env
          );
          
          toolsByServer[serverName] = tools;
        } catch (error) {
          console.error(`Error initializing server ${serverName}:`, error);
          return NextResponse.json(
            { error: `Failed to initialize server ${serverName}: ${(error as Error).message}` },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Successfully configured ${Object.keys(mcpServers).length} MCP servers`,
        tools: toolsByServer
      });
    }
    
    // Check if this is a tool execution request
    if (body.action === 'execute') {
      const { serverName, toolName, args } = body;
      
      if (!serverName || !toolName || !args) {
        return NextResponse.json(
          { error: "Missing required parameters: serverName, toolName, and args are required" },
          { status: 400 }
        );
      }
      
      // Get the client for this server
      const client = mcpClients[serverName];
      if (!client) {
        return NextResponse.json(
          { error: `Server ${serverName} is not configured. Call 'configure' action first.` },
          { status: 400 }
        );
      }
      
      const result = await client.processQuery(toolName, args);
      return NextResponse.json({ success: true, result });
    }
    
    return NextResponse.json(
      { error: "Invalid action. Supported actions: 'configure', 'execute'" },
      { status: 400 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
