import {DetailsSidebarSectionHeader} from '@app/drive/details-sidebar/details-sidebar-section-header';
import {Trans} from '@ui/i18n/trans';
import {DriveEntry} from '@app/drive/files/drive-entry';
import {
  ChipField,
  ChipValue,
} from '@ui/forms/input-field/chip-field/chip-field';
import React, {useState} from 'react';
import {Item} from '@ui/forms/listbox/item';
import {useTrans} from '@ui/i18n/use-trans';
import {message} from '@ui/i18n/message';
import {useSyncEntryTags} from '@app/drive/details-sidebar/requests/use-sync-entry-tags';
import {useFileEntryTags} from '@app/drive/details-sidebar/requests/use-file-entry-tags';
import {useNavigate} from '@common/ui/navigation/use-navigate';

interface Props {
  entry: DriveEntry;
}
export function DetailsSidebarTags({entry}: Props) {
  // use key={entry.id} to force re-render tag chip field when entry changes
  return (
    <div className="mt-20 border-t pt-20">
      <DetailsSidebarSectionHeader margin="mb-10">
        <Trans message="Tags" />
      </DetailsSidebarSectionHeader>
      <TagChipField entry={entry} key={entry.id} />
    </div>
  );
}

function TagChipField({entry}: Props) {
  const {trans} = useTrans();
  const navigate = useNavigate();
  const syncTags = useSyncEntryTags();
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState<ChipValue[]>(() => {
    return (entry.tags || []).filter(tag => tag.type !== 'label');
  });
  const {data, isLoading} = useFileEntryTags(inputValue);

  const handleChange = (newTags: ChipValue[]) => {
    setValue(newTags);
    if (!syncTags.isPending) {
      syncTags.mutate({tags: newTags, entry});
    }
  };

  return (
    <ChipField
      isAsync
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      suggestions={data?.results}
      placeholder={trans(message('+Add tag'))}
      isLoading={isLoading}
      chipSize="sm"
      value={value}
      onChange={handleChange}
      onChipClick={chip => {
        navigate(`/drive/search?query=${chip.name}`);
      }}
    >
      {data?.results?.map(result => (
        <Item value={result} key={result.id}>
          {result.name}
        </Item>
      ))}
    </ChipField>
  );
}
