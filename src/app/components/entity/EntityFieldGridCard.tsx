import type { EntityFieldGridSection } from '../../domain/entityFolders';
import { EntityFieldList } from './EntityFieldList';
import { EntitySectionCard } from './EntitySectionCard';
import { EntityTimelinePanel } from './EntityTimelinePanel';

/**
 * Information card composed of a field grid (label/value pairs) plus an
 * optional right-side companion panel (timeline today, more variants later).
 */
export function EntityFieldGridCard({ section }: { section: EntityFieldGridSection }) {
  return (
    <EntitySectionCard title={section.title} actions={section.actions}>
      {section.rightPanel ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <EntityFieldList fields={section.fields} layout={section.layout} />
          </div>
          <div className="lg:w-[300px] lg:shrink-0 lg:border-l lg:border-border-soft lg:pl-6">
            {section.rightPanel.kind === 'timeline' ? (
              <EntityTimelinePanel
                items={section.rightPanel.items}
                icon={section.rightPanel.icon}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <EntityFieldList fields={section.fields} layout={section.layout} />
      )}
    </EntitySectionCard>
  );
}
