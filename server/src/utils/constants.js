const CATEGORIES = [
  'documents',
  'electronics',
  'keys',
  'large_items',
  'other',
];

const LOST_STATUSES = ['active', 'resolved', 'expired'];
const FOUND_STATUSES = ['active', 'returned', 'expired'];
const USER_ROLES = ['user', 'admin'];
const MATCH_STATUSES = ['pending', 'accepted', 'rejected'];
const NOTIFICATION_TYPES = ['match_found', 'new_message', 'report_resolved', 'admin_alert'];

module.exports = {
  CATEGORIES,
  LOST_STATUSES,
  FOUND_STATUSES,
  USER_ROLES,
  MATCH_STATUSES,
  NOTIFICATION_TYPES,
};
