'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff, Settings } from 'lucide-react';
import { useAdvancedStore } from '@/stores/advanced-store';

const EMBEDDING_MODELS = [
  { id: 'text-embedding-3-small', name: 'text-embedding-3-small', defaultDim: 1024 },
  { id: 'text-embedding-3-large', name: 'text-embedding-3-large', defaultDim: 3072 },
  { id: 'text-embedding-ada-002', name: 'text-embedding-ada-002', defaultDim: 1536 },
];

const CHAT_MODELS = [
  { id: 'gpt-5.2', name: 'GPT-5.2' },
  { id: 'gpt-4.1', name: 'GPT-4.1' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano' },
];

export function AdvancedApiKeyInput() {
  const {
    openaiApiKey,
    setOpenaiApiKey,
    embeddingModel,
    setEmbeddingModel,
    setEmbeddingDimension,
    chatModel,
    setChatModel,
  } = useAdvancedStore();
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('openai-api-key');
    if (stored) setOpenaiApiKey(stored);
  }, [setOpenaiApiKey]);

  const handleSave = () => {
    sessionStorage.setItem('openai-api-key', openaiApiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEmbeddingModelChange = (modelId: string) => {
    setEmbeddingModel(modelId);
    const model = EMBEDDING_MODELS.find((m) => m.id === modelId);
    if (model) setEmbeddingDimension(model.defaultDim);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
      {/* API Key */}
      <div className="flex-1 max-w-md">
        <Label htmlFor="adv-api-key" className="text-sm font-medium">
          OpenAI API 키
        </Label>
        <div className="mt-1.5 flex gap-2">
          <div className="relative flex-1">
            <Input
              id="adv-api-key"
              type={showKey ? 'text' : 'password'}
              placeholder="sk-..."
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            {saved ? '설정됨!' : '설정'}
          </Button>
        </div>
      </div>

      {/* Separator */}
      <div className="hidden sm:block h-9 w-px bg-border" />

      {/* Embedding Model */}
      <div className="w-48">
        <Label className="text-sm font-medium">임베딩 모델</Label>
        <Select value={embeddingModel} onValueChange={handleEmbeddingModelChange}>
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EMBEDDING_MODELS.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Separator */}
      <div className="hidden sm:block h-9 w-px bg-border" />

      {/* Chat Model */}
      <div className="w-40">
        <Label className="text-sm font-medium">채팅 모델</Label>
        <Select value={chatModel} onValueChange={setChatModel}>
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHAT_MODELS.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
