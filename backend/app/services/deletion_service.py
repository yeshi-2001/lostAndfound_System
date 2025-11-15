from datetime import datetime, timedelta
from sqlalchemy import and_
from app.models.found_item import FoundItem
from app.models.lost_item import LostItem
from app.models.match import Match
from app.models.user import User
from app import db

class DeletionService:
    
    @staticmethod
    def soft_delete_item(item_id, item_type, user_id, reason="User requested"):
        """Soft delete an item (mark as deleted but keep in database)"""
        try:
            if item_type == 'found':
                item = FoundItem.query.get(item_id)
            else:
                item = LostItem.query.get(item_id)
            
            if not item:
                return False, "Item not found"
            
            if item.user_id != user_id:
                return False, "Unauthorized"
            
            # Check if item has active matches
            active_matches = Match.query.filter(
                and_(
                    Match.found_item_id == item_id if item_type == 'found' else Match.lost_item_id == item_id,
                    Match.status.in_(['pending_verification', 'verified'])
                )
            ).count()
            
            if active_matches > 0:
                return False, "Cannot delete item with active matches"
            
            # Soft delete
            item.deleted_at = datetime.utcnow()
            item.deleted_by = user_id
            item.deletion_reason = reason
            
            db.session.commit()
            return True, "Item deleted successfully"
            
        except Exception as e:
            db.session.rollback()
            return False, str(e)
    
    @staticmethod
    def restore_item(item_id, item_type, user_id):
        """Restore a soft-deleted item"""
        try:
            if item_type == 'found':
                item = FoundItem.query.get(item_id)
            else:
                item = LostItem.query.get(item_id)
            
            if not item or not item.deleted_at:
                return False, "Item not found or not deleted"
            
            if item.deleted_by != user_id:
                return False, "Unauthorized"
            
            # Check if within restore period (30 days)
            if datetime.utcnow() - item.deleted_at > timedelta(days=30):
                return False, "Restore period expired"
            
            # Restore item
            item.deleted_at = None
            item.deleted_by = None
            item.deletion_reason = None
            
            db.session.commit()
            return True, "Item restored successfully"
            
        except Exception as e:
            db.session.rollback()
            return False, str(e)
    
    @staticmethod
    def auto_cleanup_old_items():
        """Auto-delete old unmatched items (90+ days)"""
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        
        try:
            # Find old unmatched items
            old_found_items = FoundItem.query.filter(
                and_(
                    FoundItem.created_at < cutoff_date,
                    FoundItem.deleted_at.is_(None),
                    ~FoundItem.id.in_(
                        db.session.query(Match.found_item_id).filter(
                            Match.status.in_(['pending_verification', 'verified'])
                        )
                    )
                )
            ).all()
            
            old_lost_items = LostItem.query.filter(
                and_(
                    LostItem.created_at < cutoff_date,
                    LostItem.deleted_at.is_(None),
                    ~LostItem.id.in_(
                        db.session.query(Match.lost_item_id).filter(
                            Match.status.in_(['pending_verification', 'verified'])
                        )
                    )
                )
            ).all()
            
            # Soft delete old items
            for item in old_found_items + old_lost_items:
                item.deleted_at = datetime.utcnow()
                item.deletion_reason = "Auto-deleted after 90 days"
                item.auto_deleted = True
            
            db.session.commit()
            return len(old_found_items) + len(old_lost_items)
            
        except Exception as e:
            db.session.rollback()
            raise e
    
    @staticmethod
    def hard_delete_old_items():
        """Permanently delete items that were soft-deleted 90+ days ago"""
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        
        try:
            # Find items to hard delete
            items_to_delete = FoundItem.query.filter(
                and_(
                    FoundItem.deleted_at < cutoff_date,
                    FoundItem.deleted_at.isnot(None)
                )
            ).all()
            
            lost_items_to_delete = LostItem.query.filter(
                and_(
                    LostItem.deleted_at < cutoff_date,
                    LostItem.deleted_at.isnot(None)
                )
            ).all()
            
            # Hard delete
            for item in items_to_delete:
                db.session.delete(item)
            
            for item in lost_items_to_delete:
                db.session.delete(item)
            
            db.session.commit()
            return len(items_to_delete) + len(lost_items_to_delete)
            
        except Exception as e:
            db.session.rollback()
            raise e
    
    @staticmethod
    def get_user_items_for_cleanup(user_id):
        """Get user's items that can be cleaned up"""
        try:
            # Resolved items (older than 30 days)
            resolved_cutoff = datetime.utcnow() - timedelta(days=30)
            
            resolved_matches = Match.query.filter(
                and_(
                    Match.status.in_(['returned_to_owner', 'returned_by_finder']),
                    Match.created_at < resolved_cutoff
                )
            ).all()
            
            # Old unmatched items (older than 60 days)
            old_cutoff = datetime.utcnow() - timedelta(days=60)
            
            old_found_items = FoundItem.query.filter(
                and_(
                    FoundItem.user_id == user_id,
                    FoundItem.created_at < old_cutoff,
                    FoundItem.deleted_at.is_(None),
                    ~FoundItem.id.in_(
                        db.session.query(Match.found_item_id).filter(
                            Match.status.in_(['pending_verification', 'verified'])
                        )
                    )
                )
            ).all()
            
            old_lost_items = LostItem.query.filter(
                and_(
                    LostItem.user_id == user_id,
                    LostItem.created_at < old_cutoff,
                    LostItem.deleted_at.is_(None),
                    ~LostItem.id.in_(
                        db.session.query(Match.lost_item_id).filter(
                            Match.status.in_(['pending_verification', 'verified'])
                        )
                    )
                )
            ).all()
            
            return {
                'resolved_matches': resolved_matches,
                'old_found_items': old_found_items,
                'old_lost_items': old_lost_items
            }
            
        except Exception as e:
            raise e