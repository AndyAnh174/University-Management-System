"""
Audit logging mixin for ViewSets.

Logs create, update, delete actions with:
- User who performed the action
- Timestamp
- Object ID
- Changes made (for updates)
"""

import logging
from datetime import datetime

logger = logging.getLogger('audit')


class AuditLogMixin:
    """
    Mixin that adds audit logging to ViewSet actions.
    
    Usage:
        class MyViewSet(AuditLogMixin, viewsets.ModelViewSet):
            ...
    """
    
    def perform_create(self, serializer):
        """Log create action"""
        instance = serializer.save()
        self._log_action('CREATE', instance)
        return instance
    
    def perform_update(self, serializer):
        """Log update action with changes"""
        old_data = self._get_instance_data(serializer.instance)
        instance = serializer.save()
        new_data = self._get_instance_data(instance)
        changes = self._get_changes(old_data, new_data)
        self._log_action('UPDATE', instance, changes=changes)
        return instance
    
    def perform_destroy(self, instance):
        """Log delete action"""
        instance_str = str(instance)
        instance_id = instance.pk
        instance.delete()
        self._log_action('DELETE', None, extra={
            'deleted_id': instance_id,
            'deleted_str': instance_str
        })
    
    def _get_instance_data(self, instance):
        """Get serializable data from instance"""
        data = {}
        for field in instance._meta.fields:
            value = getattr(instance, field.name, None)
            if hasattr(value, 'pk'):
                data[field.name] = value.pk
            elif hasattr(value, 'isoformat'):
                data[field.name] = value.isoformat()
            else:
                data[field.name] = value
        return data
    
    def _get_changes(self, old_data, new_data):
        """Get dict of changed fields"""
        changes = {}
        for key in new_data:
            if key in ['updated_at']:  # Skip auto-updated fields
                continue
            if old_data.get(key) != new_data.get(key):
                changes[key] = {
                    'old': old_data.get(key),
                    'new': new_data.get(key)
                }
        return changes
    
    def _log_action(self, action, instance, changes=None, extra=None):
        """
        Log the action to stdout/logger.
        
        Format: [AUDIT] {timestamp} | {user} | {action} | {model} | {id} | {details}
        """
        user = self.request.user if hasattr(self, 'request') else None
        username = user.username if user and user.is_authenticated else 'anonymous'
        
        model_name = self.queryset.model.__name__ if hasattr(self, 'queryset') else 'Unknown'
        instance_id = instance.pk if instance else (extra or {}).get('deleted_id', 'N/A')
        
        timestamp = datetime.now().isoformat()
        
        log_data = {
            'timestamp': timestamp,
            'user': username,
            'action': action,
            'model': model_name,
            'object_id': instance_id,
        }
        
        if changes:
            log_data['changes'] = changes
        if extra:
            log_data.update(extra)
        
        # Log to stdout and logger
        log_message = (
            f"[AUDIT] {timestamp} | {username} | {action} | "
            f"{model_name} | ID:{instance_id}"
        )
        
        if changes:
            changed_fields = list(changes.keys())
            log_message += f" | Changed: {changed_fields}"
        
        print(log_message)  # stdout for dev
        logger.info(log_message, extra=log_data)  # structured log
