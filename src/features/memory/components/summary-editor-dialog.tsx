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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { TEXT_LIMITS } from '@/config/app';
import type { ConversationSummary } from '@/features/chat/storage/types';

interface SummaryEditorDialogProps {
  onOpenChange: (open: boolean) => void;
  onSave: (input: { conversationId: string; summary: string }) => Promise<boolean> | void;
  open: boolean;
  saving: boolean;
  summary: ConversationSummary | null;
  t: (key: string) => string;
}

export function SummaryEditorDialog({
  onOpenChange,
  onSave,
  open,
  saving,
  summary,
  t,
}: SummaryEditorDialogProps) {
  const [content, setContent] = useState(() => summary?.summary ?? '');
  const isInvalid = useMemo(() => content.trim().length === 0, [content]);

  const handleSave = async () => {
    if (!summary || isInvalid) {
      return;
    }

    const success = await onSave({
      conversationId: summary.id,
      summary: content.trim(),
    });

    if (success !== false) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('memory_page.summaries.edit_title')}</DialogTitle>
          <DialogDescription>{t('memory_page.summaries.edit_description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="conversation-summary-content">
            {t('memory_page.summaries.content_label')}
          </label>
          <Textarea
            id="conversation-summary-content"
            maxLength={TEXT_LIMITS.CONVERSATION_SUMMARY}
            onChange={(event) => setContent(event.target.value)}
            rows={8}
            value={content}
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
