"use client";

import { useEffect, useState, useRef } from "react";

// Define interfaces for the MCP configuration
interface MCPServerConfig {
  command: string;
  args: string[];
  env: Record<string, string>;
}

interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
}

// Define params for client tools
interface RedirectToDocsParams { path: string; }
interface RedirectToEmailParams { subject: string; body: string; }
interface RedirectToSupportFormParams { subject: string; description: string; extraInfo: string; }
interface RedirectToExternalURLParams { url: string; }
interface MCPRequestParams { serverName: string; endpoint: string; data: any; }
interface ElevenLabsCallEvent extends Event { 
  detail: { config: { clientTools: any } } 
}

// MCPClient class to interact with API
class MCPClient {
  private config: MCPConfig;
  private serverTools: Record<string, Tool[]> = {};
  
  constructor(config: MCPConfig) {
    this.config = config;
  }
  
  setServerTools(tools: Record<string, Tool[]>) {
    this.serverTools = tools;
  }
  
  getServerNames() {
    return Object.keys(this.config.mcpServers);
  }
  
  getServerConfig(name: string) {
    return this.config.mcpServers[name];
  }
  
  getTools(serverName?: string) {
    if (serverName) {
      return this.serverTools[serverName] || [];
    }
    return this.serverTools;
  }
  
  async makeRequest(serverName: string, toolName: string, args: any) {
    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          serverName,
          toolName,
          args
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute tool');
      }
      
      return data.result;
    } catch (error) {
      console.error('Error executing tool:', error);
      throw error;
    }
  }
  
  async configure() {
    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'configure',
          config: this.config
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to configure MCP servers');
      }
      
      this.setServerTools(data.tools);
      return data;
    } catch (error) {
      console.error('Error configuring MCP servers:', error);
      throw error;
    }
  }
}

// Add window.next declaration
declare global {
  interface Window {
    next?: {
      router: {
        push: (path: string) => void;
      };
    };
  }
}

export default function Home() {
  const [config, setConfig] = useState<MCPConfig>({ mcpServers: {} });
  const [configLoaded, setConfigLoaded] = useState(false);
  const [configPreview, setConfigPreview] = useState("{\n  \"mcpServers\": {}\n}");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mcpClientRef = useRef<MCPClient | null>(null);

  // Handle JSON file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (configLoaded) {
      return; // Prevent changes after initial configuration is loaded
    }

    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonContent = e.target?.result as string;
        const parsedConfig = JSON.parse(jsonContent) as MCPConfig;
        
        // Validate config
        if (!parsedConfig.mcpServers || typeof parsedConfig.mcpServers !== 'object') {
          throw new Error("Invalid MCP configuration: 'mcpServers' object is required");
        }
        
        // Validate each server has required fields
        Object.entries(parsedConfig.mcpServers).forEach(([name, server]) => {
          if (!server.command) {
            throw new Error(`Server ${name} is missing command`);
          }
          if (!Array.isArray(server.args)) {
            throw new Error(`Server ${name} args must be an array`);
          }
          if (!server.env || typeof server.env !== 'object') {
            throw new Error(`Server ${name} is missing env object`);
          }
        });
        
        // Set config and create MCP client
        setConfig(parsedConfig);
        setConfigPreview(JSON.stringify(parsedConfig, null, 2));
        setConfigLoaded(true);
      } catch (error) {
        console.error('Error parsing MCP configuration:', error);
        setError(`Error parsing MCP configuration: ${(error as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!configLoaded) {
      setError('Please upload a configuration file first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const client = new MCPClient(config);
      mcpClientRef.current = client;
      
      // Configure MCP servers via API
      await client.configure();
      
      // Set configured state to trigger UI change
      setIsConfigured(true);
    } catch (error) {
      console.error('Error configuring MCP servers:', error);
      setError(`Error configuring MCP servers: ${(error as Error).message}`);
      setIsLoading(false);
    }
  };

  // Inject ElevenLabs widget when configured
  useEffect(() => {
    if (!isConfigured) return;
    
    const ID = 'elevenlabs-convai-widget-60993087-3f3e-482d-9570-cc373770addc';
    
    function injectElevenLabsWidget() {
      // Check if the widget is already loaded
      if (document.getElementById(ID)) {
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://elevenlabs.io/convai-widget/index.js';
      script.async = true;
      script.type = 'text/javascript';
      document.head.appendChild(script);

      // Create the wrapper and widget
      const wrapper = document.createElement('div');
      wrapper.className = 'widget-wrapper fade-in';

      const widget = document.createElement('elevenlabs-convai') as HTMLElement;
      widget.id = ID;
      widget.setAttribute('agent-id', 'UsGMYWKZCf6BeTMuzdb8');
      widget.setAttribute('variant', 'full');

      // Add resize listener for mobile detection
      window.addEventListener('resize', () => {
        updateWidgetVariant(widget);
      });

      function updateWidgetVariant(widget: HTMLElement) {
        const isMobile = window.innerWidth <= 640; // Common mobile breakpoint
        if (isMobile) {
          widget.setAttribute('variant', 'expandable');
        } else {
          widget.setAttribute('variant', 'full');
        }
      }

      function updateWidgetColors(widget: HTMLElement) {
        const isDarkMode = !document.documentElement.classList.contains('light');
        if (isDarkMode) {
          widget.setAttribute('avatar-orb-color-1', '#2E2E2E');
          widget.setAttribute('avatar-orb-color-2', '#B8B8B8');
        } else {
          widget.setAttribute('avatar-orb-color-1', '#4D9CFF');
          widget.setAttribute('avatar-orb-color-2', '#9CE6E6');
        }
      }

      // Listen for the widget's "call" event to inject client tools
      widget.addEventListener('elevenlabs-convai:call', (event: Event) => {
        if (!mcpClientRef.current) return;
        
        const customEvent = event as ElevenLabsCallEvent;
        const allTools = mcpClientRef.current.getTools();
        
        // Create dynamic client tools from MCP server tools
        const dynamicTools: Record<string, Function> = {};
        
        // Add each MCP tool as a client tool
        Object.entries(allTools).forEach(([serverName, tools]) => {
          tools.forEach((tool: Tool) => {
            const toolFunction = async (args: any) => {
              try {
                const result = await mcpClientRef.current?.makeRequest(serverName, tool.name, args);
                return { result };
              } catch (error) {
                return { error: (error as Error).message };
              }
            };
            
            // Register tool with server prefix to avoid name collisions
            dynamicTools[`${serverName}_${tool.name}`] = toolFunction;
          });
        });
        
        // Add standard navigation tools
        customEvent.detail.config.clientTools = {
          ...dynamicTools,
          
          // Standard navigation tools
          redirectToDocs: ({ path }: RedirectToDocsParams) => {
            const router = window?.next?.router;
            if (router) {
              router.push(path);
            }
          },
          redirectToEmailSupport: ({ subject, body }: RedirectToEmailParams) => {
            const encodedSubject = encodeURIComponent(subject);
            const encodedBody = encodeURIComponent(body);
            window.open(
              `mailto:team@elevenlabs.io?subject=${encodedSubject}&body=${encodedBody}`,
              '_blank'
            );
          },
          redirectToSupportForm: ({ subject, description, extraInfo }: RedirectToSupportFormParams) => {
            const baseUrl = 'https://help.elevenlabs.io/hc/en-us/requests/new';
            const ticketFormId = '13145996177937';
            const encodedSubject = encodeURIComponent(subject);
            const encodedDescription = encodeURIComponent(description);
            const encodedExtraInfo = encodeURIComponent(extraInfo);

            const fullUrl = `${baseUrl}?ticket_form_id=${ticketFormId}&tf_subject=${encodedSubject}&tf_description=${encodedDescription}%3Cbr%3E%3Cbr%3E${encodedExtraInfo}`;

            window.open(fullUrl, '_blank', 'noopener,noreferrer');
          },
          redirectToExternalURL: ({ url }: RedirectToExternalURLParams) => {
            window.open(url, '_blank', 'noopener,noreferrer');
          },
          
          // Basic MCP utility tools
          mcpGetServerNames: () => {
            if (!mcpClientRef.current) {
              return { error: "MCP configuration not loaded" };
            }
            return { servers: mcpClientRef.current.getServerNames() };
          },
          mcpGetServerTools: (serverName: string) => {
            if (!mcpClientRef.current) {
              return { error: "MCP configuration not loaded" };
            }
            const tools = mcpClientRef.current.getTools(serverName);
            if (!tools || tools.length === 0) {
              return { error: `No tools found for server ${serverName}` };
            }
            return { tools };
          }
        };
      });

      // Initialize widget with current viewport and color theme
      updateWidgetVariant(widget);
      updateWidgetColors(widget);
      
      // Attach widget to the DOM
      wrapper.appendChild(widget);
      document.body.appendChild(wrapper);
    }

    injectElevenLabsWidget();

    // Cleanup function
    return () => {
      const widget = document.getElementById(ID);
      if (widget && widget.parentElement) {
        document.body.removeChild(widget.parentElement);
      }
      
      window.removeEventListener('resize', () => {});
    };
  }, [isConfigured]);

  return (
    <div 
      className={`min-h-screen transition-all duration-700 flex items-center justify-center ${isConfigured ? 'bg-cover bg-center' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}
      style={isConfigured ? { backgroundImage: 'url(/landing_image.png)' } : {}}
    >
      {!isConfigured ? (
        <div className="w-full max-w-2xl p-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">ConversationalMCP</h1>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Upload MCP Servers Configuration</h2>
            
            <form onSubmit={handleSubmit}>
              <label 
                htmlFor="file-upload" 
                className={`flex flex-col items-center justify-center border-2 border-dashed ${configLoaded ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'} rounded-lg p-8 text-center cursor-pointer transition-colors mb-6`}
              >
                <svg className={`w-12 h-12 mb-3 ${configLoaded ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg> 
                
                {configLoaded ? (
                  <>
                    <p className="text-lg font-medium text-green-700 mb-2">Configuration Loaded!</p>
                    <p className="text-sm text-green-600">Ready to start the conversation.</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium text-gray-700 mb-1">Click or drag file to this area to upload</p>
                    <p className="text-sm text-gray-500">Please upload your `mcp_servers.json` file</p>
                  </>
                )}
                <input 
                  type="file" 
                  accept=".json" 
                  className="sr-only"
                  id="file-upload"
                  onChange={handleFileUpload}
                  disabled={configLoaded || isLoading}
                />
              </label>
              
              {configLoaded && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2 text-gray-600">Server Configuration Preview:</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-48 text-sm border border-gray-200">
                    {configPreview}
                  </pre>
                </div>
              )}
              
              {error && (
                <div className="mb-6 p-4 bg-red-100 rounded-lg border border-red-300 text-red-800 text-sm">
                  <span className="font-medium">Error:</span> {error}
                </div>
              )}
              
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : configLoaded ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  disabled={!configLoaded || isLoading}
                >
                  {isLoading ? 'Setting up MCP servers...' : 'Start Conversation'}
                </button>
              </div>
            </form>
          </div>
          <p className="text-center text-gray-500 text-sm mt-8">
            Built with ❤️ by <a href="https://elevenlabs.io" className="text-indigo-600 hover:underline">ElevenLabs</a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
