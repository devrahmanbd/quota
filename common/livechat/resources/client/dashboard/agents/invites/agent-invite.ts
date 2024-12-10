import {Role} from '@common/auth/role';
import {Group} from '@common/help-desk/groups/group';

export interface AgentInvite {
  id: number;
  email: string;
  role_id: number;
  role?: Role;
  group_id: number;
  group?: Group;
  created_at: string;
  updated_at: string;
}
