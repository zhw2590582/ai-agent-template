import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { API_NAMESPACES } from '@/config/namespaces';
import { DEFAULT_LOCALE } from '@/config/i18n';
import { AppError, ErrorCode, handleErrorWithLocale } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import {
  buildSkillRawMarkdownUrl,
  parseResolvedSkillCatalogItem,
  resolveSkillPathFromDirectoryNames,
} from '@/features/skills/catalog';
import type { InstalledSkillFile } from '@/features/skills/types';

const resolveSkillQuerySchema = z.object({
  id: z.string().min(1),
  installs: z.coerce.number().int().nonnegative().default(0),
  name: z.string().min(1),
  skillId: z.string().min(1),
  source: z.string().min(1),
});

const githubSkillDirectorySchema = z.array(
  z.object({
    download_url: z.string().nullable().optional(),
    name: z.string(),
    path: z.string().optional(),
    type: z.string(),
  })
);

async function fetchSkillMarkdown(source: string, skillPath: string) {
  const rawSkillUrl = buildSkillRawMarkdownUrl(source, skillPath);
  const response = await fetch(rawSkillUrl, {
    headers: {
      Accept: 'text/plain',
    },
  });

  if (!response.ok) {
    return {
      markdown: null,
      response,
      skillPath,
    };
  }

  return {
    markdown: await response.text(),
    response,
    skillPath,
  };
}

async function fetchGitHubDirectoryEntries(source: string, path: string) {
  const response = await fetch(`https://api.github.com/repos/${source}/contents/${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new AppError(
      ErrorCode.API_NETWORK,
      `Failed to read skill directory from GitHub (${response.status}).`,
      502
    );
  }

  return githubSkillDirectorySchema.parse(await response.json());
}

async function fetchTextFile(downloadUrl: string) {
  const response = await fetch(downloadUrl, {
    headers: {
      Accept: 'text/plain',
    },
  });

  if (!response.ok) {
    throw new AppError(
      ErrorCode.API_NETWORK,
      `Failed to download a skill file from GitHub (${response.status}).`,
      502
    );
  }

  return await response.text();
}

async function fetchSkillFilesRecursively(source: string, skillPath: string) {
  const rootPath = `skills/${skillPath}`;
  const files: InstalledSkillFile[] = [];

  const walk = async (path: string) => {
    const entries = await fetchGitHubDirectoryEntries(source, path);

    for (const entry of entries) {
      if (entry.type === 'dir' && entry.path) {
        await walk(entry.path);
        continue;
      }

      if (entry.type !== 'file' || !entry.download_url || !entry.path) {
        continue;
      }

      files.push({
        content: await fetchTextFile(entry.download_url),
        path: entry.path.replace(`${rootPath}/`, ''),
      });
    }
  };

  await walk(rootPath);

  files.sort((left, right) => left.path.localeCompare(right.path));
  return files;
}

export async function handleSkillResolveGet(request: Request) {
  try {
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.SKILLS_RESOLVE,
      namespace: API_NAMESPACES.SKILLS_RESOLVE,
    });

    const url = new URL(request.url);
    const query = resolveSkillQuerySchema.parse({
      id: url.searchParams.get('id'),
      installs: url.searchParams.get('installs') ?? '0',
      name: url.searchParams.get('name'),
      skillId: url.searchParams.get('skillId'),
      source: url.searchParams.get('source'),
    });

    let resolved = await fetchSkillMarkdown(query.source, query.skillId);

    if (!resolved.markdown && resolved.response.status === 404) {
      const directoryPayload = await fetchGitHubDirectoryEntries(query.source, 'skills');
      const candidatePath = resolveSkillPathFromDirectoryNames(
        query,
        directoryPayload.filter((entry) => entry.type === 'dir').map((entry) => entry.name)
      );

      if (candidatePath && candidatePath !== query.skillId) {
        resolved = await fetchSkillMarkdown(query.source, candidatePath);
      }
    }

    if (!resolved.markdown) {
      throw new AppError(
        ErrorCode.API_NETWORK,
        `Failed to fetch skill from GitHub (${resolved.response.status}).`,
        502
      );
    }

    const files = await fetchSkillFilesRecursively(query.source, resolved.skillPath);
    const skillMarkdownFile = files.find((file) => file.path === 'SKILL.md');

    if (!skillMarkdownFile) {
      throw new AppError(
        ErrorCode.API_NETWORK,
        'Installed skill directory is missing SKILL.md.',
        502
      );
    }

    const resolvedSkill = parseResolvedSkillCatalogItem({
      item: query,
      files,
      markdown: skillMarkdownFile.content,
      resolvedSkillPath: resolved.skillPath,
    });

    return Response.json({
      skill: resolvedSkill,
    });
  } catch (error) {
    return handleErrorWithLocale(error, DEFAULT_LOCALE);
  }
}
