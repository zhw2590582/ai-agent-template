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
  includeFiles: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
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

const ALLOWED_SKILL_TEXT_EXTENSIONS = new Set([
  'astro',
  'bash',
  'c',
  'cc',
  'cfg',
  'conf',
  'cpp',
  'cs',
  'css',
  'csv',
  'cts',
  'cxx',
  'env',
  'fish',
  'go',
  'h',
  'hh',
  'hpp',
  'html',
  'ini',
  'java',
  'js',
  'json',
  'jsx',
  'kt',
  'kts',
  'less',
  'lua',
  'md',
  'mdx',
  'mjs',
  'mts',
  'php',
  'py',
  'rb',
  'rs',
  'sass',
  'scala',
  'scss',
  'sh',
  'sql',
  'svelte',
  'swift',
  'toml',
  'ts',
  'tsx',
  'txt',
  'vue',
  'xml',
  'yaml',
  'yml',
  'zsh',
]);

const ALLOWED_SKILL_TEXT_BASENAMES = new Set(['dockerfile', 'makefile', 'readme', 'skill']);

export function isAllowedSkillTextFile(path: string) {
  const normalizedPath = path.trim().toLowerCase();

  if (!normalizedPath) {
    return false;
  }

  const fileName = normalizedPath.split('/').at(-1) ?? normalizedPath;

  if (fileName === '.env' || fileName.startsWith('.env.')) {
    return true;
  }

  const nameWithoutLeadingDots = fileName.replace(/^\.+/, '');
  const extension = nameWithoutLeadingDots.includes('.')
    ? (nameWithoutLeadingDots.split('.').at(-1) ?? '')
    : '';
  const basename = extension ? nameWithoutLeadingDots.slice(0, -(extension.length + 1)) : fileName;

  if (ALLOWED_SKILL_TEXT_EXTENSIONS.has(extension)) {
    return true;
  }

  return ALLOWED_SKILL_TEXT_BASENAMES.has(basename);
}

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

      if (!isAllowedSkillTextFile(entry.path)) {
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
      includeFiles: url.searchParams.get('includeFiles') ?? 'false',
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

    const resolvedSkill = parseResolvedSkillCatalogItem({
      files: query.includeFiles
        ? await fetchSkillFilesRecursively(query.source, resolved.skillPath)
        : undefined,
      item: query,
      markdown: resolved.markdown,
      resolvedSkillPath: resolved.skillPath,
    });

    if (query.includeFiles && !resolvedSkill.files.some((file) => file.path === 'SKILL.md')) {
      throw new AppError(
        ErrorCode.API_NETWORK,
        'Installed skill directory is missing SKILL.md.',
        502
      );
    }

    return Response.json({
      skill: resolvedSkill,
    });
  } catch (error) {
    return handleErrorWithLocale(error, DEFAULT_LOCALE);
  }
}
