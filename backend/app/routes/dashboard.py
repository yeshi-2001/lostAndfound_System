from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.lost_item import LostItem
from app.models.found_item import FoundItem
from app.models.match import Match
from datetime import datetime, timedelta
from sqlalchemy import and_

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/welcome-info', methods=['GET'])
@jwt_required()
def get_welcome_info():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Calculate days since last visit
    current_time = datetime.utcnow()
    
    # Use actual last_login or set to current time for first-time users
    if not user.last_login:
        last_login = current_time
    else:
        last_login = user.last_login
    
    time_diff = current_time - last_login
    days_since_visit = time_diff.days
    hours_since_visit = time_diff.total_seconds() / 3600
    
    # Get changes since last visit
    changes = get_changes_since_last_visit(user_id, last_login)
    
    # Generate welcome message based on time away
    if hours_since_visit < 1:
        welcome_message = "Welcome back!"
    elif hours_since_visit < 24:
        hours = int(hours_since_visit)
        welcome_message = f"Welcome back! It's been {hours} hour{'s' if hours != 1 else ''} since your last visit"
    elif days_since_visit == 1:
        welcome_message = "Welcome back! It's been 1 day since your last visit"
    elif days_since_visit < 7:
        welcome_message = f"Welcome back! It's been {days_since_visit} days since your last visit"
    elif days_since_visit < 30:
        weeks = days_since_visit // 7
        welcome_message = f"Welcome back! It's been {weeks} week{'s' if weeks > 1 else ''} since your last visit"
    else:
        months = days_since_visit // 30
        welcome_message = f"Welcome back! It's been {months} month{'s' if months > 1 else ''} since your last visit"
    
    # Generate activity summary
    total_changes = sum(changes.values())
    if total_changes == 0:
        activity_message = "Everything is just as you left it ✨"
        change_details = []
    else:
        activity_message = "Here's what changed while you were away..."
        change_details = []
        if changes['new_matches'] > 0:
            change_details.append(f"{changes['new_matches']} new match{'es' if changes['new_matches'] > 1 else ''}")
        if changes['pending_verifications'] > 0:
            change_details.append(f"{changes['pending_verifications']} verification{'s' if changes['pending_verifications'] > 1 else ''} waiting")
        if changes['completed_matches'] > 0:
            change_details.append(f"{changes['completed_matches']} item{'s' if changes['completed_matches'] > 1 else ''} returned")
    
    return jsonify({
        'welcome_message': welcome_message,
        'activity_message': activity_message,
        'change_details': change_details,
        'changes': changes,
        'days_since_visit': days_since_visit,
        'hours_since_visit': hours_since_visit,
        'last_login': last_login.isoformat() if last_login else None
    }), 200

def get_changes_since_last_visit(user_id, last_login):
    """Get counts of changes since user's last visit"""
    
    # New matches for user's lost items
    new_matches = Match.query.join(LostItem).filter(
        and_(
            LostItem.user_id == user_id,
            Match.created_at > last_login,
            Match.status == 'pending'
        )
    ).count()
    
    # Pending verifications (matches waiting for user response)
    pending_verifications = Match.query.join(LostItem).filter(
        and_(
            LostItem.user_id == user_id,
            Match.status == 'pending',
            Match.questions_generated == True
        )
    ).count()
    
    # Completed matches (items successfully returned)
    completed_matches = Match.query.join(LostItem).filter(
        and_(
            LostItem.user_id == user_id,
            Match.updated_at > last_login,
            Match.status == 'verified'
        )
    ).count()
    
    return {
        'new_matches': new_matches,
        'pending_verifications': pending_verifications,
        'completed_matches': completed_matches
    }

