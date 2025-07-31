import React, { useState } from 'react';
import { Copy, Check, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface FullJsonEditorProps {
  currentJson?: any;
  onJsonUpdate?: (newJson: any) => void;
  templateName?: string;
}

function useCopyToClipboard(): [string | null, (text: string) => Promise<boolean>] {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = React.useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy];
}

export function FullJsonEditor({ 
  currentJson = {
    regions: ["US", "EU"],
    paymentProviders: ["stripe", "paypal"],
    shipping_options: ["standard", "express"],
    categories: ["electronics", "clothing"],
    products: []
  }, 
  onJsonUpdate = () => {}, 
  templateName = "Custom" 
}: FullJsonEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [, copy] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  const startEditing = () => {
    setJsonText(JSON.stringify(currentJson, null, 2));
    setError('');
    setIsEditing(true);
  };

  const copyToClipboard = async () => {
    try {
      const success = await copy(JSON.stringify(currentJson, null, 2));
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const validateAndApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      
      const requiredKeys = ['regions', 'paymentProviders', 'shipping_options', 'categories', 'products'];
      const missingKeys = requiredKeys.filter(key => !parsed[key] || !Array.isArray(parsed[key]));
      
      if (missingKeys.length > 0) {
        setError(`Missing required arrays: ${missingKeys.join(', ')}`);
        return;
      }

      onJsonUpdate(parsed);
      setError('');
      setIsEditing(false);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {templateName} Setup Configuration
        </Label>
        {templateName === 'Custom' && (
          <p className="text-xs text-muted-foreground">
            Start with our template or bring your own. Copy this configuration, customize it with AI, and paste it back to create your perfect store setup in seconds.
          </p>
        )}
      </div>

      <div className="relative">
        <div className="bg-muted rounded-lg border">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">JSON Configuration</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="h-7 px-2"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              {templateName === 'Custom' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={isEditing ? cancelEditing : startEditing}
                  className="h-7 px-2"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              )}
            </div>
          </div>
          
          <div className="p-3">
            {isEditing ? (
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full font-mono text-xs h-[397px] resize-none border-0 p-0 bg-transparent focus:outline-none whitespace-pre overflow-auto"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
              />
            ) : (
              <pre className="text-xs overflow-auto h-[400px] whitespace-pre-wrap break-words text-foreground">
                <code>{JSON.stringify(currentJson, null, 2)}</code>
              </pre>
            )}
          </div>
          
          {isEditing && error && (
            <div className="mx-3 mb-3 bg-destructive/10 border border-destructive/20 rounded-md p-2">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
          
          <div className="flex items-center gap-2 justify-end p-3 pt-0">
            <Button
              size="sm"
              onClick={validateAndApply}
              disabled={!isEditing}
            >
              Apply Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}