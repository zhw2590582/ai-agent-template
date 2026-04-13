'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { MEMORY_KINDS, type MemoryKind, type MemoryListItem } from '@/features/memory/types';

interface MemoryEditorDialogProps {
  memory: MemoryListItem | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: { content: string; id: string; kind: MemoryKind }) => Promise<boolean> | void;
  open: boolean;
  saving: boolean;
  t: (key: string) => string;
}

export function MemoryEditorDialog({
  memory,
  onOpenChange,
  onSave,
  open,
  saving,
  t,
}: MemoryEditorDialogProps) {
  const [content, setContent] = useState(() => memory?.content ?? '');
  const [kind, setKind] = useState<MemoryKind>(() => memory?.kind ?? 'preference');

  const isInvalid = useMemo(() => content.trim().length === 0, [content]);

  const handleSave = async () => {
    if (!memory || isInvalid) {
      return;
    }

    const success = await onSave({
      content: content.trim(),
      id: memory.id,
      kind,
    });

    if (success !== false) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('memory_page.saved_memories.edit_title')}</DialogTitle>
          <DialogDescription>{t('memory_page.saved_memories.edit_description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="memory-kind">
              {t('memory_page.saved_memories.kind_label')}
            </label>
            <Select onValueChange={(value) => setKind(value as MemoryKind)} value={kind}>
              <SelectTrigger className="w-full" id="memory-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEMORY_KINDS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`memory_page.saved_memories.kind_${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="memory-content">
              {t('memory_page.saved_memories.content_label')}
            </label>
            <Textarea
              id="memory-content"
              maxLength={280}
              onChange={(event) => setContent(event.target.value)}
              value={content}
            />
          </div>

          <Input
            readOnly
            value={memory?.conversationId ?? t('memory_page.saved_memories.no_source')}
          />
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
            {t('common.cancel')}
          </Button>
          <Button disabled={isInvalid || saving} onClick={() => void handleSave()} type="button">
            {saving ? <Spinner data-icon="inline-start" /> : null}
            {t('memory_page.saved_memories.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
