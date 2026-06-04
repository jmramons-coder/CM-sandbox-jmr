import type { CSSProperties } from 'react';
import type { TaskCompletionAttribution } from '../../utils/taskCompletionAttribution';
import { CircularAiAvatar } from '../ModuleCellHelpers';
import { InitialsAvatar } from '../ds';
import { cn } from '../ui/utils';

function contributorTitle(attribution: TaskCompletionAttribution): string {
  return `${attribution.verb} by ${attribution.label}`;
}

export function TaskCompletionContributorAvatar({
  attribution,
  className,
  style,
}: {
  attribution: TaskCompletionAttribution;
  className?: string;
  style?: CSSProperties;
}) {
  const title = contributorTitle(attribution);

  if (attribution.actor === 'ai') {
    return <CircularAiAvatar size="md" className={className} title={title} style={style} />;
  }

  if (attribution.actor === 'system') {
    return (
      <InitialsAvatar
        name="System"
        initials="SY"
        size="xs"
        className={cn('ring-2 ring-white', className)}
        style={style}
        aria-label={title}
      />
    );
  }

  return (
    <InitialsAvatar
      name={attribution.label}
      size="xs"
      className={cn('ring-2 ring-white', className)}
      style={style}
      aria-label={title}
    />
  );
}

/** Overlapping contributor avatars (single completion actor today; stack-ready). */
export function TaskCompletionContributorStack({
  attributions,
  className,
}: {
  attributions: TaskCompletionAttribution[];
  className?: string;
}) {
  if (!attributions.length) return null;

  return (
    <div
      className={cn('flex shrink-0 items-center', className)}
      role="group"
      aria-label={attributions.map(contributorTitle).join(', ')}
    >
      {attributions.map((attribution, index) => (
        <TaskCompletionContributorAvatar
          key={`${attribution.actor}-${attribution.label}-${index}`}
          attribution={attribution}
          className={index > 0 ? '-ml-2 ring-2 ring-white' : 'ring-2 ring-white'}
          style={{ zIndex: attributions.length - index }}
        />
      ))}
    </div>
  );
}
