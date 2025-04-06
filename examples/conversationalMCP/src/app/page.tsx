"use client";

import { useEffect, useState, useRef } from "react";
import { spawn } from "child_process";


interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

class MCPClient {
  private config: MCPConfig;
  private servers: Map<string, { process: any, url: string }> = new Map();
  
  constructor(config: MCPConfig) {
    this.config = config;
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
  const mcpClientRef = useRef<MCPClient | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (configLoaded) {
      // parse the file that was uploaded and set the con
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
        
        const client = new MCPClient(parsedConfig);
        mcpClientRef.current = client;
        
        setConfigLoaded(true);
      } catch (error) {
        console.error('Error parsing MCP configuration:', error);
        alert(`Error parsing MCP configuration: ${(error as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const ID = 'elevenlabs-convai-widget-60993087-3f3e-482d-9570-cc373770addc';
    // Create a reference to the observer for cleanup
    let mutationObserver: MutationObserver | null = null;
    
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
      wrapper.className = 'desktop';

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
        const customEvent = event as ElevenLabsCallEvent;
        customEvent.detail.config.clientTools = {
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
          
          // MCP-specific client tools
          mcpGetServerNames: () => {
            if (!mcpClientRef.current) {
              return { error: "MCP configuration not loaded" };
            }
            return { servers: mcpClientRef.current.getServerNames() };
          },
          mcpGetServerConfig: (name: string) => {
            if (!mcpClientRef.current) {
              return { error: "MCP configuration not loaded" };
            }
            const serverConfig = mcpClientRef.current.getServerConfig(name);
            if (!serverConfig) {
              return { error: `Server ${name} not found` };
            }
            return { config: serverConfig };
          },
          mcpMakeRequest: async ({ serverName, endpoint, data }: MCPRequestParams) => {
            if (!mcpClientRef.current) {
              return { error: "MCP configuration not loaded" };
            }
            try {
              const result = await mcpClientRef.current.makeRequest(serverName, endpoint, data);
              return { result };
            } catch (error) {
              return { error: (error as Error).message };
            }
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

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectElevenLabsWidget);
    } else {
      injectElevenLabsWidget();
    }

    // Cleanup function
    return () => {
      const widget = document.getElementById(ID);
      if (widget && widget.parentElement) {
        document.body.removeChild(widget.parentElement);
      }
      
      window.removeEventListener('resize', () => {});
    };
  }, []);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-8">ConversationalMCP</h1>
      
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload MCP Servers Configuration</h2>
        <div className={`border-2 border-dashed ${configLoaded ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors`}>
          {configLoaded ? (
            <p className="text-green-600 mb-2">MCP Configuration Loaded Successfully</p>
          ) : (
            <p className="text-gray-600 mb-2">Drag and drop your JSON file here, or click to select</p>
          )}
          <input 
            type="file" 
            accept=".json" 
            className={`w-full opacity-0 absolute inset-0 cursor-pointer ${configLoaded ? 'pointer-events-none' : ''}`}
            id="file-upload"
            onChange={handleFileUpload}
            disabled={configLoaded}
          />
          <button 
            className={`${configLoaded ? 'bg-green-500' : 'bg-blue-500'} text-white px-4 py-2 rounded-md ${configLoaded ? 'hover:bg-green-600' : 'hover:bg-blue-600'} mt-2`}
            disabled={configLoaded}
          >
            {configLoaded ? 'Configuration Loaded' : 'Select File'}
          </button>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium mb-2">Server Configuration Preview</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
            {configPreview}
          </pre>
        </div>
        
        {configLoaded && serverStatus && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-700">
              {serverStatus}
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Refresh the page to upload a different configuration.
            </p>

          </div>
        )}
      </div>
    </div>
  );
}
