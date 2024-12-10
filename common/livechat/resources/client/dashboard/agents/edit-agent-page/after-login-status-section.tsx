import {useFormContext} from 'react-hook-form';
import {UpdateAgentPayload} from '@livechat/dashboard/agents/edit-agent-page/use-update-agent';
import {Trans} from '@ui/i18n/trans';
import {FormRadioGroup} from '@ui/forms/radio-group/radio-group';
import {FormRadio} from '@ui/forms/radio-group/radio';
import React, {Fragment, ReactElement} from 'react';
import {CrupdateResourceSection} from '@common/admin/crupdate-resource-layout';
import {FormCheckbox} from '@ui/forms/toggle/checkbox';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {IconButton} from '@ui/buttons/icon-button';
import {DeleteIcon} from '@ui/icons/material/Delete';

export function AfterLoginStatusSection() {
  const {watch} = useFormContext<UpdateAgentPayload>();
  const isOfficeHours =
    watch('agent_settings.accepts_chats') === 'workingHours';
  return (
    <CrupdateResourceSection label={<Trans message="Status after login" />}>
      <FormRadioGroup
        name="agent_settings.accepts_chats"
        orientation="vertical"
        size="sm"
      >
        <FormRadio value="yes">
          <Trans message="Accept chats" />
        </FormRadio>
        <FormRadio value="no">
          <Trans message="Don't accept chats" />
        </FormRadio>
        <FormRadio value="workingHours">
          <Trans message="Based on working hours" />
        </FormRadio>
      </FormRadioGroup>
      {isOfficeHours && <OfficeHoursForm />}
    </CrupdateResourceSection>
  );
}

function OfficeHoursForm() {
  return (
    <div className="mt-14 space-y-10">
      <OfficeHourRow index={0} label={<Trans message="Monday" />} />
      <OfficeHourRow index={1} label={<Trans message="Tuesday" />} />
      <OfficeHourRow index={2} label={<Trans message="Wendesday" />} />
      <OfficeHourRow index={3} label={<Trans message="Thursday" />} />
      <OfficeHourRow index={4} label={<Trans message="Friday" />} />
      <OfficeHourRow index={5} label={<Trans message="Saturday" />} />
      <OfficeHourRow index={6} label={<Trans message="Sunday" />} />
    </div>
  );
}

interface OfficeHourRowProps {
  index: number;
  label: ReactElement;
}
function OfficeHourRow({index, label}: OfficeHourRowProps) {
  const {watch, setValue} = useFormContext<UpdateAgentPayload>();
  const isEnabled = watch(`agent_settings.working_hours.${index}.enable`);
  return (
    <div
      className="flex h-50 cursor-pointer items-center rounded-panel border px-16"
      onClick={() => {
        if (!isEnabled) {
          setValue(`agent_settings.working_hours.${index}.enable`, true);
        }
      }}
    >
      <FormCheckbox name={`agent_settings.working_hours.${index}.enable`} />
      <div className="ml-8 mr-auto text-sm">{label}</div>
      {isEnabled ? (
        <Fragment>
          <FormTextField
            name={`agent_settings.working_hours.${index}.from`}
            type="time"
            size="xs"
          />
          <div className="mx-12">
            <Trans message="to" />
          </div>
          <FormTextField
            name={`agent_settings.working_hours.${index}.to`}
            type="time"
            size="xs"
          />
          <IconButton
            className="ml-12 text-muted"
            size="xs"
            iconSize="sm"
            onClick={() => {
              setValue(`agent_settings.working_hours.${index}.enable`, false);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Fragment>
      ) : (
        <div className="text-sm text-muted">
          <Trans message="No schedule" />
        </div>
      )}
    </div>
  );
}
