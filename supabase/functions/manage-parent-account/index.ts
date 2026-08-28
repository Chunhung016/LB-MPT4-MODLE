import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,31}$/;
const PARENT_EMAIL_DOMAIN = 'parents.littlebee.app';

type ManageParentRequest =
  | {
      action: 'create';
      username: string;
      password: string;
      parentName: string;
      childName: string;
      contactPhone?: string;
    }
  | {
      action: 'delete';
      userId: string;
    };

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (request, context) => {
    try {
      const staffUserId = context.userClaims?.id;
      if (!staffUserId) return Response.json({ error: 'Authentication required.' }, { status: 401 });

      const { data: staff, error: staffError } = await context.supabase
        .from('staff_users')
        .select('user_id')
        .eq('user_id', staffUserId)
        .eq('active', true)
        .maybeSingle();

      if (staffError || !staff) {
        return Response.json({ error: 'Active staff access is required.' }, { status: 403 });
      }

      const body = await request.json() as ManageParentRequest;

      if (body.action === 'create') {
        const username = cleanText(body.username, 32).toLowerCase();
        const password = typeof body.password === 'string' ? body.password : '';
        const parentName = cleanText(body.parentName, 80);
        const childName = cleanText(body.childName, 80);
        const contactPhone = cleanText(body.contactPhone, 30);

        if (!USERNAME_PATTERN.test(username)) {
          return Response.json({ error: 'Username format is invalid.' }, { status: 400 });
        }
        if (password.length < 8 || password.length > 72) {
          return Response.json({ error: 'Password must be 8–72 characters.' }, { status: 400 });
        }
        if (!parentName || !childName) {
          return Response.json({ error: 'Parent name and child name are required.' }, { status: 400 });
        }

        const { data, error } = await context.supabaseAdmin.auth.admin.createUser({
          email: `${username}@${PARENT_EMAIL_DOMAIN}`,
          password,
          email_confirm: true,
          user_metadata: {
            username,
            parent_name: parentName,
            child_name: childName,
            contact_phone: contactPhone,
          },
        });

        if (error) {
          const message = error.message.toLowerCase().includes('already')
            ? 'That username is already registered.'
            : error.message;
          return Response.json({ error: message }, { status: 400 });
        }

        return Response.json({ userId: data.user.id, username });
      }

      if (body.action === 'delete') {
        const userId = cleanText(body.userId, 64);
        const { data: targetProfile } = await context.supabaseAdmin
          .from('parent_profiles')
          .select('user_id, username')
          .eq('user_id', userId)
          .maybeSingle();

        if (!targetProfile) {
          return Response.json({ error: 'Parent account not found.' }, { status: 404 });
        }

        const { error } = await context.supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) return Response.json({ error: error.message }, { status: 400 });
        return Response.json({ deleted: true, username: targetProfile.username });
      }

      return Response.json({ error: 'Unsupported account action.' }, { status: 400 });
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : 'Unable to manage the parent account.' },
        { status: 500 },
      );
    }
  }),
};
