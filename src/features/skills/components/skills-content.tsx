'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { WorkbenchDialogPanel } from '@/features/chat/components/workbench/workbench-dialog-panel';
import {
  buildSkillDefinitionFromPackage,
  toInstalledSkillPackage,
} from '@/features/skills/catalog';
import {
  SkillInstallDialog,
  type SkillDialogTarget,
} from '@/features/skills/components/skill-install-dialog';
import { SkillList } from '@/features/skills/components/skill-list';
import { SkillSearchDialog } from '@/features/skills/components/skill-search-dialog';
import { useSkillsSettings } from '@/features/skills/hooks/use-skills-settings';
import {
  ensureInstalledSkillsLoaded,
  readInstalledSkillPackages,
  removeInstalledSkillPackage,
  subscribeToInstalledSkillUpdates,
  upsertInstalledSkillPackage,
} from '@/features/skills/storage/local-installed-skills';
import type { InstalledSkillPackage, SkillsSettings } from '@/features/skills/types';

interface SkillsContentProps {
  onClose?: () => void;
  onSkillsSettingsChange: (
    updater: (settings: SkillsSettings) => SkillsSettings
  ) => Promise<boolean> | void;
  settings: SkillsSettings;
}

export function SkillsContent({ onClose, onSkillsSettingsChange, settings }: SkillsContentProps) {
  const t = useTranslations();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [installedSkillPackages, setInstalledSkillPackages] = useState<InstalledSkillPackage[]>([]);
  const [installedSkillsLoaded, setInstalledSkillsLoaded] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [selectedSkillTarget, setSelectedSkillTarget] = useState<SkillDialogTarget | null>(null);
  const {
    deleteSkill,
    isDirty,
    isSaving,
    localSettings,
    resetAndClose,
    save,
    saveSkill,
    showSaved,
    updateSettings,
  } = useSkillsSettings({
    onClose,
    onSkillsSettingsChange,
    saveFailedMessage: t('skills_page.toast.save_failed'),
    saveSuccessMessage: t('skills_page.toast.save_success'),
    settings,
  });

  useEffect(() => {
    const syncInstalledSkills = () => {
      setInstalledSkillPackages(readInstalledSkillPackages());
    };

    void (async () => {
      await ensureInstalledSkillsLoaded();
      syncInstalledSkills();
      setInstalledSkillsLoaded(true);
    })();

    return subscribeToInstalledSkillUpdates(syncInstalledSkills);
  }, []);

  useEffect(() => {
    if (!installedSkillsLoaded) {
      return;
    }

    updateSettings((current) => {
      const nextInstalledSkills = installedSkillPackages.map((skillPackage) => {
        const existingSkill = current.skills.find((skill) => skill.id === skillPackage.id);
        const nextSkill = buildSkillDefinitionFromPackage(skillPackage);

        return existingSkill ? { ...nextSkill, enabled: existingSkill.enabled } : nextSkill;
      });

      if (JSON.stringify(nextInstalledSkills) === JSON.stringify(current.skills)) {
        return current;
      }

      return {
        ...current,
        skills: nextInstalledSkills,
      };
    });
  }, [installedSkillPackages, installedSkillsLoaded, updateSettings]);

  const installedSkillIds = installedSkillPackages.map((skillPackage) => skillPackage.id);

  return (
    <WorkbenchDialogPanel
      bodyClassName="overflow-y-auto"
      footer={
        <>
          <Button className="min-w-24" type="button" variant="outline" onClick={resetAndClose}>
            {t('common.cancel')}
          </Button>
          <Button
            className="min-w-24"
            disabled={!isDirty || isSaving}
            type="button"
            onClick={() => void save()}
          >
            {isSaving ? <Spinner data-icon="inline-start" /> : null}
            {showSaved ? t('models_page.actions.saved') : t('common.save')}
          </Button>
        </>
      }
    >
      <div className="text-foreground mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <section className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium">{t('skills_page.enabled_label')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('skills_page.enabled_description')}
              </p>
            </div>
            <Switch
              checked={localSettings.enabled}
              className="data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
              onCheckedChange={(checked) => {
                updateSettings((current) => ({
                  ...current,
                  enabled: checked,
                }));
              }}
            />
          </div>
        </section>

        <SkillList
          clearDeleteTarget={() => setDeleteTargetId(null)}
          deleteTargetId={deleteTargetId}
          installedSkillIds={installedSkillIds}
          skills={localSettings.skills}
          onAddSkill={() => setIsSearchDialogOpen(true)}
          onConfirmDelete={async () => {
            if (!deleteTargetId) {
              return;
            }

            await removeInstalledSkillPackage(deleteTargetId);
            const success = await deleteSkill(deleteTargetId);

            if (success) {
              setDeleteTargetId(null);
            }
          }}
          onDeleteSkill={(skillId) => setDeleteTargetId(skillId)}
          onToggleSkillEnabled={(skillId, enabled) => {
            updateSettings((current) => ({
              ...current,
              skills: current.skills.map((skill) =>
                skill.id === skillId ? { ...skill, enabled } : skill
              ),
            }));
          }}
          onViewSkill={(skillId) => {
            const installedSkillPackage =
              installedSkillPackages.find((skillPackage) => skillPackage.id === skillId) ?? null;

            if (!installedSkillPackage) {
              return;
            }

            setSelectedSkillTarget({
              kind: 'installed',
              skillPackage: installedSkillPackage,
            });
          }}
        />
      </div>

      <SkillSearchDialog
        installedSkillIds={installedSkillIds}
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
        onSelectSkill={(skill) => {
          setSelectedSkillTarget({
            kind: 'catalog',
            skill,
          });
          setIsSearchDialogOpen(false);
        }}
      />

      <SkillInstallDialog
        isInstalled={
          selectedSkillTarget?.kind === 'installed'
            ? true
            : selectedSkillTarget
              ? installedSkillIds.includes(selectedSkillTarget.skill.id)
              : false
        }
        open={selectedSkillTarget != null}
        target={selectedSkillTarget}
        onInstall={async (skill) => {
          try {
            const installedPackage = toInstalledSkillPackage(skill);
            const existingSkill = localSettings.skills.find((item) => item.id === skill.id);
            const nextSkill = existingSkill
              ? {
                  ...buildSkillDefinitionFromPackage(installedPackage),
                  enabled: existingSkill.enabled,
                }
              : buildSkillDefinitionFromPackage(installedPackage);

            await upsertInstalledSkillPackage(installedPackage);
            await saveSkill(nextSkill);
            toast.success(
              existingSkill
                ? t('skills_page.toast.reinstall_success')
                : t('skills_page.toast.install_success')
            );
            return true;
          } catch {
            toast.error(t('skills_page.toast.install_failed'));
            return false;
          }
        }}
        onRequestDeleteInstalledSkill={(skillId) => {
          setSelectedSkillTarget(null);
          setDeleteTargetId(skillId);
        }}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSkillTarget(null);
          }
        }}
      />
    </WorkbenchDialogPanel>
  );
}
