import React, {Fragment, ReactNode} from 'react';
import {useFormContext} from 'react-hook-form';
import {Button} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import {Item} from '@ui/forms/listbox/item';
import {useTrans} from '@ui/i18n/use-trans';
import {FormChipField} from '@ui/forms/input-field/chip-field/form-chip-field';
import {useTags} from '@common/tags/use-tags';
import {
  FileUploadProvider
} from '@common/uploads/uploader/file-upload-provider';
import {VisibleToField} from '@hc/visible-to-field';
import {ManagedByField} from '@hc/managed-by-field';
import {
  ArticleAuthorField
} from '@hc/articles/article-editor/article-author-field';
import {UpdateArticlePayload} from '@hc/articles/requests/use-update-article';
import {
  ArticleSectionSelector
} from '@hc/articles/article-editor/article-section-selector';
import {
  ArticleAttachmentsEditor
} from '@hc/articles/article-editor/article-attachments-editor';

interface Props {
  children?: ReactNode;
  onSave: () => void;
  isSaving: boolean;
}
export function ArticleEditorAside({children, onSave, isSaving}: Props) {
  const form = useFormContext<UpdateArticlePayload>();
  return (
    <Fragment>
      <Button
        variant="flat"
        color="primary"
        className="min-h-46 w-full"
        onClick={() => onSave()}
        disabled={isSaving}
      >
        <Trans message="Save" />
      </Button>
      <div className="mt-34">
        {children}
        <VisibleToField
          className="mb-24"
          description={
            <Trans message="Control who can see this article in help center" />
          }
        />
        <ArticleAuthorField />
        <ManagedByField
          className="mb-24"
          description={
            <Trans message="Control who can edit and publish this article" />
          }
        />
        <ArticleSectionSelector
          onSave={sections => {
            form.setValue('sections', sections);
          }}
        />
        <TagSelector />
        <FileUploadProvider>
          <ArticleAttachmentsEditor />
        </FileUploadProvider>
      </div>
    </Fragment>
  );
}

function TagSelector() {
  const {data} = useTags({type: 'custom', perPage: 10});
  const tags = data?.pagination.data || [];
  const {trans} = useTrans();

  if (!tags.length) return null;

  return (
    <FormChipField
      className="mt-24"
      placeholder={trans({message: 'Add tag...'})}
      background="bg"
      label={<Trans message="Tags" />}
      name="tags"
      chipSize="sm"
      suggestions={tags}
      description={
        <Trans message="Add content tags to help users find articles easier" />
      }
    >
      {tag => (
        <Item value={tag.id} key={tag.id} capitalizeFirst>
          <Trans message={tag.display_name || tag.name} />
        </Item>
      )}
    </FormChipField>
  );
}